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
    let reasoningStartTime: number | null = null
    let thinkingSeconds: number | null = null

    // Batching for slower streaming - accumulate text deltas
    let textDeltaBuffer = ''
    let batchTimer: NodeJS.Timeout | null = null
    const BATCH_DELAY_MS = 55 // Delay between batches for smoother streaming
    const MIN_BATCH_SIZE = 6 // Minimum characters before sending batch

    const flushTextBatch = () => {
      if (textDeltaBuffer.length > 0) {
        onChunk({ type: 'answer', delta: textDeltaBuffer })
        textDeltaBuffer = ''
      }
      if (batchTimer) {
        clearTimeout(batchTimer)
        batchTimer = null
      }
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        // Flush any remaining batched content
        flushTextBatch()
        break
      }
      buffer += decoder.decode(value, { stream: true })

      let newlineIndex = buffer.indexOf('\n')
      while (newlineIndex !== -1) {
        const line = buffer.slice(0, newlineIndex).trim()
        buffer = buffer.slice(newlineIndex + 1)
        if (line) {
          // Track thinking time based on events
          try {
            const event = JSON.parse(line) as AiProxyEvent
            if (event.type === 'reasoning-start' || event.type === 'reasoning-delta') {
              // Track reasoning start time
              if (reasoningStartTime === null) {
                reasoningStartTime = Date.now()
              }
            } else if (event.type === 'text-start' || event.type === 'reasoning-end') {
              // Calculate thinking seconds when text starts or reasoning ends
              if (reasoningStartTime !== null && thinkingSeconds === null) {
                thinkingSeconds = Math.floor((Date.now() - reasoningStartTime) / 1000)
              }
            }

            // Handle text-delta with batching
            if (event.type === 'text-delta' && event.delta) {
              textDeltaBuffer += event.delta
              fullContent += event.delta

              // Send batch if it reaches minimum size or schedule delayed send
              if (textDeltaBuffer.length >= MIN_BATCH_SIZE) {
                flushTextBatch()
              } else if (!batchTimer) {
                // Schedule batch send after delay
                batchTimer = setTimeout(() => {
                  flushTextBatch()
                }, BATCH_DELAY_MS)
              }
            } else {
              // For non-text-delta events, flush any pending text batch first
              flushTextBatch()
              const eventResult = this.handleProxyEvent(line, onChunk)
              if (eventResult.content) fullContent += eventResult.content
              if (eventResult.reasoning) fullReasoning += eventResult.reasoning
            }
          } catch (error) {
            // Ignore parse errors, try to handle as proxy event
            flushTextBatch()
            const eventResult = this.handleProxyEvent(line, onChunk)
            if (eventResult.content) fullContent += eventResult.content
            if (eventResult.reasoning) fullReasoning += eventResult.reasoning
          }
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
            duration,
            thinkingSeconds: thinkingSeconds || undefined
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
          // Batch text deltas and send with slight delay for slower streaming
          result.content = event.delta
          // Send chunk immediately but client will throttle it
          onChunk({ type: 'answer', delta: event.delta })
        }
        break
      case 'reasoning-delta':
        if (event.delta) {
          result.reasoning = event.delta
          // Send chunk immediately but client will throttle it
          onChunk({ type: 'thinking', reasoning: event.delta })
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
