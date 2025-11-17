import z from 'zod'

// ==================== Request Schemas ====================

// Query params for list messages
export const ListMessagesQuery = z
  .object({
    limit: z.coerce.number().int().positive().max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0)
  })
  .strict()

export type ListMessagesQueryType = z.TypeOf<typeof ListMessagesQuery>

// Param for message in conversation
export const MessageConversationParam = z
  .object({
    conversationId: z.string().cuid()
  })
  .strict()

export type MessageConversationParamType = z.TypeOf<typeof MessageConversationParam>

// Body for creating user message
export const CreateMessageBody = z
  .object({
    content: z.string().min(1).max(10000),
    attachments: z
      .array(
        z.object({
          fileUrl: z.string().url(),
          fileName: z.string().min(1).max(255),
          fileType: z.string().min(1).max(100),
          fileSize: z.number().int().positive().max(10485760) // 10MB
        })
      )
      .max(10)
      .optional()
  })
  .strict()

export type CreateMessageBodyType = z.TypeOf<typeof CreateMessageBody>

// ==================== Response Schemas ====================

// Single message response
export const MessageRes = z.object({
  data: z.object({
    id: z.string().cuid(),
    conversationId: z.string().cuid(),
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    reasoning: z.string().nullable(),
    metadata: z.string().nullable(),
    createdAt: z.date(),
    attachments: z.array(
      z.object({
        id: z.string().cuid(),
        messageId: z.string().cuid(),
        fileUrl: z.string(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        createdAt: z.date()
      })
    )
  }),
  message: z.string()
})

export type MessageResType = z.TypeOf<typeof MessageRes>

// List messages response
export const MessageListRes = z.object({
  data: z.array(
    z.object({
      id: z.string().cuid(),
      conversationId: z.string().cuid(),
      role: z.enum(['user', 'assistant']),
      content: z.string(),
      reasoning: z.string().nullable(),
      metadata: z.string().nullable(),
      createdAt: z.date(),
      attachments: z.array(
        z.object({
          id: z.string().cuid(),
          messageId: z.string().cuid(),
          fileUrl: z.string(),
          fileName: z.string(),
          fileType: z.string(),
          fileSize: z.number(),
          createdAt: z.date()
        })
      )
    })
  ),
  message: z.string()
})

export type MessageListResType = z.TypeOf<typeof MessageListRes>
