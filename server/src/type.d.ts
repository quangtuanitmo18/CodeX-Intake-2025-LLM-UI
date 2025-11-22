import { TokenPayload } from '@/types/jwt.types'
import 'fastify'
declare global {
  interface BigInt {
    toJSON(): string
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    decodedAccessToken?: TokenPayload
    account?: TokenPayload
  }
}
