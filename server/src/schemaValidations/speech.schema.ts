import z from 'zod'

// Control messages from client to server
export const StartMessageSchema = z.object({
  type: z.literal('Start'),
  model: z.string().optional(),
  // Accept both short codes (vi, en, ru) and BCP-47 format (vi-VN, en-US, ru-RU)
  language: z.enum(['vi', 'en', 'ru', 'vi-VN', 'en-US', 'ru-RU', 'multi']).optional(),
  detect_language: z.boolean().optional()
})

export const FinalizeMessageSchema = z.object({
  type: z.literal('Finalize')
})

export const CloseStreamMessageSchema = z.object({
  type: z.literal('CloseStream')
})

export const KeepAliveMessageSchema = z.object({
  type: z.literal('KeepAlive')
})

export const ControlMessageSchema = z.discriminatedUnion('type', [
  StartMessageSchema,
  FinalizeMessageSchema,
  CloseStreamMessageSchema,
  KeepAliveMessageSchema
])

export type StartMessageType = z.infer<typeof StartMessageSchema>
export type FinalizeMessageType = z.infer<typeof FinalizeMessageSchema>
export type CloseStreamMessageType = z.infer<typeof CloseStreamMessageSchema>
export type KeepAliveMessageType = z.infer<typeof KeepAliveMessageSchema>
export type ControlMessageType = z.infer<typeof ControlMessageSchema>

// WebSocket query parameters
export const SpeechWebSocketQuerySchema = z.object({
  token: z.string().min(1, 'Token is required'),
  language: z.string().optional(),
  model: z.string().optional()
})

export type SpeechWebSocketQueryType = z.infer<typeof SpeechWebSocketQuerySchema>

// Response messages from server to client
export const TranscriptMessageSchema = z.object({
  type: z.literal('Transcript'),
  transcript: z.string(),
  is_final: z.boolean(),
  speech_final: z.boolean(),
  raw: z.any().optional()
})

export const ReadyMessageSchema = z.object({
  type: z.literal('Ready')
})

export const MetadataMessageSchema = z.object({
  type: z.literal('Metadata'),
  raw: z.any()
})

export const ErrorMessageSchema = z.object({
  type: z.literal('Error'),
  message: z.string(),
  raw: z.any().optional()
})

export const ClosedMessageSchema = z.object({
  type: z.literal('Closed')
})

export const ServerMessageSchema = z.discriminatedUnion('type', [
  TranscriptMessageSchema,
  ReadyMessageSchema,
  MetadataMessageSchema,
  ErrorMessageSchema,
  ClosedMessageSchema
])

export type TranscriptMessageType = z.infer<typeof TranscriptMessageSchema>
export type ReadyMessageType = z.infer<typeof ReadyMessageSchema>
export type MetadataMessageType = z.infer<typeof MetadataMessageSchema>
export type ErrorMessageType = z.infer<typeof ErrorMessageSchema>
export type ClosedMessageType = z.infer<typeof ClosedMessageSchema>
export type ServerMessageType = z.infer<typeof ServerMessageSchema>
