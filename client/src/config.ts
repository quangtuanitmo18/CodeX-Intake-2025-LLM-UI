import { z } from 'zod'

const configSchema = z.object({
  NEXT_PUBLIC_API_ENDPOINT: z.string(),
  NEXT_PUBLIC_URL: z.string(),
  // Server-side only: use Docker service name when available, fallback to NEXT_PUBLIC_API_ENDPOINT
  API_ENDPOINT: z.string().optional(),
})

const configProject = configSchema.safeParse({
  NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  API_ENDPOINT: process.env.API_ENDPOINT, // Server-side: use Docker service name
})

if (!configProject.success) {
  console.error(configProject.error.errors)
  throw new Error('Invalid environment variables')
}

const envConfig = configProject.data
// For server-side: prefer API_ENDPOINT (Docker service name), fallback to NEXT_PUBLIC_API_ENDPOINT
envConfig.API_ENDPOINT = envConfig.API_ENDPOINT || envConfig.NEXT_PUBLIC_API_ENDPOINT

export default envConfig
