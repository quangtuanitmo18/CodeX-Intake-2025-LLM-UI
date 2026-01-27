'use client'

import {
  ChevronDown,
  Folder,
  FolderPlus,
  Loader2,
  MessageSquarePlus,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ZodError } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { useTranslation } from '@/hooks/use-translation'
import { cn } from '@/lib/utils'
import { useConversations, useCreateConversation } from '@/queries/useConversation'
import {
  useCreateProjectConversation,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from '@/queries/useProject'
import { CreateConversationBody } from '@/schemaValidations/conversation.schema'

import { ConversationItem } from './conversation-item'
import { ProjectFormModal } from './project-form-modal'
import { UserProfileMenu } from './user-profile-menu'

interface LLMSidebarProps {
  activeConversationId?: string
  activeProjectId?: string
}

interface ProjectItemProps {
  project: any
  isExpanded: boolean
  onToggleExpand: () => void
  activeConversationId?: string
  activeProjectId?: string
}

function ProjectItem({
  project,
  isExpanded,
  onToggleExpand,
  activeConversationId,
  activeProjectId,
}: ProjectItemProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(project.name)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  const { data: projectConversationsData, isLoading: isLoadingProjectChats } = useConversations(
    {
      limit: 50,
      offset: 0,
      projectId: project.id,
    },
    { enabled: isExpanded }
  )

  const updateProjectMutation = useUpdateProject()
  const deleteProjectMutation = useDeleteProject()
  const createProjectChatMutation = useCreateProjectConversation()

  const projectConversations = projectConversationsData?.payload?.data || []
  const isActive = project.id === activeProjectId

  const resolveConversationPath = (conversation: { id: string; projectId?: string | null }) =>
    conversation.projectId
      ? `/llm/project/${conversation.projectId}/conversation/${conversation.id}`
      : `/llm/conversation/${conversation.id}`

  const handleSaveName = async () => {
    const trimmed = editName.trim()
    if (!trimmed) return
    try {
      await updateProjectMutation.mutateAsync({ id: project.id, name: trimmed })
      setIsEditing(false)
      setShowMenu(false)
      toast({
        title: t('llm.sidebar.projectRenamed'),
        description: trimmed,
      })
    } catch (error) {
      console.error('Failed to update project:', error)
      toast({
        title: t('llm.sidebar.renameFailed'),
        description: t('llm.sidebar.couldNotUpdateProjectName'),
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteProjectMutation.mutateAsync(project.id)
      setShowMenu(false)
      toast({
        title: t('llm.sidebar.projectDeleted'),
        description: t('llm.sidebar.allChatsMovedToGeneral'),
      })
      if (isActive) {
        router.push('/llm')
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
      toast({
        title: t('llm.sidebar.deleteFailed'),
        description: t('llm.sidebar.pleaseTryAgain'),
        variant: 'destructive',
      })
    }
  }

  const handleAddChat = async () => {
    try {
      const result = await createProjectChatMutation.mutateAsync({ projectId: project.id })
      const conversation = result.payload.data
      setShowMenu(false)
      router.push(resolveConversationPath(conversation))
      toast({
        title: t('llm.sidebar.chatCreated'),
        description: t('llm.sidebar.newChatAddedToProject'),
      })
    } catch (error) {
      console.error('Failed to create chat:', error)
      toast({
        title: t('llm.sidebar.createFailed'),
        description: t('llm.sidebar.couldNotCreateChat'),
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-1">
      <div
        className={cn(
          'group relative flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left text-sm text-foreground/80 transition hover:bg-accent',
          isActive && 'bg-accent text-foreground'
        )}
      >
        <button onClick={onToggleExpand} className="flex flex-1 items-center gap-2">
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-muted-foreground transition-transform',
              isExpanded ? 'rotate-0' : '-rotate-90'
            )}
          />
          <Folder className="h-4 w-4 text-muted-foreground" />
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName()
                if (e.key === 'Escape') {
                  setIsEditing(false)
                  setEditName(project.name)
                }
              }}
              onBlur={handleSaveName}
              className="h-6 border-border bg-background text-xs text-foreground"
              autoFocus
            />
          ) : (
            <span className="truncate font-medium">{project.name}</span>
          )}
        </button>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu((prev) => !prev)}
            className={cn(
              'h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100',
              showMenu && 'opacity-100'
            )}
          >
            <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 z-20 w-56 rounded-lg border border-border bg-popover p-2 shadow-xl">
                <button
                  onClick={() => {
                    setIsEditing(true)
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-foreground/80 hover:bg-accent"
                >
                  <Pencil className="h-4 w-4" />
                  {t('llm.sidebar.edit')}
                </button>
                <button
                  onClick={handleAddChat}
                  disabled={createProjectChatMutation.isPending}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-foreground/80 hover:bg-accent"
                >
                  {createProjectChatMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquarePlus className="h-4 w-4" />
                  )}
                  {t('llm.sidebar.addChat')}
                </button>
                <button
                  onClick={() => setIsConfirmingDelete((prev) => !prev)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-destructive hover:bg-destructive/10',
                    isConfirmingDelete && 'bg-destructive/10'
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                  {t('llm.sidebar.delete')}
                </button>

                {isConfirmingDelete && (
                  <div className="mt-2 space-y-2 rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-foreground/80">
                    <p className="text-xs text-destructive">
                      {t('llm.sidebar.deleteProjectWarning')}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 text-xs"
                        disabled={deleteProjectMutation.isPending}
                        onClick={handleDelete}
                      >
                        {deleteProjectMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t('llm.sidebar.delete')
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="flex-1 text-xs"
                        onClick={() => setIsConfirmingDelete(false)}
                      >
                        {t('llm.sidebar.cancel')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="ml-6 space-y-2 border-l border-border pl-2">
          {isLoadingProjectChats ? (
            <div className="flex items-center justify-center py-2 text-xs text-muted-foreground">
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
              {t('llm.sidebar.loading')}
            </div>
          ) : projectConversations.length === 0 ? (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              {t('llm.sidebar.noChatsYet')}
            </div>
          ) : (
            projectConversations.map((conversation: any) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                onClick={() => router.push(resolveConversationPath(conversation))}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export function LLMSidebar({ activeConversationId, activeProjectId }: LLMSidebarProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [projectsOpen, setProjectsOpen] = useState(true)
  const [chatsOpen, setChatsOpen] = useState(true)
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [limit] = useState(20)
  const [offset, setOffset] = useState(0)

  // Debounce search input (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setOffset(0) // Reset offset when search changes
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // Auto-expand active project
  useEffect(() => {
    if (activeProjectId) {
      setExpandedProjects((prev) => new Set(prev).add(activeProjectId))
    }
  }, [activeProjectId])

  const projectQueryParams = useMemo(() => ({ includeCounts: true }), [])
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects(projectQueryParams)

  // Only fetch standalone conversations (projectId = null)
  // Use debouncedSearch for API calls to avoid too many requests
  const { data: conversationsData, isLoading: isLoadingConversations } = useConversations({
    limit,
    offset,
    search: debouncedSearch,
    projectId: 'standalone', // Filter for standalone chats (projectId is null)
  })
  const createConversationMutation = useCreateConversation()

  const projects = projectsData?.payload?.data || []
  const conversations = conversationsData?.payload?.data || []

  const handleProjectCreated = (projectId: string) => {
    setExpandedProjects((prev) => new Set(prev).add(projectId))
    router.push(`/llm/project/${projectId}`)
  }

  const toggleProjectExpand = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) {
        next.delete(projectId)
      } else {
        next.add(projectId)
      }
      return next
    })
  }

  const resolveConversationPath = (conversation: { id: string; projectId?: string | null }) =>
    conversation.projectId
      ? `/llm/project/${conversation.projectId}/conversation/${conversation.id}`
      : `/llm/conversation/${conversation.id}`

  const handleNewChat = async () => {
    try {
      CreateConversationBody.parse({})
      const result = await createConversationMutation.mutateAsync({})
      const conversation = result.payload.data
      router.push(resolveConversationPath(conversation))
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
      className="flex h-full w-full flex-col border-r border-border bg-card/50 backdrop-blur-sm md:w-80"
      aria-label="Navigation sidebar"
    >
      <div className="border-b border-border p-4">
        <Button
          onClick={handleNewChat}
          disabled={createConversationMutation.isPending}
          className="w-full gap-2 bg-primary/20 text-primary hover:bg-primary/30"
          aria-label="Create new chat"
        >
          <MessageSquarePlus className="h-4 w-4" />
          {t('llm.sidebar.newChat')}
        </Button>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto">
        {/* Projects Section */}
        <section className="border-b border-border/50 p-4">
          <header
            className="flex cursor-pointer items-center justify-between text-sm font-semibold text-foreground"
            onClick={() => setProjectsOpen((prev) => !prev)}
          >
            <span>{t('llm.sidebar.projects')}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsProjectModalOpen(true)
                  setProjectsOpen(true)
                }}
                className="rounded-full border border-border p-1 text-muted-foreground transition hover:bg-accent"
              >
                <FolderPlus className="h-4 w-4" />
              </button>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  projectsOpen ? 'rotate-0' : '-rotate-90'
                )}
              />
            </div>
          </header>

          {projectsOpen && (
            <div className="mt-3 space-y-1">
              {isLoadingProjects ? (
                <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  {t('llm.sidebar.loadingProjects')}
                </div>
              ) : projects.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  {t('llm.sidebar.noProjectsYet')}
                </div>
              ) : (
                <div className="space-y-1">
                  {projects.map((project: any) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isExpanded={expandedProjects.has(project.id)}
                      onToggleExpand={() => toggleProjectExpand(project.id)}
                      activeConversationId={activeConversationId}
                      activeProjectId={activeProjectId}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Chats Section - Only standalone chats */}
        <section className="p-4">
          <header
            className="flex cursor-pointer items-center justify-between text-sm font-semibold text-foreground"
            onClick={() => setChatsOpen((prev) => !prev)}
          >
            <span>{t('llm.sidebar.chats')}</span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                chatsOpen ? 'rotate-0' : '-rotate-90'
              )}
            />
          </header>

          {chatsOpen && (
            <div className="mt-3 space-y-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder={t('llm.sidebar.searchChats')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-border bg-background pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {isLoadingConversations ? (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('llm.sidebar.loadingChats')}
                </div>
              ) : conversations.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  {search
                    ? t('llm.sidebar.noConversationsFound')
                    : t('llm.sidebar.noStandaloneChatsYet')}
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation: any) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isActive={conversation.id === activeConversationId}
                      onClick={() => router.push(resolveConversationPath(conversation))}
                    />
                  ))}

                  {conversations.length >= limit && (
                    <Button
                      onClick={handleLoadMore}
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground hover:text-foreground"
                    >
                      {t('llm.sidebar.loadMore')}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <div className="border-t border-border p-2">
        <UserProfileMenu dropdownPlacement="top" />
      </div>

      <ProjectFormModal
        open={isProjectModalOpen}
        onOpenChange={setIsProjectModalOpen}
        onSuccess={handleProjectCreated}
      />
    </aside>
  )
}
