---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup

**How do we get started?**

- **Prerequisites**:
  - Node.js and npm/yarn installed
  - Next.js development server running
  - Tailwind CSS already configured in the project
  - Browser dev tools for responsive testing
- **Environment Setup**:
  - No additional environment variables needed
  - Ensure Tailwind CSS is properly configured with breakpoints
- **Configuration**:
  - Verify `tailwind.config.ts` has correct breakpoint values
  - Check that PostCSS is configured correctly

## Code Structure

**How is the code organized?**

- **Directory Structure**:
  ```
  client/src/
  ├── hooks/
  │   ├── useViewport.ts (new)
  │   └── useBreakpoint.ts (new)
  ├── lib/
  │   └── responsive.ts (new)
  ├── components/
  │   ├── llm/ (modify existing)
  │   ├── forms/ (modify existing)
  │   └── ui/ (modify existing)
  └── app/ (modify existing pages)
  ```
- **Module Organization**:
  - Hooks in `hooks/` directory
  - Utilities in `lib/` directory
  - Component modifications in place (add responsive classes)
- **Naming Conventions**:
  - Hook files: `use*.ts`
  - Utility files: `*.ts` (kebab-case)
  - Components: PascalCase (existing convention)

## Implementation Notes

**Key technical details to remember:**

### Core Features

#### 1. Viewport Detection Hook

- **File**: `hooks/useViewport.ts`
- **Implementation Approach**:
  - Use `window.matchMedia()` for breakpoint detection
  - Use `useState` and `useEffect` to track window size
  - Debounce resize events to avoid excessive re-renders
  - Return viewport width, height, orientation, and device type flags
- **Example Usage**:
  ```typescript
  const { isMobile, isTablet, isDesktop, width } = useViewport()
  ```

#### 2. Breakpoint Hook

- **File**: `hooks/useBreakpoint.ts`
- **Implementation Approach**:
  - Use `window.matchMedia()` with Tailwind breakpoint values
  - Return boolean flags for each breakpoint (sm, md, lg, xl, 2xl)
  - Can be used for conditional rendering in components
- **Example Usage**:
  ```typescript
  const { isSm, isMd, isLg } = useBreakpoint()
  ```

#### 3. Responsive Utilities

- **File**: `lib/responsive.ts`
- **Implementation Approach**:
  - Export breakpoint constants matching Tailwind
  - Helper functions for generating responsive classes
  - Utility functions for responsive value selection

#### 4. Chat Interface Responsive

- **Components**: `llm-conversation-page.tsx`, `llm-chat-area.tsx`
- **Implementation Approach**:
  - Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) for layout changes
  - Mobile: Stack layout, full-width
  - Tablet: Overlay sidebar, full-width chat
  - Desktop: Side-by-side layout
  - Use flexbox/grid with responsive column counts
- **Key Classes**:
  - `flex flex-col md:flex-row` for layout direction
  - `w-full md:w-1/3 lg:w-1/4` for sidebar width
  - `p-4 md:p-6 lg:p-8` for responsive padding

#### 5. Chat Composer Responsive

- **Component**: `chat-composer.tsx`
- **Implementation Approach**:
  - Mobile: Full-width with reduced padding
  - Tablet+: Max-width with centering
  - Ensure textarea handles virtual keyboard properly
  - Touch-friendly button sizes (min 44x44px)
- **Key Classes**:
  - `w-full md:max-w-[600px] md:mx-auto`
  - `p-3 md:p-4`
  - `min-h-[44px]` for touch targets

#### 6. Message Bubbles Responsive

- **Component**: `message-bubble.tsx`
- **Implementation Approach**:
  - Responsive max-widths (85% mobile, 70% tablet+)
  - Responsive text sizes if needed
  - Adjust padding for mobile
- **Key Classes**:
  - `max-w-[85%] md:max-w-[70%]`
  - `text-sm md:text-base` (if needed)

#### 7. Sidebar/Drawer Pattern

- **Component**: New drawer component or modify existing sidebar
- **Implementation Approach**:
  - Mobile: Hidden by default, slide-in drawer
  - Use CSS transforms for slide animation
  - Overlay backdrop with click-to-close
  - Manage focus and keyboard navigation
- **Key Classes**:
  - `fixed inset-y-0 left-0 transform -translate-x-full md:translate-x-0`
  - `transition-transform duration-300`
  - `z-50` for overlay

### Patterns & Best Practices

- **Mobile-First CSS**: Write base styles for mobile, then add `md:`, `lg:` prefixes for larger screens
- **Utility-First**: Use Tailwind utility classes instead of custom CSS where possible
- **Touch Targets**: Always ensure interactive elements are at least 44x44px on mobile
- **Spacing**: Use responsive spacing utilities (`p-4 md:p-6`)
- **Typography**: Use responsive text sizes if needed (`text-sm md:text-base`)
- **Container Queries**: Consider using container queries for component-level responsive behavior (if browser support allows)

## Integration Points

**How do pieces connect?**

- **Hooks Integration**:
  - Import `useViewport` or `useBreakpoint` in components that need device detection
  - Use for conditional rendering or dynamic class application
- **Tailwind Integration**:
  - All responsive behavior uses Tailwind's responsive prefixes
  - No custom CSS media queries needed (unless for complex cases)
- **Component Integration**:
  - Modify existing components in place
  - Add responsive classes alongside existing classes
  - Maintain backward compatibility (desktop should still work)

## Error Handling

**How do we handle failures?**

- **Viewport Detection**:
  - Handle SSR case (Next.js) - return default values on server
  - Handle cases where `window` is undefined
  - Provide fallback values if matchMedia is not supported
- **Responsive Classes**:
  - Ensure fallback styles exist (mobile-first means base styles always work)
  - Test with JavaScript disabled to ensure CSS-only responsive behavior works
- **Component Rendering**:
  - Components should gracefully degrade if hooks fail
  - Use default mobile layout if viewport detection fails

## Performance Considerations

**How do we keep it fast?**

- **CSS Optimization**:
  - Tailwind's purge will remove unused classes
  - Avoid unnecessary media queries
  - Use `transform` and `opacity` for animations (GPU-accelerated)
- **JavaScript Optimization**:
  - Debounce resize event handlers
  - Use `useMemo` for expensive calculations in hooks
  - Lazy load components that are only needed on certain devices (if applicable)
- **Image Optimization**:
  - Use responsive images with `srcset` and `sizes`
  - Consider WebP format for better compression
  - Lazy load images below the fold
- **Bundle Size**:
  - Responsive classes don't add significant bundle size (Tailwind purges unused)
  - Hooks are lightweight (minimal JavaScript)

## Security Notes

**What security measures are in place?**

- **No Security Implications**: Responsive design is purely presentational
- **Client-Side Only**: All responsive behavior is client-side CSS/JavaScript
- **No User Data**: Viewport detection doesn't expose sensitive information
- **XSS Prevention**: Use Tailwind classes (sanitized) instead of inline styles with user input

## Testing Strategy

- **Unit Tests**: Test hooks (`useViewport`, `useBreakpoint`) with mocked window/matchMedia
- **Component Tests**: Test components render correctly at different breakpoints (use testing library's resize utilities)
- **Visual Regression**: Consider visual regression testing for different viewport sizes
- **Manual Testing**: Essential for responsive design - test on real devices

## Common Patterns

### Responsive Container

```tsx
<div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">{/* content */}</div>
```

### Responsive Flex Layout

```tsx
<div className="flex flex-col md:flex-row gap-4">
  <aside className="w-full md:w-1/3">Sidebar</aside>
  <main className="flex-1">Content</main>
</div>
```

### Responsive Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{/* items */}</div>
```

### Conditional Rendering Based on Viewport

```tsx
const { isMobile } = useViewport()

return <>{isMobile ? <MobileNav /> : <DesktopNav />}</>
```

### Responsive Classes with Conditional Logic

```tsx
const { isMobile } = useViewport()
const containerClass = isMobile ? 'w-full p-4' : 'max-w-4xl mx-auto p-6'

return <div className={containerClass}>Content</div>
```
