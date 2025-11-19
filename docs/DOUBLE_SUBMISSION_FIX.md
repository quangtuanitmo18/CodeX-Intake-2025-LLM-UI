# Fix Double Message Submission

## Vấn đề

Message bị gửi 2 lần khi submit form trong LLM chat.

## Các nguyên nhân có thể

### 1. **React StrictMode** (Development mode)
Trong development, React 18+ chạy effects và renders 2 lần để phát hiện side effects.

### 2. **Form submit event bị trigger nhiều lần**
- Enter key trigger submit
- Button click cũng trigger submit
- Cả 2 event có thể fire cùng lúc

### 3. **Component re-render sau khi submit**
State changes sau submit có thể trigger re-render và gọi lại function.

## Giải pháp đã áp dụng

### 1. **Thêm submission guard với useRef**

```typescript
const isSubmittingRef = useRef(false)

const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
  event?.preventDefault()
  
  // Prevent double submission
  if (isSubmittingRef.current || isStreaming) {
    console.log('Prevented double submission')
    return
  }
  
  const trimmedPrompt = prompt.trim()
  if (!trimmedPrompt) return
  
  isSubmittingRef.current = true
  
  try {
    // ... submit logic
  } finally {
    // Reset after delay
    setTimeout(() => {
      isSubmittingRef.current = false
    }, 500)
  }
}
```

**Lý do dùng `useRef` thay vì `useState`:**
- `useRef` không trigger re-render
- Value được giữ nguyên giữa các renders
- Perfect cho flags/guards

### 2. **Thêm logging để debug**

```typescript
// In llm-chat-area.tsx
console.log('📝 Submitting message:', trimmedPrompt)

// In useLLMStream.ts
console.log('🚀 Starting LLM stream:', { prompt, conversationId })
```

Check browser console để xem:
- Message có bị log 2 lần không
- Stream có được start 2 lần không

### 3. **Disable button khi đang stream**

```typescript
<Button
  type="submit"
  disabled={!prompt.trim() || isStreaming}
  // ...
>
```

### 4. **Check keyboard handler**

```typescript
const handleComposerKeydown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault() // ← Important!
    handleSubmit()
  }
}
```

`event.preventDefault()` ngăn form submit mặc định khi nhấn Enter.

## Cách kiểm tra

### 1. Mở Browser DevTools (F12)

### 2. Vào tab Console

### 3. Gửi một message

### 4. Check logs:

**Nếu chỉ thấy 1 lần:**
```
📝 Submitting message: hello
🚀 Starting LLM stream: {prompt: "hello", conversationId: "..."}
```
✅ **FIXED!**

**Nếu thấy 2 lần:**
```
📝 Submitting message: hello
📝 Submitting message: hello
🚀 Starting LLM stream: {prompt: "hello", conversationId: "..."}
🚀 Starting LLM stream: {prompt: "hello", conversationId: "..."}
```
❌ **Vẫn còn bug**

### 5. Vào tab Network

Check request `/llm/stream`:
- Nếu chỉ có 1 request → ✅ Fixed
- Nếu có 2 requests → ❌ Vẫn bug

## Nếu vẫn còn lỗi

### Option 1: Tắt React StrictMode (Development only)

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  reactStrictMode: false, // Tạm thời tắt để test
  // ...
}
```

**⚠️ Chú ý:** 
- Chỉ tắt để debug
- Production vẫn nên bật StrictMode
- Tắt StrictMode che giấu các bugs tiềm ẩn

### Option 2: Debounce submit function

```typescript
import { debounce } from 'lodash'

const debouncedSubmit = useMemo(
  () => debounce(handleSubmit, 300, { leading: true, trailing: false }),
  []
)
```

### Option 3: Check server logs

```bash
cd server
npm run dev
```

Xem trong terminal có log 2 requests không.

## Server-side check

Trong `llm.controller.ts`, thêm logging:

```typescript
async stream(request: FastifyRequest<{ Body: LLMStreamBodyType }>, reply: FastifyReply) {
  console.log('📨 Received stream request:', {
    prompt: request.body.prompt,
    conversationId: request.body.conversationId,
    userId: request.account?.userId,
  })
  
  // ... rest of code
}
```

## Production Notes

Trong production:
1. **Remove tất cả console.log**
2. **Giữ isSubmittingRef guard**
3. **Bật lại ReactStrictMode**
4. **Consider thêm rate limiting**

## Summary

✅ **Đã thêm submission guard** với `useRef`
✅ **Đã thêm logging** để debug
✅ **Đã check button disabled state**
✅ **Đã prevent default** trên Enter key

Test lại và check console logs! 🚀
