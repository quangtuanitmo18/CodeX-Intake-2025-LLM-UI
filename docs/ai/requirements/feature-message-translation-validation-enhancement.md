---
phase: requirements
title: Requirements & Problem Understanding
description: Message Translation & Validation Enhancement - Translate all server messages to English and standardize validation handling
---

# Requirements & Problem Understanding

## Problem Statement

**What problem are we solving?**

- Server returns Vietnamese error messages in authentication hooks, breaking consistency with the rest of the application which uses English
- Validation error messages lack consistency between server-side and client-side schemas
- Client-side form validation and server error response handling need standardization to ensure proper error display
- Users experience inconsistent error messages, some in Vietnamese and some in English
- Validation messages from Zod schemas use default messages which may not be user-friendly or consistent

**Who is affected by this problem?**

- End users who see mixed-language error messages
- Developers who need to maintain consistent error handling patterns
- International users who expect English error messages

**What is the current situation/workaround?**

### Current State Audit

- **Vietnamese messages:** 3 messages in `server/src/hooks/auth.hooks.ts`:
  - `'Không nhận được access token'` (Access token not received)
  - `'Access token không hợp lệ'` (Invalid access token)
  - `'Bạn không có quyền truy cập'` (You do not have permission to access this resource)
- **Error handler plugin:** Generic messages like `'Error when authenticating...'` need improvement
- **Server-side validation schemas:** Multiple schemas use Zod's default error messages without customization
  - Files affected: `auth.schema.ts`, `account.schema.ts`, `project.schema.ts`, `conversation.schema.ts`, `message.schema.ts`, `media.schema.ts`, `llm.schema.ts`
- **Client-side validation:** Some schemas use message codes instead of full English messages
  - Example in `client/src/schemaValidations/auth.schema.ts`: `'required'`, `'invalidEmail'`, `'minmaxPassword'`
  - Inconsistencies exist across client validation schemas
- **Success messages:** 26+ success messages across endpoints with inconsistent formats:
  - Some use exclamation: `'Login successful!'`
  - Some use adverb: `'List projects successfully'`
  - Some are simple: `'Upload successfully'`
  - Format variations: `'Get conversation list successfully'` vs `'Get message list successfully'`

## Goals & Objectives

**What do we want to achieve?**

### Primary Goals

- Translate all Vietnamese error messages to English (3 messages in `auth.hooks.ts`)
- Standardize all success and error messages to use consistent English terminology and format
- Standardize success message format across all 26+ API endpoints to follow consistent pattern
- Add custom validation error messages to all server-side Zod schemas (7 schema files)
- Convert client-side validation message codes to full English messages (e.g., `'required'` → `'Email is required'`)
- Ensure client-side validation messages match server-side messages for consistency
- Improve error handling flow: client-side validation → server-side validation → error display

### Secondary Goals

- Standardize error message format across all endpoints
- Improve error messages clarity and user-friendliness
- Document message format guidelines and validation patterns for future development
- Create centralized error message patterns/constants for reusability (optional)

### Non-goals

- Implementing full internationalization (i18n) system - that's a separate feature
- Changing the error response structure/data format (only message content and format standardization)
- Adding translation support for multiple languages
- Changing validation logic or rules (only adding/improving messages)
- Modifying HTTP status codes or error types

## User Stories & Use Cases

**How will users interact with the solution?**

1. **As a user**, I want to see all error messages in English so that I can understand what went wrong
   - When authentication fails, I should see clear English messages
   - When form validation fails, I should see helpful English error messages

2. **As a developer**, I want consistent validation patterns so that I can easily add new forms and endpoints
   - Server schemas should have custom error messages
   - Client schemas should match server schemas and provide user-friendly messages
   - Error handling should be standardized

3. **As a user**, I want clear validation feedback so that I know how to fix my input
   - Client-side validation should catch errors before submission
   - Server-side validation errors should be properly displayed on the form
   - Error messages should indicate which field has the problem

4. **As a user**, I want consistent success message format so that I know when operations complete successfully
   - Success messages should follow the same pattern across all endpoints
   - Success messages should be clear and consistent in style

**Key workflows and scenarios:**

1. **Client-side validation flow:**
   - User submits login form with invalid email → Client-side validation shows `'Please enter a valid email address'` → Form doesn't submit

2. **Server-side validation flow:**
   - User submits form with valid format but wrong password → Server returns 401 → Toast shows clear English error message (e.g., `'Invalid credentials'`)

3. **Cross-field validation flow:**
   - User creates account with password mismatch → Client validation shows `'Passwords do not match'` on confirmPassword field → Server validation also returns same message if client validation bypassed

4. **Server error display flow:**
   - Server returns 422 validation error → `handleErrorApi` maps errors to form fields → Errors displayed below relevant fields with English messages

5. **Authentication error flow:**
   - User accesses protected endpoint without token → Server returns 401 with message `'Access token not received'` → Client redirects to login

**Edge cases to consider:**

- Network errors vs validation errors (different handling required)
- Multiple validation errors on the same field (how to display)
- Nested validation errors (e.g., password confirmation with multiple constraints)
- Server errors that aren't validation-related (500 errors, timeouts)
- Server returns error with no message (fallback behavior needed)
- ZodError has no custom message (should use Zod default or custom fallback)
- Form validation bypassed (server should return same validation errors)

## Message Format Guidelines

**What format should messages follow?**

### Error Message Format

- **Style:** Sentence case, user-friendly, actionable
- **Structure:** Be specific about what's wrong and how to fix it
- **Examples:**
  - ✅ `'Email must be a valid email address'` (specific and actionable)
  - ✅ `'Password must be at least 6 characters'` (clear requirement)
  - ❌ `'Invalid email'` (too generic)
  - ❌ `'Password too short'` (not actionable)

### Success Message Format

- **Pattern:** `'{Action} {noun} successfully'` or `'{Action} successful!'`
- **Style:** Consistent punctuation (all with period, all without, or all with exclamation)
- **Examples:**
  - ✅ `'Login successful'` or `'Login successful!'`
  - ✅ `'Project created successfully'`
  - ✅ `'Message sent successfully'`
  - ❌ Mix of formats: `'Login successful!'` vs `'List projects successfully'` vs `'Upload successfully'`

### Field-Level Validation Messages

- **Format:** Field name + requirement description
- **Examples:**
  - `'Email is required'`
  - `'Password must be at least 6 characters'`
  - `'Name must be between 2 and 256 characters'`

## Success Criteria

**How will we know when we're done?**

### Measurable Outcomes

- 0 Vietnamese messages in server response payloads
- 100% of server-side Zod schemas have custom error messages (7 schema files)
- 100% of client-side validation schemas have consistent English messages (no message codes)
- All error messages are in English and follow format guidelines
- 100% of API endpoints return English success/error messages (26+ endpoints)
- All success messages follow consistent format pattern

### Acceptance Criteria

- ✅ All Vietnamese messages in `auth.hooks.ts` translated to English (3 messages)
- ✅ Error handler plugin returns clear, descriptive English messages
- ✅ All server-side validation schemas include custom `.message()` or `.refine()` with messages (7 files)
- ✅ All client-side validation message codes converted to full English messages (e.g., `'required'` → `'Email is required'`)
- ✅ All client-side validation schemas have consistent, user-friendly messages matching server schemas
- ✅ Server validation errors properly displayed on client forms using `handleErrorApi`
- ✅ All success messages follow consistent format pattern across 26+ endpoints
- ✅ Error messages follow format guidelines (sentence case, actionable, specific)
- ✅ No message codes or abbreviated messages in client-side validation
- ✅ All messages are in English and user-friendly

### Performance Benchmarks

- No performance impact (text-only changes)
- Error handling latency remains the same

## Constraints & Assumptions

**What limitations do we need to work within?**

### Technical Constraints

- Must maintain backward compatibility with existing error response structure (format, status codes, error types)
- Cannot change Zod schema validation logic or rules (only add/improve messages)
- Must preserve existing error handling flow in `handleErrorApi` utility
- Must maintain API contract - response structure unchanged (only message content)
- Cannot change HTTP status codes or error types (only message text)

### Business Constraints

- Must complete without breaking existing functionality
- Should not require database migrations or schema changes

### Time/Budget Constraints

- Feature should be implementable within a single development cycle
- No external dependencies or services needed

### Assumptions We're Making

- All users can understand English (no i18n requirement)
- All developers understand English (for maintaining code)
- Current error response structure is adequate (just needs message content and format standardization)
- React Hook Form's error handling will work with updated validation schemas
- API consumers (clients) are updated simultaneously or can handle message changes without breaking
- No external API consumers expect Vietnamese messages (all internal usage)
- Message format changes don't require API versioning

## Questions & Open Items

**What do we still need to clarify?**

### Resolved

- ✅ All messages should be in English
- ✅ Focus on server messages and validation consistency

### Open Items

- ✅ **Resolved:** Error message format/style guide - See "Message Format Guidelines" section above
- ✅ **Resolved:** Success message pattern - Defined as `'{Action} {noun} successfully'` or `'{Action} successful!'`
- **Pending Decision:** Should we create a centralized error message constants file for reusability?
  - **Pros:** Consistency, easier maintenance, single source of truth
  - **Cons:** Additional abstraction layer, potential over-engineering
  - **Recommendation:** Consider for commonly reused messages (e.g., `'Email is required'`, `'Password must be at least 6 characters'`)

### Research Needed

- Review all existing error messages to identify patterns and commonly used messages
- Check if there are other places with non-English messages we haven't identified
- Audit all 26+ success messages to categorize format variations
- Review client-side message codes to determine all that need conversion
