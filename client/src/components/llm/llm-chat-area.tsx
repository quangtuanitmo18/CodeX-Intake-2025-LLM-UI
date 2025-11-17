'use client'

import { Loader2, Send } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ZodError } from 'zod'

import { Button } from '@/components/ui/button'
import { parseMarkdownToBlocks, type MarkdownBlock } from '@/lib/markdown'
import { cn } from '@/lib/utils'
import {
  useConversation,
  useConversationMessages,
  useCreateMessage,
  useUploadAttachment,
} from '@/queries/useConversation'
import { useLLMStream } from '@/queries/useLLMStream'
import { CreateMessageBody } from '@/schemaValidations/conversation.schema'

import { ExportMenu } from './export-menu'
import { AttachmentChip, FileUploadButton } from './file-upload-button'
import { MessageAttachment } from './message-attachment'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  author: string
  timestamp: string
  blocks: MarkdownBlock[]
  attachments?: any[]
  reasoning?: string
}

type AttachmentItem = {
  id: string
  file: File
}

interface LLMChatAreaProps {
  conversationId?: string
}

export function LLMChatArea({ conversationId }: LLMChatAreaProps) {
  const [prompt, setPrompt] = useState('')
  const [attachments, setAttachments] = useState<AttachmentItem[]>([])
  const [composerError, setComposerError] = useState<string | null>(null)
  const [activeAssistantMessage, setActiveAssistantMessage] = useState<ChatMessage | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const transcriptRef = useRef<HTMLDivElement | null>(null)

  const { data: conversationData } = useConversation(conversationId || null)
  const { data: messagesData } = useConversationMessages(conversationId || null)
  const createMessageMutation = useCreateMessage()
  const uploadAttachmentMutation = useUploadAttachment()

  const { answer, reasoning, status, error: streamError, start, reset } = useLLMStream()
  const isStreaming = status === 'thinking' || status === 'streaming'

  const conversation = conversationData?.payload?.data
  const historicalMessages = messagesData?.payload?.data || []

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
  }, [prompt])

  // Auto-scroll
  useEffect(() => {
    if (!transcriptRef.current) return
    const el = transcriptRef.current
    el.scrollTo({
      top: el.scrollHeight,
      behavior: 'smooth',
    })
  }, [historicalMessages, activeAssistantMessage])

  // Handle streaming assistant message
  useEffect(() => {
    if (status === 'idle') {
      setActiveAssistantMessage(null)
      return
    }

    const parsedBlocks = parseMarkdownToBlocks(answer || '')
    setActiveAssistantMessage({
      id: 'assistant-live',
      role: 'assistant',
      author: 'Atlas · LLM',
      timestamp:
        status === 'complete'
          ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Live',
      blocks: parsedBlocks,
      reasoning: reasoning.join('\n'),
    })
  }, [status, answer, reasoning])

  // When streaming completes, reset
  useEffect(() => {
    if (status === 'complete') {
      reset()
    }
  }, [status, reset])

  const allMessages = useMemo<ChatMessage[]>(() => {
    const historical = historicalMessages.map((msg: any) => ({
      id: msg.id,
      role: msg.role,
      author: msg.role === 'user' ? 'You' : 'Atlas · LLM',
      timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      blocks: parseMarkdownToBlocks(msg.content),
      attachments: msg.attachments || [],
      reasoning: msg.reasoning,
    }))

    if (activeAssistantMessage) {
      return [...historical, activeAssistantMessage]
    }
    return historical
  }, [historicalMessages, activeAssistantMessage])

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    const trimmedPrompt = prompt.trim()

    if (!conversationId) {
      setComposerError('No active conversation. Please create a new chat.')
      return
    }

    try {
      // Upload attachments first
      const uploadedAttachments = []
      if (attachments.length > 0) {
        setComposerError('Uploading files...')
        const tempMessageId = `temp-${Date.now()}`

        for (const attachment of attachments) {
          const result = await uploadAttachmentMutation.mutateAsync({
            conversationId,
            messageId: tempMessageId,
            file: attachment.file,
          })
          uploadedAttachments.push(result.payload.data)
        }
      }

      // Validate with Zod
      CreateMessageBody.parse({
        content: trimmedPrompt,
        attachments: uploadedAttachments,
      })
      setComposerError(null)

      // Create message in DB
      await createMessageMutation.mutateAsync({
        conversationId,
        content: trimmedPrompt,
        attachments: uploadedAttachments,
      })

      // Start LLM streaming
      start(trimmedPrompt, conversationId)
      setPrompt('')
      setAttachments([])
    } catch (error) {
      if (error instanceof ZodError) {
        setComposerError(error.errors[0]?.message || 'Invalid message')
      } else {
        console.error('Failed to send message:', error)
        setComposerError('Failed to send message. Please try again.')
      }
    }
  }

  const handleComposerKeydown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  if (!conversationId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-white/60">
            Select a conversation or create a new chat to begin
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-[#040714] px-6 py-8">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            {conversation?.title || 'New Conversation'}
          </h1>
          <p className="mt-1 text-sm text-white/60">{conversation?.model || 'Atlas-2.1'}</p>
        </div>
        {conversationId && (
          <ExportMenu
            conversationId={conversationId}
            conversationTitle={conversation?.title || undefined}
          />
        )}
      </header>

      {/* Transcript */}
      <div ref={transcriptRef} className="flex-1 space-y-6 overflow-y-auto">
        {allMessages.length === 0 && (
          <div className="flex h-full items-center justify-center text-white/40">
            <p>Start a conversation...</p>
          </div>
        )}

        {allMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {status === 'error' && streamError && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {streamError}
          </div>
        )}
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="mt-6 border-t border-white/5 pt-6">
        {attachments.length > 0 && (
          <div className="mb-4 space-y-2">
            {attachments.map((item) => (
              <AttachmentChip
                key={item.id}
                file={item.file}
                onRemove={() => setAttachments((prev) => prev.filter((a) => a.id !== item.id))}
              />
            ))}
          </div>
        )}

        <div className="flex items-end gap-3">
          <FileUploadButton
            onFilesSelect={(files) => {
              setAttachments((prev) => [
                ...prev,
                ...files.map((file) => ({
                  id: `${file.name}-${file.lastModified}`,
                  file,
                })),
              ])
            }}
            disabled={isStreaming}
          />

          <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Atlas anything..."
              onKeyDown={handleComposerKeydown}
              rows={1}
              disabled={isStreaming}
              className="w-full resize-none border-0 bg-transparent text-base text-white placeholder:text-white/40 focus:outline-none disabled:opacity-50"
            />
            {composerError && <p className="mt-2 text-xs text-red-300">{composerError}</p>}
          </div>

          <Button
            type="submit"
            disabled={!prompt.trim() || isStreaming}
            className="h-12 w-12 rounded-2xl bg-emerald-300 p-0 text-slate-900 hover:bg-emerald-200"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <article
      className={cn(
        'w-full max-w-3xl rounded-3xl border px-5 py-5 shadow-2xl shadow-black/20 sm:px-6',
        isUser
          ? 'ml-auto border-white/5 bg-white text-slate-900'
          : 'border-white/10 bg-white/5 text-white'
      )}
    >
      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em]">
        <span className={cn('font-semibold', isUser ? 'text-slate-900/70' : 'text-white/60')}>
          {message.author}
        </span>
        <span className={cn(isUser ? 'text-slate-900/40' : 'text-white/30')}>·</span>
        <span className={cn(isUser ? 'text-slate-900/60' : 'text-white/50')}>
          {message.timestamp}
        </span>
      </div>

      <div
        className={cn(
          'mt-4 space-y-4 text-sm leading-relaxed',
          isUser ? 'text-slate-900/90' : 'text-white/80'
        )}
      >
        {message.blocks.map((block, index) => (
          <div key={`${message.id}-${index}`}>{JSON.stringify(block)}</div>
        ))}
      </div>

      {message.attachments && message.attachments.length > 0 && (
        <div className="mt-4 space-y-2">
          {message.attachments.map((attachment: any) => (
            <MessageAttachment key={attachment.id} attachment={attachment} />
          ))}
        </div>
      )}
    </article>
  )
}
