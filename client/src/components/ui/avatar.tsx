'use client'

import { cn } from '@/lib/utils'
import { createContext, useContext } from 'react'

type AvatarContextType = {
  src?: string
  alt?: string
}

const AvatarContext = createContext<AvatarContextType>({})

type AvatarProps = {
  children?: React.ReactNode
  src?: string
  alt?: string
  fallback?: string
  className?: string
}

export function Avatar({ children, src, alt = 'Avatar', fallback, className }: AvatarProps) {
  const hasChildren = children !== undefined && children !== null
  const initials = fallback ?? (alt ? alt.slice(0, 2).toUpperCase() : '??')

  if (hasChildren) {
    return (
      <AvatarContext.Provider value={{ src, alt }}>
        <div
          className={cn(
            'relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10 text-sm font-semibold text-white',
            className
          )}
        >
          {children}
        </div>
      </AvatarContext.Provider>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold text-white',
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full rounded-full object-cover" />
      ) : (
        initials
      )}
    </div>
  )
}

export const AvatarImage = ({
  src,
  alt,
  className,
}: {
  src: string
  alt?: string
  className?: string
}) => {
  const context = useContext(AvatarContext)
  const imageSrc = src || context.src
  const imageAlt = alt || context.alt || 'Avatar'

  if (!imageSrc) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageSrc}
      alt={imageAlt}
      className={cn('h-full w-full rounded-full object-cover', className)}
    />
  )
}

export const AvatarFallback = ({ children }: { children?: React.ReactNode }) => (
  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase tracking-wide">
    {children}
  </span>
)
