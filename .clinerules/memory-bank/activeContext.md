# Active Context - Current Task & State

## Current Focus
We are implementing the **`agentMemory`** system to ensure persistence across sessions.

## What we have done so far
1.  **Skill Discovery:** Found `agent-memory-mcp` in the skill generator.
2.  **Configuration:** Reproduced the skill inside `.agent/skills/agent-memory` of this project.
3.  **Windows Fixes:** Patched `SocketBridge` to support named pipes on Windows and handled path encoding.
4.  **Base Context:** Created a `projectBrief.md` with the current funnel logic (8-step diagnosis, PostHog analysis, scoring weights).
5.  **Initialization:** Ran `tools.project_init` which created the storage and the `.agent/workflows/update-memory.md` workflow.
6.  **Sync:** Performed the first sync, converting markdown files into searchable JSON in `.agentMemory/`.

## Remaining Sub-tasks
-   [ ] Verify `memory_search` works within the MCP context (verified via manual sync).
-   [ ] Finalize the "Continuity" state for the user to close and reopen the project.

## How to Resume
At the start of the next session, the agent should:
1.  Read `.agent-context.json` and `.clinerules/memory-bank/*.md`.
2.  Run `memory_search({ "query": "activeContext" })` to see what was the last focus.
