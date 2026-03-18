import posthog from 'posthog-js';
import { AnalyticsEvent } from "../types";

export { AnalyticsEvent };

// Initialize PostHog
if (typeof window !== 'undefined') {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY || 'phc_E4F5hozddDirA8xEjRhoT5gHOLcPT4pFymLcC0jAr2G', {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false // We use manual page view tracking via PageTracker
  });
}

// Helper to get UTMs from URL
export const getUTMs = () => {
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
    // timestamp is auto-handled by PostHog
    utms: getUTMs(),
    ...payload
  };

  // 1. Console Log (Development / Prototype)
  if (import.meta.env.DEV) {
    console.log(`[ANALYTICS] ${eventName}`, fullPayload);
  }

  // 2. PostHog
  posthog.capture(eventName, fullPayload);
};