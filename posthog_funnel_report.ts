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

interface Person {
    id: string;
    distinct_ids: string[];
    properties: Record<string, any>;
    created_at: string;
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
            console.log('Error pagination persons:', e.message);
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
            console.log('Error pagination events:', e.message);
            break;
        }
    }
    return allEvents;
}

function getEventNames(events: any[]): string[] {
    return events.map(e => e.event);
}

async function main() {
    console.log(`=== INFORME DE FUNNEL - POSTHOOG (${START_DATE} al 12/03/2025) ===\n`);
    
    console.log('Obteniendo personas...');
    const persons = await getPersons();
    console.log(`Total de personas: ${persons.length}\n`);
    
    const results = {
        viewLanding: [] as string[],
        started: [] as string[],
        completed: [] as string[],
        booked: [] as string[],
        downloaded: [] as string[]
    };
    
    console.log('Analizando eventos por persona...');
    let processed = 0;
    
    for (const person of persons) {
        processed++;
        if (processed % 50 === 0) {
            console.log(`Procesadas ${processed}/${persons.length} personas...`);
        }
        
        const events = await getEventsForPerson(person.id);
        if (events.length === 0) continue;
        
        const eventNames = getEventNames(events);
        
        const email = person.properties?.email || person.distinct_ids[0];
        const name = person.properties?.name || person.properties?.firstname || 'Sin nombre';
        
        const personInfo = `${name} <${email}>`;
        
        if (eventNames.includes('view_landing')) {
            results.viewLanding.push(personInfo);
        }
        if (eventNames.includes('start_survey') || eventNames.includes('diagnostic_start')) {
            results.started.push(personInfo);
        }
        if (eventNames.includes('complete_survey') || eventNames.includes('diagnostic_complete')) {
            results.completed.push(personInfo);
        }
        if (eventNames.includes('book_call_click') || eventNames.includes('book_call_clicked') || eventNames.includes('book_call_complete')) {
            results.booked.push(personInfo);
        }
        if (eventNames.includes('report_download') || eventNames.includes('pdf_clicked')) {
            results.downloaded.push(personInfo);
        }
    }
    
    const startedButNotCompleted = results.started.filter(p => !results.completed.includes(p));
    
    console.log('\n' + '='.repeat(50));
    console.log(`           INFORME DEL 09/03 AL 12/03`);
    console.log('='.repeat(50));
    
    console.log(`\n1. QUIENES HAN VISTO EL LANDING: ${results.viewLanding.length}`);
    console.log('-'.repeat(40));
    if (results.viewLanding.length > 0) {
        results.viewLanding.forEach(p => console.log(`  - ${p}`));
    } else {
        console.log('  (ninguno)');
    }
    
    console.log(`\n2. QUIENES INICIARON EL DIAGNÓSTICO: ${results.started.length}`);
    console.log('-'.repeat(40));
    if (results.started.length > 0) {
        results.started.forEach(p => console.log(`  - ${p}`));
    } else {
        console.log('  (ninguno)');
    }
    
    console.log(`\n3. QUIENES INICIARON Y SE DETUVIERON: ${startedButNotCompleted.length}`);
    console.log('-'.repeat(40));
    if (startedButNotCompleted.length > 0) {
        startedButNotCompleted.forEach(p => console.log(`  - ${p}`));
    } else {
        console.log('  (ninguno)');
    }
    
    console.log(`\n4. QUIENES COMPLETARON EL DIAGNÓSTICO: ${results.completed.length}`);
    console.log('-'.repeat(40));
    if (results.completed.length > 0) {
        results.completed.forEach(p => console.log(`  - ${p}`));
    } else {
        console.log('  (ninguno)');
    }
    
    console.log(`\n5. QUIENES AGENDARON LLAMADA: ${results.booked.length}`);
    console.log('-'.repeat(40));
    if (results.booked.length > 0) {
        results.booked.forEach(p => console.log(`  - ${p}`));
    } else {
        console.log('  (ninguno)');
    }
    
    console.log(`\n6. QUIENES DESCARGARON EL INFORME: ${results.downloaded.length}`);
    console.log('-'.repeat(40));
    if (results.downloaded.length > 0) {
        results.downloaded.forEach(p => console.log(`  - ${p}`));
    } else {
        console.log('  (ninguno)');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('           RESUMEN');
    console.log('='.repeat(50));
    console.log(`Visitantes únicos: ${results.viewLanding.length}`);
    console.log(`Iniciaron diagnóstico: ${results.started.length}`);
    console.log(`Completaron diagnóstico: ${results.completed.length}`);
    console.log(`Iniciaron pero no completaron: ${startedButNotCompleted.length}`);
    console.log(`Agendaron llamada: ${results.booked.length}`);
    console.log(`Descargaron informe: ${results.downloaded.length}`);
}

main().catch(console.error);
