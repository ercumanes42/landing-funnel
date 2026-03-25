# Claves para producción (Vercel)

Cuando entres en el proyecto en Vercel, ve a **Settings > Environment Variables** y añade estas tres:

1. **Key:** `VITE_POSTHOG_KEY`
   **Value:** `TU_NUEVA_CLAVE_DE_POSTHOG` (Genérala en PostHog)

2. **Key:** `VITE_POSTHOG_HOST`
   **Value:** `https://eu.i.posthog.com`

3. **Key:** `VITE_SKILLBOSS_API_KEY`
   **Value:** `TU_CLAVE_API_DE_SKILLBOSS`

---
*Después de añadirlas, tendrás que ir a la pestaña "Deployments" y darle a "Redeploy" para que surtan efecto.*
