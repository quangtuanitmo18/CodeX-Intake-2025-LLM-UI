---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
---

# Project Planning & Task Breakdown

## Milestones

**What are the major checkpoints?**

- [ ] Milestone 1: Centralize SEO config + metadata definitions
- [ ] Milestone 2: Generate sitemap/robots + OG assets
- [ ] Milestone 3: QA & automation (Lighthouse, docs)

## Task Breakdown

**What specific work needs to be done?**

### Phase 1: Foundation

- [x] Task 1.1: Inventory target pages + SEO requirements (home, login, LLM, profile, settings)
  - Home (`src/app/page.tsx`): No metadata export; needs localized title/description, canonical, OG/Twitter, structured data describing CodeX + CTA. Tie in new favicon/logo.
  - Login (`src/app/(auth)/login/page.tsx`): Minimal metadata; must add canonical, OG card, `robots` with `noindex`, ensure demo credentials not exposed beyond description.
  - LLM (`src/app/llm/page.tsx` + nested conversation/project routes): Title only; add description, canonical `/llm`, OG image, schema for chat UI; nested routes require canonical self-link or `noindex`.
  - Profile (`src/app/profile/page.tsx`) & Settings (`src/app/settings/page.tsx`): Auth-only; keep descriptive titles but include `noindex, nofollow`, canonical to avoid duplicates.
  - Global assets: Convert `public/codex-logo.svg` into favicon/app icons; ensure metadata references shared OG images once created.
- [x] Task 1.2: Create `seo.config.ts` with typed entries + helper `getSeoEntry`
  - Added `src/seo/types.ts` + `seo.config.ts` with localized metadata, OG placeholders, schema snippets, and helper utilities (`getSeoEntry`, `listSeoEntries`).
  - Helper resolves canonical URLs via `NEXT_PUBLIC_SITE_URL` fallback, enforces robots defaults, and throws on unknown slugs to catch regressions early.

### Phase 2: Core Features

- [x] Task 2.1: Update each route (`page.tsx`) to export metadata using config + OG assets
  - Added `src/seo/next-metadata.ts` helper to translate `SeoEntry` into Next.js `Metadata` (title, description, canonical, robots, OpenGraph, Twitter, JSON-LD).
  - Home, Login, LLM, conversation, project, profile, and settings routes now import the helper so metadata stays centralized.
  - Ensures `noindex` pages (login/profile/settings) emit correct robots tags; OG images resolve to absolute URLs.
- [x] Task 2.2: Implement `app/sitemap.ts` + `app/robots.ts` powered by config
  - Added App Router route handlers that import `listSeoEntries()` so sitemap + robots stay aligned with the SEO registry.
  - Sitemap filters `noindex` entries and carries per-page change freq/priority metadata; robots disallows private routes (login/profile/settings, conversation/project) and links to the generated sitemap.
- [x] Task 2.3: Add OG image assets (static or dynamic) referenced in metadata
  - Implemented dynamic OG generator at `app/og/[slug]/route.tsx` (Edge runtime) producing 1200×630 branded cards with title/subtitle per route.
  - Updated `seo.config.ts` to reference the new endpoints (`/og/<slug>`), so metadata always points to existing assets without storing binaries in repo.

### Phase 3: Integration & Polish

- [x] Task 3.1: Add automated Lighthouse SEO check (CI or `npm run lint:seo`)
  - Added `@lhci/cli` dev dependency plus `npm run lint:seo` script that runs `lhci autorun` with shared config.
  - Config lives in `docs/ai/testing/lhci.config.json` and runs against `/`, `/login`, `/llm` after building + starting Next.js on port 4173; enforces SEO ≥ 0.9.
- [x] Task 3.2: Document SEO checklist + how-to in repo docs
  - Added `docs/ai/testing/seo-checklist.md` covering: how to add new `SeoEntry`, verifying metadata/OG/sitemap, running validators, and executing the Lighthouse script.
- [ ] Task 3.3: Manual QA (social previews, validators) & sign-off

## Dependencies

**What needs to happen in what order?**

- Task dependencies and blockers
  - Task 1.1 precedes config creation and metadata updates.
  - OG asset design must complete before referencing in metadata.
- External dependencies (APIs, services, etc.)
  - Optional: Vercel OG generator or design team for images.
- Team/resource dependencies
  - Copy from marketing/product for titles/descriptions.
  - DevOps input if CI Lighthouse integration required.

## Timeline & Estimates

**When will things be done?**

- Phase 1: 0.5 day (inventory + config)
- Phase 2: 1.5 days (route updates, sitemap/robots, OG assets)
- Phase 3: 1 day (automation, QA, docs)
- Target completion: within current sprint (~3 days eng effort)
- Buffer: 0.5 day for copy/asset revisions

## Risks & Mitigation

**What could go wrong?**

- Technical risks
  - Missing metadata causes Lighthouse failures → add TypeScript types + CI check.
- Resource risks
  - Copy/asset delays → use placeholder text/OG and mark TODOs.
- Dependency risks
  - Search Console verification pending → track as follow-up ticket.
- Mitigation strategies
  - Early review of config by marketing.
  - Automate validations (lint/test) to block regressions.

## Resources Needed

**What do we need to succeed?**

- Team members and roles
  - Frontend engineer (implements metadata/config).
  - Designer/brand for OG images.
  - Marketing copywriter.
- Tools and services
  - Lighthouse CLI or PageSpeed Insights.
  - Social preview validators (Facebook, Twitter).
- Infrastructure
  - Existing Next.js build pipeline (no changes).
- Documentation/knowledge
  - Brand tone guidelines for copy.
  - List of target keywords/phrases.
