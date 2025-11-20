---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## Test Coverage Goals

**What level of testing do we aim for?**

- Unit: 100% of new helpers (`getSeoMetadata`, sitemap builder).
- Integration: ensure every route metadata export matches config + renders OG tags.
- E2E: Lighthouse SEO ≥ 90 on key pages, social preview snapshots.
- Requirements alignment: each success criterion has at least one test or checklist item.

## Unit Tests

**What individual components need testing?**

### Component/Module 1 — `seo.config.ts`

- [ ] Test case 1: returns metadata for known slug.
- [ ] Test case 2: throws helpful error for unknown slug.
- [ ] Additional: localized entry fallback (e.g., VI defaulting to EN).

### Component/Module 2 — `sitemap.ts` / `robots.ts`

- [ ] Test case 1: sitemap includes all indexable entries.
- [ ] Test case 2: respects `noindex` by omitting entries.
- [ ] Additional: robots references sitemap URL.

## Integration Tests

**How do we test component interactions?**

- [ ] Integration scenario 1: render `/` and assert `<title>`, `<meta name="description">`, OG/Twitter tags.
- [ ] Integration scenario 2: render `/llm` and ensure canonical + schema JSON-LD injected.
- [ ] Integration scenario 3: login/profile routes set `robots` meta (noindex).
- [ ] Failure mode: missing OG asset should fail CI/Lighthouse.

## End-to-End Tests

**What user flows need validation?**

- [ ] User flow 1: Run Lighthouse SEO audit on Home page (score ≥ 90).
- [ ] User flow 2: Run Lighthouse on LLM page.
- [ ] Critical path: Validate sitemap.xml + robots via curl and XML schema.
- [ ] Regression: Social share preview using OG debugger/Twitter validator.

## Test Data

**What data do we use for testing?**

- Fixtures: sample SEO config entries.
- No DB needed; config-driven.
- OG images stored under `public/og/` for manual visual QA.

## Test Reporting & Coverage

**How do we verify and communicate test results?**

- `pnpm test seo` (Jest/Vitest) with coverage threshold 100% for seo modules.
- Lighthouse reports attached to PR (via GitHub Action artifact).
- Manual testing results recorded in PR description.

## Manual Testing

**What requires human validation?**

- Verify page source for each route (title, description, OG/Twitter, canonical).
- Run Facebook Sharing Debugger + Twitter Card Validator.
- Check localized copy appears correctly.
- Confirm no layout regressions from metadata changes.

## Performance Testing

**How do we validate performance?**

- Lighthouse Performance/SEO run in CI on key routes.
- Optionally use PageSpeed Insights for mobile vs desktop.
- Benchmark: SEO score ≥ 90, Performance no regression.

## Bug Tracking

**How do we manage issues?**

- Log issues in repo with `seo` label.
- Severity:
  - Critical: missing canonical, wrong robots directives.
  - High: incorrect OG causing broken social preview.
  - Medium: copy typos.
- Regression: add unit tests for any bug discovered; rerun Lighthouse after fix.
