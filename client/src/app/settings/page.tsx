import { ChangePasswordForm } from '@/components/forms/change-password-form'
import { MediaUploadForm } from '@/components/forms/media-upload-form'
import { ProfileForm } from '@/components/forms/profile-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { serverGet } from '@/lib/server-api'
import { AccountResType } from '@/schemaValidations/account.schema'

export default async function SettingsPage() {
  const { data } = await serverGet<AccountResType>('accounts/me')

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12">
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Settings</p>
        <h1 className="text-3xl font-semibold">Manage your account</h1>
        <p className="text-muted-foreground">
          These forms demonstrate how to extend the boilerplate—update profiles, rotate passwords,
          and test media uploads.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm
              defaultValues={{
                name: data.name,
                avatar: data.avatar ?? '',
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Media upload</CardTitle>
        </CardHeader>
        <CardContent>
          <MediaUploadForm />
        </CardContent>
      </Card>
    </main>
  )
}


