import {
  ControlMessageSchema,
  SpeechWebSocketQuerySchema,
  type StartMessageType
} from '@/schemaValidations/speech.schema'
import { speechService } from '@/services/speech.service'
import { verifyAccessToken } from '@/utils/jwt'
import { speechRateLimiter } from '@/utils/rateLimiter'
import { FastifyRequest } from 'fastify'

class SpeechController {
  async handleWebSocket(connection: any, request: FastifyRequest) {
    console.log('[SpeechController] WebSocket connection received')
    // Validate and authenticate WebSocket connection
    const queryResult = SpeechWebSocketQuerySchema.safeParse(request.query)
    if (!queryResult.success) {
      connection.socket.close(1008, 'Invalid query parameters')
      return
    }

    const { token } = queryResult.data

    let decodedToken
    try {
      decodedToken = verifyAccessToken(token)
    } catch (error) {
      connection.socket.close(1008, 'Invalid token')
      return
    }

    // Rate limiting: Check if user has too many concurrent connections
    const userId = decodedToken.userId
    console.log('[SpeechController] Authenticated user:', userId)
    if (!speechRateLimiter.canConnect(userId)) {
      console.log('[SpeechController] Rate limit exceeded for user:', userId)
      connection.socket.close(1008, 'Too many concurrent connections. Please close existing connections.')
      request.log.warn({ userId }, 'Rate limit exceeded for WebSocket connection')
      return
    }

    // Record connection
    speechRateLimiter.recordConnection(userId)
    console.log('[SpeechController] Connection recorded, setting up message handlers')

    let dgConnection: ReturnType<typeof speechService.createDeepgramConnection> | null = null
    let started = false
    let lastAudioAt = Date.now()

    const sendToClient = (obj: Record<string, any>) => {
      if (connection.socket.readyState === 1) {
        connection.socket.send(JSON.stringify(obj))
      }
    }

    // KeepAlive: gửi mỗi 3-5s để tránh timeout nếu không có audio
    const keepAliveTimer = setInterval(() => {
      if (!dgConnection) return
      const idleMs = Date.now() - lastAudioAt

      // chỉ keepalive khi đang rảnh, tránh spam
      if (idleMs >= 3500) {
        try {
          dgConnection.send(JSON.stringify({ type: 'KeepAlive' }))
        } catch (error) {
          // Ignore errors
        }
      }
    }, 3500)

    const cleanup = () => {
      clearInterval(keepAliveTimer)
      try {
        if (dgConnection) {
          // đóng "đúng bài": CloseStream sẽ yêu cầu server xử lý phần còn lại
          try {
            dgConnection.send(JSON.stringify({ type: 'CloseStream' }))
          } catch (err) {
            // Ignore if already closed
          }
          // Deepgram SDK handles cleanup internally
          if (typeof (dgConnection as any).finish === 'function') {
            ;(dgConnection as any).finish()
          }
        }
      } catch (error) {
        // Ignore cleanup errors
      }
      dgConnection = null

      // Remove from rate limiter when connection closes
      if (decodedToken?.userId) {
        speechRateLimiter.removeConnection(decodedToken.userId)
      }
    }

    connection.socket.on('close', () => {
      console.log('[SpeechController] WebSocket closed')
      cleanup()
    })
    connection.socket.on('error', (error: Error) => {
      console.error('[SpeechController] WebSocket error:', error)
      request.log.error(error, 'WebSocket error')
      cleanup()
    })
    console.log('[SpeechController] WebSocket event handlers registered')

    connection.socket.on('message', async (message: Buffer | string) => {
      console.log('[SpeechController] Message received from client:', {
        isBuffer: Buffer.isBuffer(message),
        isString: typeof message === 'string',
        type: typeof message,
        length: Buffer.isBuffer(message) ? message.length : typeof message === 'string' ? message.length : undefined
      })
      request.log.debug(
        {
          isBuffer: Buffer.isBuffer(message),
          isString: typeof message === 'string',
          type: typeof message,
          length: Buffer.isBuffer(message) ? message.length : typeof message === 'string' ? message.length : undefined
        },
        'Received message from client'
      )

      // Convert message to string first to check if it's JSON
      let text: string
      if (typeof message === 'string') {
        text = message
      } else {
        text = message.toString('utf-8')
      }

      // Try to parse as JSON first (could be control message sent as binary)
      let parsedData: unknown
      let isJSON = false
      try {
        parsedData = JSON.parse(text)
        isJSON = true
        console.log('[SpeechController] Message is JSON:', parsedData)
      } catch (error) {
        // Not JSON, treat as binary audio chunk
        isJSON = false
      }

      // If it's JSON, handle as control message
      if (isJSON && parsedData) {
        // Validate control message schema
        const messageResult = ControlMessageSchema.safeParse(parsedData)
        if (!messageResult.success) {
          console.warn('[SpeechController] Invalid control message:', messageResult.error)
          request.log.warn({ error: messageResult.error }, 'Invalid control message')
          return
        }

        const data = messageResult.data
        console.log('[SpeechController] Valid control message:', data.type)

        if (data.type === 'Start' && !started) {
          const start = data as StartMessageType
          console.log('[SpeechController] Received Start message:', start)
          request.log.info({ start }, 'Received Start message from client')

          try {
            request.log.info(
              {
                model: start.model ?? 'nova-2',
                language: start.language ?? 'vi',
                detect_language: start.detect_language ?? false
              },
              'Creating Deepgram connection with options'
            )

            dgConnection = speechService.createDeepgramConnection({
              model: start.model ?? 'nova-2',
              language: start.language ?? 'vi',
              detect_language: start.detect_language ?? false
            })
            request.log.info(
              {
                hasOn: typeof (dgConnection as any).on === 'function',
                connectionType: typeof dgConnection,
                connectionKeys: Object.keys(dgConnection || {}).slice(0, 10)
              },
              'Deepgram connection object created'
            )

            const events = speechService.getLiveTranscriptionEvents()
            request.log.info(
              {
                Open: events.Open,
                Transcript: events.Transcript,
                Error: events.Error,
                Close: events.Close,
                Metadata: events.Metadata,
                fullEvents: events
              },
              'Deepgram events object'
            )

            // Set up all event handlers BEFORE connection might open
            let connectionTimeout: NodeJS.Timeout | null = null

            // Listen for Open event
            const openEventName = events.Open || 'open'
            request.log.info({ eventName: openEventName }, 'Setting up Open event handler')

            dgConnection.on(openEventName, () => {
              console.log('[SpeechController] Deepgram connection opened - sending Ready to client')
              request.log.info('Deepgram connection opened - sending Ready to client')
              if (connectionTimeout) {
                clearTimeout(connectionTimeout)
                connectionTimeout = null
              }
              started = true
              console.log('[SpeechController] Sending Ready message to client')
              sendToClient({ type: 'Ready' })
            })

            // Also try direct 'open' event in case SDK uses different naming
            if (openEventName !== 'open') {
              dgConnection.on('open', () => {
                console.log('[SpeechController] Deepgram connection opened (direct open event)')
                request.log.info('Deepgram connection opened (direct open event)')
                if (connectionTimeout) {
                  clearTimeout(connectionTimeout)
                  connectionTimeout = null
                }
                if (!started) {
                  started = true
                  console.log('[SpeechController] Sending Ready message to client (direct)')
                  sendToClient({ type: 'Ready' })
                }
              })
            }

            // Listen for Transcript event
            const transcriptEventName = events.Transcript || 'transcript'
            request.log.info({ eventName: transcriptEventName }, 'Setting up Transcript event handler')

            dgConnection.on(transcriptEventName, (evt: any) => {
              request.log.info(
                {
                  hasChannel: !!evt?.channel,
                  hasAlternatives: !!evt?.channel?.alternatives,
                  alternativesLength: evt?.channel?.alternatives?.length,
                  fullEvent: JSON.stringify(evt).substring(0, 500)
                },
                'Deepgram transcript event received'
              )

              const transcript = evt?.channel?.alternatives?.[0]?.transcript ?? ''
              if (!transcript) {
                request.log.debug('Empty transcript received, skipping')
                return
              }

              request.log.info(
                {
                  transcript,
                  is_final: evt.is_final,
                  speech_final: evt.speech_final
                },
                'Sending transcript to client'
              )

              sendToClient({
                type: 'Transcript',
                transcript,
                is_final: !!evt.is_final,
                speech_final: !!evt.speech_final,
                raw: evt
              })
            })

            // Listen for Metadata event
            const metadataEventName = events.Metadata || 'metadata'
            dgConnection.on(metadataEventName, (evt: any) => {
              request.log.debug('Deepgram metadata received')
              sendToClient({ type: 'Metadata', raw: evt })
            })

            // Listen for Error event
            const errorEventName = events.Error || 'error'
            dgConnection.on(errorEventName, (err: any) => {
              console.error('[SpeechController] Deepgram error:', err)
              request.log.error(
                {
                  err,
                  errorType: typeof err,
                  errorString: String(err),
                  errorDetails: JSON.stringify(err)
                },
                'Deepgram error'
              )
              // Distinguish between network errors and API errors
              const isNetworkError =
                err?.code === 'NET-0001' || err?.message?.includes('network') || err?.message?.includes('timeout')
              const errorMessage = isNetworkError
                ? 'Network error. Please check your connection.'
                : (err?.message ?? 'Deepgram API error')

              sendToClient({
                type: 'Error',
                message: errorMessage,
                raw: err
              })
            })

            // Listen for Close event
            const closeEventName = events.Close || 'close'
            dgConnection.on(closeEventName, () => {
              request.log.info('Deepgram connection closed')
              sendToClient({ type: 'Closed' })
              cleanup()
            })

            // Log connection state after setup
            request.log.info(
              {
                hasOn: typeof (dgConnection as any).on === 'function',
                connectionType: typeof dgConnection,
                connectionKeys: Object.keys(dgConnection || {})
              },
              'All Deepgram event handlers set up. Connection state'
            )

            // Add timeout để detect nếu Deepgram không connect
            connectionTimeout = setTimeout(() => {
              if (!started && dgConnection) {
                console.warn('[SpeechController] Deepgram connection timeout - no Open event received after 10s')
                request.log.warn('Deepgram connection timeout - no Open event received after 10s')
                sendToClient({
                  type: 'Error',
                  message: 'Deepgram connection timeout. Please check API key and try again.'
                })
                cleanup()
              }
            }, 10000) // 10 seconds timeout
          } catch (error) {
            console.error('[SpeechController] Failed to create Deepgram connection:', error)
            request.log.error({ error }, 'Failed to create Deepgram connection')
            sendToClient({ type: 'Error', message: 'Failed to start transcription' })
          }
          return
        }

        if (!dgConnection) {
          console.warn('[SpeechController] Received control message but Deepgram connection not established')
          request.log.warn({ type: data.type }, 'Received control message but Deepgram connection not established')
          return
        }

        if (data?.type === 'Finalize') {
          console.log('[SpeechController] Received Finalize message')
          request.log.info('Received Finalize message from client. Sending to Deepgram.')
          // Finalize: flush audio buffer để trả kết quả cuối
          try {
            dgConnection.send(JSON.stringify({ type: 'Finalize' }))
          } catch (error) {
            request.log.error({ error }, 'Failed to send Finalize to Deepgram')
          }
          return
        }

        if (data?.type === 'CloseStream') {
          console.log('[SpeechController] Received CloseStream message')
          request.log.info('Received CloseStream message from client. Sending to Deepgram.')
          // CloseStream: đóng stream, server trả metadata rồi terminate
          try {
            dgConnection.send(JSON.stringify({ type: 'CloseStream' }))
          } catch (error) {
            request.log.error({ error }, 'Failed to send CloseStream to Deepgram')
          }
          return
        }

        return
      }

      // If not JSON, treat as binary audio chunk
      if (Buffer.isBuffer(message)) {
        if (!started || !dgConnection) {
          console.warn('[SpeechController] Received audio chunk but not started or no Deepgram connection')
          request.log.debug('Received audio chunk but not started or no Deepgram connection')
          return
        }

        // Deepgram khuyến cáo tránh gửi empty bytes
        if (message.length === 0) {
          request.log.debug('Received empty audio chunk, skipping')
          return
        }

        lastAudioAt = Date.now()
        try {
          // Deepgram accepts Buffer directly
          request.log.debug({ size: message.length }, 'Sending audio chunk to Deepgram')
          dgConnection.send(message as any)
        } catch (error) {
          request.log.error(error, 'Failed to send audio to Deepgram')
          sendToClient({ type: 'Error', message: 'Failed to send audio' })
        }
        return
      }
    })
  }
}

export default new SpeechController()
