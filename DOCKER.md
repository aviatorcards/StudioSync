# Docker Quick Start Guide

## Current Setup Options

You have **3 Docker configurations** available:

### 1. **Simple SQLite Setup** (Recommended for Development)

```bash
docker compose -f docker-compose.simple.yml up
```

- ✅ No external database needed
- ✅ Quick start
- ✅ Persists data in Docker volume
- ✅ Perfect for testing and demos

### 2. **Minimal PostgreSQL Setup**

```bash
docker compose -f docker-compose.minimal.yml up
```

- Uses PostgreSQL database
- Good for production-like testing
- No Redis, MinIO, Celery (simplified)

### 3. **Full Environment Setup**

```bash
docker compose up
```

- PostgreSQL database
- MinIO for file storage
- Django Backend
- Next.js Frontend

## First-Time Setup

1. **Build and start containers:**

   ```bash
   docker compose -f docker-compose.simple.yml up --build
   ```

2. **Create admin user** (in a new terminal):

   ```bash
   docker compose -f docker-compose.simple.yml exec backend python create_test_user.py
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin: http://localhost:8000/admin

4. **Login with:**
   - Email: `admin@test.com`
   - Password: `admin123`

## Useful Commands

**Stop containers:**

```bash
docker compose -f docker-compose.simple.yml down
```

**View logs:**

```bash
docker compose -f docker-compose.simple.yml logs -f
```

**Rebuild after changes:**

```bash
docker compose -f docker-compose.simple.yml up --build
```

**Run migrations and create cache table:**

```bash
docker compose -f docker-compose.simple.yml exec backend python manage.py migrate
docker compose -f docker-compose.simple.yml exec backend python manage.py createcachetable
```

**Access Django shell:**

```bash
docker compose -f docker-compose.simple.yml exec backend python manage.py shell
```

## Volume Management

**List volumes:**

```bash
docker volume ls
```

**Remove all data (fresh start):**

```bash
docker compose -f docker-compose.simple.yml down -v
```

## Troubleshooting

**Port already in use?**

```bash
# Stop local dev servers first
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

**Container won't start?**

```bash
# Check logs
docker compose -f docker-compose.simple.yml logs backend
docker compose -f docker-compose.simple.yml logs frontend
```

**Need to reset everything?**

```bash
docker compose -f docker-compose.simple.yml down -v
docker system prune -a
```

## Cloud Deployment Ready

StudioSync's Docker setup is ready for deployment to:

- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**
- **DigitalOcean App Platform**
- **Fly.io**
- **Railway**
- **Render**

For production, switch to `docker-compose.yml` (full setup with PostgreSQL).
