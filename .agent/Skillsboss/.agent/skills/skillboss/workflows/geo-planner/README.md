# GEO Planner (AEO + SEO)

Turn research into a weekly production plan for SkillBoss.

## Planning model (weekly)
- 3 landing/use pages
- 2 comparison pages
- 2 alternatives pages
- 2 model pages refreshes
- 1 agents page update (`/agents/chatgpt`, `/agents/claude`, etc.)

## Prioritization formula
Priority = (Conversion intent * 0.4) + (AEO citation potential * 0.3) + (SEO volume * 0.2) + (Competitive gap * 0.1)

## Required planning fields
Each content item must include:
- slug
- title
- primary query
- direct-answer paragraph draft
- schema set
- internal links in/out
- CTA target (`/pricing`, `/download`, `/use`)

## Output
Write `docs/aeo/weekly-plan.json`.

## Constraints
- No orphan pages
- No page without explicit CTA
- No page without schema assignment
