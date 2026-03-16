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
    'juanmartinezcarrillo@hotmail.com'
];

// FECHA DE AYER: 09 de Marzo de 2026
const targetDateStart = "2026-03-09T00:00:00Z";
const targetDateEnd = "2026-03-09T23:59:59Z";

async function getBlacklistedIds(): Promise<Set<string>> {
    const blacklisted = new Set<string>();
    for (const email of TEST_EMAILS) {
        try {
            const res = await phClient.get(`/persons/?search=${email}`);
            if (res.data?.results) {
                res.data.results.forEach((p: any) => {
                    if (p.distinct_ids) {
                        p.distinct_ids.forEach((id: string) => blacklisted.add(id));
                    }
                });
            }
        } catch (e) { }
    }
    return blacklisted;
}

async function getAllEvents(): Promise<any[]> {
    let all: any[] = [];
    let url = `/events?after=${targetDateStart}&before=${targetDateEnd}&limit=1000`;
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
    console.log("Generando informe de AYER (09 Marzo 2026) con depuración de eventos...");

    const blacklist = await getBlacklistedIds();
    const allEvents = await getAllEvents();

    const usersMap = new Map<string, any>();
    const allUniqueEvents = new Set<string>();

    const identify = (e: any) => {
        const email = e.properties?.contact?.email || e.properties?.email || e.person?.properties?.email;
        const name = e.properties?.contact?.name || e.person?.properties?.name;
        const company = e.properties?.contact?.company || e.person?.properties?.company;
        return { email, name, company };
    };

    allEvents.forEach(e => {
        const id = e.distinct_id;
        if (blacklist.has(id)) return;

        allUniqueEvents.add(e.event);

        const info = identify(e);
        if (info.email && TEST_EMAILS.includes(info.email.toLowerCase())) return;

        if (!usersMap.has(id)) {
            usersMap.set(id, {
                id,
                email: null,
                name: null,
                company: null,
                viewed_landing: false,
                clicked_start: false,
                started_survey: false,
                completed: false,
                booked: false,
                downloaded: false,
                steps: new Set<number>(),
                last_seen: e.timestamp,
                raw_events: []
            });
        }
        const u = usersMap.get(id);
        const name = e.event;
        u.raw_events.push(name);

        if (name === 'view_landing') u.viewed_landing = true;
        if (name === 'click_start_survey' || name === 'diagnostic_start') u.clicked_start = true;
        if (name === 'diagnostic_start' || name === 'start_survey') u.started_survey = true;
        if (name === 'complete_survey' || name === 'diagnostic_complete') u.completed = true;
        if (name === 'book_call_clicked' || name === 'book_call_complete' || name === 'book_call_click') u.booked = true;
        if (name === 'pdf_clicked' || name === 'report_download') u.downloaded = true;

        if (info.email) u.email = info.email;
        if (info.name) u.name = info.name;
        if (info.company) u.company = info.company;
    });

    let n_total = usersMap.size;
    let n_click = 0;
    let n_start = 0;
    let n_complete = 0;
    let n_booked = 0;
    let n_download = 0;

    const leads: any[] = [];

    usersMap.forEach(u => {
        if (u.clicked_start || u.started_survey) n_click++;
        if (u.started_survey) n_start++;
        if (u.completed) n_complete++;
        if (u.booked) n_booked++;
        if (u.downloaded) n_download++;

        if (u.email || u.completed || u.booked || u.started_survey) {
            leads.push(u);
        }
    });

    let report = `╔══════════════════════════════════════════════════════════════╗\n`;
    report += `║    📅 INFORME DE AYER (DEPURADO) - 09 MARZO 2026         ║\n`;
    report += `╚══════════════════════════════════════════════════════════════╝\n\n`;

    report += `  👤 Usuarios únicos (no test):   ${n_total}\n`;
    report += `  🖱️  Click en Iniciar:            ${n_click}\n`;
    report += `  📝 Empezaron cuestionario:      ${n_start}\n`;
    report += `  📋 Completaron diagnóstico:     ${n_complete}\n`;
    report += `  📅 Agendaron llamada:           ${n_booked}\n`;
    report += `  📄 Descargaron informe:         ${n_download}\n`;
    report += `  📨 Leads con contacto:          ${leads.length}\n\n`;

    report += `  🔍 EVENTOS DETECTADOS AYER (DEBUG):\n`;
    report += `  ${Array.from(allUniqueEvents).filter(ev => !ev.startsWith('$')).join(', ')}\n\n`;

    if (leads.length > 0) {
        report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        report += `  📧 DETALLE DE ACTIVIDAD\n`;
        report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        leads.forEach((l, i) => {
            report += `  Usuario #${i + 1} (${l.id.substring(0, 8)}...):\n`;
            report += `    📨 Email: ${l.email || '(No capturado)'}\n`;
            report += `    ✅ Acciones: ${l.viewed_landing ? 'Vista' : ''} ${l.clicked_start ? 'Click' : ''} ${l.started_survey ? 'Inicio' : ''} ${l.completed ? 'Fin' : ''} ${l.booked ? 'Agenda' : ''}\n`;
            report += `    📋 Eventos: ${[...new Set(l.raw_events)].filter((ev: any) => !ev.startsWith('$')).join(', ')}\n`;
            report += `\n`;
        });
    }

    console.log(report);
    fs.writeFileSync('informe_ayer_debug.txt', report, 'utf-8');
}

run();
