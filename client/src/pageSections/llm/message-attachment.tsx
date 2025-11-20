'use client'

import { Download, FileText } from 'lucide-react'

import envConfig from '@/config'
import { cn } from '@/lib/utils'

interface MessageAttachmentProps {
  attachment: {
    id: string
    fileName: string
    fileUrl: string
    fileType: string
    fileSize: number
  }
  className?: string
}

export function MessageAttachment({ attachment, className }: MessageAttachmentProps) {
  const isImage = attachment.fileType.startsWith('image/')
  const sizeKB = (attachment.fileSize / 1024).toFixed(1)
  const fullUrl = `${envConfig.NEXT_PUBLIC_API_ENDPOINT}${attachment.fileUrl}`

  const handleDownload = () => {
    window.open(fullUrl, '_blank')
  }

  if (isImage) {
    return (
      <div
        className={cn(
          'group relative overflow-hidden rounded-lg border border-white/10',
          className
        )}
      >
        <img
          src={fullUrl}
          alt={attachment.fileName}
          className="max-h-64 w-auto cursor-pointer object-contain transition-opacity group-hover:opacity-80"
          onClick={handleDownload}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleDownload}
            className="rounded-full bg-white/20 p-3 backdrop-blur-sm"
          >
            <Download className="h-5 w-5 text-white" />
          </button>
        </div>
        <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
          {sizeKB} KB
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={handleDownload}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10',
        className
      )}
    >
      <div className="rounded-lg bg-white/10 p-2">
        <FileText className="h-5 w-5 text-white/60" />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium text-white">{attachment.fileName}</p>
        <p className="text-xs text-white/60">
          {attachment.fileType.split('/')[1]?.toUpperCase()} · {sizeKB} KB
        </p>
      </div>
      <Download className="h-4 w-4 text-white/60" />
    </div>
  )
}
