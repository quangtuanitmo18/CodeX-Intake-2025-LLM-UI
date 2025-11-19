# Typography Specification - LLM Chat UI

## Design System Compliance

All text elements now match the exact design system specifications.

---

## 📝 Paragraphs

### Normal Text
```css
font-family: 'Inter Variable';
font-style: normal;
font-weight: 400;
font-size: 14px;
line-height: 22px; /* 157% */
color: #FFFFFF;
```

**Tailwind:**
```tsx
className="  text-[14px] font-normal leading-[22px] text-white"
```

---

## 📌 Headings

### H1 (Main Title)
```css
font-family: 'Inter Variable';
font-weight: 600;
font-size: 22px;
line-height: 28px;
color: #FFFFFF;
```

**Tailwind:**
```tsx
className="  text-[22px] font-semibold leading-[28px] text-white"
```

### H2 (Section Title)
```css
font-family: 'Inter Variable';
font-weight: 600;
font-size: 18px;
line-height: 24px;
color: #FFFFFF;
```

**Tailwind:**
```tsx
className="  text-[18px] font-semibold leading-[24px] text-white"
```

### H3 (Subsection Title) 🎯
```css
font-family: 'Inter Variable';
font-weight: 600;
font-size: 16px;
line-height: 19px; /* 119% */
color: #FFFFFF;
```

**Tailwind:**
```tsx
className="  text-[16px] font-semibold leading-[19px] text-white"
```

**Example Usage:**
```markdown
### 🧩 What FinalizationRegistry Is
```

### H4 (Minor Heading)
```css
font-family: 'Inter Variable';
font-weight: 600;
font-size: 14px;
line-height: 20px;
color: #FFFFFF;
```

**Tailwind:**
```tsx
className="  text-[14px] font-semibold leading-[20px] text-white"
```

---

## 📋 Lists

### List Items
```css
font-family: 'Inter Variable';
font-weight: 400;
font-size: 14px;
line-height: 22px; /* 157% */
color: #FFFFFF;
```

**Tailwind:**
```tsx
className="  text-[14px] font-normal leading-[22px] text-white"
```

### Unordered Lists (ul)
- Margin left: `24px` (ml-6)
- List style: `disc`
- Spacing: `6px` between items (space-y-1.5)

### Ordered Lists (ol)
- Margin left: `24px` (ml-6)
- List style: `decimal`
- Spacing: `6px` between items (space-y-1.5)

---

## 💬 Blockquotes

```css
font-family: 'Inter Variable';
font-style: italic;
font-weight: 400;
font-size: 14px;
line-height: 22px; /* 157% */
color: rgba(255, 255, 255, 0.7); /* #FFFFFF at 70% opacity */
border-left: 2px solid rgba(255, 255, 255, 0.2);
padding-left: 16px;
```

**Tailwind:**
```tsx
className="border-l-2 border-white/20 pl-4   text-[14px] font-normal italic leading-[22px] text-white/70"
```

---

## 💻 Code Elements

### Inline Code
```css
font-family: monospace;
font-size: 13px;
background: #2D2D2D;
color: #E5E5E5;
padding: 2px 6px;
border-radius: 4px;
```

**Tailwind:**
```tsx
className="rounded bg-[#2D2D2D] px-1.5 py-0.5 font-mono text-[13px] text-[#E5E5E5]"
```

### Code Blocks
```css
font-family: 'JetBrains Mono';
font-weight: 400;
font-size: 12px;
line-height: 150%; /* 18px */
color: #F97583; /* Default color, varies by syntax */
background: #0E0E0E;
```

**Tailwind:**
```tsx
className="font-mono text-[12px] leading-[150%] !bg-[#0E0E0E]"
```

### Code Block Header

**Language Badge:**
```css
font-family: 'Inter Variable';
font-weight: 400;
font-size: 12px;
line-height: 22px; /* 183% */
color: #777777;
```

**Copy Button:**
```css
font-family: 'Inter Variable';
font-weight: 400;
font-size: 12px;
line-height: 22px; /* 183% */
color: #777777;
```

---

## 📊 Tables

### Table Headers (th)
```css
font-family: 'Inter Variable';
font-weight: 700;
font-size: 14px;
line-height: 22px; /* 157% */
color: #FFFFFF;
text-align: left;
```

**Tailwind:**
```tsx
className="  text-[14px] font-bold leading-[22px] text-white"
```

### Table Cells (td)
```css
font-family: 'Inter Variable';
font-weight: 400;
font-size: 14px;
line-height: 22px; /* 157% */
color: #FFFFFF;
```

**Tailwind:**
```tsx
className="  text-[14px] font-normal leading-[22px] text-white"
```

### Table Rows (tr)
```css
padding: 10px 0px;
gap: 80px;
border-bottom: 1px solid #191919;
```

**Tailwind:**
```tsx
className="flex flex-row items-start gap-20 self-stretch border-b border-[#191919] px-0 py-2.5"
```

---

## 🔗 Links

```css
font-family: inherit; /* From parent */
color: #3B82F6; /* text-blue-400 */
text-decoration: underline;
text-underline-offset: 2px;
text-decoration-color: rgba(59, 130, 246, 0.3);
```

**Hover:**
```css
color: #60A5FA; /* text-blue-300 */
text-decoration-color: rgba(96, 165, 250, 0.5);
```

**Tailwind:**
```tsx
className="text-blue-400 underline decoration-blue-400/30 underline-offset-2 transition-colors hover:text-blue-300 hover:decoration-blue-300/50"
```

---

## 🎨 Text Formatting

### Bold (strong)
```css
font-weight: 600;
color: #FFFFFF;
```

**Tailwind:**
```tsx
className="font-semibold text-white"
```

### Italic (em)
```css
font-style: italic;
color: rgba(255, 255, 255, 0.9);
```

**Tailwind:**
```tsx
className="italic text-white/90"
```

### Strikethrough (del)
```css
text-decoration: line-through;
opacity: 0.6;
```

**Tailwind:**
```tsx
className="line-through opacity-60"
```

---

## 📐 Spacing & Margins

### Paragraphs
- Margin bottom: `12px` (mb-3)

### Headings
- **H1**: `margin-top: 24px`, `margin-bottom: 16px`
- **H2**: `margin-top: 20px`, `margin-bottom: 12px`
- **H3**: `margin-top: 16px`, `margin-bottom: 12px`
- **H4**: `margin-top: 12px`, `margin-bottom: 8px`

### Lists
- Margin bottom: `12px`
- Margin left: `24px`
- Item spacing: `6px`

### Code Blocks
- Margin top & bottom: `16px`

### Blockquotes
- Margin top & bottom: `16px`

### Tables
- Margin top & bottom: `16px`

---

## 🎯 Implementation

All typography specs are implemented in:
- **Component**: `/client/src/components/llm/llm-chat-area.tsx`
- **Function**: `MarkdownContent` component with custom `ReactMarkdown` components

### Example Usage in Component:

```tsx
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeHighlight]}
  components={{
    p: ({ node, ...props }) => (
      <p className="mb-3   text-[14px] font-normal leading-[22px] text-white" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="mb-3 mt-4   text-[16px] font-semibold leading-[19px] text-white" {...props} />
    ),
    // ... all other elements
  }}
>
  {content}
</ReactMarkdown>
```

---

## ✅ Compliance Checklist

- [x] Paragraphs: 14px, Inter Variable, 22px line-height
- [x] H1: 22px, semibold, 28px line-height
- [x] H2: 18px, semibold, 24px line-height
- [x] H3: 16px, semibold, 19px line-height ✨
- [x] H4: 14px, semibold, 20px line-height
- [x] Lists: 14px, normal, 22px line-height
- [x] Blockquotes: 14px, italic, 22px line-height
- [x] Code blocks: JetBrains Mono, 12px, 150% line-height
- [x] Inline code: 13px, monospace
- [x] Tables: Headers bold, cells normal, 14px
- [x] Links: Blue, underline, hover effects
- [x] All colors match design system

---

## 🚀 Result

**100% Design System Compliance** ✅

All text elements now perfectly match the Figma design specifications with exact:
- Font families (Inter Variable, JetBrains Mono)
- Font sizes (12px - 22px)
- Font weights (400, 600, 700)
- Line heights (exact pixel values)
- Colors (#FFFFFF, #777777, etc.)
- Spacing and margins

Ready for production! 🎉
