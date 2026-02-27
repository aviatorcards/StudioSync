# Quick Start Guide - Music Studio Manager

Get the demo up and running in **5 minutes**!

## Prerequisites

### 1. Install Docker Desktop

Download and install Docker Desktop for your operating system:

- **[Download Docker Desktop](https://www.docker.com/products/docker-desktop/)**

Alternatively, use a package manager:

- **macOS:** `brew install --cask docker`
- **Windows:** `winget install Docker.DockerDesktop`
- **Linux:** Follow the [official installation guide](https://docs.docker.com/engine/install/) for your distribution.

After installation, open Docker Desktop and wait for it to start.

### 2. Verify Docker is Running

```bash
docker --version
docker compose --version
```

You should see version numbers if Docker is installed correctly.

---

## Getting Started

### 1. Navigate to the Project

Open your terminal and navigate to the root directory of the project. If you just cloned it, you're likely already there:

```bash
cd StudioSync
```

### 2. Run the Setup Script

On macOS or Linux, you first need to make the script executable, then run it:

```bash
chmod +x ./scripts/init-demo.sh
./scripts/init-demo.sh
```

This script will:

- Start all Docker services (Postgres, Backend, Django Q, Frontend)
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

## 🏗 Populate with Demo Data (Seeding)

To see the application in action with realistic data (Students, Teachers, Lessons, Invoices, and Resources), use the built-in seeding scripts.

**Run these from your terminal:**

```bash
# 1. Foundation: Admin, Studio, 5 Teachers, 20 Students
docker compose exec backend python seed_data.py

# 2. Activity: Families, Bands, Lessons, Invoices, Goals
docker compose exec backend python seed_extra.py

# 3. Library: PDF/Audio resources and Setlists
docker compose exec backend python seed_resources.py
docker compose exec backend python seed_extra_resources.py
```

### 🔐 Seeding Credentials

After seeding, you can log in with these default accounts:

| Role        | Email               | Password     |
| :---------- | :------------------ | :----------- |
| **Admin**   | `admin@test.com`    | `admin123`   |
| **Teacher** | `teacher1@test.com` | `teacher123` |
| **Student** | `student1@test.com` | `student123` |

---

## Manual Setup (Alternative)

If you prefer to run commands manually:

```bash
# 1. Start all services
docker compose up -d

# 2. Wait for services to be ready (about 30 seconds)
sleep 30

# 3. Run database migrations and create cache table
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createcachetable

# 4. Create superuser (follow prompts)
docker compose exec backend python manage.py createsuperuser

# 5. Access the app
# Open http://localhost:3000 in your browser
```

---

## Common Commands

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

### Stop Services

```bash
docker compose down
```

### Restart Services

```bash
docker compose restart
```

### Reset Database

```bash
# WARNING: This deletes all data!
docker compose down -v
docker compose up -d
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createcachetable
```

---

## Troubleshooting

### "Port already in use" Error

If you see port conflicts:

```bash
# macOS / Linux:
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # PostgreSQL

# Windows (Command Prompt):
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :5432
```

# Stop the conflicting process or change ports in docker-compose.yml

### Services Not Starting

```bash
# Check Docker is running
docker info

# Restart Docker Desktop and try again
docker compose down
docker compose up -d
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
3. **Review the Models** - See the [README.md](./README.md) for more details.

---

## Minimal Demo Setup

For the lightest possible demo, you can run just the essentials:

```bash
# Use the minimal docker compose
docker compose -f docker-compose.minimal.yml up -d
```

This runs only:

- PostgreSQL
- Django Backend (with Django Q)
- Next.js Frontend

(No external Redis or Celery needed as functionality is consolidated into Postgres)
