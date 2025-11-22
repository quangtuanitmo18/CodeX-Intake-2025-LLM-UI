# Production Deployment Guide - tuandev.ru

Complete step-by-step guide for deploying CodeX LLM UI to production using Docker.

## Server Information

- **Domain:** tuandev.ru
- **Server IP:** 195.19.92.17
- **Architecture:** Docker Compose + Nginx reverse proxy

## Architecture Overview

```
Internet
  ↓
Nginx (Port 80/443) - Reverse Proxy
  ├─→ / → Next.js Client (Docker:3000)
  └─→ /api-fastify/ → Fastify Server (Docker:4000)
```

## Prerequisites

### 1. Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git ufw

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Logout and login again for Docker group to take effect
# Or run: newgrp docker
```

### 2. Firewall Configuration

```bash
# Allow SSH (IMPORTANT - do this first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Verify rules
sudo ufw status
```

### 3. DNS Configuration

Ensure DNS records point to server IP:

```
Type    Name    Value
A       @       195.19.92.17
A       www     195.19.92.17
```

Verify DNS propagation:

```bash
dig tuandev.ru
dig www.tuandev.ru
```

## Deployment Steps

### Step 1: Clone Repository

```bash
# Create application directory
sudo mkdir -p /opt/codex-app
sudo chown $USER:$USER /opt/codex-app

# Clone repository
cd /opt
git clone <your-repo-url> codex-app
cd codex-app

# Checkout production branch (if applicable)
git checkout main  # or your production branch
```

### Step 2: Create Environment Files

#### 2.1 Server Environment (`server/.env.prod`)

```bash
cd /opt/codex-app
cp docs/env-examples/server.env.prod server/.env.prod
nano server/.env.prod  # Edit with your values
```

**Required values to update:**

```env
PORT=4000
NODE_ENV=production
DOMAIN=tuandev.ru
PROTOCOL=https

DATABASE_URL="file:/app/prisma/prod.db"

# Generate strong secrets:
# openssl rand -base64 32
ACCESS_TOKEN_SECRET=<generate-strong-secret>
REFRESH_TOKEN_SECRET=<generate-strong-secret>

# Strong password for initial admin
INITIAL_EMAIL_USER=admin@tuandev.ru
INITIAL_PASSWORD_USER=<strong-password>

CLIENT_URL=https://tuandev.ru
PRODUCTION=true
DOCKER=true
PRODUCTION_URL=https://tuandev.ru

# Google OAuth (if using)
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_AUTHORIZED_REDIRECT_URI=https://tuandev.ru/auth/login/google

# LLM API
LLM_API_URL=<your-llm-api-url>
LLM_API_TOKEN=<your-llm-api-token>
```

#### 2.2 Root Environment (`.env`)

```bash
cp docs/env-examples/env.prod .env
nano .env  # Edit with your values
```

**Required values:**

```env
SERVER_PORT=4000
CLIENT_PORT=3000
DATABASE_URL=file:/app/prisma/prod.db

# Client build-time variables
NEXT_PUBLIC_API_ENDPOINT=https://tuandev.ru/api-fastify
NEXT_PUBLIC_URL=https://tuandev.ru
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-client-id>
NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI=https://tuandev.ru/auth/login/google
```

#### 2.3 Set File Permissions

```bash
# Secure environment files
chmod 600 server/.env.prod
chmod 600 .env

# Verify they're not accessible to others
ls -la server/.env.prod .env
```

### Step 3: Build Docker Images

```bash
cd /opt/codex-app

# Build production images
docker compose -f docker-compose.prod.yml build --no-cache

# Verify images were created
docker images | grep codex
```

### Step 4: Start Services

```bash
# Start services in detached mode
docker compose -f docker-compose.prod.yml up -d

# Check service status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### Step 5: Verify Containers are Running

```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# Expected output:
# - codex-server:prod - Up (healthy)
# - codex-client:prod - Up (healthy)

# Test health endpoints
curl http://localhost:4000/healthz
curl http://localhost:3000/api/healthz
```

### Step 6: Configure Nginx

#### 6.1 Copy Nginx Configuration

```bash
# Copy nginx config to sites-available
sudo cp /opt/codex-app/nginx.conf /etc/nginx/sites-available/tuandev.ru

# Create symlink to enable site
sudo ln -s /etc/nginx/sites-available/tuandev.ru /etc/nginx/sites-enabled/

# Remove default Nginx config (optional)
sudo rm /etc/nginx/sites-enabled/default
```

#### 6.2 Test Nginx Configuration

```bash
# Test configuration syntax
sudo nginx -t

# If successful, reload Nginx
sudo systemctl reload nginx
```

#### 6.3 Verify Nginx is Running

```bash
sudo systemctl status nginx
curl http://localhost  # Should proxy to Next.js container
```

### Step 7: Setup SSL Certificate

```bash
# Obtain SSL certificate using Certbot
sudo certbot --nginx -d tuandev.ru -d www.tuandev.ru

# Follow prompts:
# - Enter email for renewal notifications
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)

# Verify certificate
sudo certbot certificates

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 8: Final Verification

```bash
# Test from server
curl https://tuandev.ru
curl https://tuandev.ru/api-fastify/healthz

# Test from external machine
curl -I https://tuandev.ru
curl https://tuandev.ru/api-fastify/healthz
```

## Post-Deployment Checklist

- [ ] Containers are running and healthy
- [ ] Nginx reverse proxy is working
- [ ] SSL certificate is installed and valid
- [ ] HTTP redirects to HTTPS
- [ ] API endpoints are accessible via `/api-fastify/`
- [ ] Database is persistent (check volume)
- [ ] Environment files are secure (600 permissions)
- [ ] Firewall is configured correctly
- [ ] DNS is pointing to correct IP

## Ongoing Operations

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f server
docker compose -f docker-compose.prod.yml logs -f web

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100
```

### Restart Services

```bash
# Restart all services
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart server
docker compose -f docker-compose.prod.yml restart web
```

### Stop Services

```bash
# Stop services (containers remain)
docker compose -f docker-compose.prod.yml stop

# Stop and remove containers
docker compose -f docker-compose.prod.yml down
```

### Update Application

```bash
cd /opt/codex-app

# Pull latest changes
git pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Verify services are running
docker compose -f docker-compose.prod.yml ps
```

### Database Backup

```bash
# Database is stored in Docker volume
# To backup:
docker compose -f docker-compose.prod.yml exec server ls -la /app/prisma/prod.db

# Copy database from container
docker compose -f docker-compose.prod.yml exec server cat /app/prisma/prod.db > backup-$(date +%Y%m%d).db

# Or backup entire volume
docker run --rm -v codex-intake-2025-llm-ui_sqlite_data:/data -v $(pwd):/backup alpine tar czf /backup/db-backup-$(date +%Y%m%d).tar.gz /data
```

### Database Restore

```bash
# Stop services
docker compose -f docker-compose.prod.yml down

# Restore from backup
docker run --rm -v codex-intake-2025-llm-ui_sqlite_data:/data -v $(pwd):/backup alpine tar xzf /backup/db-backup-YYYYMMDD.tar.gz -C /

# Start services
docker compose -f docker-compose.prod.yml up -d
```

## Monitoring

### Health Checks

```bash
# Server health
curl https://tuandev.ru/api-fastify/healthz

# Client health
curl https://tuandev.ru/healthz

# Container health (via Docker)
docker compose -f docker-compose.prod.yml ps
```

### Resource Usage

```bash
# Container resource usage
docker stats

# Disk usage
df -h
docker system df

# Log size
docker compose -f docker-compose.prod.yml logs --tail=0 | wc -l
```

### Application Logs

```bash
# Real-time logs
docker compose -f docker-compose.prod.yml logs -f --tail=50

# Logs for specific time range (requires docker logs command)
docker logs --since 1h codex-server-prod-1
docker logs --since 1h codex-client-prod-1
```

## Security Best Practices

### 1. Environment Files

```bash
# Never commit .env files
# Set strict permissions
chmod 600 server/.env.prod .env

# Verify in .gitignore
grep -E "\.env|env\.prod" .gitignore
```

### 2. Firewall Rules

```bash
# Only expose necessary ports
sudo ufw status

# SSH should be restricted (consider fail2ban)
sudo apt install -y fail2ban
```

### 3. Regular Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --build
```

### 4. Secrets Management

- Generate strong secrets for JWT tokens
- Rotate secrets periodically
- Never hardcode secrets in code
- Use environment variables only

### 5. SSL Certificate Renewal

```bash
# Certbot auto-renewal is configured via cron
# Verify it works:
sudo certbot renew --dry-run

# Manual renewal (if needed):
sudo certbot renew
sudo systemctl reload nginx
```

## Troubleshooting

### Containers Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs

# Check container status
docker compose -f docker-compose.prod.yml ps -a

# Check if ports are in use
sudo netstat -tulpn | grep -E "3000|4000"
```

### Database Connection Issues

```bash
# Check database file exists
docker compose -f docker-compose.prod.yml exec server ls -la /app/prisma/

# Check database permissions
docker compose -f docker-compose.prod.yml exec server ls -la /app/prisma/prod.db

# Check Prisma Client
docker compose -f docker-compose.prod.yml exec server ls -la /app/node_modules/.prisma
```

### Nginx 502 Bad Gateway

```bash
# Check if containers are running
docker compose -f docker-compose.prod.yml ps

# Check if containers are healthy
docker compose -f docker-compose.prod.yml ps | grep healthy

# Check container logs
docker compose -f docker-compose.prod.yml logs server
docker compose -f docker-compose.prod.yml logs web

# Test direct connection
curl http://127.0.0.1:3000
curl http://127.0.0.1:4000/healthz
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Check certificate expiry
sudo openssl x509 -in /etc/letsencrypt/live/tuandev.ru/cert.pem -noout -dates

# Renew certificate
sudo certbot renew
sudo systemctl reload nginx
```

## Rollback Procedure

If deployment fails and you need to rollback:

```bash
cd /opt/codex-app

# Stop current deployment
docker compose -f docker-compose.prod.yml down

# Checkout previous version
git checkout <previous-commit-hash>

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build
```

## Maintenance Window

For zero-downtime updates:

```bash
# 1. Pull latest code
git pull

# 2. Rebuild images
docker compose -f docker-compose.prod.yml build

# 3. Restart services (Docker Compose handles rolling updates)
docker compose -f docker-compose.prod.yml up -d

# 4. Verify health
docker compose -f docker-compose.prod.yml ps
curl https://tuandev.ru/api-fastify/healthz
```

## Backup Strategy

### Daily Backups (Recommended)

Create a backup script (`/opt/codex-app/scripts/backup.sh`):

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker compose -f docker-compose.prod.yml exec -T server cat /app/prisma/prod.db > $BACKUP_DIR/db_$DATE.db

# Backup environment files
tar czf $BACKUP_DIR/env_$DATE.tar.gz server/.env.prod .env

# Keep only last 7 days
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Add to cron:

```bash
# Add to crontab (runs daily at 2 AM)
crontab -e
0 2 * * * /opt/codex-app/scripts/backup.sh
```

## Performance Optimization

### 1. Enable Nginx Caching

Already configured in `nginx.conf` - static assets are cached.

### 2. Monitor Resource Usage

```bash
# Install monitoring tools
sudo apt install -y htop iotop

# Monitor in real-time
htop
docker stats
```

### 3. Database Optimization

```bash
# Prisma automatically handles SQLite optimization
# For manual optimization:
docker compose -f docker-compose.prod.yml exec server npx prisma db execute --stdin <<< "VACUUM;"
```

## Support & Documentation

- **Logs Location:** Docker logs via `docker compose logs`
- **Config Files:** `/opt/codex-app/`
- **Nginx Config:** `/etc/nginx/sites-available/tuandev.ru`
- **SSL Certificates:** `/etc/letsencrypt/live/tuandev.ru/`

## Quick Reference Commands

```bash
# Start services
docker compose -f docker-compose.prod.yml up -d

# Stop services
docker compose -f docker-compose.prod.yml down

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart service
docker compose -f docker-compose.prod.yml restart <service-name>

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Check status
docker compose -f docker-compose.prod.yml ps

# Shell into container
docker compose -f docker-compose.prod.yml exec server sh
docker compose -f docker-compose.prod.yml exec web sh
```
