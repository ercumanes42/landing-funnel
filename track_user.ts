import axios from 'axios';

const POSTHOG_API_KEY = 'phx_YFEsBKwciR5uU76UU8F8kXlro5Mp7UzZCOqXSjwp2ZR0TII';
const POSTHOG_HOST = 'https://eu.posthog.com';
const PROJECT_ID = '122772';

const phClient = axios.create({
    baseURL: `${POSTHOG_HOST}/api/projects/${PROJECT_ID}`,
    headers: { 'Authorization': `Bearer ${POSTHOG_API_KEY}` }
});

async function trackDownUserFullHistory() {
    console.log("Rastreando el historial completo de sdasda@asddsa.com...");

    try {
        // Find the person ID first
        const personUrl = `/persons`;
        const pResponse = await phClient.get(personUrl);
        const persons = pResponse.data.results;

        const target = persons.find((p: any) =>
            p.properties.email === 'sdasda@asddsa.com' ||
            (p.distinct_ids && p.distinct_ids.includes('sdasda@asddsa.com'))
        );

        if (!target) {
            console.log("No se encontró la persona.");
            return;
        }

        const distinctId = target.distinct_ids[0];
        console.log(`Buscando todos los eventos para el ID: ${distinctId}`);

        let allEvents: any[] = [];
        let url = `/events?person_id=${target.id}&limit=500`;

        while (url) {
            try {
                const response = await phClient.get(url);
                if (response.data && response.data.results) {
                    allEvents = allEvents.concat(response.data.results);
                }
                if (response.data.next) {
                    const nextUrl = new URL(response.data.next);
                    url = nextUrl.pathname + nextUrl.search;
                } else {
                    url = "";
                }
            } catch (e) {
                console.log("Error pagination", url);
                break;
            }
        }

        console.log(`Se encontraron ${allEvents.length} eventos en total para este usuario.`);

        // Sort by oldest first
        allEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        console.log("\n--- PRIMER CONTACTO (ORIGEN) ---");
        const firstEvent = allEvents[0];
        console.log("Fecha primera aparición:", new Date(firstEvent.timestamp).toLocaleString('es-ES'));
        console.log("Evento:", firstEvent.event);
        console.log("URL de origen ($current_url):", firstEvent.properties.$current_url || "Desconocida");
        console.log("Referente ($referrer):", firstEvent.properties.$referrer || "Directo");
        console.log("IP:", firstEvent.properties.$ip || "Oculta");
        console.log("Navegador:", firstEvent.properties.$browser, firstEvent.properties.$os);

        console.log("\n--- HISTORIAL DE EVENTOS CUSTOM ---");
        allEvents.filter(e => !e.event.startsWith('$')).forEach(e => {
            console.log(`- ${new Date(e.timestamp).toLocaleString('es-ES')} | ${e.event}`);
            if (e.event === 'diagnostic_complete' || e.event === 'complete_survey') {
                console.log(`  Datos: Empresa: ${e.properties.contact?.company}, Nombre: ${e.properties.contact?.name}`);
            }
        });

    } catch (e: any) {
        console.log("Error:", e.message);
    }
}

trackDownUserFullHistory();
