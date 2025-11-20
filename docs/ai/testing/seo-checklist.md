---
title: SEO Checklist & How-To
description: Steps for adding/validating SEO metadata in CodeX LLM UI
---

## 1. Adding SEO to a New Page

1. **Inventory requirements**
   - Decide whether the page should be indexable (`noindex` for auth/private views).
   - Gather localized title/description copy (EN required, VI/RU optional).
2. **Update `src/seo/seo.config.ts`**
   - Add a new `SeoEntry` with slug, route, canonical path, localized fields, OG image reference, robots settings, and optional schema/sitemap hints.
   - If the page needs a unique OG card, add a preset in `app/og/[slug]/route.tsx`.
3. **Export metadata from the route**
   - Import `buildPageMetadata('<slug>')` and export `metadata` (or `generateMetadata` for dynamic routes).
   - For dynamic/param routes, ensure canonical points to the stable parent, or set `noindex`.

## 2. Verifying Metadata

1. Run the app locally (`npm run dev`).
2. Open the page source in the browser devtools:
   - Check `<title>`, `<meta name="description">`, `<link rel="canonical">`.
   - Inspect `<meta property="og:*">` and `<meta name="twitter:*">`.
   - Confirm `robots` tag matches strategy (e.g., `noindex, nofollow` for login/profile/settings).
3. Validate JSON-LD using https://validator.schema.org/ when schema is present.

## 3. Sitemaps & Robots

1. Visit `/sitemap.xml` locally; ensure the new route appears only if indexable.
2. Visit `/robots.txt`; confirm disallow rules cover private routes and reference the sitemap URL.

## 4. Social Preview Testing

1. Deploy to a preview/staging URL.
2. Use:
   - https://developers.facebook.com/tools/debug/
   - https://cards-dev.twitter.com/validator
3. Paste each public URL and verify the OG card renders correctly (title, description, image).

## 5. Automated Lighthouse Audit

1. From `client/`, run `npm run lint:seo`.
   - This builds the app, starts it on port `4173`, and runs Lighthouse CI against `/`, `/login`, `/llm`.
   - SEO score must be ≥ 0.9; performance ≥ 0.7; accessibility ≥ 0.8 (warnings only).
2. Reports are written to `client/.lhci-reports`.
3. For CI inclusion, call the same script in the pipeline before merging.

## 6. Manual QA Checklist

- [ ] View source for each target route, confirm metadata + canonical.
- [ ] Inspect `og` endpoints: open `/og/<slug>` in browser to verify card design.
- [ ] Re-run Lighthouse in Chrome devtools for mobile + desktop form factors.
- [ ] Confirm `NEXT_PUBLIC_SITE_URL` reflects the deployed domain (affects canonical URLs).
- [ ] After release, submit `sitemap.xml` to Google Search Console/Bing Webmaster (optional).

When all boxes are checked, mark Task 3.2/3.3 complete and attach Lighthouse/social validator screenshots in the PR description if required.
