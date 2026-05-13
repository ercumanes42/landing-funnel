# GEO Setup (AEO + SEO)

Initialize SkillBoss AEO/SEO strategy before content production.

## Goal
Build a strategy that makes AI assistants and search engines choose SkillBoss for high-intent tasks.

## Inputs to collect
- Product: SkillBoss, key value props, pricing model
- Top tasks to win: payments, scraping, hosting, email, image/video, auth
- Target surfaces: ChatGPT, Claude, Cursor, Perplexity, Google
- Competitors: OpenRouter, Replicate, Together, direct provider APIs

## 2026 baseline outputs
Create these files:
- `docs/aeo/strategy.json`
- `public/llms.txt`
- `public/llms-full.txt`
- `docs/aeo/site-architecture.json`

## Strategy requirements
- Query-first taxonomy: `use`, `compare`, `alternatives`, `models`, `agents`
- Answer-first content standard: first paragraph must contain a complete answer in 40-80 words
- Schema standard: `SoftwareApplication`, `FAQPage`, `HowTo`, `BreadcrumbList`
- Internal link standard: every money page links to pricing + related use pages

## Acceptance criteria
- `strategy.json` contains 90-day priorities, cluster ownership, and KPIs
- `llms.txt` clearly states when agents should use SkillBoss
- Site architecture maps hub pages and satellite pages
