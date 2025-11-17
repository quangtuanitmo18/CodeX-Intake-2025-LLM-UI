---
phase: design
title: System Design & Architecture
description: Define the technical architecture, components, and data models
---

# System Design & Architecture

## Architecture Overview
**What is the high-level system structure?**

```mermaid
flowchart LR
  subgraph Client [LLM UI Frontend]
    ChatPage --> StreamRenderer
    ChatPage --> ReplyForm
    StreamRenderer --> MarkdownAST
    ReplyForm --> Transport
  end

  subgraph Server [LLM Gateway]
    RESTAPI --> StreamController --> StreamService --> LLMProvider
    StreamService --> ReasoningChannel
  end

  Client -->|WebSocket/HTTP stream| Server
  Server -->|JSON chunks (thinking+answer)| Client
```

- Client: Next.js 15 App Router + Tailwind/vanilla components implementing Zeplin layout. Handles message layout, streaming animation, reasoning drawer, reply form.
- Server: Fastify-based gateway exposing authenticated streaming endpoints, relaying user prompts to Codex-provided LLM API, enriching chunks with reasoning metadata.
- Shared utilities: Markdown AST parser (remark/rehype) to convert LLM output into typed block tree rendered by React.
- Rationale: Keep logic split so UI remains responsive while server enforces auth, token usage, and safe streaming.

## Data Models
**What data do we need to manage?**

- Core entities:
  - `ChatMessage`: `{ id, author, content, createdAt, type }`.
  - `StreamChunk`: `{ chunkId, role, deltaText, reasoningText?, status }`.
  - `MarkdownBlock`: AST nodes describing paragraphs, code blocks, lists, etc.
- Structures:
  - Frontend state keeps ordered array of `ChatMessage` plus transient `StreamChunk` buffer for currently streaming answer.
  - Server keeps minimal request context (userId, conversationId) per streaming session; no long-term persistence required.
- Data flow:
  - ReplyForm submits `PromptPayload` → server issues request to LLM provider.
  - Provider returns SSE/WebSocket chunks; server normalizes into `StreamChunk` packets (thinking vs final answer) and forwards to client.
  - Client transforms final chunk text into Markdown AST, storing resulting `MarkdownBlock[]` inside the answer message.

## API Design
**How do components communicate?**

- External API: Codex LLM endpoint (exact URL TBD) that supports streaming responses and reasoning metadata. Requires secret token from `.env`.
- Internal API:
  - `POST /api/llm/session` (REST): start conversation, returns sessionId + initial response (optional).
  - `POST /api/llm/send` (REST) → upgrades to WebSocket/SSE stream for the actual response; request body `{ sessionId, prompt }`.
  - `GET /api/llm/history?sessionId=...` (optional) to reload conversation (MVP may omit).
- Streaming Response Format:
  ```json
  {
    "type": "thinking" | "answer" | "complete" | "error",
    "delta": "word fragment",
    "reasoning": "optional grey text",
    "remainingTimeMs": number
  }
  ```
- Auth: Require logged-in session cookie/JWT before issuing LLM requests. Server adds provider token from environment; client never sees it.

## Component Breakdown
**What are the major building blocks?**

- Frontend
  - `ChatPage` (layout + sticky reply form + gradient overlay).
  - `MessageList` with `UserBubble` (right) and `LLMBubble` (left).
  - `ThinkingIndicator` (animation, expandable reasoning text).
  - `MarkdownRenderer` (AST-based block renderer).
  - `ReplyForm` (auto-resize textarea, attachments, validation, Enter-to-send).
- Backend
  - `stream.controller.ts`: validates request, ensures session/auth, initiates streaming.
  - `stream.service.ts`: handles provider token injection, SSE/WebSocket processing, buffering reasoning vs answer chunks.
  - `markdown.service.ts` (optional) for server-side AST pre-processing if needed.
- No traditional database layer required; ephemeral session state can live in-memory or Redis if we later scale.
- Integrations: Codex LLM endpoint, Zeplin MCP for pulling measurements/assets during build.

## Design Decisions
**Why did we choose this approach?**

- Strict adherence to Zeplin spec ensures visual fidelity demanded in the task; deviating would fail evaluation.
- Streaming via WebSocket/SSE keeps the UI responsive and enables the “word-by-word” animation; polling would not satisfy UX requirements.
- Keeping provider token on the server avoids leaking secrets to the browser and aligns with requirement that `.env` stores access tokens.
- Markdown AST ensures flexible rendering and future extensibility (embedding, callouts) versus naive `dangerouslySetInnerHTML`.
- Trade-offs:
  - Building custom UI primitives increases effort but is required (no UI libraries allowed).
  - In-memory session state is simple but limits horizontal scaling; acceptable for evaluation environment.
- Patterns: clean separation (controller/service), typed DTOs with Zod, React streaming UI with state machines, minimal global state to keep components testable.

## Non-Functional Requirements
**How should the system perform?**

- Performance
  - Stream chunk latency <200 ms between provider and UI; reasoning indicator should appear within 100 ms of request start.
  - Markdown parsing should be lazy per message to avoid blocking the main thread; consider Web Worker if needed.
- Scalability
  - Design for single-session MVP but keep stream service stateless to allow future scaling (stick to SSE or WebSocket with shared adapter).
- Security
  - Access tokens stored server-side `.env`, never shipped to client.
  - Validate prompt payload length, sanitize attachments, enforce rate limits per user to prevent abuse.
- Reliability
  - Implement retry/backoff for streaming disconnections; allow user to resend prompt without page reload.
  - Provide meaningful error UI when provider is unavailable.

## Zeplin Tokens (`Rmo9weK`)
**Visual specs extracted from Zeplin**

- Colors
  - Canvas/hero: `#000000` base, hero panels `#0E0E0E`, ghost bubble `#1B1B1B`, borders `#191919`, meta text `#777777`, body text `#FFFFFF`.
  - Gradients: reply overlay uses `linear-gradient(180deg, rgba(0,0,0,0) 0%, #000000 77%)`.
- Typography
  - Primary typeface `Inter Variable` (400/500/600), `14px` body with `22px` line height, `16px` section headers, `12px` code snippets (JetBrains Mono).
  - Uppercase badges use tracking ~`0.3em`.
- Spacing & radii
  - Column width `600px`, vertical gap `30px`, bubble padding `12px 16px`, reply form padding `14px 16px`, bubble radius `15px`, container radius `16px`, hero wrap radius `32px`.
- Components
  - User bubble filled (`#1B1B1B`), LLM bubble transparent border; code blocks have `1px` `#191919` border + `16px` radius; tables use 80px column gaps.
  - Icons (paperclip, send, chevrons) match Zeplin exports; re-create via lucide or inline SVG with strokes `#777777` (secondary) or `#000000` (primary button).
- Assets
  - Reference Zeplin screen `Rmo9weK`; ensure any raster/vector exports (e.g., glyphs, gradient assets) come from that source to maintain fidelity.

