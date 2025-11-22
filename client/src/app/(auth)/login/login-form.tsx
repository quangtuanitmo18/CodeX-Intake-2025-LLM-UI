'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { handleErrorApi } from '@/lib/utils'
import { useLoginMutation } from '@/queries/useAuth'
import { LoginBody, LoginBodyType } from '@/schemaValidations/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import { useForm } from 'react-hook-form'

function LoginFormContent() {
  const searchParams = useSearchParams()
  const loginMutation = useLoginMutation()
  const clearTokens = searchParams?.get('clearTokens')

  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: 'user@llmui.com',
      password: '123456',
    },
  })
  const router = useRouter()
  useEffect(() => {
    if (clearTokens) {
      // Clear tokens logic if needed
    }
  }, [clearTokens])
  const onSubmit = async (data: LoginBodyType) => {
    // Khi nhấn submit thì React hook form sẽ validate cái form bằng zod schema ở client trước
    // Nếu không pass qua vòng này thì sẽ không gọi api
    if (loginMutation.isPending) return
    try {
      const result = await loginMutation.mutateAsync(data)
      toast({
        description: result.payload.message,
      })
      router.push('/llm')
    } catch (error: any) {
      handleErrorApi({
        error,
        setError: form.setError,
      })
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md border-white/10 bg-white/5 text-white backdrop-blur">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-semibold">Вход в систему</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-5"
            noValidate
            onSubmit={form.handleSubmit(onSubmit, (err) => {
              console.log(err)
            })}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-white/80">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="bg-black/30"
                      {...field}
                    />
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-white/80">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="bg-black/30"
                      {...field}
                    />
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full rounded-2xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow transition hover:opacity-90"
              >
                {loginMutation.isPending && <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />}
                Войти
              </Button>
              <p className="text-center text-xs text-white/50">
                По умолчанию используются demo-данные. Вы можете изменить их перед входом.
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  )
}
