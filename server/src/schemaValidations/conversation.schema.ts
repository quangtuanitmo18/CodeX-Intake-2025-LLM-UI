import z from 'zod'

// ==================== Request Schemas ====================

// Query params for list conversations
export const ListConversationsQuery = z
  .object({
    limit: z.coerce.number().int().positive().max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
    search: z.string().optional()
  })
  .strict()

export type ListConversationsQueryType = z.TypeOf<typeof ListConversationsQuery>

// Param for conversation ID
export const ConversationIdParam = z
  .object({
    id: z.string().cuid()
  })
  .strict()

export type ConversationIdParamType = z.TypeOf<typeof ConversationIdParam>

// Body for creating conversation
export const CreateConversationBody = z
  .object({
    title: z.string().min(1).max(200).optional(),
    model: z.string().min(1).max(100).optional()
  })
  .strict()

export type CreateConversationBodyType = z.TypeOf<typeof CreateConversationBody>

// Body for updating conversation
export const UpdateConversationBody = z
  .object({
    title: z.string().min(1).max(200)
  })
  .strict()

export type UpdateConversationBodyType = z.TypeOf<typeof UpdateConversationBody>

// Query params for export format
export const ExportConversationQuery = z
  .object({
    format: z.enum(['json', 'markdown']).default('json')
  })
  .strict()

export type ExportConversationQueryType = z.TypeOf<typeof ExportConversationQuery>

// ==================== Response Schemas ====================

// Single conversation response
export const ConversationRes = z.object({
  data: z.object({
    id: z.string().cuid(),
    accountId: z.number().int().positive(),
    title: z.string().nullable(),
    model: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable()
  }),
  message: z.string()
})

export type ConversationResType = z.TypeOf<typeof ConversationRes>

// List conversations response
export const ConversationListRes = z.object({
  data: z.array(
    z.object({
      id: z.string().cuid(),
      accountId: z.number().int().positive(),
      title: z.string().nullable(),
      model: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
      deletedAt: z.date().nullable()
    })
  ),
  message: z.string()
})

export type ConversationListResType = z.TypeOf<typeof ConversationListRes>
