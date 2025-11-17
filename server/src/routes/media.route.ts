import { uploadMediaController } from '@/controllers/media.controller'
import { requireLoginedHook } from '@/hooks/auth.hooks'
import { UploadMediaRes, UploadMediaResType } from '@/schemaValidations/media.schema'
import fastifyMultipart from '@fastify/multipart'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'

export default async function mediaRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  await fastify.register(fastifyMultipart, {
    attachFieldsToBody: false
  })

  fastify.post<{ Reply: UploadMediaResType }>(
    '/upload',
    {
      schema: {
        response: {
          200: UploadMediaRes
        }
      },
      preValidation: fastify.auth([requireLoginedHook])
    },
    async (request, reply) => {
      const file = await request.file()
      const url = await uploadMediaController(file)
      reply.send({
        data: url,
        message: 'Upload successfully'
      })
    }
  )
}
