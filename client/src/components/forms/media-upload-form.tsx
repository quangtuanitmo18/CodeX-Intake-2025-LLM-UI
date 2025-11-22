'use client'

import { mediaApiRequest } from '@/apiRequests/media'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { useState } from 'react'

export function MediaUploadForm() {
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      setIsUploading(true)
      const res = await mediaApiRequest.upload(formData)
      setPreview(res.payload.data)
      toast({
        title: 'Upload complete',
        description: res.payload.message,
      })
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error?.payload?.message ?? 'Unable to upload file',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-3">
      <Label htmlFor="media-input">Upload sample image</Label>
      <Input
        id="media-input"
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={isUploading}
      />
      {preview && (
        <div className="rounded-lg border bg-muted p-3 md:p-4">
          <p className="text-xs font-medium md:text-sm">Uploaded path</p>
          <a
            href={preview}
            className="break-all text-xs text-primary underline md:text-sm"
            target="_blank"
            rel="noreferrer"
          >
            {preview}
          </a>
        </div>
      )}
      <Button type="button" variant="ghost" onClick={() => setPreview(null)}>
        Clear preview
      </Button>
    </div>
  )
}
