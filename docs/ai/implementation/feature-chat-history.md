---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup

**How do we get started?**

### Prerequisites

- Node.js 18+ and npm installed
- Existing project dependencies installed (`npm install` in both `client/` and `server/`)
- SQLite database configured via `DATABASE_URL` in `.env`
- Uploads folder exists and is writable (configured via `UPLOAD_FOLDER` env var)

### Environment Setup

No new environment variables required for MVP. Reuse existing:

- `DATABASE_URL` - SQLite connection string
- `UPLOAD_FOLDER` - Local file storage path (default: `uploads`)

### Database Migration

```bash
cd server
npx prisma migrate dev --name add_chat_history
npx prisma generate
```

### Verify Setup

```bash
# Check schema is updated
npx prisma db pull

# Run development servers
cd server && npm run dev  # Backend on :4000
cd client && npm run dev  # Frontend on :3000
```

## Code Structure

**How is the code organized?**

### Backend Structure

```
server/src/
├── controllers/
│   ├── conversation.controller.ts  # NEW: Conversation CRUD handlers
│   └── message.controller.ts       # NEW: Message handlers + streaming integration
├── services/
│   ├── conversation.service.ts     # NEW: Business logic, title generation, export
│   └── message.service.ts          # NEW: Message creation, attachment linking
├── repositories/
│   ├── conversation.repository.ts  # NEW: Prisma queries for Conversation
│   └── message.repository.ts       # NEW: Prisma queries for Message & MessageAttachment
├── routes/
│   ├── conversation.route.ts       # NEW: Register conversation endpoints
│   └── message.route.ts            # NEW: Register message endpoints
├── schemaValidations/
│   ├── conversation.schema.ts      # NEW: Zod schemas for conversation API
│   └── message.schema.ts           # NEW: Zod schemas for message API
└── utils/
    └── file-cleanup.util.ts        # NEW: Delete orphaned attachment files

prisma/
└── schema.prisma                   # UPDATED: Add Conversation, Message, MessageAttachment models
```

### Frontend Structure

```
client/src/
├── app/
│   └── llm/
│       ├── conversations/
│       │   └── page.tsx            # NEW: Conversation list page
│       └── [conversationId]/
│           └── page.tsx            # NEW: Load specific conversation
├── components/
│   └── llm/
│       ├── conversation-sidebar.tsx    # NEW: Sidebar with conversation list
│       ├── conversation-item.tsx       # NEW: Single conversation card
│       ├── message-attachment.tsx      # NEW: Display attachment in message
│       ├── file-upload-button.tsx      # NEW: File picker with validation
│       └── export-menu.tsx             # NEW: Export dropdown
├── apiRequests/
│   ├── conversation.ts             # NEW: HTTP client for conversation API
│   └── message.ts                  # NEW: HTTP client for message API
├── queries/
│   ├── useConversations.tsx        # NEW: React Query hooks for conversations
│   ├── useMessages.tsx             # NEW: React Query hooks for messages
│   └── useAttachments.tsx          # NEW: File upload hooks
└── schemaValidations/
    ├── conversation.schema.ts      # NEW: Shared Zod schemas (sync with server)
    └── message.schema.ts           # NEW: Shared Zod schemas (sync with server)
```

## Implementation Notes

**Key technical details to remember:**

### Core Features

#### 1. Prisma Schema (server/prisma/schema.prisma)

```prisma
model Conversation {
  id        String    @id @default(cuid())
  accountId Int
  title     String?
  model     String    @default("openai/gpt-5-mini")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  account  Account   @relation(fields: [accountId], references: [id], onDelete: Cascade)
  messages Message[]

  @@index([accountId])
  @@index([accountId, updatedAt(sort: Desc)])
}

model Message {
  id             String              @id @default(cuid())
  conversationId String
  role           String              // "user" | "assistant" | "system"
  content        String
  reasoning      String?
  metadata       String?             // JSON: { tokens, duration, model }
  createdAt      DateTime            @default(now())

  conversation Conversation        @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  attachments  MessageAttachment[]

  @@index([conversationId])
  @@index([conversationId, createdAt])
}

model MessageAttachment {
  id        String   @id @default(cuid())
  messageId String
  fileUrl   String
  fileName  String
  fileType  String
  fileSize  Int
  createdAt DateTime @default(now())

  message Message @relation(fields: [messageId], references: [id], onDelete: Cascade)

  @@index([messageId])
}
```

#### 2. Conversation Repository (server/src/repositories/conversation.repository.ts)

```typescript
import { prisma } from '../database'

export const conversationRepository = {
  async findByAccountId(accountId: number, { limit = 20, offset = 0, search = '' }) {
    const where = {
      accountId,
      deletedAt: null,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { messages: { some: { content: { contains: search, mode: 'insensitive' } } } },
        ],
      }),
    }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          _count: { select: { messages: true } },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { content: true, createdAt: true },
          },
        },
      }),
      prisma.conversation.count({ where }),
    ])

    return { conversations, total }
  },

  async findById(id: string, accountId: number) {
    return prisma.conversation.findFirst({
      where: { id, accountId, deletedAt: null },
    })
  },

  async create(data: { accountId: number; title?: string; model?: string }) {
    return prisma.conversation.create({
      data: {
        accountId: data.accountId,
        title: data.title || null,
        model: data.model || 'openai/gpt-5-mini',
      },
    })
  },

  async update(id: string, accountId: number, data: { title?: string }) {
    return prisma.conversation.updateMany({
      where: { id, accountId, deletedAt: null },
      data,
    })
  },

  async softDelete(id: string, accountId: number) {
    return prisma.conversation.updateMany({
      where: { id, accountId, deletedAt: null },
      data: { deletedAt: new Date() },
    })
  },
}
```

#### 3. Conversation Service (server/src/services/conversation.service.ts)

```typescript
import { conversationRepository } from '../repositories/conversation.repository'
import { messageRepository } from '../repositories/message.repository'

export const conversationService = {
  async list(accountId: number, filters: { limit?: number; offset?: number; search?: string }) {
    return conversationRepository.findByAccountId(accountId, filters)
  },

  async get(id: string, accountId: number) {
    const conversation = await conversationRepository.findById(id, accountId)
    if (!conversation) {
      throw new Error('Conversation not found')
    }
    return conversation
  },

  async create(accountId: number, data: { title?: string; model?: string }) {
    return conversationRepository.create({ accountId, ...data })
  },

  async updateTitle(id: string, accountId: number, title: string) {
    await conversationRepository.update(id, accountId, { title })
  },

  async delete(id: string, accountId: number) {
    await conversationRepository.softDelete(id, accountId)
  },

  async autoGenerateTitle(conversationId: string, accountId: number, firstMessage: string) {
    // Extract first 50 chars, trim, fallback to timestamp
    const title =
      firstMessage.trim().slice(0, 50) || `New Conversation - ${new Date().toISOString()}`
    await conversationRepository.update(conversationId, accountId, { title })
  },

  async exportToJSON(id: string, accountId: number) {
    const conversation = await conversationRepository.findById(id, accountId)
    if (!conversation) throw new Error('Conversation not found')

    const messages = await messageRepository.findByConversationId(id)

    return {
      id: conversation.id,
      title: conversation.title,
      model: conversation.model,
      createdAt: conversation.createdAt,
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        reasoning: m.reasoning,
        metadata: m.metadata ? JSON.parse(m.metadata) : null,
        createdAt: m.createdAt,
        attachments: m.attachments,
      })),
    }
  },

  async exportToMarkdown(id: string, accountId: number) {
    const data = await this.exportToJSON(id, accountId)
    let md = `# ${data.title}\n\n**Model:** ${data.model}  \n**Created:** ${new Date(data.createdAt).toLocaleString()}\n\n---\n\n`

    data.messages.forEach((msg, idx) => {
      md += `## Message ${idx + 1} (${msg.role})\n*${new Date(msg.createdAt).toLocaleString()}*\n\n${msg.content}\n\n`
      if (msg.reasoning) {
        md += `<details>\n<summary>Reasoning</summary>\n${msg.reasoning}\n</details>\n\n`
      }
      if (msg.attachments.length > 0) {
        md += `**Attachments:**\n`
        msg.attachments.forEach((att) => {
          md += `- [${att.fileName}](${att.fileUrl})\n`
        })
        md += `\n`
      }
      md += `---\n\n`
    })

    return md
  },
}
```

#### 4. Message Service (server/src/services/message.service.ts)

```typescript
import { messageRepository } from '../repositories/message.repository'
import { conversationService } from './conversation.service'

export const messageService = {
  async list(
    conversationId: string,
    accountId: number,
    filters: { limit?: number; offset?: number }
  ) {
    // Verify user owns conversation
    await conversationService.get(conversationId, accountId)
    return messageRepository.findByConversationId(conversationId, filters)
  },

  async createUserMessage(
    conversationId: string,
    accountId: number,
    content: string,
    attachments: string[] = []
  ) {
    // Verify ownership
    await conversationService.get(conversationId, accountId)

    const message = await messageRepository.create({
      conversationId,
      role: 'user',
      content,
      reasoning: null,
      metadata: null,
    })

    // Link attachments if provided
    if (attachments.length > 0) {
      await messageRepository.addAttachments(message.id, attachments)
    }

    // Auto-generate title if this is the first message
    const messageCount = await messageRepository.count(conversationId)
    if (messageCount === 1) {
      await conversationService.autoGenerateTitle(conversationId, accountId, content)
    }

    return message
  },

  async createAssistantMessage(
    conversationId: string,
    accountId: number,
    content: string,
    reasoning?: string,
    metadata?: { tokens?: any; duration?: number; model?: string }
  ) {
    await conversationService.get(conversationId, accountId)

    return messageRepository.create({
      conversationId,
      role: 'assistant',
      content,
      reasoning: reasoning || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    })
  },
}
```

#### 5. LLM Service Integration (server/src/services/llm.service.ts)

Extend existing streaming service to save messages:

```typescript
// Add conversationId parameter
export async function streamLLMResponse(
  prompt: string,
  accountId: number,
  conversationId?: string
) {
  // Existing streaming logic...

  let fullContent = ''
  let fullReasoning = ''
  const startTime = Date.now()

  // Stream chunks as before
  for await (const chunk of streamChunks) {
    if (chunk.type === 'text-delta') fullContent += chunk.delta
    if (chunk.type === 'reasoning-delta') fullReasoning += chunk.delta
    yield chunk
  }

  // After stream completes, save assistant message
  if (conversationId) {
    const duration = Date.now() - startTime
    await messageService.createAssistantMessage(
      conversationId,
      accountId,
      fullContent,
      fullReasoning,
      { duration, model: envConfig.LLM_API_MODEL }
    )
  }
}
```

#### 6. Conversation Controller (server/src/controllers/conversation.controller.ts)

```typescript
import { FastifyRequest, FastifyReply } from 'fastify'
import { conversationService } from '../services/conversation.service'

export const conversationController = {
  async list(
    req: FastifyRequest<{ Querystring: { limit?: number; offset?: number; search?: string } }>,
    reply: FastifyReply
  ) {
    const accountId = req.user.id // From auth hook
    const { limit, offset, search } = req.query

    const result = await conversationService.list(accountId, { limit, offset, search })
    return reply.send(result)
  },

  async get(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const accountId = req.user.id
    const { id } = req.params

    const conversation = await conversationService.get(id, accountId)
    return reply.send(conversation)
  },

  async create(
    req: FastifyRequest<{ Body: { title?: string; model?: string } }>,
    reply: FastifyReply
  ) {
    const accountId = req.user.id
    const { title, model } = req.body

    const conversation = await conversationService.create(accountId, { title, model })
    return reply.status(201).send(conversation)
  },

  async update(
    req: FastifyRequest<{ Params: { id: string }; Body: { title: string } }>,
    reply: FastifyReply
  ) {
    const accountId = req.user.id
    const { id } = req.params
    const { title } = req.body

    await conversationService.updateTitle(id, accountId, title)
    return reply.send({ success: true })
  },

  async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const accountId = req.user.id
    const { id } = req.params

    await conversationService.delete(id, accountId)
    return reply.send({ success: true })
  },

  async export(
    req: FastifyRequest<{ Params: { id: string }; Querystring: { format: 'json' | 'markdown' } }>,
    reply: FastifyReply
  ) {
    const accountId = req.user.id
    const { id } = req.params
    const { format } = req.query

    if (format === 'json') {
      const data = await conversationService.exportToJSON(id, accountId)
      reply.header('Content-Disposition', `attachment; filename="conversation-${id}.json"`)
      return reply.send(data)
    } else {
      const markdown = await conversationService.exportToMarkdown(id, accountId)
      reply.header('Content-Disposition', `attachment; filename="conversation-${id}.md"`)
      reply.type('text/markdown')
      return reply.send(markdown)
    }
  },
}
```

### Patterns & Best Practices

#### Repository Pattern

- All Prisma queries encapsulated in repositories
- Makes testing easier (mock repositories instead of Prisma)
- Single source of truth for database operations

#### Service Layer

- Business logic separated from controllers
- Reusable across different endpoints
- Handles authorization checks (user ownership)

#### Error Handling

```typescript
// Use custom error classes
class NotFoundError extends Error {
  statusCode = 404
}

class ForbiddenError extends Error {
  statusCode = 403
}

// In service:
if (!conversation) throw new NotFoundError('Conversation not found')

// In error handler plugin:
fastify.setErrorHandler((error, req, reply) => {
  reply.status(error.statusCode || 500).send({ error: error.message })
})
```

#### Optimistic Updates (Frontend)

```typescript
const { mutate: deleteConversation } = useDeleteConversation()

const handleDelete = (id: string) => {
  deleteConversation(id, {
    onMutate: async (deletedId) => {
      // Optimistically remove from UI
      await queryClient.cancelQueries(['conversations'])
      const previous = queryClient.getQueryData(['conversations'])
      queryClient.setQueryData(['conversations'], (old: any) => ({
        ...old,
        conversations: old.conversations.filter((c: any) => c.id !== deletedId),
      }))
      return { previous }
    },
    onError: (err, deletedId, context) => {
      // Rollback on error
      queryClient.setQueryData(['conversations'], context.previous)
    },
  })
}
```

## Integration Points

**How do pieces connect?**

### Backend Routes Registration

```typescript
// server/src/index.ts
import { conversationRoutes } from './routes/conversation.route'
import { messageRoutes } from './routes/message.route'

fastify.register(conversationRoutes, { prefix: '/api' })
fastify.register(messageRoutes, { prefix: '/api' })
```

### Frontend API Client

```typescript
// client/src/apiRequests/conversation.ts
import http from '@/lib/http'

export const conversationApiRequest = {
  list: (params: { limit?: number; offset?: number; search?: string }) =>
    http.get('/conversations', { params }),

  get: (id: string) => http.get(`/conversations/${id}`),

  create: (data: { title?: string; model?: string }) => http.post('/conversations', data),

  update: (id: string, data: { title: string }) => http.patch(`/conversations/${id}`, data),

  delete: (id: string) => http.delete(`/conversations/${id}`),
}
```

### React Query Hooks

```typescript
// client/src/queries/useConversations.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { conversationApiRequest } from '@/apiRequests/conversation'

export const useConversationList = (params: { search?: string }) => {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: () => conversationApiRequest.list(params),
  })
}

export const useDeleteConversation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: conversationApiRequest.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations'])
    },
  })
}
```

## Error Handling

**How do we handle failures?**

### Backend

- Use try-catch in controllers, pass errors to Fastify error handler
- Return consistent error format: `{ error: string, code?: string }`
- Log errors with context (user ID, conversation ID, stack trace)

### Frontend

- Display toast notifications for errors (use existing toast system)
- Show inline error states in forms (validation errors)
- Retry failed requests automatically (React Query retry logic)
- Graceful degradation: If conversation list fails, show empty state with retry button

## Performance Considerations

**How do we keep it fast?**

### Database

- Indexes on `(accountId, updatedAt)` for conversation list queries
- Indexes on `(conversationId, createdAt)` for message chronological order
- Pagination to limit result sets (default 20 conversations, 50 messages)
- Use `select` in Prisma to fetch only needed fields

### File Storage

- Store files in organized folders to avoid too many files in one directory
- Use CUID as filename to avoid collisions and sanitize user input
- Serve files via Fastify static plugin (or CDN in production)

### Frontend

- React Query caching reduces API calls
- Optimistic updates for instant UI feedback
- Lazy load conversation messages (don't fetch until conversation is opened)
- Virtualize long conversation lists (if needed for 100+ conversations)

## Security Notes

**What security measures are in place?**

### Authentication & Authorization

- All endpoints protected by `authHook` (require valid JWT/session)
- User ownership enforced in service layer (check `accountId` on all queries)
- Return 403 Forbidden if user tries to access another user's conversation

### File Upload Security

- Validate MIME type and file extension (whitelist: images, PDFs, text files)
- Reject files >10MB to prevent DoS
- Sanitize filenames (remove path traversal chars: `../`, `..\\`)
- Store files outside web root, serve via controlled endpoint

### Input Validation

- Use Zod schemas to validate all request bodies and query params
- Sanitize user input (conversation titles, message content) to prevent XSS
- Rate limit API endpoints to prevent abuse (use Fastify rate-limit plugin)

### Data Privacy

- Soft delete allows recovery but respects GDPR "right to be forgotten" (add hard delete endpoint for compliance)
- Don't log sensitive user data (message content, file contents)
- Ensure file URLs are not guessable (use CUID, not sequential IDs)
