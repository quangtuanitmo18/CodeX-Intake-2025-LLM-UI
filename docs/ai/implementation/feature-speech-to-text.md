---
phase: implementation
title: Implementation Guide - Realtime Speech-to-Text với Deepgram
description: Technical implementation notes và code patterns
---

# Implementation Guide: Realtime Speech-to-Text với Deepgram

## Development Setup

**Prerequisites:**

- Node.js 18+
- npm hoặc yarn
- Deepgram API key: `11529f83c1605e74c780174d664677fbb61ebd3d`
- Microphone device để test

**Dependencies:**

```bash
# Server
cd server
npm install @fastify/websocket

# Client (no additional dependencies needed - WebSocket và MediaRecorder are browser native)
```

**Environment Setup:**

1. Add to `server/.env` hoặc `server/.env.local`:

```env
DEEPGRAM_API_KEY=11529f83c1605e74c780174d664677fbb61ebd3d
```

2. Update `server/src/config.ts`:

```typescript
DEEPGRAM_API_KEY: z.string().optional().default('')
```

## Code Structure

**Directory Structure:**

```
server/
  src/
    services/
      speech.service.ts          # Deepgram WebSocket client
    controllers/
      speech.controller.ts       # WebSocket connection handler
    routes/
      speech.route.ts            # WebSocket route registration
    schemaValidations/
      speech.schema.ts           # Message schemas

client/
  src/
    hooks/
      useSpeechToText.ts         # Speech-to-text hook
    components/
      speech/
        microphone-button.tsx    # Microphone toggle button
        language-selector.tsx   # Language selection dropdown
    pageSections/
      llm/
        chat-composer.tsx        # Updated với microphone button
```

**Naming Conventions:**

- Services: `*.service.ts`
- Controllers: `*.controller.ts`
- Routes: `*.route.ts`
- Hooks: `use*.ts`
- Components: `kebab-case.tsx`

## Implementation Notes

### Core Features

#### Feature 1: Backend WebSocket Proxy

**File:** `server/src/services/speech.service.ts`

```typescript
import { createClient } from '@deepgram/sdk'
import envConfig from '@/config'

class SpeechService {
  createDeepgramConnection(language: string = 'vi-VN') {
    const deepgram = createClient(envConfig.DEEPGRAM_API_KEY)

    const connection = deepgram.listen.live({
      model: 'nova-2',
      language: language,
      interim_results: true,
      endpointing: 300,
      punctuate: true,
      smart_format: true,
      utterance_end_ms: 1000,
    })

    return connection
  }
}

export const speechService = new SpeechService()
```

**Key Points:**

- Use `@deepgram/sdk` để tạo WebSocket connection
- Set `interim_results: true` để nhận realtime results
- `endpointing: 300` để tự động chốt sau 300ms im lặng
- Language parameter từ client

**File:** `server/src/controllers/speech.controller.ts`

```typescript
import { FastifyRequest, FastifyReply } from 'fastify'
import { speechService } from '@/services/speech.service'

class SpeechController {
  async stream(connection: SocketStream, request: FastifyRequest) {
    // Get language from query params
    const language = (request.query as any)?.language || 'vi-VN'

    // Create Deepgram connection
    const dgConnection = speechService.createDeepgramConnection(language)

    // Handle messages from client
    connection.socket.on('message', (message: Buffer) => {
      // Check if binary (audio) or text (control)
      if (message instanceof Buffer) {
        // Binary audio chunk → send to Deepgram
        dgConnection.send(message)
      } else {
        // JSON control message
        try {
          const control = JSON.parse(message.toString())
          if (control.type === 'Finalize') {
            dgConnection.finish()
          } else if (control.type === 'CloseStream') {
            dgConnection.close()
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    })

    // Handle Deepgram messages → forward to client
    dgConnection.on('message', (data: string) => {
      connection.socket.send(data)
    })

    // Handle errors
    dgConnection.on('error', (error) => {
      connection.socket.send(JSON.stringify({ type: 'error', message: error.message }))
    })

    // Cleanup on close
    connection.socket.on('close', () => {
      dgConnection.finish()
    })
  }
}

export default new SpeechController()
```

**Key Points:**

- Handle both binary (audio) và JSON (control) messages
- Proxy messages 2 chiều: client ↔ Deepgram
- Error handling và cleanup

#### Feature 2: Frontend Audio Capture

**File:** `client/src/hooks/useSpeechToText.ts`

```typescript
import { useState, useRef, useCallback } from 'react'

type Language = 'vi-VN' | 'en-US' | 'ru-RU'

export function useSpeechToText(language: Language = 'vi-VN') {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const start = useCallback(async () => {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm', // or 'audio/ogg'
      })
      mediaRecorderRef.current = mediaRecorder

      // Connect WebSocket
      const ws = new WebSocket(`wss://${window.location.host}/speech/stream?language=${language}`)
      wsRef.current = ws

      // Handle audio chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(event.data) // Send binary audio chunk
        }
      }

      // Handle WebSocket messages
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'Results') {
            const transcript = data.channel?.alternatives?.[0]?.transcript || ''
            if (data.is_final) {
              setTranscript((prev) => prev + ' ' + transcript)
            } else {
              // Interim result - show temporarily
              // You might want separate state for interim
            }
          } else if (data.type === 'error') {
            setError(data.message)
          }
        } catch (e) {
          // Ignore parse errors
        }
      }

      ws.onerror = (error) => {
        setError('WebSocket connection error')
      }

      // Start recording với 250ms timeslice
      mediaRecorder.start(250)
      setIsRecording(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording')
    }
  }, [language])

  const stop = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'Finalize' }))
      wsRef.current.close()
      wsRef.current = null
    }

    setIsRecording(false)
  }, [])

  return { isRecording, transcript, error, start, stop }
}
```

**Key Points:**

- `MediaRecorder.start(250)` với 250ms timeslice
- Send binary audio chunks qua WebSocket
- Handle Deepgram JSON messages
- Cleanup resources on stop

#### Feature 3: UI Components

**File:** `client/src/components/speech/microphone-button.tsx`

```typescript
import { Mic, MicOff } from 'lucide-react'
import { useSpeechToText } from '@/hooks/useSpeechToText'

export function MicrophoneButton({ language }: { language: string }) {
  const { isRecording, transcript, error, start, stop } = useSpeechToText(language)

  return (
    <button
      onClick={isRecording ? stop : start}
      className={isRecording ? 'recording' : ''}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isRecording ? <MicOff /> : <Mic />}
    </button>
  )
}
```

### Patterns & Best Practices

**WebSocket Connection Management:**

- Always cleanup on unmount
- Handle reconnection logic
- Use exponential backoff cho retries

**Audio Chunk Size:**

- Use 100-250ms timeslice (Deepgram recommendation)
- Balance giữa latency và network overhead

**State Management:**

- Separate interim và final transcript state
- Clear interim khi nhận final result

**Error Handling:**

- User-friendly error messages
- Retry mechanisms
- Graceful degradation

## Integration Points

**ChatComposer Integration:**

```typescript
// In chat-composer.tsx
import { MicrophoneButton } from '@/components/speech/microphone-button'
import { LanguageSelector } from '@/components/speech/language-selector'

// Add state for language
const [language, setLanguage] = useState('vi-VN')

// Add to UI
<div className="flex items-center gap-2">
  <LanguageSelector value={language} onChange={setLanguage} />
  <MicrophoneButton language={language} />
  <AttachButton />
  <SendButton />
</div>
```

**WebSocket Authentication:**

- Add JWT token to WebSocket connection
- Validate trong route handler
- Use existing auth hooks

## Error Handling

**Strategy:**

1. **Microphone Permission Denied:**
   - Show error: "Microphone permission denied. Please enable in browser settings."
   - Provide link to browser settings guide

2. **WebSocket Connection Error:**
   - Auto-reconnect với exponential backoff (1s, 2s, 4s, 8s)
   - Show error message after 3 failed attempts

3. **Deepgram API Error:**
   - Forward error message từ Deepgram
   - Show user-friendly message: "Transcription service unavailable. Please try again."

4. **Network Error:**
   - Detect network offline
   - Show: "No internet connection. Please check your network."

**Logging:**

- Log errors to console (development)
- Send errors to error tracking service (production)
- Include context: language, timestamp, error type

## Performance Considerations

**Optimization Strategies:**

1. **Audio Chunk Size:**
   - Use 250ms timeslice (balance latency vs overhead)
   - Test với 100ms nếu cần lower latency

2. **WebSocket Message Batching:**
   - Không cần batching (Deepgram handles)
   - Send chunks immediately

3. **Memory Management:**
   - Cleanup MediaRecorder và WebSocket on unmount
   - Stop microphone stream khi không dùng

4. **Network Optimization:**
   - Use binary audio format (webm/ogg)
   - Compress nếu cần (Deepgram supports)

**Resource Management:**

- Limit concurrent WebSocket connections (nếu cần)
- Monitor Deepgram API usage
- Implement rate limiting nếu cần

## Security Notes

**Authentication/Authorization:**

- WebSocket connections require JWT authentication
- Validate token trong route handler
- Reject unauthenticated connections

**Input Validation:**

- Validate language parameter (whitelist: vi-VN, en-US, ru-RU)
- Validate control messages (type, structure)
- Reject invalid messages

**Data Encryption:**

- WebSocket connections use WSS (secure) trong production
- API key chỉ có ở server (environment variable)
- Không log API key

**Secrets Management:**

- Store API key trong environment variable
- Không commit `.env` files
- Use different keys cho dev/prod
