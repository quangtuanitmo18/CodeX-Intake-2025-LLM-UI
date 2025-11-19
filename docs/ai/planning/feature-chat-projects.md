---
phase: planning
title: Project Planning & Task Breakdown
description: Break down work into actionable tasks and estimate timeline
---

# Project Planning & Task Breakdown

## Milestones
**What are the major checkpoints?**

- [x] Milestone 1: Schema + backend project CRUD ready (API + migrations)
- [ ] Milestone 2: Frontend navigation updates with project-aware chat creation
- [ ] Milestone 3: Data migration + polish (move chat, delete UX, docs/tests)

## Task Breakdown
**What specific work needs to be done?**

### Phase 1: Foundation
- [x] Task 1.1: Design DB schema, add Prisma model + migration for `Project` and `Conversation.projectId`. _status: schema updated, migration generated (`20251119_add_project_entity`)._
- [x] Task 1.2: Seed “General” project per account + backfill existing conversations. _status: added `server/scripts/backfill-projects.ts`, synced + executed via `npx ts-node`._
- [x] Task 1.3: Implement Fastify routes/controller/service/repo for project CRUD. _status: added project repo/service/controllers/routes + auth + delete reassignment, server build passes._

### Phase 2: Core Features
- [x] Task 2.1: Update client queries/hooks to fetch projects + project conversations. _status: added `projectApiRequest`, project schemas, React Query hooks, conversation create accepts `projectId`; client lint clean._
- [x] Task 2.2: Build project sidebar + detail view, integrate new conversation creation flow. _status: added `ProjectSidebar`, expanded `ConversationSidebar`, new project-aware routes (`/llm/projects/...`), selection + navigation wired to new URL structure._
- [x] Task 2.3: Add move chat UI/API to reassign conversations between projects. _status: backend exposes `PATCH /api/conversations/:id/project`, client UI adds per-chat move menu with project picker + routing sync._

### Phase 3: Integration & Polish
- [x] Task 3.1: Implement delete/rename dialogs, optimistic updates, empty states. _status: conversation menu now offers toast-backed rename/move/delete with inline confirmations, project sidebar shows CTA empty state._
- [ ] Task 3.2: Update tests (unit, integration, E2E) + documentation.
- [ ] Task 3.3: Conduct manual QA + migration rehearsal.

## Dependencies
**What needs to happen in what order?**

- Schema + migrations must land before backend routes (Task 1.1 precedes 1.3).
- Backend project CRUD must exist before frontend integration (Phase 2).
- Move chat feature depends on both new API endpoint and updated UI components.
- No external API dependencies; relies on existing auth/account modules.

## Timeline & Estimates
**When will things be done?**

- Phase 1: ~2 days (schema + API)
- Phase 2: ~3 days (UI/UX + hooks)
- Phase 3: ~2 days (polish, migration rehearsal, tests)
- Buffer: 1 day for migration issues or UX adjustments

## Risks & Mitigation
**What could go wrong?**

- Migration risk: incorrect backfill might orphan chats → rehearse locally with snapshot DB before prod.
- UX complexity: nested navigation could confuse users → add onboarding tooltip and “General” default.
- Performance: loading all conversations per project might be heavy → paginate conversations per project (reuse limit/offset).
- Scope creep: collaboration features requested mid-way → document as future work, stay focused on single-user MVP.

## Resources Needed
**What do we need to succeed?**

- 1 FE + 1 BE dev (same as current team), plus reviewer for schema migration.
- Existing tooling: Prisma, Fastify, Next.js, React Query.
- Need Zeplin references if new UI screens exist; otherwise reuse chat UI styles.
- Documentation updates in AI devkit folders + migration runbook.


