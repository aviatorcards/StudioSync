# Kottster API Testing Guide

This directory contains test scripts for the Kottster Admin API.

## Test Scripts

### 1. `quick-test.sh` - Quick Health Check

Fast test script that checks if all endpoints are responding correctly.

**Usage:**
```bash
# Without authentication (tests that auth is required)
./quick-test.sh

# With authentication (tests actual data retrieval)
export KOTTSTER_TOKEN='your-jwt-token-here'
./quick-test.sh
```

**What it tests:**
- HTTP status codes for all endpoints
- Authentication requirements
- Basic endpoint availability

### 2. `test-api.sh` - Comprehensive API Tests

Complete test suite that exercises all CRUD operations on all resources.

**Usage:**
```bash
# Set your JWT token
export KOTTSTER_TOKEN='your-jwt-token-here'

# Run all tests
./test-api.sh
```

**What it tests:**
- Feature Flags: list, create, update, delete, search
- Users: list, create, update, delete, filtering, search
- Studios: list, create, update, delete, search
- Teachers: list, create, update, delete, filtering
- Students: list, create, update, delete, filtering
- Lessons: list, create, update, cancel, delete, calendar view
- Error cases: 404, 400, 409
- Pagination and sorting
- Date range filtering

### 3. `get-token.sh` - JWT Token Helper

Helper script to obtain a JWT token from Django authentication.

**Usage:**
```bash
./get-token.sh <email> <password>

# Example
./get-token.sh admin@example.com password123
```

**Output:**
- Access token (for API requests)
- Refresh token (for renewing access)
- Instructions for using the token

## Getting Started

### Step 1: Make scripts executable

```bash
chmod +x quick-test.sh test-api.sh get-token.sh
```

### Step 2: Get a JWT token

Option A - Using the helper script:
```bash
./get-token.sh your-email@example.com your-password
```

Option B - Manually login to Django:
```bash
curl -X POST http://localhost:3000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

### Step 3: Export the token

```bash
export KOTTSTER_TOKEN='eyJ0eXAiOiJKV1QiLCJhbGc...'
```

### Step 4: Run tests

```bash
# Quick test
./quick-test.sh

# Full test suite
./test-api.sh
```

## Manual Testing Examples

### Health Check (No auth required)

```bash
curl http://localhost:5480/health
```

### List Users

```bash
curl -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  http://localhost:5480/api/users
```

### List Users with Pagination

```bash
curl -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/users?_page=1&_perPage=10"
```

### Search Users

```bash
curl -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/users?search=john"
```

### Filter Users by Role

```bash
curl -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/users?role=teacher&is_active=true"
```

### Create a User

```bash
curl -X POST \
  -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "first_name": "New",
    "last_name": "User",
    "role": "student"
  }' \
  http://localhost:5480/api/users
```

### Update a User

```bash
curl -X PUT \
  -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "555-1234",
    "timezone": "America/Los_Angeles"
  }' \
  http://localhost:5480/api/users/1
```

### Get Lessons Calendar View

```bash
curl -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/lessons/calendar?start=2025-01-01&end=2025-01-31"
```

### Create a Lesson

```bash
curl -X POST \
  -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teacher_id": 1,
    "student_id": 1,
    "scheduled_start": "2025-06-15T14:00:00Z",
    "scheduled_end": "2025-06-15T15:00:00Z",
    "duration": 60,
    "lesson_type": "regular",
    "status": "scheduled",
    "rate": 75.00
  }' \
  http://localhost:5480/api/lessons
```

### Cancel a Lesson

```bash
curl -X PATCH \
  -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  http://localhost:5480/api/lessons/1/cancel
```

## API Endpoints Reference

### Feature Flags
- `GET /api/feature-flags` - List all flags
- `GET /api/feature-flags/:id` - Get single flag
- `POST /api/feature-flags` - Create flag
- `PUT /api/feature-flags/:id` - Update flag
- `DELETE /api/feature-flags/:id` - Delete flag

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (soft delete)

### Studios
- `GET /api/studios` - List all studios
- `GET /api/studios/:id` - Get single studio
- `POST /api/studios` - Create studio
- `PUT /api/studios/:id` - Update studio
- `DELETE /api/studios/:id` - Delete studio

### Teachers
- `GET /api/teachers` - List all teachers
- `GET /api/teachers/:id` - Get single teacher
- `POST /api/teachers` - Create teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

### Students
- `GET /api/students` - List all students
- `GET /api/students/:id` - Get single student
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Lessons
- `GET /api/lessons` - List all lessons
- `GET /api/lessons/calendar` - Calendar view
- `GET /api/lessons/:id` - Get single lesson
- `POST /api/lessons` - Create lesson
- `PUT /api/lessons/:id` - Update lesson
- `PATCH /api/lessons/:id/cancel` - Cancel lesson
- `DELETE /api/lessons/:id` - Delete lesson

## Query Parameters

### Pagination
- `_page` - Page number (default: 1)
- `_perPage` - Items per page (default: 25)

### Sorting
- `_sort` - Field to sort by (default: created_at)
- `_order` - Sort order: ASC or DESC (default: DESC)

### Filtering (varies by resource)
- `search` - Text search
- `role` - Filter by user role
- `is_active` - Filter by active status
- `studio_id` - Filter by studio
- `teacher_id` - Filter by teacher
- `student_id` - Filter by student
- `status` - Filter by status
- `date_from` - Filter by start date
- `date_to` - Filter by end date

## Expected Responses

### Success (200 OK)
```json
{
  "data": [...],
  "total": 100
}
```

### Created (201 Created)
```json
{
  "id": 1,
  "email": "user@example.com",
  ...
}
```

### Not Found (404)
```json
{
  "error": "User not found"
}
```

### Bad Request (400)
```json
{
  "error": "Email, first name, and last name are required"
}
```

### Unauthorized (401)
```json
{
  "error": "No token provided"
}
```

### Conflict (409)
```json
{
  "error": "User with this email already exists"
}
```

## Troubleshooting

### "No token provided" error
Make sure you've set the `KOTTSTER_TOKEN` environment variable with a valid JWT token.

### "Invalid token" error
Your token may have expired. Get a new token using `get-token.sh`.

### Connection refused
Make sure the Kottster service is running:
```bash
docker ps | grep kottster
```

If not running:
```bash
docker compose up -d kottster
```

### Check service logs
```bash
docker logs studiosync-kottster-1 --tail 50
```

## Notes

- All endpoints (except `/health`) require JWT authentication
- Tokens expire after a certain period (configured in Django)
- Use the refresh token to get a new access token without re-authenticating
- Soft deletes are used for users (sets `is_active = false`)
- Hard deletes are used for other resources
- Scheduling conflict detection is implemented for lessons
