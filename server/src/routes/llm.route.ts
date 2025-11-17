import llmController from '@/controllers/llm.controller'
import { requireLoginedHook } from '@/hooks/auth.hooks'
import { LLMStreamBody } from '@/schemaValidations/llm.schema'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'

export default async function llmRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
  fastify.post(
    '/stream',
    {
      schema: {
        body: LLMStreamBody
      },
      preValidation: fastify.auth([requireLoginedHook])
    },
    llmController.stream
  )
}
