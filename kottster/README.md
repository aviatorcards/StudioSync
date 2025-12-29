# StudioSync Kottster Admin Panel

Modern admin panel for StudioSync built with [Kottster](https://github.com/kottster/kottster).

## Features

- **Admin Panel**: Complete CRUD interface for all StudioSync models
- **Feature Flags**: Dynamic feature control system
- **Analytics Dashboards**: Real-time metrics and visualizations
- **Role-Based Access**: Secure permission system (admin, teacher, student, parent)
- **JWT Authentication**: Integrates with Django authentication

## Architecture

- **Framework**: Kottster (Node.js/TypeScript)
- **Database**: PostgreSQL (shared with Django)
- **Cache**: Redis
- **Auth**: JWT token validation (Django SECRET_KEY)
- **Port**: 5480

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose (for containerized deployment)

### Installation

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build
npm start
```

### Docker Deployment

The Kottster service is included in the main `docker-compose.yml`:

```bash
# Start all services including Kottster
docker-compose up -d

# View Kottster logs
docker-compose logs -f kottster

# Restart Kottster only
docker-compose restart kottster
```

Access the admin panel at: http://localhost:5480

## Configuration

Environment variables (set in `.env` or `docker-compose.yml`):

- `KOTTSTER_PORT` - Server port (default: 5480)
- `DATABASE_HOST` - PostgreSQL host
- `DATABASE_PORT` - PostgreSQL port (default: 5432)
- `DATABASE_NAME` - Database name
- `DATABASE_USER` - Database user
- `DATABASE_PASSWORD` - Database password
- `DJANGO_SECRET_KEY` - Django secret key (for JWT validation)
- `REDIS_URL` - Redis connection URL
- `INTERNAL_API_SECRET` - Internal service authentication secret
- `FRONTEND_URL` - Frontend URL (for CORS)
- `BACKEND_URL` - Backend URL (for CORS)

## Project Structure

```
kottster/
├── src/
│   ├── config/
│   │   ├── app.ts          # Application configuration
│   │   ├── database.ts     # PostgreSQL connection
│   │   └── cors.ts         # CORS settings
│   ├── middleware/
│   │   ├── auth.ts         # JWT validation
│   │   ├── permissions.ts  # Role-based access control
│   │   └── rowLevelSecurity.ts  # Data filtering by studio/user
│   ├── pages/
│   │   ├── dashboard/      # Analytics dashboards
│   │   ├── invoices/       # Invoice management
│   │   ├── lessons/        # Lesson scheduling
│   │   └── students/       # Student management
│   └── index.ts            # Main application entry
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## Authentication

Kottster validates JWT tokens issued by Django:

1. User authenticates via Django → receives JWT
2. Frontend passes JWT to Kottster in `Authorization: Bearer <token>` header
3. Kottster validates JWT using Django's SECRET_KEY
4. User permissions enforced based on role

## Permissions

Four roles with hierarchical permissions:

- **admin**: Full access to all resources
- **teacher**: Access to students, lessons, resources (filtered by studio)
- **student**: Access to own lessons, resources
- **parent**: Access to children's data

## Development

### Adding New Pages

1. Create page config in `src/pages/{resource}/`
2. Define permissions in `src/middleware/permissions.ts`
3. Add routes in `src/index.ts`

### Database Queries

Use parameterized queries to prevent SQL injection:

```typescript
import { query } from './config/database';

const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
```

## Security

- JWT token validation
- Role-based access control (RBAC)
- Row-level security (studio/user filtering)
- Rate limiting (100 requests / 15 minutes)
- CORS protection
- Helmet.js security headers
- SQL injection prevention (parameterized queries)

## License

GPL-3.0 (same as StudioSync)
