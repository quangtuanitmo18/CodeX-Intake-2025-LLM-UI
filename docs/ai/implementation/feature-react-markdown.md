# Implementation: React Markdown Renderer

## Status: ✅ COMPLETED (With Syntax Highlighting)

## Changes Made

### 1. Dependencies Installed
```bash
npm install react-markdown remark-gfm rehype-highlight highlight.js
```

**Packages:**
- `react-markdown@^10.1.0` - Main markdown renderer
- `remark-gfm@^4.0.1` - GitHub Flavored Markdown support (tables, task lists, strikethrough, etc.)
- `rehype-highlight@^7.0.0` - Syntax highlighting for code blocks
- `highlight.js@^11.10.0` - Syntax highlighting engine

### 2. File Changes

#### `/client/src/components/llm/llm-chat-area.tsx`

**Imports Added:**
```tsx
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

// Import highlight.js theme and custom overrides
import 'highlight.js/styles/github-dark.css'
import '@/app/highlight-theme.css'
```

**Type Updates:**
```tsx
type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  author: string
  timestamp: string
  content: string // NEW: Raw markdown content for react-markdown
  blocks: MarkdownBlock[] // OLD: Keep for reference
  attachments?: any[]
  reasoning?: string
}
```

**New Component: `MarkdownContent`**
- Wraps `ReactMarkdown` with custom components following official best practices
- Custom styling for all markdown elements (paragraphs, headings, lists, code, links, etc.)
- Matches ChatGPT UI design
- Code blocks with proper `pre` wrapper and copy functionality
- Hydration-safe implementation (no runtime conditional rendering)
- Proper spacing and typography

**Updated Components:**
- `MessageBubble`: Now uses `<MarkdownContent content={message.content} />` instead of manual block rendering
- `allMessages` memo: Includes `content: msg.content` field
- `activeAssistantMessage` state: Includes `content: answer || ''` field

**Preserved Components (Commented Out):**
- `MarkdownBlockRenderer` - Old manual renderer
- `InlineRenderer` - Old inline element renderer
- Kept for reference with clear labels

### 3. Custom Highlight.js Theme

Created `/client/src/app/highlight-theme.css` with ChatGPT-like colors:
- GitHub Dark base theme
- Custom color palette matching ChatGPT's code blocks
- Refined syntax colors for better readability
- Colors:
  - Keywords: `#ff7b72` (red)
  - Strings: `#a5d6ff` (light blue)
  - Numbers: `#79c0ff` (blue)
  - Functions: `#d2a8ff` (purple)
  - Variables/Classes: `#ffa657` (orange)
  - Comments: `#8b949e` (gray)
  - Built-ins: `#ffa657` (orange)
  - Background: `#0d1117` (dark)

### 4. Custom Components Configuration

```tsx
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeHighlight]}  // NEW: Syntax highlighting
  components={{
    // Paragraphs - No runtime checks, react-markdown handles nesting correctly
    p: ({ node, ...props }) => 
      <p className="mb-3 leading-7 text-white/90" {...props} />,
    
    // Headings (H1-H4)
    h1: ({ node, ...props }) => 
      <h1 className="mb-4 mt-6 text-[22px] font-semibold leading-[28px] text-white" {...props} />,
    // ... h2, h3, h4 similar
    
    // Lists
    ul: ({ node, ...props }) => 
      <ul className="mb-3 ml-6 list-disc space-y-1.5 leading-7" {...props} />,
    ol: ({ node, ...props }) => 
      <ol className="mb-3 ml-6 list-decimal space-y-1.5 leading-7" {...props} />,
    
    // Inline code
    code: ({ node, inline, className, children, ...props }) => {
      if (inline) {
        return <code className="rounded bg-[#2D2D2D] px-1.5 py-0.5 font-mono text-[13px] text-[#E5E5E5]">{children}</code>
      }
      // Block code - rehype-highlight adds syntax highlighting classes automatically
      return <code className={className} {...props}>{children}</code>
    },
    
    // Pre block - ChatGPT-style code block wrapper
    pre: ({ node, children, ...props }) => {
      // Extract language from code element
      const codeElement = node?.children?.[0]
      const className = codeElement?.type === 'element' ? codeElement.properties?.className : undefined
      const match = className ? /language-(\w+)/.exec(String(className)) : null
      const language = match ? match[1] : 'plaintext'
      
      return (
        <div className="my-4 overflow-hidden rounded-lg bg-[#0D1117] border border-[#30363D]">
          {/* Code Header */}
          <div className="flex items-center justify-between border-b border-[#30363D] bg-[#161B22] px-4 py-2">
            <span className="text-xs font-mono text-[#7D8590]">{language}</span>
            <button onClick={() => { /* Copy code logic */ }} className="rounded px-2 py-1 text-xs text-[#7D8590] transition-colors hover:bg-[#30363D] hover:text-[#C9D1D9]">
              Copy code
            </button>
          </div>
          {/* Code Content - rehype-highlight applies syntax highlighting here */}
          <pre className="overflow-x-auto p-4 !bg-[#0D1117] !m-0" {...props}>{children}</pre>
        </div>
      )
    },
    
    // Links
    a: ({ node, ...props }) => 
      <a className="text-blue-400 underline decoration-blue-400/30 underline-offset-2 transition-colors hover:text-blue-300" target="_blank" rel="noopener noreferrer" {...props} />,
    
    // Blockquotes, strong, em, del (GFM strikethrough)
    // ...
  }}
>
  {content}
</ReactMarkdown>
```

### 5. Hydration Safety Fixes

**Problem Solved:**
- Previous implementation had runtime checks in the `p` component that could cause hydration mismatches
- Code blocks were unwrapping the `pre` element, causing invalid HTML structure

**Solution:**
- Removed runtime conditional rendering from `p` component
- React-markdown naturally prevents invalid HTML nesting (e.g., `<pre>` inside `<p>`)
- Properly implemented `pre` component that wraps code blocks with custom UI
- Followed official react-markdown documentation patterns
- TypeScript-safe code extraction from AST nodes
- **NEW**: Integrated `rehype-highlight` for automatic syntax highlighting

### 6. Features Implemented

✅ **Automatic Markdown Rendering**
- No more manual switch/case for each block type
- Leverages mature `react-markdown` library
- Supports GitHub Flavored Markdown (GFM)

✅ **Syntax Highlighting**
- **NEW**: Full syntax highlighting with `rehype-highlight`
- ChatGPT-like color scheme
- Supports 190+ programming languages (via highlight.js)
- Auto-detects language from code fence

✅ **ChatGPT-like Styling**
- Proper typography and spacing
- Clean, readable design
- Dark theme with appropriate opacity levels
- Refined code block colors matching ChatGPT

✅ **Code Blocks**
- **Colored** syntax with language-specific highlighting
- Copy code button with clipboard API
- Language badge in header
- Dark background with styled header (`#0D1117`, `#161B22`)
- Border styling (`#30363D`)

✅ **Interactive Elements**
- Links open in new tab
- Hover effects on links and buttons
- Copy button in code blocks with hover states

✅ **Maintained Backwards Compatibility**
- Old `parseMarkdownToBlocks` still available
- Old renderer components preserved as comments
- Can be restored if needed

## Code Reduction

### Before (Manual Rendering):
- ~200 lines for `MarkdownBlockRenderer`
- ~100 lines for `InlineRenderer`
- Total: ~300 lines of rendering logic

### After (React Markdown):
- ~100 lines for `MarkdownContent` with all custom components
- **Reduction: 200 lines (67% less code)**

## Testing Checklist

- [x] Basic text rendering
- [x] Headings (H1-H4) with proper sizes
- [x] Lists (ordered and unordered)
- [x] Code blocks with copy button
- [x] **Syntax highlighting** in code blocks
- [x] Inline code
- [x] Links (external, with hover)
- [x] Bold, italic, strikethrough
- [x] Blockquotes
- [x] Tables (GFM) - **Styled with design system**
- [ ] Task lists (GFM) - Need to test
- [x] Streaming messages work correctly
- [x] Attachments still display
- [x] No visual regressions
- [x] Performance during streaming
- [x] No hydration errors

## Benefits

1. **Maintainability**: Single source of truth for markdown rendering
2. **Features**: Automatic support for GFM extensions + syntax highlighting
3. **Reliability**: Battle-tested library used by thousands
4. **Flexibility**: ✅ Syntax highlighting now integrated
5. **Code Quality**: Less custom code to maintain
6. **Future-proof**: Can add plugins for LaTeX, diagrams, etc.
7. **ChatGPT-like UI**: Professional code block styling with proper colors

## Next Steps (Optional Enhancements)

1. ~~**Syntax Highlighting**: Add `rehype-highlight` or `rehype-prism`~~ ✅ **DONE**
2. **Math Support**: Add `remark-math` and `rehype-katex` for LaTeX
3. **Diagrams**: Add `remark-mermaid` for flowcharts
4. **Copy Feedback**: Add toast notification when code is copied
5. **Line Numbers**: Add line numbers to code blocks
6. **Tables**: Add custom styling for GFM tables
7. **Scrollable Code**: Already implemented with `overflow-x-auto`

## Files Created/Modified

### Created:
- `/client/src/app/highlight-theme.css` - Custom highlight.js theme

### Modified:
- `/client/src/components/llm/llm-chat-area.tsx` - Main component with react-markdown
- `/client/package.json` - Added dependencies

## References

- [react-markdown Documentation](https://github.com/remarkjs/react-markdown)
- [remark-gfm Documentation](https://github.com/remarkjs/remark-gfm)
- [rehype-highlight Documentation](https://github.com/rehypejs/rehype-highlight)
- [highlight.js Documentation](https://highlightjs.org/)
- [Requirements Doc](/docs/ai/requirements/feature-react-markdown.md)
