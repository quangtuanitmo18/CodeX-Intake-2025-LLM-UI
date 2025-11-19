# Fix CORS cho LLM Streaming

## Vấn đề

Khi call API `/llm/stream` từ client, bị lỗi CORS:
```
Access to fetch at 'http://localhost:4000/llm/stream' from origin 'http://localhost:3000' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Nguyên nhân

Server-Sent Events (SSE) / streaming responses cần **CORS headers đặc biệt** vì:
1. Response được stream theo thời gian thực
2. Connection được giữ mở lâu (keep-alive)
3. Headers phải được set **trước khi stream bắt đầu**

## Giải pháp đã áp dụng

### 1. **Cập nhật LLM Controller** (`server/src/controllers/llm.controller.ts`)

Thêm CORS headers vào response trước khi streaming:

```typescript
async stream(request: FastifyRequest<{ Body: LLMStreamBodyType }>, reply: FastifyReply) {
  reply.hijack()

  // CORS headers for SSE - QUAN TRỌNG!
  reply.raw.setHeader('Access-Control-Allow-Origin', request.headers.origin || '*')
  reply.raw.setHeader('Access-Control-Allow-Credentials', 'true')
  reply.raw.setHeader('Access-Control-Expose-Headers', 'Content-Type')
  
  // SSE headers
  reply.raw.setHeader('Content-Type', 'text/event-stream')
  reply.raw.setHeader('Cache-Control', 'no-cache')
  reply.raw.setHeader('Connection', 'keep-alive')
  reply.raw.flushHeaders?.()
  
  // ...rest of code
}
```

**Giải thích:**
- `Access-Control-Allow-Origin`: Cho phép origin của client (http://localhost:3000)
- `Access-Control-Allow-Credentials`: Cho phép gửi credentials (cookies, auth headers)
- `Access-Control-Expose-Headers`: Cho phép client đọc header 'Content-Type'

### 2. **Cập nhật CORS Config** (`server/src/index.ts`)

Thêm config đầy đủ cho CORS:

```typescript
const whitelist = ['*']
fastify.register(cors, {
  origin: whitelist,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Type']
})
```

**Giải thích:**
- `methods`: Cho phép các HTTP methods (bao gồm OPTIONS cho preflight)
- `allowedHeaders`: Headers mà client được phép gửi
- `exposedHeaders`: Headers mà client được phép đọc từ response

## Restart Server

Sau khi update code, **BẮT BUỘC phải restart server**:

```bash
# Nếu đang dùng nodemon/dev
cd server
npm run dev

# Hoặc kill process và start lại
```

## Test lại

1. Mở browser dev tools (F12)
2. Vào tab Network
3. Gửi message trong LLM chat
4. Check request `/llm/stream`:
   - Status: 200 OK ✅
   - Response Headers phải có:
     - `access-control-allow-origin: http://localhost:3000`
     - `content-type: text/event-stream`
     - `connection: keep-alive`

## Troubleshooting

### Vẫn còn lỗi CORS?

1. **Clear browser cache** và hard reload (Ctrl+Shift+R)
2. **Check server logs** xem có error không
3. **Verify server đã restart** sau khi update code
4. **Check browser console** xem error message chi tiết

### Lỗi 401 Unauthorized?

Đây là lỗi khác, không phải CORS. Check:
- Access token có hợp lệ không?
- Token có được gửi trong header không?
- Check `requireLoginedHook` trong route

### Stream không hoạt động?

1. Check `llmService.stream()` có hoạt động không
2. Check `onChunk` callback có được gọi không
3. Xem server logs để debug

## Production Notes

Trong production, **KHÔNG nên dùng origin: ['*']**. Thay vào đó:

```typescript
const whitelist = [
  'https://yourdomain.com',
  'https://www.yourdomain.com'
]

fastify.register(cors, {
  origin: (origin, cb) => {
    if (!origin || whitelist.includes(origin)) {
      cb(null, true)
    } else {
      cb(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  // ...other configs
})
```

## Summary

✅ **Fixed CORS headers** cho SSE streaming
✅ **Added proper CORS config** trong Fastify
✅ **Enabled credentials** cho authenticated requests
✅ **Exposed necessary headers** cho client

Server giờ đã sẵn sàng handle streaming requests từ client! 🚀
