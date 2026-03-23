# Active Context - Current Task & State

## Current Focus
Monitoring the new 3-question funnel and email automation flow.

## What we have done so far
1.  **Survey Strategy:** Wizard starts with **3 questions** (Clima/Retención) to reduce Step 1 bounce.
2.  **Booking UX:** Simplified `BookingPage.tsx` to remove summary redundancy.
3.  **Webhook statuses:** Implemented logic for `Pending`, `Confirmed`, `Downloaded`, and `Skipped`.
4.  **Landing Animations:** Added missing Tailwind keyframes and delays in `index.html`.
5.  **Reports Persistence:** Dashboard now reconstructs state from URL params for cross-device visibility.
6.  **Internal Analysis:** Updated Internal Alert email with `pain_points_txt` and scoring labels.

## Current State
- Deployed and pushed to `main` branch.
- Automated email flow in Make.com is ready for filter updates matching new statuses.
- PDF generation is integrated via URL parameters.

## Remaining Sub-tasks
- [ ] Monitor PostHog metrics for the new "3-question" funnel.
- [ ] Verify Make.com filters match the new `Sí, Confirmed Booking` label.

## How to Resume
At the start of the next session, the agent should:
1.  Read `.agent-context.json` and `.clinerules/memory-bank/*.md`.
2.  Run `memory_search({ "query": "activeContext" })` to see what was the last focus.
