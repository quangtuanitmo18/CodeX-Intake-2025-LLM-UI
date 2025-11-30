import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'
import z from 'zod'

// Environment variable loading strategy:
// 1. Docker dev (DOCKER=true, NODE_ENV=development) → .env.dev
// 2. Docker prod (DOCKER=true, NODE_ENV=production) → .env.prod
// 3. Non-Docker → .env (priority) > .env.local (fallback)
//
// Priority order (highest to lowest):
// 1. System/Process env vars (from shell, system, etc.)
// 2. Docker environment (env_file + environment in docker-compose)
// 3. dotenv files (based on environment)
// 4. Default values in schema (lowest priority)
//
// Note: dotenv by default does NOT override existing process.env values
// In Docker, env_file injects variables directly, so files may not exist

// Check DOCKER from process.env (before schema transform)
// process.env values are always strings or undefined
const isDocker = String(process.env.DOCKER || '') === 'true'
const isProduction = String(process.env.NODE_ENV || '') === 'production'

if (isDocker) {
  // Docker environment: load based on NODE_ENV
  if (isProduction) {
    // Docker production: load .env.prod
    config({
      path: '.env.prod',
      override: false // Don't override Docker-injected env vars
    })
  } else {
    // Docker development: load .env.dev
    config({
      path: '.env.dev',
      override: false // Don't override Docker-injected env vars
    })
  }
} else {
  // Non-Docker: .env (priority) > .env.local (fallback)
  // Load .env first (higher priority)
  config({
    path: '.env',
    override: false // Don't override system env vars
  })
  // Load .env.local as fallback (won't override .env values)
  config({
    path: '.env.local',
    override: false // Don't override .env or system env vars
  })
}

const checkEnv = async () => {
  // Skip file check in Docker - env variables are injected via docker-compose env_file
  if (isDocker) {
    return
  }

  const chalk = (await import('chalk')).default
  // Check for .env or .env.local (non-Docker environments)
  const envPath = path.resolve('.env')
  const envLocalPath = path.resolve('.env.local')

  if (!fs.existsSync(envPath) && !fs.existsSync(envLocalPath)) {
    console.log(chalk.red(`Missing environment file: .env or .env.local is required`))
    process.exit(1)
  }
}

// Run checkEnv after config is loaded
checkEnv()

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
  LLM_API_TOKEN: z.string().optional().default(''),
  // LLM_API_MODEL: z.string().optional().default('openai/gpt-5-mini')
  DEEPGRAM_API_KEY: z.string().optional().default('')
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
