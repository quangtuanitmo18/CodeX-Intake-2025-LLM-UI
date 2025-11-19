import { LLMStreamBodyType } from '@/schemaValidations/llm.schema'
import { llmService } from '@/services/llm.service'
import type { FastifyReply, FastifyRequest } from 'fastify'

class LLMController {
  async stream(request: FastifyRequest<{ Body: LLMStreamBodyType }>, reply: FastifyReply) {
    reply.hijack()

    // CORS headers for SSE
    reply.raw.setHeader('Access-Control-Allow-Origin', request.headers.origin || '*')
    reply.raw.setHeader('Access-Control-Allow-Credentials', 'true')
    reply.raw.setHeader('Access-Control-Expose-Headers', 'Content-Type')
    
    // SSE headers
    reply.raw.setHeader('Content-Type', 'text/event-stream')
    reply.raw.setHeader('Cache-Control', 'no-cache')
  reply.raw.setHeader('Connection', 'keep-alive')
    reply.raw.flushHeaders?.()

    const abortController = new AbortController()
    request.raw.on('close', () => abortController.abort())

    const sendChunk = (chunk: Record<string, unknown>) => {
      reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`)
    }

    try {
      await llmService.stream({
        prompt: request.body.prompt,
        sessionId: request.body.sessionId,
        conversationId: request.body.conversationId,
        accountId: request.account?.userId,
        signal: abortController.signal,
        onChunk: sendChunk
      })
      sendChunk({ type: 'complete' })
    } catch (error: any) {
      request.log.error(error, 'LLM streaming failed')
      sendChunk({
        type: 'error',
        message: error?.message ?? 'LLM streaming failed'
      })
    } finally {
      reply.raw.end()
    }
  }
}

export default new LLMController()
