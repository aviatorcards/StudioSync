# StudioSync

Sync your music studio, students, and schedule — all in one place. An open-source, self-hosted alternative to My Music Staff.

## Features

- 🎓 **Student & Family Management** - Track students, families, and guardians
- 📅 **Intelligent Scheduling** - Private/group lessons, recurring patterns, conflict detection
- 📝 **Lesson Notes & Progress** - Rich lesson notes with assignments and progress tracking
- 💰 **Billing & Invoicing** - Automated invoicing, payment tracking, multiple payment methods
- 📦 **Inventory Management** - Track studio equipment, instruments, and lending
- 📚 **Resource Library** - Digital file sharing and physical item lending
- 💬 **Communication** - In-app messaging, email, and SMS notifications
- 👥 **Multi-Teacher Studios** - Support for studios with multiple instructors and simplified specialty management
- 🔐 **Role-Based Access** - Different permissions for admins, teachers, students, and parents
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🐳 **Docker Ready** - Easy deployment with Docker Compose

## Tech Stack

### Backend
- **Django 5.0** - Python web framework
- **Django REST Framework** - RESTful API
- **PostgreSQL** - Relational database
- **MinIO** - S3-compatible file storage

### Frontend
- **Next.js 14** - React framework with SSR (requires Node.js >= 20.9.0)
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS
- **React Query** - Data fetching and caching
- **shadcn/ui** - Accessible UI components

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd studiosync
```

2. **Start the services**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- MinIO on ports 9000 (API) and 9001 (Console)
- Django backend on port 8000
- Next.js frontend on port 3000

3. **Run initial migrations**
```bash
docker compose exec backend python manage.py migrate
```

4. **Create a superuser**
```bash
docker compose exec backend python manage.py createsuperuser
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin
- MinIO Console: http://localhost:9001

### Development Setup

For local development without Docker:

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:** (Requires Node.js >= 20.9.0)
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
studiosync/
├── backend/                 # Django backend
│   ├── config/             # Django settings and configuration
│   ├── apps/               # Django applications
│   │   ├── core/           # Core models (User, Studio, Teacher, Student)
│   │   ├── auth/           # Authentication
│   │   ├── students/       # Student management
│   │   ├── lessons/        # Lesson scheduling and notes
│   │   ├── billing/        # Invoicing and payments
│   │   ├── inventory/      # Equipment and lending management
│   │   ├── resources/      # File and resource management
│   │   ├── messaging/      # Communication
│   │   └── notifications/  # System notifications
│   └── requirements.txt
├── frontend/               # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── lib/              # Utilities and helpers
│   └── package.json
├── docs/                  # Documentation
└── docker-compose.yml
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=music_studio
DB_USER=studio_user
DB_PASSWORD=studio_password
DB_HOST=db
DB_PORT=5432

# MinIO
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minio_admin
MINIO_SECRET_KEY=minio_password
MINIO_BUCKET=music-studio

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
DEFAULT_FROM_EMAIL=noreply@yourstudio.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Database Models

### Core
- **User** - Custom user model with role-based authentication
- **Studio** - Music studio/school entity
- **Teacher** - Teacher profiles with rates and availability
- **Student** - Student profiles with progress tracking
- **Family** - Family grouping for billing

### Lessons
- **Lesson** - Individual lesson instances
- **RecurringPattern** - Recurring lesson schedules
- **LessonNote** - Detailed lesson notes and assignments
- **StudentGoal** - Student goals and progress

### Billing
- **Invoice** - Invoices for families
- **InvoiceLineItem** - Individual line items
- **Payment** - Payment records
- **PaymentMethod** - Saved payment methods

### Resources
- **Resource** - Digital files and physical items
- **ResourceCheckout** - Lending library tracking

### Messaging
- **MessageThread** - Conversation threads
- **Message** - Individual messages
- **Notification** - System notifications (email, SMS, in-app)

## API Documentation

The API follows REST principles and uses JWT authentication.

### Authentication
```
POST /api/auth/login/       # Login
POST /api/auth/register/    # Register
POST /api/auth/refresh/     # Refresh access token
POST /api/auth/logout/      # Logout
```

### Students
```
GET    /api/students/                # List students
POST   /api/students/                # Create student
GET    /api/students/{id}/           # Get student details
PUT    /api/students/{id}/           # Update student
DELETE /api/students/{id}/           # Delete student
```

### Lessons
```
GET    /api/lessons/                 # List lessons
POST   /api/lessons/                 # Schedule lesson
GET    /api/lessons/{id}/            # Get lesson details
PUT    /api/lessons/{id}/            # Update lesson
DELETE /api/lessons/{id}/            # Cancel lesson
POST   /api/lessons/{id}/notes/      # Add lesson note
```

### Billing
```
GET    /api/billing/invoices/        # List invoices
POST   /api/billing/invoices/        # Create invoice
GET    /api/billing/invoices/{id}/   # Get invoice
POST   /api/billing/payments/        # Record payment
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the GPL License - see the LICENSE file for details.

## Roadmap

- [ ] v1.0 - MVP Release
  - [x] Core backend models
  - [x] REST API endpoints
  - [x] Authentication system
  - [x] Frontend UI components
  - [x] Calendar integration
  - [x] Basic invoicing
  - [x] Inventory management
- [ ] v1.1 - Enhanced Features
  - [ ] Live payment processing (Stripe)
  - [ ] Advanced reporting
  - [ ] Mobile app (React Native)
- [ ] v2.0 - Enterprise Features
  - [ ] Multi-tenant SaaS mode
  - [ ] Advanced analytics
  - [ ] Plugin architecture
  - [ ] White-label customization

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Acknowledgments

- Built with Django and Next.js
- UI components from shadcn/ui
