# GEO Researcher (AEO + SEO)

Research real user intents and agent-friendly query patterns.

## Research targets
- Conversational queries used in AI assistants
- Comparison intent (`X vs Y`)
- Implementation intent (`use X in Claude/Cursor`)
- Friction intent (`no API keys`, `one credit system`, `faster integration`)

## 2026 best-practice method
1. Mine high-intent query classes by task, not by feature.
2. Capture phrasing from forum and Q&A data (Reddit, docs comments, GitHub issues).
3. Map each query to content type and schema type.
4. Tag each query by: conversion intent, citation opportunity, and competitor weakness.

## Output
Write `docs/aeo/questions.json` with:
- `question`
- `intent`
- `target_page`
- `schema`
- `priority`
- `citation_needed`

## Quality bar
- At least 40 high-intent questions per weekly cycle
- Every question mapped to an existing or planned URL
