# Docker Setup Guide

This guide explains how to run the application using Docker and Docker Compose.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Git

## Quick Start

### Development Mode

1. **Create environment files:**
   - `client/.env.local` (see [Client Environment Variables](#client-environment-variables))
   - `server/.env.local` (see [Server Environment Variables](#server-environment-variables))

2. **Build and run:**

   ```bash
   docker compose -f docker-compose.dev.yml up -d --build
   ```

3. **Access the application:**
   - Client (Next.js): http://localhost:3000
   - Server API (Fastify): http://localhost:4000

   Features:
   - Hot reload enabled (bind-mount source code)
   - Uses `Dockerfile.dev` for both services
   - Uses `.env.local` files for environment variables

### Production Mode

1. **Set up environment variables** (see [Environment Variables](#environment-variables) below)
2. **Build and run:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
3. **Access the application:**
   - Client (Next.js): http://localhost:3000
   - Server API (Fastify): http://localhost:4000

   Features:
   - Optimized production builds
   - Uses `Dockerfile.prod` for both services
   - Restart policy: `unless-stopped`
   - Environment variables from `.env` or CI/CD secrets

## Environment Variables

### Client Environment Variables

Create `client/.env.local` for local development. See `docs/env-examples/client.env.example` for a template:

```env
NEXT_PUBLIC_API_ENDPOINT=http://localhost:4000
NEXT_PUBLIC_URL=http://localhost:3000
```

**For Production (GitHub Actions):**

- These variables are injected via GitHub Actions secrets during CI/CD
- Never commit `.env` files to git

### Server Environment Variables

Create `server/.env.local` for local development. See `docs/env-examples/server.env.example` for a complete template with all required variables.

**Required variables:**

- `PORT`, `NODE_ENV`, `DOMAIN`, `PROTOCOL`
- `DATABASE_URL`
- `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRES_IN`
- `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIRES_IN`
- `INITIAL_EMAIL_USER`, `INITIAL_PASSWORD_USER`
- `UPLOAD_FOLDER`, `CLIENT_URL`
- `PRODUCTION`, `DOCKER`

**For Production (GitHub Actions):**

- All environment variables are injected via GitHub Actions secrets
- `DATABASE_URL` is set to use the Docker volume: `file:./prisma/dev.db`
- `DOCKER=true` is automatically set in production containers

## Docker Compose Files

### `docker-compose.dev.yml` (Development - Standalone)

- **Fully independent** - không cần merge với file khác
- Uses `Dockerfile.dev` for hot reload
- Bind-mounts source code (`./server:/app`, `./client:/app`)
- Uses `.env.local` files
- Separate `node_modules` volumes to avoid host conflicts
- Includes healthchecks for both services
- Exposes ports 3000 (web) and 4000 (server)

### `docker-compose.prod.yml` (Production - Standalone)

- **Fully independent** - không cần merge với file khác
- Uses `Dockerfile.prod` for optimized builds
- No bind mounts (code copied into image)
- Environment variables from `.env` or CI/CD secrets
- Restart policy: `unless-stopped`
- Includes healthchecks for both services
- Exposes ports 3000 (web) and 4000 (server)

## Common Commands

### Development

```bash
# Start services
docker compose -f docker-compose.dev.yml up -d --build

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Stop services
docker compose -f docker-compose.dev.yml down

# Rebuild images
docker compose -f docker-compose.dev.yml build --no-cache

# Remove volumes (⚠️ deletes database)
docker compose -f docker-compose.dev.yml down -v
```

### Production

```bash
# Start services
docker compose -f docker-compose.prod.yml up -d --build

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop services
docker compose -f docker-compose.prod.yml down

# Rebuild images
docker compose -f docker-compose.prod.yml build --no-cache

# Remove volumes (⚠️ deletes database)
docker compose -f docker-compose.prod.yml down -v
```

## Troubleshooting

### Port Already in Use

If ports 3000 or 4000 are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - '3001:3000' # Change host port
```

### Database Permissions

If you encounter SQLite permission errors:

- Ensure the `sqlite_data` volume has correct permissions
- On Linux/macOS, you may need to adjust ownership: `sudo chown -R $USER:$USER ./server/prisma`

### Environment Variables Not Loading

- Verify `.env.local` files exist in `client/` and `server/` directories
- Check that variable names match exactly (case-sensitive)
- For production, ensure GitHub Actions secrets are configured

### Build Failures

- Clear Docker cache: `docker system prune -a`
- Rebuild without cache: `docker compose build --no-cache`
- Check Docker logs: `docker compose logs [service-name]`

## Production Deployment

### GitHub Actions CI/CD

1. Configure secrets in GitHub repository settings:
   - All environment variables from `server/.env.example`
   - `NEXT_PUBLIC_API_ENDPOINT` and `NEXT_PUBLIC_URL` for client

2. GitHub Actions workflow will:
   - Build Docker images
   - Inject secrets as environment variables
   - Push images to registry (if configured)
   - Deploy to production environment

### Manual Production Deployment

1. Build production images:

   ```bash
   docker compose build
   ```

2. Set environment variables (via `.env` file or `-e` flags):

   ```bash
   docker compose --env-file .env.production up -d
   ```

3. Verify services are running:
   ```bash
   docker compose ps
   docker compose logs
   ```

## Volumes

- `sqlite_data`: Persists SQLite database across container restarts
- `uploads_data`: Persists uploaded files (images, attachments)
- `web_node_modules` (dev only): Caches client node_modules to avoid host conflicts

## Health Checks

Both services include healthcheck endpoints:

- Web: `http://localhost:3000/healthz`
- Server: `http://localhost:4000/healthz`

Use these endpoints for monitoring and load balancer health checks.

## Logging & Monitoring

For detailed information about logging and monitoring strategies, see [Logging & Monitoring Guide](./LOGGING_MONITORING.md).

**Quick reference:**

- **View logs:**

  ```bash
  docker compose logs -f [service-name]
  ```

- **Health checks:**
  - Web: `http://localhost:3000/healthz`
  - Server: `http://localhost:4000/healthz`

- **Log rotation:** Configured automatically (10MB max, 3 files retained)

- **External integration:** See [LOGGING_MONITORING.md](./LOGGING_MONITORING.md) for ELK, CloudWatch, Datadog setup
