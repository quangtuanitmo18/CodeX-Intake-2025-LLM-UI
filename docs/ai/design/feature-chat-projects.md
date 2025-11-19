---
phase: design
title: System Design & Architecture
description: Define the technical architecture, components, and data models
---

# System Design & Architecture

## Architecture Overview
**What is the high-level system structure?**

- New `Project` entity sits between Account and Conversation. Frontend fetches projects, then nested conversations.
- Backend adds project-aware routes (CRUD + conversation scoping) and enforces account ownership.
- Updated flow:
  ```mermaid
  graph TD
    UserUI[LLM UI Client] -->|REST/React Query| ProjectAPI
    ProjectAPI -->|Prisma| DB[(SQLite)]
    ProjectAPI --> ConversationAPI
    ConversationAPI --> DB
    UserUI --> ConversationAPI
  ```
- Tech stack stays Next.js + Fastify/Prisma; we extend existing modules instead of new services.

## Data Models
**What data do we need to manage?**

- Add `Project` table:
  - `id (cuid)`, `accountId (fk)`, `name`, `description?`, `lastOpenedAt`, timestamps, soft-delete.
- Update `Conversation`:
  - Add nullable `projectId` FK, indexed with `accountId`.
  - Migration script sets `projectId` to a default “General” project per account.
- Data flow: Account → Projects (1:N) → Conversations (1:N) → Messages.

## API Design
**How do components communicate?**

- REST endpoints (Fastify) under `/projects`:
  - `GET /projects`: list projects for account with summary counts.
  - `POST /projects`: create project `{ name, description? }`.
  - `PATCH /projects/:id`: rename/update metadata.
  - `DELETE /projects/:id`: soft delete + cascade policy.
  - `POST /projects/:id/conversations`: create conversation within project.
- Update conversations endpoints to accept optional `projectId` for moving chats.
- Auth: reuse existing JWT middleware; ensure accountId from token matches project owner.

## Component Breakdown
**What are the major building blocks?**

- Frontend:
  - `ProjectSidebar` (list projects, create button, counts).
  - `ProjectDetailPage` (shows nested `ConversationSidebar` filtered by project).
  - Modal/dialog for rename/delete, move chat action in conversation menu.
- Backend:
  - `projects.controller`, `projects.repository`, Prisma service layer.
  - Extend `conversation` repo/service to handle optional `projectId`.
- Database: SQLite via Prisma migration adding `Project` model, indexes on `(accountId, updatedAt)`.
- No new third-party integrations.

## Design Decisions
**Why did we choose this approach?**

- Introduce first-class `Project` entity instead of tagging conversations because it better models nested navigation and future metadata.
- Keep single database to avoid cross-database joins; complexity is manageable with Prisma relations.
- Use soft-delete for projects to allow undo/migrations.
- Defer collaboration features to avoid scope creep.

## Non-Functional Requirements
**How should the system perform?**

- List/CRUD endpoints must respond within 200ms p95 for ≤100 projects per user.
- Conversation queries scoped by project must use indexed columns to avoid slowing existing chat list.
- Authorization: every project operation verifies the resource belongs to `accountId` from JWT.
- Reliability: deleting a project must either cascade within a transaction or abort entirely; no partial states.
- Ensure migrations are idempotent and can backfill “General” projects without downtime (run before deploy).


