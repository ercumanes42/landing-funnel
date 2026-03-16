import axios from 'axios';
import fs from 'fs';

const POSTHOG_API_KEY = 'phx_YFEsBKwciR5uU76UU8F8kXlro5Mp7UzZCOqXSjwp2ZR0TII';
const POSTHOG_HOST = 'https://eu.posthog.com';
const PROJECT_ID = '122772';

const phClient = axios.create({
    baseURL: `${POSTHOG_HOST}/api/projects/${PROJECT_ID}`,
    headers: { 'Authorization': `Bearer ${POSTHOG_API_KEY}` }
});

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

async function getEventsForPerson(personId: string, startDate: string, endDate: string): Promise<any[]> {
    let allEvents: any[] = [];
    const startTimestamp = new Date(startDate).toISOString();
    const endTimestamp = new Date(endDate).toISOString();
    
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

function getEventNames(events: any[]): string[] {
    return events.map(e => e.event);
}

async function generateReport(startDate: string, endDate: string, reportType: 'daily' | 'weekly') {
    console.log(`Generando reporte ${reportType} del ${startDate} al ${endDate}...`);
    
    const persons = await getPersons();
    
    const results = {
        viewLanding: [] as string[],
        started: [] as string[],
        completed: [] as string[],
        booked: [] as string[],
        downloaded: [] as string[]
    };
    
    const newLeads: { email: string; name: string; date: string }[] = [];
    
    const abandonos: { email: string; name: string; etapa: string; fecha: string }[] = [];
    
    const BLOCK_EVENTS = ['diagnostic_start', 'block_1_complete', 'block_2_complete', 'block_3_complete', 'block_4_complete', 'diagnostic_complete'];
    const ETAPA_LABELS: Record<string, string> = {
        'diagnostic_start': '1️⃣ Inicio',
        'block_1_complete': '2️⃣ Bloque 1 (Productividad)',
        'block_2_complete': '3️⃣ Bloque 2 (Adaptación)',
        'block_3_complete': '4️⃣ Bloque 3 (Clima)',
        'block_4_complete': '5️⃣ Bloque 4 (Sucesión)'
    };
    
    for (const person of persons) {
        const events = await getEventsForPerson(person.id, startDate, endDate);
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
            
            const firstStart = events.find(e => e.event === 'start_survey' || e.event === 'diagnostic_start');
            if (firstStart) {
                newLeads.push({
                    email,
                    name,
                    date: new Date(firstStart.timestamp).toLocaleString('es-ES')
                });
            }
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
        
        const started = eventNames.includes('start_survey') || eventNames.includes('diagnostic_start');
        const completed = eventNames.includes('complete_survey') || eventNames.includes('diagnostic_complete');
        
        if (started && !completed) {
            const blockEvents = events.filter(e => BLOCK_EVENTS.includes(e.event));
            blockEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            
            if (blockEvents.length > 0) {
                const lastEvent = blockEvents[blockEvents.length - 1];
                const etapa = ETAPA_LABELS[lastEvent.event] || lastEvent.event;
                
                abandonos.push({
                    email,
                    name,
                    etapa,
                    fecha: new Date(lastEvent.timestamp).toLocaleString('es-ES')
                });
            }
        }
    }
    
    const startedButNotCompleted = results.started.filter(p => !results.completed.includes(p));
    
    const conversionRate = results.started.length > 0 
        ? Math.round((results.completed.length / results.started.length) * 100) 
        : 0;
    
    const bookingRate = results.completed.length > 0 
        ? Math.round((results.booked.length / results.completed.length) * 100) 
        : 0;
    
    let reportHtml = `
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2c3e50;">📊 Reporte ${reportType === 'daily' ? 'Diario' : 'Semanal'} - Landing Diagnóstico</h1>
    <p style="color: #7f8c8d;">Período: ${startDate} al ${endDate}</p>
    
    <div style="background: #ecf0f1; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0;">🎯 Resumen Ejecutivo</h2>
        <table style="width: 100%;">
            <tr>
                <td style="padding: 8px 0;"><strong>Visitantes únicos:</strong></td>
                <td style="text-align: right; font-size: 24px; color: #3498db;">${results.viewLanding.length}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Iniciaron diagnóstico:</strong></td>
                <td style="text-align: right; font-size: 24px; color: #9b59b6;">${results.started.length}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Completaron diagnóstico:</strong></td>
                <td style="text-align: right; font-size: 24px; color: #27ae60;">${results.completed.length}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Abandonaron:</strong></td>
                <td style="text-align: right; font-size: 24px; color: #e74c3c;">${startedButNotCompleted.length}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Agendaron llamada:</strong></td>
                <td style="text-align: right; font-size: 24px; color: #f39c12;">${results.booked.length}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Descargaron informe:</strong></td>
                <td style="text-align: right; font-size: 24px; color: #1abc9c;">${results.downloaded.length}</td>
            </tr>
        </table>
    </div>
    
    <div style="background: #e8f8f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">📈 Tasas de Conversión</h3>
        <p><strong>Start-to-Complete:</strong> ${conversionRate}%</p>
        <p><strong>Complete-to-Booking:</strong> ${bookingRate}%</p>
    </div>
`;
    
    if (newLeads.length > 0) {
        reportHtml += `
    <div style="margin: 20px 0;">
        <h2>👤 Nuevos Leads (Iniciaron diagnóstico)</h2>
        <ul style="background: #fef9e7; padding: 15px 15px 15px 35px; border-radius: 8px;">
`;
        newLeads.forEach(lead => {
            reportHtml += `            <li><strong>${lead.name}</strong> - ${lead.email} <span style="color: #7f8c8d;">(${lead.date})</span></li>\n`;
        });
        reportHtml += `        </ul>
    </div>
`;
    }
    
    if (results.completed.length > 0) {
        reportHtml += `
    <div style="margin: 20px 0;">
        <h2>✅ Completaron Diagnóstico</h2>
        <ul style="background: #e8f8f5; padding: 15px 15px 15px 35px; border-radius: 8px;">
`;
        results.completed.forEach(p => {
            reportHtml += `            <li>${p}</li>\n`;
        });
        reportHtml += `        </ul>
    </div>
`;
    }
    
    if (results.booked.length > 0) {
        reportHtml += `
    <div style="margin: 20px 0;">
        <h2>📅 Agendaaron Llamada</h2>
        <ul style="background: #fdebd0; padding: 15px 15px 15px 35px; border-radius: 8px;">
`;
        results.booked.forEach(p => {
            reportHtml += `            <li>${p}</li>\n`;
        });
        reportHtml += `        </ul>
    </div>
`;
    }
    
    if (abandonos.length > 0) {
        const abandonosPorEtapa: Record<string, number> = {};
        abandonos.forEach(a => {
            abandonosPorEtapa[a.etapa] = (abandonosPorEtapa[a.etapa] || 0) + 1;
        });
        
        reportHtml += `
    <div style="margin: 20px 0;">
        <h2>⚠️ Análisis de Abandonos</h2>
        <div style="background: #fadbd8; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h3 style="margin-top: 0;">Distribución por etapa:</h3>
            <table style="width: 100%;">
`;
        Object.entries(abandonosPorEtapa).forEach(([etapa, count]) => {
            const porcentaje = Math.round((count / abandonos.length) * 100);
            reportHtml += `                <tr><td style="padding: 5px;">${etapa}</td><td style="text-align: right;"><strong>${count}</strong> (${porcentaje}%)</td></tr>\n`;
        });
        reportHtml += `            </table>
        </div>
        <h3 style="margin-top: 15px;">Detalle de abandonos:</h3>
        <ul style="background: #fef9e7; padding: 15px 15px 15px 35px; border-radius: 8px;">
`;
        abandonos.forEach(a => {
            reportHtml += `            <li><strong>${a.name}</strong> - ${a.email}<br><span style="color: #e74c3c;">Abandonó en: ${a.etapa}</span> <span style="color: #7f8c8d;">(${a.fecha})</span></li>\n`;
        });
        reportHtml += `        </ul>
    </div>
`;
    } else if (startedButNotCompleted.length > 0 && reportType === 'weekly') {
        reportHtml += `
    <div style="margin: 20px 0;">
        <h2>⚠️ Abandonos (Iniciaron pero no completaron)</h2>
        <ul style="background: #fadbd8; padding: 15px 15px 15px 35px; border-radius: 8px;">
`;
        startedButNotCompleted.forEach(p => {
            reportHtml += `            <li>${p}</li>\n`;
        });
        reportHtml += `        </ul>
    </div>
`;
    }
    
    reportHtml += `
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #bdc3c7; color: #7f8c8d; font-size: 12px;">
        <p>Reporte generado automáticamente por el Agente de Análisis de Landing</p>
    </div>
</body>
</html>`;
    
    return reportHtml;
}

function getDates(reportType: 'daily' | 'weekly'): { start: string; end: string } {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    if (reportType === 'daily') {
        return { start: today, end: today };
    } else {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { 
            start: weekAgo.toISOString().split('T')[0], 
            end: today 
        };
    }
}

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPORT_DIR = path.join(__dirname, 'reportes');

async function ensureReportDir() {
    if (!fs.existsSync(REPORT_DIR)) {
        fs.mkdirSync(REPORT_DIR, { recursive: true });
    }
}

async function saveReport(subject: string, body: string) {
    await ensureReportDir();
    
    const date = new Date().toISOString().split('T')[0];
    const type = subject.includes('Semanal') ? 'weekly' : 'daily';
    const filename = `reporte_${type}_${date}.html`;
    const filepath = path.join(REPORT_DIR, filename);
    
    fs.writeFileSync(filepath, body);
    console.log(`✅ Reporte guardado: ${filepath}`);
    return filepath;
}

async function main() {
    const args = process.argv.slice(2);
    const reportType = args[0] as 'daily' | 'weekly' || 'daily';
    
    console.log(`=== AGENTE DE REPORTES LANDING - ${reportType.toUpperCase()} ===\n`);
    
    const { start, end } = getDates(reportType);
    const reportHtml = await generateReport(start, end, reportType);
    
    const subject = reportType === 'daily' 
        ? `📊 Reporte Diario Landing - ${start}` 
        : `📊 Reporte Semanal Landing - Del ${start} al ${end}`;
    
    console.log('\nGuardando reporte...');
    
    await saveReport(subject, reportHtml);
}

main().catch(console.error);
