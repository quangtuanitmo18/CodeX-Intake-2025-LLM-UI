---
phase: implementation
title: Implementation Guide
description: Technical implementation notes, patterns, and code guidelines
---

# Implementation Guide

## Development Setup
**How do we get started?**

- Prerequisites
  - Node.js 18+, npm 10+, Prisma CLI, Docker (optional for Postgres).
  - Global tools: `ai-devkit` CLI (or run via npx), `turbo` if monorepo scripts depend on it.
- Environment
  - `cp .env.example .env` in both `client/` and `server/`, keeping only variables needed for baseline (e.g., `DATABASE_URL`, `NEXT_PUBLIC_API_BASE`).
  - Run `npm install` inside each package (or root if using workspaces).
  - Initialize database: `cd server && npx prisma migrate dev --name init-boilerplate`.
- Instrumentation
- Monitoring/analytics hooks are optional; leave blank or remove configs if not needed.

## Code Structure
**How is the code organized?**

- `client/`
  - `app/` (root layout, sample page, API route handlers if needed).
  - `components/ui/` (Shadcn-based primitives) kept minimal with comments on how to extend.
  - `lib/` for helpers (`api-client.ts`, `config.ts`).
  - `styles/` for Tailwind/index styles.
- `server/`
  - `src/index.ts` entrypoint wiring express app.
  - `src/routes/health.ts`, `src/routes/sample.ts` demonstrating routing.
  - `src/controllers/`, `src/services/`, `src/repositories/` each containing placeholder implementations.
  - `prisma/` for schema and migrations.
- Naming conventions
  - Kebab-case for files, PascalCase for components/classes, consistent `*.controller.ts` / `*.service.ts`.

## Implementation Notes
**Key technical details to remember:**

### Core Features
- Boilerplate cleanup: remove feature-specific modules, ensure imports updated, leave TODO comments where features can plug in.
- Sample API: controller returns static data or Prisma query; ensure response envelope aligned with `ApiResponse<T>` type.
- Sample page: fetches from API helper, displays status + data, demonstrates error boundary.

### Patterns & Best Practices
- Layered architecture (controller → service → repository) even when service is thin to demonstrate pattern.
- Centralized error handler middleware logging via `pino`/`winston`.
- Use `zod` or similar for request validation, even with placeholder schemas.
- Keep comments focused on extension points (“Add new module here...”).

## Integration Points
**How do pieces connect?**

- Client fetches backend via `NEXT_PUBLIC_API_BASE`; local proxy via Next.js rewrites optional.
- Server uses Prisma to talk to configured database (SQLite by default for easiest bootstrapping).
- Instrumentation files were removed in this fork; bring your own observability hook if required.
- Document how to add additional third-party SDKs (Auth, storage) but leave them out of core bundle.

## Error Handling
**How do we handle failures?**

- Express error middleware standardizes `{ status, message, details }`.
- Client hooks display toast/banner for fetch failures; fallback UI ensures app still renders.
- Logging via console or lightweight logger; ensure logger dependency remains even in boilerplate for future use.
- Retries delegated to caller (e.g., `useSWR` or fetch wrapper) but sample code can include single retry example.

## Performance Considerations
**How do we keep it fast?**

- Keep dependencies minimal to reduce bundle size; remove unused UI frameworks.
- Use static generation (Next.js) for sample page, while demonstrating how to opt into SSR.
- Ensure sample queries include indexes (if using Postgres) even if dataset tiny.
- Document caching extension points (e.g., `lib/cache.ts`) but keep disabled by default.

## Security Notes
**What security measures are in place?**

- Auth middleware stub ensures future features can hook into JWT/session; default implementation allows all requests but logs TODO.
- Input validation via `zod` ensures even placeholder endpoints demonstrate safe patterns.
- Secrets stored in `.env`; provide `.env.example` with placeholders, instruct users not to commit actual secrets.
- HTTPS termination handled by hosting platform; document expectation to run behind reverse proxy in production.

