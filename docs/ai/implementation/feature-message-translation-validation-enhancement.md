---
phase: implementation
title: Implementation Guide
description: Message Translation & Validation Enhancement - Implementation notes and patterns
---

# Implementation Guide

## Development Setup

**How do we get started?**

### Prerequisites and Dependencies

- Existing development environment setup
- Access to both `server/` and `client/` directories
- Node.js and npm/yarn installed

### Environment Setup Steps

No special setup required - standard development environment.

### Configuration Needed

No configuration changes needed.

## Code Structure

**How is the code organized?**

### Server-Side Structure

```
server/src/
├── hooks/
│   └── auth.hooks.ts          # Authentication hooks (Vietnamese messages)
├── plugins/
│   └── errorHandler.plugins.ts # Error handler (generic messages)
└── schemaValidations/
    ├── auth.schema.ts         # Auth validation schemas
    ├── account.schema.ts      # Account validation schemas
    ├── project.schema.ts      # Project validation schemas
    ├── conversation.schema.ts # Conversation validation schemas
    ├── message.schema.ts      # Message validation schemas
    ├── media.schema.ts        # Media validation schemas
    └── llm.schema.ts          # LLM validation schemas
```

### Client-Side Structure

```
client/src/
├── lib/
│   └── utils.ts               # Error handling utility (handleErrorApi)
└── schemaValidations/
    ├── auth.schema.ts         # Client auth validation
    ├── account.schema.ts      # Client account validation
    ├── conversation.schema.ts # Client conversation validation
    └── project.schema.ts      # Client project validation
```

### Module Organization

- Validation schemas are co-located with feature domains
- Error handling is centralized in plugins and utilities

### Naming Conventions

- Schema files: `{feature}.schema.ts`
- Use descriptive, user-friendly error messages
- Keep message format consistent

## Implementation Notes

**Key technical details to remember:**

### Core Features

#### Feature 1: Auth Hook Message Translation

**Implementation approach:**

- Direct string replacement in `auth.hooks.ts`
- Maintain error types and status codes
- Use clear, descriptive English messages

**Example:**

```typescript
// Before
throw new AuthError('Không nhận được access token')

// After
throw new AuthError('Access token not received')
```

#### Feature 2: Server-Side Validation Messages

**Implementation approach:**

- Add `.message()` to Zod validators
- Use consistent message format
- Make messages user-friendly and actionable

**Message Format Guidelines:**

- Field-level errors: `'{fieldName} {error description}'`
- Examples:
  - `'Email must be a valid email address'`
  - `'Password must be at least 6 characters'`
  - `'Name must be between 2 and 256 characters'`

**Pattern Examples:**

```typescript
// String length validation
z.string()
  .min(2, { message: 'Name must be at least 2 characters' })
  .max(256, { message: 'Name must not exceed 256 characters' })

// Email validation
z.string()
  .email({ message: 'Please enter a valid email address' })

  // Custom refinement
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

  // Super refine with context
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }
  })
```

#### Feature 3: Client-Side Validation Standardization

**Implementation approach:**

- Ensure client schemas match server schemas
- Use same message format for consistency
- Fix any inconsistent message patterns

**Common Patterns to Standardize:**

```typescript
// Bad: Inconsistent message codes
z.string().min(1, { message: 'required' })
z.string().email({ message: 'invalidEmail' })

// Good: Clear English messages
z.string().min(1, { message: 'Email is required' })
z.string().email({ message: 'Please enter a valid email address' })
```

#### Feature 4: Error Handler Message Improvement

**Implementation approach:**

- Update generic messages to be more descriptive
- Maintain error response structure
- Ensure all messages are in English

**Example:**

```typescript
// Before
message: 'Error when authenticating...'

// After
message: 'Validation error occurred'
```

### Patterns & Best Practices

#### Zod Custom Message Pattern

```typescript
// Standard field validation
const schema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(100, { message: 'Password must not exceed 100 characters' }),
})
```

#### Cross-field Validation Pattern

```typescript
// For password confirmation
z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'], // Show error on confirmPassword field
})
```

#### Optional Field Validation Pattern

```typescript
// For update operations where fields are optional
z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(256, { message: 'Name must not exceed 256 characters' })
    .optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
})
```

#### Error Message Consistency

- Use sentence case for messages: `'Password is required'` not `'password is required'`
- Be specific: `'Email must be a valid email address'` not `'Invalid email'`
- Be actionable: `'Password must be at least 6 characters'` not `'Password too short'`

#### Common Utilities/Helpers

- No new utilities needed
- Use existing `handleErrorApi` for client error handling
- Existing error types (`AuthError`, `EntityError`, etc.) remain unchanged

## Integration Points

**How do pieces connect?**

### Error Flow Integration

1. **Server Validation Error Flow:**

   ```
   Zod Schema → ZodError → Error Handler Plugin → Client
   ```

   - Zod schema validation fails
   - ZodError thrown with custom messages
   - Error handler formats error response
   - Client receives 422 with errors array

2. **Authentication Error Flow:**

   ```
   Auth Hook → AuthError → Error Handler Plugin → Client
   ```

   - Auth hook throws AuthError with English message
   - Error handler formats 401 response
   - Client handles 401 (redirects to login)

3. **Client Form Validation Flow:**

   ```
   User Input → Zod Schema Validation → React Hook Form Error → Display
   ```

   - User types in form
   - Zod schema validates on change/blur
   - React Hook Form displays error
   - Error message shown below field

4. **Server Error Display Flow:**

   ```
   Server Error Response → handleErrorApi → Form Field Error → Display
   ```

   - Server returns EntityError (422)
   - `handleErrorApi` maps errors to form fields
   - React Hook Form displays server errors
   - User sees field-level error messages

### API Integration Details

- No API structure changes
- Only message content changes
- Response status codes unchanged
- Error response format unchanged

## Error Handling

**How do we handle failures?**

### Error Handling Strategy

#### Server-Side

- **Validation Errors:** Caught by Zod, formatted by error handler plugin
- **Auth Errors:** Thrown by auth hooks, formatted by error handler plugin
- **Status Errors:** Thrown by services, formatted by error handler plugin
- **Unknown Errors:** Caught by error handler, generic message returned

#### Client-Side

- **Client Validation Errors:** Displayed immediately via React Hook Form
- **Server Validation Errors:** Mapped to form fields via `handleErrorApi`
- **Auth Errors:** Redirect to login page
- **Other Errors:** Display toast notification

### Logging Approach

- Server errors logged before formatting response
- Client errors logged to console in development
- No changes to logging needed

### Retry/Fallback Mechanisms

- No retry mechanisms needed for validation errors
- Auth errors already have redirect fallback
- No changes to retry logic needed

## Performance Considerations

**How do we keep it fast?**

### Optimization Strategies

- No performance impact expected
- Message strings are constant-time operations
- Validation logic unchanged, only message content

### Caching Approach

- No caching changes needed
- Error messages are static strings

### Query Optimization

- Not applicable (no database changes)

### Resource Management

- No resource changes needed

## Security Notes

**What security measures are in place?**

### Authentication/Authorization

- Auth error messages don't leak information
- Messages don't reveal whether email exists
- No changes to auth logic

### Input Validation

- Validation rules unchanged, only messages
- Same validation logic applies
- No security impact from message changes

### Data Encryption

- Not applicable

### Secrets Management

- Not applicable
