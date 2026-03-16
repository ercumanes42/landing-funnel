import axios from 'axios';
import * as fs from 'fs';

const POSTHOG_API_KEY = 'phx_YFEsBKwciR5uU76UU8F8kXlro5Mp7UzZCOqXSjwp2ZR0TII';
const POSTHOG_HOST = 'https://eu.posthog.com';
const PROJECT_ID = '122772';

const phClient = axios.create({
    baseURL: `${POSTHOG_HOST}/api/projects/${PROJECT_ID}`,
    headers: { 'Authorization': `Bearer ${POSTHOG_API_KEY}` }
});

async function fetchDistinctEvents(eventName: string, afterDate: string, beforeDate: string): Promise<any[]> {
    try {
        const url = `/events?event=${eventName}&after=${afterDate}&before=${beforeDate}&limit=500`;
        const response = await phClient.get(url);

        if (!response.data || !response.data.results) {
            return [];
        }

        return response.data.results.map((e: any) => ({
            distinct_id: e.distinct_id,
            timestamp: e.timestamp,
            person: e.person?.properties?.email || e.person?.properties?.name || e.distinct_id
        }));
    } catch (error: any) {
        console.error(`Error fetching ${eventName}:`, error.message);
        return [];
    }
}

async function getProjectEvents(afterDate: string, beforeDate: string) {
    try {
        let allResults: any[] = [];
        let url = `/events?after=${afterDate}&before=${beforeDate}&limit=1000`;

        while (url) {
            const response = await phClient.get(url);
            if (response.data && response.data.results) {
                allResults = allResults.concat(response.data.results);
            }
            if (response.data.next) {
                const nextUrl = new URL(response.data.next);
                url = nextUrl.pathname + nextUrl.search;
            } else {
                url = "";
            }
        }
        return allResults;
    } catch (error) {
        return [];
    }
}

function processEvents(views: any[], starts: any[], completes: any[], bookings: any[], rawEmails: any[]) {
    const usersMap = new Map<string, any>();

    const addUserIfMissing = (u: any) => {
        if (!usersMap.has(u.person)) {
            usersMap.set(u.person, {
                id: u.person,
                view_landing: false,
                click_start: false,
                completed: false,
                booked: false,
                last_active: u.timestamp
            });
        }
    };

    views.forEach(v => { addUserIfMissing(v); usersMap.get(v.person).view_landing = true; usersMap.get(v.person).last_active = v.timestamp; });
    starts.forEach(v => { addUserIfMissing(v); usersMap.get(v.person).click_start = true; usersMap.get(v.person).last_active = v.timestamp; });
    completes.forEach(v => { addUserIfMissing(v); usersMap.get(v.person).completed = true; usersMap.get(v.person).last_active = v.timestamp; });
    bookings.forEach(v => { addUserIfMissing(v); usersMap.get(v.person).booked = true; usersMap.get(v.person).last_active = v.timestamp; });
    rawEmails.forEach(v => { addUserIfMissing(v); usersMap.get(v.person).last_active = v.timestamp; });

    let n1 = 0, n2 = 0, n3 = 0, n4 = 0;
    const userFunnel: any[] = [];

    usersMap.forEach((u) => {
        let stage = "Nivel 0 (Solo detectado)";
        if (u.view_landing && !u.click_start && !u.completed) {
            stage = "Nivel 1 (Solo vio landing y se fue)";
            n1++;
        } else if (u.click_start && !u.completed) {
            stage = "Nivel 2 (Inició encuesta pero no terminó)";
            n2++;
        } else if (u.completed && !u.booked) {
            stage = "Nivel 3 (Completó diagnóstico, sin agendar)";
            n3++;
        } else if (u.booked) {
            stage = "Nivel 4 (Completó y Agendó)";
            n4++;
        }

        userFunnel.push({ id: u.id, stage, last_active: new Date(u.last_active).toLocaleString('es-ES') });
    });

    userFunnel.sort((a, b) => {
        const valA = a.stage.includes('Nivel 4') ? 4 : a.stage.includes('Nivel 3') ? 3 : a.stage.includes('Nivel 2') ? 2 : a.stage.includes('Nivel 1') ? 1 : 0;
        const valB = b.stage.includes('Nivel 4') ? 4 : b.stage.includes('Nivel 3') ? 3 : b.stage.includes('Nivel 2') ? 2 : b.stage.includes('Nivel 1') ? 1 : 0;
        return valB - valA;
    });

    return { userFunnel, stats: { totalUsers: usersMap.size, n1, n2, n3, n4 } };
}

async function run() {
    console.log("=========================================");
    console.log("Extrayendo datos de Posthog para HOY (4 de Marzo)...");

    const afterDate = "2026-03-04T00:00:00Z";
    const beforeDate = "2026-03-04T23:59:59Z";

    const views = await fetchDistinctEvents('view_landing', afterDate, beforeDate);
    const starts = await fetchDistinctEvents('click_start_survey', afterDate, beforeDate);
    const completes = await fetchDistinctEvents('complete_survey', afterDate, beforeDate);
    const bookings = await fetchDistinctEvents('book_call_clicked', afterDate, beforeDate);
    const autoIdentified = await fetchDistinctEvents('auto_identified_from_email', afterDate, beforeDate);

    const { userFunnel, stats } = processEvents(views, starts, completes, bookings, autoIdentified);

    const allEvents = await getProjectEvents(afterDate, beforeDate);
    const eventCounts: any = {};
    let totalEvents = 0;

    allEvents.forEach((e: any) => {
        eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
        totalEvents++;
    });

    let outputString = [
        "=== REPORTE POSTHOG (HOY: 4 Mar 2026) ===",
        `\n👥 Usuarios Totales Únicos Detectados: ${stats.totalUsers}`,
        `📧 Identificaciones Automáticas (Emails extraídos de URL): ${autoIdentified.length}`,
        `\n📊 EMBUDO DE CONVERSIÓN (FUNNEL DEL DÍA)`,
        `  - Nivel 1 (Vio landing, sin iniciar): ${stats.n1}`,
        `  - Nivel 2 (Inició diagnóstico, abandonó a medias): ${stats.n2}`,
        `  - Nivel 3 (Terminó diagnóstico, no agendó): ${stats.n3}`,
        `  - Nivel 4 (Agenda completada con éxito): ${stats.n4}`,
        `\n🛑 DETALLE POR USUARIOS (Dónde se quedaron)`,
        ...userFunnel.map(u => `  - ID: ${u.id}\n    Etapa: ${u.stage}\n    Última vez activo: ${u.last_active}\n`),
        "\n📈 EVENTOS GLOBALES DEL DÍA",
        `  Total eventos procesados por la API: ${totalEvents}`,
        JSON.stringify(eventCounts, null, 2),
    ].join('\n');

    fs.writeFileSync('c:\\Users\\JuanMartínezCarrillo\\Desktop\\TRABAJOS\\Landing Funnel\\posthog_today_output.txt', outputString, 'utf-8');
    console.log("¡Reporte escrito a posthog_today_output.txt!");
}

run();
