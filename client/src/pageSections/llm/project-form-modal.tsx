'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateProject } from '@/queries/useProject'

interface ProjectFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (projectId: string) => void
}

export function ProjectFormModal({ open, onOpenChange, onSuccess }: ProjectFormModalProps) {
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const router = useRouter()
  const createProjectMutation = useCreateProject()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = projectName.trim()
    if (!trimmed) return

    try {
      const result = await createProjectMutation.mutateAsync({
        name: trimmed,
        description: description.trim() || undefined,
      })
      const newProjectId = result.payload.data.id
      setProjectName('')
      setDescription('')
      onOpenChange(false)
      if (onSuccess) {
        onSuccess(newProjectId)
      } else {
        router.push(`/llm/project/${newProjectId}`)
      }
    } catch (error) {
      console.error('Failed to create project', error)
    }
  }

  const handleClose = () => {
    setProjectName('')
    setDescription('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={handleClose} className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Create a new project to organize your chats</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
              autoFocus
              required
              minLength={2}
              maxLength={100}
            />
            <p className="text-xs text-white/60">2-100 characters</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description (Optional)</Label>
            <Input
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
              maxLength={500}
            />
            <p className="text-xs text-white/60">Maximum 500 characters</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createProjectMutation.isPending}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProjectMutation.isPending || !projectName.trim()}
              className="bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
            >
              {createProjectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
