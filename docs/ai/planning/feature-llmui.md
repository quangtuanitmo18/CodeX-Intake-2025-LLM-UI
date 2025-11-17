---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
---

# Project Planning & Task Breakdown

## Milestones
**What are the major checkpoints?**

- [ ] Milestone 1: Establish Zeplin-driven UI scaffolding + authenticated routing (week 1).
- [ ] Milestone 2: Implement streaming pipeline (server + client), “Thinking” indicator, and Markdown AST renderer (week 2).
- [ ] Milestone 3: Polish reply form, attachments, error handling, and finalize documentation/tests before Codex deadline (week 3).

## Task Breakdown
**What specific work needs to be done?**

### Phase 1: Foundation
- [x] Task 1.1: Integrate Zeplin MCP to pull measurements/assets; document color/spacing tokens. _(Tokens captured manually from Zeplin screen Rmo9weK due to MCP outage.)_
- [x] Task 1.2: Create chat layout (message list, sticky reply form, gradient overlay) with placeholder data. _(`/llm` route renders `LLMPreview` with Zeplin-accurate placeholder transcript + composer.)_
- [x] Task 1.3: Add auth guard for `llmui` route so only logged-in users access the experience. _(Middleware now protects `/llm`, `/dashboard`, `/settings` and redirects unauthenticated visitors to `/login`.)_

### Phase 2: Core Features
- [x] Task 2.1: Build Fastify streaming endpoint (token injection, SSE/WebSocket support, reasoning metadata). _(`/llm/stream` SSE route proxies to provider via `LLM_API_URL` using `LLM_API_TOKEN`.)_
- [x] Task 2.2: Implement client stream manager with word-by-word animation + “Thinking” indicator. _(`useLLMStream` hook consumes `/llm/stream`, updates transcript, and powers live thinking drawer in `LLMPreview`.)_
- [x] Task 2.3: Wire Markdown AST parser + renderer for LLM responses. _(`lib/markdown.ts` builds AST via remark/unified; `LLMPreview` renders typed blocks/inlines to match the Zeplin spec.)_
- [x] Task 2.4: Enhance reply form (auto-resize, Enter submission, validation, attachments placeholder). _Composer now enforces min length, exposes attachment chips + helper text, and shows the Zeplin gradient overlay when the transcript scrolls._

### Phase 3: Integration & Polish
- [ ] Task 3.1: Add error states, retries, and UX polish (shimmers, transitions).
- [ ] Task 3.2: Write documentation (README instructions, env setup, Zeplin references) + update AI devkit docs.
- [ ] Task 3.3: Create automated tests (unit for parser, integration for streaming service) and manual QA checklist.

## Dependencies
**What needs to happen in what order?**

- Task dependencies:
  - Zeplin specs (Task 1.1) must be imported before UI build-out.
  - Streaming backend (Task 2.1) must be ready before front-end stream manager (Task 2.2) can be fully tested.
  - Markdown renderer (Task 2.3) relies on finalized chunk format from Task 2.1.
- External dependencies:
  - LLM provider token + API endpoint from Codex chat.
  - Zeplin MCP credentials.
- Team/resources:
  - Designer review for visual polish.
  - DevOps support if we need staging env with SSE/WebSocket enabled.

## Timeline & Estimates
**When will things be done?**

- Phase 1: ~3 days (Zeplin integration + layout).
- Phase 2: ~6 days (backend streaming 3d, frontend streaming 2d, markdown AST 1d).
- Phase 3: ~3 days (polish, docs, tests).
- Buffer: 2 days for unforeseen LLM API issues.
- Milestones spaced weekly leading up to 30 Nov 2025 deadline.

## Risks & Mitigation
**What could go wrong?**

- Technical:
  - LLM provider may not expose the exact reasoning metadata described; mitigate by mocking/stubbing and adapting UI.
  - Streaming over certain browsers may fail—fallback to chunked fetch.
- Resource:
  - Limited engineering bandwidth; mitigate by parallelizing backend/frontend streams after contract finalization.
- Dependency:
  - Zeplin MCP outage would delay spec updates—download offline assets as backup.
- Mitigation:
  - Build feature flags to disable advanced behaviors if provider throttles.
  - Schedule early review with stakeholders to catch design deviations.

## Resources Needed
**What do we need to succeed?**

- Team: 1 FE engineer, 1 BE engineer, 1 designer for Zeplin QA.
- Tools/services: Zeplin MCP, Codex LLM API/token access, local SSE/WebSocket-friendly dev environment.
- Infrastructure: Secure storage for `.env`, optional Redis/pubsub if streaming load grows (not MVP).
- Documentation: Codex article, Zeplin spec link, API contract docs, runbooks for streaming.

