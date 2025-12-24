# Architecture

StudioSync follows a modern, decoupled architecture with a clear separation between the backend API and the frontend user interface.

## Tech Stack

The application is built using the following technologies:

- **Frontend**: [Next.js](https://nextjs.org/) (React) with TypeScript and Tailwind CSS.
- **Backend**: [Django REST Framework](https://www.django-rest-framework.org/) (Python) for the API.
- **Database**: [PostgreSQL](https://www.postgresql.org/) for relational data.
- **Caching & Tasks**: [Redis](https://redis.io/) and [Celery](https://docs.celeryq.dev/) for asynchronous background tasks.
- **File Storage**: [AWS S3](https://aws.amazon.com/s3/) (or [MinIO](https://min.io/) for local development) for media and document storage.
- **Infrastructure**: [Docker](https://www.docker.com/) and Docker Compose for orchestration.

## Component Overview

### Backend (Django)
The backend acts as a headless API provider. It is organized into modular apps:
- `core`: User management, studio settings, multi-tenancy, and common utilities.
- `lessons`: Calendar, scheduling, and attendance tracking.
- `billing`: Invoicing, payments, and financial tracking.
- `inventory`: Instrument and equipment tracking.
- `notifications`: Real-time and persistent notification system.
- `messaging`: Internal messaging between users.

### Frontend (Next.js)
The frontend uses the App Router and serves various roles:
- **Public**: Marketing site and informational pages.
- **Dashboard**: Protected application area for Admins, Teachers, and Students.
- **Client Sites**: Subdomain-based public profiles for studios.

### Authentication
JWT-based authentication is used for secure API communication. The frontend stores tokens securely and handles session management.

## Deployment Model
StudioSync is designed for cloud deployment using Docker. It supports horizontal scaling of the API and web servers, with managed services for the database and storage.
