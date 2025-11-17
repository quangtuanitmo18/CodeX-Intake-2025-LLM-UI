import envConfig from '@/config'
import { getAccessTokenFromLocalStorage } from '@/lib/utils'
import { useCallback, useEffect, useRef, useState } from 'react'

type StreamStatus = 'idle' | 'thinking' | 'streaming' | 'complete' | 'error'

type StreamState = {
  status: StreamStatus
  answer: string
  reasoning: string[]
  error?: string
}

type StreamChunk = {
  type: 'thinking' | 'answer' | 'complete' | 'error'
  delta?: string
  reasoning?: string
  message?: string
  metadata?: Record<string, unknown>
}

const INITIAL_STATE: StreamState = {
  status: 'idle',
  answer: '',
  reasoning: [],
  error: undefined,
}

export function useLLMStream() {
  const [state, setState] = useState<StreamState>(INITIAL_STATE)
  const abortControllerRef = useRef<AbortController | null>(null)

  const reset = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setState(INITIAL_STATE)
  }, [])

  const handleChunk = useCallback((payload: string) => {
    let chunk: StreamChunk | null = null
    try {
      chunk = JSON.parse(payload) as StreamChunk
    } catch (error) {
      console.error('Unable to parse LLM chunk', { payload, error })
      return
    }

    if (!chunk) return

    setState((prev) => {
      switch (chunk!.type) {
        case 'thinking': {
          if (!chunk?.reasoning) {
            return prev.status === 'thinking'
              ? prev
              : { ...prev, status: prev.status === 'idle' ? 'thinking' : prev.status }
          }
          return {
            ...prev,
            status: prev.status === 'idle' ? 'thinking' : prev.status,
            reasoning: [...prev.reasoning, chunk.reasoning],
          }
        }
        case 'answer': {
          if (!chunk?.delta) return prev
          return {
            ...prev,
            status: 'streaming',
            answer: prev.answer ? `${prev.answer}${chunk.delta}` : chunk.delta,
          }
        }
        case 'complete':
          return { ...prev, status: 'complete' }
        case 'error':
          return {
            ...prev,
            status: 'error',
            error: chunk?.message || 'LLM streaming failed',
          }
        default:
          return prev
      }
    })
  }, [])

  const start = useCallback(
    async (prompt: string, conversationId?: string) => {
      const trimmed = prompt.trim()
      if (!trimmed) return

      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller

      setState({
        status: 'thinking',
        answer: '',
        reasoning: [],
        error: undefined,
      })

      try {
        const token = getAccessTokenFromLocalStorage()
        const response = await fetch(`${envConfig.NEXT_PUBLIC_API_ENDPOINT}/llm/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            prompt: trimmed,
            conversationId,
          }),
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          const errorPayload = await response.text().catch(() => 'Cannot start stream')
          throw new Error(errorPayload || 'Unable to start stream')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })

          let boundary = buffer.indexOf('\n\n')
          while (boundary !== -1) {
            const rawChunk = buffer.slice(0, boundary).trim()
            buffer = buffer.slice(boundary + 2)
            if (rawChunk.startsWith('data:')) {
              const payload = rawChunk.slice(5).trim()
              if (payload) handleChunk(payload)
            }
            boundary = buffer.indexOf('\n\n')
          }
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unable to reach LLM',
        }))
      }
    },
    [handleChunk]
  )

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setState(INITIAL_STATE)
  }, [])

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  return {
    status: state.status,
    answer: state.answer,
    reasoning: state.reasoning,
    error: state.error,
    start,
    cancel,
    reset,
  }
}
