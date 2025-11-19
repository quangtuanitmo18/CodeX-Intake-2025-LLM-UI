'use client'

import { useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ZodError } from 'zod'

import {
  useConversation,
  useConversationMessages,
  useCreateMessage,
  useUploadAttachment,
} from '@/queries/useConversation'
import { useLLMStream } from '@/queries/useLLMStream'
import { CreateMessageBody } from '@/schemaValidations/conversation.schema'

import { ChatComposer } from './chat-composer'
import { ExportMenu } from './export-menu'
import { MessageBubble, type ChatMessage } from './message-bubble'

interface LLMChatAreaProps {
  conversationId?: string
}

export function LLMChatArea({ conversationId }: LLMChatAreaProps) {
  const [prompt, setPrompt] = useState('')
  const [attachments, setAttachments] = useState<Array<{ id: string; file: File }>>([])
  const [composerError, setComposerError] = useState<string | null>(null)
  const [activeAssistantMessage, setActiveAssistantMessage] = useState<ChatMessage | null>(null)
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(true)

  const transcriptRef = useRef<HTMLDivElement | null>(null)
  const isSubmittingRef = useRef(false)

  const queryClient = useQueryClient()
  const { data: conversationData } = useConversation(conversationId || null)
  const { data: messagesData } = useConversationMessages(conversationId || null)
  const createMessageMutation = useCreateMessage()
  const uploadAttachmentMutation = useUploadAttachment()

  const { answer, reasoning, status, error: streamError, start, reset } = useLLMStream()
  const isStreaming = status === 'thinking' || status === 'streaming'

  const conversation = conversationData?.payload?.data
  const historicalMessages = messagesData?.payload?.data || []

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    console.log('🔍 Auto-scroll effect triggered', {
      hasRef: !!transcriptRef.current,
      messagesLength: historicalMessages.length,
      activeMessageContent: activeAssistantMessage?.content?.substring(0, 50),
      conversationId,
    })

    if (!transcriptRef.current) {
      console.warn('⚠️ transcriptRef.current is null')
      return
    }

    const el = transcriptRef.current

    console.log('📏 Scroll dimensions BEFORE scroll:', {
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      shouldScroll: el.scrollHeight > el.clientHeight,
    })

    const rafId = requestAnimationFrame(() => {
      const newScrollTop = el.scrollHeight
      console.log('🎯 Setting scrollTop to:', newScrollTop)
      el.scrollTop = newScrollTop

      // Verify after scroll
      setTimeout(() => {
        console.log('✅ Scroll dimensions AFTER scroll:', {
          scrollTop: el.scrollTop,
          scrollHeight: el.scrollHeight,
          atBottom: Math.abs(el.scrollTop + el.clientHeight - el.scrollHeight) < 5,
        })
      }, 100)
    })

    return () => {
      console.log('🧹 Cleaning up scroll effect')
      cancelAnimationFrame(rafId)
    }
  }, [historicalMessages.length, activeAssistantMessage?.content, conversationId])
  // Handle streaming assistant message - optimized, no parsing
  useEffect(() => {
    if (status === 'idle') {
      setActiveAssistantMessage(null)
      return
    }

    setActiveAssistantMessage({
      id: 'assistant-live',
      role: 'assistant',
      author: 'Atlas · LLM',
      timestamp:
        status === 'complete'
          ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Live',
      content: answer || '',
      blocks: [],
      reasoning: reasoning.join('\n'),
    })
  }, [status, answer, reasoning])

  // When streaming completes, add assistant message to cache (optimistic update)
  useEffect(() => {
    if (status === 'complete' && conversationId && answer) {
      console.log('✅ Stream complete, adding assistant message to cache')

      const assistantMessage = {
        id: `temp-assistant-${Date.now()}`,
        conversationId,
        role: 'assistant',
        content: answer,
        reasoning: reasoning.length > 0 ? reasoning.join('\n') : null,
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      queryClient.setQueryData(['messages', conversationId, undefined], (old: any) => {
        console.log('📊 Current message cache:', old)
        if (!old) {
          console.warn('⚠️ Cache is empty, creating new cache structure')
          return {
            payload: {
              data: [assistantMessage],
            },
          }
        }

        const newData = {
          ...old,
          payload: {
            ...old.payload,
            data: [...(old.payload?.data || []), assistantMessage],
          },
        }
        console.log('📊 Updated message cache:', newData)
        return newData
      })

      reset()
    }
  }, [status, conversationId, answer, reasoning, queryClient, reset])

  const allMessages = useMemo<ChatMessage[]>(() => {
    const historical = historicalMessages.map((msg: any) => ({
      id: msg.id,
      role: msg.role,
      author: msg.role === 'user' ? 'You' : 'Atlas · LLM',
      timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      content: msg.content,
      blocks: [],
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

    if (isSubmittingRef.current || isStreaming) {
      console.log('Prevented double submission', {
        isSubmitting: isSubmittingRef.current,
        isStreaming,
      })
      return
    }

    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) return

    if (!conversationId) {
      setComposerError('No active conversation. Please create a new chat.')
      return
    }

    console.log('📝 Submitting message:', trimmedPrompt)
    isSubmittingRef.current = true

    try {
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

      CreateMessageBody.parse({
        content: trimmedPrompt,
        attachments: uploadedAttachments,
      })
      setComposerError(null)

      // Optimistically add user message to cache immediately
      const tempUserMessageId = `temp-user-${Date.now()}`
      const tempUserMessage = {
        id: tempUserMessageId,
        conversationId,
        role: 'user' as const,
        content: trimmedPrompt,
        attachments: uploadedAttachments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      queryClient.setQueryData(['messages', conversationId, undefined], (old: any) => {
        if (!old) {
          return {
            payload: {
              data: [tempUserMessage],
            },
          }
        }

        return {
          ...old,
          payload: {
            ...old.payload,
            data: [...(old.payload?.data || []), tempUserMessage],
          },
        }
      })

      // Clear input immediately for better UX
      setPrompt('')
      setAttachments([])

      // Send to server and replace temp message with real message
      const response = await createMessageMutation.mutateAsync({
        conversationId,
        content: trimmedPrompt,
        attachments: uploadedAttachments,
      })

      // Replace temp message with real message from server
      if (response?.payload?.data) {
        queryClient.setQueryData(['messages', conversationId, undefined], (old: any) => {
          if (!old) return old

          const messages = old.payload?.data || []
          const filteredMessages = messages.filter((m: any) => m.id !== tempUserMessageId)

          return {
            ...old,
            payload: {
              ...old.payload,
              data: [...filteredMessages, response.payload.data],
            },
          }
        })
      }

      start(trimmedPrompt, conversationId)
    } catch (error) {
      if (error instanceof ZodError) {
        setComposerError(error.errors[0]?.message || 'Invalid message')
      } else {
        console.error('Failed to send message:', error)
        setComposerError('Failed to send message. Please try again.')
      }
    } finally {
      setTimeout(() => {
        isSubmittingRef.current = false
      }, 500)
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
    <div className="flex h-full flex-col px-6 py-8">
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
      <div ref={transcriptRef} className="custom-scrollbar flex-1 overflow-y-auto pb-6">
        <div className="pad mx-auto flex max-w-[600px] flex-col gap-[30px] pl-2">
          {allMessages.length === 0 && (
            <div className="flex h-full items-center justify-center text-[#777777]">
              <p className="text-sm">Start a conversation...</p>
            </div>
          )}

          {allMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Thinking Indicator */}
          {status === 'thinking' && reasoning.length > 0 && (
            <div className="flex w-full flex-col gap-[10px]">
              <button
                onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
                className="flex items-center gap-[5px] py-[1px] text-left"
              >
                <div className="flex h-[14px] w-[14px] items-center justify-center">
                  <div className="flex gap-0.5">
                    <div
                      className="h-1 w-1 animate-bounce rounded-full bg-[#777777]"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="h-1 w-1 animate-bounce rounded-full bg-[#777777]"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="h-1 w-1 animate-bounce rounded-full bg-[#777777]"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
                <span className="text-[14px] leading-[22px] text-[#777777]">
                  Thought for {reasoning.length} seconds
                </span>
                {isReasoningExpanded ? (
                  <ChevronUp className="h-[18px] w-[18px] text-[#777777]" />
                ) : (
                  <ChevronDown className="h-[18px] w-[18px] text-[#777777]" />
                )}
              </button>

              {isReasoningExpanded && (
                <div className="text-[14px] leading-[22px] text-[#777777]">
                  {reasoning.join('\n')}
                </div>
              )}
            </div>
          )}

          {status === 'error' && streamError && (
            <div className="rounded-[15px] bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {streamError}
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <ChatComposer
        prompt={prompt}
        setPrompt={setPrompt}
        attachments={attachments}
        setAttachments={setAttachments}
        composerError={composerError}
        isStreaming={isStreaming}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
