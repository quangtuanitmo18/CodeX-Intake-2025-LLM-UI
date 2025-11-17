---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
---

# Project Planning & Task Breakdown

## Milestones
**What are the major checkpoints?**

- [x] **Milestone 1: Database & Core API** ✅ (Week 1, Days 1-3)
  - Prisma schema updated with Conversation, Message, MessageAttachment models
  - Database migrations run successfully
  - Backend repositories and services for CRUD operations
  - Basic API endpoints (create/list conversations, send/get messages)
- [x] **Milestone 2: File Attachments & Advanced Features** ✅ (Week 1, Days 4-5)
  - File upload integration with message attachments
  - Conversation title auto-generation
  - Search/filter functionality
  - Export to JSON and Markdown
- [x] **Milestone 3: Frontend Integration & Polish** ✅ (Week 2, Days 1-3)
  - Conversation sidebar UI
  - Message list with attachments display
  - File upload component
  - Edit/delete conversation UI
  - Client-side Zod validation integrated
- [ ] **Milestone 4: Testing & Documentation** (Week 2, Days 4-5)
  - Unit tests for services and repositories
  - Integration tests for API endpoints
  - E2E tests for critical user flows
  - Documentation updates

## Task Breakdown
**What specific work needs to be done?**

### Phase 1: Database Foundation (Days 1-2)
- [ ] **Task 1.1**: Update Prisma schema with new models
  - Add `Conversation` model with fields: id, accountId, title, model, createdAt, updatedAt, deletedAt
  - Add `Message` model with fields: id, conversationId, role, content, reasoning, metadata, createdAt
  - Add `MessageAttachment` model with fields: id, messageId, fileUrl, fileName, fileType, fileSize, createdAt
  - Add relations: Account → Conversation, Conversation → Message, Message → MessageAttachment
  - Add indexes for performance optimization
  - Estimate: 2 hours
  
- [ ] **Task 1.2**: Generate and run database migrations
  - Run `npx prisma migrate dev --name add_chat_history`
  - Generate Prisma client
  - Verify schema in database
  - Estimate: 30 minutes

- [ ] **Task 1.3**: Create repository layer
  - `conversation.repository.ts`: CRUD operations, pagination, search, soft delete
  - `message.repository.ts`: Create message, fetch messages with attachments, join queries
  - Add type definitions for query filters and results
  - Estimate: 3 hours

### Phase 2: Backend Services & API (Days 2-4)
- [ ] **Task 2.1**: Implement conversation service
  - `conversation.service.ts`: Business logic for create, update, delete, list
  - Auto-generate title from first message (extract first 50 chars, trim)
  - Implement soft delete (set deletedAt timestamp)
  - Add search/filter logic (title + message content)
  - Estimate: 4 hours

- [ ] **Task 2.2**: Implement message service
  - `message.service.ts`: Create user message, create assistant message after streaming
  - Link attachments to messages
  - Fetch messages with attachments (join query)
  - Handle metadata storage (JSON stringify/parse)
  - Estimate: 3 hours

- [ ] **Task 2.3**: Create conversation controller and routes
  - `conversation.controller.ts`: Handlers for all conversation endpoints
  - `conversation.route.ts`: Register routes with auth hook
  - Endpoints: GET /conversations, POST /conversations, GET /conversations/:id, PATCH /conversations/:id, DELETE /conversations/:id
  - Request validation with Zod schemas
  - Estimate: 4 hours

- [ ] **Task 2.4**: Create message controller and routes
  - `message.controller.ts`: Handlers for message endpoints
  - `message.route.ts`: Register routes with auth hook
  - Endpoints: GET /conversations/:id/messages, POST /conversations/:id/messages
  - Integrate with existing LLM streaming service
  - Estimate: 3 hours

- [ ] **Task 2.5**: Extend LLM streaming to save messages
  - Modify `llm.service.ts` to accept conversationId parameter
  - After stream completes, save assistant message to database
  - Store reasoning, metadata (tokens, duration, model)
  - Handle errors gracefully (save partial message or rollback)
  - Estimate: 3 hours

### Phase 3: File Attachments (Days 4-5)
- [ ] **Task 3.1**: Extend media upload API for message attachments
  - Modify `media.controller.ts` to support attachment uploads
  - Validate file type (images, PDFs, text files) and size (<10MB)
  - Store files in organized folder structure: uploads/conversations/{conversationId}/{messageId}/{fileId}.ext
  - Return file metadata (fileId, fileName, fileUrl, fileType, fileSize)
  - Estimate: 3 hours

- [ ] **Task 3.2**: Link attachments to messages
  - Update `message.service.ts` to create MessageAttachment records
  - Accept array of fileIds in POST /conversations/:id/messages
  - Fetch attachments when loading messages
  - Estimate: 2 hours

- [ ] **Task 3.3**: Implement file cleanup for deleted conversations
  - Add utility function to delete attachment files from disk
  - Hook into conversation soft delete (or schedule cleanup job)
  - Estimate: 2 hours

### Phase 4: Advanced Features (Day 5)
- [ ] **Task 4.1**: Implement auto-title generation
  - On first message in a conversation, extract first 50 chars of user prompt
  - Update conversation title automatically
  - Fallback to "New Conversation - {timestamp}" if prompt is too short
  - Estimate: 2 hours

- [ ] **Task 4.2**: Implement search/filter functionality
  - Add search query parameter to GET /conversations endpoint
  - Filter by conversation title (case-insensitive LIKE)
  - Optionally search message content (basic string match, not full-text)
  - Estimate: 2 hours

- [ ] **Task 4.3**: Implement export functionality
  - `conversation.service.ts`: exportToJSON() and exportToMarkdown() methods
  - GET /conversations/:id/export?format=json|markdown endpoint
  - Format JSON: structured data with all messages and attachments
  - Format Markdown: human-readable with headings, timestamps, collapsible reasoning
  - Set Content-Disposition header to trigger file download
  - Estimate: 3 hours

### Phase 5: Frontend Components (Days 6-7)
- [ ] **Task 5.1**: Create conversation sidebar component
  - `conversation-sidebar.tsx`: Display list of conversations
  - Show title, timestamp, message preview
  - Highlight active conversation
  - "New Chat" button to create conversation
  - Pagination or infinite scroll for long lists
  - Estimate: 4 hours

- [ ] **Task 5.2**: Create conversation item component
  - `conversation-item.tsx`: Single conversation card
  - Display title, last message preview, timestamp
  - Click to load conversation
  - Delete button with confirmation modal
  - Edit title inline or via modal
  - Estimate: 3 hours

- [ ] **Task 5.3**: Integrate conversation list into LLM page
  - Modify `app/llm/page.tsx` to include sidebar
  - Add route parameter for conversationId: `app/llm/[conversationId]/page.tsx`
  - Load conversation messages on mount
  - Update URL when switching conversations
  - Estimate: 3 hours

- [ ] **Task 5.4**: Create file upload component
  - `file-upload-button.tsx`: File picker with validation
  - Show selected files as chips with remove button
  - Display upload progress (if async)
  - Preview thumbnails for images
  - Estimate: 3 hours

- [ ] **Task 5.5**: Create message attachment display component
  - `message-attachment.tsx`: Render attachment in message bubble
  - Show thumbnail for images
  - Show file icon + name for documents
  - Click to open/download file
  - Estimate: 2 hours

- [ ] **Task 5.6**: Add export menu to conversation UI
  - `export-menu.tsx`: Dropdown with "Export as JSON" and "Export as Markdown" options
  - Trigger download on click
  - Estimate: 2 hours

- [ ] **Task 5.7**: Add search bar to conversation sidebar
  - Input field to filter conversations by title
  - Real-time filtering (debounced)
  - Clear button
  - Estimate: 2 hours

### Phase 6: React Query Hooks & API Client (Day 8)
- [ ] **Task 6.1**: Create conversation API client functions
  - `apiRequests/conversation.ts`: HTTP client wrappers for all conversation endpoints
  - Use existing `http.ts` utilities
  - Estimate: 2 hours

- [ ] **Task 6.2**: Create message API client functions
  - `apiRequests/message.ts`: HTTP client wrappers for message endpoints
  - Estimate: 1 hour

- [ ] **Task 6.3**: Create React Query hooks for conversations
  - `queries/useConversations.tsx`: useConversationList, useConversation, useCreateConversation, useUpdateConversation, useDeleteConversation
  - Implement optimistic updates for delete/update
  - Cache invalidation strategy
  - Estimate: 3 hours

- [ ] **Task 6.4**: Create React Query hooks for messages
  - `queries/useMessages.tsx`: useMessages, useSendMessage
  - Integrate with existing useLLMStream hook
  - Estimate: 2 hours

- [ ] **Task 6.5**: Create file upload hook
  - `queries/useAttachments.tsx`: useUploadFile
  - Handle upload progress, errors
  - Estimate: 1 hour

### Phase 7: Schema Validations (Day 8)
- [x] **Task 7.1**: Create Zod schemas for conversations and messages ✅
  - `client/src/schemaValidations/conversation.schema.ts`: CreateConversationBody, UpdateConversationBody, CreateMessageBody
  - Response schemas: ConversationRes, MessageRes, ListRes variants
  - Query schemas: ListConversationsQuery, ListMessagesQuery, ExportConversationQuery
  - TypeScript types using z.infer<> pattern
  - Validation rules: 10MB file limit, 200 char titles, 10000 char messages
  - **Status**: Complete - 142-line comprehensive validation file created
  - **Actual time**: 1 hour

- [x] **Task 7.2**: Integrate validation into React components ✅
  - **ConversationItem**: Validates UpdateConversationBody before title update, displays validation errors
  - **LLMChatArea**: Validates CreateMessageBody before message submission, replaces manual length checks
  - **ConversationSidebar**: Validates CreateConversationBody (empty body validation)
  - **Error handling**: ZodError caught and user-friendly messages displayed
  - **Status**: Complete - All forms now use Zod validation
  - **Actual time**: 1 hour

### Phase 8: Testing (Days 9-10)
- [ ] **Task 8.1**: Unit tests for conversation repository
  - Test CRUD operations, pagination, search, soft delete
  - Mock Prisma client
  - Estimate: 3 hours

- [ ] **Task 8.2**: Unit tests for message repository
  - Test message creation, fetching with attachments
  - Estimate: 2 hours

- [ ] **Task 8.3**: Unit tests for conversation service
  - Test title generation, export functions
  - Estimate: 3 hours

- [ ] **Task 8.4**: Unit tests for message service
  - Test message creation with attachments
  - Estimate: 2 hours

- [ ] **Task 8.5**: Integration tests for conversation API
  - Test all endpoints end-to-end with test database
  - Verify auth enforcement
  - Estimate: 4 hours

- [ ] **Task 8.6**: Integration tests for message API
  - Test message creation and streaming integration
  - Test file upload and attachment linking
  - Estimate: 3 hours

- [ ] **Task 8.7**: E2E tests for critical user flows
  - Test: Create conversation → Send message → View history → Delete conversation
  - Test: Upload file → Attach to message → Verify display
  - Test: Export conversation to JSON and Markdown
  - Estimate: 4 hours

- [ ] **Task 8.8**: Manual testing and QA
  - Test all UI interactions
  - Test edge cases (empty title, large files, deleted conversations)
  - Browser compatibility testing
  - Estimate: 3 hours

### Phase 9: Documentation & Cleanup (Day 10)
- [ ] **Task 9.1**: Update implementation docs
  - Document new components, services, routes
  - Add code examples and patterns
  - Estimate: 2 hours

- [ ] **Task 9.2**: Update README with setup instructions
  - Document new environment variables (if any)
  - Add migration steps
  - Estimate: 1 hour

- [ ] **Task 9.3**: Code review and refactoring
  - Clean up unused code
  - Ensure consistent naming and patterns
  - Add inline comments for complex logic
  - Estimate: 2 hours

## Dependencies
**What needs to happen in what order?**

### Task Dependencies
- Task 1.2 (migrations) depends on Task 1.1 (schema)
- Task 1.3 (repositories) depends on Task 1.2 (migrations)
- Tasks 2.1-2.4 (services/controllers) depend on Task 1.3 (repositories)
- Task 2.5 (streaming integration) depends on Task 2.4 (message controller)
- Tasks 3.1-3.2 (attachments) depend on Task 2.2 (message service)
- Task 4.1 (auto-title) depends on Task 2.1 (conversation service)
- Tasks 5.1-5.7 (frontend) depend on Phase 2 (backend API ready)
- Tasks 6.1-6.5 (hooks) depend on Phase 5 (components defined)
- Phase 8 (testing) depends on all implementation tasks

### External Dependencies
- Prisma (already installed)
- Existing auth system (Account model, authHook)
- Existing media upload API (can be extended or reused)
- Existing LLM streaming service (extend to save messages)

### Team/Resource Dependencies
- Backend developer: Phases 1-4
- Frontend developer: Phases 5-7 (can parallelize after Phase 2 complete)
- QA/Testing: Phase 8 (can start earlier with incremental testing)

## Timeline & Estimates
**When will things be done?**

### Week 1: Core Implementation
- **Day 1-2**: Database & repositories (Phase 1)
- **Day 3-4**: Backend services & API (Phase 2)
- **Day 4-5**: File attachments & advanced features (Phases 3-4)

### Week 2: Frontend & Testing
- **Day 6-7**: Frontend components (Phase 5)
- **Day 8**: React Query hooks & validations (Phases 6-7)
- **Day 9-10**: Testing & documentation (Phases 8-9)

### Total Effort
- Backend: ~35 hours
- Frontend: ~25 hours
- Testing: ~21 hours
- Documentation: ~3 hours
- **Total: ~84 hours (~10 working days for 1 developer, or 5-6 days with 2 developers)**

### Buffer
- 2 days for unforeseen issues (file storage edge cases, streaming integration bugs, performance tuning)

### Target Delivery
- **MVP Ready**: End of Week 2 (November 29, 2025)
- **Production Ready**: After QA and stakeholder review (December 2, 2025)

## Risks & Mitigation
**What could go wrong?**

### Technical Risks
- **Risk**: SQLite performance degrades with large conversation histories (>1000 conversations per user)
  - **Mitigation**: Implement pagination early; add indexes on critical queries; monitor query performance; plan migration to PostgreSQL if needed
- **Risk**: File storage fills up disk space (users upload many large files)
  - **Mitigation**: Enforce 10MB limit per file; implement file cleanup job for deleted conversations; monitor disk usage; plan cloud storage migration (S3)
- **Risk**: Streaming integration breaks existing LLM UI (regression)
  - **Mitigation**: Add feature flag to toggle conversation persistence; test extensively; ensure backward compatibility (streaming works without conversationId)
- **Risk**: Auto-title generation produces gibberish for non-English prompts or code snippets
  - **Mitigation**: Add language detection or fallback to "New Conversation" + timestamp; allow user to edit title easily
- **Risk**: Race condition when multiple tabs create conversations simultaneously
  - **Mitigation**: Use optimistic locking or last-write-wins strategy; add unique constraints in database

### Resource Risks
- **Risk**: Single developer becomes bottleneck (backend + frontend + testing)
  - **Mitigation**: Parallelize frontend work after backend API is ready; involve QA early for incremental testing
- **Risk**: Testing takes longer than estimated (integration tests are complex)
  - **Mitigation**: Start with critical path tests first; defer edge case tests to post-MVP if needed

### Dependency Risks
- **Risk**: Existing media upload API doesn't support all required file types
  - **Mitigation**: Extend validation logic; add new MIME types as needed; test early with sample files
- **Risk**: Auth system changes during development (breaking compatibility)
  - **Mitigation**: Use stable authHook interface; communicate with team about planned auth changes

### Mitigation Strategies
- Daily standups to track progress and blockers
- Incremental commits with feature flags (merge early, deploy late)
- Code reviews after each phase to catch issues early
- Automated tests run on every commit (CI/CD)
- Manual testing checklist reviewed before each milestone

## Resources Needed
**What do we need to succeed?**

### Team
- **1 Full-stack Developer** (or 1 Backend + 1 Frontend for parallel work)
- **1 QA Engineer** (part-time for testing support)
- **1 Designer** (for UI/UX review of conversation sidebar and attachment display)

### Tools/Services
- **Prisma CLI** (for migrations)
- **SQLite** (database for MVP)
- **React Query** (client-side data fetching)
- **Zod** (schema validation)
- **Lucide React** (icons for UI components)
- **Testing frameworks**: Jest, Vitest, Playwright (E2E)

### Infrastructure
- **Local development environment** with Node.js, npm
- **File storage**: Local uploads folder (configure via `UPLOAD_FOLDER` env var)
- **CI/CD pipeline**: Run tests on PR, deploy to staging after merge

### Documentation
- **Prisma docs**: For schema design and migrations
- **React Query docs**: For hooks and caching strategies
- **Fastify docs**: For route registration and plugins
- **Existing codebase**: Reference `feature-llmui` and `feature-boilerplate` docs for patterns

### Knowledge
- **Team familiarity with**:
  - Prisma ORM and migrations
  - Fastify routing and middleware
  - React Query for state management
  - File upload handling (multipart/form-data)
  - Markdown parsing (if needed for export)
