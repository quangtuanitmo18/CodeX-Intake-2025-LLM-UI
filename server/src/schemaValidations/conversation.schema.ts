import z from 'zod'

// ==================== Request Schemas ====================

// Query params for list conversations
// Note: projectId accepts any string value including 'standalone' or 'null' for filtering
// CUID validation is handled in the repository layer
export const ListConversationsQuery = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().optional(),
  projectId: z.string().optional()
})

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
    title: z
      .string()
      .min(1, { message: 'Title must be at least 1 character' })
      .max(200, { message: 'Title must not exceed 200 characters' })
      .optional(),
    model: z
      .string()
      .min(1, { message: 'Model must be at least 1 character' })
      .max(100, { message: 'Model must not exceed 100 characters' })
      .optional(),
    projectId: z.string().cuid({ message: 'Project ID must be a valid CUID' }).optional()
  })
  .strict()

export type CreateConversationBodyType = z.TypeOf<typeof CreateConversationBody>

export const UpdateConversationProjectBody = z
  .object({
    projectId: z.string().cuid({ message: 'Project ID must be a valid CUID' }).nullable()
  })
  .strict()

export type UpdateConversationProjectBodyType = z.TypeOf<typeof UpdateConversationProjectBody>

// Body for updating conversation
export const UpdateConversationBody = z
  .object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(1, { message: 'Title must be at least 1 character' })
      .max(200, { message: 'Title must not exceed 200 characters' })
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
    projectId: z.string().cuid().nullable(),
    title: z.string().nullable(),
    model: z.string().nullable(),
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
      projectId: z.string().cuid().nullable(),
      title: z.string().nullable(),
      model: z.string().nullable(),
      createdAt: z.date(),
      updatedAt: z.date(),
      deletedAt: z.date().nullable()
    })
  ),
  message: z.string()
})

export type ConversationListResType = z.TypeOf<typeof ConversationListRes>
