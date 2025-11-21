---
phase: testing
title: Testing Strategy
description: Message Translation & Validation Enhancement - Testing approach and test cases
---

# Testing Strategy

## Test Coverage Goals

**What level of testing do we aim for?**

- Unit test coverage target: Focus on critical paths (auth hooks, error handler, validation schemas)
- Integration test scope: API endpoint error responses, form validation flows
- End-to-end test scenarios: Complete user flows with error scenarios
- Alignment with requirements: Verify all messages are in English, validation works correctly

## Unit Tests

**What individual components need testing?**

### Component 1: Auth Hooks (`server/src/hooks/auth.hooks.ts`)

- [ ] Test case 1: `requireLoginedHook` throws English error when no token provided
  - **Scenario:** Request without authorization header
  - **Expected:** `AuthError` with message `'Access token not received'`
  - **Covers:** Error message translation

- [ ] Test case 2: `requireLoginedHook` throws English error when token invalid
  - **Scenario:** Request with invalid/expired token
  - **Expected:** `AuthError` with message `'Invalid access token'`
  - **Covers:** Token validation error message

- [ ] Test case 3: `requireAdminHook` throws English error when not admin
  - **Scenario:** Non-admin user tries to access admin resource
  - **Expected:** `AuthError` with message `'You do not have permission to access this resource'`
  - **Covers:** Permission error message

### Component 2: Error Handler Plugin (`server/src/plugins/errorHandler.plugins.ts`)

- [ ] Test case 1: EntityError returns proper English message
  - **Scenario:** Validation error occurs
  - **Expected:** 422 response with message `'Validation error occurred'` and errors array
  - **Covers:** EntityError message standardization

- [ ] Test case 2: AuthError returns English message from error
  - **Scenario:** Authentication error thrown
  - **Expected:** 401 response with English error message
  - **Covers:** Auth error message forwarding

- [ ] Test case 3: ZodError formats validation errors with custom messages
  - **Scenario:** Zod validation fails with custom messages
  - **Expected:** 422 response with custom error messages in errors array
  - **Covers:** Custom validation message formatting

### Component 3: Server Validation Schemas

- [ ] Test case 1: Auth schema returns custom error messages
  - **Scenario:** Invalid email format in login
  - **Expected:** Error message like `'Please enter a valid email address'`
  - **Covers:** Email validation message

- [ ] Test case 2: Account schema returns custom password error messages
  - **Scenario:** Password too short
  - **Expected:** Error message like `'Password must be at least 6 characters'`
  - **Covers:** Password validation message

- [ ] Test case 3: Account schema returns password mismatch message
  - **Scenario:** Password and confirmPassword don't match
  - **Expected:** Error message `'Passwords do not match'` on confirmPassword field
  - **Covers:** Cross-field validation message

### Component 4: Client Validation Schemas

- [ ] Test case 1: Client auth schema validates with English messages
  - **Scenario:** Empty email field
  - **Expected:** Form shows `'Email is required'` error
  - **Covers:** Client-side validation message display

- [ ] Test case 2: Client account schema shows password mismatch
  - **Scenario:** Password fields don't match
  - **Expected:** Form shows `'Passwords do not match'` on confirmPassword field
  - **Covers:** Client-side cross-field validation

### Component 5: Client Error Handler (`client/src/lib/utils.ts`)

- [ ] Test case 1: handleErrorApi maps EntityError to form fields
  - **Scenario:** Server returns 422 with field errors
  - **Expected:** Errors mapped to correct form fields using `setError`
  - **Covers:** Server error to form field mapping

- [ ] Test case 2: handleErrorApi shows toast for non-EntityError
  - **Scenario:** Server returns 500 error
  - **Expected:** Toast notification with error message
  - **Covers:** Generic error handling

## Integration Tests

**How do we test component interactions?**

### Integration Scenario 1: Login Flow with Validation Errors

- [ ] Test: Submit login form with invalid email
  - **Steps:**
    1. Navigate to login page
    2. Enter invalid email (e.g., `'notanemail'`)
    3. Enter valid password
    4. Submit form
  - **Expected:**
    - Client-side validation shows error: `'Please enter a valid email address'`
    - Form does not submit
  - **Covers:** Client validation → error display

- [ ] Test: Submit login form with valid format but wrong credentials
  - **Steps:**
    1. Navigate to login page
    2. Enter valid email format
    3. Enter wrong password
    4. Submit form
  - **Expected:**
    - Form submits
    - Server returns 401 with English error message
    - Error displayed to user
  - **Covers:** Server auth error → client display

### Integration Scenario 2: Registration/Account Creation Flow

- [ ] Test: Create account with password mismatch
  - **Steps:**
    1. Fill account form with mismatched passwords
    2. Submit form
  - **Expected:**
    - Client validation shows: `'Passwords do not match'` on confirmPassword field
    - Server validation also returns same message if client validation bypassed
  - **Covers:** Client and server validation consistency

- [ ] Test: Create account with validation errors from server
  - **Steps:**
    1. Fill form with data that passes client validation
    2. Submit form (e.g., email already exists)
  - **Expected:**
    - Server returns 422 with field-level errors
    - `handleErrorApi` maps errors to form fields
    - Errors displayed below relevant fields
  - **Covers:** Server validation → form field error display

### Integration Scenario 3: API Endpoint Error Responses

- [ ] Test: POST /api/auth/login with invalid data
  - **Steps:**
    1. Send POST request with invalid email format
    2. Check response
  - **Expected:**
    - Status 422
    - Response contains `message: 'Validation error occurred'` or similar
    - `errors` array contains field-level errors with English messages
  - **Covers:** Server validation → API response

- [ ] Test: Protected endpoint without authentication
  - **Steps:**
    1. Send GET request to protected endpoint without token
    2. Check response
  - **Expected:**
    - Status 401
    - Response contains `message: 'Access token not received'` (or similar)
    - Message is in English
  - **Covers:** Auth hook → API error response

## End-to-End Tests

**What user flows need validation?**

### User Flow 1: Login with Error Messages

- [ ] Test: User attempts login with invalid credentials
  - **Steps:**
    1. Navigate to `/login`
    2. Enter invalid email (test client validation)
    3. Fix email, enter wrong password (test server validation)
    4. Enter correct credentials
  - **Expected:**
    - Step 2: Client validation error shown in English
    - Step 3: Server error shown in English
    - Step 4: Successful login
  - **Covers:** Complete login flow with error handling

### User Flow 2: Create Project with Validation

- [ ] Test: User creates project with validation errors
  - **Steps:**
    1. Navigate to project creation
    2. Submit form with name too short
    3. Fix name, submit with valid data
  - **Expected:**
    - Step 2: Validation error shown: `'Name must be at least 2 characters'` or similar
    - Step 3: Project created successfully with success message in English
  - **Covers:** Project creation with validation

### User Flow 3: Send Message with Attachments

- [ ] Test: User sends message with invalid attachment
  - **Steps:**
    1. Navigate to chat
    2. Try to upload file too large
    3. Try to upload unsupported file type
    4. Upload valid file and send message
  - **Expected:**
    - Step 2: Error shown: `'File too large. Maximum size is 10MB'` (or similar)
    - Step 3: Error shown: `'Unsupported file type. Allowed: images, PDFs, text files, documents'` (or similar)
    - Step 4: Message sent successfully
  - **Covers:** File upload validation

### Critical Path Testing

- [ ] Test: All critical user flows with error scenarios
  - Login, registration, project creation, message sending
  - Verify all error messages are in English
  - Verify all success messages are in English and consistent

### Regression of Adjacent Features

- [ ] Test: Existing features still work correctly
  - Profile update
  - Password change
  - Conversation management
  - Verify no regressions in error handling

## Test Data

**What data do we use for testing?**

### Test Fixtures and Mocks

- Invalid email formats: `'notanemail'`, `'missing@domain'`, `'@domain.com'`
- Short passwords: `'12345'` (5 chars, should fail min(6))
- Long strings: Generate strings exceeding max length limits
- File uploads: Test files of various sizes and types

### Seed Data Requirements

- Test user accounts with known credentials
- No special seed data needed beyond existing test data

### Test Database Setup

- Use existing test/dev database
- No schema changes needed

## Test Reporting & Coverage

**How do we verify and communicate test results?**

### Coverage Commands and Thresholds

- Server tests: `cd server && npm test`
- Client tests: `cd client && npm test`
- Coverage target: Focus on modified files (auth hooks, schemas, error handler)

### Coverage Gaps

- Manual testing required for UI error display
- Integration tests for complete error flows
- E2E tests for user-facing error messages

### Links to Test Reports or Dashboards

- Not applicable for this feature (manual testing focus)

### Manual Testing Outcomes and Sign-off

- Document manual testing results
- Verify all error messages are in English
- Verify all validation errors display correctly

## Manual Testing

**What requires human validation?**

### UI/UX Testing Checklist

#### Authentication Flows

- [ ] Login form shows English validation errors
- [ ] Login shows English error on wrong credentials
- [ ] Token expiration shows English error message
- [ ] Access denied shows English error message

#### Form Validation

- [ ] All forms show English client-side validation errors
- [ ] Server validation errors map to correct form fields
- [ ] Error messages are clear and actionable
- [ ] Success messages are consistent across forms

#### Error Display

- [ ] Field-level errors appear below relevant fields
- [ ] Toast notifications show English error messages
- [ ] Error messages are readable and not truncated
- [ ] Error styling is consistent (red text, proper spacing)

#### Browser/Device Compatibility

- [ ] Chrome: Error messages display correctly
- [ ] Firefox: Error messages display correctly
- [ ] Safari: Error messages display correctly
- [ ] Edge: Error messages display correctly
- [ ] Mobile browsers: Error messages are readable

### Smoke Tests After Deployment

- [ ] Login with valid credentials works
- [ ] Login with invalid credentials shows English error
- [ ] Create project with validation errors shows English messages
- [ ] File upload with invalid file shows English error

## Performance Testing

**How do we validate performance?**

### Load Testing Scenarios

- Not applicable (text-only changes, no performance impact)

### Stress Testing Approach

- Not applicable

### Performance Benchmarks

- Error handling latency should remain unchanged
- Validation should remain fast (< 10ms per field)

## Bug Tracking

**How do we manage issues?**

### Issue Tracking Process

- Create issues for any Vietnamese messages found
- Create issues for inconsistent validation messages
- Create issues for broken error display

### Bug Severity Levels

- **Critical:** Vietnamese messages in production
- **High:** Validation errors not displaying
- **Medium:** Inconsistent error message format
- **Low:** Minor wording improvements

### Regression Testing Strategy

- Test all forms after changes
- Test all error scenarios
- Verify no existing functionality broken
