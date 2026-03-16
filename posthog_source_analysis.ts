
import axios from 'axios';

const POSTHOG_API_KEY = 'phx_YFEsBKwciR5uU76UU8F8kXlro5Mp7UzZCOqXSjwp2ZR0TII';
const POSTHOG_HOST = 'https://eu.posthog.com';
const PROJECT_ID = '122772';

const phClient = axios.create({
    baseURL: `${POSTHOG_HOST}/api/projects/${PROJECT_ID}`,
    headers: { 'Authorization': `Bearer ${POSTHOG_API_KEY}` }
});

async function analyzeSources() {
    console.log('Analyzing Traffic Sources (04/02 - Present)...');

    try {
        // Fetch all view_landing events
        const url = `/events?event=view_landing&after=2026-02-04T00:00:00.000Z&limit=1000`;
        const response = await phClient.get(url);

        if (!response.data || !response.data.results) {
            console.log("No events found.");
            return;
        }

        const events = response.data.results;
        const totalViews = events.length;

        // Analyze UTM Source
        const sources: Record<string, number> = {};
        const referrers: Record<string, number> = {};
        const deviceTypes: Record<string, number> = {};

        events.forEach((e: any) => {
            // UTM Source
            const source = e.properties.utm_source || 'Direct / None';
            sources[source] = (sources[source] || 0) + 1;

            // Referrer
            let ref = e.properties.$referrer || 'Direct';
            if (ref.includes('linkedin.com')) ref = 'LinkedIn';
            else if (ref.includes('google.com')) ref = 'Google';
            else if (ref.length > 50) ref = ref.substring(0, 50) + '...';
            referrers[ref] = (referrers[ref] || 0) + 1;

            // Device
            const device = e.properties.$device_type || 'Desktop';
            deviceTypes[device] = (deviceTypes[device] || 0) + 1;
        });

        console.log('\n=== FUENTES DE TRÁFICO ===');
        console.log(`Total Vistas: ${totalViews}`);

        console.log('\n📌 Por UTM Source (Parámetros URL):');
        console.table(sources);

        console.log('\n🔗 Por Referrer (Origen Detectado):');
        console.table(referrers);

        console.log('\n📱 Por Dispositivo:');
        console.table(deviceTypes);

    } catch (e: any) {
        console.error("Error analyzing sources", e.message);
    }
}

analyzeSources();
