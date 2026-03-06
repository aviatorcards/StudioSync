# StudioSync (Beta)

> **Note:** StudioSync is currently in active Beta. While it is feature-complete for most studio management tasks, please back up your data regularly as we approach a stable 1.0 release.

<div align="center">
  <img src="./frontend/public/logo.png" alt="StudioSync Logo" width="120" height="120" />
  <h3>Sync your music studio, students, and schedule — all in one place.</h3>
  <p>An open-source, self-hosted alternative to My Music Staff, built for the modern music educator.</p>
  
  [![License: GPL-3.0](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
  [![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
  [![Django](https://img.shields.io/badge/Django-5.0-092e20)](https://www.djangoproject.com/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ed)](https://www.docker.com/)
</div>

---

## ✨ Features

### 🎓 Student & Family Management

- **Comprehensive Student Profiles** – instrument, enrollment status, progress
- **Band/Group Organization** – groups, photos, members, genre
- **Enrollment History** – lesson counts, journey tracking

### 📅 Intelligent Scheduling & Lessons

- **Smart Calendar** – recurring patterns, conflict detection, online/in‑person lessons, cancellations, make‑ups, no‑show tracking
- **Rich Lesson Docs** – notes, practice assignments, ratings, repertoire, file attachments, visibility controls
- **Reusable Lesson Plans** – templates, skill‑level targeting, duration, tags, sharing

### 💰 Billing & Financial Management

- **Automated Invoicing** – from lessons, band‑level billing, tax, status tracking
- **Multiple Payment Methods** – cash, check, card with Stripe integration, Venmo, PayPal, Zelle, etc.
- **Financial Intelligence** – late‑fee automation, overdue alerts, saved payment methods, professional branding

### 📦 Inventory & Resource Management

- **Physical Inventory** – instruments, equipment, condition, location, low‑stock alerts
- **Digital Library** – PDFs, audio, video, external links, tagging, size/MIME tracking
- **Practice Room Reservations** – capacity, equipment, hourly rates, conflict detection, payment tracking

### 💬 Communication & Notifications

- **In‑App Messaging** – threaded, multi‑participant, attachments, read/unread, topics
- **Multi‑Channel Notifications** – email, SMS, push, lesson reminders, invoice alerts, resource notifications, system announcements (SMS has not been tested yet)

### 🎯 Goals & Progress Tracking

- **Student Goal Management** – targets, dates, percentage progress, status, notes, teacher collaboration

### 📊 Analytics & Reporting

- **Real‑Time Dashboard** – customizable widgets, quick stats, upcoming lessons, activity feed, studio health metrics
- **Exportable Reports** – student progress, financials, attendance, others - all able to export to Excel, CSV, or JSON

### 🏢 Studio Management

- **Studio Layout Editor** – 2D canvas (React‑Konva), drag‑drop rooms, item library, rotation, resizing, printing - (IN DEVELOPMENT)
- **Teacher Management** – profiles, specialties, hourly rates, availability, booking buffers, qualifications

### 🎨 Design System & Customization

- **Dynamic Theming** – 8+ color schemes, real‑time switching, dark mode (coming soon)
- **Appearance Customization** – font sizes, compact mode, CSS variables, glassmorphism, modern dialogs

### 🔐 Security & Access Control

- **Authentication** – email login, password recovery, session handling
- **Role‑Based Permissions** – Admin (full), Teacher (read-only billing), Student, Parent with granular controls and tailored dashboards
- **Enhanced Instructor Permissions** – Instructors (Teachers) now have read-only access to studio billing and invoices for transparency, while management remains restricted to Admin users.

### 🐳 Deployment & Infrastructure

- **One‑Command Docker** – full stack (PostgreSQL, Django Q, Django, Next.js) via Docker Compose

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js >= 20.9.0 (frontend development)
- Python 3.11+ (backend development)

### Installation (Docker Compose)

1. **Clone the repository**

   ```bash
   git clone https://github.com/aviatorcards/StudioSync.git
   cd StudioSync
   ```

2. **Launch Services**

   ```bash
   docker compose up -d
   ```

3. **Initialize Database**

   ```bash
   docker compose exec backend python manage.py migrate
   ```

4. **Run Setup Wizard**

   Open your browser and navigate to the interactive setup wizard to configure your studio and admin account:
   - **Setup Wizard:** http://localhost:3000/setup

5. **Access the Application**
   - **Frontend Dashboard:** http://localhost:3000
   - **API Docs:** http://localhost:8000/api/docs
   - **Django Admin:** http://localhost:8000/admin

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS + vanilla CSS
- **State/Data:** React Query, Context API
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Reports:** ExcelJS (Excel export)

### Backend

- **Framework:** Django 5.0 + Django REST Framework
- **Database:** PostgreSQL (data, cache, background tasks)
- **Real‑time:** Django Channels (InMemoryChannelLayer)
- **Task Queue:** Django Q

## 📂 Project Structure

```text
studiosync/
├── backend/            # Django REST API & core logic
│   ├── config/        # Settings & URL routing
│   ├── apps/          # Modular apps (students, lessons, billing, etc.)
│   └── scripts/       # Utility scripts
├── frontend/           # Next.js application
│   ├── app/           # App Router (pages & layouts)
│   ├── components/    # Reusable UI components
│   ├── contexts/      # Auth & appearance state
│   └── services/      # API communication layer
├── docs/               # Technical documentation
├── scripts/            # Deployment & maintenance scripts
└── docker-compose.yml  # Container orchestration
```

## 📄 License

Distributed under the GPL‑3.0 License. See `LICENSE` for more information.

---

<div align="center">
  Made with ❤️ by the StudioSync Team
</div>
