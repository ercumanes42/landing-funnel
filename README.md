# RADAR TALENTO+IA 2026 - Implementation Guide

## 1. Configuration (`constants.ts`)
*   **Calendly:** Update `CALENDLY_URL` with your actual booking link.
*   **Endpoint:** Update `POST_ENDPOINT_URL` if you have a backend to receive leads (Zapier webhook, standard API).
*   **Privacy:** Update `PRIVACY_POLICY_URL` links.
*   **Texts:** All copy for questions and quick wins is stored in `constants.ts`.

## 2. Analytics (`utils/analytics.ts`)
The app tracks events to `console.log` by default.
*   To enable Google Analytics 4 (GA4) or Google Tag Manager (GTM):
    1. Add your GTM/GA4 script snippet to the `<head>` in `index.html`.
    2. The code automatically pushes to `window.dataLayer`. Ensure your GTM triggers are set up for custom events like `complete_survey` or `email_captured`.

## 3. Styling (`tailwind.config` in index.html)
*   The colors are defined in the script tag in `index.html`. Change `accent1` (Teal) and `accent2` (Violet) to match your brand.

## 4. Deployment
*   This is a client-side Single Page Application (SPA).
*   You can host it on Netlify, Vercel, GitHub Pages, or AWS S3.
*   **Important:** Since it uses `HashRouter` (`/#/radar`), it works on static hosting without server-side redirect configuration.

## 5. GDPR Compliance
*   The wizard requires an explicit checkbox for consent in Step 1.
*   Data is stored in `localStorage` for user convenience (persistence on refresh).
*   Ensure your Privacy Policy URL is valid.

## 6. Testing
*   Open `index.html` (after building) or run in dev mode.
*   Verify UTM parameters are captured (e.g., open `?utm_source=linkedin`).
*   Check the PDF generation by clicking "Descargar PDF" (uses CSS `@media print`).