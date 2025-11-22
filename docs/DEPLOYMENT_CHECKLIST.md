# Deployment Checklist - tuandev.ru

Quick checklist for deploying to production.

## Pre-Deployment

- [ ] Server prepared (Docker, Nginx, Certbot installed)
- [ ] Firewall configured (SSH, HTTP, HTTPS only)
- [ ] DNS records point to `195.19.92.17`
- [ ] Repository cloned to `/opt/codex-app`
- [ ] Environment files created and configured:
  - [ ] `server/.env.prod` (all values filled)
  - [ ] `.env` (root, for Docker Compose)
  - [ ] File permissions set to `600`

## Deployment

- [ ] Docker images built successfully
- [ ] Services started and running
- [ ] Health checks passing:
  - [ ] Server: `curl http://localhost:4000/healthz`
  - [ ] Client: `curl http://localhost:3000/api/healthz`
- [ ] Nginx configured and enabled
- [ ] Nginx configuration tested (`sudo nginx -t`)
- [ ] Nginx reloaded

## SSL Setup

- [ ] SSL certificate obtained (`certbot --nginx`)
- [ ] Certificate auto-renewal tested (`certbot renew --dry-run`)
- [ ] HTTP redirects to HTTPS

## Verification

- [ ] Website accessible: `https://tuandev.ru`
- [ ] API accessible: `https://tuandev.ru/api-fastify/healthz`
- [ ] Login page works
- [ ] Can create conversation
- [ ] LLM streaming works

## Post-Deployment

- [ ] Database volume is persistent
- [ ] Backup script created and scheduled
- [ ] Monitoring/logging configured
- [ ] Documentation updated with server details

## Security

- [ ] Environment files have `600` permissions
- [ ] Firewall enabled and configured
- [ ] Strong secrets generated for JWT
- [ ] Initial admin password is strong
- [ ] `.env` files are in `.gitignore`

## Emergency Contacts

- **Server IP:** 195.19.92.17
- **Domain:** tuandev.ru
- **SSH:** `ssh user@195.19.92.17`
- **Application Path:** `/opt/codex-app`
- **Nginx Config:** `/etc/nginx/sites-available/tuandev.ru`
