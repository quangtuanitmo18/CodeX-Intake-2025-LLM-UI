import AttachIcon from '@/assets/icons/attach'
import SendIcon from '@/assets/icons/send'
import { MicrophoneButton } from '@/components/speech/microphone-button'
import type { Language } from '@/hooks/useSpeechToText'
import { Loader2 } from 'lucide-react'
import { memo, useEffect, useRef, useState } from 'react'
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
  const [speechLanguage, setSpeechLanguage] = useState<Language>('vi')

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
      className="mx-auto flex min-h-[100px] w-full flex-col gap-1 rounded-[16px] border border-[#191919] bg-[#0E0E0E] px-3 py-2 md:max-w-[600px] md:px-4 md:py-[14px] lg:max-w-[700px] xl:max-w-[800px] 2xl:max-w-[900px]"
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
          inputMode="text"
          enterKeyHint="send"
        />
      </div>

      {/* Footer with buttons */}
      <div className="mt-3 flex items-center justify-between gap-2 md:gap-0">
        <div className="flex items-center gap-2">
          {/* Microphone Button with Language Selector */}
          <MicrophoneButton
            language={speechLanguage}
            onLanguageChange={setSpeechLanguage}
            onTranscriptChange={setPrompt}
            disabled={isStreaming}
          />

          {/* Attach Button */}
          <button
            type="button"
            onClick={handleFileUpload}
            disabled={true}
            // disabled={isStreaming}
            className="flex items-center justify-center gap-1 rounded-[16px] border border-[#191919] px-[11px] py-[3px] text-[14px] font-medium leading-[22px] text-[#777777] transition-colors hover:border-[#777777] active:bg-white/5 disabled:opacity-50"
            aria-label="Attach file"
          >
            <AttachIcon />
            <span className="md:inline">Attach</span>
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!prompt.trim() || isStreaming}
          className="flex items-center justify-center gap-1 rounded-[16px] bg-white px-[11px] py-[3px] text-[14px] font-medium leading-[22px] text-black transition-colors hover:bg-white/90 active:bg-white/80 disabled:opacity-50 md:min-w-0 md:py-1"
          aria-label="Send message"
        >
          {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendIcon />}
          <span className="md:inline">Send</span>
        </button>
      </div>
    </form>
  )
})
