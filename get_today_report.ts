import axios from 'axios';
import * as fs from 'fs';

const POSTHOG_API_KEY = 'phx_YFEsBKwciR5uU76UU8F8kXlro5Mp7UzZCOqXSjwp2ZR0TII';
const POSTHOG_HOST = 'https://eu.posthog.com';
const PROJECT_ID = '122772';

const phClient = axios.create({
    baseURL: `${POSTHOG_HOST}/api/projects/${PROJECT_ID}`,
    headers: { 'Authorization': `Bearer ${POSTHOG_API_KEY}` }
});

async function fetchDistinctEvents(eventName: string, afterDate: string): Promise<any[]> {
    try {
        const url = `/events?event=${eventName}&after=${afterDate}&limit=100`;
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

async function getProjectEvents(afterDate: string) {
    try {
        const url = `/events?after=${afterDate}&limit=500`;
        const response = await phClient.get(url);
        return response.data.results;
    } catch (error) {
        return [];
    }
}

async function getEventDefinitions() {
    try {
        const response = await phClient.get('/event_definitions?limit=100');
        return response.data.results.map((d: any) => d.name);
    } catch (e) {
        return [];
    }
}

async function run() {
    console.log("=========================================");
    console.log("Iniciando extracción de datos de PostHog...");

    // Configurar para hoy, 27 de febrero de 2026
    const afterDate = "2026-02-27T00:00:00Z";

    const views = await fetchDistinctEvents('view_landing', afterDate);
    const starts = await fetchDistinctEvents('click_start_survey', afterDate);
    const completes = await fetchDistinctEvents('complete_survey', afterDate);
    const bookings = await fetchDistinctEvents('book_call_clicked', afterDate);

    console.log("\n=== REPORTE DE HOY (Desde 2026-02-27) ===");
    console.log(`\n👁️  Vistas Landing: ${views.length}`);
    views.forEach(v => console.log(`  - ID: ${v.person} (Hora: ${new Date(v.timestamp).toLocaleTimeString('es-ES')})`));

    console.log(`\n🚀 Inició Diagnóstico: ${starts.length}`);
    starts.forEach(v => console.log(`  - ID: ${v.person} (Hora: ${new Date(v.timestamp).toLocaleTimeString('es-ES')})`));

    console.log(`\n✅ Completó Encuesta: ${completes.length}`);
    completes.forEach(v => console.log(`  - ID: ${v.person} (Hora: ${new Date(v.timestamp).toLocaleTimeString('es-ES')})`));

    console.log(`\n📅 Clic en Agendar: ${bookings.length}`);
    bookings.forEach(v => console.log(`  - ID: ${v.person} (Hora: ${new Date(v.timestamp).toLocaleTimeString('es-ES')})`));

    // También traemos todos los eventos para encontrar los de email
    const allEvents = await getProjectEvents(afterDate);
    const eventCounts: any = {};
    const emailEvents: any[] = [];

    allEvents.forEach((e: any) => {
        eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
        // Si el evento tiene "email", "open", "read", "click" en el nombre (útil si viene de Make)
        if (e.event.toLowerCase().includes('email') || e.event.toLowerCase().includes('open') || e.event.toLowerCase().includes('click') && e.event !== 'click_start_survey' && e.event !== 'book_call_clicked' && e.event !== 'pdf_clicked' && !e.event.startsWith('$')) {
            emailEvents.push({ event: e.event, distinct_id: e.distinct_id, time: e.timestamp });
        }
    });

    console.log("\n=== TODOS LOS EVENTOS REGISTRADOS HOY ===");
    console.log(eventCounts);

    if (emailEvents.length > 0) {
        console.log("\n=== POSIBLES EVENTOS DE EMAIL ENCONTRADOS HOY ===");
        emailEvents.forEach(e => console.log(`  - EVENTO: ${e.event} | ID: ${e.distinct_id} | HORA: ${new Date(e.time).toLocaleTimeString('es-ES')}`));
    }

    const eventDefs = await getEventDefinitions();
    console.log("\n=== TIPOS DE EVENTOS CUSTOM EN EL PROYECTO ===");
    console.log(eventDefs.filter((d: string) => !d.startsWith('$')).join(', '));
    console.log("=========================================");

    // Redirect all output to string and save to file since windows breaks console logs sometimes
    const outputString = [
        "=== REPORTE DE HOY (Desde 2026-02-27) ===",
        `\n👁️  Vistas Landing: ${views.length}`,
        ...views.map(v => `  - ID: ${v.person} (Hora: ${new Date(v.timestamp).toLocaleTimeString('es-ES')})`),
        `\n🚀 Inició Diagnóstico: ${starts.length}`,
        ...starts.map(v => `  - ID: ${v.person} (Hora: ${new Date(v.timestamp).toLocaleTimeString('es-ES')})`),
        `\n✅ Completó Encuesta: ${completes.length}`,
        ...completes.map(v => `  - ID: ${v.person} (Hora: ${new Date(v.timestamp).toLocaleTimeString('es-ES')})`),
        `\n📅 Clic en Agendar: ${bookings.length}`,
        ...bookings.map(v => `  - ID: ${v.person} (Hora: ${new Date(v.timestamp).toLocaleTimeString('es-ES')})`),
        "\n=== TODOS LOS EVENTOS REGISTRADOS HOY ===",
        JSON.stringify(eventCounts, null, 2),
        ...(emailEvents.length > 0 ? [
            "\n=== POSIBLES EVENTOS DE EMAIL ENCONTRADOS HOY ===",
            ...emailEvents.map(e => `  - EVENTO: ${e.event} | ID: ${e.distinct_id} | HORA: ${new Date(e.time).toLocaleTimeString('es-ES')}`)
        ] : []),
        "\n=== TIPOS DE EVENTOS CUSTOM EN EL PROYECTO ===",
        eventDefs.filter((d: string) => !d.startsWith('$')).join(', ')
    ].join('\n');

    fs.writeFileSync('today_report_final.txt', outputString, 'utf-8');
}


run();
