import axios from 'axios';
import * as fs from 'fs';

const POSTHOG_API_KEY = 'phx_O3nghSDIXUtsaeGYJz9AY2zfi1AGyNf9Pqc2czHO1GrrQbf';
const POSTHOG_HOST = 'https://eu.posthog.com';
const PROJECT_ID = '122772';

const phClient = axios.create({
    baseURL: `${POSTHOG_HOST}/api/projects/${PROJECT_ID}`,
    headers: { 'Authorization': `Bearer ${POSTHOG_API_KEY}` }
});

async function run() {
    console.log("Conectando a PostHog API para analizar Personas...");
    
    try {
        // 1. Fetch Persons
        let allPersons: any[] = [];
        let nextUrl = '/persons?limit=100';
        
        while (nextUrl && allPersons.length < 200) { // Limit to 200 just in case
            const res = await phClient.get(nextUrl);
            allPersons = allPersons.concat(res.data.results);
            nextUrl = res.data.next;
        }
        
        console.log(`Total Personas encontradas: ${allPersons.length}`);
        
        // 2. Analizar perfiles
        let analysis: any = {
            total: allPersons.length,
            withEmail: 0,
            dates: {} as Record<string, number>,
            sampleDomains: {} as Record<string, number>,
            propertiesKeys: {} as Record<string, number> // to check if they have special properties like imported_from
        };
        
        allPersons.forEach(p => {
            const props = p.properties || {};
            const email = props.email;
            if (email) {
                analysis.withEmail++;
                const domain = email.split('@')[1];
                if (domain) {
                    analysis.sampleDomains[domain] = (analysis.sampleDomains[domain] || 0) + 1;
                }
            }
            
            const date = new Date(p.created_at).toISOString().split('T')[0];
            analysis.dates[date] = (analysis.dates[date] || 0) + 1;
            
            Object.keys(props).forEach(k => {
                analysis.propertiesKeys[k] = (analysis.propertiesKeys[k] || 0) + 1;
            });
        });
        
        fs.writeFileSync('persons_analysis.json', JSON.stringify({ summary: analysis, samplePersons: allPersons.slice(0, 5) }, null, 2));
        console.log("Análisis guardado en persons_analysis.json");
        
        // 3. Traer todos los eventos de los últimos 30 días para cruzar y ver QUÉ han hecho
        let date30DaysAgo = new Date();
        date30DaysAgo.setDate(date30DaysAgo.getDate() - 40);
        const afterStr = date30DaysAgo.toISOString();
        
        console.log(`Buscando eventos desde ${afterStr}...`);
        const resEvents = await phClient.get(`/events?after=${afterStr}&limit=500`);
        const events = resEvents.data.results;
        
        const eventSummary: any = {};
        const eventsByPerson: any = {};
        
        events.forEach((e: any) => {
            eventSummary[e.event] = (eventSummary[e.event] || 0) + 1;
            
            const personId = e.person?.properties?.email || e.person?.properties?.name || e.distinct_id;
            if (!eventsByPerson[personId]) eventsByPerson[personId] = {};
            eventsByPerson[personId][e.event] = (eventsByPerson[personId][e.event] || 0) + 1;
        });
        
        fs.writeFileSync('events_analysis.json', JSON.stringify({ eventSummary, eventsByPerson }, null, 2));
        console.log("Eventos guardados en events_analysis.json");

    } catch (e: any) {
        console.error("Error consultando API:", e.response?.data || e.message);
    }
}

run();
