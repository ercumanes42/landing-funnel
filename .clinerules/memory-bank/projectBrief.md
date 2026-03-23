# Project Brief - Landing Funnel GFS Consulting

## Overview
This project is an automated email marketing funnel for GFS Consulting. It targets CEOs and HR managers in Spain.

## Optimized Flow (March 23, 2026)
Email frío → Landing (con animaciones) → Diagnóstico (3 preguntas iniciales para reducir fricción) → Resultados (Dashboard interactivo) → BookingPage (solo Calendly) → Informe por email (específico según decisión).

## Tech Stack & Logic
- **Scoring:** 5 dimensions (D1-D4 + T) with weighted averages.
- **Webhook Logic:** Consistent 4-status notification system:
  1. `Pending Booking`: Initial registration.
  2. `Sí, Confirmed Booking`: Meeting scheduled.
  3. `Downloaded Report`: PDF downloaded but no meeting.
  4. `Skipped`: Explicit "No thanks" clicked.
- **Reporting:** 
  - ALWAYS sent via email. 
  - Links use URL params (`?score=...&d1=...`) to allow viewing results on any device without local storage.
  - Parameter `&pdf=true` triggers automatic print dialog for one-click download.

## Business Context & Analysis
- **Visitors:** ~47 (Initial analyze)
- **Starts:** 13
- **Completed:** 2
- **Previous Issues:** 82% bounce in step 1.
- **Leads Target:** CEOs/HR of major Spanish companies.

## Current Goals
- [DONE] **UX/UI Overhaul:** Simplified first 3 steps to combat bounce rate.
- [DONE] **Email Automation:** Differentiated email bodies in Make.com.
- [DONE] **Landing Animations:** Fixed keyframes and delays in index.html.
- [NEXT] Monitor PostHog for improvements in conversion from Step 1.
