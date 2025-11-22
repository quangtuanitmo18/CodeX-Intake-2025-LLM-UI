'use client'

import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { useViewport } from '@/hooks/useViewport'
import { cn } from '@/lib/utils'
import { useConversation } from '@/queries/useConversation'

import Image from 'next/image'
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
  const { isMobile, isTablet } = useViewport()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeConversationId = conversationId || (params?.conversationId as string | undefined)
  const activeProjectId = projectId || (params?.projectId as string | undefined)
  const { data: conversationData } = useConversation(activeConversationId || null)
  const conversationProjectId = conversationData?.payload?.data?.projectId

  // Close sidebar when conversation is selected on mobile/tablet
  useEffect(() => {
    if (activeConversationId && (isMobile || isTablet)) {
      setSidebarOpen(false)
    }
  }, [activeConversationId, isMobile, isTablet])

  // Handle Escape key to close sidebar
  useEffect(() => {
    if (!sidebarOpen || (!isMobile && !isTablet)) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [sidebarOpen, isMobile, isTablet])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && (isMobile || isTablet)) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen, isMobile, isTablet])

  useEffect(() => {
    if (!activeConversationId) return
    if (conversationProjectId === undefined) return

    if (conversationProjectId && conversationProjectId !== activeProjectId) {
      router.replace(`/llm/project/${conversationProjectId}/conversation/${activeConversationId}`)
    } else if (!conversationProjectId && activeProjectId) {
      router.replace(`/llm/conversation/${activeConversationId}`)
    }
  }, [activeConversationId, activeProjectId, conversationProjectId, router])

  // Show sidebar by default on desktop, hide on mobile/tablet
  const showSidebar = isMobile || isTablet ? sidebarOpen : true

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b border-gray-800 px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          {/* Hamburger menu button for mobile/tablet */}
          {(isMobile || isTablet) && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 active:bg-white/20"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
          <button className="flex items-center gap-2" onClick={() => router.push('/')}>
            <Image src="/codex-logo.svg" alt="CodeX logo" width={30} height={30} />
            <h1 className="text-base font-semibold text-white md:text-lg">
              LLM UI - CodeX Intake 2025
            </h1>
          </button>
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        {/* Sidebar - Drawer on mobile/tablet, persistent on desktop */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex h-full w-80 transform transition-transform duration-300 ease-in-out lg:relative lg:z-auto lg:translate-x-0',
            showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <LLMSidebar
            activeConversationId={activeConversationId}
            activeProjectId={activeProjectId}
          />
        </div>

        {/* Overlay backdrop for mobile/tablet */}
        {(isMobile || isTablet) && sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Chat area */}
        <div className="flex flex-1 flex-col border-l border-white/5">
          {activeConversationId ? (
            <LLMChatArea conversationId={activeConversationId} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-white/60 md:px-6">
              <h2 className="text-lg font-semibold text-white md:text-xl">Select a chat</h2>
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
