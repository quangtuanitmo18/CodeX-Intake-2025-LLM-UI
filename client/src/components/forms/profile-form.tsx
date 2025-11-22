'use client'

import accountApiRequest from '@/apiRequests/account'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { handleErrorApi } from '@/lib/utils'
import { UpdateMeBody, UpdateMeBodyType } from '@/schemaValidations/account.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

export function ProfileForm({ defaultValues }: { defaultValues: UpdateMeBodyType }) {
  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues,
  })

  const mutation = useMutation({
    mutationFn: accountApiRequest.updateMe,
  })

  const onSubmit = async (values: UpdateMeBodyType) => {
    try {
      const res = await mutation.mutateAsync(values)
      toast({
        title: 'Profile updated',
        description: res.payload.message,
      })
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="name">Display name</Label>
              <Input id="name" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input id="avatar" placeholder="https://…" {...field} value={field.value ?? ''} />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
          Save changes
        </Button>
      </form>
    </Form>
  )
}
