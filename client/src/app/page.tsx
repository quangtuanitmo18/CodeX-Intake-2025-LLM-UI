import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-16 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-primary">LLM UI Boilerplate</p>
      <h1 className="text-4xl font-semibold leading-tight">
        Full-stack starter focused on authentication, account management, and media uploads.
      </h1>
      <p className="text-muted-foreground">
        This project keeps the essentials from the original app—Next.js + React Query on the client,
        Fastify + Prisma on the server—while removing domain-specific features so you can build new
        ideas quickly.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/login"
          className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow"
        >
          Sign in
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md border border-input px-6 py-3 text-sm font-semibold text-foreground"
        >
          View dashboard
        </Link>
      </div>
      <div className="mx-auto mt-8 grid w-full max-w-2xl gap-4 rounded-2xl border bg-muted/30 p-6 text-left sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Server</p>
          <p className="text-lg font-medium">Fastify · Prisma · Sentry</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Client</p>
          <p className="text-lg font-medium">Next.js · React Query · Shadcn UI</p>
        </div>
      </div>
    </main>
  )
}


