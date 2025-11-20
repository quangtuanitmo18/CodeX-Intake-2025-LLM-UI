'use client'

import { Download, FileJson, FileText } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useExportConversation } from '@/queries/useConversation'

interface ExportMenuProps {
  conversationId: string
  conversationTitle?: string
  className?: string
}

export function ExportMenu({ conversationId, conversationTitle, className }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const exportMutation = useExportConversation()

  const handleExport = async (format: 'json' | 'markdown') => {
    try {
      const result = await exportMutation.mutateAsync({ id: conversationId, format })

      // Create blob and download
      const blob = new Blob(
        [format === 'json' ? JSON.stringify(result.payload, null, 2) : result.payload],
        {
          type: format === 'json' ? 'application/json' : 'text/markdown',
        }
      )

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${conversationTitle || 'conversation'}-${conversationId}.${format === 'json' ? 'json' : 'md'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setIsOpen(false)
    } catch (error) {
      console.error('Failed to export conversation:', error)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 text-white/60 hover:text-white"
      >
        <Download className="h-4 w-4" />
        Export
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-10 z-20 w-56 rounded-lg border border-white/10 bg-[#040714] p-1 shadow-xl">
            <button
              onClick={() => handleExport('json')}
              disabled={exportMutation.isPending}
              className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-50"
            >
              <FileJson className="h-4 w-4" />
              Export as JSON
            </button>
            <button
              onClick={() => handleExport('markdown')}
              disabled={exportMutation.isPending}
              className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />
              Export as Markdown
            </button>
          </div>
        </>
      )}
    </div>
  )
}
