'use client'

import { useParams } from 'next/navigation'

import { ConversationSidebar } from './conversation-sidebar'
import { LLMChatArea } from './llm-chat-area'

interface LLMConversationPageProps {
  conversationId?: string
}

export default function LLMConversationPage({ conversationId }: LLMConversationPageProps) {
  const params = useParams()
  const activeConversationId = conversationId || (params?.conversationId as string)

  return (
    <div className="flex h-screen">
      <ConversationSidebar activeConversationId={activeConversationId} />
      <div className="flex-1">
        <LLMChatArea conversationId={activeConversationId} />
      </div>
    </div>
  )
}
