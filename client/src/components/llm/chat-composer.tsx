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
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }

    const rafId = requestAnimationFrame(resizeTextarea)
    return () => cancelAnimationFrame(rafId)
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
      className="mx-auto flex h-[100px] w-full max-w-[600px] flex-col justify-between rounded-[16px] border border-[#191919] bg-[#0E0E0E] p-4"
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
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything"
          onKeyDown={handleKeydown}
          rows={1}
          disabled={isStreaming}
          className="h-full w-full resize-none border-0 bg-transparent text-[14px] leading-[22px] text-white placeholder:text-[#777777] focus:outline-none disabled:opacity-50"
        />
        {composerError && <p className="mt-1 text-xs text-red-300">{composerError}</p>}
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
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="h-4 w-4">
            <path
              d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10"
              stroke="#777777"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.3333 5.33333L8 2L4.66667 5.33333"
              stroke="#777777"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 2V10"
              stroke="#777777"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Attach</span>
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!prompt.trim() || isStreaming}
          className="flex h-[28px] items-center gap-1 rounded-[16px] bg-white px-3 py-1 text-[14px] font-medium leading-[22px] text-black hover:bg-white/90 disabled:opacity-50"
        >
          {isStreaming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="h-4 w-4">
              <path
                d="M14.6667 1.33334L7.33333 8.66668"
                stroke="black"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14.6667 1.33334L10 14.6667L7.33333 8.66668L1.33333 6.00001L14.6667 1.33334Z"
                stroke="black"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <span>Send</span>
        </button>
      </div>
    </form>
  )
})
