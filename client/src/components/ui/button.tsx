import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'link'
type ButtonSize = 'default' | 'sm' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
  secondary: 'bg-white/10 text-white hover:bg-white/20',
  ghost: 'bg-transparent text-white hover:bg-white/10',
  outline: 'border border-white/20 text-white hover:bg-white/5',
  destructive: 'bg-red-500 text-white hover:bg-red-500/90',
  link: 'bg-transparent text-primary underline hover:text-primary/80',
}

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-11 px-4',
  sm: 'h-9 px-3 text-sm',
  lg: 'h-12 px-6 text-base',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-2xl font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'


