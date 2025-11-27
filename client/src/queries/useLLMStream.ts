import envConfig from '@/config'
import { getAccessTokenFromLocalStorage } from '@/lib/utils'
import { useCallback, useEffect, useRef, useState } from 'react'

export type StreamStatus = 'idle' | 'thinking' | 'streaming' | 'complete' | 'error'

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

  // Batching refs for smooth streaming
  const pendingAnswerRef = useRef<string>('')
  const pendingReasoningRef = useRef<string[]>([])
  const rafIdRef = useRef<number | null>(null)
  const lastUpdateTimeRef = useRef<number>(0)
  const isProcessingRef = useRef(false)

  const reset = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    pendingAnswerRef.current = ''
    pendingReasoningRef.current = []
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    isProcessingRef.current = false
    setState(INITIAL_STATE)
  }, [])

  // Batched update function using requestAnimationFrame with slight delay for readability
  const flushUpdates = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
    }

    rafIdRef.current = requestAnimationFrame(() => {
      // Add delay to make streaming more readable and slower
      setTimeout(() => {
        setState((prev) => {
          const hasAnswerUpdate = pendingAnswerRef.current !== prev.answer
          const hasReasoningUpdate =
            pendingReasoningRef.current.length !== prev.reasoning.length ||
            pendingReasoningRef.current.some((r, i) => r !== prev.reasoning[i])

          if (!hasAnswerUpdate && !hasReasoningUpdate) {
            return prev
          }

          return {
            ...prev,
            answer: pendingAnswerRef.current,
            reasoning: pendingReasoningRef.current,
            status: pendingAnswerRef.current ? 'streaming' : prev.status,
          }
        })

        rafIdRef.current = null
        isProcessingRef.current = false
        lastUpdateTimeRef.current = Date.now()
      }, 100) // 100ms delay for slower, more readable streaming
    })
  }, [])

  const handleChunk = useCallback(
    (payload: string) => {
      let chunk: StreamChunk | null = null
      try {
        chunk = JSON.parse(payload) as StreamChunk
      } catch (error) {
        console.error('Unable to parse LLM chunk', { payload, error })
        return
      }

      if (!chunk) return

      // Handle immediate updates (status changes, errors, complete)
      if (chunk.type === 'complete' || chunk.type === 'error') {
        // Flush any pending updates first
        if (
          isProcessingRef.current &&
          (pendingAnswerRef.current || pendingReasoningRef.current.length > 0)
        ) {
          // Cancel any pending animation frame and flush immediately
          if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current)
            rafIdRef.current = null
          }
          // Flush updates synchronously
          setState((prev) => ({
            ...prev,
            answer: pendingAnswerRef.current,
            reasoning: pendingReasoningRef.current,
          }))
          isProcessingRef.current = false
        } else if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current)
          rafIdRef.current = null
        }

        setState((prev) => {
          if (chunk!.type === 'complete') {
            return { ...prev, status: 'complete' }
          }
          return {
            ...prev,
            status: 'error',
            error: chunk?.message || 'LLM streaming failed',
          }
        })
        return
      }

      // Handle batched updates (answer and reasoning deltas)
      if (chunk.type === 'answer' && chunk.delta) {
        pendingAnswerRef.current += chunk.delta
        isProcessingRef.current = true

        // Throttle updates to ~10fps (every ~100ms) for slower, more readable streaming
        const now = Date.now()
        const timeSinceLastUpdate = now - lastUpdateTimeRef.current

        // Schedule update if enough time has passed or no update is scheduled
        if (timeSinceLastUpdate >= 100 || rafIdRef.current === null) {
          flushUpdates()
        }
        return
      }

      if (chunk.type === 'thinking') {
        if (!chunk.reasoning) {
          // Just status change
          setState((prev) => {
            return prev.status === 'thinking'
              ? prev
              : { ...prev, status: prev.status === 'idle' ? 'thinking' : prev.status }
          })
          return
        }

        // Batch reasoning updates
        pendingReasoningRef.current = [...pendingReasoningRef.current, chunk.reasoning]
        isProcessingRef.current = true

        // Throttle updates to ~10fps (every ~100ms) for slower, more readable streaming
        const now = Date.now()
        const timeSinceLastUpdate = now - lastUpdateTimeRef.current

        // Schedule update if enough time has passed or no update is scheduled
        if (timeSinceLastUpdate >= 100 || rafIdRef.current === null) {
          flushUpdates()
        }
      }
    },
    [flushUpdates]
  )

  const start = useCallback(
    async (prompt: string, conversationId?: string) => {
      const trimmed = prompt.trim()
      if (!trimmed) return

      console.log('🚀 Starting LLM stream:', { prompt: trimmed, conversationId })

      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller

      // Reset pending refs
      pendingAnswerRef.current = ''
      pendingReasoningRef.current = []
      isProcessingRef.current = false
      lastUpdateTimeRef.current = Date.now()

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }

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
          if (done) {
            // Flush any pending updates before completing
            if (isProcessingRef.current && pendingAnswerRef.current) {
              flushUpdates()
            }
            break
          }
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
    [handleChunk, flushUpdates]
  )

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setState(INITIAL_STATE)
  }, [])

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
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
