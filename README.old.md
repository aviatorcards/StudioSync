# ⚠️⚠️⚠️ Warning ⚠️⚠️⚠️

## ‼️‼️‼️

## This project is currently in development and is not ready for production use. I am not responsible for any damage or loss of data that may occur as a result of using this project.

## ‼️‼️‼️

### StudioSync

<div align="center">
  <img src="./frontend/public/logo.png" alt="StudioSync Logo" width="120" height="120" />
  <h3>Sync your music studio, students, and schedule — all in one place.</h3>
  <p>An open-source, self-hosted alternative to My Music Staff, built for the modern music educator.</p>
  
  [![License: GPL-3.0](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
  [![Django](https://img.shields.io/badge/Django-5.0-092e20)](https://www.djangoproject.com/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ed)](https://www.docker.com/)
</div>

---

## ✨ Features

- 📅 **Intelligent Scheduling** - High-performance weekly calendar with recurring lessons, conflict detection, and a mobile-optimized view.
- 🎓 **Student & Family Management** - Comprehensive profiles, progress tracking, and group/family management.
- 🎸 **Bands & Ensemble Tracking** - Organize student groups, track practice sessions, and manage performances.
- 💰 **Billing & Invoicing** - Automated invoicing, payment tracking, and student account balance management.
- 📦 **Inventory & Resource Library** - Track studio equipment, instruments, and digital sheet music/files.
- 🏗️ **Customizable Dashboard** - Drag-and-drop layout with real-time analytics, upcoming lessons, and activity feeds.
- 🎨 **Modern Design System** - Premium, responsive UI with dynamic theming (8+ color schemes) and dark mode support.
- 📐 **Studio Layout Editor** - Interactive 2D editor to design and organize your music studio space.
- 🔐 **Role-Based Access** - Tailored experiences for Admins, Teachers, Students, and Parents.
- 🐳 **One-Command Deployment** - Fully containerized with Docker and Docker Compose.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js >= 20.9.0 (for local frontend development)
- Python 3.11+ (for local backend development)

### Installation (Docker Compose)

1. **Clone the repository**
   ```bash
   git clone https://github.com/fddl-dev/studiosync.git
   cd studiosync
   ```

2. **Launch Services**
   ```bash
   docker-compose up -d
   ```

3. **Initialize Database**
   ```bash
   docker-compose exec backend python manage.py migrate
   docker-compose exec backend python manage.py createsuperuser
   ```

4. **Access the App**
   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **API Docs:** [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
   - **Admin Portal:** [http://localhost:8000/admin](http://localhost:8000/admin)

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Vanilla CSS
- **State/Data:** React Query + Context API
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Interactivity:** dnd-kit (Dashboard), React-Konva (Studio Editor)
- **Charts:** Recharts

### Backend
- **Framework:** Django 5.0 + Django REST Framework
- **Database:** PostgreSQL
- **File Storage:** MinIO (S3-compatible)
- **Real-time:** Django Channels (WebSocket support)
- **Caching:** Redis

## 📂 Project Structure

```
studiosync/
├── backend/            # Django REST API & Core Logic
│   ├── config/        # Settings & URL routing
│   ├── apps/          # Modular apps (students, lessons, billing, etc.)
│   └── scripts/       # Utility scripts
├── frontend/           # Next.js Application
│   ├── app/           # App Router (Pages & Layouts)
│   ├── components/    # Reusable UI components
│   ├── contexts/      # Authentication & Appearance state
│   └── services/      # API communication layer
├── docs/               # Technical documentation
├── scripts/            # Deployment & maintainance scripts
└── docker-compose.yml  # Container orchestration
```

## 🎨 Design System

StudioSync features a custom-built design system focused on performance and clarity:
- **Dynamic Theming:** Users can choose their accent color (Teal, Blue, Indigo, Purple, Pink, Red, Orange, Green) in real-time.
- **Glassmorphism:** Subtle blur effects and elevated surfaces for a modern feel.
- **Mobile-First:** Every page is designed primarily for mobile usage without sacrificing desktop power.

## 🤝 Contributing

We welcome contributions of all kinds! 
1. Check the [Roadmap](ROADMAP.md) for upcoming tasks.
2. Fork the repo and create your feature branch: `git checkout -b feature/cool-feature`.
3. Submit a Pull Request.

## 📄 License

Distributed under the GPL-3.0 License. See `LICENSE` for more information.

---
<div align="center">
  Made with ❤️ by the StudioSync Team
</div>
