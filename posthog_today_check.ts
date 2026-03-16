import axios from 'axios';
import * as fs from 'fs';

const POSTHOG_API_KEY = 'phx_YFEsBKwciR5uU76UU8F8kXlro5Mp7UzZCOqXSjwp2ZR0TII';
const POSTHOG_HOST = 'https://eu.posthog.com';
const PROJECT_ID = '122772';

const phClient = axios.create({
    baseURL: `${POSTHOG_HOST}/api/projects/${PROJECT_ID}`,
    headers: {
        'Authorization': `Bearer ${POSTHOG_API_KEY}`,
        'Content-Type': 'application/json'
    }
});

const out: string[] = [];
function log(msg: string) { console.log(msg); out.push(msg); }

async function diagnose() {
    log('=== DIAGNÓSTICO COMPLETO DE POSTHOG ===');
    log(`Fecha actual: ${new Date().toISOString()}`);
    log('');

    // 1. Check latest events (any type, no date filter)
    log('--- 1. ÚLTIMOS EVENTOS (sin filtro de fecha, últimos 20) ---');
    try {
        const r = await phClient.get('/events/', { params: { limit: 20, orderBy: '-timestamp' } });
        const events = r.data.results;
        log(`Total returned: ${events.length}`);
        if (events.length > 0) {
            log(`Último evento: ${events[0].event} @ ${events[0].timestamp}`);
            log(`Primer evento de la lista: ${events[events.length - 1].event} @ ${events[events.length - 1].timestamp}`);
            events.forEach((e: any, i: number) => {
                log(`  ${i + 1}. [${e.event}] ${e.timestamp} - distinct_id: ${e.distinct_id?.substring(0, 30)}...`);
            });
        } else {
            log('  NO HAY EVENTOS EN ABSOLUTO');
        }
    } catch (err: any) {
        log(`Error: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
    }

    // 2. Check specific event types
    log('\n--- 2. ÚLTIMOS view_landing ---');
    try {
        const r = await phClient.get('/events/', { params: { event: 'view_landing', limit: 5 } });
        log(`Total: ${r.data.results.length}`);
        r.data.results.forEach((e: any, i: number) => {
            log(`  ${i + 1}. ${e.timestamp} - ${e.distinct_id?.substring(0, 30)}`);
        });
    } catch (err: any) {
        log(`Error: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
    }

    log('\n--- 3. ÚLTIMOS click_start_survey ---');
    try {
        const r = await phClient.get('/events/', { params: { event: 'click_start_survey', limit: 5 } });
        log(`Total: ${r.data.results.length}`);
        r.data.results.forEach((e: any, i: number) => {
            log(`  ${i + 1}. ${e.timestamp} - ${e.distinct_id?.substring(0, 30)}`);
        });
    } catch (err: any) {
        log(`Error: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
    }

    log('\n--- 4. ÚLTIMOS complete_survey ---');
    try {
        const r = await phClient.get('/events/', { params: { event: 'complete_survey', limit: 5 } });
        log(`Total: ${r.data.results.length}`);
        r.data.results.forEach((e: any, i: number) => {
            log(`  ${i + 1}. ${e.timestamp} - ${e.distinct_id?.substring(0, 30)}`);
        });
    } catch (err: any) {
        log(`Error: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
    }

    // 3. Check $pageview autocapture (even though manual is used, PostHog might have auto)
    log('\n--- 5. ÚLTIMOS $pageview ---');
    try {
        const r = await phClient.get('/events/', { params: { event: '$pageview', limit: 5 } });
        log(`Total: ${r.data.results.length}`);
        r.data.results.forEach((e: any, i: number) => {
            log(`  ${i + 1}. ${e.timestamp} - ${e.distinct_id?.substring(0, 30)} - ${e.properties?.$current_url || 'N/A'}`);
        });
    } catch (err: any) {
        log(`Error: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
    }

    // 4. Get event definitions to see what events exist
    log('\n--- 6. DEFINICIONES DE EVENTOS (tipos de eventos registrados) ---');
    try {
        const r = await phClient.get('/event_definitions/', { params: { limit: 30 } });
        const defs = r.data.results;
        log(`Total definiciones: ${defs.length}`);
        defs.forEach((d: any, i: number) => {
            log(`  ${i + 1}. ${d.name} (last_seen: ${d.last_seen_at || 'N/A'})`);
        });
    } catch (err: any) {
        log(`Error: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
    }

    // 5. Check project info
    log('\n--- 7. INFO DEL PROYECTO ---');
    try {
        const r = await phClient.get('/');
        log(`Proyecto: ${r.data.name || 'N/A'}`);
        log(`ID: ${r.data.id}`);
        log(`API token: ${r.data.api_token?.substring(0, 20)}...`);
    } catch (err: any) {
        log(`Error: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
    }

    fs.writeFileSync('posthog_diagnostic.txt', out.join('\n'), 'utf-8');
    log('\nGuardado en posthog_diagnostic.txt');
}

diagnose();
