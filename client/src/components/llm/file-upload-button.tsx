'use client'

import { X } from 'lucide-react'
import { useRef } from 'react'

import AttachIcon from '@/assets/icons/attach'
import { Button } from '@/components/ui/button'

interface FileUploadButtonProps {
  onFilesSelect: (files: File[]) => void
  disabled?: boolean
  maxFiles?: number
  maxSize?: number // in bytes
  accept?: string
}

export function FileUploadButton({
  onFilesSelect,
  disabled = false,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = 'image/*,.pdf,.txt,.md,.csv,.doc,.docx',
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    // Validate number of files
    if (files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    // Validate file size
    const oversizedFiles = files.filter((file) => file.size > maxSize)
    if (oversizedFiles.length > 0) {
      alert(`Files must be smaller than ${maxSize / 1024 / 1024}MB`)
      return
    }

    onFilesSelect(files)

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="h-9 w-9 p-0 text-white/60 hover:text-white"
      >
        <AttachIcon />
      </Button>
    </>
  )
}

interface AttachmentChipProps {
  file: File
  onRemove: () => void
}

export function AttachmentChip({ file, onRemove }: AttachmentChipProps) {
  const isImage = file.type.startsWith('image/')
  const sizeKB = (file.size / 1024).toFixed(1)

  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      {isImage && file.size < 500000 && (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="h-8 w-8 rounded object-cover"
        />
      )}
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm text-white">{file.name}</p>
        <p className="text-xs text-white/60">{sizeKB} KB</p>
      </div>
      <button
        onClick={onRemove}
        className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
