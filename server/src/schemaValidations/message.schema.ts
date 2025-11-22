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
    content: z
      .string({ required_error: 'Message content is required' })
      .min(1, { message: 'Message content must be at least 1 character' })
      .max(10000, { message: 'Message content must not exceed 10000 characters' }),
    attachments: z
      .array(
        z.object({
          fileUrl: z.string().url({ message: 'File URL must be a valid URL' }),
          fileName: z
            .string()
            .min(1, { message: 'File name must be at least 1 character' })
            .max(255, { message: 'File name must not exceed 255 characters' }),
          fileType: z
            .string()
            .min(1, { message: 'File type must be at least 1 character' })
            .max(100, { message: 'File type must not exceed 100 characters' }),
          fileSize: z
            .number()
            .int({ message: 'File size must be an integer' })
            .positive({ message: 'File size must be positive' })
            .max(10485760, { message: 'File size must not exceed 10MB' }) // 10MB
        })
      )
      .max(10, { message: 'Maximum 10 attachments allowed' })
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
