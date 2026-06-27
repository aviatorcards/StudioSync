# Getting Started

## Quick Start (Docker)

The fastest way to get StudioSync running locally is using Docker Compose.

### 1. Clone the Repository

```bash
git clone https://github.com/aviatorcards/StudioSync.git
cd StudioSync
```

### 2. Start the Environment

```bash
cp .env.example .env
docker compose up -d
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createcachetable
```

### 3. Run the Setup Wizard

Visit **http://localhost:3000/setup** to create your admin account and configure your studio. This is where you set your email, password, studio name, timezone, and currency.

> The setup wizard is the only place that creates the admin account. No credentials are hardcoded — what you enter here is what you use to log in.

### 4. Seed Demo Data (Optional)

After the wizard completes, you can populate the app with sample data for evaluation or demos:

```bash
docker compose exec backend python seed_data.py          # teachers, students
docker compose exec backend python seed_extra.py         # lessons, billing, inventory
docker compose exec backend python seed_resources.py     # digital library
docker compose exec backend python seed_extra_resources.py
docker compose exec backend python seed_gigs.py          # bands, gig marketplace
```

Seeded demo accounts:

| Role | Email | Password |
|---|---|---|
| **Admin** | *(your /setup credentials)* | *(your /setup password)* |
| **Teacher** | `teacher1@test.com` | `teacher123` |
| **Student** | `gig_student1@test.com` | `student123` |

---

## Manual Installation (Development)

If you prefer to run services locally without Docker:

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL
- Redis

### Backend Setup

```bash
cd backend
uv run python manage.py migrate
uv run python manage.py createcachetable
uv run python manage.py runserver   # runs on :8000
```

In a separate terminal, start the background task worker:

```bash
cd backend
uv run python manage.py qcluster
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev   # runs on :3000
```

Visit **http://localhost:3000/setup** to complete the setup wizard, then **http://localhost:3000** to use the app.
