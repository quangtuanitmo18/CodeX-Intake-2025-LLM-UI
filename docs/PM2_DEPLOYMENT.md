# PM2 Production Deployment Guide - tuandev.ru

Complete step-by-step guide for deploying CodeX LLM UI to production using PM2 (without Docker).

**Use this guide when:**

- Server has limited RAM (< 2GB recommended for Docker)
- You want lower resource overhead
- You prefer direct process management

## Server Information

- **Domain:** tuandev.ru
- **Server IP:** 195.19.92.17
- **CDN/Proxy:** Cloudflare (DNS + CDN + SSL)
- **Architecture:** Cloudflare → PM2 + Nginx reverse proxy

## Architecture Overview

```text
Internet
  ↓
Cloudflare (DNS + CDN + SSL)
  ↓
Nginx (Port 80/443) - Reverse Proxy
  ├─→ / → Next.js Client (PM2:3000)
  └─→ /api-fastify/ → Fastify Server (PM2:4000)
```

### Cloudflare Setup Overview

This deployment uses Cloudflare as a proxy/CDN layer:

- **DNS**: Domain points to Cloudflare nameservers
- **Proxy**: Cloudflare proxies traffic to your server (orange cloud icon)
- **SSL**: Cloudflare handles SSL termination (Flexible/Full/Full Strict modes)
- **CDN**: Cloudflare caches static assets and provides DDoS protection
- **Real IP**: Server receives real client IPs via `CF-Connecting-IP` header

**Benefits:**

- DDoS protection
- CDN caching for better performance
- Free SSL certificate from Cloudflare
- Analytics and security features
- Reduced server load

## Prerequisites

### 1. Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git ufw build-essential

# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
node --version  # Should be v20.x.x
npm --version

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Firewall Configuration

```bash
# Allow SSH (IMPORTANT - do this first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS from Cloudflare IPs only (recommended for security)
# Get Cloudflare IP ranges
curl -s https://www.cloudflare.com/ips-v4 > /tmp/cloudflare-ips-v4.txt
curl -s https://www.cloudflare.com/ips-v6 > /tmp/cloudflare-ips-v6.txt

# Allow Cloudflare IPv4 ranges
while read ip; do sudo ufw allow from $ip to any port 80 proto tcp; done < /tmp/cloudflare-ips-v4.txt
while read ip; do sudo ufw allow from $ip to any port 443 proto tcp; done < /tmp/cloudflare-ips-v4.txt

# Allow Cloudflare IPv6 ranges (if your server supports IPv6)
while read ip; do sudo ufw allow from $ip to any port 80 proto tcp; done < /tmp/cloudflare-ips-v6.txt
while read ip; do sudo ufw allow from $ip to any port 443 proto tcp; done < /tmp/cloudflare-ips-v6.txt

# Alternative: Allow all HTTP/HTTPS (if you want to allow direct access too)
# sudo ufw allow 80/tcp
# sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Verify rules
sudo ufw status
```

### 3. Cloudflare Setup

#### 3.1 Add Domain to Cloudflare

1. Sign up/Login to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Add your domain `tuandev.ru`
3. Cloudflare will scan your existing DNS records
4. Follow Cloudflare's instructions to update nameservers at your domain registrar

#### 3.2 DNS Configuration in Cloudflare

In Cloudflare DNS settings, configure:

```text
Type    Name    Value              Proxy Status
A       @       195.19.92.17       Proxied (orange cloud) ✅
A       www     195.19.92.17       Proxied (orange cloud) ✅
```

**Important:**

- Enable **Proxied** (orange cloud icon) to route traffic through Cloudflare
- If you disable proxy (grey cloud), DNS will point directly to server IP

#### 3.3 Cloudflare SSL/TLS Settings

1. Go to **SSL/TLS** → **Overview**
2. Choose SSL mode:
   - **Flexible**: Cloudflare ↔ Server (HTTP) - Easier setup, less secure
   - **Full**: Cloudflare ↔ Server (HTTPS) - Recommended, requires SSL on server
   - **Full (strict)**: Cloudflare ↔ Server (HTTPS with valid cert) - Most secure

**Recommended:** Use **Full** or **Full (strict)** mode for better security.

#### 3.4 Verify DNS Propagation

```bash
# Check DNS resolution (should show Cloudflare IPs, not your server IP)
dig tuandev.ru
dig www.tuandev.ru

# Check if Cloudflare is active
curl -I https://tuandev.ru
# Should see CF-RAY header in response
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
nano server/.env.prod  # Create and edit
```

**Required values:**

```env
PORT=4000
NODE_ENV=production
DOMAIN=tuandev.ru
PROTOCOL=https

DATABASE_URL="file:/opt/codex-app/server/prisma/prod.db"

# Generate strong secrets:
# openssl rand -base64 32
ACCESS_TOKEN_SECRET=<generate-strong-secret>
REFRESH_TOKEN_SECRET=<generate-strong-secret>

# Strong password for initial admin
INITIAL_EMAIL_USER=admin@tuandev.ru
INITIAL_PASSWORD_USER=<strong-password>

CLIENT_URL=https://tuandev.ru
PRODUCTION=true
DOCKER=false

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
nano .env  # Create and edit
```

**Required values:**

```env
SERVER_PORT=4000
CLIENT_PORT=3000
DATABASE_URL=file:/opt/codex-app/server/prisma/prod.db

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

### Step 3: Install Dependencies

```bash
cd /opt/codex-app

# Install server dependencies
cd server
npm ci

# Install client dependencies
cd ../client
npm ci

# Go back to root
cd ..
```

### Step 4: Build Applications

```bash
cd /opt/codex-app

# Build server (TypeScript)
cd server
npm run build

# Build client (Next.js)
cd ../client
npm run build

# Go back to root
cd ..
```

### Step 5: Setup Database

```bash
cd /opt/codex-app/server

# Generate Prisma Client
npx prisma generate

# Initialize database (if no migrations exist)
# Option 1: Use db push (for initial setup)
npx prisma db push

# Option 2: Use migrations (recommended for production)
# npx prisma migrate deploy

# Verify database was created
ls -la prisma/prod.db
```

### Step 6: Configure PM2

#### 6.1 Create PM2 Ecosystem File

```bash
cd /opt/codex-app
nano ecosystem.config.js
```

**Content:**

```javascript
module.exports = {
  apps: [
    // Backend: Fastify Server
    {
      name: 'codex-server',
      cwd: '/opt/codex-app/server',
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork', // Use fork mode for single instance
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
      env_file: '/opt/codex-app/server/.env.prod',
      error_file: '/var/log/codex-app/server-error.log',
      out_file: '/var/log/codex-app/server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
    },
    // Frontend: Next.js Client
    {
      name: 'codex-client',
      cwd: '/opt/codex-app/client',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1, // Use 1 instance for low RAM servers
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/codex-app/client-error.log',
      out_file: '/var/log/codex-app/client-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
    },
  ],
}
```

#### 6.2 Create Log Directory

```bash
sudo mkdir -p /var/log/codex-app
sudo chown $USER:$USER /var/log/codex-app
```

#### 6.3 Start Applications with PM2

```bash
cd /opt/codex-app

# Start all applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the command output to run the generated command

# Check status
pm2 status
pm2 logs
```

### Step 7: Configure Nginx

#### 7.1 Setup Cloudflare Real IP Module

```bash
# Create Cloudflare IP list file
sudo mkdir -p /etc/nginx/conf.d
sudo nano /etc/nginx/conf.d/cloudflare-real-ip.conf
```

Add this content:

```nginx
# Cloudflare IPv4
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 131.0.72.0/22;

# Cloudflare IPv6
set_real_ip_from 2400:cb00::/32;
set_real_ip_from 2606:4700::/32;
set_real_ip_from 2803:f800::/32;
set_real_ip_from 2405:b500::/32;
set_real_ip_from 2405:8100::/32;
set_real_ip_from 2a06:98c0::/29;
set_real_ip_from 2c0f:f248::/32;

# Use Cloudflare's CF-Connecting-IP header for real IP
real_ip_header CF-Connecting-IP;
```

#### 7.2 Copy Nginx Configuration

```bash
# Copy nginx config to sites-available
sudo cp /opt/codex-app/nginx.conf /etc/nginx/sites-available/tuandev.ru

# Create symlink to enable site
sudo ln -s /etc/nginx/sites-available/tuandev.ru /etc/nginx/sites-enabled/

# Remove default Nginx config (optional)
sudo rm /etc/nginx/sites-enabled/default
```

#### 7.3 Test Nginx Configuration

```bash
# Test configuration syntax
sudo nginx -t

# If successful, reload Nginx
sudo systemctl reload nginx
```

#### 7.4 Verify Nginx is Running

```bash
sudo systemctl status nginx
curl http://localhost  # Should proxy to Next.js (port 3000)
```

### Step 8: Setup SSL Certificate

#### Option A: Using Let's Encrypt (Recommended for Full/Full Strict SSL mode)

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

**Note:** If using Cloudflare **Full** or **Full (strict)** SSL mode, you need SSL certificate on your server.

#### Option B: Using Cloudflare Origin Certificate (Alternative)

If you prefer to use Cloudflare's origin certificate:

1. Go to Cloudflare Dashboard → **SSL/TLS** → **Origin Server**
2. Click **Create Certificate**
3. Select validity period (recommended: 15 years)
4. Copy the **Origin Certificate** and **Private Key**
5. Save them on your server:

```bash
# Create directory for Cloudflare certificates
sudo mkdir -p /etc/ssl/cloudflare

# Save origin certificate
sudo nano /etc/ssl/cloudflare/origin.pem
# Paste the Origin Certificate content

# Save private key
sudo nano /etc/ssl/cloudflare/private.key
# Paste the Private Key content

# Set proper permissions
sudo chmod 600 /etc/ssl/cloudflare/private.key
sudo chmod 644 /etc/ssl/cloudflare/origin.pem
```

Then update Nginx config to use Cloudflare certificates (see nginx.conf comments).

### Step 9: Final Verification

```bash
# Test from server
curl https://tuandev.ru
curl https://tuandev.ru/api-fastify/healthz

# Test from external machine
curl -I https://tuandev.ru
curl https://tuandev.ru/api-fastify/healthz

# Check PM2 status
pm2 status
pm2 logs --lines 50
```

## Post-Deployment Checklist

- [ ] PM2 processes are running (codex-server, codex-client)
- [ ] Nginx reverse proxy is working
- [ ] SSL certificate is installed and valid
- [ ] HTTP redirects to HTTPS
- [ ] API endpoints are accessible via `/api-fastify/`
- [ ] Database is initialized and accessible
- [ ] Environment files are secure (600 permissions)
- [ ] Firewall is configured correctly (Cloudflare IPs if using Cloudflare)
- [ ] Cloudflare DNS is configured with Proxied status (orange cloud)
- [ ] Cloudflare SSL/TLS mode is set (Flexible/Full/Full Strict)
- [ ] Cloudflare Real IP module is configured in Nginx
- [ ] Real client IPs are being logged correctly (check logs)
- [ ] PM2 is configured to start on boot

## Ongoing Operations

### View Logs

```bash
# PM2 logs (all apps)
pm2 logs

# Specific app logs
pm2 logs codex-server
pm2 logs codex-client

# Last 100 lines
pm2 logs --lines 100

# Follow logs in real-time
pm2 logs --lines 0

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart Services

```bash
# Restart all PM2 apps
pm2 restart all

# Restart specific app
pm2 restart codex-server
pm2 restart codex-client

# Reload (zero-downtime restart)
pm2 reload codex-server
pm2 reload codex-client

# Reload Nginx
sudo systemctl reload nginx
```

### Stop Services

```bash
# Stop all PM2 apps
pm2 stop all

# Stop specific app
pm2 stop codex-server
pm2 stop codex-client

# Delete from PM2 (keeps processes but removes from PM2)
pm2 delete codex-server
```

### Update Application

```bash
cd /opt/codex-app

# Pull latest changes
git pull

# Install/update dependencies
cd server && npm ci && cd ..
cd client && npm ci && cd ..

# Rebuild applications
cd server && npm run build && cd ..
cd client && npm run build && cd ..

# Run database migrations (if any)
cd server
npx prisma migrate deploy
cd ..

# Restart PM2 apps
pm2 restart all

# Verify services are running
pm2 status
```

### Database Backup

```bash
# Backup database
cp /opt/codex-app/server/prisma/prod.db /opt/backups/prod-$(date +%Y%m%d-%H%M%S).db

# Or create backup script
sudo nano /opt/codex-app/scripts/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /opt/codex-app/server/prisma/prod.db $BACKUP_DIR/db_$DATE.db

# Backup environment files
tar czf $BACKUP_DIR/env_$DATE.tar.gz /opt/codex-app/server/.env.prod /opt/codex-app/.env

# Keep only last 7 days
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
chmod +x /opt/codex-app/scripts/backup-db.sh

# Add to crontab (runs daily at 2 AM)
crontab -e
# Add: 0 2 * * * /opt/codex-app/scripts/backup-db.sh
```

### Database Restore

```bash
# Stop PM2 apps
pm2 stop all

# Restore from backup
cp /opt/backups/db-YYYYMMDD-HHMMSS.db /opt/codex-app/server/prisma/prod.db

# Start PM2 apps
pm2 start all
```

## Monitoring

### PM2 Monitoring

```bash
# Monitor in real-time
pm2 monit

# Show detailed info
pm2 show codex-server
pm2 show codex-client

# Show process list
pm2 list

# Show resource usage
pm2 status
```

### Health Checks

```bash
# Server health
curl https://tuandev.ru/api-fastify/healthz

# Client health
curl https://tuandev.ru/healthz

# PM2 process health
pm2 status
```

### Resource Usage

```bash
# System resource usage
htop
free -h
df -h

# PM2 resource usage
pm2 monit

# Node.js process memory
pm2 show codex-server | grep memory
pm2 show codex-client | grep memory
```

## Security Best Practices

### 1. Environment Files

```bash
# Never commit .env files
# Set strict permissions
chmod 600 /opt/codex-app/server/.env.prod
chmod 600 /opt/codex-app/.env

# Verify in .gitignore
grep -E "\.env|env\.prod" /opt/codex-app/.gitignore
```

### 2. Firewall Rules

```bash
# Only expose necessary ports
sudo ufw status

# SSH should be restricted (consider fail2ban)
sudo apt install -y fail2ban

# If using Cloudflare, restrict HTTP/HTTPS to Cloudflare IPs only
# This prevents direct access bypassing Cloudflare
```

### 3. Regular Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js (if needed)
# Check current version: node --version
# Follow NodeSource instructions for updates

# Update PM2
sudo npm install -g pm2@latest

# Update application dependencies
cd /opt/codex-app/server && npm update
cd /opt/codex-app/client && npm update
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

### PM2 Processes Won't Start

```bash
# Check PM2 logs
pm2 logs --lines 100

# Check specific app
pm2 logs codex-server --lines 100

# Check if ports are in use
sudo netstat -tulpn | grep -E "3000|4000"

# Check process status
pm2 status
pm2 describe codex-server
```

### Database Connection Issues

```bash
# Check database file exists
ls -la /opt/codex-app/server/prisma/prod.db

# Check database permissions
ls -la /opt/codex-app/server/prisma/

# Test Prisma connection
cd /opt/codex-app/server
npx prisma db pull
```

### Nginx 502 Bad Gateway

```bash
# Check if PM2 processes are running
pm2 status

# Check PM2 logs
pm2 logs --lines 50

# Test direct connection
curl http://127.0.0.1:3000
curl http://127.0.0.1:4000/healthz

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
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

### Cloudflare Issues

#### Real IP Not Showing Correctly

```bash
# Verify Cloudflare Real IP config exists
sudo cat /etc/nginx/conf.d/cloudflare-real-ip.conf

# Check if Nginx is using the config
sudo nginx -T | grep -A 5 "set_real_ip_from"

# Test real IP from external
curl -H "CF-Connecting-IP: 1.2.3.4" https://tuandev.ru
# Check Nginx access logs to see if real IP is logged
sudo tail -f /var/log/nginx/access.log
```

#### Cloudflare SSL Errors

- **Error: "525 SSL Handshake Failed"**
  - Check if SSL certificate is valid on server
  - Verify Cloudflare SSL mode matches server SSL setup
  - For Full/Full Strict: Ensure server has valid SSL certificate

- **Error: "526 Invalid SSL Certificate"**
  - Server certificate might be expired or invalid
  - Check certificate: `sudo certbot certificates`
  - Renew if needed: `sudo certbot renew`

### High Memory Usage

```bash
# Check memory usage
free -h
pm2 monit

# Restart apps if memory is high
pm2 restart all

# Adjust max_memory_restart in ecosystem.config.js if needed
# Then: pm2 delete all && pm2 start ecosystem.config.js
```

## Performance Optimization

### 1. PM2 Configuration

For low RAM servers, adjust `ecosystem.config.js`:

```javascript
{
  name: "codex-server",
  instances: 1, // Use 1 instance instead of cluster mode
  exec_mode: "fork", // Fork mode uses less memory
  max_memory_restart: "256M", // Lower memory limit
}
```

### 2. Node.js Memory Limits

```bash
# Set Node.js memory limit (in ecosystem.config.js)
node_args: "--max-old-space-size=256" // 256MB limit
```

### 3. Enable Nginx Caching

Already configured in `nginx.conf` - static assets are cached.

### 4. Monitor Resource Usage

```bash
# Install monitoring tools
sudo apt install -y htop iotop

# Monitor in real-time
htop
pm2 monit
```

## Quick Reference Commands

```bash
# PM2
pm2 start ecosystem.config.js
pm2 stop all
pm2 restart all
pm2 logs
pm2 status
pm2 monit
pm2 save
pm2 startup

# Nginx
sudo systemctl status nginx
sudo systemctl reload nginx
sudo nginx -t

# Database
cd /opt/codex-app/server
npx prisma migrate deploy
npx prisma db push
npx prisma generate

# Application
cd /opt/codex-app
git pull
cd server && npm ci && npm run build
cd client && npm ci && npm run build
pm2 restart all
```

## Support & Documentation

- **Logs Location:**
  - PM2: `/var/log/codex-app/`
  - Nginx: `/var/log/nginx/`
- **Config Files:** `/opt/codex-app/`
- **Nginx Config:** `/etc/nginx/sites-available/tuandev.ru`
- **SSL Certificates:** `/etc/letsencrypt/live/tuandev.ru/`
- **PM2 Config:** `/opt/codex-app/ecosystem.config.js`
