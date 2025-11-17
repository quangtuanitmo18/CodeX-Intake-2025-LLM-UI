import { TokenPayload } from '@/types/jwt.types'
import { type FastifyRequest } from 'fastify'
declare global {
  interface BigInt {
    toJSON(): string
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    decodedAccessToken?: TokenPayload
  }
}
