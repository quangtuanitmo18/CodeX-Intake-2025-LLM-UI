---
phase: requirements
title: Realtime Speech-to-Text với Deepgram
description: Chức năng chuyển giọng nói thành văn bản realtime sử dụng Deepgram WebSocket API
---

# Requirements: Realtime Speech-to-Text với Deepgram

## Problem Statement

**Vấn đề cần giải quyết:**

- Người dùng muốn nhập tin nhắn bằng giọng nói thay vì gõ phím trong chat LLM
- Cần hiển thị caption realtime khi đang nói (như YouTube live caption)
- Cần hỗ trợ đa ngôn ngữ (tiếng Việt, tiếng Anh, tiếng Nga)
- API key Deepgram không được lộ ra client (security requirement)

**Ai bị ảnh hưởng:**

- Người dùng chat LLM muốn tương tác bằng giọng nói
- Người dùng đa ngôn ngữ cần nhập bằng tiếng mẹ đẻ

**Tình trạng hiện tại:**

- Chỉ có input text thông thường
- Không có chức năng voice input

## Goals & Objectives

**Mục tiêu chính:**

- ✅ Tích hợp Deepgram WebSocket API để chuyển giọng nói thành văn bản realtime
- ✅ Hiển thị transcript realtime (interim results) khi đang nói
- ✅ Tự động chốt câu khi người dùng ngừng nói (endpointing)
- ✅ Hỗ trợ đa ngôn ngữ (vi-VN, en-US, ru-RU)
- ✅ Bảo mật API key (backend proxy, không lộ ra client)
- ✅ Độ trễ thấp (< 500ms cho interim results)

**Mục tiêu phụ:**

- UI/UX mượt mà với visual feedback khi đang ghi âm
- Tích hợp vào ChatComposer hiện có
- Hỗ trợ bật/tắt microphone

**Non-goals (không nằm trong scope):**

- ❌ Text-to-Speech (chỉ làm Speech-to-Text)
- ❌ Lưu trữ audio files
- ❌ Transcription của file audio có sẵn (chỉ realtime streaming)
- ❌ Voice commands/control

## User Stories & Use Cases

**User Stories:**

1. **US-1: Bật microphone và nói**
   - As a user, I want to click microphone button to start recording
   - So that I can input messages by voice instead of typing
   - Acceptance: Click button → mic permission → start recording → see realtime transcript

2. **US-2: Xem transcript realtime**
   - As a user, I want to see my speech converted to text in real-time
   - So that I know what is being transcribed before finalizing
   - Acceptance: See interim transcript updating as I speak

3. **US-3: Chốt câu tự động**
   - As a user, I want the system to automatically finalize a sentence when I pause
   - So that I don't need to manually stop recording for each sentence
   - Acceptance: After 300ms pause → transcript finalized → ready to send

4. **US-4: Chọn ngôn ngữ**
   - As a user, I want to select my language (Vietnamese/English/Russian)
   - So that transcription accuracy is better
   - Acceptance: Language selector → transcript uses selected language

5. **US-5: Gửi transcript như tin nhắn**
   - As a user, I want to send the transcribed text as a chat message
   - So that I can continue conversation using voice input
   - Acceptance: Final transcript → click send → message appears in chat

6. **US-6: Dừng ghi âm**
   - As a user, I want to stop recording manually
   - So that I can control when to finish speaking
   - Acceptance: Click stop → recording stops → final transcript shown

**Key Workflows:**

**Workflow 1: Voice Input Flow**

1. User clicks microphone button in ChatComposer
2. Browser requests microphone permission
3. User grants permission → MediaRecorder starts
4. Audio chunks (100-250ms) sent via WebSocket to backend
5. Backend proxies to Deepgram WebSocket
6. Deepgram returns interim results → displayed in UI
7. User pauses → Deepgram sends speech_final → transcript finalized
8. User clicks send → transcript sent as message

**Workflow 2: Language Selection**

1. User opens language selector
2. Selects language (vi-VN/en-US/ru-RU)
3. Language sent to backend when opening WebSocket
4. Backend sets language parameter in Deepgram connection
5. All subsequent transcripts use selected language

**Edge Cases:**

- Microphone permission denied → Show error message
- Network disconnection → Show error, allow retry
- Deepgram API error → Show error, allow retry
- User speaks too fast → Handle gracefully, show interim results
- Browser doesn't support MediaRecorder → Show fallback message
- WebSocket connection drops → Auto-reconnect or show error

## Success Criteria

**Measurable Outcomes:**

- ✅ User có thể bật microphone và nói → transcript hiển thị realtime
- ✅ Interim results cập nhật với độ trễ < 500ms
- ✅ Final transcript chính xác > 90% (tiếng Việt), > 95% (tiếng Anh)
- ✅ API key không xuất hiện trong client-side code hoặc network requests từ browser
- ✅ Hỗ trợ ít nhất 3 ngôn ngữ: vi-VN, en-US, ru-RU
- ✅ UI/UX mượt mà, không lag khi streaming

**Acceptance Criteria:**

- [ ] Microphone button visible và functional trong ChatComposer
- [ ] Click microphone → permission request → recording starts
- [ ] Realtime transcript hiển thị trong input field hoặc preview area
- [ ] Transcript tự động chốt sau 300ms im lặng
- [ ] Language selector hoạt động và ảnh hưởng đến accuracy
- [ ] Final transcript có thể gửi như tin nhắn bình thường
- [ ] Error handling cho tất cả edge cases
- [ ] WebSocket connection stable, auto-reconnect nếu cần

**Performance Benchmarks:**

- Latency: < 500ms từ khi nói đến khi thấy interim result
- Throughput: Xử lý được audio streaming liên tục không bị drop
- Memory: Không leak memory khi streaming lâu
- Network: WebSocket connection stable, handle reconnection

## Constraints & Assumptions

**Technical Constraints:**

- Deepgram API key phải được bảo mật (không lộ ra client)
- Browser phải hỗ trợ MediaRecorder API
- Cần WebSocket support (cả client và server)
- Fastify cần hỗ trợ WebSocket (có thể dùng @fastify/websocket)
- Deepgram WebSocket endpoint: `wss://api.deepgram.com/v1/listen`

**Business Constraints:**

- Sử dụng Deepgram API key: `11529f83c1605e74c780174d664677fbb61ebd3d`
- Có thể có rate limits từ Deepgram (cần kiểm tra)
- Cost per minute của Deepgram (cần monitor usage)

**Time/Budget Constraints:**

- Implement trong 1 sprint (1-2 tuần)
- Không cần infrastructure changes lớn

**Assumptions:**

- Users có microphone và cho phép browser access
- Network connection ổn định (WebSocket cần stable connection)
- Deepgram API available và reliable
- Users hiểu cách sử dụng microphone button

## Questions & Open Items

**Unresolved Questions:**

- [ ] Deepgram rate limits là gì? Có cần implement rate limiting không?
- [ ] Có cần lưu audio files không? (hiện tại: không)
- [ ] UI preview transcript ở đâu? Trong input field hay separate area?
- [ ] Có cần visual indicator khi đang recording? (waveform, pulse animation?)
- [ ] Có cần hỗ trợ edit transcript trước khi gửi không?

**Items Requiring Stakeholder Input:**

- [ ] Confirm UI/UX design cho microphone button và transcript preview
- [ ] Confirm language list (có cần thêm ngôn ngữ khác không?)
- [ ] Confirm error messages và user feedback

**Research Needed:**

- [ ] Deepgram WebSocket API documentation chi tiết
- [ ] Best practices cho MediaRecorder timeslice (100-250ms)
- [ ] Fastify WebSocket integration patterns
- [ ] Deepgram interim_results và endpointing configuration
