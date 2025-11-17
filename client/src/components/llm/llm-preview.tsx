'use client'

import { Activity, ChevronDown, ChevronUp, Loader2, Paperclip, Send, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { parseMarkdownToBlocks, type InlineNode, type MarkdownBlock } from '@/lib/markdown'
import { cn } from '@/lib/utils'
import { useLLMStream } from '@/queries/useLLMStream'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  author: string
  timestamp: string
  highlight?: string
  status?: 'streaming' | 'complete'
  blocks: MarkdownBlock[]
}

type AttachmentItem = {
  id: string
  file: File
}

const STATIC_MESSAGES: ChatMessage[] = [
  {
    id: 'assistant-welcome',
    role: 'assistant',
    author: 'Atlas · LLM',
    timestamp: '09:32',
    highlight: 'System memo',
    status: 'complete',
    blocks: parseMarkdownToBlocks(
      [
        'Connected to the Codex reference environment. Streaming, reasoning, and Markdown AST rendering are prewired for this preview.',
        '',
        '- Streaming budget locked to <200 ms per token',
        '- Thinking drawer paired with expandable reasoning',
        '- Reply composer supports auto-resize + shortcut hints',
      ].join('\n')
    ),
  },
  {
    id: 'user-brief',
    role: 'user',
    author: 'You',
    timestamp: '09:34',
    blocks: [
      ...parseMarkdownToBlocks(
        'Generate the component structure for the “LLM UI” screen so our candidates can compare their work to the Zeplin reference without guessing spacing or states.'
      ),
      {
        type: 'callout',
        title: 'Constraints',
        body: 'No third-party UI kits, preserve left/right alignment, and showcase the “Thinking” channel before the final answer lands.',
      },
    ],
  },
]

const REASONING_STEPS = [
  'Review Zeplin artboard Rmo9weK to mirror spacing tokens (32 px outer, 24 px inner).',
  'Surface a neutral hero panel that frames the transcript + composer stack.',
  'Keep reasoning copy terse so it can collapse without shifting layout.',
]

export function LLMPreview() {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>(STATIC_MESSAGES)
  const [activeAssistantMessage, setActiveAssistantMessage] = useState<ChatMessage | null>(null)
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(true)
  const [attachments, setAttachments] = useState<AttachmentItem[]>([])
  const [composerError, setComposerError] = useState<string | null>(null)
  const [showComposerGradient, setShowComposerGradient] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const transcriptRef = useRef<HTMLDivElement | null>(null)

  const { answer, reasoning, status, error: streamError, start, reset } = useLLMStream()
  const isStreaming = status === 'thinking' || status === 'streaming'

  useEffect(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
  }, [prompt])

  useEffect(() => {
    if (!transcriptRef.current) return
    const el = transcriptRef.current
    el.scrollTo({
      top: el.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, activeAssistantMessage])

  useEffect(() => {
    if (status === 'idle') {
      setActiveAssistantMessage(null)
      return
    }

    const parsedBlocks = parseMarkdownToBlocks(answer || '')
    setActiveAssistantMessage({
      id: 'assistant-live',
      role: 'assistant',
      author: 'Atlas · LLM',
      timestamp: status === 'complete' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live',
      highlight: 'LLM response',
      status: status === 'complete' ? 'complete' : 'streaming',
      blocks: parsedBlocks,
    })
  }, [status, answer])

  useEffect(() => {
    if (status !== 'complete' || !activeAssistantMessage) return
    setMessages((prev) => [...prev, activeAssistantMessage])
    reset()
  }, [status, activeAssistantMessage, reset])

  const conversation = useMemo<ChatMessage[]>(
    () => (activeAssistantMessage ? [...messages, activeAssistantMessage] : messages),
    [messages, activeAssistantMessage]
  )

  useEffect(() => {
    const el = transcriptRef.current
    if (!el) return
    const handleScroll = () => {
      const shouldShow = el.scrollTop + el.clientHeight < el.scrollHeight - 8
      setShowComposerGradient(shouldShow)
    }
    handleScroll()
    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [conversation.length])

  const progress = useMemo(() => {
    if (status === 'idle') return 0
    if (status === 'complete') return 100
    const reasoningBoost = Math.min(40, reasoning.length * 12)
    const wordCount = answer.trim() ? answer.trim().split(/\s+/).filter(Boolean).length : 0
    const answerBoost = Math.min(60, wordCount * 2)
    return Math.min(95, reasoningBoost + answerBoost)
  }, [status, reasoning.length, answer])

  const showThinking = status !== 'idle' && status !== 'error'
  const thinkingSteps = reasoning.length > 0 ? reasoning : REASONING_STEPS

  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    const trimmedPrompt = prompt.trim()
    if (trimmedPrompt.length < 5) {
      setComposerError('Prompt must be at least 5 characters.')
      return
    }

    setComposerError(null)
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      author: 'You',
      timestamp,
      highlight: undefined,
      status: 'complete',
      blocks: [
        ...parseMarkdownToBlocks(trimmedPrompt),
        ...(attachments.length
          ? [
              {
                type: 'callout',
                title: 'Attachments',
                body: attachments.map((item) => item.file.name).join(', '),
              } as MarkdownBlock,
            ]
          : []),
      ],
    }

    setMessages((prev) => [...prev, userMessage])
    start(trimmedPrompt)
    setPrompt('')
    setAttachments([])
    setIsReasoningExpanded(true)
  }

  const handleComposerKeydown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  return (
    <section className="relative isolate overflow-hidden rounded-[32px] border border-white/10 bg-[#040714] px-6 py-8 text-white shadow-[0px_80px_160px_rgba(2,4,15,0.65)]">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute inset-y-0 left-1/2 w-96 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#2dd4bf33_0%,transparent_65%)] blur-3xl" />
        <div className="absolute inset-y-12 right-12 w-64 rounded-full bg-[radial-gradient(circle,#38bdf833_0%,transparent_60%)] blur-3xl" />
      </div>
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.35em] text-emerald-200/80">
            <span>LLM UI</span>
            <span className="text-white/40">·</span>
            <span>Codex Reference Build</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Zeplin-accurate component for the “LLM UI” screen
            </h1>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
              Spec · Rmo9weK
            </span>
          </div>
          <p className="max-w-3xl text-base text-white/70 sm:text-lg">
            Hero framing, transcript surface, thinking indicator, and reply composer mirror the
            Zeplin artboard so contributors can extend streaming + reasoning features without guess
            work.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              Atlas-2.1 · Streaming
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Activity className="h-4 w-4 text-sky-300" />
              Markdown AST renderer
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Loader2 className="h-4 w-4 text-amber-300" />
              Thinking channel
            </span>
          </div>
        </header>

        <div className="flex flex-col gap-6 rounded-[28px] border border-white/10 bg-white/5/0 bg-gradient-to-br from-white/5 via-white/2 to-transparent backdrop-blur-xl">
          <div className="border-b border-white/5 px-6 py-5">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-base font-medium text-white">Transcript</p>
              <span className="text-sm text-white/60">Streaming preview · Atlas persona</span>
            </div>
          </div>

          <div className="flex flex-col gap-5 px-4 pb-6 sm:px-6" ref={transcriptRef}>
            {showThinking && (
              <ThinkingIndicator
                isExpanded={isReasoningExpanded}
                onToggle={() => setIsReasoningExpanded((prev) => !prev)}
                progress={progress}
                steps={thinkingSteps}
              />
            )}

            <div className="space-y-6">
              {conversation.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
            {status === 'error' && streamError && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {streamError}
              </div>
            )}
          </div>

          <ReplyComposer
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmit={handleSubmit}
            textareaRef={textareaRef}
            onKeyDown={handleComposerKeydown}
            isStreaming={isStreaming}
            composerError={composerError}
            attachments={attachments}
            onAttachmentsSelect={(files) => {
              if (!files.length) return
              setAttachments((prev) => [
                ...prev,
                ...files.map((file) => ({
                  id: `${file.name}-${file.lastModified}-${cryptoRandom()}`,
                  file,
                })),
              ])
            }}
            onRemoveAttachment={(id) => {
              setAttachments((prev) => prev.filter((item) => item.id !== id))
            }}
            showGradient={showComposerGradient}
          />
        </div>
      </div>
    </section>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <article
      className={cn(
        'w-full max-w-3xl rounded-3xl border px-5 py-5 shadow-2xl shadow-black/20 sm:px-6',
        isUser
          ? 'ml-auto border-white/5 bg-white text-slate-900'
          : 'border-white/10 bg-white/5 text-white'
      )}
    >
      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em]">
        <span className={cn('font-semibold', isUser ? 'text-slate-900/70' : 'text-white/60')}>
          {message.author}
        </span>
        <span className={cn(isUser ? 'text-slate-900/40' : 'text-white/30')}>·</span>
        <span className={cn(isUser ? 'text-slate-900/60' : 'text-white/50')}>{message.timestamp}</span>
        {message.highlight && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] tracking-[0.3em]',
              isUser ? 'bg-slate-900/5 text-slate-900/70' : 'bg-white/10 text-white/70'
            )}
          >
            {message.highlight}
          </span>
        )}
        {message.status === 'streaming' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-white/70">
            <Loader2 className="h-3 w-3 animate-spin" />
            Live
          </span>
        )}
      </div>
      <div className={cn('mt-4 space-y-4 text-sm leading-relaxed', isUser ? 'text-slate-900/90' : 'text-white/80')}>
        {message.blocks.map((block, index) => (
          <MarkdownBlockRenderer key={`${message.id}-${index}`} block={block} isUser={isUser} />
        ))}
      </div>
    </article>
  )
}

function MarkdownBlockRenderer({ block, isUser }: { block: MarkdownBlock; isUser?: boolean }) {
  const baseText = isUser ? 'text-slate-900/90' : 'text-white/80'
  switch (block.type) {
    case 'paragraph':
      return <p className={cn('leading-relaxed', baseText)}>{renderInline(block.children)}</p>
    case 'heading': {
      const Tag = block.depth === 1 ? 'h2' : block.depth === 2 ? 'h3' : 'h4'
      return (
        <Tag className={cn('font-semibold tracking-tight', baseText)}>
          {renderInline(block.children)}
        </Tag>
      )
    }
    case 'list':
      return (
        <ul
          className={cn(
            'ml-5 space-y-1 text-sm',
            baseText,
            block.ordered ? 'list-decimal' : 'list-disc'
          )}
        >
          {block.items.map((item, index) => (
            <li key={`item-${index}`} className="pl-1">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      )
    case 'code':
      return (
        <pre
          className={cn(
            'overflow-x-auto rounded-2xl border px-4 py-3 text-xs leading-relaxed',
            isUser ? 'border-slate-900/10 bg-slate-900/5 text-slate-900/90' : 'border-white/10 bg-black/40'
          )}
        >
          <code className="whitespace-pre">{block.content}</code>
        </pre>
      )
    case 'blockquote':
      return (
        <blockquote
          className={cn(
            'border-l-4 border-white/20 bg-white/5/30 px-4 py-2 italic',
            isUser ? 'text-slate-900/70' : 'text-white/70'
          )}
        >
          {renderInline(block.children)}
        </blockquote>
      )
    case 'callout':
      return (
        <div
          className={cn(
            'rounded-2xl border px-4 py-3 text-sm',
            isUser ? 'border-slate-900/10 bg-slate-50 text-slate-900/80' : 'border-white/10 bg-white/5 text-white/80'
          )}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] opacity-80">{block.title}</p>
          <p className={cn('mt-2 text-sm leading-relaxed')}>{block.body}</p>
        </div>
      )
    default:
      return null
  }
}

function renderInline(nodes: InlineNode[]): ReactNode {
  return nodes.map((node, index) => {
    switch (node.type) {
      case 'text':
        return <span key={index}>{node.text}</span>
      case 'strong':
        return (
          <strong key={index} className="font-semibold">
            {renderInline(node.children)}
          </strong>
        )
      case 'emphasis':
        return (
          <em key={index} className="italic">
            {renderInline(node.children)}
          </em>
        )
      case 'delete':
        return (
          <del key={index} className="opacity-70">
            {renderInline(node.children)}
          </del>
        )
      case 'inlineCode':
        return (
          <code
            key={index}
            className="mx-1 rounded-md bg-white/10 px-1 py-0.5 text-xs font-mono text-white/80"
          >
            {node.text}
          </code>
        )
      case 'link':
        return (
          <a
            key={index}
            href={node.url}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-dotted underline-offset-4"
          >
            {renderInline(node.children)}
          </a>
        )
      case 'break':
        return <br key={index} />
      default:
        return null
    }
  })
}

type ThinkingIndicatorProps = {
  progress: number
  steps: string[]
  isExpanded: boolean
  onToggle: () => void
}

function ThinkingIndicator({ progress, steps, isExpanded, onToggle }: ThinkingIndicatorProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/80 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Thinking</p>
            <p className="text-sm text-white/80">Reasoning channel · {progress}% ready</p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10"
          onClick={onToggle}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      {isExpanded && (
        <>
          <div className="mt-4 space-y-2 text-sm text-white/70">
            {steps.map((step, index) => (
              <p key={`${step}-${index}`} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                {step}
              </p>
            ))}
          </div>
          <div className="mt-4 h-1.5 w-full rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-sky-400"
              style={{ width: `${Math.max(progress, 8)}%` }}
            />
          </div>
        </>
      )}
    </div>
  )
}

type ReplyComposerProps = {
  prompt: string
  onPromptChange: (value: string) => void
  onSubmit: (event?: React.FormEvent<HTMLFormElement>) => void
  textareaRef: React.RefObject<HTMLTextAreaElement>
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
  isStreaming: boolean
  composerError: string | null
  attachments: AttachmentItem[]
  onAttachmentsSelect: (files: File[]) => void
  onRemoveAttachment: (id: string) => void
  showGradient: boolean
}

function ReplyComposer({
  prompt,
  onPromptChange,
  onSubmit,
  textareaRef,
  onKeyDown,
  isStreaming,
  composerError,
  attachments,
  onAttachmentsSelect,
  onRemoveAttachment,
  showGradient,
}: ReplyComposerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <form
      onSubmit={onSubmit}
      className="relative border-t border-white/5 px-4 py-5 text-white/80 sm:px-6 sm:py-6"
    >
      {showGradient && (
        <div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-b from-transparent via-[#040714aa] to-[#040714]" />
      )}
      <div className="flex items-end gap-3">
        <button
          type="button"
          disabled={isStreaming}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(event) => onPromptChange(event.target.value)}
            placeholder='Ask Atlas anything… e.g. "Draft QA checklist for Zeplin handoff"'
            onKeyDown={onKeyDown}
            rows={1}
            className="min-h-[48px] resize-none border-0 bg-transparent px-0 text-base text-white placeholder:text-white/40 focus-visible:ring-0"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-white/40">
            <span>Enter to send · Shift+Enter for newline</span>
            <span>{isStreaming ? 'Streaming response…' : 'Streaming ready'}</span>
          </div>
          {attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {attachments.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs"
                >
                  <span className="max-w-[180px] truncate">{item.file.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(item.id)}
                    className="rounded-full bg-white/20 p-0.5 transition hover:bg-white/40"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {composerError && <p className="mt-2 text-xs text-red-300">{composerError}</p>}
        </div>
        <button
          type="submit"
          disabled={!prompt.trim() || isStreaming}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300 text-slate-900 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          if (files.length) {
            onAttachmentsSelect(files)
          }
          event.target.value = ''
        }}
      />
      <p className="mt-3 text-xs text-white/50">Attachments upload coming soon—preview your selections above.</p>
    </form>
  )
}

const cryptoRandom = () => Math.random().toString(36).slice(2, 10)

export default LLMPreview

