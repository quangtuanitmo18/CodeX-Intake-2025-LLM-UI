# CodeX LLM UI

A modern, full-featured LLM (Large Language Model) chat interface built with Next.js and Fastify. This application provides an intuitive workspace for interacting with LLMs, managing conversations, organizing projects, and leveraging advanced features like reasoning/thinking indicators.

## Concept

CodeX LLM UI is designed to provide a seamless experience for interacting with Large Language Models. It features project-based organization, conversation history, real-time streaming responses, and advanced UI features like thinking indicators that show the LLM's reasoning process.

## Technologies Used

### Frontend

- **Next.js 15** (App Router, Standalone mode)
- **TypeScript**
- **TailwindCSS**
- **TanStack Query** (React Query)
- **React Hook Form** + **Zod** (Form validation)
- **React Markdown** (Markdown rendering)
- **Highlight.js** (Code syntax highlighting)

### Backend

- **Fastify** (High-performance web framework)
- **Prisma** (ORM)
- **TypeScript**
- **JWT** (Access Tokens & Refresh Tokens)
- **Zod** (Schema validation)
- **bcrypt** (Password hashing)

### Database

- **SQLite** (via Prisma)

### Infrastructure

- **Docker** & **Docker Compose** (Containerization)
- **Nginx** (Reverse proxy for production)

## Core Features

### User Authentication & Authorization

- **JWT-based Authentication:** Secure sessions using Access Tokens and Refresh Tokens
- **Google OAuth** (Optional)
- **Guest Access** (Limited functionality)

### LLM Chat Interface

- **Real-time Streaming:** Live response streaming from LLM
- **Thinking Indicator:** Visual indicator showing when LLM is processing, with reasoning text
- **Reasoning Display:** Expandable/collapsible reasoning text that persists after thinking
- **Markdown Support:** Full markdown rendering with syntax highlighting
- **Code Highlighting:** Syntax highlighting for code blocks
- **File Attachments:** Support for image and file attachments in conversations

### Project & Conversation Management

- **Projects:** Organize conversations into projects
- **Conversation History:** Full conversation history with search
- **Project-based Organization:** Group related conversations under projects

### User Features

- **Profile Management:** Update user profile and settings
- **Workspace Settings:** Customize workspace preferences
- **Responsive Design:** Fully responsive UI for desktop and mobile

## Installation and Setup

### Prerequisites

- **Node.js** (v20 or higher)
- **npm** (v10 or higher)
- **Docker & Docker Compose** (for containerized deployment)
- **Git**

### Docker Setup (Recommended)

```bash

# 1. Build and start containers
docker compose -f docker-compose.dev.yml up -d

# 2. Access the application
# Client: http://localhost:3000
# Server API: http://localhost:4000
```

### Manual Setup (Local Development)

#### Server Setup

```bash
cd server

# Install dependencies
npm install

# Edit .env.local with your configuration

# Start development server
npm run dev
```

#### Client Setup

```bash
cd client

# Install dependencies
npm install

# Setup environment
cp .env.local .env
# Edit .env.local with your configuration

# Start development server
npm run dev
```

## Project Structure

```
.
├── client/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   ├── pageSections/  # Page sections/components
│   │   ├── queries/       # TanStack Query hooks
│   │   ├── lib/           # Utility functions
│   │   └── ...
│   ├── Dockerfile.dev     # Development Dockerfile
│   ├── Dockerfile.prod    # Production Dockerfile
│   └── ...
├── server/                # Fastify backend application
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access layer
│   │   ├── routes/        # API routes
│   │   ├── plugins/       # Fastify plugins
│   │   └── ...
│   ├── prisma/            # Prisma schema and migrations
│   ├── Dockerfile.dev     # Development Dockerfile
│   ├── Dockerfile.prod    # Production Dockerfile
│   └── ...
├── docker-compose.dev.yml # Development Docker Compose
├── docker-compose.prod.yml # Production Docker Compose
├── nginx.conf             # Nginx reverse proxy config (production)
└── docs/                  # Documentation
```

## Development

### Running Locally

```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm run dev
```

### Building for Production

```bash
# Server
cd server
npm run build
npm start

# Client
cd client
npm run build
npm start
```

## Docker Commands

```bash
# Development
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml logs -f
docker compose -f docker-compose.dev.yml down

# Production
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml down

# View logs
docker compose -f docker-compose.dev.yml logs server
docker compose -f docker-compose.dev.yml logs web
```

## Production Deployment

1. **Server Setup:**
   - Install Docker & Docker Compose
   - Install Nginx
   - Setup SSL certificates (Let's Encrypt)

2. **Configure Environment:**
   - Create `server/.env.prod` with production values
   - Create root `.env` with Docker Compose variables

3. **Deploy:**

   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

4. **Configure Nginx:**
   - Copy `nginx.conf` to `/etc/nginx/sites-available/tuandev.ru`
   - Create symlink: `sudo ln -s /etc/nginx/sites-available/tuandev.ru /etc/nginx/sites-enabled/`
   - Test: `sudo nginx -t`
   - Reload: `sudo systemctl reload nginx`

5. **Setup SSL:**
   ```bash
   sudo certbot --nginx -d tuandev.ru -d www.tuandev.ru
   ```
