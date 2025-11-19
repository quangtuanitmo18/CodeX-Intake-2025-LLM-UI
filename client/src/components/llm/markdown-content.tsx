import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

// Import highlight.js theme
import '@/app/highlight-theme.css'
import 'highlight.js/styles/github-dark.css'

interface MarkdownContentProps {
  content: string
  isUser: boolean
}

// Memoize to prevent unnecessary re-renders
export const MarkdownContent = memo(function MarkdownContent({
  content,
  isUser,
}: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        // Paragraphs
        p: ({ node, ...props }) => (
          <p className="mb-4 text-[14px] font-normal leading-[22px] text-white" {...props} />
        ),

        // Headings
        h1: ({ node, ...props }) => (
          <h1
            className="mb-3 mt-8 text-[22px] font-semibold leading-[28px] text-white"
            {...props}
          />
        ),
        h2: ({ node, ...props }) => (
          <h2
            className="mb-3 mt-6 text-[18px] font-semibold leading-[24px] text-white"
            {...props}
          />
        ),
        h3: ({ node, ...props }) => (
          <h3
            className="mb-3 mt-5 text-[16px] font-semibold leading-[19px] text-white"
            {...props}
          />
        ),
        h4: ({ node, ...props }) => (
          <h4
            className="mb-2 mt-4 text-[14px] font-semibold leading-[20px] text-white"
            {...props}
          />
        ),

        // Lists
        ul: ({ node, ...props }) => <ul className="mb-4 ml-6 list-disc space-y-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="mb-4 ml-6 list-decimal space-y-2" {...props} />,
        li: ({ node, ...props }) => (
          <li className="pl-1 text-[14px] font-normal leading-[22px] text-white" {...props} />
        ),

        // Inline code
        code: ({ node, inline, className, children, ...props }: any) => {
          if (inline) {
            return (
              <code
                className="rounded bg-[#2D2D2D] px-1.5 py-0.5 font-mono text-[13px] text-[#E5E5E5]"
                {...props}
              >
                {children}
              </code>
            )
          }

          return (
            <code className={className} {...props}>
              {children}
            </code>
          )
        },

        // Pre block - Code blocks
        pre: ({ node, children, ...props }) => {
          const codeElement = node?.children?.[0]
          const className =
            codeElement?.type === 'element' ? codeElement.properties?.className : undefined
          const match = className ? /language-(\w+)/.exec(String(className)) : null
          const language = match ? match[1] : 'plaintext'

          return (
            <div className="my-6 flex flex-col overflow-hidden rounded-[16px] border border-[#191919]">
              {/* Code Header */}
              <div className="flex h-[38px] w-full flex-row items-center justify-between gap-[10px] px-4 py-2">
                {/* Language label */}
                <div className="flex flex-row items-center gap-1 p-0">
                  <span className="text-[12px] font-normal leading-[22px] text-[#777777]">
                    {language}
                  </span>
                </div>

                {/* Copy button */}
                <button
                  onClick={() => {
                    const codeChild = node?.children?.[0]
                    let code = ''

                    if (codeChild && codeChild.type === 'element') {
                      const textChild = codeChild.children?.[0]
                      if (textChild && 'value' in textChild) {
                        code = textChild.value
                      }
                    }

                    navigator.clipboard.writeText(code)
                  }}
                  className="flex flex-row items-center gap-1 p-0 text-[12px] font-normal leading-[22px] text-[#777777] transition-colors hover:text-white"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                    <path
                      d="M13.3333 10.75V14.0833C13.3333 14.3928 13.2104 14.6895 12.9916 14.9083C12.7728 15.1271 12.4761 15.25 12.1667 15.25H5.91667C5.60725 15.25 5.3105 15.1271 5.09171 14.9083C4.87292 14.6895 4.75 14.3928 4.75 14.0833V7.83333C4.75 7.52391 4.87292 7.22717 5.09171 7.00838C5.3105 6.78958 5.60725 6.66667 5.91667 6.66667H9.25"
                      stroke="currentColor"
                      strokeWidth="0.833333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11.5 4.75H14.8333V8.08333"
                      stroke="currentColor"
                      strokeWidth="0.833333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.25 10.75L14.8333 5.16667"
                      stroke="currentColor"
                      strokeWidth="0.833333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Copy</span>
                </button>
              </div>

              {/* Code Content */}
              <div className="w-full bg-[#0E0E0E] px-4 py-4">
                <pre
                  className="!m-0 w-full overflow-x-auto !bg-transparent font-mono text-[12px] leading-[150%]"
                  {...props}
                >
                  {children}
                </pre>
              </div>
            </div>
          )
        },

        // Links
        a: ({ node, ...props }) => (
          <a
            className="text-blue-400 underline decoration-blue-400/30 underline-offset-2 transition-colors hover:text-blue-300 hover:decoration-blue-300/50"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),

        // Blockquotes
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="my-5 border-l-2 border-white/20 py-1 pl-4 pr-2 text-[14px] font-normal italic leading-[22px] text-white/70"
            {...props}
          />
        ),

        // Strong (bold)
        strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,

        // Emphasis (italic)
        em: ({ node, ...props }) => <em className="italic text-white/90" {...props} />,

        // Delete (strikethrough)
        del: ({ node, ...props }) => <del className="line-through opacity-60" {...props} />,

        // Tables
        table: ({ node, ...props }) => (
          <div className="my-6 overflow-x-auto">
            <table className="w-full" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => <thead {...props} />,
        tbody: ({ node, ...props }) => <tbody {...props} />,
        tr: ({ node, ...props }) => (
          <tr className="border-b border-[#191919] last:border-0" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th
            className="px-4 py-3 text-left text-[14px] font-bold leading-[22px] text-white first:pl-0 last:pr-0"
            {...props}
          />
        ),
        td: ({ node, ...props }) => (
          <td
            className="px-4 py-3 text-[14px] font-normal leading-[22px] text-white first:pl-0 last:pr-0"
            {...props}
          />
        ),

        // Horizontal Rule - Hide completely
        hr: () => null,
      }}
    >
      {content}
    </ReactMarkdown>
  )
})
