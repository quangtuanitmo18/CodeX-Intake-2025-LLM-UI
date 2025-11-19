'use client'

import { useParams } from 'next/navigation'

import { ConversationSidebar } from './conversation-sidebar'
import { LLMChatArea } from './llm-chat-area'
import { UserProfileMenu } from './user-profile-menu'

interface LLMConversationPageProps {
  conversationId?: string
}

export default function LLMConversationPage({ conversationId }: LLMConversationPageProps) {
  const params = useParams()
  const activeConversationId = conversationId || (params?.conversationId as string)

  return (
    <div className="flex h-screen flex-col">
      {/* Header with User Profile */}
      <header className="flex h-14 items-center justify-between border-b border-gray-800 px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">LLM Chat</h1>
        </div>
        <UserProfileMenu />
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <ConversationSidebar activeConversationId={activeConversationId} />
        <div className="flex-1">
          <LLMChatArea conversationId={activeConversationId} />
        </div>
      </div>
    </div>
  )
}
