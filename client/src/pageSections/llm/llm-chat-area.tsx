'use client'

import { useQueryClient } from '@tanstack/react-query'
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
import { MessageBubble, type ChatMessage } from './message-bubble'

interface LLMChatAreaProps {
  conversationId?: string
}

export function LLMChatArea({ conversationId }: LLMChatAreaProps) {
  const [prompt, setPrompt] = useState('')
  const [attachments, setAttachments] = useState<Array<{ id: string; file: File }>>([])
  const [composerError, setComposerError] = useState<string | null>(null)
  const [activeAssistantMessage, setActiveAssistantMessage] = useState<ChatMessage | null>(null)
  const [thinkingSeconds, setThinkingSeconds] = useState(0)
  const [savedThinkingSeconds, setSavedThinkingSeconds] = useState(0)

  const transcriptRef = useRef<HTMLDivElement | null>(null)
  const isSubmittingRef = useRef(false)
  const thinkingStartTimeRef = useRef<number | null>(null)

  const queryClient = useQueryClient()
  const { data: conversationData } = useConversation(conversationId || null)
  const { data: messagesData } = useConversationMessages(conversationId || null)
  const createMessageMutation = useCreateMessage()
  const uploadAttachmentMutation = useUploadAttachment()

  const { answer, reasoning, status, error: streamError, start, reset } = useLLMStream()
  const isStreaming = status === 'thinking' || status === 'streaming'

  const conversation = conversationData?.payload?.data
  const historicalMessages = useMemo(
    () => messagesData?.payload?.data ?? [],
    [messagesData?.payload?.data]
  )

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (!transcriptRef.current) {
      return
    }

    const el = transcriptRef.current

    const rafId = requestAnimationFrame(() => {
      const newScrollTop = el.scrollHeight
      el.scrollTop = newScrollTop

      // Verify after scroll
      setTimeout(() => {}, 100)
    })

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [historicalMessages.length, activeAssistantMessage?.content, conversationId])

  // Track thinking time
  useEffect(() => {
    if (status === 'thinking' && reasoning.length > 0) {
      // Start tracking when thinking begins
      if (!thinkingStartTimeRef.current) {
        thinkingStartTimeRef.current = Date.now()
        setThinkingSeconds(0)
        setSavedThinkingSeconds(0)
      }

      // Update seconds every second
      const interval = setInterval(() => {
        if (thinkingStartTimeRef.current) {
          const elapsed = Math.floor((Date.now() - thinkingStartTimeRef.current) / 1000)
          setThinkingSeconds(elapsed)
        }
      }, 1000)

      return () => clearInterval(interval)
    } else if (status === 'streaming' && thinkingStartTimeRef.current) {
      // Thinking finished, save final time
      const elapsed = Math.floor((Date.now() - thinkingStartTimeRef.current) / 1000)
      setThinkingSeconds(elapsed)
      setSavedThinkingSeconds(elapsed)
      thinkingStartTimeRef.current = null
    } else if (status === 'idle' || status === 'complete') {
      // Reset when starting new message or stream completes
      thinkingStartTimeRef.current = null
      setThinkingSeconds(0)
      if (status === 'idle') {
        setSavedThinkingSeconds(0)
      }
    }
  }, [status, reasoning])

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
      <div className="flex h-full items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-white/60 md:text-lg">
            Select a chat or create a new chat to begin
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col px-4 py-4 md:px-6 md:py-8">
      {/* Header */}
      <header className="mb-4 flex flex-col gap-2 border-b border-white/10 pb-3 md:mb-6 md:flex-row md:items-center md:justify-between md:pb-4">
        <div>
          <h1 className="text-lg font-semibold text-white md:text-2xl">
            {conversation?.title || 'New Chat'}
          </h1>
          <p className="mt-1 text-xs text-white/60 md:text-sm">
            {conversation?.model || 'openai/gpt-5-mini'}
          </p>
        </div>
        {/* {conversationId && (
          <ExportMenu
            conversationId={conversationId}
            conversationTitle={conversation?.title || undefined}
          />
        )} */}
      </header>

      {/* Transcript */}
      <div ref={transcriptRef} className="custom-scrollbar flex-1 overflow-y-auto pb-4 md:pb-6">
        <div className="pad mx-auto flex w-full flex-col gap-4 pl-1 md:max-w-[600px] md:gap-[30px] md:py-[14px] md:pl-2 lg:max-w-[700px] xl:max-w-[800px] 2xl:max-w-[900px]">
          {allMessages.length === 0 && (
            <div className="flex h-full items-center justify-center text-[#777777]">
              <p className="text-sm">Start a conversation...</p>
            </div>
          )}

          {allMessages.map((message) => {
            // Check if this is the active streaming message
            const isActiveStreaming = message.id === 'assistant-live' && isStreaming
            const messageThinkingSeconds = isActiveStreaming
              ? status === 'thinking'
                ? thinkingSeconds
                : savedThinkingSeconds
              : undefined

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isStreaming={isActiveStreaming}
                isThinking={status === 'thinking'}
                thinkingSeconds={messageThinkingSeconds}
                savedThinkingSeconds={savedThinkingSeconds}
              />
            )
          })}

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
