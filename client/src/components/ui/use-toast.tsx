"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

export type ToastVariant = "default" | "destructive"

export type ToastOptions = {
  id?: string
  title?: string
  description?: string
  duration?: number
  variant?: ToastVariant
}

type ToastInternal = Required<ToastOptions>

type Listener = (toast: ToastInternal) => void

const listeners = new Set<Listener>()

const DEFAULT_DURATION = 4000

const randomId = () => Math.random().toString(36).slice(2, 10)

export const toast = (options: ToastOptions) => {
  const toastPayload: ToastInternal = {
    id: options.id ?? randomId(),
    title: options.title ?? "",
    description: options.description ?? "",
    duration: options.duration ?? DEFAULT_DURATION,
    variant: options.variant ?? "default",
  }

  listeners.forEach((listener) => listener(toastPayload))
  return toastPayload.id
}

type ToastContextValue = {
  toasts: ToastInternal[]
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const useToastQueue = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToastQueue must be used inside <Toaster />")
  }
  return context
}

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastInternal[]>([])

  useEffect(() => {
    const listener: Listener = (newToast) => {
      setToasts((current) => [...current, newToast])
      if (newToast.duration !== Infinity) {
        window.setTimeout(() => {
          setToasts((current) => current.filter((toast) => toast.id !== newToast.id))
        }, newToast.duration)
      }
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const value = useMemo(() => ({ toasts, dismiss }), [toasts, dismiss])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}


