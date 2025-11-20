import envConfig from '@/config'
import { messageService } from './message.service'

export type LLMStreamChunk = {
  type: 'thinking' | 'answer' | 'complete' | 'error'
  delta?: string
  reasoning?: string
  remainingTimeMs?: number
  metadata?: Record<string, unknown>
}

type StreamParams = {
  prompt: string
  sessionId?: string
  conversationId?: string
  accountId?: number
  signal?: AbortSignal
  onChunk: (chunk: LLMStreamChunk) => void
}

type AiProxyEvent =
  | { type: 'start' | 'text-start' | 'text-end' | 'reasoning-start' | 'reasoning-end' | 'finish' }
  | { type: 'text-delta'; delta: string }
  | { type: 'reasoning-delta'; delta: string }
  | { type: 'error'; error: string }

class LLMService {
  async stream({ prompt, sessionId, conversationId, accountId, signal, onChunk }: StreamParams) {
    if (!envConfig.LLM_API_URL || !envConfig.LLM_API_TOKEN) {
      throw new Error('LLM provider is not configured')
    }

    // Note: User message is created by the client before calling this stream endpoint
    // We only need to save the assistant's response after streaming completes

    const response = await fetch(`${envConfig.LLM_API_URL}/stream`, {
      method: 'POST',
      headers: {
        'x-api-key': envConfig.LLM_API_TOKEN,
        'Content-Type': 'application/json',
        Accept: 'application/x-ndjson'
      },
      body: JSON.stringify({
        prompt,
        sessionId
        // model: envConfig.LLM_API_MODEL
      }),
      signal
    })

    if (!response.ok || !response.body) {
      const errorPayload = await response.text().catch(() => 'LLM proxy error')
      throw new Error(`LLM proxy error: ${errorPayload}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    // Accumulate content and reasoning for saving after streaming
    let fullContent = ''
    let fullReasoning = ''
    const startTime = Date.now()

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      let newlineIndex = buffer.indexOf('\n')
      while (newlineIndex !== -1) {
        const line = buffer.slice(0, newlineIndex).trim()
        buffer = buffer.slice(newlineIndex + 1)
        if (line) {
          const accumulated = this.handleProxyEvent(line, onChunk)
          if (accumulated.content) fullContent += accumulated.content
          if (accumulated.reasoning) fullReasoning += accumulated.reasoning
        }
        newlineIndex = buffer.indexOf('\n')
      }
    }

    // Save assistant message if conversationId and accountId provided
    if (conversationId && accountId && fullContent) {
      try {
        const duration = Date.now() - startTime
        await messageService.createAssistantMessage(
          conversationId,
          accountId,
          fullContent,
          fullReasoning || undefined,
          {
            // model: envConfig.LLM_API_MODEL,
            duration
          }
        )
      } catch (error) {
        console.error('Failed to save assistant message to database:', {
          conversationId,
          accountId,
          contentLength: fullContent.length,
          error: error instanceof Error ? error.message : error
        })
        // Don't throw - streaming already completed successfully for user
        // Could implement retry logic or dead letter queue here
      }
    }
  }

  private handleProxyEvent(
    rawLine: string,
    onChunk: (chunk: LLMStreamChunk) => void
  ): { content?: string; reasoning?: string } {
    let event: AiProxyEvent | null = null
    try {
      event = JSON.parse(rawLine) as AiProxyEvent
    } catch (error) {
      console.error('Unable to parse NDJSON line from ai-proxy', { rawLine, error })
      return {}
    }

    const result: { content?: string; reasoning?: string } = {}

    switch (event.type) {
      case 'text-delta':
        if (event.delta) {
          onChunk({ type: 'answer', delta: event.delta })
          result.content = event.delta
        }
        break
      case 'reasoning-delta':
        if (event.delta) {
          onChunk({ type: 'thinking', reasoning: event.delta })
          result.reasoning = event.delta
        }
        break
      case 'text-start':
      case 'start':
      case 'reasoning-start':
        onChunk({ type: 'thinking', metadata: { event: event.type } })
        break
      case 'text-end':
      case 'reasoning-end':
        onChunk({ type: 'thinking', metadata: { event: event.type } })
        break
      case 'finish':
        onChunk({ type: 'complete' })
        break
      case 'error':
        onChunk({ type: 'error', metadata: { error: event.error } })
        break
      default:
        onChunk({ type: 'thinking', metadata: { event: (event as any).type } })
        break
    }

    return result
  }
}

export const llmService = new LLMService()
