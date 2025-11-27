import { memo, useMemo } from 'react'
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
export const MarkdownContent = memo(
  function MarkdownContent({ content, isUser }: MarkdownContentProps) {
    // Memoize components to avoid recreating on every render
    const components = useMemo(
      () => ({
        // Paragraphs
        p: ({ node, ...props }: any) => (
          <p
            className="text-xs font-normal leading-[20px] text-white md:text-[14px] md:leading-[22px]"
            {...props}
          />
        ),

        // Headings
        h1: ({ node, ...props }: any) => (
          <h1
            className="mb-2 mt-6 text-lg font-semibold leading-[24px] text-white md:mb-3 md:mt-8 md:text-[22px] md:leading-[28px]"
            {...props}
          />
        ),
        h2: ({ node, ...props }: any) => (
          <h2
            className="mb-2 mt-4 text-base font-semibold leading-[22px] text-white md:mb-3 md:mt-6 md:text-[18px] md:leading-[24px]"
            {...props}
          />
        ),
        h3: ({ node, ...props }: any) => (
          <h3
            className="mb-2 mt-3 text-sm font-semibold leading-[20px] text-white md:mb-3 md:mt-5 md:text-[16px] md:leading-[19px]"
            {...props}
          />
        ),
        h4: ({ node, ...props }: any) => (
          <h4
            className="mb-1 mt-2 text-xs font-semibold leading-[18px] text-white md:mb-2 md:mt-4 md:text-[14px] md:leading-[20px]"
            {...props}
          />
        ),

        // Lists
        ul: ({ node, ...props }: any) => (
          <ul className="mb-3 ml-4 list-disc space-y-1.5 md:mb-4 md:ml-6 md:space-y-2" {...props} />
        ),
        ol: ({ node, ...props }: any) => (
          <ol
            className="mb-3 ml-4 list-decimal space-y-1.5 md:mb-4 md:ml-6 md:space-y-2"
            {...props}
          />
        ),
        li: ({ node, ...props }: any) => (
          <li
            className="pl-1 text-xs font-normal leading-[20px] text-white md:text-[14px] md:leading-[22px]"
            {...props}
          />
        ),

        // Inline code
        code: ({ node, inline, className, children, ...props }: any) => {
          if (inline) {
            return (
              <code
                className="rounded bg-[#2D2D2D] px-1 py-0.5 font-mono text-[11px] text-[#E5E5E5] md:px-1.5 md:text-[13px]"
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
        pre: ({ node, children, ...props }: any) => {
          const codeElement = node?.children?.[0]
          const className =
            codeElement?.type === 'element' ? codeElement.properties?.className : undefined
          const match = className ? /language-(\w+)/.exec(String(className)) : null
          const language = match ? match[1] : 'plaintext'

          return (
            <div className="my-4 flex w-full max-w-full flex-col overflow-hidden rounded-[12px] border border-[#191919] md:my-6 md:rounded-[16px]">
              {/* Code Header */}
              <div className="flex min-h-[36px] w-full flex-row items-center justify-between gap-2 px-3 py-2 md:h-[38px] md:gap-[10px] md:px-4">
                {/* Language label */}
                <div className="flex flex-row items-center gap-1 p-0">
                  <span className="text-[10px] font-normal leading-[18px] text-[#777777] md:text-[12px] md:leading-[22px]">
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
                  className="flex min-h-[36px] min-w-[44px] flex-row items-center justify-center gap-1 p-0 text-[10px] font-normal leading-[18px] text-[#777777] transition-colors hover:text-white active:bg-white/5 md:min-h-0 md:min-w-0 md:text-[12px] md:leading-[22px]"
                  aria-label="Copy code"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4 md:h-5 md:w-5"
                  >
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
                  <span className="hidden md:inline">Copy</span>
                </button>
              </div>

              {/* Code Content */}
              <div className="w-full overflow-x-auto bg-[#0E0E0E] px-3 py-3 md:px-4 md:py-4">
                <pre
                  className="!m-0 min-w-0 max-w-full overflow-x-auto !bg-transparent font-mono text-[11px] leading-[150%] md:text-[12px]"
                  {...props}
                >
                  {children}
                </pre>
              </div>
            </div>
          )
        },

        // Links
        a: ({ node, ...props }: any) => (
          <a
            className="text-blue-400 underline decoration-blue-400/30 underline-offset-2 transition-colors hover:text-blue-300 hover:decoration-blue-300/50"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),

        // Blockquotes
        blockquote: ({ node, ...props }: any) => (
          <blockquote
            className="my-3 border-l-2 border-white/20 py-1 pl-3 pr-2 text-xs font-normal italic leading-[20px] text-white/70 md:my-5 md:pl-4 md:text-[14px] md:leading-[22px]"
            {...props}
          />
        ),

        // Strong (bold)
        strong: ({ node, ...props }: any) => (
          <strong className="font-semibold text-white" {...props} />
        ),

        // Emphasis (italic)
        em: ({ node, ...props }: any) => <em className="italic text-white/90" {...props} />,

        // Delete (strikethrough)
        del: ({ node, ...props }: any) => <del className="line-through opacity-60" {...props} />,

        // Tables
        table: ({ node, ...props }: any) => (
          <div className="-mx-2 my-4 overflow-x-auto md:mx-0 md:my-6">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full" {...props} />
            </div>
          </div>
        ),
        thead: ({ node, ...props }: any) => <thead {...props} />,
        tbody: ({ node, ...props }: any) => <tbody {...props} />,
        tr: ({ node, ...props }: any) => (
          <tr className="border-b border-[#191919] last:border-0" {...props} />
        ),
        th: ({ node, ...props }: any) => (
          <th
            className="px-2 py-2 text-left text-xs font-bold leading-[20px] text-white first:pl-2 last:pr-2 md:px-4 md:py-3 md:text-[14px] md:leading-[22px] md:first:pl-0 md:last:pr-0"
            {...props}
          />
        ),
        td: ({ node, ...props }: any) => (
          <td
            className="px-2 py-2 text-xs font-normal leading-[20px] text-white first:pl-2 last:pr-2 md:px-4 md:py-3 md:text-[14px] md:leading-[22px] md:first:pl-0 md:last:pr-0"
            {...props}
          />
        ),

        // Horizontal Rule - Hide completely
        hr: () => null,
      }),
      []
    )

    return (
      <div className="streaming-content" style={{ willChange: 'contents' }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if content actually changed
    return prevProps.content === nextProps.content && prevProps.isUser === nextProps.isUser
  }
)
