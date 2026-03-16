import axios from 'axios';

const POSTHOG_API_KEY = 'phx_YFEsBKwciR5uU76UU8F8kXlro5Mp7UzZCOqXSjwp2ZR0TII';
const POSTHOG_HOST = 'https://eu.posthog.com';
const PROJECT_ID = '122772';

const phClient = axios.create({
    baseURL: `${POSTHOG_HOST}/api/projects/${PROJECT_ID}`,
    headers: { 'Authorization': `Bearer ${POSTHOG_API_KEY}` }
});

async function run() {
    try {
        console.log("Buscando el último lead que completó la encuesta...");
        // Buscamos eventos de hoy (6 de marzo en adelante, o los últimos limite)
        const url = `/events?event=complete_survey&limit=5`;
        const res = await phClient.get(url);

        if (res.data?.results && res.data.results.length > 0) {
            // Cogeremos el más reciente (el primero de la lista o comparar fechas)
            const latestEvent = res.data.results[0]; // PostHog los devuelve ordenados del más reciente al más antiguo

            const p = latestEvent.properties;
            const person = latestEvent.person?.properties;

            const email = p?.contact?.email || p?.email || person?.email || 'No capturado';
            const name = p?.contact?.name || person?.name || p?.contact?.firstname || 'No capturado';
            const lastname = p?.contact?.lastname || person?.lastname || '';
            const company = p?.contact?.company || person?.company || 'No capturado';
            const role = p?.contact?.role || person?.role || 'No capturado';
            const score = p?.survey?.globalScore || 'No calculado';

            console.log("\n==============================================");
            console.log("🎯 DATOS DEL ÚLTIMO LEAD QUE REPORTÓ ERROR:");
            console.log("==============================================");
            console.log(`👤 Nombre completo: ${name} ${lastname}`.trim());
            console.log(`📧 Email: ${email}`);
            console.log(`🏢 Empresa: ${company}`);
            console.log(`💼 Cargo: ${role}`);
            console.log(`📊 Score: ${score}/100`);
            console.log(`🕒 Hora del intento: ${new Date(latestEvent.timestamp).toLocaleString('es-ES')}`);
            console.log("==============================================\n");
        } else {
            console.log("No se ha encontrado ninguna encuesta completada recientemente.");
        }
    } catch (e: any) {
        console.error("Error al buscar el lead:", e.message);
    }
}

run();
