import { Metadata } from 'next'
import Image from 'next/image'
import LoginForm from './login-form'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your account',
}

export default function Login() {
  return (
    <div className="min-h-screen w-full bg-[#03050e] text-white">
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
              <p className="text-base text-white/70">LLM UI Playground</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left text-sm text-white/80 shadow-inner backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Demo Credentials</p>
            <div className="mt-3 space-y-2 font-mono text-sm">
              <p className="flex items-center justify-between gap-4">
                <span className="text-white/60">Email</span>
                <span className="text-white">user@llmui.com</span>
              </p>
              <p className="flex items-center justify-between gap-4">
                <span className="text-white/60">Password</span>
                <span className="text-white">123456</span>
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
