
import axios from 'axios';
import * as fs from 'fs';

const POSTHOG_API_KEY = 'phx_YFEsBKwciR5uU76UU8F8kXlro5Mp7UzZCOqXSjwp2ZR0TII';
const POSTHOG_HOST = 'https://eu.posthog.com';
const PROJECT_ID = '122772';

const phClient = axios.create({
    baseURL: `${POSTHOG_HOST}/api/projects/${PROJECT_ID}`,
    headers: { 'Authorization': `Bearer ${POSTHOG_API_KEY}` }
});

async function fetchEvents(eventName: string, afterDate: string): Promise<string[]> {
    try {
        const url = `/events?event=${eventName}&after=${afterDate}&limit=1000`;
        const response = await phClient.get(url);

        if (!response.data || !response.data.results) {
            return [];
        }

        let events = response.data.results;
        // Filter for specific properties if needed
        // view_landing might pick up other pages if not filtered, but let's assume raw event is mostly landing
        if (eventName === 'view_landing') {
            // events = events.filter((e: any) => e.properties.path === '/');
        }

        const uniqueUsers = new Set(events.map((e: any) => e.distinct_id));
        return Array.from(uniqueUsers) as string[];
    } catch (error: any) {
        console.error(`Error fetching ${eventName}:`, error.message);
        return [];
    }
}

async function runAnalysis() {
    const output: string[] = [];
    const startDate = "2026-02-04T00:00:00.000Z";

    // Fetch unique users for each step
    const landingUsers = await fetchEvents('view_landing', startDate);
    const startUsers = await fetchEvents('click_start_survey', startDate);
    const completeUsers = await fetchEvents('complete_survey', startDate);
    const bookUsers = await fetchEvents('book_call_clicked', startDate);

    const countView = landingUsers.length;
    const countStart = startUsers.length;
    const countComplete = completeUsers.length;
    const countBook = bookUsers.length;

    output.push('=== REPORTE DE EMBUDO (04/02 - HOY) ===');
    output.push('---------------------------------------');

    output.push(`1. 👁️  Vistas Landing:       ${countView}`);

    const conv1to2 = countView > 0 ? (countStart / countView * 100).toFixed(1) : "0.0";
    output.push(`2. 🚀 Inició Diagnóstico:     ${countStart} (${conv1to2}%)`);

    const conv2to3 = countStart > 0 ? (countComplete / countStart * 100).toFixed(1) : "0.0";
    const drop2to3 = countStart - countComplete;
    output.push(`3. ✅ Completó Encuesta:      ${countComplete} (${conv2to3}% de paso anterior)`);
    output.push(`       📉 Abandono: -${drop2to3} usuarios`);

    const conv3to4 = countComplete > 0 ? (countBook / countComplete * 100).toFixed(1) : "0.0";
    const finalConv = countView > 0 ? (countBook / countView * 100).toFixed(1) : "0.0";
    output.push(`4. 📅 Clic en Agendar:        ${countBook} (${conv3to4}% de paso anterior)`);
    output.push('---------------------------------------');
    output.push(`🎯 CONVERSIÓN TOTAL: ${finalConv}%`);
    output.push('=======================================\n');

    const report = output.join('\n');
    console.log(report);
    fs.writeFileSync('posthog_week_output.txt', report);
}

runAnalysis();
