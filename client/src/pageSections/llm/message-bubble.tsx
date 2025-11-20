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
            ? 'max-w-[85%] rounded-[20px] bg-[#2D2D2D] px-3 py-2 md:max-w-[70%] md:px-4 md:py-3'
            : 'w-full max-w-[85%] space-y-1 md:max-w-[70%]'
        )}
      >
        {/* Reasoning - Show ABOVE content for assistant messages */}
        {!isUser && hasReasoning && (
          <div className="mb-2 flex w-full flex-col gap-2 md:mb-[10px] md:gap-[10px]">
            <button
              onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
              className="flex min-h-[32px] items-center gap-[5px] py-1 text-left md:min-h-0 md:py-[1px]"
              aria-label={isReasoningExpanded ? 'Collapse reasoning' : 'Expand reasoning'}
            >
              <div className="flex h-[14px] w-[14px] shrink-0 items-center justify-center">
                <ThoughtIcon />
              </div>
              <span className="text-xs leading-[20px] text-[#777777] md:text-[14px] md:leading-[22px]">
                {isThinking ? 'Thinking...' : 'Thought'}
                {` for ${savedThinkingSeconds} seconds`}
              </span>
              {isReasoningExpanded ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-[#777777] md:h-[18px] md:w-[18px]" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-[#777777] md:h-[18px] md:w-[18px]" />
              )}
            </button>

            {isReasoningExpanded && (
              <div className="text-xs leading-[20px] text-[#777777] md:text-[14px] md:leading-[22px]">
                {message.reasoning}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            'text-sm leading-[20px] md:text-[15px] md:leading-[22px]',
            isUser ? 'text-white' : 'text-white/90'
          )}
        >
          <MarkdownContent content={message.content} isUser={isUser} />
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-2 md:mt-3">
            {message.attachments.map((attachment: any) => (
              <MessageAttachment key={attachment.id} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </article>
  )
})
