'use client'

import { toast } from '@/components/ui/use-toast'
import { Role } from '@/constants/type'
import { cn, handleErrorApi } from '@/lib/utils'
import { useAccountMe } from '@/queries/useAccount'
import { useLogoutMutation } from '@/queries/useAuth'
import { ChevronDown, LoaderCircle, LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type DropdownPlacement = 'top' | 'bottom'

interface UserProfileMenuProps {
  className?: string
  dropdownPlacement?: DropdownPlacement
}

export function UserProfileMenu({ className, dropdownPlacement = 'bottom' }: UserProfileMenuProps) {
  const router = useRouter()
  const { data: accountData, isLoading } = useAccountMe()
  const logoutMutation = useLogoutMutation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const account = accountData?.payload.data

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = async () => {
    try {
      const result = await logoutMutation.mutateAsync()
      toast({
        description: 'Logged out successfully',
      })
      router.push('/login')
    } catch (error: any) {
      handleErrorApi({ error })
    }
  }

  if (isLoading) {
    return (
      <button
        disabled
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-white opacity-60"
      >
        <LoaderCircle className="h-5 w-5 animate-spin" />
      </button>
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

  const planLabel = account?.role === Role.Admin ? 'Workspace' : 'Plus'

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-white transition hover:border-white/20 hover:bg-white/10',
          className
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-sm font-semibold uppercase text-white">
          {account?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={account.avatar}
              alt={account.name || 'User'}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{getInitials(account?.name)}</span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-medium text-white">{account?.name || 'User'}</span>
          <span className="text-xs text-emerald-300">{planLabel}</span>
        </div>

        <ChevronDown
          className={cn(
            'h-4 w-4 text-white/60 transition duration-200',
            isOpen && 'rotate-180 text-white'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 z-50 w-56 overflow-hidden rounded-md border border-white/10 shadow-lg animate-in fade-in zoom-in-95',
            dropdownPlacement === 'top'
              ? 'bottom-full mb-2 origin-bottom-right'
              : 'top-full mt-2 origin-top-right'
          )}
        >
          {/* User Info */}
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-white">{account?.name || 'User'}</p>
            <p className="text-xs text-gray-400">{account?.email}</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10" />

          {/* Menu Items */}
          <div className="p-1">
            <button
              onClick={() => {
                router.push('/profile')
                setIsOpen(false)
              }}
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-white transition-colors hover:bg-white/10"
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </button>
            {/* 
            <button
              onClick={() => {
                router.push('/settings')
                setIsOpen(false)
              }}
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-white transition-colors hover:bg-white/10"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </button> */}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10" />

          {/* Logout */}
          <div className="p-1">
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className={cn(
                'flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-red-500 transition-colors hover:bg-white/10',
                logoutMutation.isPending && 'cursor-not-allowed opacity-60'
              )}
            >
              {logoutMutation.isPending ? (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
