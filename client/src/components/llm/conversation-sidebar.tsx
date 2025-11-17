'use client'

import { MessageSquarePlus, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ZodError } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useConversations, useCreateConversation } from '@/queries/useConversation'
import { CreateConversationBody } from '@/schemaValidations/conversation.schema'

import { ConversationItem } from './conversation-item'

interface ConversationSidebarProps {
  activeConversationId?: string
  className?: string
}

export function ConversationSidebar({ activeConversationId, className }: ConversationSidebarProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [limit] = useState(20)
  const [offset, setOffset] = useState(0)

  const { data: conversationsData, isLoading } = useConversations({ limit, offset, search })
  const createConversationMutation = useCreateConversation()

  const conversations = conversationsData?.payload?.data || []

  const handleNewChat = async () => {
    try {
      // Validate with Zod (empty body is valid)
      CreateConversationBody.parse({})

      const result = await createConversationMutation.mutateAsync({})
      router.push(`/llm/${result.payload.data.id}`)
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Validation error:', error.errors)
      } else {
        console.error('Failed to create conversation:', error)
      }
    }
  }

  const handleLoadMore = () => {
    setOffset((prev) => prev + limit)
  }

  return (
    <aside
      className={cn(
        'flex h-full w-80 flex-col border-r border-white/10 bg-white/5 backdrop-blur-sm',
        className
      )}
    >
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <Button
          onClick={handleNewChat}
          disabled={createConversationMutation.isPending}
          className="w-full gap-2 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-white/40"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-white/60">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-white/60">
            {search ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation: any) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                onClick={() => router.push(`/llm/${conversation.id}`)}
              />
            ))}

            {conversations.length >= limit && (
              <Button
                onClick={handleLoadMore}
                variant="ghost"
                className="w-full text-white/60 hover:text-white"
                size="sm"
              >
                Load More
              </Button>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
