import axios from 'axios';
import * as fs from 'fs';

const POSTHOG_API_KEY = 'phx_YFEsBKwciR5uU76UU8F8kXlro5Mp7UzZCOqXSjwp2ZR0TII';
const POSTHOG_HOST = 'https://eu.posthog.com';
const PROJECT_ID = '122772';

const phClient = axios.create({
    baseURL: `${POSTHOG_HOST}/api/projects/${PROJECT_ID}`,
    headers: { 'Authorization': `Bearer ${POSTHOG_API_KEY}` }
});

async function fetchDistinctEvents(eventName: string, afterDate: string, beforeDate: string): Promise<any[]> {
    try {
        const url = `/events?event=${eventName}&after=${afterDate}&before=${beforeDate}&limit=500`;
        const response = await phClient.get(url);

        if (!response.data || !response.data.results) {
            return [];
        }

        return response.data.results.map((e: any) => ({
            distinct_id: e.distinct_id,
            timestamp: e.timestamp,
            person: e.person?.properties?.email || e.person?.properties?.name || e.distinct_id
        }));
    } catch (error: any) {
        console.error(`Error fetching ${eventName}:`, error.message);
        return [];
    }
}

function processEvents(views: any[], starts: any[], completes: any[], bookings: any[], rawEmails: any[]) {
    const usersMap = new Map<string, any>();

    const addUserIfMissing = (u: any) => {
        if (!usersMap.has(u.person)) {
            usersMap.set(u.person, {
                id: u.person,
                view_landing: false,
                click_start: false,
                completed: false,
                booked: false,
                last_active: u.timestamp
            });
        }
    };

    views.forEach(v => { addUserIfMissing(v); usersMap.get(v.person).view_landing = true; usersMap.get(v.person).last_active = v.timestamp; });
    starts.forEach(v => { addUserIfMissing(v); usersMap.get(v.person).click_start = true; usersMap.get(v.person).last_active = v.timestamp; });
    completes.forEach(v => { addUserIfMissing(v); usersMap.get(v.person).completed = true; usersMap.get(v.person).last_active = v.timestamp; });
    bookings.forEach(v => { addUserIfMissing(v); usersMap.get(v.person).booked = true; usersMap.get(v.person).last_active = v.timestamp; });
    rawEmails.forEach(v => { addUserIfMissing(v); usersMap.get(v.person).last_active = v.timestamp; });

    const totalUsers = usersMap.size;
    let n1 = 0, n2 = 0, n3 = 0, n4 = 0;

    usersMap.forEach((u) => {
        if (u.view_landing && !u.click_start && !u.completed) {
            n1++;
        } else if (u.click_start && !u.completed) {
            n2++;
        } else if (u.completed && !u.booked) {
            n3++;
        } else if (u.booked) {
            n4++;
        }
    });

    return { totalUsers, n1, n2, n3, n4 };
}

async function getStatsForPeriod(afterDate: string, beforeDate: string) {
    const views = await fetchDistinctEvents('view_landing', afterDate, beforeDate);
    const starts = await fetchDistinctEvents('click_start_survey', afterDate, beforeDate);
    const completes = await fetchDistinctEvents('complete_survey', afterDate, beforeDate);
    const bookings = await fetchDistinctEvents('book_call_clicked', afterDate, beforeDate);
    const autoIdentified = await fetchDistinctEvents('auto_identified_from_email', afterDate, beforeDate);

    return processEvents(views, starts, completes, bookings, autoIdentified);
}

async function run() {
    console.log("=========================================");
    console.log("Extrayendo datos de ambos periodos...");

    const p1_after = "2026-02-25T00:00:00Z";
    const p1_before = "2026-02-27T23:59:59Z";
    const stats_p1 = await getStatsForPeriod(p1_after, p1_before);

    const p2_after = "2026-03-02T00:00:00Z";
    const p2_before = "2026-03-03T23:59:59Z";
    const stats_p2 = await getStatsForPeriod(p2_after, p2_before);

    const report = {
        periodo_1: {
            fechas: "25, 26 y 27 de febrero",
            datos: stats_p1,
            conversion_start: stats_p1.totalUsers ? ((stats_p1.n2 + stats_p1.n3 + stats_p1.n4) / stats_p1.totalUsers * 100).toFixed(2) + "%" : "0%",
            conversion_complete: stats_p1.totalUsers ? ((stats_p1.n3 + stats_p1.n4) / stats_p1.totalUsers * 100).toFixed(2) + "%" : "0%",
            conversion_booked: stats_p1.totalUsers ? ((stats_p1.n4) / stats_p1.totalUsers * 100).toFixed(2) + "%" : "0%",
        },
        periodo_2: {
            fechas: "2 y 3 de marzo",
            datos: stats_p2,
            conversion_start: stats_p2.totalUsers ? ((stats_p2.n2 + stats_p2.n3 + stats_p2.n4) / stats_p2.totalUsers * 100).toFixed(2) + "%" : "0%",
            conversion_complete: stats_p2.totalUsers ? ((stats_p2.n3 + stats_p2.n4) / stats_p2.totalUsers * 100).toFixed(2) + "%" : "0%",
            conversion_booked: stats_p2.totalUsers ? ((stats_p2.n4) / stats_p2.totalUsers * 100).toFixed(2) + "%" : "0%",
        }
    };

    fs.writeFileSync('posthog_comparison.json', JSON.stringify(report, null, 2), 'utf-8');
    console.log("¡Comparación guardada en posthog_comparison.json!");
}

run();
