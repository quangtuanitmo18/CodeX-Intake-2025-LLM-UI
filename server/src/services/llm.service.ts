import envConfig from '@/config'

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
  signal?: AbortSignal
  onChunk: (chunk: LLMStreamChunk) => void
}

type AiProxyEvent =
  | { type: 'start' | 'text-start' | 'text-end' | 'reasoning-start' | 'reasoning-end' | 'finish' }
  | { type: 'text-delta'; delta: string }
  | { type: 'reasoning-delta'; delta: string }
  | { type: 'error'; error: string }

class LLMService {
  async stream({ prompt, sessionId, signal, onChunk }: StreamParams) {
    if (!envConfig.LLM_API_URL || !envConfig.LLM_API_TOKEN) {
      throw new Error('LLM provider is not configured')
    }

    const response = await fetch(`${envConfig.LLM_API_URL}/stream`, {
      method: 'POST',
      headers: {
        'x-api-key': envConfig.LLM_API_TOKEN,
        'Content-Type': 'application/json',
        Accept: 'application/x-ndjson'
      },
      body: JSON.stringify({
        prompt,
        sessionId,
        model: envConfig.LLM_API_MODEL
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

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      let newlineIndex = buffer.indexOf('\n')
      while (newlineIndex !== -1) {
        const line = buffer.slice(0, newlineIndex).trim()
        buffer = buffer.slice(newlineIndex + 1)
        if (line) {
          this.handleProxyEvent(line, onChunk)
        }
        newlineIndex = buffer.indexOf('\n')
      }
    }
  }

  private handleProxyEvent(rawLine: string, onChunk: (chunk: LLMStreamChunk) => void) {
    let event: AiProxyEvent | null = null
    try {
      event = JSON.parse(rawLine) as AiProxyEvent
    } catch (error) {
      console.error('Unable to parse NDJSON line from ai-proxy', { rawLine, error })
      return
    }

    switch (event.type) {
      case 'text-delta':
        if (event.delta) {
          onChunk({ type: 'answer', delta: event.delta })
        }
        break
      case 'reasoning-delta':
        if (event.delta) {
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
  }
}

export const llmService = new LLMService()
