'use client'

import accountApiRequest from '@/apiRequests/account'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { useTranslation } from '@/hooks/use-translation'
import { handleErrorApi, removeTokensFromLocalStorage } from '@/lib/utils'
import { ChangePasswordBody, ChangePasswordBodyType } from '@/schemaValidations/account.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

export function ChangePasswordForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const form = useForm<ChangePasswordBodyType>({
    resolver: zodResolver(ChangePasswordBody),
    defaultValues: {
      oldPassword: '',
      password: '',
      confirmPassword: '',
    },
  })
  const mutation = useMutation({
    mutationFn: accountApiRequest.changePassword,
  })

  const onSubmit = async (values: ChangePasswordBodyType) => {
    try {
      const res = await mutation.mutateAsync(values)
      toast({
        title: t('password.passwordUpdated'),
        description:
          (res.payload as { message?: string })?.message ||
          t('password.passwordUpdatedSuccessfully'),
      })
      removeTokensFromLocalStorage()
      router.push('/login')
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      })
    }
  }

  return (
    <Form {...form}>
      <form
        className="w-full max-w-2xl space-y-3 md:space-y-4"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="oldPassword"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="oldPassword">{t('password.currentPassword')}</Label>
              <Input id="oldPassword" type="password" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="password">{t('password.newPassword')}</Label>
              <Input id="password" type="password" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="confirmPassword">{t('password.confirmPassword')}</Label>
              <Input id="confirmPassword" type="password" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
          {t('password.updatePassword')}
        </Button>
      </form>
    </Form>
  )
}
