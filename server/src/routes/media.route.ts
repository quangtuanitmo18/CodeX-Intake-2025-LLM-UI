import { uploadAttachmentController, uploadMediaController } from '@/controllers/media.controller'
import { requireLoginedHook } from '@/hooks/auth.hooks'
import {
  UploadAttachmentQuery,
  UploadAttachmentQueryType,
  UploadAttachmentRes,
  UploadAttachmentResType,
  UploadMediaRes,
  UploadMediaResType
} from '@/schemaValidations/media.schema'
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

  // POST /media/upload-attachment - Upload conversation attachment
  fastify.post<{ Reply: UploadAttachmentResType; Querystring: UploadAttachmentQueryType }>(
    '/upload-attachment',
    {
      schema: {
        querystring: UploadAttachmentQuery,
        response: {
          200: UploadAttachmentRes
        }
      },
      preValidation: fastify.auth([requireLoginedHook])
    },
    async (request, reply) => {
      const file = await request.file()
      if (!file) {
        return reply.code(400).send({
          data: null as any,
          message: 'No file provided'
        })
      }

      const attachment = await uploadAttachmentController(file, request.query.conversationId, request.query.messageId)
      reply.send({
        data: attachment,
        message: 'Upload attachment successfully'
      })
    }
  )
}
