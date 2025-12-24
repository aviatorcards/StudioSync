# Quick Start Guide - Music Studio Manager

Get the demo up and running in **5 minutes**!

## Prerequisites

### 1. Install Docker Desktop

**macOS:**
```bash
# Option 1: Download from Docker website
open https://www.docker.com/products/docker-desktop/

# Option 2: Install via Homebrew
brew install --cask docker
```

After installation, open Docker Desktop and wait for it to start.

### 2. Verify Docker is Running

```bash
docker --version
docker-compose --version
```

You should see version numbers if Docker is installed correctly.

---

## Getting Started

### 1. Navigate to the Project

```bash
cd /Users/tristan/Documents/words/coaching/music-studio-manager
```

### 2. Run the Setup Script

```bash
./scripts/init-demo.sh
```

This script will:
- Start all Docker services
- Run database migrations
- Create a demo superuser
- Display access URLs

### 3. Access the Application

Once the script completes:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **Admin Panel:** http://localhost:8000/admin

**Demo Login:**
- Email: `admin@demo.com`
- Password: `demo123`

---

## Manual Setup (Alternative)

If you prefer to run commands manually:

```bash
# 1. Start all services
docker-compose up -d

# 2. Wait for services to be ready (about 30 seconds)
sleep 30

# 3. Run database migrations
docker-compose exec backend python manage.py migrate

# 4. Create superuser (follow prompts)
docker-compose exec backend python manage.py createsuperuser

# 5. Access the app
open http://localhost:3000
```

---

## Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### Reset Database
```bash
# WARNING: This deletes all data!
docker-compose down -v
docker-compose up -d
docker-compose exec backend python manage.py migrate
```

---

## Troubleshooting

### "Port already in use" Error

If you see port conflicts:

```bash
# Check what's using the ports
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # PostgreSQL

# Stop the conflicting process or change ports in docker-compose.yml
```

### Services Not Starting

```bash
# Check Docker is running
docker info

# Restart Docker Desktop and try again
docker-compose down
docker-compose up -d
```

### Frontend Shows Connection Error

Make sure backend is running:
```bash
curl http://localhost:8000/admin
```

If you get a response, backend is running. The frontend might take a minute to compile on first start.

---

## Next Steps

1. **Explore the Admin Panel** - Add students, teachers, and schedule lessons
2. **Check the API** - Visit http://localhost:8000/admin to see available endpoints
3. **Review the Models** - See the [walkthrough](file:///Users/tristan/.gemini/antigravity/brain/fb6f429c-07b9-4481-a5d4-ffe2a23bcdeb/walkthrough.md) for database schema

---

## Minimal Demo Setup

For the lightest possible demo, you can run just the essentials:

```bash
# Use the minimal docker-compose
docker-compose -f docker-compose.minimal.yml up -d
```

This runs only:
- PostgreSQL
- Django Backend
- Next.js Frontend

(No Redis, MinIO, or Celery for simplicity)
