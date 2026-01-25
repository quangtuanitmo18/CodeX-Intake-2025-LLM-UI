import Image from 'next/image'
import LoginForm from './login-form'

import { buildPageMetadata } from '@/seo/next-metadata'

export const metadata = buildPageMetadata('login')

export default function Login() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center lg:gap-20">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <Image
              src="/codex-logo.svg"
              alt="CodeX logo"
              width={56}
              height={56}
              className="h-12 w-12"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary">CodeX</p>
              <p className="text-base text-muted-foreground">LLM UI Playground</p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 text-left text-sm text-card-foreground shadow-inner backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Demo Credentials
            </p>
            <div className="mt-3 space-y-2 font-mono text-sm">
              <p className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground">user@llmui.com</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Password</span>
                <span className="text-foreground">123456</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
