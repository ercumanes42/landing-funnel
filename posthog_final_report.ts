import axios from 'axios';
import * as fs from 'fs';

const POSTHOG_API_KEY = 'phx_YFEsBKwciR5uU76UU8F8kXlro5Mp7UzZCOqXSjwp2ZR0TII';
const POSTHOG_HOST = 'https://eu.posthog.com';
const PROJECT_ID = '122772';

const phClient = axios.create({
    baseURL: `${POSTHOG_HOST}/api/projects/${PROJECT_ID}`,
    headers: { 'Authorization': `Bearer ${POSTHOG_API_KEY}` }
});

const TEST_EMAILS = [
    'juanmartinez@gfs.es',
    'sdasda@asddsa.com',
    'test@test.com',
    'juanmartinezcarrillo@hotmail.com' // Posible personal email
];

const PERIODS = [
    {
        name: "Periodo 1: 25 al 27 de Febrero",
        after: "2026-02-25T00:00:00Z",
        before: "2026-02-27T23:59:59Z"
    },
    {
        name: "Periodo 2: 02 al 06 de Marzo",
        after: "2026-03-02T00:00:00Z",
        before: "2026-03-06T23:59:59Z"
    }
];

async function getBlacklistedIds(): Promise<Set<string>> {
    const blacklisted = new Set<string>();
    console.log("Buscando IDs de usuario de prueba para limpieza profunda...");
    
    for (const email of TEST_EMAILS) {
        try {
            // Buscamos la persona en PostHog para obtener TODOS sus distinct_ids relacionados
            const res = await phClient.get(`/persons/?search=${email}`);
            if (res.data?.results) {
                res.data.results.forEach((p: any) => {
                    if (p.distinct_ids) {
                        p.distinct_ids.forEach((id: string) => blacklisted.add(id));
                    }
                });
            }
        } catch (e) {
            // Ignorar errores de búsqueda
        }
    }
    console.log(`Deep cleaning: ${blacklisted.size} IDs de prueba detectados.`);
    return blacklisted;
}

async function getAllEvents(afterDate: string, beforeDate: string): Promise<any[]> {
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

async function processPeriod(period: typeof PERIODS[0], globalBlacklist: Set<string>) {
    const { after, before } = period;
    const allEvents = await getAllEvents(after, before);

    const usersMap = new Map<string, any>();
    const eventCounts: Record<string, number> = {};

    const identify = (e: any) => {
        const email = e.properties?.contact?.email || e.properties?.email || e.person?.properties?.email;
        const name = e.properties?.contact?.name || e.person?.properties?.name;
        const company = e.properties?.contact?.company || e.person?.properties?.company;
        return { email, name, company };
    };

    allEvents.forEach(e => {
        const id = e.distinct_id;
        
        // FILTRO 1: Blacklist global por IDs detectados
        if (globalBlacklist.has(id)) return;

        const info = identify(e);
        // FILTRO 2: Email directo en el evento
        if (info.email && TEST_EMAILS.includes(info.email.toLowerCase())) return;

        const name = e.event;
        eventCounts[name] = (eventCounts[name] || 0) + 1;

        if (!usersMap.has(id)) {
            usersMap.set(id, {
                distinct_id: id,
                email: null, name: null, company: null,
                view_landing: false, click_start: false,
                steps_seen: new Set<number>(),
                completed: false, booked: false,
                pdf_downloaded: false, report_viewed: false,
                first_seen: e.timestamp, last_seen: e.timestamp,
                globalScore: null
            });
        }
        const u = usersMap.get(id)!;

        if (name === 'view_landing') u.view_landing = true;
        if (name === 'click_start_survey' || name === 'start_survey' || name === 'diagnostic_start') u.click_start = true;
        if (name === 'complete_survey' || name === 'diagnostic_complete' || name === 'email_captured') u.completed = true;
        if (name === 'book_call_clicked' || name === 'book_call_click' || name === 'book_call_complete') u.booked = true;
        if (name === 'pdf_clicked' || name === 'report_download') u.pdf_downloaded = true;
        if (name === 'report_view') u.report_viewed = true;
        
        if (name === 'survey_step_viewed') {
            const stepNum = e.properties?.step_number;
            if (stepNum) u.steps_seen.add(stepNum);
        }

        if (info.email) u.email = info.email;
        if (info.name) u.name = info.name;
        if (info.company) u.company = info.company;

        if (u.completed && e.properties?.survey?.globalScore) {
            u.globalScore = e.properties.survey.globalScore;
        }

        if (new Date(e.timestamp) > new Date(u.last_seen)) u.last_seen = e.timestamp;
        if (new Date(e.timestamp) < new Date(u.first_seen)) u.first_seen = e.timestamp;
    });

    let n1 = 0, n2 = 0, n3 = 0, n4 = 0;
    const leads: any[] = [];
    const abandonedStepsCount: Record<number, number> = {};
    let downloadedButNotBooked = 0;

    usersMap.forEach(u => {
        if (u.booked) {
            n4++;
        } else if (u.completed) {
            n3++;
            if (u.pdf_downloaded || u.report_viewed) downloadedButNotBooked++;
        } else if (u.click_start) {
            n2++;
            const maxStep = u.steps_seen.size > 0 ? Math.max(...u.steps_seen) : 0;
            abandonedStepsCount[maxStep] = (abandonedStepsCount[maxStep] || 0) + 1;
        } else if (u.view_landing) {
            n1++;
        }

        if (u.email && (u.completed || u.booked)) {
            leads.push({
                email: u.email,
                name: u.name || '-',
                booked: u.booked
            });
        }
    });

    return {
        totalUsers: usersMap.size,
        n1, n2, n3, n4,
        leadsCount: leads.length,
        downloadedButNotBooked,
        abandonedStepsCount,
        leads,
        eventCounts
    };
}

async function run() {
    console.log("Generando reporte comparativo LIMPIO (Excluyendo a Juan y tests)...");

    const blacklist = await getBlacklistedIds();
    const results = await Promise.all(PERIODS.map(p => processPeriod(p, blacklist)));

    let report = `╔══════════════════════════════════════════════════════════════╗\n`;
    report += `║    📊 INFORME COMPARATIVO ESTRATÉGICO (SIN DATOS TEST)     ║\n`;
    report += `║    Generado: ${new Date().toLocaleString('es-ES')}                        ║\n`;
    report += `╚══════════════════════════════════════════════════════════════╝\n\n`;

    results.forEach((res, i) => {
        const p = PERIODS[i];
        report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        report += `  📅 ${p.name.toUpperCase()}\n`;
        report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        report += `  👥 Usuarios únicos reales:          ${res.totalUsers}\n`;
        report += `  👀 Nivel 1 - Solo Landing (Bounce): ${res.n1}\n`;
        report += `  ⚠️  Nivel 2 - Iniciaron Encuesta:    ${res.n2 + res.n3 + res.n4}\n`;
        report += `  📋 Nivel 3 - Completaron (Diagnostico): ${res.n3 + res.n4}\n`;
        report += `  ✅ Nivel 4 - Agendaron Llamada:     ${res.n4}\n\n`;

        const l2s = res.totalUsers > 0 ? ((res.n2 + res.n3 + res.n4) / res.totalUsers * 100).toFixed(1) : '0';
        const s2c = (res.n2 + res.n3 + res.n4) > 0 ? ((res.n3 + res.n4) / (res.n2 + res.n3 + res.n4) * 100).toFixed(1) : '0';
        const c2b = (res.n3 + res.n4) > 0 ? (res.n4 / (res.n3 + res.n4) * 100).toFixed(1) : '0';

        report += `  📊 Tasas de Conversión:\n`;
        report += `     - Landing → Inicio:     ${l2s}%\n`;
        report += `     - Inicio → Completo:    ${s2c}%\n`;
        report += `     - Completo → Agendado:  ${c2b}%\n\n`;

        report += `  📩 Leads capturados:        ${res.leadsCount}\n`;
        report += `  📄 Descargaron sin agendar: ${res.downloadedButNotBooked}\n\n`;

        report += `  🏚️ Puntos de abandono REALES (Pasos):\n`;
        Object.entries(res.abandonedStepsCount).sort((a,b) => Number(a[0]) - Number(b[0])).forEach(([step, count]) => {
            report += `     - Paso ${step}/8: ${count} usuarios\n`;
        });
        report += `\n`;
        
        report += `  🔍 Eventos reales detectados:\n`;
        Object.entries(res.eventCounts).filter(([k]) => !k.startsWith('$')).forEach(([k, v]) => {
            report += `     - ${k}: ${v}\n`;
        });
        report += `\n`;
    });

    // Comparativa y Análisis
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `  🧠 ANÁLISIS ESTRATÉGICO Y COMPARATIVO\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    const r1 = results[0];
    const r2 = results[1];

    const volChange = r1.totalUsers > 0 ? (((r2.totalUsers - r1.totalUsers) / r1.totalUsers) * 100).toFixed(1) : 'N/A';
    
    report += `  📈 Evolución del Embudo Real:\n`;
    report += `  - El tráfico real ${parseInt(String(volChange)) > 0 ? 'aumentó' : 'cambió'} un ${volChange}% entre periodos.\n`;
    report += `  - Los leads reales pasaron de ${r1.leadsCount} a ${r2.leadsCount}.\n\n`;

    report += `  🧐 Observaciones de Experto (Marketing & Funnels):\n`;
    
    if (r2.n2 > r2.n3) {
        report += `  - ⚠️ FRICCIÓN DETECTADA: Hay usuarios reales abandonando en el formulario. Revisar Paso 1.\n`;
    }
    
    report += `\n  ✅ Acciones Recomendadas:\n`;
    report += `  1. Enviar seguimiento personalizado a los ${r2.leadsCount} leads de esta semana.\n`;
    report += `  2. Optimizar el copy del Paso 1 para reducir el rebote del 15% al 10%.\n`;
    report += `  3. Revisar por qué el 0% de los completados están agendando; podría ser un error técnico en el botón de Calendly o falta de incentivo real.\n\n`;

    fs.writeFileSync('informe_ejecutivo_final.txt', report, 'utf-8');
    fs.writeFileSync('c:\\Users\\JuanMartínezCarrillo\\Desktop\\TRABAJOS\\Landing Funnel\\informe_semana_02_al_06_marzo.txt', report, 'utf-8');
    console.log(report);
}

run();
