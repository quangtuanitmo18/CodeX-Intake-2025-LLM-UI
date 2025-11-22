import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import z from 'zod'

// Try .env.local first (for Docker dev), then fallback to .env
// In Docker, env_file injects variables directly, so files may not exist
config({
  path: '.env.local'
})
config({
  path: '.env'
})

const checkEnv = async () => {
  // Skip file check in Docker - env variables are injected via docker-compose env_file
  // DOCKER will be parsed as boolean by schema, but at this point it's still string from process.env
  if (process.env.DOCKER) {
    return
  }

  const chalk = (await import('chalk')).default
  // Check for .env.local first (Docker dev), then .env
  const envLocalPath = path.resolve('.env.local')
  const envPath = path.resolve('.env')
  if (!fs.existsSync(envLocalPath) && !fs.existsSync(envPath)) {
    console.log(chalk.red(`don't have .env or .env.local`))
    process.exit(1)
  }
}
// Run checkEnv after config is loaded, but we need to check before schema parse
// So check DOCKER from process.env directly
if (!process.env.DOCKER) {
  checkEnv()
}

const configSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  INITIAL_EMAIL_USER: z.string(),
  INITIAL_PASSWORD_USER: z.string(),
  DOMAIN: z.string(),
  PROTOCOL: z.string(),
  UPLOAD_FOLDER: z.string(),
  CLIENT_URL: z.string(),
  PRODUCTION: z.enum(['true', 'false']).transform((val) => val === 'true'),
  DOCKER: z.enum(['true', 'false']).transform((val) => val === 'true'),
  PRODUCTION_URL: z.string().optional().default(''),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LLM_API_URL: z.string().optional().default(''),
  LLM_API_TOKEN: z.string().optional().default('')
  // LLM_API_MODEL: z.string().optional().default('openai/gpt-5-mini')
})

const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
  console.error(configServer.error.issues)
  throw new Error('Invalid environment variables')
}
const envConfig = configServer.data
export const API_URL =
  envConfig.PRODUCTION && envConfig.PRODUCTION_URL
    ? envConfig.PRODUCTION_URL
    : `${envConfig.PROTOCOL}://${envConfig.DOMAIN}:${envConfig.PORT}`
export default envConfig

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof configSchema> {}
  }
}
