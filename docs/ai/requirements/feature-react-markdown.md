# Feature: React Markdown Renderer

## Overview
Migrate from manual markdown rendering to using `react-markdown` library for automatic and professional markdown rendering in chat messages, while keeping the old implementation for reference.

## Problem Statement
Current implementation uses manual parsing and rendering:
- Server sends markdown string
- `parseMarkdownToBlocks()` parses markdown into block structures
- `MarkdownBlockRenderer` manually renders each block type with switch/case
- `InlineRenderer` manually renders each inline node with switch/case

This approach has drawbacks:
- **Manual and verbose**: Need to write rendering code for each block type
- **Hard to maintain**: Adding/updating markdown features requires updating multiple places
- **Not reusable**: Cannot reuse rendering logic
- **Error-prone**: Easy to introduce bugs in manual rendering

## Goals
1. Install and integrate `react-markdown` and `remark-gfm` libraries
2. Create new markdown renderer using `react-markdown` with custom components
3. Maintain ChatGPT-like styling that was already implemented
4. Keep old implementation (MarkdownBlockRenderer, InlineRenderer) for reference
5. Update MessageBubble to use new renderer
6. Ensure proper rendering of:
   - Paragraphs with proper spacing
   - Headings (H1-H4) with appropriate sizes
   - Lists (ordered and unordered)
   - Code blocks with syntax highlighting
   - Inline code
   - Links with hover effects
   - Blockquotes
   - Bold, italic, strikethrough text

## Technical Requirements

### Dependencies
```json
{
  "react-markdown": "^9.0.0",
  "remark-gfm": "^4.0.0",
  "rehype-raw": "^7.0.0"
}
```

### Custom Components for react-markdown
Need to create custom components that match ChatGPT styling:

1. **Paragraph**: `mb-3 leading-7 text-white/90`
2. **Headings**:
   - H1: `mb-4 mt-6 text-[22px] font-semibold leading-[28px]`
   - H2: `mb-3 mt-5 text-[18px] font-semibold leading-[24px]`
   - H3: `mb-3 mt-4 text-[16px] font-semibold leading-[22px]`
   - H4: `mb-2 mt-3 text-[14px] font-semibold leading-[20px]`
3. **Lists**: Proper spacing with `space-y-1.5 leading-7`
4. **Code blocks**: Dark background with header showing language and copy button
5. **Inline code**: `bg-black/40 text-white/95 font-mono`
6. **Links**: `text-blue-400` with underline and hover effects
7. **Blockquotes**: Border left with italic text

### Implementation Details
1. Create new component `MarkdownContent` that wraps `react-markdown`
2. Define custom components object for all markdown elements
3. Use `remark-gfm` plugin for GitHub Flavored Markdown support
4. Update `MessageBubble` to render content directly from `message.content` string
5. Remove dependency on `parseMarkdownToBlocks()` for new renderer
6. Keep old renderer code commented out with clear labels

### Data Flow (New)
```
Server (Markdown string)
    ↓
message.content (raw markdown)
    ↓
ReactMarkdown component with custom components
    ↓
Automatic rendering with proper styling
    ↓
JSX/HTML Output
```

### Data Flow (Old - Keep for reference)
```
Server (Markdown string)
    ↓
parseMarkdownToBlocks() → Parse markdown into blocks
    ↓
MarkdownBlock[] (Data structure)
    ↓
MarkdownBlockRenderer → Manual switch/case
    ↓
InlineRenderer → Manual switch/case
    ↓
JSX/HTML Output
```

## Success Criteria
- [ ] `react-markdown` and `remark-gfm` installed successfully
- [ ] New `MarkdownContent` component created with custom styling
- [ ] All markdown elements render correctly with ChatGPT-like styling
- [ ] Code blocks have proper syntax highlighting and copy button
- [ ] Links have proper hover effects
- [ ] Old implementation kept as comments for reference
- [ ] No visual regression in chat UI
- [ ] Message rendering performance is good (no lag during streaming)

## User Stories
1. As a developer, I want to use a mature markdown library so I don't have to maintain manual rendering code
2. As a user, I want markdown messages to render beautifully like ChatGPT
3. As a developer, I want to keep the old implementation for reference in case I need to understand the rendering logic

## Non-Goals
- Syntax highlighting for code blocks (can be added later with `rehype-highlight` or `prism`)
- Markdown editing features
- Custom markdown extensions beyond GFM
- Removing the old `parseMarkdownToBlocks` function (keep for potential future use)

## Migration Steps
1. Install dependencies
2. Create `MarkdownContent` component in a new file or within `llm-chat-area.tsx`
3. Update `ChatMessage` type to include `content: string` field
4. Update `allMessages` memo to include raw content from server
5. Update `MessageBubble` to use new `MarkdownContent` component
6. Comment out old `MarkdownBlockRenderer` and `InlineRenderer` with label `// OLD IMPLEMENTATION - Keep for reference`
7. Test thoroughly with various markdown inputs
8. Verify streaming still works correctly

## Related Files
- `/client/src/components/llm/llm-chat-area.tsx` - Main component to update
- `/client/src/lib/markdown.ts` - Old parser (keep but won't use in new renderer)
- `/client/package.json` - Add new dependencies

## References
- [react-markdown documentation](https://github.com/remarkjs/react-markdown)
- [remark-gfm documentation](https://github.com/remarkjs/remark-gfm)
- ChatGPT UI for styling reference
