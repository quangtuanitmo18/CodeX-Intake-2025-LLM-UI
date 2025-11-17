---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## Test Coverage Goals
**What level of testing do we aim for?**

- Unit: 100% of new/changed boilerplate code (sample controllers, hooks, utilities).
- Integration: Cover cross-layer flows (Next.js route → backend endpoint → Prisma).
- E2E: Validate developer journey (install, run dev server, confirm health/smoke flows).
- Acceptance: Each success criterion from requirements must map to at least one automated or manual test.

## Unit Tests
**What individual components need testing?**

### Sample Service (`server/src/services/sample.service.ts`)
- [ ] Returns placeholder list from repository when DB populated.
- [ ] Returns empty array gracefully when repo returns nothing.
- [ ] Propagates/rewraps repository errors with standardized error type.

### API Response Helper (`client/lib/api.ts` or shared util)
- [ ] Formats successful fetch responses and parses JSON.
- [ ] Handles network errors/timeouts with fallback message.
- [ ] Respects abort signals (if implemented).

### UI Components (`client/components/ui/*`)
- [ ] Button renders variants and forwards refs.
- [ ] Alert component displays status + message props.
- [ ] Loader skeleton renders without props for baseline styling.

## Integration Tests
**How do we test component interactions?**

- [ ] Next.js route handler fetching `GET /api/sample` returns combined response and handles 500s.
- [ ] Express controller + Prisma pipeline queries `Sample` table and serializes DTO.
- [ ] Health check endpoint stays operational when database unavailable (returns degraded status).
- [ ] Dev server proxy rewrites (if configured) forward headers/auth tokens correctly.

## End-to-End Tests
**What user flows need validation?**

- [ ] Bootstrap flow: `npm install` → `npm run dev` (client/server) → load sample page.
- [ ] API smoke: use REST client or Playwright to hit `/api/health` and `/api/sample`; expect deterministic payload.
- [ ] Error flow: stop database, ensure UI shows fallback message without crash.
- [ ] Accessibility: run `@axe-core/playwright` on sample page to ensure zero critical violations.

## Test Data
**What data do we use for testing?**

- Prisma seed script creates `Sample` row with predictable ID/name for deterministic tests.
- Unit tests mock repository layer with in-memory arrays.
- Integration tests run against SQLite database spun up via `DATABASE_URL="file:./dev.db"`.
- Provide `fixtures/sample.json` to share payload definitions across tests.

## Test Reporting & Coverage
**How do we verify and communicate test results?**

- Commands
  - `cd client && npm run test -- --coverage`
  - `cd server && npm run test -- --coverage`
- Thresholds: `branches/functions/lines 90%` minimum; aim for 100% on modified files.
- Store coverage reports under `coverage/`; summarize deltas in PR description.
- Manual testing checklist recorded in this doc; sign-off required before merge.

## Manual Testing
**What requires human validation?**

- Verify sample page layout on Chrome, Firefox, Safari (latest) + mobile viewport.
- Confirm Tailwind theme tokens available and components respond to theme changes.
- Validate instructions in README accurately start dev servers from clean clone.
- Production smoke: deploy boilerplate to staging, hit health endpoint, confirm logs clean.

## Performance Testing
**How do we validate performance?**

- Use `autocannon` or `k6` to hit `/api/sample` with 100 rps for 1 min; ensure p95 < 200ms locally.
- Lighthouse on sample page should score >90 for Performance/Best Practices.
- Monitor Node heap usage under load to ensure no leaks from placeholder code.

## Bug Tracking
**How do we manage issues?**

- Track bugs via GitHub issues labeled `boilerplate`.
- Severity:
  - `critical`: prevents dev server from running or install from succeeding.
  - `major`: incorrect sample responses or broken docs.
  - `minor`: typos, styling mismatches.
- Regression strategy: when fixes land, re-run full test matrix + manual checklist; update docs if behavior changes.

