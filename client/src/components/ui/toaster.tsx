"use client"

import { cn } from "@/lib/utils"
import { ToastProvider, useToastQueue } from "./use-toast"

export function Toaster() {
  return (
    <ToastProvider>
      <ToastViewport />
    </ToastProvider>
  )
}

function ToastViewport() {
  const { toasts, dismiss } = useToastQueue()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-3 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto w-full max-w-sm rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur",
            toast.variant === "destructive"
              ? "border-red-500/30 bg-red-500/20 text-red-50"
              : "border-white/20 bg-[#040714]/90 text-white"
          )}
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              {toast.title && <p className="font-semibold">{toast.title}</p>}
              {toast.description && <p className="text-sm text-white/80">{toast.description}</p>}
            </div>
            <button
              className="text-xs uppercase tracking-wide text-white/60 transition hover:text-white"
              onClick={() => dismiss(toast.id)}
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}


