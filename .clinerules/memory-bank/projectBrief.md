# Project Brief - Landing Funnel GFS Consulting

## Overview
This project is an automated email marketing funnel for GFS Consulting. It targets CEOs and HR managers in Spain.

## Current Flow
Email frío → Landing → Diagnóstico (8 pasos) → BookingPage → Informe por email (siempre).

## Analysis (6-13 March 2026)
- **Visitors:** 47
- **Starts:** 13
- **Completed:** 2
- **Bounce Step 1:** 82%
- **Meeting Bookings:** 0%
- **High Quality Leads:** Heineken, El Corte Inglés, Balearia, ADIF, Banco Sabadell, Santander, Mango.

## Tech Stack & Logic
- **Scoring:** 5 dimensions (D1-D4 + T) with weighted averages.
- **Webhook:** Sends `globalScore`, `d1-d4-t`, `r1-r3`, `meetingOptIn` to Make.
- **Reporting:** Reports are ALWAYS sent via email, regardless of booking.

## Current Goals
- **UX/UI Overhaul:** Reducing friction in the diagnostic steps.
- **Improved Funnel Efficiency:** Targetting the 82% bounce rate in step 1.
