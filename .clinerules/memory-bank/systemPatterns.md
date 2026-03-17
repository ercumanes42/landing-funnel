# System Patterns - Design & Implementation Standards

## Memory-First Development (Project Policy)
1.  **Read Before Work:** Use `memory_search` or `memory_read` at session start.
2.  **Write After Significant Milestones:** Use `memory_write` to commit new knowledge (UI patterns, API fixes).
3.  **Sync:** Changes to these `.md` files in `memory-bank` will automatically sync to JSON storage.

## UI Styling (Premium Standard)
-   **CSS:** Vanilla CSS (no Tailwind unless requested).
-   **Components:** Functional React components in `./components`.
-   **Style:** Modern, premium aesthetic (glassmorphism, subtle gradients, micro-animations).

## Data Logic
-   **Scoring:** Weighted averages (5 dimensions: D1-D4 + T).
-   **Reports:** Always sent via email after diagnosis, regardless of booking.

## Analytics
-   **PostHog:** Scripts for data retrieval/analysis (`posthog_report_today.ts`, etc.).
-   **Naming:** Always use CamelCase for component files and snake_case for script utility files.
