---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
---

# Requirements & Problem Understanding

## Problem Statement
**What problem are we solving?**

- CodeX’s trial task asks candidates to build a chat UI for an LLM with advanced behaviors (streaming, markdown parsing, “Thinking” state), but our current boilerplate has no such experience.
- Prospective users with accounts (reviewers, interviewers, contributors) need a faithful reference implementation that proves we can meet the assignment’s extended requirements.
- Today the repo only offers a generic boilerplate; candidates would have to start from scratch or rely on ad-hoc prototypes that don’t match the Zeplin spec or the Codex brief.

## Goals & Objectives
**What do we want to achieve?**

- Primary goals
  - Deliver a full-stack “LLM UI” experience that satisfies the extended requirements from the Codex brief (streaming, reasoning UI, markdown AST rendering, rich reply form).
  - Match the Zeplin design exactly using specs fetched through Zeplin MCP—no approximations.
  - Keep the experience gated to authenticated users; enforce token storage in `.env`.
- Secondary goals
  - Provide clean abstractions (LLM client, streaming parser, AST renderer) that other projects can reuse.
  - Document how to obtain the LLM token and run the UI locally so candidates can follow the same workflow.
- Non-goals
  - Supporting multiple LLM providers simultaneously—stick to the one described in the Codex task.
  - Building a generic chat history manager or persistence layer beyond what the assignment requires.
  - Introducing third-party UI libraries—the brief explicitly forbids them.

## User Stories & Use Cases
**How will users interact with the solution?**

- As a logged-in user, I want to send prompts to the LLM and see my messages on the right, so I can distinguish my input from the model’s replies.
- As a logged-in user, I want to see the LLM’s response stream word by word on the left, so I immediately know the model is replying and can follow along in real time.
- As a logged-in user, I want to see an animated “Thinking” indicator with expandable reasoning text before the final answer renders, so I understand the model is processing my request.
- As a logged-in user, I want to use the bottom reply form (auto-resize, submit on Enter) to continue the conversation, so interacting with the LLM feels fluid.
- As a logged-in user, I want the Markdown answer parsed into rich-content blocks (code, lists, links) so the response is easy to read and mirrors the Zeplin design.
- Edge considerations
  - Handle degraded network states (stream stalls, token refresh) gracefully with retry/backoff.
  - Enforce authenticated access only; if the token is missing/invalid, surface a clear error.

## Success Criteria
**How will we know when we're done?**

- Feature demo matches the Zeplin screen pixel-for-pixel (spacing, fonts, colors) and passes designer QA.
- Streaming responses animate smoothly (word-level reveal) with latency <200 ms per chunk under local conditions.
- “Thinking” section toggles correctly: visible during reasoning, hidden once final response starts, expandable on demand.
- Reply form supports auto-resize, Enter-to-send, validation, and optional attachments per brief.
- Markdown AST pipeline renders all block types specified in the assignment (paragraphs, lists, code blocks) without raw HTML leaks.
- Token stored only in `.env` variables; no secrets leak to repo or client bundle.

## Constraints & Assumptions
**What limitations do we need to work within?**

- Technical constraints
  - No prebuilt UI libraries; must implement from scratch using Tailwind/Shadcn primitives we already own.
  - Must support both client and server pieces: streaming endpoint, reasoning channel, markdown AST conversion.
  - Zeplin specs are the single source of truth for layout; measurements must align with exported values.
  - LLM provider token is issued as `user_pk_8d0ac3264ac1ac2b55b9a400101ade6ca575672ec503b320`; it must live only in `.env` (e.g., `LLM_API_TOKEN`) and never ship to the client bundle or repo history.
  - Provider integration follows the CodeX AI Proxy spec (`POST /stream`, NDJSON events, `x-api-key` header) documented at [slaveeks/ai-proxy](https://github.com/slaveeks/ai-proxy); requests without `Accept: application/x-ndjson` will fail with `406`.
- Business constraints
  - Solution acts as a hiring task showcase, so the UX must demonstrate polish and best practices (animations, transitions).
- Time/budget constraints
  - Need to deliver ahead of the Codex deadline (30 Nov 2025, 19:00 MSK) to allow for review iterations.
- Assumptions
  - MCP Zeplin plugin is available to extract measurements and assets.
  - LLM provider exposes a streaming endpoint + reasoning metadata similar to the assignment’s expectations.
  - Users already have credentials; authentication flow itself is out of scope.

## Questions & Open Items
**What do we still need to clarify?**

- Confirm exact API contract for the LLM streaming endpoint and the “Thinking” metadata shape.
- Clarify whether we need to persist chat history across reloads or only maintain in-memory session.
- Determine acceptable fallback when streaming fails—should we buffer the full response and render at once?
- Verify attachment requirements (file types, size limits) for the enhanced reply form.
- Ensure Zeplin assets (icons, gradients) are exportable without licensing issues.

