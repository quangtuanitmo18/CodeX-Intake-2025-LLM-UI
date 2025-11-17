'use client'

import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ZodError } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useDeleteConversation, useUpdateConversation } from '@/queries/useConversation'
import { UpdateConversationBody } from '@/schemaValidations/conversation.schema'

interface ConversationItemProps {
  conversation: {
    id: string
    title: string | null
    updatedAt: string
    createdAt: string
  }
  isActive: boolean
  onClick: () => void
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(conversation.title || '')
  const [showMenu, setShowMenu] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const updateMutation = useUpdateConversation()
  const deleteMutation = useDeleteConversation()

  const handleSaveTitle = async () => {
    const trimmedTitle = editTitle.trim()
    if (!trimmedTitle) return

    try {
      // Validate with Zod
      UpdateConversationBody.parse({ title: trimmedTitle })
      setValidationError(null)

      await updateMutation.mutateAsync({ id: conversation.id, title: trimmedTitle })
      setIsEditing(false)
    } catch (error) {
      if (error instanceof ZodError) {
        setValidationError(error.errors[0]?.message || 'Invalid title')
      } else {
        console.error('Failed to update title:', error)
        setValidationError('Failed to update title')
      }
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this conversation?')) return
    try {
      await deleteMutation.mutateAsync(conversation.id)
    } catch (error) {
      console.error('Failed to delete conversation:', error)
    }
  }

  const displayTitle = conversation.title || 'New Conversation'
  const timestamp = new Date(conversation.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div
      className={cn(
        'group relative rounded-lg border border-transparent p-3 transition-colors hover:border-white/10 hover:bg-white/5',
        isActive && 'border-emerald-500/30 bg-emerald-500/10'
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 cursor-pointer" onClick={onClick}>
          {isEditing ? (
            <div>
              <Input
                type="text"
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value)
                  setValidationError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle()
                  if (e.key === 'Escape') {
                    setIsEditing(false)
                    setValidationError(null)
                  }
                }}
                onBlur={handleSaveTitle}
                className={cn(
                  'h-7 border-white/10 bg-white/5 text-sm text-white',
                  validationError && 'border-red-500/50'
                )}
                autoFocus
              />
              {validationError && <p className="mt-1 text-xs text-red-400">{validationError}</p>}
            </div>
          ) : (
            <>
              <p className="truncate text-sm font-medium text-white">{displayTitle}</p>
              <p className="mt-1 text-xs text-white/60">{timestamp}</p>
            </>
          )}
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            className={cn(
              'h-7 w-7 p-0 opacity-0 transition-opacity group-hover:opacity-100',
              showMenu && 'opacity-100'
            )}
          >
            <MoreVertical className="h-4 w-4 text-white/60" />
          </Button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 z-20 w-40 rounded-lg border border-white/10 bg-[#040714] p-1 shadow-xl">
                <button
                  onClick={() => {
                    setIsEditing(true)
                    setShowMenu(false)
                  }}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Title
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    handleDelete()
                  }}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
