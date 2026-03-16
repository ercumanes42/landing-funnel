
import axios from 'axios';

const POSTHOG_API_KEY = 'phx_YFEsBKwciR5uU76UU8F8kXlro5Mp7UzZCOqXSjwp2ZR0TII';
const POSTHOG_HOST = 'https://eu.posthog.com';
const PROJECT_ID = '122772';

const phClient = axios.create({
    baseURL: `${POSTHOG_HOST}/api/projects/${PROJECT_ID}`,
    headers: { 'Authorization': `Bearer ${POSTHOG_API_KEY}` }
});

async function fetchEvents(eventName: string, afterDate: string) {
    try {
        console.log(`Fetching ${eventName}...`);
        const url = `/events?event=${eventName}&after=${afterDate}&limit=100`;
        const response = await phClient.get(url);

        // Check if we got results
        if (!response.data || !response.data.results) {
            console.log(`No results for ${eventName}`);
            return [];
        }

        console.log(`- Found ${response.data.results.length} events for ${eventName}`);

        // For distinct users
        const uniqueUsers = new Set(response.data.results.map((e: any) => e.distinct_id));
        return Array.from(uniqueUsers); // Return distinct IDs
    } catch (error: any) {
        console.error(`Error fetching ${eventName}:`, error.message);
        if (error.response) console.error("Status:", error.response.status, error.response.data);
        return [];
    }
}

async function runAnalysis() {
    try {
        const fourDaysAgo = new Date();
        fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
        const dateStr = fourDaysAgo.toISOString();

        console.log(`Analyzing funnel since ${dateStr}...`);

        // 1. Landing Views
        // Note: property filter not applied here for simplicity, filtering all 'view_landing'
        const landingUsers = await fetchEvents('view_landing', dateStr);

        // 2. Started
        const startUsers = await fetchEvents('click_start_survey', dateStr); // or 'click_start' if used in Landing.tsx

        // 3. Completed
        const completeUsers = await fetchEvents('complete_survey', dateStr);

        // 4. Scheduled
        const bookUsers = await fetchEvents('book_call_clicked', dateStr);

        // Funnel Logic: 
        // We aren't strictly enforcing order (User A did 1 THEN 2), just counting unique users who did step.
        // This is a "Loose Funnel".

        const count1 = landingUsers.length;
        const count2 = startUsers.length;
        const count3 = completeUsers.length;
        const count4 = bookUsers.length;

        console.log('\n--- REPORTE DE EMBUDO (ÚLTIMOS 4 DÍAS) ---');
        console.log('-------------------------------------------');
        console.log(`1. Vistas Landing:      ${count1}`);
        console.log(`2. Iniciaron Disgnóstico: ${count2}`);
        console.log(`   (Conversión: ${count1 ? ((count2 / count1) * 100).toFixed(1) : 0}%)`);
        console.log(`3. Completaron Encuesta: ${count3}`);
        console.log(`   (Retención: ${count2 ? ((count3 / count2) * 100).toFixed(1) : 0}%)`);
        console.log(`4. Clic en Agendar:     ${count4}`);
        console.log(`   (Conversión Final: ${count3 ? ((count4 / count3) * 100).toFixed(1) : 0}%)`);
        console.log('-------------------------------------------');

    } catch (e) {
        console.error("Critical error in analysis:", e);
    }
}

runAnalysis();
