import z from 'zod'

// ==================== Body Schemas ====================

export const CreateConversationBody = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    model: z.string().trim().min(1).max(100).optional(),
  })
  .strict()

export type CreateConversationBodyType = z.TypeOf<typeof CreateConversationBody>

export const UpdateConversationBody = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(200, 'Title must be less than 200 characters'),
  })
  .strict()

export type UpdateConversationBodyType = z.TypeOf<typeof UpdateConversationBody>

export const CreateMessageBody = z
  .object({
    content: z
      .string()
      .trim()
      .min(1, 'Message content is required')
      .max(10000, 'Message is too long'),
    attachments: z
      .array(
        z.object({
          fileUrl: z.string().url(),
          fileName: z.string().min(1).max(255),
          fileType: z.string().min(1).max(100),
          fileSize: z.number().int().positive().max(10485760, 'File must be smaller than 10MB'),
        })
      )
      .max(10, 'Maximum 10 attachments allowed')
      .optional(),
  })
  .strict()

export type CreateMessageBodyType = z.TypeOf<typeof CreateMessageBody>

// ==================== Response Schemas ====================

export const ConversationSchema = z.object({
  id: z.string(),
  accountId: z.number(),
  title: z.string().nullable(),
  model: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
})

export type ConversationType = z.infer<typeof ConversationSchema>

export const ConversationRes = z.object({
  data: ConversationSchema,
  message: z.string(),
})

export type ConversationResType = z.infer<typeof ConversationRes>

export const ConversationListRes = z.object({
  data: z.array(ConversationSchema),
  message: z.string(),
})

export type ConversationListResType = z.infer<typeof ConversationListRes>

export const MessageAttachmentSchema = z.object({
  id: z.string(),
  messageId: z.string(),
  fileUrl: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  createdAt: z.string(),
})

export type MessageAttachmentType = z.infer<typeof MessageAttachmentSchema>

export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  reasoning: z.string().nullable(),
  metadata: z.string().nullable(),
  createdAt: z.string(),
  attachments: z.array(MessageAttachmentSchema),
})

export type MessageType = z.infer<typeof MessageSchema>

export const MessageRes = z.object({
  data: MessageSchema,
  message: z.string(),
})

export type MessageResType = z.infer<typeof MessageRes>

export const MessageListRes = z.object({
  data: z.array(MessageSchema),
  message: z.string(),
})

export type MessageListResType = z.infer<typeof MessageListRes>

// ==================== Query Params ====================

export const ListConversationsQuery = z.object({
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
  search: z.string().optional(),
})

export type ListConversationsQueryType = z.infer<typeof ListConversationsQuery>

export const ListMessagesQuery = z.object({
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().min(0).default(0),
})

export type ListMessagesQueryType = z.infer<typeof ListMessagesQuery>

export const ExportConversationQuery = z.object({
  format: z.enum(['json', 'markdown']).default('json'),
})

export type ExportConversationQueryType = z.infer<typeof ExportConversationQuery>
