
import axios from 'axios';

const POSTHOG_API_KEY = 'phx_YFEsBKwciR5uU76UU8F8kXlro5Mp7UzZCOqXSjwp2ZR0TII';
const POSTHOG_HOST = 'https://eu.posthog.com';
const PROJECT_ID = '122772';

const phClient = axios.create({
    baseURL: `${POSTHOG_HOST}/api/projects/${PROJECT_ID}`,
    headers: { 'Authorization': `Bearer ${POSTHOG_API_KEY}` }
});

async function fetchEvents(eventName: string, afterDate: string) {
    let events: any[] = [];
    let nextUrl = `/events/?event=${eventName}&after=${afterDate}&limit=100`;

    while (nextUrl) {
        try {
            // If nextUrl is full URL, use it directly (but strip host if needed, or just use axios with full url)
            // PostHog returns full 'next' URL.
            const urlToCall = nextUrl.startsWith('http') ? nextUrl : `/events/?event=${eventName}&after=${afterDate}&limit=100`;

            // For simplicity with our client setup, we just need the path/query if it matches our host, 
            // but axios baseurl might interfere if we pass full URL.
            // Let's just use the client for the first call and axios for subsequent if they are full URLs.

            const response = await (nextUrl.startsWith('http')
                ? axios.get(nextUrl, { headers: { 'Authorization': `Bearer ${POSTHOG_API_KEY}` } })
                : phClient.get(nextUrl));

            events = events.concat(response.data.results);
            nextUrl = response.data.next;

            if (events.length > 5000) break; // Safety break
        } catch (e: any) {
            console.error(`Error fetching ${eventName}:`, e.message);
            break;
        }
    }
    return events;
}

async function runAnalysis() {
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    const dateStr = fourDaysAgo.toISOString();

    console.log(`Fetching events since ${dateStr}...`);

    // 1. Landing Views (approximate by 'view_landing' or '$pageview' with current_url = /)
    // Checking code, App.tsx logs 'view_landing' with path.
    const landingEvents = await fetchEvents('view_landing', dateStr);
    const landingUsers = new Set(landingEvents
        .filter((e: any) => e.properties.path === '/' || e.properties.path === '/#/' || e.properties.path === '/landing')
        .map((e: any) => e.distinct_id)
    );

    // 2. Started
    const startEvents = await fetchEvents('click_start_survey', dateStr);
    const startUsers = new Set(startEvents.map((e: any) => e.distinct_id));

    // 3. Completed
    const completeEvents = await fetchEvents('complete_survey', dateStr);
    const completeUsers = new Set(completeEvents.map((e: any) => e.distinct_id));

    // 4. Scheduled
    const bookEvents = await fetchEvents('book_call_clicked', dateStr);
    const bookUsers = new Set(bookEvents.map((e: any) => e.distinct_id));

    // Calculate Steps
    const step1 = landingUsers.size;

    // For Step 2, we only count users who also did Step 1? 
    // Usually standard funnel. But for simplicity, let's just count unique users at each step.
    // Ideally, a funnel requires performing Step 1 THEN Step 2.
    // But since we are looking at a short window (4 days) and simple flow, 
    // unique counts per event is a good proxy, assuming users don't skip steps via URL hacking.

    const step2 = startUsers.size; // Started
    const step3 = completeUsers.size; // Completed
    const step4 = bookUsers.size; // Scheduled

    console.log('\n--- FUNNEL (ÚLTIMOS 4 DÍAS) ---');
    console.log(`1. Vistas Landing: ${step1}`);
    console.log(`2. Iniciaron Wizard: ${step2} (${step1 ? ((step2 / step1) * 100).toFixed(1) : 0}%)`);
    console.log(`3. Completaron:     ${step3} (${step2 ? ((step3 / step2) * 100).toFixed(1) : 0}%)`);
    console.log(`4. Agendaron:       ${step4} (${step3 ? ((step4 / step3) * 100).toFixed(1) : 0}%)`);

    // Marketing Analysis
    console.log('\n--- OBSERVACIONES PRELIMINARES ---');
    if (step1 < 10) console.log("- TRÁFICO BAJO: La prioridad #1 es atraer tráfico. El embudo no es estadísticamente significativo aún.");
    else {
        if (step2 / step1 < 0.2) console.log("- CORTE EN LANDING: Menos del 20% inicia. Revisar Value Proposition o CTA 'Hero'.");
        if (step3 / step2 < 0.5) console.log("- ABANDONO EN ENCUESTA: Revisar longitud del wizard o preguntas complejas.");
        if (step4 / step3 < 0.1) console.log("- FALLO EN CIERRE: Pocos agendan tras ver resultados. ¿El incentivo es claro?");
    }
}

runAnalysis();
