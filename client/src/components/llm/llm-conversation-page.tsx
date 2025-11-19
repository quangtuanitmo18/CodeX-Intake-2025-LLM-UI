'use client'

import { useEffect } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { useConversation } from '@/queries/useConversation'

import { LLMChatArea } from './llm-chat-area'
import { LLMSidebar } from './llm-sidebar'

interface LLMConversationPageProps {
  conversationId?: string
  projectId?: string
}

export default function LLMConversationPage({
  conversationId,
  projectId,
}: LLMConversationPageProps) {
  const params = useParams()
  const router = useRouter()

  const activeConversationId = conversationId || (params?.conversationId as string | undefined)
  const activeProjectId = projectId || (params?.projectId as string | undefined)
  const { data: conversationData } = useConversation(activeConversationId || null)
  const conversationProjectId = conversationData?.payload?.data?.projectId

  useEffect(() => {
    if (!activeConversationId) return
    if (conversationProjectId === undefined) return

    if (conversationProjectId && conversationProjectId !== activeProjectId) {
      router.replace(`/llm/projects/${conversationProjectId}/conversation/${activeConversationId}`)
    } else if (!conversationProjectId && activeProjectId) {
      router.replace(`/llm/${activeConversationId}`)
    }
  }, [activeConversationId, activeProjectId, conversationProjectId, router])

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b border-gray-800 px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-white">LLM Chat</h1>{' '}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <LLMSidebar activeConversationId={activeConversationId} activeProjectId={activeProjectId} />
        <div className="flex flex-1 flex-col border-l border-white/5">
          {activeConversationId ? (
            <LLMChatArea conversationId={activeConversationId} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-white/60">
              <h2 className="text-xl font-semibold text-white">Select a conversation</h2>
              <p className="max-w-md text-sm text-white/60">
                Choose a chat from the list or start a new one to begin messaging inside{' '}
                {activeProjectId ? 'this project' : 'your workspace'}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
