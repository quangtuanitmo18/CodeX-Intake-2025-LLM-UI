'use client'

import { toast } from '@/components/ui/use-toast'
import { cn, handleErrorApi } from '@/lib/utils'
import { useAccountMe, useChangePasswordMutation, useUpdateMeMutation } from '@/queries/useAccount'
import {
  ChangePasswordBody,
  ChangePasswordBodyType,
  UpdateMeBody,
  UpdateMeBodyType,
} from '@/schemaValidations/account.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Camera, LoaderCircle, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

export default function ProfilePage() {
  const router = useRouter()
  const { data: accountData, isLoading } = useAccountMe()
  const updateMeMutation = useUpdateMeMutation()
  const changePasswordMutation = useChangePasswordMutation()
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const account = accountData?.payload.data

  const profileForm = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: {
      name: '',
      avatar: null,
    },
  })

  const passwordForm = useForm<ChangePasswordBodyType>({
    resolver: zodResolver(ChangePasswordBody),
    defaultValues: {
      oldPassword: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Set initial form values when account data loads
  useEffect(() => {
    if (account) {
      profileForm.reset({
        name: account.name,
        avatar: account.avatar,
      })
      setAvatarPreview(account.avatar)
    }
  }, [account, profileForm])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // For now, just create a preview URL
      // In production, you'd upload to server first
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatarPreview(result)
        profileForm.setValue('avatar', result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmitProfile = async (data: UpdateMeBodyType) => {
    if (updateMeMutation.isPending) return
    try {
      const result = await updateMeMutation.mutateAsync(data)
      toast({
        description: result.payload.message,
      })
    } catch (error: any) {
      handleErrorApi({
        error,
        setError: profileForm.setError,
      })
    }
  }

  const onSubmitPassword = async (data: ChangePasswordBodyType) => {
    if (changePasswordMutation.isPending) return
    try {
      const result = await changePasswordMutation.mutateAsync(data)
      toast({
        description: result.payload.message || 'Password changed successfully',
      })
      passwordForm.reset()
    } catch (error: any) {
      handleErrorApi({
        error,
        setError: passwordForm.setError,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#01030B]">
        <LoaderCircle className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-[#01030B] text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-3 md:py-4">
          <button
            onClick={() => router.back()}
            className="inline-flex min-h-[44px] items-center gap-2 text-sm text-gray-400 transition hover:text-white active:text-white/80 md:min-h-0"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-6 md:py-8">
        <h1 className="mb-6 text-2xl font-bold md:mb-8 md:text-3xl">Profile Settings</h1>

        {/* Tabs */}
        <div className="mb-4 flex gap-2 border-b border-gray-800 md:mb-6 md:gap-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={cn(
              'min-h-[44px] border-b-2 px-3 py-2 text-xs font-medium transition md:min-h-0 md:px-4 md:text-sm',
              activeTab === 'profile'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white active:text-white/80'
            )}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={cn(
              'min-h-[44px] border-b-2 px-3 py-2 text-xs font-medium transition md:min-h-0 md:px-4 md:text-sm',
              activeTab === 'password'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white active:text-white/80'
            )}
          >
            Change Password
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 md:p-6">
            <form
              onSubmit={profileForm.handleSubmit(onSubmitProfile)}
              className="space-y-4 md:space-y-6"
            >
              {/* Avatar */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
                <div className="relative">
                  <div className="inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-gray-700 bg-gray-800 text-xl font-semibold md:h-24 md:w-24 md:text-2xl">
                    {avatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarPreview}
                        alt={account?.name || 'Avatar'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{getInitials(account?.name)}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border-2 border-gray-900 bg-blue-600 p-2 transition hover:bg-blue-700 active:bg-blue-800 md:min-h-0 md:min-w-0"
                    aria-label="Change avatar"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="text-base font-medium md:text-lg">{account?.name}</h3>
                  <p className="text-xs text-gray-400 md:text-sm">{account?.email}</p>
                  <p className="mt-1 text-xs text-gray-500">Click camera icon to change avatar</p>
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="mb-2 block text-xs font-medium md:text-sm">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...profileForm.register('name')}
                  className="min-h-[44px] w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 md:px-4"
                />
                {profileForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-500 md:text-sm">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Email (read-only) */}
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-medium md:text-sm">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={account?.email || ''}
                  disabled
                  className="min-h-[44px] w-full rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-sm text-gray-500 outline-none md:px-4"
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updateMeMutation.isPending}
                  className={cn(
                    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium transition hover:bg-blue-700 active:bg-blue-800 md:min-h-0 md:px-6 md:text-base',
                    updateMeMutation.isPending && 'cursor-not-allowed opacity-60'
                  )}
                >
                  {updateMeMutation.isPending ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 md:p-6">
            <form
              onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
              className="space-y-4 md:space-y-6"
            >
              {/* Old Password */}
              <div>
                <label htmlFor="oldPassword" className="mb-2 block text-xs font-medium md:text-sm">
                  Current Password
                </label>
                <input
                  id="oldPassword"
                  type="password"
                  {...passwordForm.register('oldPassword')}
                  className="min-h-[44px] w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 md:px-4"
                />
                {passwordForm.formState.errors.oldPassword && (
                  <p className="mt-1 text-xs text-red-500 md:text-sm">
                    {passwordForm.formState.errors.oldPassword.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="password" className="mb-2 block text-xs font-medium md:text-sm">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  {...passwordForm.register('password')}
                  className="min-h-[44px] w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 md:px-4"
                />
                {passwordForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-500 md:text-sm">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-xs font-medium md:text-sm"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...passwordForm.register('confirmPassword')}
                  className="min-h-[44px] w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500 md:px-4"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500 md:text-sm">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className={cn(
                    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium transition hover:bg-blue-700 active:bg-blue-800 md:min-h-0 md:px-6 md:text-base',
                    changePasswordMutation.isPending && 'cursor-not-allowed opacity-60'
                  )}
                >
                  {changePasswordMutation.isPending ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  Change Password
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
