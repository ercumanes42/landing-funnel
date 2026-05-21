import posthog from 'posthog-js';
import { AnalyticsEvent } from "../types";

export { AnalyticsEvent };

const FUNNEL_ID = 'fuga_talento';
const FUNNEL_VERSION = '2026_05_talento_v2';
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com';

const getRoute = () => {
  if (typeof window === 'undefined') return '';
  return window.location.hash.replace('#', '') || window.location.pathname || '/';
};

const getSafeUrl = () => {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  url.searchParams.delete('email');
  return url.toString();
};

if (typeof window !== 'undefined') {
  if (POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: false,
      autocapture: false,
      loaded: (ph) => {
        ph.register({
          funnel_id: FUNNEL_ID,
          funnel_version: FUNNEL_VERSION,
          app_host: window.location.host
        });
      }
    });
  } else {
    console.warn("PostHog: VITE_POSTHOG_KEY missing. Analytics disabled.");
  }
}

export const getUTMs = () => {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const utms: Record<string, string> = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
    const val = params.get(key);
    if (val) utms[key] = val;
  });
  return utms;
};

export const logEvent = (eventName: AnalyticsEvent, payload: Record<string, any> = {}) => {
  const fullPayload = {
    funnel_id: FUNNEL_ID,
    funnel_version: FUNNEL_VERSION,
    route: getRoute(),
    path: typeof window !== 'undefined' ? window.location.pathname : '',
    safe_url: getSafeUrl(),
    app_host: typeof window !== 'undefined' ? window.location.host : '',
    utms: getUTMs(),
    ...payload
  };

  if (import.meta.env.DEV) {
    console.log(`[ANALYTICS] ${eventName}`, fullPayload);
  }

  if (POSTHOG_KEY) {
    posthog.capture(eventName, fullPayload);
  }
};

export const identifyLead = (email: string, properties: Record<string, any> = {}) => {
  if (!POSTHOG_KEY || !email.includes('@')) return;

  posthog.identify(email, {
    email,
    funnel_id: FUNNEL_ID,
    funnel_version: FUNNEL_VERSION,
    ...properties
  });
};

export const buildResultAnalyticsPayload = (results: {
  globalScore: number;
  rawTotal?: number;
  maxRawTotal?: number;
  answeredCount?: number;
  riskPercent?: number;
  dimensionScores: Array<{ id: string; label: string; score: number }>;
  topRisks: Array<{ dimension: string; score: number }>;
}) => {
  const mainRisk = results.topRisks[0];
  const mainRiskLabel = results.dimensionScores.find(d => d.id === mainRisk?.dimension)?.label || "";

  return {
    global_score: results.globalScore,
    raw_total: results.rawTotal,
    max_raw_total: results.maxRawTotal,
    answered_count: results.answeredCount,
    risk_percent: results.riskPercent,
    main_risk_id: mainRisk?.dimension || "",
    main_risk_label: mainRiskLabel,
    d1_score: results.dimensionScores.find(d => d.id === "D1")?.score,
    d2_score: results.dimensionScores.find(d => d.id === "D2")?.score,
    d3_score: results.dimensionScores.find(d => d.id === "D3")?.score,
    d4_score: results.dimensionScores.find(d => d.id === "D4")?.score,
    t_score: results.dimensionScores.find(d => d.id === "T")?.score,
    top_risks: results.topRisks.map(r => r.dimension)
  };
};
