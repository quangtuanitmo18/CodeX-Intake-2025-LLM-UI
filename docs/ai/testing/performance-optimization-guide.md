---
phase: testing
title: Performance Optimization Guide
description: Guide for optimizing performance for responsive design
---

# Performance Optimization Guide

## Overview

This guide outlines performance optimizations for the responsive design feature, focusing on mobile performance, image optimization, CSS optimization, and lazy loading.

## Task 5.2: Performance Optimization Checklist

### 1. Lighthouse Audits

#### Running Lighthouse Audits

**Chrome DevTools:**

1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Mobile" device
4. Check "Performance", "Accessibility", "Best Practices", "SEO"
5. Click "Analyze page load"

**Target Scores:**

- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

**Key Metrics to Monitor:**

- First Contentful Paint (FCP): < 2s (mobile 3G)
- Largest Contentful Paint (LCP): < 2.5s (mobile 3G)
- Time to Interactive (TTI): < 3.5s (mobile 3G)
- Cumulative Layout Shift (CLS): < 0.1
- Total Blocking Time (TBT): < 200ms
- Speed Index: < 3.4s (mobile 3G)

#### Pages to Audit

- [ ] Home/Login page
- [ ] Chat interface (main conversation page)
- [ ] Profile page
- [ ] Settings page
- [ ] Any other key pages

#### Recording Results

Document Lighthouse scores for each page:

- **Page:** **\*\***\_\_\_**\*\***
- **Date:** **\*\***\_\_\_**\*\***
- **Performance:** **\*\***\_\_\_**\*\***
- **Accessibility:** **\*\***\_\_\_**\*\***
- **Best Practices:** **\*\***\_\_\_**\*\***
- **SEO:** **\*\***\_\_\_**\*\***
- **FCP:** **\*\***\_\_\_**\*\***
- **LCP:** **\*\***\_\_\_**\*\***
- **TTI:** **\*\***\_\_\_**\*\***
- **CLS:** **\*\***\_\_\_**\*\***
- **TBT:** **\*\***\_\_\_**\*\***

### 2. Image Optimization

#### Current Image Setup

Next.js Image Optimization is already configured:

- ✅ `sharp` package installed (for image optimization)
- ✅ `images.remotePatterns` configured in `next.config.ts`
- ✅ Next.js Image component should be used for all images

#### Image Optimization Checklist

**Using Next.js Image Component:**

- [ ] All images use `next/image` instead of `<img>` tag
- [ ] Images have proper `width` and `height` attributes
- [ ] Images use `loading="lazy"` for below-the-fold images
- [ ] Images use appropriate `sizes` attribute for responsive images
- [ ] Images use `priority` for above-the-fold images only

**Image Formats:**

- [ ] Use WebP format when possible (Next.js handles this automatically)
- [ ] Provide fallback formats (JPEG/PNG) for older browsers
- [ ] Use appropriate image quality (75-85% for photos, 90-100% for graphics)

**Image Sizing:**

- [ ] Images are appropriately sized for their display size
- [ ] No images larger than 2x their display size (for retina)
- [ ] Use `srcset` for responsive images (Next.js handles this)

**Example Implementation:**

```tsx
import Image from 'next/image'

// Above the fold (priority loading)
<Image
  src="/hero-image.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>

// Below the fold (lazy loading)
<Image
  src="/content-image.jpg"
  alt="Content image"
  width={800}
  height={600}
  loading="lazy"
  sizes="(max-width: 768px) 100vw, 800px"
/>
```

#### Image Audit

**Check for:**

- [ ] Large image files (> 500KB)
- [ ] Images not using Next.js Image component
- [ ] Missing `alt` attributes
- [ ] Images without proper sizing
- [ ] Unoptimized images in public folder

**Files to Check:**

- `client/public/banner.png` - Check if optimized
- Any user-uploaded images (avatars, attachments)
- Any inline images in components

### 3. CSS Optimization

#### Tailwind CSS Optimization

**Current Setup:**

- ✅ Tailwind CSS is configured
- ✅ Using JIT (Just-In-Time) mode (default in Tailwind 3+)
- ✅ PurgeCSS is automatic (no unused CSS in production)

**Optimization Checklist:**

- [ ] No unused CSS classes (Tailwind handles this automatically)
- [ ] No duplicate CSS rules
- [ ] CSS is minified in production (Next.js handles this)
- [ ] Critical CSS is inlined (Next.js handles this)

**Media Query Optimization:**

- [ ] No unused media queries (Tailwind generates only used breakpoints)
- [ ] Media queries are properly ordered (mobile-first)
- [ ] No redundant media queries

**CSS File Size:**

- [ ] Check final CSS bundle size
- [ ] Target: < 50KB gzipped for initial CSS
- [ ] Use `ANALYZE=true npm run build` to check bundle size

#### Custom CSS Audit

**Check for:**

- [ ] Inline styles that could be Tailwind classes
- [ ] Unused CSS files
- [ ] Large CSS files that could be split
- [ ] CSS animations that could be optimized

### 4. Lazy Loading

#### Component Lazy Loading

**Below-the-Fold Components:**

- [ ] Sidebar drawer (lazy load on mobile when closed)
- [ ] Settings page components
- [ ] Profile page components
- [ ] Non-critical UI components

**Implementation Example:**

```tsx
import dynamic from 'next/dynamic'

// Lazy load heavy components
const SettingsPage = dynamic(() => import('@/components/settings/settings-page'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // Only if component doesn't need SSR
})
```

#### Code Splitting

**Check for:**

- [ ] Large dependencies that could be code-split
- [ ] Third-party libraries loaded on all pages
- [ ] Unused imports
- [ ] Large markdown/renderer libraries

**Libraries to Consider Lazy Loading:**

- `react-markdown` (if not always needed)
- `highlight.js` (for code blocks)
- `rehype-highlight` (for markdown code highlighting)

#### Image Lazy Loading

- [ ] All below-the-fold images use `loading="lazy"`
- [ ] Above-the-fold images use `priority` or no `loading` attribute
- [ ] Images in modals/drawers are lazy loaded

### 5. JavaScript Optimization

#### Bundle Size Optimization

**Check Bundle Size:**

```bash
ANALYZE=true npm run build
```

**Targets:**

- Initial JS bundle: < 200KB gzipped
- Total JS bundle: < 500KB gzipped

**Optimization Strategies:**

- [ ] Code split by route (Next.js handles this automatically)
- [ ] Lazy load heavy dependencies
- [ ] Remove unused dependencies
- [ ] Use tree-shaking (automatic with modern bundlers)

#### Third-Party Libraries

**Check for:**

- [ ] Large libraries that could be replaced
- [ ] Libraries loaded but not used
- [ ] Duplicate functionality across libraries

**Libraries to Review:**

- `highlight.js` - Consider lighter alternatives if possible
- `react-markdown` - Check if all features are needed
- `lucide-react` - Tree-shake unused icons

### 6. Font Optimization

#### Font Loading

**Check for:**

- [ ] Font files are optimized (woff2 format)
- [ ] Fonts are preloaded for critical text
- [ ] Font-display strategy is set (swap/optional/fallback)
- [ ] No unused font weights/styles

**Next.js Font Optimization:**

- [ ] Use `next/font` for custom fonts
- [ ] Use system fonts when possible
- [ ] Limit number of font families

### 7. Network Optimization

#### Resource Hints

**Preconnect/DNS-Prefetch:**

- [ ] Preconnect to external APIs
- [ ] DNS-prefetch for external resources
- [ ] Prefetch critical resources

**Implementation:**

```tsx
import Head from 'next/head'
;<Head>
  <link rel="preconnect" href="https://api.example.com" />
  <link rel="dns-prefetch" href="https://api.example.com" />
</Head>
```

#### API Optimization

- [ ] API responses are cached appropriately
- [ ] API calls are debounced/throttled
- [ ] Unnecessary API calls are avoided
- [ ] API responses are compressed (gzip/brotli)

### 8. Mobile-Specific Optimizations

#### Viewport Optimization

- [ ] Viewport meta tag is correct
- [ ] No horizontal scrolling
- [ ] Touch targets are properly sized
- [ ] Virtual keyboard handling is optimized

#### Mobile Performance

- [ ] Reduce JavaScript execution time
- [ ] Minimize main thread blocking
- [ ] Optimize animations (use CSS transforms)
- [ ] Reduce layout shifts

### 9. Caching Strategy

#### Static Assets

- [ ] Images are cached appropriately
- [ ] CSS/JS files are cached
- [ ] Cache headers are set correctly

#### API Caching

- [ ] API responses are cached when appropriate
- [ ] React Query cache is configured
- [ ] Stale-while-revalidate strategy is used

### 10. Monitoring & Measurement

#### Performance Monitoring

**Tools to Use:**

- Lighthouse (Chrome DevTools)
- WebPageTest
- Chrome Performance Profiler
- React DevTools Profiler

**Metrics to Track:**

- [ ] FCP (First Contentful Paint)
- [ ] LCP (Largest Contentful Paint)
- [ ] TTI (Time to Interactive)
- [ ] CLS (Cumulative Layout Shift)
- [ ] TBT (Total Blocking Time)
- [ ] Bundle sizes
- [ ] Network requests count

#### Continuous Monitoring

- [ ] Set up performance budgets
- [ ] Monitor performance in CI/CD
- [ ] Track performance over time
- [ ] Alert on performance regressions

## Implementation Checklist

### Immediate Actions

- [ ] Run Lighthouse audit on all key pages
- [ ] Check image optimization (use Next.js Image component)
- [ ] Verify CSS bundle size
- [ ] Check JavaScript bundle size
- [ ] Implement lazy loading for below-the-fold content
- [ ] Optimize font loading
- [ ] Add resource hints where needed

### Optimization Results

**Before Optimization:**

- Performance Score: **\*\***\_\_\_**\*\***
- FCP: **\*\***\_\_\_**\*\***
- LCP: **\*\***\_\_\_**\*\***
- TTI: **\*\***\_\_\_**\*\***
- CLS: **\*\***\_\_\_**\*\***
- Bundle Size: **\*\***\_\_\_**\*\***

**After Optimization:**

- Performance Score: **\*\***\_\_\_**\*\***
- FCP: **\*\***\_\_\_**\*\***
- LCP: **\*\***\_\_\_**\*\***
- TTI: **\*\***\_\_\_**\*\***
- CLS: **\*\***\_\_\_**\*\***
- Bundle Size: **\*\***\_\_\_**\*\***

## Next Steps

1. Run Lighthouse audits
2. Implement identified optimizations
3. Re-run audits to verify improvements
4. Document results
5. Set up continuous monitoring
