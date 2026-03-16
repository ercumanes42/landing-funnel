
import axios from 'axios';
import * as fs from 'fs';

const POSTHOG_API_KEY = 'phx_YFEsBKwciR5uU76UU8F8kXlro5Mp7UzZCOqXSjwp2ZR0TII';
const POSTHOG_HOST = 'https://eu.posthog.com';
const PROJECT_ID = '122772';

const phClient = axios.create({
    baseURL: `${POSTHOG_HOST}/api/projects/${PROJECT_ID}`,
    headers: { 'Authorization': `Bearer ${POSTHOG_API_KEY}` }
});

async function fetchEvents(eventName: string, afterDate: string): Promise<string[]> {
    try {
        const url = `/events?event=${eventName}&after=${afterDate}&limit=100`;
        const response = await phClient.get(url);

        if (!response.data || !response.data.results) {
            return [];
        }

        const uniqueUsers = new Set(response.data.results.map((e: any) => e.distinct_id));
        return Array.from(uniqueUsers) as string[];
    } catch (error: any) {
        console.error(`Error fetching ${eventName}:`, error.message);
        return [];
    }
}

async function runAnalysis() {
    const output: string[] = [];

    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    const dateStr = fourDaysAgo.toISOString();

    output.push(`Periodo: ${fourDaysAgo.toLocaleDateString('es-ES')} - ${new Date().toLocaleDateString('es-ES')}`);
    output.push('');

    const landingUsers = await fetchEvents('view_landing', dateStr);
    const startUsers = await fetchEvents('click_start_survey', dateStr);
    const completeUsers = await fetchEvents('complete_survey', dateStr);
    const bookUsers = await fetchEvents('book_call_clicked', dateStr);

    const count1 = landingUsers.length;
    const count2 = startUsers.length;
    const count3 = completeUsers.length;
    const count4 = bookUsers.length;

    output.push('=== EMBUDO DE CONVERSIÓN (4 DÍAS) ===');
    output.push('');
    output.push(`1. Vistas Landing:       ${count1} usuarios únicos`);
    output.push(`2. Iniciaron Diagnóstico: ${count2} usuarios (${count1 ? ((count2 / count1) * 100).toFixed(1) : 0}% del total)`);
    output.push(`3. Completaron Encuesta:  ${count3} usuarios (${count2 ? ((count3 / count2) * 100).toFixed(1) : 0}% retención)`);
    output.push(`4. Clic en Agendar:       ${count4} usuarios (${count3 ? ((count4 / count3) * 100).toFixed(1) : 0}% conversión final)`);
    output.push('');
    output.push(`Conversión Total (Landing → Agendar): ${count1 ? ((count4 / count1) * 100).toFixed(1) : 0}%`);
    output.push('');

    // Análisis
    output.push('=== ANÁLISIS DE MARKETING ===');
    output.push('');

    if (count1 < 10) {
        output.push('⚠️ MUESTRA PEQUEÑA: Con menos de 10 visitas, los datos no son estadísticamente significativos.');
        output.push('   Prioridad: Aumentar tráfico antes de optimizar conversiones.');
    } else {
        // Landing → Start
        const rate1to2 = count2 / count1;
        if (rate1to2 < 0.20) {
            output.push('🔴 PROBLEMA EN LANDING: Solo ' + (rate1to2 * 100).toFixed(0) + '% inicia el diagnóstico.');
            output.push('   → Revisar propuesta de valor del Hero.');
            output.push('   → El CTA "Diagnosticar mi Organización" puede no ser suficientemente atractivo.');
            output.push('   → Considerar prueba A/B con texto más directo: "Ver mis 3 riesgos ocultos".');
        } else if (rate1to2 < 0.40) {
            output.push('🟡 LANDING MEJORABLE: ' + (rate1to2 * 100).toFixed(0) + '% inicia. Aceptable pero optimizable.');
        } else {
            output.push('🟢 LANDING EFECTIVA: ' + (rate1to2 * 100).toFixed(0) + '% inicia. Excelente engagement.');
        }
        output.push('');

        // Start → Complete
        const rate2to3 = count3 / count2;
        if (rate2to3 < 0.50) {
            output.push('🔴 ABANDONO EN ENCUESTA: Solo ' + (rate2to3 * 100).toFixed(0) + '% completa.');
            output.push('   → La encuesta puede ser demasiado larga o compleja.');
            output.push('   → Revisar si hay preguntas confusas o que generan fricción.');
            output.push('   → Considerar mostrar progreso más visible o reducir pasos.');
        } else if (rate2to3 < 0.75) {
            output.push('🟡 RETENCIÓN MEDIA: ' + (rate2to3 * 100).toFixed(0) + '% completa. Hay margen de mejora.');
        } else {
            output.push('🟢 BUENA RETENCIÓN: ' + (rate2to3 * 100).toFixed(0) + '% completa. El wizard funciona bien.');
        }
        output.push('');

        // Complete → Book
        const rate3to4 = count3 > 0 ? count4 / count3 : 0;
        if (rate3to4 < 0.15) {
            output.push('🔴 FALLO EN CIERRE: Solo ' + (rate3to4 * 100).toFixed(0) + '% agenda tras ver resultados.');
            output.push('   → El valor de la sesión gratuita no está claro.');
            output.push('   → Posible desconfianza o fricción en el paso de booking.');
            output.push('   → Considerar mostrar testimonios o garantías antes del CTA de agendar.');
        } else if (rate3to4 < 0.30) {
            output.push('🟡 CIERRE MEJORABLE: ' + (rate3to4 * 100).toFixed(0) + '% agenda. Aceptable para B2B.');
        } else {
            output.push('🟢 EXCELENTE CIERRE: ' + (rate3to4 * 100).toFixed(0) + '% agenda. El informe genera interés.');
        }
    }

    output.push('');
    output.push('=== FIN DEL REPORTE ===');

    // Write to file
    const report = output.join('\n');
    fs.writeFileSync('FUNNEL_REPORT.txt', report, 'utf8');
    console.log(report);
}

runAnalysis();
