# API Reference

StudioSync provides a comprehensive RESTful API powered by Django REST Framework. This document outlines the available endpoints, authentication, and usage examples.

## Base URL

```
Development: http://localhost:8000/api
Production: https://your-domain.com/api
```

## Authentication

### JWT Token Authentication

StudioSync uses JSON Web Tokens (JWT) for API authentication.

#### Obtaining Tokens

**Endpoint:** `POST /api/auth/login/`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "teacher"
  }
}
```

#### Using Tokens

Include the access token in the Authorization header:

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

#### Refreshing Tokens

**Endpoint:** `POST /api/auth/refresh/`

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:**
```json
{
  "access": "new_access_token_here"
}
```

#### Logout

**Endpoint:** `POST /api/auth/logout/`

Invalidates the refresh token.

## Core Endpoints

### User Management

#### Get Current User Profile

```
GET /api/core/users/me/
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "teacher",
  "phone_number": "+1234567890",
  "avatar": "url-to-avatar",
  "created_at": "2025-01-01T00:00:00Z"
}
```

#### Update User Profile

```
PATCH /api/core/users/me/
```

**Request:**
```json
{
  "first_name": "Jane",
  "phone_number": "+0987654321"
}
```

#### Change Password

```
POST /api/core/users/change-password/
```

**Request:**
```json
{
  "old_password": "current_password",
  "new_password": "new_secure_password"
}
```

### Studio Management

#### List Studios

```
GET /api/core/studios/
```

Returns studios the current user has access to.

#### Get Current Studio

```
GET /api/core/studios/current/
```

Returns the active studio for the current user.

#### Update Studio Settings

```
PATCH /api/core/studios/{id}/
```

**Request:**
```json
{
  "name": "Updated Studio Name",
  "settings": {
    "timezone": "America/New_York",
    "currency": "USD"
  }
}
```

### Teachers

#### List Teachers

```
GET /api/core/teachers/
```

**Query Parameters:**
- `is_accepting_students`: Filter by availability
- `specialty`: Filter by instrument/specialty

#### Get Teacher Details

```
GET /api/core/teachers/{id}/
```

**Response:**
```json
{
  "id": "uuid",
  "user": {
    "id": "uuid",
    "email": "teacher@example.com",
    "first_name": "John",
    "last_name": "Smith"
  },
  "bio": "Experienced piano teacher...",
  "specialties": ["piano", "theory"],
  "hourly_rate": "50.00",
  "is_accepting_students": true
}
```

#### Create Teacher Profile

```
POST /api/core/teachers/
```

### Students

#### List Students

```
GET /api/core/students/
```

**Query Parameters:**
- `family`: Filter by family ID
- `teacher`: Filter by primary teacher
- `skill_level`: Filter by skill level
- `is_active`: Filter by active status

#### Get Student Details

```
GET /api/core/students/{id}/
```

#### Create Student

```
POST /api/core/students/
```

**Request:**
```json
{
  "user": {
    "email": "student@example.com",
    "first_name": "Sarah",
    "last_name": "Johnson",
    "password": "secure_password"
  },
  "instrument": "violin",
  "specialties": ["violin"],
  "skill_level": "beginner",
  "date_of_birth": "2010-05-15",
  "emergency_contact_name": "Parent Name",
  "emergency_contact_phone": "+1234567890"
}
```

#### Update Student

```
PATCH /api/core/students/{id}/
```

#### Delete Student

```
DELETE /api/core/students/{id}/
```

### Families

#### List Families

```
GET /api/core/families/
```

#### Create Family

```
POST /api/core/families/
```

**Request:**
```json
{
  "name": "Johnson Family",
  "primary_contact": "user-uuid",
  "phone_number": "+1234567890",
  "billing_email": "billing@example.com",
  "address": "123 Main St, City, State 12345"
}
```

## Lessons Endpoints

### Lessons

#### List Lessons

```
GET /api/lessons/
```

**Query Parameters:**
- `teacher`: Filter by teacher ID
- `student`: Filter by student ID
- `status`: Filter by lesson status
- `start_date`: Filter lessons after date
- `end_date`: Filter lessons before date

**Response:**
```json
{
  "count": 100,
  "next": "url-to-next-page",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "teacher": {...},
      "student": {...},
      "scheduled_start": "2025-01-15T14:00:00Z",
      "scheduled_end": "2025-01-15T15:00:00Z",
      "location": "Room 101",
      "lesson_type": "private",
      "status": "scheduled"
    }
  ]
}
```

#### Create Lesson

```
POST /api/lessons/
```

**Request:**
```json
{
  "teacher": "teacher-uuid",
  "student": "student-uuid",
  "scheduled_start": "2025-01-20T14:00:00Z",
  "scheduled_end": "2025-01-20T15:00:00Z",
  "location": "Room 101",
  "lesson_type": "private"
}
```

#### Update Lesson

```
PATCH /api/lessons/{id}/
```

#### Cancel Lesson

```
POST /api/lessons/{id}/cancel/
```

**Request:**
```json
{
  "cancellation_reason": "Student illness"
}
```

#### Get Calendar View

```
GET /api/lessons/calendar/
```

**Query Parameters:**
- `start`: Calendar start date (ISO format)
- `end`: Calendar end date (ISO format)
- `teacher`: Filter by teacher
- `student`: Filter by student

Returns lessons formatted for calendar display.

### Lesson Notes

#### List Lesson Notes

```
GET /api/lessons/{lesson_id}/notes/
```

#### Create Lesson Note

```
POST /api/lessons/{lesson_id}/notes/
```

**Request:**
```json
{
  "summary": "Great progress on scales today",
  "topics_covered": ["C Major scale", "Music theory basics"],
  "assignments": ["Practice scale 10 min daily", "Read chapter 3"],
  "strengths": ["Good rhythm", "Improving technique"],
  "challenges": ["Hand position needs work"],
  "visible_to_student": true,
  "visible_to_parent": true
}
```

### Student Goals

#### List Student Goals

```
GET /api/lessons/goals/
```

**Query Parameters:**
- `student`: Filter by student ID
- `status`: Filter by status (active, achieved, abandoned)

#### Create Goal

```
POST /api/lessons/goals/
```

**Request:**
```json
{
  "student": "student-uuid",
  "title": "Learn Für Elise",
  "description": "Master the complete piece",
  "target_date": "2025-06-01",
  "progress_percentage": 0
}
```

#### Update Goal Progress

```
PATCH /api/lessons/goals/{id}/
```

**Request:**
```json
{
  "progress_percentage": 50,
  "status": "active"
}
```

### Recurring Patterns

#### List Recurring Patterns

```
GET /api/lessons/recurring-patterns/
```

#### Create Recurring Pattern

```
POST /api/lessons/recurring-patterns/
```

**Request:**
```json
{
  "teacher": "teacher-uuid",
  "student": "student-uuid",
  "frequency": "weekly",
  "day_of_week": "tuesday",
  "time": "14:00:00",
  "duration_minutes": 60,
  "start_date": "2025-01-15",
  "end_date": "2025-06-01"
}
```

### Lesson Plans

#### List Lesson Plans

```
GET /api/lessons/plans/
```

**Query Parameters:**
- `specialty`: Filter by instrument
- `target_level`: Filter by skill level
- `is_public`: Show only public plans

#### Create Lesson Plan

```
POST /api/lessons/plans/
```

## Billing Endpoints

### Invoices

#### List Invoices

```
GET /api/billing/invoices/
```

**Query Parameters:**
- `status`: Filter by invoice status
- `band`: Filter by band/family
- `start_date`, `end_date`: Filter by date range

#### Get Invoice Details

```
GET /api/billing/invoices/{id}/
```

**Response:**
```json
{
  "id": "uuid",
  "invoice_number": "INV-2025-001",
  "band": {...},
  "status": "sent",
  "issue_date": "2025-01-01",
  "due_date": "2025-01-15",
  "subtotal": "200.00",
  "tax": "16.00",
  "total": "216.00",
  "amount_paid": "0.00",
  "balance_due": "216.00",
  "line_items": [
    {
      "description": "Piano Lesson - 60 min",
      "quantity": 4,
      "unit_price": "50.00",
      "total_price": "200.00"
    }
  ]
}
```

#### Create Invoice

```
POST /api/billing/invoices/
```

**Request:**
```json
{
  "band": "band-uuid",
  "issue_date": "2025-01-01",
  "due_date": "2025-01-15",
  "line_items": [
    {
      "description": "Piano Lessons",
      "quantity": 4,
      "unit_price": "50.00"
    }
  ]
}
```

#### Send Invoice

```
POST /api/billing/invoices/{id}/send/
```

Sends invoice email to the customer.

### Payments

#### List Payments

```
GET /api/billing/payments/
```

#### Record Payment

```
POST /api/billing/payments/
```

**Request:**
```json
{
  "invoice": "invoice-uuid",
  "amount": "216.00",
  "payment_method": "credit_card",
  "transaction_id": "txn_123456",
  "notes": "Paid via Stripe"
}
```

## Inventory Endpoints

### Inventory Items

#### List Inventory

```
GET /api/inventory/
```

**Query Parameters:**
- `category`: Filter by category
- `status`: Filter by status
- `is_borrowable`: Filter borrowable items

#### Get Item Details

```
GET /api/inventory/{id}/
```

#### Create Inventory Item

```
POST /api/inventory/
```

**Request:**
```json
{
  "name": "Yamaha Acoustic Guitar",
  "category": "instrument",
  "quantity": 3,
  "available_quantity": 3,
  "condition": "excellent",
  "location": "Room 5 - Cabinet A",
  "value": "500.00",
  "is_borrowable": true,
  "max_checkout_days": 7
}
```

### Checkouts

#### List Checkouts

```
GET /api/inventory/checkouts/
```

**Query Parameters:**
- `status`: Filter by checkout status
- `student`: Filter by student
- `item`: Filter by inventory item

#### Request Checkout

```
POST /api/inventory/checkouts/
```

**Request:**
```json
{
  "item": "item-uuid",
  "quantity": 1,
  "due_date": "2025-01-22"
}
```

#### Approve Checkout

```
POST /api/inventory/checkouts/{id}/approve/
```

#### Mark as Returned

```
POST /api/inventory/checkouts/{id}/return/
```

**Request:**
```json
{
  "return_notes": "Returned in good condition"
}
```

### Practice Rooms

#### List Practice Rooms

```
GET /api/inventory/practice-rooms/
```

#### Create Room Reservation

```
POST /api/inventory/room-reservations/
```

**Request:**
```json
{
  "room": "room-uuid",
  "start_time": "2025-01-20T14:00:00Z",
  "end_time": "2025-01-20T16:00:00Z",
  "notes": "Need practice for recital"
}
```

## Resources Endpoints

### Resources

#### List Resources

```
GET /api/resources/
```

**Query Parameters:**
- `resource_type`: Filter by type (pdf, audio, video, etc.)
- `category`: Filter by category
- `tags`: Filter by tags (comma-separated)
- `search`: Search in title and description

#### Get Resource Details

```
GET /api/resources/{id}/
```

#### Upload Resource

```
POST /api/resources/
```

**Request:** (multipart/form-data)
```
file: <file upload>
title: "Bach Prelude in C - Sheet Music"
description: "Beginner piano piece"
category: "Sheet Music"
tags: ["piano", "bach", "beginner", "classical"]
is_public: true
```

#### Download Resource

```
GET /api/resources/{id}/download/
```

Returns a redirect to the file URL or serves the file directly.

#### Share Resource

```
POST /api/resources/{id}/share/
```

**Request:**
```json
{
  "student_ids": ["uuid1", "uuid2", "uuid3"]
}
```

### Resource Checkouts

#### Request Physical Resource

```
POST /api/resources/{id}/checkout/
```

#### Return Physical Resource

```
POST /api/resources/checkouts/{id}/return/
```

## Messaging Endpoints

### Message Threads

#### List Threads

```
GET /api/messaging/threads/
```

Returns conversation threads for the current user.

#### Create Thread

```
POST /api/messaging/threads/
```

**Request:**
```json
{
  "subject": "Question about lesson schedule",
  "participants": ["user-uuid-1", "user-uuid-2"],
  "initial_message": "Hi, I have a question about..."
}
```

#### Get Thread Messages

```
GET /api/messaging/threads/{id}/messages/
```

### Messages

#### Send Message

```
POST /api/messaging/threads/{id}/messages/
```

**Request:**
```json
{
  "content": "Thank you for your message..."
}
```

#### Mark as Read

```
POST /api/messaging/messages/{id}/mark-read/
```

## Notifications Endpoints

### Notifications

#### List Notifications

```
GET /api/notifications/
```

**Query Parameters:**
- `is_read`: Filter by read status

**Response:**
```json
{
  "count": 15,
  "unread_count": 5,
  "results": [
    {
      "id": "uuid",
      "title": "Lesson Reminder",
      "message": "Your lesson is tomorrow at 2:00 PM",
      "notification_type": "lesson_reminder",
      "is_read": false,
      "link": "/lessons/uuid",
      "created_at": "2025-01-14T10:00:00Z"
    }
  ]
}
```

#### Mark Notification as Read

```
POST /api/notifications/{id}/mark-read/
```

#### Mark All as Read

```
POST /api/notifications/mark-all-read/
```

## Error Responses

The API uses standard HTTP status codes:

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `204 No Content`: Successful request with no response body
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

**Error Response Format:**
```json
{
  "detail": "Error message here",
  "field_errors": {
    "email": ["This field is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Results per page (default: 20, max: 100)

**Response Format:**
```json
{
  "count": 150,
  "next": "http://api.example.com/resource/?page=2",
  "previous": null,
  "results": [...]
}
```

## Filtering & Search

Most list endpoints support filtering:

**Common Query Parameters:**
- `search`: Full-text search
- `ordering`: Sort field (prefix with `-` for descending)
- `created_after`, `created_before`: Date range filters

**Example:**
```
GET /api/lessons/?student=uuid&status=completed&ordering=-scheduled_start
```

## Rate Limiting

API requests are rate-limited:

- **Authenticated users**: 1000 requests/hour
- **Unauthenticated**: 100 requests/hour

Rate limit headers included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

## Interactive Documentation

Full interactive API documentation is available at:

- **Swagger UI**: `/api/docs/`
- **ReDoc**: `/api/redoc/`

These provide:
- Complete endpoint listings
- Request/response schemas
- Interactive testing
- Authentication setup

## WebSocket API

Real-time features use WebSocket connections:

### Connect

```
ws://localhost:8000/ws/notifications/
```

### Authentication

Include JWT token in connection:
```javascript
const ws = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${accessToken}`);
```

### Message Format

**Incoming:**
```json
{
  "type": "notification",
  "data": {
    "id": "uuid",
    "title": "New Message",
    "message": "You have a new message from John Doe"
  }
}
```

## SDKs & Libraries

Official client libraries:

- **JavaScript/TypeScript**: `@studiosync/js-sdk`
- **Python**: `studiosync-python`
- **React Hooks**: `@studiosync/react-hooks`

**Example (JavaScript):**
```javascript
import StudioSync from '@studiosync/js-sdk';

const client = new StudioSync({
  apiUrl: 'http://localhost:8000/api',
  token: 'your-jwt-token'
});

const lessons = await client.lessons.list({
  student: 'student-uuid',
  status: 'scheduled'
});
```

## Related Documentation

- [Database Schema](database.md) - Data models
- [Authentication](../GDPR_COMPLIANCE.md) - Security and privacy
