# GEO Orchestrator (AEO + SEO)

Run the full SkillBoss AEO/SEO pipeline end-to-end.

## Pipeline
1. geo-setup
2. geo-researcher
3. geo-planner
4. geo-writer
5. geo-reviewer
6. publish + metrics update

## Weekly operating cycle
- Monday: research + planning
- Tuesday to Thursday: writing + review + publish
- Sunday: KPI review and next-cycle reprioritization

## KPI pack (weekly)
- Index coverage
- Impressions, clicks, CTR, avg position
- AI-referral traffic to `/use`, `/compare`, `/agents`
- Conversion from organic/agent traffic to signup/credits

## Automation hooks
- Use `scripts/seo-weekly-report.sh` for recurring report generation
- Add GSC/GA4 CSV exports to `reports/seo/input`

## Deliverable
`docs/aeo/weekly-summary.md` with:
- wins
- regressions
- pages to refresh
- next 10-page queue
