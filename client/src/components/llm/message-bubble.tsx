import ThoughtIcon from '@/assets/icons/thought'
import { type MarkdownBlock } from '@/lib/markdown'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { memo, useState } from 'react'
import { MarkdownContent } from './markdown-content'
import { MessageAttachment } from './message-attachment'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  author: string
  timestamp: string
  content: string
  blocks: MarkdownBlock[]
  attachments?: any[]
  reasoning?: string
}

interface MessageBubbleProps {
  message: ChatMessage
  isStreaming?: boolean
  isThinking?: boolean
  thinkingSeconds?: number
  savedThinkingSeconds?: number
}

// Memoize to prevent re-rendering when other messages update
export const MessageBubble = memo(function MessageBubble({
  message,
  isStreaming = false,
  isThinking = false,
  thinkingSeconds,
  savedThinkingSeconds,
}: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(true)
  const hasReasoning = message.reasoning && message.reasoning.trim().length > 0

  return (
    <article className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'flex flex-col',
          isUser
            ? 'max-w-[454px] rounded-[20px] bg-[#2D2D2D] px-4 py-3'
            : 'w-full max-w-full space-y-1'
        )}
      >
        {/* Reasoning - Show ABOVE content for assistant messages */}
        {!isUser && hasReasoning && (
          <div className="mb-[10px] flex w-full flex-col gap-[10px]">
            <button
              onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
              className="flex items-center gap-[5px] py-[1px] text-left"
            >
              <div className="flex h-[14px] w-[14px] items-center justify-center">
                <ThoughtIcon />
              </div>
              <span className="text-[14px] leading-[22px] text-[#777777]">
                {isThinking ? 'Thinking...' : 'Thought'}
                {` for ${savedThinkingSeconds} seconds`}
              </span>
              {isReasoningExpanded ? (
                <ChevronUp className="h-[18px] w-[18px] text-[#777777]" />
              ) : (
                <ChevronDown className="h-[18px] w-[18px] text-[#777777]" />
              )}
            </button>

            {isReasoningExpanded && (
              <div className="text-[14px] leading-[22px] text-[#777777]">{message.reasoning}</div>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn('text-[15px]', isUser ? 'text-white' : 'text-white/90')}>
          <MarkdownContent content={message.content} isUser={isUser} />
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.attachments.map((attachment: any) => (
              <MessageAttachment key={attachment.id} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </article>
  )
})
