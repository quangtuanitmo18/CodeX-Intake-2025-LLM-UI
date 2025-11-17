import { serverGet } from '@/lib/server-api'
import { AccountListResType, AccountResType } from '@/schemaValidations/account.schema'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function DashboardPage() {
  const mePromise = serverGet<AccountResType>('accounts/me')
  const listPromise = serverGet<AccountListResType>('accounts')
  const [{ data: me }, { data: accounts }] = await Promise.all([mePromise, listPromise])

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12">
      <div className="flex flex-col gap-4 rounded-3xl bg-muted/40 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Dashboard</p>
          <h1 className="text-3xl font-semibold leading-tight">Welcome back, {me.name}</h1>
          <p className="text-muted-foreground">
            Use this space as a starting point for future admin experiences. Only the auth/account
            modules remain, so you can drop in your own product logic.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 text-lg">
            {me.avatar && <AvatarImage src={me.avatar} alt={me.name} className="object-cover" />}
            <AvatarFallback>{me.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Role</p>
            <p className="text-lg font-semibold capitalize">{me.role}</p>
            <Link href="/settings" className="text-sm text-primary underline">
              Update profile
            </Link>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Total accounts</p>
          <p className="text-3xl font-semibold">{accounts.length}</p>
          <p className="text-sm text-muted-foreground">
            Owner account is generated from environment variables; everything else can be managed via
            the `/accounts` API.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <p className="text-sm font-medium text-muted-foreground">Media uploads</p>
          <p className="text-3xl font-semibold">Ready</p>
          <p className="text-sm text-muted-foreground">
            Use the sample widget on the settings page to test `/media/upload`.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border bg-card">
        <div className="border-b px-6 py-4">
          <p className="text-sm font-semibold text-muted-foreground">Accounts</p>
        </div>
        <div className="divide-y">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium">{account.name}</p>
                <p className="text-sm text-muted-foreground">{account.email}</p>
              </div>
              <p className="text-sm font-semibold capitalize">{account.role}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

