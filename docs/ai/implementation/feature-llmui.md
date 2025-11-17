---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup
**How do we get started?**

- Install dependencies inside `client/` with `npm install` (the component relies only on packages that already live in `package.json`, such as `lucide-react`, `tailwindcss`, and the shadcn primitives).
- Run `npm run dev` from `client/` to preview the UI at `http://localhost:3000`.
- Backend streaming requires the following `.env` entries: `LLM_API_URL`, `LLM_API_MODEL`, and `LLM_API_TOKEN` (use the provided `user_pk_...` secret). Without them the Fastify process will reject LLM requests.

## Code Structure
**How is the code organized?**

- UI surface lives in `client/src/components/llm/llm-preview.tsx` (client component).
- Supporting units (`MessageBubble`, `MarkdownBlockRenderer`, `ThinkingIndicator`, `ReplyComposer`) are colocated in the same file to keep Zeplin-specific styling near the parent.
- A future `app/llm/page.tsx` route will simply import `<LLMPreview />` once the App Router directory permissions are relaxed.

## Implementation Notes
**Key technical details to remember:**

### Core Features
- Transcript surface: alternating `user`/`assistant` bubbles, Markdown-aware blocks (paragraph, list, code, callout) with Zeplin spacing tokens (24–32 px).
- Thinking indicator: animated badge with collapsible reasoning steps and progress bar that mirrors the “Thinking” drawer from the Zeplin screen.
- Reply composer: auto-resizing textarea, attachment affordance, Enter-to-send shortcut hint, and disabled send button when the prompt is empty.
- `useLLMStream` hook drives the live transcript: opens `POST /llm/stream`, parses SSE `data:` frames, appends `thinking` deltas to the drawer, and feeds `answer` deltas into the assistant bubble for word-by-word reveal.
- Markdown AST pipeline: `lib/markdown.ts` uses `unified + remark-parse + remark-gfm` to convert the LLM string into an AST, then maps it into typed `MarkdownBlock` structures (`paragraph`, `list`, `code`, `blockquote`, custom `callout`). `LLMPreview` renders every block/inlines explicitly—no `dangerouslySetInnerHTML`.
- Reply form polish (Task 2.4): validation enforces ≥5 characters, attachment chips act as a placeholder for future uploads, and a dynamic gradient overlay appears above the composer whenever the transcript is scrollable to match the Zeplin cue.

### Patterns & Best Practices
- Tailwind-only styling, gradients, and rounded radii are lifted from the Zeplin artboard so no 3rd-party UI kit is required.
- Streaming simulation uses a word-by-word interval (`STREAMING_WORDS`) so the component can later swap in real SSE/WebSocket chunks without changing layout.
- Shared utility `cn` keeps conditional class names readable; lucide icons provide visual parity with the mock.

## Integration Points
**How do pieces connect?**

- `LLMPreview` is self-contained today; wire it to `/llm` (or another protected route) by creating a shallow page component that simply renders `<LLMPreview />`.
- Replace the mocked streaming interval with calls to the forthcoming `/api/llm/send` endpoint and hydrate `conversation` with real SSE chunks.
- `ReplyComposer` exposes `onSubmit` and `onPromptChange`, so the networking layer can be injected without modifying the visual shell.
- Backend Fastify route `/llm/stream` proxies SSE traffic to the provider defined by `LLM_API_URL`/`LLM_API_MODEL`, injecting the secret `LLM_API_TOKEN` from `.env`. The controller streams JSON chunks with the `{ type, delta, reasoning }` shape expected by the client.
  - Provider: CodeX AI Proxy (`http://llm.codex.so`, see [slaveeks/ai-proxy](https://github.com/slaveeks/ai-proxy)). Requests must include `x-api-key` and `Accept: application/x-ndjson`; the proxy returns NDJSON events (`text-delta`, `reasoning-delta`, `finish`, etc.) that we map to the UI chunk schema.

## Error Handling
**How do we handle failures?**

- Composer guards against empty submissions and keeps the UI responsive even while future network work is pending.
- Thinking indicator can be toggled closed, which doubles as a fallback state if reasoning metadata is missing.
- Real streaming errors should surface via the toast system in `@/components/ui/use-toast` once the transport is connected.

## Performance Considerations
**How do we keep it fast?**

- Word-level streaming happens via a single interval and memoized blocks to avoid re-rendering the entire transcript.
- Layout avoids nested scroll containers so it can handle long transcripts without jank; consider virtualizing once real history is introduced.
- Gradients/blur effects rely on CSS only, so no additional runtime work is required.

## Security Notes
**What security measures are in place?**

- Composer never exposes provider tokens—future integrations must send prompts through the authenticated server route.
- Attachment button is UI-only for now; file validation and upload policies will be enforced alongside the media API milestone.
- The route should stay behind the existing auth middleware when the `/llm` page is added so only logged-in reviewers can access the reference experience.

