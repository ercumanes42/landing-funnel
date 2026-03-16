import axios from 'axios';
import * as fs from 'fs';

const POSTHOG_API_KEY = 'phx_YFEsBKwciR5uU76UU8F8kXlro5Mp7UzZCOqXSjwp2ZR0TII';
const POSTHOG_HOST = 'https://eu.posthog.com';
const PROJECT_ID = '122772';

const phClient = axios.create({
    baseURL: `${POSTHOG_HOST}/api/projects/${PROJECT_ID}`,
    headers: { 'Authorization': `Bearer ${POSTHOG_API_KEY}` }
});

const afterDate = "2026-03-05T00:00:00Z";
const beforeDate = "2026-03-05T23:59:59Z";

async function fetchEvents(eventName: string): Promise<any[]> {
    try {
        let all: any[] = [];
        let url = `/events?event=${eventName}&after=${afterDate}&before=${beforeDate}&limit=500`;
        while (url) {
            const res = await phClient.get(url);
            if (res.data?.results) all = all.concat(res.data.results);
            if (res.data.next) {
                const nextUrl = new URL(res.data.next);
                url = nextUrl.pathname + nextUrl.search;
            } else url = "";
        }
        return all;
    } catch (e: any) {
        console.error(`Error ${eventName}:`, e.message);
        return [];
    }
}

async function getAllEvents(): Promise<any[]> {
    let all: any[] = [];
    let url = `/events?after=${afterDate}&before=${beforeDate}&limit=1000`;
    while (url) {
        try {
            const res = await phClient.get(url);
            if (res.data?.results) all = all.concat(res.data.results);
            if (res.data.next) {
                const nextUrl = new URL(res.data.next);
                url = nextUrl.pathname + nextUrl.search;
            } else url = "";
        } catch { break; }
    }
    return all;
}

async function run() {
    console.log("Extrayendo datos de PostHog para HOY (5 de Marzo 2026)...\n");

    // Fetch key funnel events
    const [views, starts, steps, completes, diagnostics, bookings, pdfClicks, emails, autoIds, reportViews] = await Promise.all([
        fetchEvents('view_landing'),
        fetchEvents('click_start_survey'),
        fetchEvents('survey_step_viewed'),
        fetchEvents('complete_survey'),
        fetchEvents('diagnostic_complete'),
        fetchEvents('book_call_clicked'),
        fetchEvents('pdf_clicked'),
        fetchEvents('email_captured'),
        fetchEvents('auto_identified_from_email'),
        fetchEvents('report_view')
    ]);

    // Get ALL events for global count
    const allEvents = await getAllEvents();

    // Build user journey map
    const usersMap = new Map<string, any>();

    const identify = (e: any) => {
        const email = e.properties?.contact?.email || e.properties?.email || e.person?.properties?.email;
        const name = e.properties?.contact?.name || e.person?.properties?.name;
        const company = e.properties?.contact?.company || e.person?.properties?.company;
        return { email, name, company };
    };

    const track = (events: any[], field: string) => {
        events.forEach(e => {
            const id = e.distinct_id;
            if (!usersMap.has(id)) {
                usersMap.set(id, {
                    distinct_id: id,
                    email: null, name: null, company: null,
                    view_landing: false, click_start: false,
                    steps_seen: new Set<number>(),
                    completed: false, booked: false,
                    pdf_downloaded: false, report_viewed: false,
                    auto_identified: false,
                    first_seen: e.timestamp, last_seen: e.timestamp,
                    referrer: null, browser: null, os: null, country: null,
                    globalScore: null
                });
            }
            const u = usersMap.get(id)!;
            (u as any)[field] = true;

            // Extract identity info
            const info = identify(e);
            if (info.email) u.email = info.email;
            if (info.name) u.name = info.name;
            if (info.company) u.company = info.company;

            // Extract meta
            if (e.properties?.$referrer) u.referrer = e.properties.$referrer;
            if (e.properties?.$browser) u.browser = e.properties.$browser;
            if (e.properties?.$os) u.os = e.properties.$os;
            if (e.properties?.$geoip_country_name) u.country = e.properties.$geoip_country_name;

            // Extract scores from complete events
            if (field === 'completed' && e.properties?.survey?.globalScore) {
                u.globalScore = e.properties.survey.globalScore;
            }

            if (new Date(e.timestamp) > new Date(u.last_seen)) u.last_seen = e.timestamp;
            if (new Date(e.timestamp) < new Date(u.first_seen)) u.first_seen = e.timestamp;
        });
    };

    track(views, 'view_landing');
    track(starts, 'click_start');
    track(completes, 'completed');
    track(diagnostics, 'completed');
    track(bookings, 'booked');
    track(pdfClicks, 'pdf_downloaded');
    track(reportViews, 'report_viewed');
    track(autoIds, 'auto_identified');
    track(emails, 'completed');

    // Track steps per user
    steps.forEach(e => {
        const id = e.distinct_id;
        if (usersMap.has(id)) {
            const stepNum = e.properties?.step_number;
            if (stepNum) usersMap.get(id)!.steps_seen.add(stepNum);
        }
    });

    // Classify users
    let n1 = 0, n2 = 0, n3 = 0, n4 = 0;
    const userDetails: any[] = [];
    const capturedLeads: any[] = [];

    usersMap.forEach(u => {
        let stage = "";
        if (u.booked) {
            stage = "✅ Nivel 4: Completó + Agendó llamada";
            n4++;
        } else if (u.completed) {
            stage = "📋 Nivel 3: Completó diagnóstico (sin agendar)";
            n3++;
        } else if (u.click_start) {
            const maxStep = u.steps_seen.size > 0 ? Math.max(...u.steps_seen) : 0;
            stage = `⚠️ Nivel 2: Inició encuesta (llegó al paso ${maxStep}/8) y abandonó`;
            n2++;
        } else if (u.view_landing) {
            stage = "👀 Nivel 1: Solo vio la landing y se fue";
            n1++;
        } else {
            stage = "🔍 Nivel 0: Detectado (evento técnico)";
        }

        const detail: any = {
            id: u.email || u.distinct_id.substring(0, 12) + '...',
            stage,
            hora: new Date(u.last_seen).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        };

        if (u.email) detail.email = u.email;
        if (u.company) detail.empresa = u.company;
        if (u.name) detail.nombre = u.name;
        if (u.globalScore) detail.puntuacion = `${u.globalScore}/100`;
        if (u.referrer && u.referrer !== '$direct') detail.origen = u.referrer;
        if (u.browser) detail.navegador = `${u.browser} (${u.os || '?'})`;

        userDetails.push(detail);

        if (u.email) {
            capturedLeads.push({
                email: u.email,
                nombre: u.name || '-',
                empresa: u.company || '-',
                puntuacion: u.globalScore || '-',
                agendo: u.booked ? 'SÍ' : 'NO'
            });
        }
    });

    // Sort by funnel level (highest first)
    userDetails.sort((a, b) => {
        const getLevel = (s: string) => s.includes('Nivel 4') ? 4 : s.includes('Nivel 3') ? 3 : s.includes('Nivel 2') ? 2 : s.includes('Nivel 1') ? 1 : 0;
        return getLevel(b.stage) - getLevel(a.stage);
    });

    // Event counts
    const eventCounts: Record<string, number> = {};
    allEvents.forEach(e => { eventCounts[e.event] = (eventCounts[e.event] || 0) + 1; });
    const customEvents = Object.entries(eventCounts).filter(([k]) => !k.startsWith('$')).sort((a, b) => b[1] - a[1]);
    const systemEvents = Object.entries(eventCounts).filter(([k]) => k.startsWith('$')).sort((a, b) => b[1] - a[1]);

    // Conversion rates
    const totalUsers = usersMap.size;
    const landingToStart = totalUsers > 0 ? ((n2 + n3 + n4) / Math.max(n1 + n2 + n3 + n4, 1) * 100).toFixed(1) : '0';
    const startToComplete = (n2 + n3 + n4) > 0 ? ((n3 + n4) / (n2 + n3 + n4) * 100).toFixed(1) : '0';
    const completeToBook = (n3 + n4) > 0 ? (n4 / (n3 + n4) * 100).toFixed(1) : '0';

    // Build report
    const lines: string[] = [
        `╔══════════════════════════════════════════════════════════════╗`,
        `║    📊 INFORME DIARIO - LANDING FUNNEL GFS CONSULTING       ║`,
        `║    📅 Fecha: 5 de Marzo de 2026                            ║`,
        `║    🕐 Generado: ${new Date().toLocaleTimeString('es-ES')}                              ║`,
        `╚══════════════════════════════════════════════════════════════╝`,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `  📈 EMBUDO DE CONVERSIÓN (FUNNEL)`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        ``,
        `  👥 Usuarios únicos detectados:  ${totalUsers}`,
        ``,
        `  👀 Nivel 1 - Vio landing (rebote):         ${n1} usuarios`,
        `  ⚠️  Nivel 2 - Inició encuesta (abandonó):   ${n2} usuarios`,
        `  📋 Nivel 3 - Completó (sin agendar):        ${n3} usuarios`,
        `  ✅ Nivel 4 - Completó + Agendó:             ${n4} usuarios`,
        ``,
        `  📊 Tasas de Conversión:`,
        `     Landing → Inicio encuesta:  ${landingToStart}%`,
        `     Inicio → Completado:        ${startToComplete}%`,
        `     Completado → Agenda:         ${completeToBook}%`,
        ``
    ];

    if (capturedLeads.length > 0) {
        lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        lines.push(`  📧 LEADS CAPTURADOS HOY (datos del formulario)`);
        lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        lines.push(``);
        capturedLeads.forEach((l, i) => {
            lines.push(`  Lead #${i + 1}:`);
            lines.push(`    📨 Email: ${l.email}`);
            lines.push(`    👤 Nombre: ${l.nombre}`);
            lines.push(`    🏢 Empresa: ${l.empresa}`);
            lines.push(`    📊 Puntuación: ${l.puntuacion}`);
            lines.push(`    📞 Agendó llamada: ${l.agendo}`);
            lines.push(``);
        });
    }

    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`  🔍 DETALLE POR USUARIO (dónde se quedó cada uno)`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(``);
    userDetails.forEach(u => {
        lines.push(`  🆔 ${u.id}`);
        lines.push(`     ${u.stage}`);
        lines.push(`     🕐 Última actividad: ${u.hora}`);
        if (u.email) lines.push(`     📨 Email: ${u.email}`);
        if (u.empresa) lines.push(`     🏢 Empresa: ${u.empresa}`);
        if (u.puntuacion) lines.push(`     📊 Score: ${u.puntuacion}`);
        if (u.origen) lines.push(`     🌐 Origen: ${u.origen}`);
        if (u.navegador) lines.push(`     💻 ${u.navegador}`);
        lines.push(``);
    });

    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`  📈 EVENTOS CUSTOM DEL DÍA`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(``);
    customEvents.forEach(([name, count]) => {
        lines.push(`  ${name.padEnd(40)} ${count} veces`);
    });

    lines.push(``);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`  ⚙️  EVENTOS DEL SISTEMA`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(``);
    systemEvents.forEach(([name, count]) => {
        lines.push(`  ${name.padEnd(40)} ${count} veces`);
    });

    lines.push(``);
    lines.push(`Total eventos procesados: ${allEvents.length}`);
    lines.push(`════════════════════════════════════════════════════════════════`);

    const output = lines.join('\n');
    console.log(output);

    const outputFile = 'c:\\Users\\JuanMartínezCarrillo\\Desktop\\TRABAJOS\\Landing Funnel\\informe_hoy_5mar.txt';
    fs.writeFileSync(outputFile, output, 'utf-8');
    console.log(`\n✅ Informe guardado en: ${outputFile}`);
}

run();
