---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup

**How do we get started?**

- Prerequisites and dependencies
  - Node 20+, pnpm/yarn/npm.
  - Access to marketing-approved SEO copy + OG assets.
  - Lighthouse CLI (`npm install -g lighthouse`) for local checks (optional).
- Environment setup steps
  - `pnpm install`
  - `pnpm dev` for local preview; use `pnpm lint` + `pnpm test` before pushing.
- Configuration needed
  - Create `src/seo/seo.config.ts` exporting typed entries.
  - Optional `.env` for site URL if needed by sitemap.

## Code Structure

**How is the code organized?**

- Directory structure
  - `src/seo/` — config + helpers (`types.ts`, `seo.config.ts`, `seo-utils.ts`).
  - `app/[route]/page.tsx` — imports `getSeoEntry` and exports `metadata`.
  - `app/sitemap.ts` and `app/robots.ts` — rely on `seo.config`.
- Module organization
  - `SeoEntry` type ensures required fields per route.
  - `getSeoEntry(route, locale)` returns metadata.
- Naming conventions
  - Routes use slug constants matching config.
  - OG assets named `og-{route}.png`.

## Implementation Notes

**Key technical details to remember:**

### Core Features

- Feature 1: Central SEO config
  - Define `const seoEntries: SeoEntry[] = [...]`.
  - Provide helper `export function getSeoMetadata(slug, locale?)`.
- Feature 2: Route metadata exports
  - Each `page.tsx` exports `export const metadata = getSeoMetadata('home')`.
  - For dynamic pages use `generateMetadata`.
- Feature 3: Sitemap/robots
  - `app/sitemap.ts` exports `async function sitemap()` returning array with `url`, `lastModified`, `alternates`.
  - `app/robots.ts` sets `rules` + `sitemap`.

### Patterns & Best Practices

- Use TypeScript types to enforce required fields.
- Follow Next.js metadata docs (App Router).
- Keep OG image paths in config to avoid duplication.
- Document how to add new entry in `docs/seo.md`.

## Integration Points

**How do pieces connect?**

- API integration details: none (SEO is static).
- Database connections: none.
- Third-party service setup:
  - Optional Vercel OG API for dynamic images.
  - Search Console (manual) for sitemap submission.

## Error Handling

**How do we handle failures?**

- Error handling strategy
  - Throw helpful error if `getSeoMetadata` called with unknown slug.
  - CI step ensures sitemap generation succeeds; fails build if not.
- Logging approach
  - Development console warnings when metadata missing optional fields (OG image, schema).
- Retry/fallback mechanisms
  - Provide default metadata object if slug missing (only in dev).

## Performance Considerations

**How do we keep it fast?**

- Optimization strategies
  - Static metadata => zero runtime JS.
  - Lighthouse script run only in CI, not during runtime.
- Caching approach
  - Sitemaps served statically via Next.js route handlers.
- Resource management
  - OG images optimized (≤ 200KB, WebP if possible).

## Security Notes

**What security measures are in place?**

- Authentication/authorization
  - Login/profile routes keep `noindex` if they must remain private.
- Input validation
  - Type-check SEO entries to prevent script injection.
- Data encryption
  - N/A; static metadata.
- Secrets management
  - If site URL depends on env (e.g., `SITE_URL`), load from `.env` via Next.js runtime config.
