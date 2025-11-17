'use client'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn('text-xs font-semibold uppercase tracking-[0.3em] text-white/60', className)}
      {...props}
    />
  )
})
Label.displayName = 'Label'


