import type {
  Blockquote,
  Code,
  Content,
  Delete,
  Emphasis,
  Heading,
  InlineCode,
  Link,
  List,
  ListItem,
  Paragraph,
  Root,
  Strong,
  Text,
} from 'mdast'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

export type InlineNode =
  | { type: 'text'; text: string }
  | { type: 'strong'; children: InlineNode[] }
  | { type: 'emphasis'; children: InlineNode[] }
  | { type: 'delete'; children: InlineNode[] }
  | { type: 'inlineCode'; text: string }
  | { type: 'link'; url: string; title?: string | null; children: InlineNode[] }
  | { type: 'break' }

export type MarkdownBlock =
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'list'; ordered?: boolean; items: InlineNode[][] }
  | { type: 'code'; language?: string; content: string }
  | { type: 'heading'; depth: number; children: InlineNode[] }
  | { type: 'blockquote'; children: InlineNode[] }
  | { type: 'callout'; title: string; body: string }

const processor = unified().use(remarkParse).use(remarkGfm)

export function parseMarkdownToBlocks(markdown: string): MarkdownBlock[] {
  if (!markdown.trim()) {
    return [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }]
  }

  const tree = processor.parse(markdown) as Root
  const blocks: MarkdownBlock[] = []

  tree.children.forEach((node) => {
    switch (node.type) {
      case 'paragraph':
        blocks.push({
          type: 'paragraph',
          children: buildInline((node as Paragraph).children),
        })
        break
      case 'list':
        blocks.push(parseList(node as List))
        break
      case 'code':
        blocks.push({
          type: 'code',
          language: (node as Code).lang ?? undefined,
          content: (node as Code).value,
        })
        break
      case 'heading':
        blocks.push({
          type: 'heading',
          depth: (node as Heading).depth,
          children: buildInline((node as Heading).children),
        })
        break
      case 'blockquote':
        blocks.push({
          type: 'blockquote',
          children: flattenBlockquote(node as Blockquote),
        })
        break
      default:
        break
    }
  })

  if (!blocks.length) {
    return [{ type: 'paragraph', children: [{ type: 'text', text: markdown }] }]
  }

  return blocks
}

const parseList = (list: List): MarkdownBlock => {
  const items: InlineNode[][] = list.children.map((item) => {
    const listItem = item as ListItem
    const firstParagraph = listItem.children.find((child) => child.type === 'paragraph') as
      | Paragraph
      | undefined
    if (firstParagraph) {
      return buildInline(firstParagraph.children)
    }
    return [{ type: 'text', text: '' }]
  })

  return {
    type: 'list',
    ordered: list.ordered ?? false,
    items,
  }
}

const flattenBlockquote = (blockquote: Blockquote): InlineNode[] => {
  const children: InlineNode[] = []
  blockquote.children.forEach((child) => {
    if (child.type === 'paragraph') {
      children.push(...buildInline((child as Paragraph).children))
      children.push({ type: 'break' })
    }
  })
  return children.length ? children.slice(0, -1) : [{ type: 'text', text: '' }]
}

const buildInline = (nodes: Content[]): InlineNode[] => {
  const inlines: InlineNode[] = []

  nodes.forEach((node) => {
    switch (node.type) {
      case 'text':
        inlines.push({ type: 'text', text: (node as Text).value })
        break
      case 'strong':
        inlines.push({
          type: 'strong',
          children: buildInline((node as Strong).children as Content[]),
        })
        break
      case 'emphasis':
        inlines.push({
          type: 'emphasis',
          children: buildInline((node as Emphasis).children as Content[]),
        })
        break
      case 'delete':
        inlines.push({
          type: 'delete',
          children: buildInline((node as Delete).children as Content[]),
        })
        break
      case 'inlineCode':
        inlines.push({ type: 'inlineCode', text: (node as InlineCode).value })
        break
      case 'link':
        inlines.push({
          type: 'link',
          url: (node as Link).url,
          title: (node as Link).title,
          children: buildInline((node as Link).children as Content[]),
        })
        break
      case 'break':
        inlines.push({ type: 'break' })
        break
      default:
        break
    }
  })

  return inlines
}
