# Docker Compose Commands

## Development Environment

Chạy môi trường development:

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

Xem logs:

```bash
docker compose -f docker-compose.dev.yml logs -f
```

Dừng:

```bash
docker compose -f docker-compose.dev.yml down
```

## Production Environment

Chạy môi trường production:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Xem logs:

```bash
docker compose -f docker-compose.prod.yml logs -f
```

Dừng:

```bash
docker compose -f docker-compose.prod.yml down
```

## Sự khác biệt giữa Dev và Prod

### Development (`docker-compose.dev.yml`)

- Dùng `Dockerfile.dev` (hot reload)
- Bind mount source code (`./server:/app`, `./client:/app`)
- Dùng `.env.local` files
- Named volumes cho `node_modules` (tránh conflict với host)
- Không restart policy (tắt khi dừng compose)

### Production (`docker-compose.prod.yml`)

- Dùng `Dockerfile.prod` (optimized build)
- Không bind mount (code được copy vào image)
- Environment variables từ `.env` hoặc CI/CD secrets
- Restart policy: `unless-stopped`
- Optimized images với multi-stage builds
