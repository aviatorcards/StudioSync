# Quick Start Guide — StudioSync

Get up and running in **5 minutes**.

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

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/aviatorcards/StudioSync.git
cd StudioSync
```

### 2. Start the Stack

```bash
cp .env.example .env        # copy default env (edit for production)
docker compose up -d
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createcachetable
```

### 3. Run the Setup Wizard

Open **http://localhost:3000/setup** in your browser. The wizard will ask you to create your admin account and configure your studio — name, timezone, currency, and optional SMTP settings.

> Your admin credentials are set here and are not hardcoded anywhere. Keep them safe.

### 4. Access the Application

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000/api |
| Django Admin | http://localhost:8000/admin |

---

## Populate with Demo Data (Optional)

After completing the setup wizard, you can seed realistic sample data for evaluation or client demos. Run these in order:

```bash
# Teachers and students (uses your existing admin + studio from /setup)
docker compose exec backend python seed_data.py

# Lessons, billing, families, goals, inventory
docker compose exec backend python seed_extra.py

# Digital resource library
docker compose exec backend python seed_resources.py
docker compose exec backend python seed_extra_resources.py

# Bands and gig marketplace
docker compose exec backend python seed_gigs.py
```

After seeding, the following demo accounts are available alongside your admin:

| Role | Email | Password |
|---|---|---|
| **Admin** | *(your /setup credentials)* | *(your /setup password)* |
| **Teacher** | `teacher1@test.com` | `teacher123` |
| **Student** | `gig_student1@test.com` | `student123` |

The login page includes quick-login buttons for the Teacher and Student roles.

### Seeding Configuration

| Variable | Description | Default |
|---|---|---|
| `SEED_TEACHER_PASSWORD` | Password for seeded teacher accounts | `teacher123` |
| `SEED_STUDENT_PASSWORD` | Password for seeded student accounts | `student123` |
| `SEED_STUDIO_TIMEZONE` | Timezone for new studio (if not set via wizard) | `America/New_York` |
| `SEED_STUDIO_CURRENCY` | Currency for new studio (if not set via wizard) | `USD` |

---

## Common Commands

### View Logs

```bash
docker compose logs -f           # all services
docker compose logs -f backend   # backend only
docker compose logs -f frontend  # frontend only
```

### Stop / Restart

```bash
docker compose down
docker compose restart
```

### Reset Everything (Start Fresh)

```bash
# WARNING: deletes all data and volumes
docker compose down -v
docker compose up -d
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createcachetable
# Then go to http://localhost:3000/setup again
```

### Manually Reset Demo Data

```bash
docker compose exec backend python manage.py reset_demo
```

This flushes the database and re-runs all seed scripts. You will need to go through `/setup` again afterwards.

---

## Troubleshooting

### "Port already in use"

```bash
# macOS / Linux
lsof -i :3000   # frontend
lsof -i :8000   # backend
lsof -i :5432   # postgres

# Windows
netstat -ano | findstr :3000
```

Change the conflicting port in `docker-compose.yml` or stop the process using it.

### Services Not Starting

```bash
docker info                   # check Docker is running
docker compose down
docker compose up -d
```

### Frontend Shows Connection Error

```bash
curl http://localhost:8000/api/core/setup-status/
```

If you get a JSON response, the backend is healthy. The frontend may take a minute to compile on first start.

---

## Next Steps

1. **Complete the setup wizard** at http://localhost:3000/setup
2. **Seed demo data** if showing the app to others
3. **Configure integrations** — Stripe, Twilio, Stream Chat — by editing `.env` and running `docker compose restart`
4. **Explore the docs** at http://localhost:3000/docs
