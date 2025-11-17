import { LoginForm } from '@/components/forms/login-form'

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-120px)] w-full max-w-5xl flex-col items-center justify-center gap-6 px-4 py-12">
      <div className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Authed area</p>
        <h1 className="text-3xl font-semibold">Sign in to continue</h1>
        <p className="text-muted-foreground">
          Use the default admin credentials from your environment variables or create a new account
          via the API.
        </p>
      </div>
      <LoginForm />
    </main>
  )
}


