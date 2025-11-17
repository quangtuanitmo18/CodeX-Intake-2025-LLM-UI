---
phase: testing
title: Testing Strategy
description: Define testing approach, test cases, and quality assurance
---

# Testing Strategy

## Test Coverage Goals
**What level of testing do we aim for?**

- **Unit test coverage target**: 100% of new services, repositories, and utility functions
- **Integration test scope**: All API endpoints with authentication, error handling, and edge cases
- **End-to-end test scenarios**: Critical user flows (create conversation, send message, attach file, export, delete)
- **Manual testing**: UI/UX validation, browser compatibility, file upload edge cases
- **Alignment with requirements**: All success criteria from requirements doc must have corresponding tests

## Unit Tests
**What individual components need testing?**

### Conversation Repository (server/src/repositories/conversation.repository.ts)
- [ ] `findByAccountId()` returns conversations for correct user only
- [ ] `findByAccountId()` respects pagination (limit/offset)
- [ ] `findByAccountId()` filters by search query (title and message content)
- [ ] `findByAccountId()` excludes soft-deleted conversations (deletedAt is not null)
- [ ] `findByAccountId()` orders by updatedAt descending
- [ ] `findById()` returns conversation if user owns it
- [ ] `findById()` returns null if conversation doesn't exist or is deleted
- [ ] `create()` creates conversation with default model if not provided
- [ ] `create()` sets title to null if not provided
- [ ] `update()` updates title successfully for owned conversation
- [ ] `update()` does not update if user doesn't own conversation
- [ ] `softDelete()` sets deletedAt timestamp
- [ ] `softDelete()` does not delete if user doesn't own conversation

### Message Repository (server/src/repositories/message.repository.ts)
- [ ] `findByConversationId()` returns messages in chronological order (createdAt asc)
- [ ] `findByConversationId()` includes attachments for each message
- [ ] `findByConversationId()` respects pagination (limit/offset)
- [ ] `create()` creates message with all required fields
- [ ] `create()` handles optional fields (reasoning, metadata)
- [ ] `addAttachments()` links multiple attachments to a message
- [ ] `count()` returns correct message count for conversation
- [ ] Cascade delete: deleting conversation deletes all messages
- [ ] Cascade delete: deleting message deletes all attachments

### Conversation Service (server/src/services/conversation.service.ts)
- [ ] `list()` calls repository with correct filters
- [ ] `get()` throws error if conversation not found
- [ ] `get()` throws error if user doesn't own conversation (403)
- [ ] `create()` creates conversation with auto-generated title if not provided
- [ ] `updateTitle()` updates title successfully
- [ ] `delete()` soft deletes conversation
- [ ] `autoGenerateTitle()` extracts first 50 chars from message
- [ ] `autoGenerateTitle()` trims whitespace
- [ ] `autoGenerateTitle()` falls back to "New Conversation - {timestamp}" if message is empty
- [ ] `exportToJSON()` returns correct structure with messages and attachments
- [ ] `exportToJSON()` parses metadata JSON correctly
- [ ] `exportToMarkdown()` formats messages with headers and timestamps
- [ ] `exportToMarkdown()` includes collapsible reasoning section if present
- [ ] `exportToMarkdown()` lists attachments as links

### Message Service (server/src/services/message.service.ts)
- [ ] `list()` verifies user owns conversation before fetching messages
- [ ] `list()` throws error if conversation not found
- [ ] `createUserMessage()` creates message with role "user"
- [ ] `createUserMessage()` links attachments if provided
- [ ] `createUserMessage()` triggers auto-title generation for first message
- [ ] `createUserMessage()` does not trigger auto-title for subsequent messages
- [ ] `createAssistantMessage()` creates message with role "assistant"
- [ ] `createAssistantMessage()` stores reasoning if provided
- [ ] `createAssistantMessage()` stringifies metadata JSON

### LLM Service Integration (server/src/services/llm.service.ts)
- [ ] `streamLLMResponse()` saves assistant message after stream completes if conversationId provided
- [ ] `streamLLMResponse()` does not save message if conversationId is null (backward compatibility)
- [ ] `streamLLMResponse()` stores full content (concatenated deltas)
- [ ] `streamLLMResponse()` stores full reasoning (concatenated reasoning deltas)
- [ ] `streamLLMResponse()` stores metadata (duration, model)
- [ ] Error handling: partial stream failure still saves partial message (or rolls back user message)

### File Cleanup Utility (server/src/utils/file-cleanup.util.ts)
- [ ] `deleteAttachmentFile()` deletes file from disk
- [ ] `deleteAttachmentFile()` handles missing files gracefully (no error if file doesn't exist)
- [ ] `deleteConversationFiles()` deletes all files in conversation folder
- [ ] `deleteConversationFiles()` handles empty folders

## Integration Tests
**How do we test component interactions?**

### Conversation API Endpoints
- [ ] `GET /api/conversations` returns 401 if not authenticated
- [ ] `GET /api/conversations` returns user's conversations only (not other users')
- [ ] `GET /api/conversations` paginates correctly (limit/offset)
- [ ] `GET /api/conversations` filters by search query
- [ ] `GET /api/conversations` excludes soft-deleted conversations
- [ ] `GET /api/conversations/:id` returns 404 if conversation doesn't exist
- [ ] `GET /api/conversations/:id` returns 403 if user doesn't own conversation
- [ ] `POST /api/conversations` creates conversation with auto-generated title
- [ ] `POST /api/conversations` creates conversation with custom title
- [ ] `POST /api/conversations` returns 201 status code
- [ ] `PATCH /api/conversations/:id` updates title successfully
- [ ] `PATCH /api/conversations/:id` returns 403 if user doesn't own conversation
- [ ] `DELETE /api/conversations/:id` soft deletes conversation
- [ ] `DELETE /api/conversations/:id` returns 403 if user doesn't own conversation
- [ ] `GET /api/conversations/:id/export?format=json` returns JSON file
- [ ] `GET /api/conversations/:id/export?format=markdown` returns Markdown file
- [ ] `GET /api/conversations/:id/export` sets Content-Disposition header for download

### Message API Endpoints
- [ ] `GET /api/conversations/:id/messages` returns 401 if not authenticated
- [ ] `GET /api/conversations/:id/messages` returns 403 if user doesn't own conversation
- [ ] `GET /api/conversations/:id/messages` returns messages in chronological order
- [ ] `GET /api/conversations/:id/messages` includes attachments for each message
- [ ] `GET /api/conversations/:id/messages` paginates correctly
- [ ] `POST /api/conversations/:id/messages` creates user message
- [ ] `POST /api/conversations/:id/messages` links attachments if provided
- [ ] `POST /api/conversations/:id/messages` triggers auto-title generation for first message
- [ ] `POST /api/conversations/:id/messages` streams LLM response (SSE)
- [ ] `POST /api/conversations/:id/messages` saves assistant message after stream completes
- [ ] `POST /api/conversations/:id/messages` returns 403 if user doesn't own conversation

### File Upload Integration
- [ ] `POST /api/media/upload` accepts valid file types (images, PDFs, text)
- [ ] `POST /api/media/upload` rejects files >10MB
- [ ] `POST /api/media/upload` rejects unsupported file types
- [ ] `POST /api/media/upload` sanitizes filenames (removes path traversal chars)
- [ ] `POST /api/media/upload` stores file in correct folder structure
- [ ] `POST /api/media/upload` returns file metadata (fileId, fileName, fileUrl, fileType, fileSize)
- [ ] Attachment linked to message can be retrieved via message API

### Database Transaction & Cascade Tests
- [ ] Deleting conversation cascades to all messages
- [ ] Deleting conversation cascades to all message attachments
- [ ] Deleting message cascades to all attachments
- [ ] Soft-deleted conversations do not appear in list queries
- [ ] Soft-deleted conversations cannot be accessed via GET /:id

## End-to-End Tests
**What user flows need validation?**

### E2E Flow 1: Create Conversation and Send Message
1. [ ] User logs in successfully
2. [ ] User navigates to LLM chat page
3. [ ] User clicks "New Chat" button
4. [ ] New conversation is created (appears in sidebar)
5. [ ] User types a message and presses Enter
6. [ ] User message appears on the right side
7. [ ] LLM response streams word-by-word on the left side
8. [ ] Conversation title auto-generates from first message
9. [ ] Conversation persists after page reload

### E2E Flow 2: Upload File and Attach to Message
1. [ ] User opens existing conversation
2. [ ] User clicks file upload button
3. [ ] User selects an image file (PNG, <10MB)
4. [ ] File preview/chip appears
5. [ ] User types a message and submits
6. [ ] Message with attachment is sent
7. [ ] Attachment thumbnail displays inline with user message
8. [ ] Clicking attachment opens/downloads file

### E2E Flow 3: Edit Conversation Title
1. [ ] User clicks on conversation title (or edit icon)
2. [ ] Input field appears with current title
3. [ ] User edits title and presses Enter (or clicks save)
4. [ ] Title updates in sidebar and page header
5. [ ] Title persists after page reload

### E2E Flow 4: Search Conversations
1. [ ] User types search query in sidebar search bar
2. [ ] Conversation list filters in real-time
3. [ ] Only matching conversations (by title or message content) appear
4. [ ] Clearing search query restores full list

### E2E Flow 5: Delete Conversation
1. [ ] User clicks delete button on conversation item
2. [ ] Confirmation modal appears
3. [ ] User confirms deletion
4. [ ] Conversation disappears from sidebar
5. [ ] Navigating to deleted conversation URL shows 404
6. [ ] Database record has `deletedAt` timestamp set

### E2E Flow 6: Export Conversation
1. [ ] User opens conversation
2. [ ] User clicks export button
3. [ ] Export menu appears with JSON and Markdown options
4. [ ] User selects JSON format
5. [ ] File download triggers with correct filename
6. [ ] Downloaded JSON contains all messages, attachments, metadata
7. [ ] User exports again as Markdown
8. [ ] Markdown file is formatted correctly with headers, timestamps, reasoning

### E2E Flow 7: Pagination (Long Conversation List)
1. [ ] User has 50+ conversations (seed database for test)
2. [ ] Only first 20 conversations load initially
3. [ ] User scrolls to bottom of sidebar (or clicks "Load More")
4. [ ] Next 20 conversations load
5. [ ] No duplicate conversations appear

### E2E Flow 8: Error Handling (File Upload Failure)
1. [ ] User selects a file >10MB
2. [ ] Error toast appears: "File size exceeds 10MB limit"
3. [ ] File is not uploaded
4. [ ] User selects unsupported file type (.exe)
5. [ ] Error toast appears: "File type not supported"

## Test Data
**What data do we use for testing?**

### Test Fixtures
- **Users**: 2 test accounts (user1, user2) to test ownership isolation
- **Conversations**: 5 conversations per user with varying message counts (0, 1, 10, 50 messages)
- **Messages**: Mix of user/assistant messages, some with reasoning, some with attachments
- **Attachments**: Sample files (image.png, document.pdf, text.txt) stored in test uploads folder

### Seed Data Script
```typescript
// server/src/tests/seed.ts
import { prisma } from '../database'

export async function seedTestData() {
  const user1 = await prisma.account.create({ data: { email: 'user1@test.com', name: 'User 1', password: 'hashed' } })
  const user2 = await prisma.account.create({ data: { email: 'user2@test.com', name: 'User 2', password: 'hashed' } })

  const conv1 = await prisma.conversation.create({
    data: {
      accountId: user1.id,
      title: 'Test Conversation 1',
      messages: {
        create: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!', reasoning: 'Friendly greeting' }
        ]
      }
    }
  })

  // ... more seed data
}
```

### Test Database Setup
- Use separate SQLite database for tests: `DATABASE_URL="file:./test.db"`
- Reset database before each test suite
- Clean up uploaded files in test uploads folder after tests

## Test Reporting & Coverage
**How do we verify and communicate test results?**

### Coverage Commands
```bash
# Backend unit tests
cd server
npm run test -- --coverage

# Backend integration tests
npm run test:integration -- --coverage

# Frontend unit tests
cd client
npm run test -- --coverage

# E2E tests (Playwright)
npm run test:e2e
```

### Coverage Thresholds
- Minimum 90% coverage for services and repositories
- Minimum 80% coverage for controllers
- Minimum 70% coverage for frontend components

### Coverage Gaps (Acceptable Exceptions)
- File cleanup utility: Hard to test file system operations in unit tests (manual testing sufficient)
- SSE streaming: Difficult to unit test (covered by integration tests)
- Frontend animations: Visual testing only

### Test Reports
- Jest/Vitest HTML coverage report generated in `coverage/` folder
- Playwright test report with screenshots for failed E2E tests
- CI/CD pipeline fails if coverage drops below threshold

## Manual Testing
**What requires human validation?**

### UI/UX Testing Checklist
- [ ] Conversation sidebar is visually aligned with design (spacing, fonts, colors)
- [ ] Conversation items show correct preview text (first 50 chars of last message)
- [ ] Active conversation is highlighted in sidebar
- [ ] File upload button is accessible and intuitive
- [ ] Attachment thumbnails display correctly (images) and file icons appear for documents
- [ ] Export menu is easy to discover and use
- [ ] Search bar filters conversations smoothly without lag
- [ ] Loading states (spinners, skeletons) appear during API calls
- [ ] Error states (toasts, inline errors) are clear and actionable
- [ ] Responsive design: Works on mobile, tablet, desktop

### Browser/Device Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Accessibility
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announces conversation titles and message content
- [ ] Color contrast meets WCAG AA standards
- [ ] Focus indicators are visible

### Smoke Tests After Deployment
- [ ] Login and navigate to chat page
- [ ] Create new conversation
- [ ] Send message and verify response
- [ ] Upload file and verify attachment
- [ ] Export conversation and verify download
- [ ] Delete conversation and verify removal

## Performance Testing
**How do we validate performance?**

### Load Testing Scenarios
- [ ] Create 100 conversations for a single user → verify list query <200ms
- [ ] Send 50 messages in a conversation → verify message fetch <500ms
- [ ] Upload 10 files (5MB each) concurrently → verify all complete within 10s
- [ ] Stream LLM response (1000 tokens) → verify chunk latency <200ms

### Stress Testing
- [ ] 10 concurrent users creating conversations simultaneously
- [ ] Paginate through 1000 conversations (50 pages) → verify no memory leaks
- [ ] Database query performance with 10,000 messages across 500 conversations

### Performance Benchmarks (Success Criteria)
- Conversation list load: <200ms (20 items)
- Message list load: <500ms (50 items)
- File upload: <2s (5MB file, local network)
- Export JSON: <1s (100 message conversation)
- Export Markdown: <1s (100 message conversation)

## Bug Tracking
**How do we manage issues?**

### Issue Tracking Process
1. Log bugs in GitHub Issues with label `bug` and `chat-history`
2. Include reproduction steps, expected vs actual behavior, screenshots
3. Prioritize by severity:
   - **Critical**: Blocks core functionality (cannot send messages, auth broken)
   - **High**: Degrades UX but workaround exists (export fails, search doesn't work)
   - **Medium**: Minor UI glitch or edge case
   - **Low**: Enhancement or polish item

### Regression Testing Strategy
- Run full integration test suite before each release
- Add test case for every fixed bug to prevent regression
- Monitor production errors via logging (Sentry, LogRocket, etc.)

### Test Exit Criteria
**When can we ship?**
- [ ] All unit tests pass with >90% coverage
- [ ] All integration tests pass
- [ ] All critical E2E flows pass
- [ ] No critical or high-severity bugs remain
- [ ] Manual testing checklist completed
- [ ] Performance benchmarks met
- [ ] Code reviewed and approved
- [ ] Documentation updated

---

## Test Implementation Examples

### Example Unit Test (Conversation Service)
```typescript
// server/src/services/__tests__/conversation.service.test.ts
import { conversationService } from '../conversation.service'
import { conversationRepository } from '../../repositories/conversation.repository'

jest.mock('../../repositories/conversation.repository')

describe('conversationService', () => {
  describe('autoGenerateTitle', () => {
    it('should extract first 50 chars from message', async () => {
      const message = 'This is a test message that is longer than fifty characters and should be truncated'
      await conversationService.autoGenerateTitle('conv123', 1, message)
      
      expect(conversationRepository.update).toHaveBeenCalledWith(
        'conv123',
        1,
        { title: 'This is a test message that is longer than fifty' }
      )
    })

    it('should fallback to timestamp if message is empty', async () => {
      const message = ''
      await conversationService.autoGenerateTitle('conv123', 1, message)
      
      const call = (conversationRepository.update as jest.Mock).mock.calls[0]
      expect(call[2].title).toMatch(/^New Conversation - \d{4}-\d{2}-\d{2}/)
    })
  })
})
```

### Example Integration Test (API Endpoint)
```typescript
// server/src/controllers/__tests__/conversation.controller.integration.test.ts
import { build } from '../../app'
import { prisma } from '../../database'

describe('POST /api/conversations', () => {
  let app: any
  let authToken: string

  beforeAll(async () => {
    app = await build()
    // Create test user and get auth token
    authToken = await getTestAuthToken()
  })

  afterAll(async () => {
    await app.close()
    await prisma.$disconnect()
  })

  it('should create conversation with custom title', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/conversations',
      headers: { Authorization: `Bearer ${authToken}` },
      payload: { title: 'My Custom Title' }
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      title: 'My Custom Title',
      model: 'atlas-2.1'
    })
  })

  it('should return 401 if not authenticated', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/conversations',
      payload: { title: 'Test' }
    })

    expect(response.statusCode).toBe(401)
  })
})
```

### Example E2E Test (Playwright)
```typescript
// client/tests/e2e/conversation.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Conversation Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/llm')
  })

  test('should create new conversation and send message', async ({ page }) => {
    // Click "New Chat"
    await page.click('button:has-text("New Chat")')
    
    // Type message
    await page.fill('textarea[placeholder="Type your message..."]', 'Hello, AI!')
    await page.press('textarea', 'Enter')

    // Verify user message appears
    await expect(page.locator('.message-bubble.user')).toContainText('Hello, AI!')

    // Wait for assistant response
    await expect(page.locator('.message-bubble.assistant')).toBeVisible({ timeout: 10000 })

    // Verify auto-generated title
    await expect(page.locator('.conversation-title')).toContainText('Hello, AI!')
  })
})
```
