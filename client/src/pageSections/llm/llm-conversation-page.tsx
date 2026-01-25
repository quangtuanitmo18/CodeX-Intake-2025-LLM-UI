'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSelector } from '@/components/language-selector'
import { useViewport } from '@/hooks/useViewport'
import { cn } from '@/lib/utils'
import { useConversation } from '@/queries/useConversation'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Suspense } from 'react'

// Dynamically import heavy components to reduce initial bundle size
const LLMChatArea = dynamic(() => import('./llm-chat-area').then((mod) => mod.LLMChatArea), {
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  ),
})

const LLMSidebar = dynamic(() => import('./llm-sidebar').then((mod) => mod.LLMSidebar), {
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  ),
})

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

  const activeConversationId = useMemo(
    () => conversationId || (params?.conversationId as string | undefined),
    [conversationId, params?.conversationId]
  )
  const activeProjectId = useMemo(
    () => projectId || (params?.projectId as string | undefined),
    [projectId, params?.projectId]
  )
  const { data: conversationData } = useConversation(activeConversationId || null)
  const conversationProjectId = conversationData?.payload?.data?.projectId

  const isMobileOrTablet = useMemo(() => isMobile || isTablet, [isMobile, isTablet])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  // Close sidebar when conversation is selected on mobile/tablet
  useEffect(() => {
    if (activeConversationId && isMobileOrTablet) {
      setSidebarOpen(false)
    }
  }, [activeConversationId, isMobileOrTablet])

  // Handle Escape key to close sidebar
  useEffect(() => {
    if (!sidebarOpen || !isMobileOrTablet) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [sidebarOpen, isMobileOrTablet])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen && isMobileOrTablet) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen, isMobileOrTablet])

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
  const showSidebar = useMemo(
    () => (isMobileOrTablet ? sidebarOpen : true),
    [isMobileOrTablet, sidebarOpen]
  )

  return (
    <>
      {/* Skip to main content link */}
      <a
        href="#chat-area"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to chat area
      </a>
      <div className="flex h-screen flex-col">
        <header
          className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:px-6"
          role="banner"
        >
          <div className="flex items-center gap-2 md:gap-4">
            {/* Hamburger menu button for mobile/tablet */}
            {isMobileOrTablet && (
              <button
                onClick={toggleSidebar}
                className="flex h-10 w-10 items-center justify-center rounded-md text-foreground/80 transition-colors hover:bg-foreground/10 active:bg-foreground/20"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            )}
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Image src="/codex-logo.svg" alt="CodeX logo" width={30} height={30} />
              <h1 className="text-base font-semibold text-foreground md:text-lg">
                LLM UI - CodeX Intake 2025
              </h1>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </header>

        <div className="relative flex flex-1 overflow-hidden">
          {/* Sidebar - Drawer on mobile/tablet, persistent on desktop */}
          <aside
            className={cn(
              'fixed inset-y-0 left-0 z-50 flex h-full w-80 transform transition-transform duration-300 ease-in-out lg:relative lg:z-auto lg:translate-x-0',
              showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            )}
            aria-label="Navigation sidebar"
            aria-hidden={!showSidebar && isMobileOrTablet}
          >
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              }
            >
              <LLMSidebar
                activeConversationId={activeConversationId}
                activeProjectId={activeProjectId}
              />
            </Suspense>
          </aside>

          {/* Overlay backdrop for mobile/tablet */}
          {isMobileOrTablet && sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
              onClick={closeSidebar}
              aria-hidden="true"
            />
          )}

          {/* Chat area */}
          <main id="chat-area" className="flex flex-1 flex-col border-l border-border" role="main">
            {activeConversationId ? (
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                }
              >
                <LLMChatArea conversationId={activeConversationId} />
              </Suspense>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-muted-foreground md:px-6">
                <h2 className="text-lg font-semibold text-foreground md:text-xl">Select a chat</h2>
                <p className="max-w-md text-sm text-muted-foreground">
                  Choose a chat from the list or start a new one to begin messaging inside{' '}
                  {activeProjectId ? 'this project' : 'your workspace'}.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}
