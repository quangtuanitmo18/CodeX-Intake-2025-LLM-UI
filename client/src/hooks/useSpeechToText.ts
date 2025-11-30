import envConfig from '@/config'
import { getAccessTokenFromLocalStorage } from '@/lib/utils'
import { useCallback, useEffect, useRef, useState } from 'react'

// Language codes: using short codes for simplicity, Deepgram accepts both short and BCP-47
// Short codes: 'vi', 'en', 'ru' (simpler for UI)
// BCP-47 format: 'vi-VN', 'en-US', 'ru-RU' (more specific, can be used if needed)
export type Language = 'vi' | 'en' | 'ru' | 'multi'

type TranscriptMessage = {
  type: 'Transcript'
  transcript: string
  is_final: boolean
  speech_final: boolean
  raw: any
}

type WebSocketMessage =
  | { type: 'Ready' }
  | TranscriptMessage
  | { type: 'Metadata'; raw: any }
  | { type: 'Error'; message: string; raw?: any }
  | { type: 'Closed' }

function pickMimeType(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus']
  for (const t of candidates) {
    if (typeof window !== 'undefined' && window.MediaRecorder?.isTypeSupported?.(t)) {
      return t
    }
  }
  return ''
}

// Browser compatibility check
export function checkBrowserSupport(): {
  supported: boolean
  missingFeatures: string[]
} {
  const missingFeatures: string[] = []

  if (typeof window === 'undefined') {
    return { supported: false, missingFeatures: ['window object'] }
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    missingFeatures.push('getUserMedia')
  }

  if (!window.MediaRecorder) {
    missingFeatures.push('MediaRecorder')
  }

  if (!window.WebSocket) {
    missingFeatures.push('WebSocket')
  }

  // Check if HTTPS or localhost (required for getUserMedia)
  const isSecureContext =
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  if (!isSecureContext) {
    missingFeatures.push('HTTPS (required for microphone access)')
  }

  return {
    supported: missingFeatures.length === 0,
    missingFeatures,
  }
}

export function useSpeechToText(language: Language = 'vi') {
  const [isRecording, setIsRecording] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [finalTranscript, setFinalTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isReconnectingRef = useRef(false)
  const maxReconnectAttempts = 3

  const cleanup = useCallback(() => {
    // Clear reconnect timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }

    // Reset reconnection state
    isReconnectingRef.current = false
    reconnectAttemptsRef.current = 0

    // Clear transcripts when cleaning up
    setFinalTranscript('')
    setInterimTranscript('')

    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop()
      } catch (err) {
        // Ignore errors when stopping
      }
      mediaRecorderRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      streamRef.current = null
    }

    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'Finalize' }))
          wsRef.current.send(JSON.stringify({ type: 'CloseStream' }))
        }
        wsRef.current.close()
      } catch (err) {
        // Ignore errors when closing
      }
      wsRef.current = null
    }

    setIsRecording(false)
    setIsConnecting(false)
  }, [])

  const start = useCallback(async () => {
    try {
      setError(null)
      setIsConnecting(true)
      reconnectAttemptsRef.current = 0

      // Clear previous transcripts when starting new recording
      setFinalTranscript('')
      setInterimTranscript('')

      // Check browser support
      const browserSupport = checkBrowserSupport()
      if (!browserSupport.supported) {
        const missingFeatures = browserSupport.missingFeatures.join(', ')
        throw new Error(
          `Browser không hỗ trợ: ${missingFeatures}. Vui lòng sử dụng trình duyệt hiện đại hoặc bật HTTPS.`
        )
      }

      // Get microphone access
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          throw new Error(
            'Quyền truy cập microphone bị từ chối. Vui lòng cho phép truy cập microphone trong cài đặt trình duyệt và thử lại.'
          )
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          throw new Error('Không tìm thấy microphone. Vui lòng kiểm tra thiết bị của bạn.')
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          throw new Error(
            'Microphone đang được sử dụng bởi ứng dụng khác. Vui lòng đóng ứng dụng đó và thử lại.'
          )
        } else {
          throw new Error(`Lỗi truy cập microphone: ${err.message || 'Unknown error'}`)
        }
      }
      streamRef.current = stream

      // Get access token for WebSocket authentication
      const accessToken = getAccessTokenFromLocalStorage()
      if (!accessToken) {
        throw new Error('Authentication required. Please login.')
      }

      // Determine WebSocket URL with validation
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      let host: string

      if (envConfig.NEXT_PUBLIC_API_ENDPOINT) {
        // Remove protocol if present
        host = envConfig.NEXT_PUBLIC_API_ENDPOINT.replace(/^https?:\/\//, '').replace(/\/$/, '')
      } else {
        host = window.location.host
      }

      // Validate host
      if (!host || host.length === 0) {
        throw new Error('Invalid API endpoint configuration')
      }

      const wsUrl = `${protocol}//${host}/speech/stream?token=${encodeURIComponent(accessToken)}`

      // Validate URL format
      try {
        new URL(wsUrl)
      } catch (err) {
        throw new Error(`Invalid WebSocket URL: ${wsUrl}`)
      }

      // Connect WebSocket
      console.log('[SpeechToText] Connecting to WebSocket:', wsUrl)
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('[SpeechToText] WebSocket connected, sending Start message')
        // Send Start message
        const startMessage = {
          type: 'Start',
          model: 'nova-2',
          language: language === 'multi' ? undefined : language,
          detect_language: language === 'multi',
        }
        console.log('[SpeechToText] Start message:', startMessage)
        ws.send(JSON.stringify(startMessage))
      }

      ws.onmessage = (event) => {
        try {
          console.log('[SpeechToText] Received message:', event.data)
          const msg = JSON.parse(event.data) as WebSocketMessage
          console.log('[SpeechToText] Parsed message:', msg)

          if (msg.type === 'Ready') {
            console.log('[SpeechToText] Ready received, starting MediaRecorder')
            setIsConnecting(false)
            setIsRecording(true)

            // BẮT ĐẦU THU ÂM SAU KHI NHẬN Ready
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
              console.log('[SpeechToText] Starting MediaRecorder with 250ms timeslice')
              mediaRecorderRef.current.start(250)
            } else {
              console.warn('[SpeechToText] MediaRecorder not available or already started')
            }
          } else if (msg.type === 'Transcript') {
            const transcriptMsg = msg as TranscriptMessage
            console.log('[SpeechToText] Transcript received:', {
              transcript: transcriptMsg.transcript,
              is_final: transcriptMsg.is_final,
              speech_final: transcriptMsg.speech_final,
            })
            if (transcriptMsg.is_final) {
              setFinalTranscript((prev) =>
                prev ? `${prev} ${transcriptMsg.transcript}` : transcriptMsg.transcript
              )
              setInterimTranscript('')
            } else {
              setInterimTranscript(transcriptMsg.transcript)
            }
          } else if (msg.type === 'Error') {
            console.error('[SpeechToText] Error received:', msg)
            // Distinguish between network errors (retry) and API errors (no retry)
            const isNetworkError =
              msg.message?.toLowerCase().includes('network') ||
              msg.message?.toLowerCase().includes('connection') ||
              msg.raw?.code === 'NET-0001'

            setError(msg.message)
            setIsConnecting(false)
            setIsRecording(false)

            // For network errors, don't cleanup immediately - let reconnection logic handle it
            if (!isNetworkError) {
              // API errors: cleanup immediately, no retry
              cleanup()
            }
          } else if (msg.type === 'Closed') {
            console.log('[SpeechToText] Closed received')
            cleanup()
          } else if (msg.type === 'Metadata') {
            console.log('[SpeechToText] Metadata received:', msg)
          }
        } catch (err) {
          console.error(
            '[SpeechToText] Failed to parse WebSocket message:',
            err,
            'Raw data:',
            event.data
          )
        }
      }

      ws.onerror = (err) => {
        console.error('[SpeechToText] WebSocket error:', err)
        // Don't set error immediately, wait for onclose to handle reconnection
      }

      ws.onclose = (event) => {
        console.log('[SpeechToText] WebSocket closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          reconnectAttempts: reconnectAttemptsRef.current,
        })
        // Only cleanup if it's a normal close or we've exhausted reconnect attempts
        if (event.code === 1000 || reconnectAttemptsRef.current >= maxReconnectAttempts) {
          cleanup()
          if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            setError('Không thể kết nối. Vui lòng thử lại sau.')
            setIsConnecting(false)
            setIsRecording(false)
          }
          return
        }

        // Auto-reconnect với exponential backoff (only for network errors, not Deepgram API errors)
        // Check if it's a network error (code 1006 = abnormal closure, usually network issue)
        const isNetworkError = event.code === 1006 || event.code === 1001 || event.code === 1002
        if (
          isNetworkError &&
          isRecording &&
          reconnectAttemptsRef.current < maxReconnectAttempts &&
          !isReconnectingRef.current
        ) {
          isReconnectingRef.current = true
          reconnectAttemptsRef.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 10000) // Max 10s

          reconnectTimerRef.current = setTimeout(() => {
            // Retry connection - reuse existing stream if available
            if (streamRef.current && !wsRef.current && !mediaRecorderRef.current && isRecording) {
              // Reuse stream, create new WebSocket connection
              const accessToken = getAccessTokenFromLocalStorage()
              if (!accessToken) {
                cleanup()
                setError('Authentication required. Please login.')
                return
              }

              const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
              let host: string

              if (envConfig.NEXT_PUBLIC_API_ENDPOINT) {
                host = envConfig.NEXT_PUBLIC_API_ENDPOINT.replace(/^https?:\/\//, '').replace(
                  /\/$/,
                  ''
                )
              } else {
                host = window.location.host
              }

              if (!host || host.length === 0) {
                cleanup()
                setError('Invalid API endpoint configuration')
                return
              }

              const wsUrl = `${protocol}//${host}/speech/stream?token=${encodeURIComponent(accessToken)}`

              try {
                new URL(wsUrl)
              } catch (err) {
                cleanup()
                setError(`Invalid WebSocket URL: ${wsUrl}`)
                return
              }

              const newWs = new WebSocket(wsUrl)
              wsRef.current = newWs

              // Reuse existing event handlers
              newWs.onopen = () => {
                newWs.send(
                  JSON.stringify({
                    type: 'Start',
                    model: 'nova-2',
                    language: language === 'multi' ? undefined : language,
                    detect_language: language === 'multi',
                  })
                )
              }

              newWs.onmessage = ws.onmessage
              newWs.onerror = ws.onerror
              newWs.onclose = ws.onclose

              // Recreate MediaRecorder với existing stream
              const mimeType = pickMimeType()
              const mediaRecorder = new MediaRecorder(
                streamRef.current!,
                mimeType ? { mimeType } : undefined
              )
              mediaRecorderRef.current = mediaRecorder

              mediaRecorder.ondataavailable = async (event) => {
                if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
                if (!event.data || event.data.size === 0) return
                const buffer = await event.data.arrayBuffer()
                wsRef.current.send(buffer)
              }

              // Đợi Ready message trước khi start (sẽ được start trong onmessage handler)
              // Không start ngay ở đây
              console.log('[SpeechToText] Reconnected MediaRecorder created, waiting for Ready')
              isReconnectingRef.current = false
            } else {
              cleanup()
            }
          }, delay)
        } else {
          cleanup()
        }
      }

      // Create MediaRecorder
      const mimeType = pickMimeType()
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = async (event) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          console.warn('[SpeechToText] WebSocket not open, skipping audio chunk')
          return
        }
        if (!event.data || event.data.size === 0) {
          console.warn('[SpeechToText] Empty audio chunk, skipping')
          return
        }

        // Send binary audio chunk
        const buffer = await event.data.arrayBuffer()
        console.log('[SpeechToText] Sending audio chunk:', buffer.byteLength, 'bytes')
        wsRef.current.send(buffer)
      }

      mediaRecorder.onerror = (event) => {
        console.error('[SpeechToText] MediaRecorder error:', event)
        setError('MediaRecorder error occurred')
        cleanup()
      }

      // KHÔNG start MediaRecorder ngay - đợi nhận Ready message từ server
      // MediaRecorder sẽ được start trong ws.onmessage khi nhận Ready
      console.log('[SpeechToText] MediaRecorder created, waiting for Ready message before starting')
    } catch (err) {
      console.error('Failed to start recording:', err)
      setError(err instanceof Error ? err.message : 'Failed to start recording')
      setIsConnecting(false)
      setIsRecording(false)
      cleanup()
    }
  }, [language, cleanup])

  const stop = useCallback(() => {
    cleanup()
  }, [cleanup])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  return {
    isRecording,
    isConnecting,
    finalTranscript,
    interimTranscript,
    fullTranscript: finalTranscript + (interimTranscript ? ` ${interimTranscript}` : ''),
    error,
    start,
    stop,
  }
}
