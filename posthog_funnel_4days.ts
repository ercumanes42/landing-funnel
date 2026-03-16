
import axios from 'axios';

const POSTHOG_API_KEY = 'phx_YFEsBKwciR5uU76UU8F8kXlro5Mp7UzZCOqXSjwp2ZR0TII';
const POSTHOG_HOST = 'https://eu.posthog.com';
const PROJECT_ID = '122772';

// Utility to make authenticated requests
const phClient = axios.create({
    baseURL: `${POSTHOG_HOST}/api/projects/${PROJECT_ID}`,
    headers: {
        'Authorization': `Bearer ${POSTHOG_API_KEY}`,
        'Content-Type': 'application/json'
    }
});

async function getFunnelAnalysis() {
    console.log('Fetching Funnel Analysis for the last 4 days...');

    try {
        const payload = {
            "insight": "FUNNELS",
            "date_from": "-4d", // Last 4 days
            "steps": [
                {
                    "order": 0,
                    "id": "view_landing",
                    "name": "Vio Landing",
                    "type": "events",
                    "properties": [
                        { "key": "path", "value": "/", "operator": "exact" }
                    ]
                },
                {
                    "order": 1,
                    "id": "click_start_survey",
                    "name": "Inició Wizard",
                    "type": "events"
                },
                {
                    "order": 2,
                    "id": "complete_survey",
                    "name": "Completó Encuesta",
                    "type": "events"
                },
                {
                    "order": 3,
                    "id": "book_call_clicked",
                    "name": "Clic en Agendar",
                    "type": "events"
                }
            ],
            "funnel_viz_type": "steps"
        };

        const response = await phClient.post('/insights/funnel/', payload);

        // Print raw results for debugging if needed, but pretty print for the user
        // console.log(JSON.stringify(response.data.result, null, 2));

        const steps = response.data.result;

        console.log('\n--- REPORTE DE EMBUDO (ÚLTIMOS 4 DÍAS) ---');
        console.table(steps.map((s: any) => ({
            "Paso": s.name,
            "Usuarios": s.count,
            "Conversión del Paso Anterior": s.conversion_rates.from_previous_step ? `${(s.conversion_rates.from_previous_step * 100).toFixed(1)}%` : 'N/A',
            "Conversión Total": s.conversion_rates.total ? `${(s.conversion_rates.total * 100).toFixed(1)}%` : 'N/A',
            "Abandono": s.dropped_off_from_previous_step > 0 ? `-${s.dropped_off_from_previous_step} (${((s.dropped_off_from_previous_step / (s.count + s.dropped_off_from_previous_step)) * 100).toFixed(1)}%)` : '-'
        })));

    } catch (error: any) {
        console.error('Error fetching funnel:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    }
}

// Also get trend for context (daily breakdown)
async function getTrendAnalysis() {
    console.log('\nFetching Daily Trend for Landing Views...');
    try {
        const response = await phClient.get('/insights/trend/', {
            params: {
                events: JSON.stringify([{ "id": "view_landing", "properties": [{ "key": "path", "value": "/", "operator": "exact" }] }]),
                date_from: "-4d"
            }
        });

        const data = response.data.result[0];
        console.log('Daily Views:', data.labels.map((d: string, i: number) => `${d}: ${data.data[i]}`).join(', '));
    } catch (e: any) {
        console.error("Trend error", e.message);
    }
}

async function main() {
    await getFunnelAnalysis();
    await getTrendAnalysis();
}

main();
