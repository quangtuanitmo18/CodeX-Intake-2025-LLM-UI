import envConfig, { API_URL } from '@/config'
import { initOwnerAccount } from '@/controllers/account.controller'
import autoRemoveRefreshTokenJob from '@/jobs/autoRemoveRefreshToken.job'
import { errorHandlerPlugin } from '@/plugins/errorHandler.plugins'
import validatorCompilerPlugin from '@/plugins/validatorCompiler.plugins'
import accountRoutes from '@/routes/account.route'
import authRoutes from '@/routes/auth.route'
import conversationRoutes from '@/routes/conversation.route'
import llmRoutes from '@/routes/llm.route'
import mediaRoutes from '@/routes/media.route'
import messageRoutes from '@/routes/message.route'
import projectRoutes from '@/routes/project.route'
import speechRoutes from '@/routes/speech.route'
import staticRoutes from '@/routes/static.route'
import { createFolder } from '@/utils/helpers'
import fastifyAuth from '@fastify/auth'
import fastifyCookie from '@fastify/cookie'
import cors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import Fastify from 'fastify'
import path from 'path'

const fastify = Fastify({
  logger: true,
  bodyLimit: 1048576 //10MB

  // https - reverse proxy nginx config
  // https: {
  //   key: fs.readFileSync('/etc/letsencrypt/live/164181.msk.web.highserver.ru/privkey.pem'),
  //   cert: fs.readFileSync('/etc/letsencrypt/live/164181.msk.web.highserver.ru/fullchain.pem')
  // }
})

fastify.get('/healthz', async () => ({ ok: true }))
// Run the server!
const start = async () => {
  try {
    createFolder(path.resolve(envConfig.UPLOAD_FOLDER))
    autoRemoveRefreshTokenJob()

    const whitelist = ['*']
    fastify.register(cors, {
      origin: whitelist,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      exposedHeaders: ['Content-Type']
    })

    fastify.register(fastifyAuth, {
      defaultRelation: 'and'
    })
    fastify.register(fastifyHelmet, {
      crossOriginResourcePolicy: {
        policy: 'cross-origin'
      }
    })
    fastify.register(fastifyCookie)
    fastify.register(validatorCompilerPlugin)
    fastify.register(errorHandlerPlugin)

    fastify.register(authRoutes, {
      prefix: '/auth'
    })
    fastify.register(accountRoutes, {
      prefix: '/accounts'
    })
    fastify.register(mediaRoutes, {
      prefix: '/media'
    })
    fastify.register(conversationRoutes, {
      prefix: '/api/conversations'
    })
    fastify.register(projectRoutes, {
      prefix: '/api/projects'
    })
    fastify.register(messageRoutes, {
      prefix: '/api/conversations'
    })
    fastify.register(llmRoutes, {
      prefix: '/llm'
    })
    fastify.register(speechRoutes, {
      prefix: '/speech'
    })
    fastify.register(staticRoutes)

    await initOwnerAccount()
    await fastify.listen({
      port: envConfig.PORT,
      // host: envConfig.DOCKER ? '0.0.0.0' : 'localhost'
      host: '0.0.0.0'
    })
    if (process.send) process.send('ready')

    fastify.log.info(`Server is ready: ${API_URL}`)
  } catch (err) {
    console.log(err)
    fastify.log.error(err)
    process.exit(1)
  }
}

async function shutdown(signal: NodeJS.Signals) {
  try {
    fastify.log.info({ signal }, 'Shutting down gracefully...')
    await fastify.close()
    process.exit(0)
  } catch (e) {
    fastify.log.error(e)
    process.exit(1)
  }
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

process.on('unhandledRejection', (reason) => {
  fastify.log.error({ reason }, 'Unhandled Rejection')
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  fastify.log.error(err, 'Uncaught Exception')
  process.exit(1)
})

start()
