---
phase: planning
title: Project Planning & Task Breakdown
description: Message Translation & Validation Enhancement - Task breakdown and timeline
---

# Project Planning & Task Breakdown

## Milestones

**What are the major checkpoints?**

- [ ] Milestone 1: Server Message Translation Complete
  - All Vietnamese messages translated to English
  - Error handler messages standardized
- [ ] Milestone 2: Server Validation Messages Complete
  - All server-side Zod schemas have custom error messages
  - Validation messages are user-friendly and consistent

- [ ] Milestone 3: Client Validation Standardization Complete
  - Client-side validation schemas updated for consistency
  - Error handling verified and tested

## Task Breakdown

**What specific work needs to be done?**

### Phase 1: Server Message Translation

**Goal:** Translate all Vietnamese messages to English and standardize error handler messages

- [ ] Task 1.1: Translate Auth Hook Messages
  - Update `server/src/hooks/auth.hooks.ts`
  - Translate 3 Vietnamese messages to English
  - Verify error types and status codes remain correct
  - **Files:** `server/src/hooks/auth.hooks.ts`
  - **Estimate:** 15 minutes

- [ ] Task 1.2: Standardize Error Handler Messages
  - Update `server/src/plugins/errorHandler.plugins.ts`
  - Improve `EntityError` message from `'Error when authenticating...'` to `'Validation error occurred'`
  - Review all error handler messages for clarity
  - **Files:** `server/src/plugins/errorHandler.plugins.ts`
  - **Estimate:** 30 minutes

- [ ] Task 1.3: Review All Success Messages
  - Review all route handlers for success messages
  - Ensure consistency in success message format
  - Update any inconsistent messages
  - **Files:** `server/src/routes/*.route.ts`
  - **Estimate:** 30 minutes

### Phase 2: Server-Side Validation Messages

**Goal:** Add custom error messages to all server-side Zod validation schemas

- [ ] Task 2.1: Update Auth Schema Validation Messages
  - Update `server/src/schemaValidations/auth.schema.ts`
  - Add custom messages for email, password validation
  - Ensure messages are user-friendly
  - **Files:** `server/src/schemaValidations/auth.schema.ts`
  - **Estimate:** 30 minutes

- [ ] Task 2.2: Update Account Schema Validation Messages
  - Update `server/src/schemaValidations/account.schema.ts`
  - Add custom messages for name, email, password, confirmPassword
  - Ensure password matching messages are clear
  - **Files:** `server/src/schemaValidations/account.schema.ts`
  - **Estimate:** 45 minutes

- [ ] Task 2.3: Update Project Schema Validation Messages
  - Update `server/src/schemaValidations/project.schema.ts`
  - Add custom messages for name, description validation
  - Handle refine messages for update operations
  - **Files:** `server/src/schemaValidations/project.schema.ts`
  - **Estimate:** 30 minutes

- [ ] Task 2.4: Update Conversation Schema Validation Messages
  - Update `server/src/schemaValidations/conversation.schema.ts`
  - Add custom messages for title, model, projectId validation
  - **Files:** `server/src/schemaValidations/conversation.schema.ts`
  - **Estimate:** 30 minutes

- [ ] Task 2.5: Update Message Schema Validation Messages
  - Update `server/src/schemaValidations/message.schema.ts`
  - Add custom messages for content, attachments validation
  - Handle file size and type validation messages
  - **Files:** `server/src/schemaValidations/message.schema.ts`
  - **Estimate:** 45 minutes

- [ ] Task 2.6: Update Media Schema Validation Messages
  - Update `server/src/schemaValidations/media.schema.ts`
  - Add custom messages for file upload validation
  - **Files:** `server/src/schemaValidations/media.schema.ts`
  - **Estimate:** 20 minutes

- [ ] Task 2.7: Update LLM Schema Validation Messages
  - Update `server/src/schemaValidations/llm.schema.ts`
  - Add custom messages for prompt, conversationId validation
  - **Files:** `server/src/schemaValidations/llm.schema.ts`
  - **Estimate:** 20 minutes

### Phase 3: Client-Side Validation Standardization

**Goal:** Ensure client-side validation schemas are consistent and properly handle server errors

- [ ] Task 3.1: Standardize Client Auth Schema Messages
  - Update `client/src/schemaValidations/auth.schema.ts`
  - Ensure messages match server-side validation
  - Fix inconsistent message formats (e.g., `'required'`, `'invalidEmail'`, `'minmaxPassword'`)
  - **Files:** `client/src/schemaValidations/auth.schema.ts`
  - **Estimate:** 30 minutes

- [ ] Task 3.2: Standardize Client Account Schema Messages
  - Update `client/src/schemaValidations/account.schema.ts`
  - Ensure messages are user-friendly and match server
  - Standardize password matching messages
  - **Files:** `client/src/schemaValidations/account.schema.ts`
  - **Estimate:** 30 minutes

- [ ] Task 3.3: Review Other Client Schema Messages
  - Review `client/src/schemaValidations/conversation.schema.ts`
  - Review `client/src/schemaValidations/project.schema.ts`
  - Ensure all have consistent, user-friendly messages
  - **Files:** `client/src/schemaValidations/*.schema.ts`
  - **Estimate:** 30 minutes

- [ ] Task 3.4: Verify Error Handling Flow
  - Test `handleErrorApi` utility with all error types
  - Verify EntityError properly maps to form fields
  - Test form error display with updated validation
  - **Files:** `client/src/lib/utils.ts`, form components
  - **Estimate:** 45 minutes

### Phase 4: Testing & Verification

**Goal:** Ensure all changes work correctly and no regressions introduced

- [ ] Task 4.1: Server-Side Testing
  - Test all authentication flows (login, token refresh, logout)
  - Test form submission with validation errors
  - Verify all error messages are in English
  - Verify all success messages are consistent
  - **Estimate:** 1 hour

- [ ] Task 4.2: Client-Side Testing
  - Test all forms with client-side validation
  - Test server error response handling
  - Verify error messages display correctly
  - Test with invalid input scenarios
  - **Estimate:** 1 hour

- [ ] Task 4.3: End-to-End Testing
  - Test complete user flows (login, create project, send message, etc.)
  - Verify error messages appear correctly at each step
  - Test edge cases (network errors, multiple validation errors)
  - **Estimate:** 1 hour

## Dependencies

**What needs to happen in what order?**

### Task Dependencies

- Phase 1 must complete before Phase 2 (server message translation first)
- Phase 2 should complete before Phase 3 (server schemas inform client schemas)
- All phases must complete before Phase 4 (testing)

### External Dependencies

- None - all changes are internal

### Team/Resource Dependencies

- Developer with access to both server and client codebases
- Testing access to the application

## Timeline & Estimates

**When will things be done?**

### Phase 1: Server Message Translation

- **Estimated Time:** 1.25 hours
- **Critical Path:** Yes (blocks other phases)

### Phase 2: Server-Side Validation Messages

- **Estimated Time:** 3.5 hours
- **Can be parallelized:** Tasks 2.1-2.7 can be done in parallel

### Phase 3: Client-Side Validation Standardization

- **Estimated Time:** 2.25 hours
- **Dependencies:** Phase 2 completion recommended

### Phase 4: Testing & Verification

- **Estimated Time:** 3 hours
- **Dependencies:** Phases 1-3 complete

### Total Estimated Time

- **Minimum (sequential):** ~10 hours
- **With parallelization:** ~7-8 hours
- **Including buffer:** ~10-12 hours (1.5 days)

### Target Dates

- **Start:** Immediate
- **Phase 1 Complete:** Day 1 morning
- **Phase 2 Complete:** Day 1 afternoon
- **Phase 3 Complete:** Day 2 morning
- **Phase 4 Complete:** Day 2 afternoon
- **Feature Complete:** End of Day 2

## Risks & Mitigation

**What could go wrong?**

### Technical Risks

**Risk 1: Breaking existing error handling**

- **Probability:** Low
- **Impact:** High
- **Mitigation:**
  - Thorough testing of all error scenarios
  - Keep error response structure unchanged
  - Test client error handling after each phase

**Risk 2: Inconsistent message format**

- **Probability:** Medium
- **Impact:** Low (UX impact)
- **Mitigation:**
  - Define message format guidelines before starting
  - Review all messages together at end
  - Create examples for common patterns

**Risk 3: Missing some Vietnamese messages**

- **Probability:** Low
- **Impact:** Medium
- **Mitigation:**
  - Comprehensive code search for Vietnamese text
  - Review all error paths
  - Test all authentication flows

### Resource Risks

- **Risk:** Developer not familiar with all validation schemas
- **Probability:** Medium
- **Impact:** Low (extended timeline)
- **Mitigation:** Reference existing schemas, test thoroughly

### Dependency Risks

- **Risk:** None identified
- All dependencies are internal

## Resources Needed

**What do we need to succeed?**

### Team Members and Roles

- **Developer:** Full-stack developer familiar with:
  - TypeScript/JavaScript
  - Zod validation library
  - React Hook Form
  - Fastify error handling

### Tools and Services

- Code editor with search capabilities
- Testing environment (local dev)
- Browser dev tools for client testing

### Infrastructure

- No infrastructure changes needed

### Documentation/Knowledge

- Zod documentation for custom error messages
- Existing codebase patterns
- Error handling flow documentation
