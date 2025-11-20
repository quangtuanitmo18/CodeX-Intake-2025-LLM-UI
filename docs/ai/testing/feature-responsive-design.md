---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## Test Coverage Goals

**What level of testing do we aim for?**

- **Unit test coverage target**: 100% for new hooks (`useViewport`, `useBreakpoint`) and utility functions
- **Integration test scope**: Test component rendering at different breakpoints, responsive class application
- **End-to-end test scenarios**: Key user journeys on mobile, tablet, and desktop viewports
- **Visual regression testing**: Screenshot comparisons at different viewport sizes (optional but recommended)
- **Manual testing**: Essential for responsive design - must test on real devices

## Unit Tests

**What individual components need testing?**

### Hooks: `useViewport.ts`

- [ ] Test case 1: Returns correct viewport dimensions on mount
- [ ] Test case 2: Updates dimensions on window resize
- [ ] Test case 3: Correctly identifies mobile device (< 768px)
- [ ] Test case 4: Correctly identifies tablet device (768px - 1023px)
- [ ] Test case 5: Correctly identifies desktop device (>= 1024px)
- [ ] Test case 6: Detects orientation changes (portrait/landscape)
- [ ] Test case 7: Handles SSR case (returns default values when window is undefined)
- [ ] Test case 8: Debounces resize events correctly
- [ ] Additional coverage: Cleanup on unmount, multiple hook instances

### Hooks: `useBreakpoint.ts`

- [ ] Test case 1: Returns correct breakpoint flags for sm (640px)
- [ ] Test case 2: Returns correct breakpoint flags for md (768px)
- [ ] Test case 3: Returns correct breakpoint flags for lg (1024px)
- [ ] Test case 4: Returns correct breakpoint flags for xl (1280px)
- [ ] Test case 5: Returns correct breakpoint flags for 2xl (1536px)
- [ ] Test case 6: Updates breakpoint flags on window resize
- [ ] Test case 7: Handles SSR case (returns default values)
- [ ] Additional coverage: Edge cases at exact breakpoint boundaries

### Utilities: `lib/responsive.ts`

- [ ] Test case 1: Breakpoint constants match Tailwind defaults
- [ ] Test case 2: Helper functions return correct values
- [ ] Test case 3: Responsive class generation works correctly
- [ ] Additional coverage: Error handling for invalid inputs

### Components: Responsive Class Application

- [ ] Test case 1: `llm-conversation-page.tsx` applies correct classes at mobile breakpoint
- [ ] Test case 2: `llm-conversation-page.tsx` applies correct classes at tablet breakpoint
- [ ] Test case 3: `llm-conversation-page.tsx` applies correct classes at desktop breakpoint
- [ ] Test case 4: `chat-composer.tsx` has correct max-width and padding at each breakpoint
- [ ] Test case 5: `message-bubble.tsx` has correct max-width at each breakpoint
- [ ] Additional coverage: All modified components render without errors at all breakpoints

## Integration Tests

**How do we test component interactions?**

- [ ] Integration scenario 1: Sidebar drawer opens/closes correctly on mobile
- [ ] Integration scenario 2: Chat interface layout adapts when resizing browser window
- [ ] Integration scenario 3: Form inputs are accessible and usable on mobile
- [ ] Integration scenario 4: Navigation works correctly across all breakpoints
- [ ] Integration scenario 5: Message bubbles render correctly at different screen sizes
- [ ] Integration scenario 6: Chat composer handles virtual keyboard on mobile (viewport adjustment)
- [ ] Integration scenario 7: Touch targets are properly sized and spaced on mobile
- [ ] Failure mode: Test graceful degradation when JavaScript is disabled (CSS-only responsive should work)

## End-to-End Tests

**What user flows need validation?**

- [ ] User flow 1: Mobile user opens app, navigates to chat, sends message
  - Verify layout is mobile-optimized
  - Verify sidebar is accessible via drawer
  - Verify message sending works
  - Verify message display is readable
- [ ] User flow 2: Tablet user opens app, uses chat interface
  - Verify layout adapts to tablet size
  - Verify sidebar overlay works
  - Verify touch interactions work
- [ ] User flow 3: Desktop user verifies existing functionality still works
  - Verify no regression in desktop experience
  - Verify all features work as before
- [ ] User flow 4: User rotates device from portrait to landscape
  - Verify layout adapts smoothly
  - Verify no content is cut off
  - Verify interactive elements remain accessible
- [ ] Critical path testing: Complete conversation flow on mobile device
- [ ] Regression testing: Verify adjacent features (auth, profile, settings) still work on all devices

## Test Data

**What data do we use for testing?**

- **Viewport Sizes** (for automated testing):
  - Mobile: 375px (iPhone SE), 390px (iPhone 12/13), 428px (iPhone 14 Pro Max)
  - Tablet: 768px (iPad portrait), 1024px (iPad landscape)
  - Desktop: 1280px, 1440px, 1920px
- **Test Fixtures**:
  - Mock window.matchMedia for unit tests
  - Mock window resize events
  - Sample conversation data for component testing
- **Real Device Testing**:
  - iOS devices: iPhone SE, iPhone 12/13/14, iPad
  - Android devices: Various screen sizes (small, medium, large)
  - Desktop browsers: Chrome, Firefox, Safari, Edge

## Test Reporting & Coverage

**How do we verify and communicate test results?**

- **Coverage Commands**:
  - `npm run test -- --coverage` to generate coverage report
  - Target: 100% coverage for new hooks and utilities
  - Component tests: Aim for 80%+ coverage of responsive logic
- **Coverage Gaps**:
  - Document any files/functions below 100% and rationale
  - Visual/manual testing cannot be automated, document manual test results
- **Test Reports**:
  - Unit test results: Jest coverage report
  - Integration test results: Test output logs
  - Manual test results: Document in testing checklist
- **Manual Testing Outcomes**:
  - Create checklist document with test results
  - Include screenshots of different viewport sizes
  - Document any issues found and resolutions

## Manual Testing

**What requires human validation?**

### UI/UX Testing Checklist

#### Mobile (< 768px)

- [ ] All text is readable without zooming
- [ ] No horizontal scrolling (except intentional scrollable areas)
- [ ] Touch targets are at least 44x44px
- [ ] Buttons and links are easy to tap
- [ ] Forms are usable (inputs are large enough, labels visible)
- [ ] Chat interface is fully functional
- [ ] Sidebar/drawer opens and closes smoothly
- [ ] Virtual keyboard doesn't cover important content
- [ ] Animations and transitions are smooth
- [ ] Loading states are visible and clear

#### Tablet (768px - 1023px)

- [ ] Layout makes good use of screen space
- [ ] Sidebar overlay works correctly
- [ ] Touch interactions work well
- [ ] Text and UI elements are appropriately sized
- [ ] Both portrait and landscape orientations work

#### Desktop (>= 1024px)

- [ ] No regression from existing desktop experience
- [ ] All features work as before
- [ ] Layout is optimal for larger screens
- [ ] Mouse interactions work correctly

### Browser/Device Compatibility

- [ ] iOS Safari (latest 2 versions)
- [ ] Chrome Android (latest 2 versions)
- [ ] Samsung Internet
- [ ] Chrome Desktop
- [ ] Firefox Desktop
- [ ] Safari Desktop
- [ ] Edge Desktop

### Accessibility Testing

- [ ] Screen reader compatibility on mobile (VoiceOver iOS, TalkBack Android)
- [ ] Keyboard navigation works on all screen sizes
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA standards on all devices
- [ ] Touch targets meet accessibility guidelines

### Orientation Testing

- [ ] Portrait mode works correctly
- [ ] Landscape mode works correctly
- [ ] Rotation transitions are smooth
- [ ] No content is cut off in either orientation

### Performance Testing

- [ ] Lighthouse mobile score > 90
- [ ] First Contentful Paint < 2s on 3G
- [ ] Time to Interactive < 3.5s on 3G
- [ ] No layout shifts (CLS < 0.1)
- [ ] Smooth scrolling (60fps)

## Performance Testing

**How do we validate performance?**

- **Load Testing Scenarios**:
  - Test page load on 3G connection (mobile)
  - Test page load on 4G connection (mobile)
  - Test page load on WiFi (all devices)
- **Stress Testing Approach**:
  - Test with many messages in chat (scroll performance)
  - Test with long conversation lists
  - Test with large images/media
- **Performance Benchmarks**:
  - Lighthouse Performance Score: > 90 (mobile)
  - First Contentful Paint: < 2s (mobile 3G)
  - Largest Contentful Paint: < 2.5s (mobile 3G)
  - Time to Interactive: < 3.5s (mobile 3G)
  - Cumulative Layout Shift: < 0.1
  - Total Blocking Time: < 200ms

## Bug Tracking

**How do we manage issues?**

- **Issue Tracking Process**:
  - Create GitHub issues for each bug found during testing
  - Tag with `responsive-design` and device type (mobile/tablet/desktop)
  - Include screenshots and device/browser information
- **Bug Severity Levels**:
  - **Critical**: App unusable on device (blocking)
  - **High**: Major feature broken on device
  - **Medium**: Minor feature broken or poor UX
  - **Low**: Cosmetic issues or minor improvements
- **Regression Testing Strategy**:
  - Re-test fixed bugs on the device where they were found
  - Test on other devices to ensure fix doesn't break anything
  - Add automated tests for bugs that can be caught programmatically

## Testing Checklist Summary

### Pre-Release Checklist

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Manual testing completed on iOS devices
- [ ] Manual testing completed on Android devices
- [ ] Manual testing completed on desktop browsers
- [ ] Performance benchmarks met (Lighthouse scores)
- [ ] Accessibility testing completed
- [ ] No critical or high-severity bugs open
- [ ] Documentation updated with any known limitations
- [ ] Screenshots/videos of responsive behavior captured
