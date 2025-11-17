---
phase: requirements
title: Requirements & Problem Understanding
description: Clarify the problem space, gather requirements, and define success criteria
---

# Requirements & Problem Understanding

## Problem Statement
**What problem are we solving?**

- Users currently cannot view or revisit previous conversations after page reload; all chat context is lost when the browser refreshes.
- There is no way to manage multiple distinct conversations—users must start from scratch every time, losing context and productivity.
- Users cannot attach files (images, PDFs, documents) to their messages, limiting the types of questions they can ask the LLM (e.g., "analyze this chart" or "review this document").
- Authenticated users expect persistent chat history similar to ChatGPT, Claude, or other modern LLM interfaces, but the current implementation only supports ephemeral in-memory sessions.

## Goals & Objectives
**What do we want to achieve?**

- Primary goals
  - Enable authenticated users to create, save, and manage multiple conversations with persistent storage in the database.
  - Allow users to view a list of all their previous conversations, ordered by most recent activity, with auto-generated or custom titles.
  - Support file attachments (images, PDFs, text files) on user messages with proper storage, validation, and metadata tracking.
  - Provide search/filter capabilities across conversation history so users can quickly find past discussions.
  - Implement soft delete for conversations, allowing users to remove old chats without permanent data loss.
  - Auto-generate conversation titles from the first user prompt for better UX.
- Secondary goals
  - Export conversations to JSON or Markdown format for archival or external processing.
  - Track metadata per conversation (model used, token counts, creation/update timestamps).
  - Lay groundwork for future features like conversation sharing, tagging, or folders.
- Non-goals (what's explicitly out of scope)
  - Real-time collaboration (multiple users editing the same conversation).
  - Integration with cloud storage providers (S3, GCS) for attachments—local uploads folder is sufficient for MVP.
  - Conversation limits per user (unlimited for now; can revisit if abuse occurs).
  - Advanced search (semantic search, full-text indexing)—basic title/content filtering is enough.

## User Stories & Use Cases
**How will users interact with the solution?**

- As a logged-in user, I want to see a sidebar or page listing all my previous conversations (sorted by most recent) so I can quickly resume or review past discussions.
- As a logged-in user, I want to click on a conversation from the list and load all its messages in the chat UI so I can continue where I left off.
- As a logged-in user, I want to create a new conversation with one click so I can start fresh without losing my current chat.
- As a logged-in user, I want the system to auto-generate a conversation title from my first message so I don't have to manually name every chat.
- As a logged-in user, I want to edit the conversation title to something more meaningful if the auto-generated one isn't helpful.
- As a logged-in user, I want to attach files (images, PDFs, text documents) to my messages so I can ask the LLM to analyze or reference them.
- As a logged-in user, I want to see thumbnails or file names for my attachments inline with the message so I know what I uploaded.
- As a logged-in user, I want to delete a conversation I no longer need, with the option to restore it later (soft delete).
- As a logged-in user, I want to search my conversation history by title or content so I can find specific discussions quickly.
- As a logged-in user, I want to export a conversation to JSON or Markdown format for backup or sharing outside the app.
- Edge cases to consider:
  - What happens if a user uploads a file larger than 10MB? (Reject with clear error message.)
  - What if the user tries to upload an unsupported file type? (Validate and show allowed types.)
  - What if the user has hundreds of conversations? (Pagination or infinite scroll in the sidebar.)
  - What if a conversation title auto-generation fails (e.g., first message is empty or too short)? (Fallback to "New Conversation" + timestamp.)
  - What if the user tries to access a conversation they don't own? (403 Forbidden.)

## Success Criteria
**How will we know when we're done?**

- Users can create a new conversation and see it appear in the conversation list immediately with an auto-generated title.
- Users can click a conversation from the list and all messages (user + assistant + reasoning) load correctly in chronological order.
- Users can upload files (images, PDFs, text up to 10MB) to a message, and the file is stored in the local uploads folder with proper validation.
- Attached files display inline with the message (thumbnail for images, file name/icon for documents).
- Users can edit conversation titles, and the change persists across page reloads.
- Users can soft-delete a conversation, and it disappears from the main list (but remains recoverable via database query or future "trash" feature).
- Users can search conversations by title or message content, and results filter in real-time.
- Users can export a conversation to JSON (structured data) or Markdown (human-readable) format, and the download triggers successfully.
- The conversation list paginates or lazy-loads when the user has more than 20 conversations to prevent performance issues.
- All features work only for authenticated users; unauthenticated requests return 401 Unauthorized.
- Performance: Loading a conversation with 50 messages takes <500ms; uploading a 5MB file completes in <2s on local network.

## Constraints & Assumptions
**What limitations do we need to work within?**

- Technical constraints
  - Database: SQLite (via Prisma) for MVP; schema must support efficient queries for conversation lists and message history.
  - File storage: Local uploads folder (configured via `UPLOAD_FOLDER` env var); no cloud storage integration for now.
  - File size limit: 10MB per attachment to prevent abuse and storage bloat.
  - Supported file types: Images (png, jpg, jpeg, gif, webp), PDFs (pdf), Text files (txt, md, json, csv).
  - Must integrate with existing auth system (`Account` model, JWT/session cookies).
  - Must coexist with the current in-memory streaming feature (llm-ui) without breaking it.
- Business constraints
  - Feature should feel familiar to users of ChatGPT, Claude, or similar tools (match UX patterns where possible).
  - Must not degrade performance of the existing LLM streaming feature.
  - Must remain GDPR-friendly: users can delete their data (soft delete + hard delete option for compliance).
- Time/budget constraints
  - Target delivery: 2 weeks for MVP (design, implementation, testing).
  - Phase 1 (core persistence) should be usable within 1 week to unblock LLM UI enhancements.
- Assumptions
  - Users have valid accounts and are authenticated via the existing auth flow.
  - The existing media upload API (`/media/upload`) can be reused or adapted for message attachments.
  - The LLM streaming endpoint (`/llm/stream`) can be extended to accept `conversationId` and store messages after streaming completes.
  - Conversation titles averaging ~50 characters won't cause UI overflow (truncate with ellipsis if needed).
  - SQLite performance is sufficient for <1000 conversations per user; revisit if usage scales beyond that.

## Questions & Open Items
**What do we still need to clarify?**

- Should we support editing or deleting individual messages within a conversation, or only the entire conversation? (Decision: Start with conversation-level delete only; message editing can be Phase 2.)
- Should attachments be scanned for malware or validated beyond MIME type? (Decision: MIME type + size check for MVP; malware scanning is future enhancement.)
- Do we need a "starred" or "pinned" conversations feature? (Decision: Not in MVP; can add later.)
- Should we display token counts or cost estimates per conversation? (Decision: Store in metadata but don't surface in UI for MVP.)
- What happens to attachments when a conversation is hard-deleted? (Decision: Cascade delete files from uploads folder to free disk space.)
- Should we support conversation folders/tags for organization? (Decision: Out of scope for MVP; single flat list is fine.)
- Do we need a "trash" view for soft-deleted conversations? (Decision: Not in MVP UI, but keep `deletedAt` field for potential future restore feature.)
- Should we rate-limit conversation creation to prevent spam? (Decision: Not in MVP; rely on general API rate limiting.)
