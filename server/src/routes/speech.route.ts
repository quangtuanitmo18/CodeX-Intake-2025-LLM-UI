import speechController from '@/controllers/speech.controller'
import websocket from '@fastify/websocket'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'

export default async function speechRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
  // Register websocket plugin if not already registered
  await fastify.register(websocket)

  fastify.get('/stream', { websocket: true }, async (connection, request) => {
    await speechController.handleWebSocket(connection, request)
  })
}
