import axios from 'axios';

const POSTHOG_API_KEY = 'phx_YFEsBKwciR5uU76UU8F8kXlro5Mp7UzZCOqXSjwp2ZR0TII';
const POSTHOG_HOST = 'https://eu.posthog.com';
const PROJECT_ID = '122772';

const START_DATE = '2026-03-09';
const END_DATE = '2026-03-13';

const phClient = axios.create({
    baseURL: `${POSTHOG_HOST}/api/projects/${PROJECT_ID}`,
    headers: { 'Authorization': `Bearer ${POSTHOG_API_KEY}` }
});

const BLOCK_EVENTS = ['diagnostic_start', 'block_1_complete', 'block_2_complete', 'block_3_complete', 'block_4_complete', 'diagnostic_complete'];

interface Person {
    id: string;
    distinct_ids: string[];
    properties: Record<string, any>;
}

async function getPersons(): Promise<Person[]> {
    let allPersons: Person[] = [];
    let url = '/persons?limit=500';
    
    while (url) {
        try {
            const response = await phClient.get(url);
            if (response.data && response.data.results) {
                allPersons = allPersons.concat(response.data.results);
            }
            if (response.data.next) {
                const nextUrl = new URL(response.data.next);
                url = nextUrl.pathname + nextUrl.search;
            } else {
                url = '';
            }
        } catch (e: any) {
            console.log('Error:', e.message);
            break;
        }
    }
    return allPersons;
}

async function getEventsForPerson(personId: string): Promise<any[]> {
    let allEvents: any[] = [];
    const startTimestamp = new Date(START_DATE).toISOString();
    const endTimestamp = new Date(END_DATE).toISOString();
    
    let url = `/events?person_id=${personId}&limit=500&after=${startTimestamp}&before=${endTimestamp}`;
    
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
                url = '';
            }
        } catch (e: any) {
            break;
        }
    }
    allEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return allEvents;
}

const stageLabels: Record<string, string> = {
    'diagnostic_start': '1️⃣ Inicio del diagnóstico',
    'block_1_complete': '2️⃣ Bloque 1 completado (D1: Productividad)',
    'block_2_complete': '3️⃣ Bloque 2 completado (D2: Adaptación)',
    'block_3_complete': '4️⃣ Bloque 3 completado (D3: Clima)',
    'block_4_complete': '5️⃣ Bloque 4 completado (D4: Sucesión)',
    'diagnostic_complete': '6️⃣ Diagnóstico completado'
};

async function main() {
    console.log('Analizando etapa de abandono...\n');
    
    const persons = await getPersons();
    
    const targetEmails = [
        'monica.zai@heineken.com',
        'rafael.diazyeregui@elcorteingles.es',
        'belen.gonzalez@balearia.com',
        'ccasillas@adif.es',
        'hcarrascosa@bancsabadell.com',
        'veronica.climent@santander.com',
        'david.payeras@mango.com',
        'patricia.carollo@chemogroup.com',
        'jesus.martin@valdepenas.es'
    ];
    
    for (const email of targetEmails) {
        const person = persons.find(p => 
            p.properties?.email === email || 
            (p.distinct_ids && p.distinct_ids.includes(email))
        );
        
        if (!person) {
            console.log(`❌ ${email}: No encontrado`);
            continue;
        }
        
        const events = await getEventsForPerson(person.id);
        const blockEvents = events.filter(e => BLOCK_EVENTS.includes(e.event));
        
        if (blockEvents.length === 0) {
            console.log(`❌ ${email}: Sin eventos de progreso`);
            continue;
        }
        
        const lastBlockEvent = blockEvents[blockEvents.length - 1];
        const stage = stageLabels[lastBlockEvent.event] || lastBlockEvent.event;
        
        console.log(`⏹️  ${email}`);
        console.log(`   Última etapa: ${stage}`);
        console.log(`   Fecha: ${new Date(lastBlockEvent.timestamp).toLocaleString('es-ES')}\n`);
    }
}

main().catch(console.error);
