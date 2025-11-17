import z from 'zod'

export const LLMStreamBody = z
  .object({
    prompt: z.string().min(1).max(4000),
    sessionId: z.string().optional(),
    conversationId: z.string().cuid().optional()
  })
  .strict()

export type LLMStreamBodyType = z.TypeOf<typeof LLMStreamBody>
