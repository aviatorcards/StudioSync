# Database Seeding & Demo Lab Guide

This project includes a battery of scripts specifically designed to populate your local database with realistic data for development, testing, and demo purposes.

## 🚀 Quick Start (Demo Order)

To get a fully-populated studio with students, teachers, billing, and resources, run the scripts in this exact order:

```bash
# 1. Core Data (Required) - Creates Admin, Studio, 5 Teachers, 20 Students
python3 seed_data.py

# 2. Advanced Data - Creates Families, Bands, Inventory, Lessons, and Billing
python3 seed_extra.py

# 3. Content - Adds PDF/Audio resources, Setlists, and Links
python3 seed_resources.py
python3 seed_extra_resources.py
```

---

## 🛠 Script Breakdown

### 1. [seed_data.py](backend/seed_data.py) (The Foundation)

**Purpose:** Sets up the essential "skeleton" of the application.

- **Admin:** `admin@test.com` / `admin123`
- **Studio:** "StudioSync Academy"
- **Personnel:** 5 Teachers and 20 Students with randomized names/instruments.
- **Auto-Setup:** Marks the "Setup Wizard" as completed so you can jump straight to the dashboard.

### 2. [seed_extra.py](backend/seed_extra.py) (The Experience)

**Purpose:** Generates "active" data to make the app look busy and realistic.

- **Families:** Links students into families with parent accounts.
- **Bands:** Groups students into bands (e.g., "The Rocking Notes").
- **Inventory/Rooms:** Populates the equipment list and sets up practice room reservations.
- **Lessons:** Generates both **past completed lessons** (with notes) and **future scheduled lessons**.
- **Billing:** Creates invoices (Paid, Sent, Overdue) and links them to students/bands.
- **Goals:** Adds student goals (e.g., "Master C Major Scale") with progress tracking.

### 3. [seed_resources.py](backend/seed_resources.py) & [seed_extra_resources.py](backend/seed_extra_resources.py)

**Purpose:** Adds "real" file content to the library.

- **Types:** PDFs, MP3 samples, External Links, and Physical Items.
- **Setlists:** Creates curated collections like "Autumn Leaves Preparation" or "Spring Recital 2026".

---

## 🔐 Credentials for Testing

| Role            | Email                                        | Password     |
| :-------------- | :------------------------------------------- | :----------- |
| **Admin/Staff** | `admin@test.com`                             | `admin123`   |
| **Teacher**     | `teacher1@test.com` ... `teacher5@test.com`  | `teacher123` |
| **Student**     | `student1@test.com` ... `student20@test.com` | `student123` |
| **Parent**      | `parent1@test.com`                           | `parent123`  |

---

## ⚙️ Configuration & Security

By default, these scripts use "Development Mode" with the insecure passwords listed above. For CI/Production environments, you can toggle security:

- **`SEED_SECURE_MODE=true`**: Requires passwords to be provided via environment variables.
- **`SEED_ADMIN_PASSWORD`**: Set a custom password for the spawned admin.
- **`SEED_TEACHER_PASSWORD`**: Set a custom password for teachers.

> [!TIP]
> If you need to "reset" your demo environment, the best way is to `docker compose down -v` (to wipe the volume) and then rerun these scripts.
