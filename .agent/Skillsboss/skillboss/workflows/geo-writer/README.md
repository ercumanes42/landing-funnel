# GEO Writer (AEO + SEO)

Produce publish-ready page content optimized for both AI extraction and search ranking.

## Writing standard (2026)
- Answer-first opening (40-80 words)
- One clear recommendation early
- Prompt-ready examples
- Concrete constraints and edge cases
- Source-backed stats (current year where possible)

## Page template
1. H1 with task intent
2. Direct answer paragraph
3. How-to steps
4. Practical examples/prompts
5. FAQ section
6. Internal links + conversion CTA

## Schema requirements
- Always: `SoftwareApplication` or `Article`
- Usually: `FAQPage`
- When procedural: `HowTo`
- Deep pages: `BreadcrumbList`

## Output
- Update Next.js page + metadata
- Ensure canonical and OpenGraph fields are present
- Ensure schema JSON-LD validates
