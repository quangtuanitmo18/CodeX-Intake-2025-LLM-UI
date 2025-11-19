import AttachIcon from '@/assets/icons/attach'
import SendIcon from '@/assets/icons/send'
import { Loader2 } from 'lucide-react'
import { memo, useEffect, useRef } from 'react'
import { AttachmentChip } from './file-upload-button'

type AttachmentItem = {
  id: string
  file: File
}

interface ChatComposerProps {
  prompt: string
  setPrompt: (value: string) => void
  attachments: AttachmentItem[]
  setAttachments: (value: AttachmentItem[] | ((prev: AttachmentItem[]) => AttachmentItem[])) => void
  composerError: string | null
  isStreaming: boolean
  onSubmit: (event?: React.FormEvent<HTMLFormElement>) => Promise<void>
}

// Memoize to prevent re-rendering when messages update
export const ChatComposer = memo(function ChatComposer({
  prompt,
  setPrompt,
  attachments,
  setAttachments,
  composerError,
  isStreaming,
  onSubmit,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return
    const textarea = textareaRef.current

    const resizeTextarea = () => {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      const newHeight = Math.min(scrollHeight, 700)
      textarea.style.height = `${newHeight}px`
    }

    resizeTextarea()
  }, [prompt])

  const handleKeydown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSubmit()
    }
  }

  const handleFileUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.onchange = (e: any) => {
      const files = Array.from(e.target.files || []) as File[]
      setAttachments((prev) => [
        ...prev,
        ...files.map((file) => ({
          id: `${file.name}-${file.lastModified}`,
          file,
        })),
      ])
    }
    input.click()
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex min-h-[100px] w-full max-w-[600px] flex-col gap-1 rounded-[16px] border border-[#191919] bg-[#0E0E0E] p-4"
    >
      {attachments.length > 0 && (
        <div className="mb-2 space-y-2">
          {attachments.map((item) => (
            <AttachmentChip
              key={item.id}
              file={item.file}
              onRemove={() => setAttachments((prev) => prev.filter((a) => a.id !== item.id))}
            />
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex flex-1 overflow-hidden">
        {composerError && <p className="mb-1 text-xs text-red-300">{composerError}</p>}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything"
          onKeyDown={handleKeydown}
          rows={1}
          disabled={isStreaming}
          className="custom-scrollbar max-h-[300px] w-full resize-none overflow-y-auto border-0 bg-transparent text-[14px] leading-[22px] text-white placeholder:text-[#777777] focus:outline-none disabled:opacity-50"
          style={{ minHeight: '22px' }}
        />
      </div>

      {/* Footer with buttons */}
      <div className="flex h-[28px] items-center justify-between">
        {/* Attach Button */}
        <button
          type="button"
          onClick={handleFileUpload}
          disabled={isStreaming}
          className="flex h-[28px] items-center gap-1 rounded-[16px] border border-[#191919] px-3 py-1 text-[14px] font-medium leading-[22px] text-[#777777] hover:border-[#777777] disabled:opacity-50"
        >
          <AttachIcon />
          <span>Attach</span>
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!prompt.trim() || isStreaming}
          className="flex h-[28px] items-center gap-1 rounded-[16px] bg-white px-3 py-1 text-[14px] font-medium leading-[22px] text-black hover:bg-white/90 disabled:opacity-50"
        >
          {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendIcon />}
          <span>Send</span>
        </button>
      </div>
    </form>
  )
})
