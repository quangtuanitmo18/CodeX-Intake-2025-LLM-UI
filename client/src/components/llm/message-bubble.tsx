import { type MarkdownBlock } from '@/lib/markdown'
import { cn } from '@/lib/utils'
import { memo } from 'react'
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
}

// Memoize to prevent re-rendering when other messages update
export const MessageBubble = memo(function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

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
