
import axios from 'axios';

const POSTHOG_API_KEY = 'phx_YFEsBKwciR5uU76UU8F8kXlro5Mp7UzZCOqXSjwp2ZR0TII';
const POSTHOG_HOST = 'https://eu.posthog.com'; // Note: corrected host for API requests (usually non-ingestion)

const PROJECT_ID = '122772';

// Utility to make authenticated requests
const phClient = axios.create({
    baseURL: `${POSTHOG_HOST}/api/projects/${PROJECT_ID}`,
    headers: {
        'Authorization': `Bearer ${POSTHOG_API_KEY}`
    }
});


// 1. Get recent insights/dashboards could be useful
async function getInsights() {
    try {
        const response = await phClient.get('/insights/');
        console.log(`Found ${response.data.count} insights.`);
        response.data.results.slice(0, 5).forEach((insight: any) => {
            console.log(`- ${insight.name || 'Untitled'} (ID: ${insight.id})`);
        });
    } catch (error: any) {
        console.error('Error fetching insights:', error.message);
    }
}

// 2. Get recent events summary (last 24h)
async function getRecentEvents() {
    try {
        const response = await phClient.get('/events/');
        console.log(`Found recent events.`);
        // just show a summary count of event names
        const eventCounts: Record<string, number> = {};
        response.data.results.forEach((e: any) => {
            eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
        });
        console.log('Recent Event Types:', eventCounts);
    } catch (error: any) {
        console.error('Error fetching events:', error.message);
    }
}


async function main() {
    console.log('--- PostHog Analyst ---');
    await getInsights();
    console.log('\n--- Recent Activity ---');
    await getRecentEvents();
}

main();
