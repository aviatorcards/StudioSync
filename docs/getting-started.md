# Getting Started

## Quick Start (Docker)

The fastest way to get StudioSync running locally is using Docker Compose.

### 1. Clone the Repository

```bash
git clone https://github.com/fddl-dev/studiosync.git
cd music-studio-manager
```

### 2. Start the Environment

```bash
docker compose up --build
```

This will start the backend, frontend, database, and all necessary services.

### 3. Initialize Database and Setup

Run the following to initialize the database:

```bash
docker-compose exec backend python manage.py migrate
```

Visit the Setup Wizard at `http://localhost:3000/setup` to create your studio and admin account interactively. Then navigate to `http://localhost:3000` to access the application.

---

## Manual Installation (Development)

If you prefer to run services manually:

### 1. Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL
- MinIO (for local S3 storage)

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to see the application.
