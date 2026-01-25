'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  onOpenChange?: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined)

interface DropdownMenuProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const DropdownMenu = ({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    },
    [controlledOpen, onOpenChange]
  )

  const contextValue = React.useMemo(
    () => ({
      open,
      setOpen,
      onOpenChange,
    }),
    [open, setOpen, onOpenChange]
  )

  return (
    <DropdownMenuContext.Provider value={contextValue}>{children}</DropdownMenuContext.Provider>
  )
}

const useDropdownMenuContext = () => {
  const context = React.useContext(DropdownMenuContext)
  if (!context) {
    throw new Error('DropdownMenu components must be used within DropdownMenu')
  }
  return context
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  children: React.ReactNode
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ asChild, children, onClick, ...props }, ref) => {
    const { open, setOpen } = useDropdownMenuContext()
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null)

    React.useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        setPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
        })
      }
      setOpen(!open)
      onClick?.(e)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick(e as any)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setOpen(true)
      }
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ref: triggerRef,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        'aria-expanded': open,
        'aria-haspopup': 'true',
        ...props,
      } as any)
    }

    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-haspopup="true"
        {...props}
      >
        {children}
      </button>
    )
  }
)
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end' | 'center'
  children: React.ReactNode
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, align = 'start', children, ...props }, ref) => {
    const { open, setOpen } = useDropdownMenuContext()
    const [mounted, setMounted] = React.useState(false)
    const contentRef = React.useRef<HTMLDivElement>(null)
    const triggerRef = React.useRef<HTMLElement | null>(null)

    React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement)

    React.useEffect(() => {
      setMounted(true)
      return () => setMounted(false)
    }, [])

    React.useEffect(() => {
      if (!open) return

      // Find trigger element
      const findTrigger = () => {
        const allButtons = document.querySelectorAll('button[aria-expanded="true"]')
        return allButtons[allButtons.length - 1] as HTMLElement
      }

      triggerRef.current = findTrigger()

      const handleClickOutside = (event: MouseEvent) => {
        if (
          contentRef.current &&
          !contentRef.current.contains(event.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          setOpen(false)
        }
      }

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setOpen(false)
          triggerRef.current?.focus()
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }, [open, setOpen])

    React.useEffect(() => {
      if (open && contentRef.current && triggerRef.current) {
        const contentRect = contentRef.current.getBoundingClientRect()
        const triggerRect = triggerRef.current.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        let top = triggerRect.bottom + 4
        let left = triggerRect.left

        // Adjust horizontal alignment
        if (align === 'end') {
          left = triggerRect.right - contentRect.width
        } else if (align === 'center') {
          left = triggerRect.left + (triggerRect.width - contentRect.width) / 2
        }

        // Ensure content stays within viewport
        if (left + contentRect.width > viewportWidth) {
          left = viewportWidth - contentRect.width - 8
        }
        if (left < 8) {
          left = 8
        }

        // If content would overflow bottom, show above trigger
        if (top + contentRect.height > viewportHeight) {
          top = triggerRect.top - contentRect.height - 4
        }
        if (top < 8) {
          top = 8
        }

        contentRef.current.style.top = `${top + window.scrollY}px`
        contentRef.current.style.left = `${left + window.scrollX}px`
      }
    }, [open, align])

    if (!open || !mounted) return null

    const content = (
      <div
        ref={contentRef}
        className={cn(
          'fixed z-50 min-w-[8rem] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
          'transition-opacity duration-200',
          className
        )}
        role="menu"
        aria-orientation="vertical"
        {...props}
      >
        {children}
      </div>
    )

    return createPortal(content, document.body)
  }
)
DropdownMenuContent.displayName = 'DropdownMenuContent'

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  disabled?: boolean
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, children, onClick, disabled, ...props }, ref) => {
    const { setOpen } = useDropdownMenuContext()

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return
      onClick?.(e)
      if (!e.defaultPrevented) {
        setOpen(false)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick(e as any)
      }
    }

    return (
      <div
        ref={ref}
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
          'transition-colors focus:bg-accent focus:text-accent-foreground',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          disabled && 'pointer-events-none opacity-50',
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuItem.displayName = 'DropdownMenuItem'

export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger }
