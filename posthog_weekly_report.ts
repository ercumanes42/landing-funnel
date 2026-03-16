import axios from 'axios';
import * as fs from 'fs';

const POSTHOG_API_KEY = 'phx_YFEsBKwciR5uU76UU8F8kXlro5Mp7UzZCOqXSjwp2ZR0TII';
const POSTHOG_HOST = 'https://eu.posthog.com';
const PROJECT_ID = '122772';

const phClient = axios.create({
    baseURL: `${POSTHOG_HOST}/api/projects/${PROJECT_ID}`,
    headers: { 'Authorization': `Bearer ${POSTHOG_API_KEY}` }
});

const DAYS = [
    { label: "Lun 2 Mar", after: "2026-03-02T00:00:00Z", before: "2026-03-02T23:59:59Z" },
    { label: "Mar 3 Mar", after: "2026-03-03T00:00:00Z", before: "2026-03-03T23:59:59Z" },
    { label: "Mié 4 Mar", after: "2026-03-04T00:00:00Z", before: "2026-03-04T23:59:59Z" },
    { label: "Jue 5 Mar", after: "2026-03-05T00:00:00Z", before: "2026-03-05T23:59:59Z" },
];

async function fetchEvents(eventName: string, after: string, before: string): Promise<any[]> {
    let all: any[] = [];
    let url = `/events?event=${eventName}&after=${after}&before=${before}&limit=500`;
    while (url) {
        try {
            const res = await phClient.get(url);
            if (res.data?.results) all = all.concat(res.data.results);
            if (res.data.next) {
                const nextUrl = new URL(res.data.next);
                url = nextUrl.pathname + nextUrl.search;
            } else url = "";
        } catch { break; }
    }
    return all;
}

async function getAllEvents(after: string, before: string): Promise<any[]> {
    let all: any[] = [];
    let url = `/events?after=${after}&before=${before}&limit=1000`;
    while (url) {
        try {
            const res = await phClient.get(url);
            if (res.data?.results) all = all.concat(res.data.results);
            if (res.data.next) {
                const nextUrl = new URL(res.data.next);
                url = nextUrl.pathname + nextUrl.search;
            } else url = "";
        } catch { break; }
    }
    return all;
}

interface DayStats {
    label: string;
    totalUsers: number;
    views: number;
    starts: number;
    completes: number;
    bookings: number;
    emails: number;
    pdfClicks: number;
    skipBookings: number;
    totalEvents: number;
    n1: number; n2: number; n3: number; n4: number;
    convLandingToStart: number;
    convStartToComplete: number;
    convCompleteToBook: number;
    leads: { email: string; name: string; company: string; score: any; booked: boolean }[];
    abandonSteps: Map<number, number>;
    referrers: Map<string, number>;
    browsers: Map<string, number>;
}

async function analyzeDay(day: typeof DAYS[0]): Promise<DayStats> {
    console.log(`  Procesando ${day.label}...`);

    const [views, starts, steps, completes, diagnostics, bookings, pdfClicks, emails, autoIds, skipBookings] = await Promise.all([
        fetchEvents('view_landing', day.after, day.before),
        fetchEvents('click_start_survey', day.after, day.before),
        fetchEvents('survey_step_viewed', day.after, day.before),
        fetchEvents('complete_survey', day.after, day.before),
        fetchEvents('diagnostic_complete', day.after, day.before),
        fetchEvents('book_call_clicked', day.after, day.before),
        fetchEvents('pdf_clicked', day.after, day.before),
        fetchEvents('email_captured', day.after, day.before),
        fetchEvents('auto_identified_from_email', day.after, day.before),
        fetchEvents('skip_booking', day.after, day.before),
    ]);

    const allEvents = await getAllEvents(day.after, day.before);

    // Build user map
    const usersMap = new Map<string, any>();
    const addUser = (e: any, field: string) => {
        const id = e.distinct_id;
        if (!usersMap.has(id)) {
            usersMap.set(id, {
                distinct_id: id, email: null, name: null, company: null,
                view_landing: false, click_start: false, completed: false, booked: false,
                steps_seen: new Set<number>(), globalScore: null,
                referrer: null, browser: null
            });
        }
        const u = usersMap.get(id)!;
        (u as any)[field] = true;
        const em = e.properties?.contact?.email || e.properties?.email || e.person?.properties?.email;
        const nm = e.properties?.contact?.name || e.person?.properties?.name;
        const co = e.properties?.contact?.company || e.person?.properties?.company;
        if (em) u.email = em;
        if (nm) u.name = nm;
        if (co) u.company = co;
        if (field === 'completed' && e.properties?.survey?.globalScore) u.globalScore = e.properties.survey.globalScore;
        if (e.properties?.$referrer && e.properties.$referrer !== '$direct') u.referrer = e.properties.$referrer;
        if (e.properties?.$browser) u.browser = e.properties.$browser;
    };

    views.forEach(e => addUser(e, 'view_landing'));
    starts.forEach(e => addUser(e, 'click_start'));
    completes.forEach(e => addUser(e, 'completed'));
    diagnostics.forEach(e => addUser(e, 'completed'));
    bookings.forEach(e => addUser(e, 'booked'));
    autoIds.forEach(e => addUser(e, 'view_landing'));

    steps.forEach(e => {
        const id = e.distinct_id;
        if (usersMap.has(id)) {
            const stepNum = e.properties?.step_number;
            if (stepNum) usersMap.get(id)!.steps_seen.add(stepNum);
        }
    });

    let n1 = 0, n2 = 0, n3 = 0, n4 = 0;
    const leads: DayStats['leads'] = [];
    const abandonSteps = new Map<number, number>();
    const referrers = new Map<string, number>();
    const browsers = new Map<string, number>();

    usersMap.forEach(u => {
        if (u.booked) n4++;
        else if (u.completed) n3++;
        else if (u.click_start) {
            n2++;
            const maxStep = u.steps_seen.size > 0 ? Math.max(...u.steps_seen) : 0;
            abandonSteps.set(maxStep, (abandonSteps.get(maxStep) || 0) + 1);
        }
        else if (u.view_landing) n1++;

        if (u.email && (u.completed || u.booked)) {
            leads.push({ email: u.email, name: u.name || '-', company: u.company || '-', score: u.globalScore || '-', booked: u.booked });
        }
        if (u.referrer) referrers.set(u.referrer, (referrers.get(u.referrer) || 0) + 1);
        if (u.browser) browsers.set(u.browser, (browsers.get(u.browser) || 0) + 1);
    });

    const totalFunnel = n1 + n2 + n3 + n4;
    const startedCount = n2 + n3 + n4;

    return {
        label: day.label,
        totalUsers: usersMap.size,
        views: views.length,
        starts: starts.length,
        completes: completes.length,
        bookings: bookings.length,
        emails: emails.length,
        pdfClicks: pdfClicks.length,
        skipBookings: skipBookings.length,
        totalEvents: allEvents.length,
        n1, n2, n3, n4,
        convLandingToStart: totalFunnel > 0 ? Math.round(startedCount / totalFunnel * 100) : 0,
        convStartToComplete: startedCount > 0 ? Math.round((n3 + n4) / startedCount * 100) : 0,
        convCompleteToBook: (n3 + n4) > 0 ? Math.round(n4 / (n3 + n4) * 100) : 0,
        leads,
        abandonSteps,
        referrers,
        browsers
    };
}

function trend(current: number, previous: number): string {
    if (previous === 0 && current === 0) return "→ 0";
    if (previous === 0) return `↑ nuevo`;
    const diff = ((current - previous) / previous * 100);
    if (diff > 0) return `↑ +${diff.toFixed(0)}%`;
    if (diff < 0) return `↓ ${diff.toFixed(0)}%`;
    return `→ igual`;
}

async function run() {
    console.log("📊 Generando informe semanal (2-5 Marzo 2026)...\n");

    const stats: DayStats[] = [];
    for (const day of DAYS) {
        stats.push(await analyzeDay(day));
    }

    // Totals
    const totalUsers = stats.reduce((a, s) => a + s.totalUsers, 0);
    const totalViews = stats.reduce((a, s) => a + s.views, 0);
    const totalStarts = stats.reduce((a, s) => a + s.starts, 0);
    const totalCompletes = stats.reduce((a, s) => a + s.completes, 0);
    const totalBookings = stats.reduce((a, s) => a + s.bookings, 0);
    const totalEvents = stats.reduce((a, s) => a + s.totalEvents, 0);
    const totalN1 = stats.reduce((a, s) => a + s.n1, 0);
    const totalN2 = stats.reduce((a, s) => a + s.n2, 0);
    const totalN3 = stats.reduce((a, s) => a + s.n3, 0);
    const totalN4 = stats.reduce((a, s) => a + s.n4, 0);

    // All leads
    const allLeads: DayStats['leads'] = [];
    stats.forEach(s => allLeads.push(...s.leads));

    // Unique leads by email
    const uniqueLeads = new Map<string, typeof allLeads[0]>();
    allLeads.forEach(l => { if (!uniqueLeads.has(l.email)) uniqueLeads.set(l.email, l); });

    // All referrers
    const allReferrers = new Map<string, number>();
    stats.forEach(s => s.referrers.forEach((v, k) => allReferrers.set(k, (allReferrers.get(k) || 0) + v)));

    // Output
    const output = JSON.stringify({ stats, totalUsers, totalViews, totalStarts, totalCompletes, totalBookings, totalEvents, totalN1, totalN2, totalN3, totalN4, uniqueLeads: Array.from(uniqueLeads.values()), referrers: Object.fromEntries(allReferrers) }, null, 2);

    fs.writeFileSync('c:\\Users\\JuanMartínezCarrillo\\Desktop\\TRABAJOS\\Landing Funnel\\weekly_data.json', output, 'utf-8');

    // Print summary
    console.log("\n╔══════════════════════════════════════════════════════════════╗");
    console.log("║  📊 INFORME SEMANAL - 2 al 5 de Marzo 2026                  ║");
    console.log("╚══════════════════════════════════════════════════════════════╝\n");

    console.log("📈 COMPARATIVA DIARIA:");
    console.log("─".repeat(80));
    console.log(`${"Métrica".padEnd(30)} | ${"Lun 2".padEnd(10)} | ${"Mar 3".padEnd(10)} | ${"Mié 4".padEnd(10)} | ${"Jue 5".padEnd(10)} | TOTAL`);
    console.log("─".repeat(80));
    console.log(`${"Usuarios únicos".padEnd(30)} | ${String(stats[0].totalUsers).padEnd(10)} | ${String(stats[1].totalUsers).padEnd(10)} | ${String(stats[2].totalUsers).padEnd(10)} | ${String(stats[3].totalUsers).padEnd(10)} | ${totalUsers}`);
    console.log(`${"Vistas landing".padEnd(30)} | ${String(stats[0].views).padEnd(10)} | ${String(stats[1].views).padEnd(10)} | ${String(stats[2].views).padEnd(10)} | ${String(stats[3].views).padEnd(10)} | ${totalViews}`);
    console.log(`${"Inicios encuesta".padEnd(30)} | ${String(stats[0].starts).padEnd(10)} | ${String(stats[1].starts).padEnd(10)} | ${String(stats[2].starts).padEnd(10)} | ${String(stats[3].starts).padEnd(10)} | ${totalStarts}`);
    console.log(`${"Completados".padEnd(30)} | ${String(stats[0].completes).padEnd(10)} | ${String(stats[1].completes).padEnd(10)} | ${String(stats[2].completes).padEnd(10)} | ${String(stats[3].completes).padEnd(10)} | ${totalCompletes}`);
    console.log(`${"Agendamientos".padEnd(30)} | ${String(stats[0].bookings).padEnd(10)} | ${String(stats[1].bookings).padEnd(10)} | ${String(stats[2].bookings).padEnd(10)} | ${String(stats[3].bookings).padEnd(10)} | ${totalBookings}`);
    console.log(`${"Eventos totales".padEnd(30)} | ${String(stats[0].totalEvents).padEnd(10)} | ${String(stats[1].totalEvents).padEnd(10)} | ${String(stats[2].totalEvents).padEnd(10)} | ${String(stats[3].totalEvents).padEnd(10)} | ${totalEvents}`);
    console.log("─".repeat(80));

    console.log(`\n📊 FUNNEL ACUMULADO SEMANAL:`);
    console.log(`  N1 (Solo vio landing):     ${totalN1}`);
    console.log(`  N2 (Inició y abandonó):    ${totalN2}`);
    console.log(`  N3 (Completó sin agendar): ${totalN3}`);
    console.log(`  N4 (Completó + Agendó):    ${totalN4}`);

    console.log(`\n📊 TASAS DE CONVERSIÓN DIARIAS:`);
    console.log("─".repeat(80));
    console.log(`${"Conversión".padEnd(30)} | ${"Lun 2".padEnd(10)} | ${"Mar 3".padEnd(10)} | ${"Mié 4".padEnd(10)} | ${"Jue 5".padEnd(10)}`);
    console.log("─".repeat(80));
    console.log(`${"Landing→Inicio".padEnd(30)} | ${(stats[0].convLandingToStart + '%').padEnd(10)} | ${(stats[1].convLandingToStart + '%').padEnd(10)} | ${(stats[2].convLandingToStart + '%').padEnd(10)} | ${(stats[3].convLandingToStart + '%').padEnd(10)}`);
    console.log(`${"Inicio→Completado".padEnd(30)} | ${(stats[0].convStartToComplete + '%').padEnd(10)} | ${(stats[1].convStartToComplete + '%').padEnd(10)} | ${(stats[2].convStartToComplete + '%').padEnd(10)} | ${(stats[3].convStartToComplete + '%').padEnd(10)}`);
    console.log(`${"Completado→Agenda".padEnd(30)} | ${(stats[0].convCompleteToBook + '%').padEnd(10)} | ${(stats[1].convCompleteToBook + '%').padEnd(10)} | ${(stats[2].convCompleteToBook + '%').padEnd(10)} | ${(stats[3].convCompleteToBook + '%').padEnd(10)}`);
    console.log("─".repeat(80));

    console.log(`\n📊 TENDENCIAS DÍA A DÍA:`);
    for (let i = 1; i < stats.length; i++) {
        console.log(`  ${stats[i - 1].label} → ${stats[i].label}:`);
        console.log(`    Usuarios: ${trend(stats[i].totalUsers, stats[i - 1].totalUsers)}`);
        console.log(`    Vistas:   ${trend(stats[i].views, stats[i - 1].views)}`);
        console.log(`    Inicios:  ${trend(stats[i].starts, stats[i - 1].starts)}`);
        console.log(`    Completados: ${trend(stats[i].completes, stats[i - 1].completes)}`);
    }

    console.log(`\n📧 LEADS ÚNICOS CAPTURADOS ESTA SEMANA:`);
    uniqueLeads.forEach(l => {
        console.log(`  📨 ${l.email} | 🏢 ${l.company} | 📊 ${l.score} | 📞 ${l.booked ? 'SÍ agendó' : 'NO agendó'}`);
    });

    console.log(`\n🌐 FUENTES DE TRÁFICO (referrers):`);
    Array.from(allReferrers.entries()).sort((a, b) => b[1] - a[1]).forEach(([ref, count]) => {
        console.log(`  ${ref.padEnd(50)} ${count} visitas`);
    });

    console.log("\n✅ Datos raw guardados en weekly_data.json");
}

run();
