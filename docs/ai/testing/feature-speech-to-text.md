---
phase: testing
title: Testing Strategy - Realtime Speech-to-Text với Deepgram
description: Test cases và quality assurance
---

# Testing Strategy: Realtime Speech-to-Text với Deepgram

## Test Coverage Goals

**Target Coverage:**

- Unit test coverage: **100%** của new/changed code
- Integration test scope: Critical paths + error handling
- End-to-end test scenarios: Key user journeys
- Manual testing: All languages và browsers

## Unit Tests

### Component: speech.service.ts

- [ ] **Test case 1:** `createDeepgramConnection` creates connection với correct parameters
  - Covers: Connection creation, parameter passing
  - Assert: Connection object created, parameters set correctly

- [ ] **Test case 2:** `createDeepgramConnection` throws error nếu API key missing
  - Covers: Error handling khi config missing
  - Assert: Error thrown với message về missing API key

- [ ] **Test case 3:** `createDeepgramConnection` uses default language nếu không provided
  - Covers: Default parameter handling
  - Assert: Default language 'vi-VN' used

### Component: speech.controller.ts

- [ ] **Test case 1:** WebSocket connection handler accepts authenticated connections
  - Covers: Authentication validation
  - Assert: Connection accepted với valid JWT

- [ ] **Test case 2:** WebSocket connection handler rejects unauthenticated connections
  - Covers: Authentication rejection
  - Assert: Connection rejected với error code

- [ ] **Test case 3:** Binary messages (audio chunks) forwarded to Deepgram
  - Covers: Message proxying logic
  - Assert: Binary message sent to Deepgram connection

- [ ] **Test case 4:** JSON control messages processed correctly
  - Covers: Control message handling (Finalize, CloseStream)
  - Assert: Correct Deepgram methods called

- [ ] **Test case 5:** Deepgram messages forwarded to client
  - Covers: Response forwarding
  - Assert: Client receives Deepgram messages

- [ ] **Test case 6:** Error handling khi Deepgram connection fails
  - Covers: Error handling
  - Assert: Error message sent to client

- [ ] **Test case 7:** Cleanup on WebSocket close
  - Covers: Resource cleanup
  - Assert: Deepgram connection closed, resources freed

### Component: useSpeechToText Hook

- [ ] **Test case 1:** `start` function requests microphone permission
  - Covers: Permission request flow
  - Assert: `getUserMedia` called với audio: true

- [ ] **Test case 2:** `start` function creates MediaRecorder với correct options
  - Covers: MediaRecorder setup
  - Assert: MediaRecorder created với 250ms timeslice

- [ ] **Test case 3:** `start` function connects WebSocket với language parameter
  - Covers: WebSocket connection
  - Assert: WebSocket connected với correct URL và language

- [ ] **Test case 4:** Audio chunks sent via WebSocket khi available
  - Covers: Audio streaming
  - Assert: WebSocket.send called với audio data

- [ ] **Test case 5:** Deepgram messages processed và state updated
  - Covers: Message processing
  - Assert: Transcript state updated với correct values

- [ ] **Test case 6:** `stop` function cleans up resources
  - Covers: Cleanup logic
  - Assert: MediaRecorder stopped, stream tracks stopped, WebSocket closed

- [ ] **Test case 7:** Error handling khi permission denied
  - Covers: Permission error handling
  - Assert: Error state set, user-friendly message

- [ ] **Test case 8:** Error handling khi WebSocket connection fails
  - Covers: Connection error handling
  - Assert: Error state set, reconnection attempted

### Component: MicrophoneButton

- [ ] **Test case 1:** Button renders với correct initial state
  - Covers: Component rendering
  - Assert: Button visible, not recording state

- [ ] **Test case 2:** Click button starts recording
  - Covers: Start recording flow
  - Assert: `start` function called, button shows recording state

- [ ] **Test case 3:** Click button stops recording khi đang recording
  - Covers: Stop recording flow
  - Assert: `stop` function called, button shows idle state

- [ ] **Test case 4:** Button disabled khi error
  - Covers: Error state handling
  - Assert: Button disabled, error message shown

### Component: LanguageSelector

- [ ] **Test case 1:** Language selector renders với options
  - Covers: Component rendering
  - Assert: All language options visible

- [ ] **Test case 2:** Selecting language updates state
  - Covers: State management
  - Assert: Selected language stored, onChange called

- [ ] **Test case 3:** Language selection persisted trong localStorage
  - Covers: Persistence
  - Assert: Language saved to localStorage, restored on mount

## Integration Tests

- [ ] **Integration scenario 1:** Full flow - Browser → Fastify → Deepgram → Browser
  - Steps:
    1. Client connects WebSocket
    2. Client sends audio chunk
    3. Server forwards to Deepgram
    4. Deepgram returns transcript
    5. Server forwards to client
    6. Client displays transcript
  - Assert: Transcript appears trong UI với correct timing

- [ ] **Integration scenario 2:** Language selection affects transcription
  - Steps:
    1. Select Vietnamese language
    2. Speak Vietnamese
    3. Verify transcript accuracy
    4. Switch to English
    5. Speak English
    6. Verify transcript accuracy
  - Assert: Transcription accurate cho selected language

- [ ] **Integration scenario 3:** Error handling - Deepgram API unavailable
  - Steps:
    1. Simulate Deepgram API failure
    2. Client attempts connection
    3. Verify error message shown
    4. Verify retry mechanism
  - Assert: User sees error message, can retry

- [ ] **Integration scenario 4:** Reconnection after network drop
  - Steps:
    1. Start recording
    2. Simulate network drop
    3. Network restored
    4. Verify auto-reconnect
  - Assert: Connection restored, recording continues

- [ ] **Integration scenario 5:** Multiple concurrent connections
  - Steps:
    1. Open multiple browser tabs
    2. Start recording trong mỗi tab
    3. Verify all connections work
  - Assert: All connections stable, no conflicts

## End-to-End Tests

- [ ] **User flow 1:** Complete voice input flow
  - Steps:
    1. User opens chat
    2. User clicks microphone button
    3. User grants microphone permission
    4. User speaks Vietnamese sentence
    5. User sees realtime transcript
    6. User pauses (300ms)
    7. Transcript finalized
    8. User clicks send
    9. Message appears trong chat
  - Assert: Complete flow works, message sent correctly

- [ ] **User flow 2:** Language switching
  - Steps:
    1. User selects Vietnamese
    2. User speaks Vietnamese
    3. User switches to English
    4. User speaks English
    5. Verify both transcripts accurate
  - Assert: Language switching works, transcripts accurate

- [ ] **User flow 3:** Error recovery
  - Steps:
    1. User starts recording
    2. Network error occurs
    3. User sees error message
    4. User clicks retry
    5. Recording resumes
  - Assert: Error handled gracefully, user can recover

- [ ] **Critical path testing:**
  - [ ] Microphone permission flow
  - [ ] Recording start/stop
  - [ ] Transcript display
  - [ ] Message sending
  - [ ] Error handling

- [ ] **Regression testing:**
  - [ ] Existing chat functionality không bị ảnh hưởng
  - [ ] Text input vẫn hoạt động
  - [ ] File upload vẫn hoạt động
  - [ ] LLM streaming vẫn hoạt động

## Test Data

**Test Fixtures:**

- Mock WebSocket connections
- Mock MediaRecorder với sample audio data
- Mock Deepgram responses (Results, Metadata, UtteranceEnd)
- Sample audio files cho testing (Vietnamese, English, Russian)

**Seed Data:**

- Test users với different language preferences
- Test conversations để verify integration

**Test Database Setup:**

- Không cần database changes (WebSocket stateless)

## Test Reporting & Coverage

**Coverage Commands:**

```bash
# Backend
cd server
npm run test -- --coverage

# Frontend
cd client
npm run test -- --coverage
```

**Coverage Thresholds:**

- Statements: 100%
- Branches: 100%
- Functions: 100%
- Lines: 100%

**Coverage Gaps:**

- Document any gaps với rationale
- Example: Browser API mocks (MediaRecorder) - tested manually

## Manual Testing

**UI/UX Testing Checklist:**

- [ ] Microphone button visible và accessible
- [ ] Button state changes (idle → recording) clear
- [ ] Visual feedback khi recording (pulse animation)
- [ ] Transcript hiển thị realtime
- [ ] Final transcript distinct from interim
- [ ] Language selector easy to use
- [ ] Error messages clear và actionable
- [ ] Keyboard navigation works
- [ ] Screen reader announcements work

**Browser Compatibility:**

- [ ] Chrome/Edge (Chromium) - latest
- [ ] Firefox - latest
- [ ] Safari - latest (nếu supported)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

**Device Testing:**

- [ ] Desktop với external microphone
- [ ] Laptop với built-in microphone
- [ ] Mobile device
- [ ] Different microphone qualities

**Language Testing:**

- [ ] Vietnamese: Test với native speaker hoặc sample audio
- [ ] English: Test với native speaker hoặc sample audio
- [ ] Russian: Test với native speaker hoặc sample audio
- [ ] Mixed language (nếu supported)

**Smoke Tests After Deployment:**

- [ ] Microphone permission flow
- [ ] Recording start/stop
- [ ] Transcript display
- [ ] Message sending
- [ ] Error handling

## Performance Testing

**Load Testing Scenarios:**

- [ ] 10 concurrent WebSocket connections
- [ ] 50 concurrent WebSocket connections
- [ ] 100 concurrent WebSocket connections
- [ ] Monitor server resources (CPU, memory)
- [ ] Monitor Deepgram API usage

**Stress Testing:**

- [ ] Continuous recording for 10 minutes
- [ ] Rapid start/stop cycles
- [ ] Multiple language switches
- [ ] Network interruptions

**Performance Benchmarks:**

- Latency: < 500ms từ audio chunk đến interim result
- Memory: No leaks sau 10 minutes recording
- CPU: < 10% usage khi recording
- Network: Stable WebSocket connection

## Bug Tracking

**Issue Tracking Process:**

- Use GitHub Issues hoặc project management tool
- Tag với `speech-to-text` label
- Include: steps to reproduce, expected vs actual, browser/device info

**Bug Severity Levels:**

- **Critical:** Feature không hoạt động, blocks user
- **High:** Feature hoạt động nhưng có major issues
- **Medium:** Minor issues, workarounds available
- **Low:** Cosmetic issues, edge cases

**Regression Testing Strategy:**

- Run full test suite trước mỗi release
- Test critical paths manually
- Monitor production errors
