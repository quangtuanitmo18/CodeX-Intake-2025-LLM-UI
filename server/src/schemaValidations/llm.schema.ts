import z from 'zod'

export const LLMStreamBody = z
  .object({
    prompt: z
      .string({ required_error: 'Prompt is required' })
      .min(1, { message: 'Prompt must be at least 1 character' })
      .max(4000, { message: 'Prompt must not exceed 4000 characters' }),
    sessionId: z.string().optional(),
    conversationId: z.string().cuid({ message: 'Conversation ID must be a valid CUID' }).optional()
  })
  .strict()

export type LLMStreamBodyType = z.TypeOf<typeof LLMStreamBody>
