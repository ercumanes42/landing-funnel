# Tech Context - System Decisions & Architecture

## Core Tech Stack
-   **Frontend:** Vite + React + TypeScript + Vanilla CSS.
-   **Analytics:** PostHog (custom integration in `posthog_*.ts` scripts).
-   **Backend/Automation:** Make / Zapier (Blueprints shared in separate `.json` files).
-   **Vercel:** Hosting/Deploy (Keys in `CLAVES_VERCEL.md`).

## Memory System (Required)
This project uses **`agentMemory`** as a mandatory tool for session continuity. 

### Why?
To allow the agent to resume work after closing the IDE or PC without losing context about performance data, scoring logic, and UI decisions.

### Enforcement
-   **Storage:** Searchable JSON in `.agentMemory/`.
-   **Markdown:** Bi-directional sync in `.clinerules/memory-bank/`.
-   **Sync Trigger:** `npm run start-server` from `.agent/skills/agent-memory`.
