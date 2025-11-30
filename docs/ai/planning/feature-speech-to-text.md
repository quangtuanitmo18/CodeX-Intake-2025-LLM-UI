---
phase: planning
title: Project Planning - Realtime Speech-to-Text với Deepgram
description: Task breakdown và implementation timeline
---

# Project Planning: Realtime Speech-to-Text với Deepgram

## Milestones

**Major Checkpoints:**

- [ ] **Milestone 1: Backend WebSocket Infrastructure** (Week 1, Days 1-3)
  - Fastify WebSocket setup
  - Deepgram WebSocket client integration
  - Basic proxy functionality

- [ ] **Milestone 2: Frontend Audio Capture** (Week 1, Days 4-5)
  - MediaRecorder integration
  - WebSocket client setup
  - Basic UI components

- [ ] **Milestone 3: Integration & Polish** (Week 2, Days 1-3)
  - ChatComposer integration
  - Error handling
  - Language selector
  - Testing & bug fixes

- [ ] **Milestone 4: Testing & Documentation** (Week 2, Days 4-5)
  - Unit tests
  - Integration tests
  - Manual testing
  - Documentation updates

## Task Breakdown

### Phase 1: Backend Foundation

#### Task 1.1: Install Dependencies

- [ ] Install `@fastify/websocket` package
- [ ] Add `DEEPGRAM_API_KEY` to config schema
- [ ] Update `.env` files với API key
- **Estimate:** 30 minutes
- **Dependencies:** None

#### Task 1.2: Create Speech Service

- [ ] Create `server/src/services/speech.service.ts`
- [ ] Implement Deepgram WebSocket client factory
- [ ] Handle connection lifecycle
- [ ] Error handling
- **Estimate:** 2 hours
- **Dependencies:** Task 1.1

#### Task 1.3: Create Speech Controller

- [ ] Create `server/src/controllers/speech.controller.ts`
- [ ] Implement WebSocket connection handler
- [ ] Proxy binary messages (audio chunks) to Deepgram
- [ ] Proxy JSON messages (control messages) to Deepgram
- [ ] Forward Deepgram responses to client
- [ ] Handle authentication
- **Estimate:** 3 hours
- **Dependencies:** Task 1.2

#### Task 1.4: Create Speech Route

- [ ] Create `server/src/routes/speech.route.ts`
- [ ] Register WebSocket route `/speech/stream`
- [ ] Add authentication middleware
- [ ] Register route in `server/src/index.ts`
- **Estimate:** 1 hour
- **Dependencies:** Task 1.3

#### Task 1.5: Create Schema Validation

- [ ] Create `server/src/schemaValidations/speech.schema.ts`
- [ ] Define control message schemas
- [ ] Define WebSocket query parameter schemas (language, model)
- **Estimate:** 1 hour
- **Dependencies:** None

### Phase 2: Frontend Audio Capture

#### Task 2.1: Install Frontend Dependencies

- [ ] Check if WebSocket API cần polyfill (không cần, browser native)
- [ ] Verify MediaRecorder support
- **Estimate:** 15 minutes
- **Dependencies:** None

#### Task 2.2: Create useSpeechToText Hook

- [ ] Create `client/src/hooks/useSpeechToText.ts`
- [ ] Implement WebSocket connection management
- [ ] Implement MediaRecorder lifecycle
- [ ] Handle audio chunk streaming (100-250ms timeslice)
- [ ] Process Deepgram messages (Results, Metadata, UtteranceEnd)
- [ ] State management (isRecording, transcript, error)
- [ ] Cleanup on unmount
- **Estimate:** 4 hours
- **Dependencies:** Task 1.4

#### Task 2.3: Create MicrophoneButton Component

- [ ] Create `client/src/components/speech/microphone-button.tsx`
- [ ] Toggle button UI
- [ ] Visual feedback (pulse animation khi recording)
- [ ] Disabled states
- [ ] Integration với useSpeechToText hook
- **Estimate:** 2 hours
- **Dependencies:** Task 2.2

#### Task 2.4: Create LanguageSelector Component

- [ ] Create `client/src/components/speech/language-selector.tsx`
- [ ] Dropdown với options: Vietnamese, English, Russian
- [ ] Persist selection (localStorage)
- [ ] Pass language to WebSocket connection
- **Estimate:** 1.5 hours
- **Dependencies:** Task 2.2

### Phase 3: ChatComposer Integration

#### Task 3.1: Integrate MicrophoneButton vào ChatComposer

- [ ] Modify `client/src/pageSections/llm/chat-composer.tsx`
- [ ] Add MicrophoneButton component
- [ ] Position button next to Attach button
- [ ] Handle transcript updates
- [ ] Auto-fill input với final transcript
- **Estimate:** 2 hours
- **Dependencies:** Task 2.3, Task 2.4

#### Task 3.2: Transcript Preview (Optional Enhancement)

- [ ] Decide: Show transcript in input field or separate preview area
- [ ] Implement chosen approach
- [ ] Visual distinction giữa interim và final transcript
- **Estimate:** 1.5 hours (if needed)
- **Dependencies:** Task 3.1

### Phase 4: Error Handling & Edge Cases

#### Task 4.1: Microphone Permission Handling

- [ ] Handle permission denied
- [ ] Show user-friendly error message
- [ ] Provide retry mechanism
- **Estimate:** 1 hour
- **Dependencies:** Task 2.2

#### Task 4.2: WebSocket Error Handling

- [ ] Handle connection errors
- [ ] Auto-reconnect với exponential backoff
- [ ] Show error messages to user
- [ ] Graceful degradation
- **Estimate:** 2 hours
- **Dependencies:** Task 2.2

#### Task 4.3: Deepgram API Error Handling

- [ ] Handle Deepgram errors
- [ ] Forward error messages to client
- [ ] Show user-friendly error messages
- [ ] Retry mechanism
- **Estimate:** 1.5 hours
- **Dependencies:** Task 1.3

#### Task 4.4: Browser Compatibility

- [ ] Check MediaRecorder support
- [ ] Check WebSocket support
- [ ] Add fallback messages cho unsupported browsers
- **Estimate:** 1 hour
- **Dependencies:** Task 2.2

### Phase 5: Testing

#### Task 5.1: Unit Tests - Backend

- [ ] Test speech.service.ts
- [ ] Test speech.controller.ts WebSocket handling
- [ ] Test message proxying logic
- **Estimate:** 3 hours
- **Dependencies:** Phase 1 complete

#### Task 5.2: Unit Tests - Frontend

- [ ] Test useSpeechToText hook
- [ ] Test MicrophoneButton component
- [ ] Test LanguageSelector component
- **Estimate:** 3 hours
- **Dependencies:** Phase 2 complete

#### Task 5.3: Integration Tests

- [ ] Test full flow: Browser → Fastify → Deepgram → Browser
- [ ] Test error scenarios
- [ ] Test reconnection
- **Estimate:** 2 hours
- **Dependencies:** Phase 3 complete

#### Task 5.4: Manual Testing

- [ ] Test với tiếng Việt
- [ ] Test với tiếng Anh
- [ ] Test với tiếng Nga
- [ ] Test error scenarios
- [ ] Test trên different browsers
- **Estimate:** 2 hours
- **Dependencies:** Phase 4 complete

### Phase 6: Documentation & Polish

#### Task 6.1: Update Implementation Docs

- [ ] Document code structure
- [ ] Document WebSocket protocol
- [ ] Document error handling
- **Estimate:** 1 hour
- **Dependencies:** Implementation complete

#### Task 6.2: Update Testing Docs

- [ ] Document test cases
- [ ] Document manual testing checklist
- [ ] Document known issues
- **Estimate:** 1 hour
- **Dependencies:** Task 5.4

## Dependencies

**Task Dependencies:**

- Phase 1 (Backend) must complete before Phase 2 (Frontend) can start
- Phase 2 must complete before Phase 3 (Integration)
- Phase 3 must complete before Phase 4 (Error Handling)
- All phases must complete before Phase 5 (Testing)

**External Dependencies:**

- Deepgram API availability
- Deepgram API key: `11529f83c1605e74c780174d664677fbb61ebd3d`
- Browser support for MediaRecorder and WebSocket

**Team/Resource Dependencies:**

- Access to Deepgram API
- Test microphone devices
- Test với different languages (Vietnamese, English, Russian speakers)

## Timeline & Estimates

**Estimated Effort:**

- **Phase 1 (Backend):** ~7.5 hours
- **Phase 2 (Frontend):** ~7.75 hours
- **Phase 3 (Integration):** ~3.5 hours
- **Phase 4 (Error Handling):** ~5.5 hours
- **Phase 5 (Testing):** ~10 hours
- **Phase 6 (Documentation):** ~2 hours

**Total Estimated Effort:** ~36.25 hours (~4.5 days)

**Target Dates:**

- **Week 1, Day 1-3:** Phase 1 (Backend Foundation)
- **Week 1, Day 4-5:** Phase 2 (Frontend Audio Capture)
- **Week 2, Day 1-2:** Phase 3 (Integration) + Phase 4 (Error Handling)
- **Week 2, Day 3:** Phase 4 completion
- **Week 2, Day 4:** Phase 5 (Testing)
- **Week 2, Day 5:** Phase 6 (Documentation) + Final polish

**Buffer for Unknowns:** +20% (~7 hours) = **Total: ~43 hours (~5.5 days)**

## Risks & Mitigation

**Technical Risks:**

1. **Risk:** Deepgram WebSocket API complexity
   - **Mitigation:** Read documentation thoroughly, test với simple examples first
   - **Contingency:** Fallback to REST API nếu WebSocket quá phức tạp

2. **Risk:** Browser compatibility issues
   - **Mitigation:** Test early trên multiple browsers
   - **Contingency:** Polyfills hoặc feature detection với fallback

3. **Risk:** Latency cao hơn expected
   - **Mitigation:** Optimize chunk size, test với different timeslice values
   - **Contingency:** Accept higher latency hoặc optimize further

4. **Risk:** Deepgram API rate limits
   - **Mitigation:** Monitor usage, implement rate limiting nếu cần
   - **Contingency:** Queue requests hoặc show user message

**Resource Risks:**

1. **Risk:** Không có testers cho multiple languages
   - **Mitigation:** Test với online transcription samples
   - **Contingency:** Focus on Vietnamese first, add others later

**Dependency Risks:**

1. **Risk:** Deepgram API downtime
   - **Mitigation:** Implement graceful error handling
   - **Contingency:** Show user-friendly error, allow retry

## Resources Needed

**Team Members:**

- 1 Backend developer (Fastify, WebSocket)
- 1 Frontend developer (React, Next.js, WebSocket)
- 1 QA tester (manual testing, multiple languages)

**Tools and Services:**

- Deepgram API account với API key
- Test microphone devices
- Browser dev tools for debugging WebSocket
- Network monitoring tools

**Infrastructure:**

- Development server với WebSocket support
- Test environment với Deepgram access

**Documentation/Knowledge:**

- Deepgram WebSocket API documentation
- Fastify WebSocket plugin documentation
- MediaRecorder API documentation
- WebSocket API documentation
