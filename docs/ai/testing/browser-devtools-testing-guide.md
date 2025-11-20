---
phase: testing
title: Browser DevTools Testing Guide
description: Quick reference for testing responsive design using browser DevTools
---

# Browser DevTools Testing Guide

## Quick Start

This guide helps you test responsive design features using browser DevTools without needing physical devices.

## Chrome DevTools

### Opening Device Toolbar

1. Open Chrome DevTools (F12 or Right-click → Inspect)
2. Click the device toolbar icon (Ctrl+Shift+M or Cmd+Shift+M)
3. Select a device preset or enter custom dimensions

### Recommended Viewport Sizes

#### Mobile

- **iPhone SE**: 375 x 667
- **iPhone 12/13**: 390 x 844
- **iPhone 14 Pro Max**: 428 x 926
- **Small Android**: 360 x 640
- **Medium Android**: 375 x 812
- **Large Android**: 428 x 926

#### Tablet

- **iPad Portrait**: 768 x 1024
- **iPad Landscape**: 1024 x 768
- **Android Tablet**: 800 x 1280

#### Desktop

- **Small Desktop**: 1024 x 768
- **Standard Desktop**: 1280 x 720
- **Large Desktop**: 1920 x 1080

### Testing Checklist

#### Mobile Viewport (375px - 428px)

- [ ] Sidebar is hidden by default
- [ ] Hamburger menu button is visible
- [ ] Sidebar drawer opens/closes
- [ ] Chat composer is full-width
- [ ] Message bubbles max-width is 85%
- [ ] All buttons are at least 44px tall
- [ ] Forms are full-width
- [ ] Text is readable without zooming

#### Tablet Viewport (768px - 1023px)

- [ ] Sidebar drawer/overlay works
- [ ] Chat composer has max-width 600px
- [ ] Message bubbles max-width is 70%
- [ ] Layout adapts appropriately
- [ ] Touch targets are accessible

#### Desktop Viewport (>= 1024px)

- [ ] Sidebar is persistent
- [ ] No hamburger menu
- [ ] Chat composer has max-width 600px
- [ ] Message bubbles max-width is 70%
- [ ] Layout is optimal

### Testing Orientation

1. Click the orientation icon in DevTools
2. Switch between portrait and landscape
3. Verify layout adapts correctly

### Testing Touch Simulation

1. Enable "Emulate touch events" in DevTools
2. Test touch interactions
3. Verify touch targets are accessible

## Firefox DevTools

### Responsive Design Mode

1. Open Firefox DevTools (F12)
2. Click the responsive design mode icon (Ctrl+Shift+M)
3. Select a device preset or enter custom dimensions

### Features

- Device presets (similar to Chrome)
- Custom viewport sizes
- Touch event simulation
- Network throttling

## Safari DevTools

### Responsive Design Mode

1. Enable Develop menu: Safari → Preferences → Advanced → "Show Develop menu"
2. Open Develop menu → Enter Responsive Design Mode
3. Select device or enter custom dimensions

### Features

- iOS device presets
- Custom viewport sizes
- User agent switching

## Edge DevTools

### Device Emulation

1. Open Edge DevTools (F12)
2. Click the device toolbar icon (Ctrl+Shift+M)
3. Similar to Chrome DevTools

## Testing Tips

### 1. Test All Breakpoints

Test at these specific breakpoints:

- **639px** (just below sm)
- **640px** (sm breakpoint)
- **767px** (just below md)
- **768px** (md breakpoint)
- **1023px** (just below lg)
- **1024px** (lg breakpoint)
- **1279px** (just below xl)
- **1280px** (xl breakpoint)

### 2. Test Edge Cases

- Minimum viewport width (320px)
- Maximum viewport width (1920px+)
- Very tall viewports (portrait phones)
- Very wide viewports (landscape tablets)

### 3. Test Interactions

- Click/tap all interactive elements
- Test form submissions
- Test navigation
- Test sidebar drawer
- Test scrolling

### 4. Test Performance

- Use Network throttling (3G, 4G)
- Check for layout shifts
- Monitor JavaScript execution
- Check CSS rendering

## Common Issues to Look For

### Layout Issues

- [ ] Horizontal scrolling (except intentional)
- [ ] Content cut off
- [ ] Overlapping elements
- [ ] Excessive white space
- [ ] Text overflow

### Interaction Issues

- [ ] Buttons too small to tap
- [ ] Links too close together
- [ ] Form inputs too small
- [ ] Dropdowns not accessible
- [ ] Modals not centered

### Typography Issues

- [ ] Text too small to read
- [ ] Text too large for viewport
- [ ] Line height too tight
- [ ] Text overflow without ellipsis

### Performance Issues

- [ ] Slow rendering
- [ ] Layout shifts
- [ ] Janky animations
- [ ] Slow scrolling

## Automated Testing

### Viewport Testing Script

You can use this in the browser console to test multiple viewports:

```javascript
const viewports = [
  { width: 375, height: 667, name: 'iPhone SE' },
  { width: 390, height: 844, name: 'iPhone 12/13' },
  { width: 428, height: 926, name: 'iPhone 14 Pro Max' },
  { width: 768, height: 1024, name: 'iPad Portrait' },
  { width: 1024, height: 768, name: 'iPad Landscape' },
  { width: 1280, height: 720, name: 'Desktop' },
]

viewports.forEach((vp, index) => {
  setTimeout(() => {
    console.log(`Testing ${vp.name} (${vp.width}x${vp.height})`)
    window.resizeTo(vp.width, vp.height)
  }, index * 2000)
})
```

## Reporting Issues

When you find an issue, document:

1. **Viewport size**: Width x Height
2. **Browser**: Chrome/Firefox/Safari/Edge
3. **OS**: Windows/macOS/Linux
4. **Description**: What's wrong
5. **Screenshot**: Visual evidence
6. **Steps to reproduce**: How to see the issue

## Next Steps

After DevTools testing:

1. Test on real devices (Task 5.1)
2. Run Lighthouse audits (Task 5.2)
3. Test accessibility (Task 5.3)
4. Fix any issues found (Task 5.4)
