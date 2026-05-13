# GEO Reviewer (AEO + SEO)

Quality gate for AEO/SEO pages before publish.

## Scoring (100)
- Answer-first clarity: 20
- Intent match and usefulness: 20
- Schema correctness: 15
- Internal linking and crawlability: 15
- E-E-A-T signals and factuality: 15
- Conversion path clarity: 15

## Pass criteria
- Publish threshold: >= 85
- 70-84: rewrite required
- <70: redesign page structure

## Blocking checks
- Missing direct answer in intro
- Missing or malformed JSON-LD
- Missing CTA path to pricing/download
- Keyword stuffing or generic filler text

## Output
Write review notes to `docs/aeo/review-<slug>.md`.
