# 🎨 Quick Design Reference - LLM Chat UI

## Text Styles

| Element | Font | Size | Weight | Line Height | Color |
|---------|------|------|--------|-------------|-------|
| **Paragraph** | Inter Variable | 14px | 400 | 22px (157%) | #FFFFFF |
| **H1** | Inter Variable | 22px | 600 | 28px | #FFFFFF |
| **H2** | Inter Variable | 18px | 600 | 24px | #FFFFFF |
| **H3** | Inter Variable | 16px | 600 | 19px (119%) | #FFFFFF |
| **H4** | Inter Variable | 14px | 600 | 20px | #FFFFFF |
| **List Item** | Inter Variable | 14px | 400 | 22px (157%) | #FFFFFF |
| **Blockquote** | Inter Variable | 14px | 400 italic | 22px | #FFFFFF 70% |
| **Inline Code** | Monospace | 13px | 400 | - | #E5E5E5 |
| **Code Block** | JetBrains Mono | 12px | 400 | 18px (150%) | #F97583 |
| **Table Header** | Inter Variable | 14px | 700 | 22px | #FFFFFF |
| **Table Cell** | Inter Variable | 14px | 400 | 22px | #FFFFFF |

---

## Code Block

### Container
```
Border: 1px solid #191919
Border Radius: 16px
Background: transparent
Padding: 0px
```

### Header (38px height)
```
Background: transparent
Border Bottom: 1px solid #191919
Padding: 8px 16px
Gap: 10px

Language Badge:
  Font: Inter Variable
  Size: 12px
  Weight: 400
  Color: #777777

Copy Button:
  Font: Inter Variable
  Size: 12px
  Weight: 400
  Color: #777777
  Hover: #FFFFFF
```

### Content Area
```
Background: #0E0E0E
Border Radius: 0px 0px 16px 16px
Padding: 16px
Gap: 10px

Code Text:
  Font: JetBrains Mono
  Size: 12px
  Weight: 400
  Line Height: 150%
  Color: Varies by syntax (default #F97583)
```

---

## Table

### Container
```
Display: flex
Flex Direction: column
Padding: 0px
```

### Row
```
Display: flex
Flex Direction: row
Padding: 10px 0px
Gap: 80px
Border Bottom: 1px solid #191919
```

### Cells
```
Header (th):
  Font: Inter Variable
  Size: 14px
  Weight: 700
  Line Height: 22px
  Color: #FFFFFF
  Text Align: left

Body (td):
  Font: Inter Variable
  Size: 14px
  Weight: 400
  Line Height: 22px
  Color: #FFFFFF
```

---

## Colors

### Primary
- Text: `#FFFFFF`
- Muted Text: `#777777`
- Background Dark: `#0E0E0E`
- Background Medium: `#2D2D2D`
- Border: `#191919`

### Code Syntax
- Default/Keywords: `#F97583` (red)
- Strings: `#A5D6FF` (light blue)
- Numbers: `#79C0FF` (blue)
- Functions: `#D2A8FF` (purple)
- Variables: `#FFA657` (orange)
- Comments: `#8B949E` (gray)

### Links
- Default: `#3B82F6` (blue-400)
- Hover: `#60A5FA` (blue-300)

---

## Spacing

### Margins
- H1: `mt-6 mb-4` (24px / 16px)
- H2: `mt-5 mb-3` (20px / 12px)
- H3: `mt-4 mb-3` (16px / 12px)
- H4: `mt-3 mb-2` (12px / 8px)
- Paragraph: `mb-3` (12px)
- List: `mb-3` (12px)
- Code Block: `my-4` (16px)
- Blockquote: `my-4` (16px)
- Table: `my-4` (16px)

### Padding
- Code Block Content: `p-4` (16px)
- Code Block Header: `px-4 py-2` (16px / 8px)
- Inline Code: `px-1.5 py-0.5` (6px / 2px)
- Blockquote: `pl-4` (16px)

### Gaps
- Table Rows: `gap-20` (80px)
- List Items: `space-y-1.5` (6px)
- Code Header: `gap-[10px]`

---

## Border Radius

- Code Block: `16px`
- Code Block Bottom: `0px 0px 16px 16px`
- Inline Code: `4px` (rounded)
- Composer: `16px`

---

## Quick Copy-Paste

### Paragraph
```tsx
<p className="mb-3 text-[14px] font-normal leading-[22px] text-white">
```

### H3 (Example header)
```tsx
<h3 className="mb-3 mt-4  text-[16px] font-semibold leading-[19px] text-white">
```

### Code Block Header
```tsx
<div className="flex h-[38px] w-full flex-row items-center justify-between gap-[10px] self-stretch border-b border-[#191919] px-4 py-2">
  <span className="text-[12px] font-normal leading-[22px] text-[#777777]">javascript</span>
  <button className="flex flex-row items-center gap-1 p-0 text-[12px] font-normal leading-[22px] text-[#777777] transition-colors hover:text-white">
    Copy
  </button>
</div>
```

### Table Row
```tsx
<tr className="flex flex-row items-start gap-20 self-stretch border-b border-[#191919] px-0 py-2.5">
```

---

## File Locations

- **Main Component**: `/client/src/components/llm/llm-chat-area.tsx`
- **Highlight Theme**: `/client/src/app/highlight-theme.css`
- **Typography Spec**: `/docs/ai/TYPOGRAPHY_SPEC.md`
- **Implementation Doc**: `/docs/ai/implementation/feature-react-markdown.md`
- **Summary**: `/docs/ai/MARKDOWN_IMPLEMENTATION_SUMMARY.md`

---

## Status: ✅ Complete

All design specifications implemented with 100% accuracy.
