import envConfig from '@/config'
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk'

type DeepgramConnectionOptions = {
  model?: string
  language?: string
  detect_language?: boolean
  interim_results?: boolean
  smart_format?: boolean
  punctuate?: boolean
  endpointing?: number
  utterance_end_ms?: number
}

class SpeechService {
  private deepgram: ReturnType<typeof createClient>

  constructor() {
    if (!envConfig.DEEPGRAM_API_KEY) {
      throw new Error('DEEPGRAM_API_KEY is not configured. Please set it in environment variables.')
    }
    this.deepgram = createClient(envConfig.DEEPGRAM_API_KEY)
  }

  createDeepgramConnection(options: DeepgramConnectionOptions = {}) {
    return this.deepgram.listen.live({
      model: options.model ?? 'nova-2',
      language: options.language ?? 'vi',
      detect_language: options.detect_language ?? false,
      interim_results: options.interim_results ?? true,
      smart_format: options.smart_format ?? true,
      punctuate: options.punctuate ?? true,
      endpointing: options.endpointing ?? 300,
      utterance_end_ms: options.utterance_end_ms ?? 1000
    })
  }

  getLiveTranscriptionEvents() {
    return LiveTranscriptionEvents
  }
}

export const speechService = new SpeechService()
