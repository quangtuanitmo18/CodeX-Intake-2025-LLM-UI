import z from 'zod'

export const UploadMediaRes = z.object({
  data: z.string(),
  message: z.string()
})

export type UploadMediaResType = z.TypeOf<typeof UploadMediaRes>

// Upload attachment response
export const UploadAttachmentRes = z.object({
  data: z.object({
    fileId: z.string(),
    fileName: z.string(),
    fileUrl: z.string(),
    fileType: z.string(),
    fileSize: z.number()
  }),
  message: z.string()
})

export type UploadAttachmentResType = z.TypeOf<typeof UploadAttachmentRes>

// Query params for conversation ID
export const UploadAttachmentQuery = z
  .object({
    conversationId: z.string().cuid({ message: 'Conversation ID must be a valid CUID' }),
    messageId: z.string().cuid({ message: 'Message ID must be a valid CUID' }).optional()
  })
  .strict()

export type UploadAttachmentQueryType = z.TypeOf<typeof UploadAttachmentQuery>
