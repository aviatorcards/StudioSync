#!/bin/bash

# Individual curl examples for testing Kottster API
# Copy and paste these commands to test specific endpoints

# Set your token (replace with actual token)
# export KOTTSTER_TOKEN='your-token-here'

# ==============================================================================
# HEALTH & STATUS
# ==============================================================================

# Health check (no auth required)
curl -s http://localhost:5480/health | jq .

# API status (requires auth)
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  http://localhost:5480/api/status | jq .

# ==============================================================================
# FEATURE FLAGS
# ==============================================================================

# List all feature flags
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  http://localhost:5480/api/feature-flags | jq .

# List with pagination
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/feature-flags?_page=1&_perPage=5" | jq .

# Search feature flags
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/feature-flags?search=dark" | jq .

# Get single feature flag
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  http://localhost:5480/api/feature-flags/1 | jq .

# Create feature flag
curl -s -X POST \
  -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "new_feature_test",
    "name": "New Feature Test",
    "description": "Testing feature flag creation",
    "flag_type": "boolean",
    "scope": "global",
    "is_active": true,
    "value_boolean": true,
    "category": "testing"
  }' \
  http://localhost:5480/api/feature-flags | jq .

# Update feature flag
curl -s -X PUT \
  -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "is_active": false
  }' \
  http://localhost:5480/api/feature-flags/1 | jq .

# ==============================================================================
# USERS
# ==============================================================================

# List all users
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  http://localhost:5480/api/users | jq .

# List with pagination
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/users?_page=1&_perPage=10" | jq .

# Filter by role
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/users?role=teacher" | jq .

# Filter by active status
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/users?is_active=true" | jq .

# Search users
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/users?search=john" | jq .

# Get single user
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  http://localhost:5480/api/users/1 | jq .

# Create user
curl -s -X POST \
  -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "first_name": "New",
    "last_name": "User",
    "phone": "555-1234",
    "role": "student",
    "timezone": "America/New_York",
    "is_active": true
  }' \
  http://localhost:5480/api/users | jq .

# Update user
curl -s -X PUT \
  -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "555-9999",
    "timezone": "America/Los_Angeles"
  }' \
  http://localhost:5480/api/users/1 | jq .

# ==============================================================================
# STUDIOS
# ==============================================================================

# List all studios
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  http://localhost:5480/api/studios | jq .

# Search studios
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/studios?search=music" | jq .

# Get single studio
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  http://localhost:5480/api/studios/1 | jq .

# Create studio
curl -s -X POST \
  -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Music Studio",
    "owner_id": 1,
    "email": "studio@example.com",
    "phone": "555-1000",
    "website": "https://teststudio.com",
    "address": "123 Main St, City, State 12345",
    "timezone": "America/New_York",
    "currency": "USD"
  }' \
  http://localhost:5480/api/studios | jq .

# Update studio
curl -s -X PUT \
  -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "555-2000",
    "website": "https://newwebsite.com"
  }' \
  http://localhost:5480/api/studios/1 | jq .

# ==============================================================================
# TEACHERS
# ==============================================================================

# List all teachers
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  http://localhost:5480/api/teachers | jq .

# Filter by studio
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/teachers?studio_id=1" | jq .

# Search teachers
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/teachers?search=piano" | jq .

# Get single teacher
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  http://localhost:5480/api/teachers/1 | jq .

# Create teacher
curl -s -X POST \
  -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2,
    "studio_id": 1,
    "bio": "Experienced piano teacher",
    "specialties": ["Classical Piano", "Jazz"],
    "instruments": ["Piano", "Keyboard"],
    "hourly_rate": 75.00,
    "auto_accept_bookings": true,
    "is_active": true
  }' \
  http://localhost:5480/api/teachers | jq .

# Update teacher
curl -s -X PUT \
  -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hourly_rate": 80.00,
    "bio": "Updated bio"
  }' \
  http://localhost:5480/api/teachers/1 | jq .

# ==============================================================================
# STUDENTS
# ==============================================================================

# List all students
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  http://localhost:5480/api/students | jq .

# Filter by teacher
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/students?teacher_id=1" | jq .

# Filter by studio
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/students?studio_id=1" | jq .

# Search students
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/students?search=guitar" | jq .

# Get single student
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  http://localhost:5480/api/students/1 | jq .

# Create student
curl -s -X POST \
  -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 3,
    "studio_id": 1,
    "teacher_id": 1,
    "instrument": "Piano",
    "skill_level": "beginner",
    "goals": "Learn classical pieces",
    "enrollment_date": "2025-01-01",
    "birth_date": "2010-05-15",
    "emergency_contact": {
      "name": "Parent Name",
      "phone": "555-1234",
      "relationship": "Parent"
    },
    "is_active": true
  }' \
  http://localhost:5480/api/students | jq .

# Update student
curl -s -X PUT \
  -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "skill_level": "intermediate",
    "goals": "Prepare for recital"
  }' \
  http://localhost:5480/api/students/1 | jq .

# ==============================================================================
# LESSONS
# ==============================================================================

# List all lessons
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  http://localhost:5480/api/lessons | jq .

# List with sorting
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/lessons?_sort=scheduled_start&_order=ASC" | jq .

# Filter by teacher
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/lessons?teacher_id=1" | jq .

# Filter by student
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/lessons?student_id=1" | jq .

# Filter by status
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/lessons?status=scheduled" | jq .

# Filter by date range
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/lessons?date_from=2025-01-01&date_to=2025-12-31" | jq .

# Calendar view
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/lessons/calendar?start=2025-01-01&end=2025-01-31" | jq .

# Calendar view for specific teacher
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  "http://localhost:5480/api/lessons/calendar?teacher_id=1&start=2025-01-01&end=2025-12-31" | jq .

# Get single lesson
curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  http://localhost:5480/api/lessons/1 | jq .

# Create lesson
curl -s -X POST \
  -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teacher_id": 1,
    "student_id": 1,
    "room_id": 1,
    "scheduled_start": "2025-06-15T14:00:00Z",
    "scheduled_end": "2025-06-15T15:00:00Z",
    "duration": 60,
    "lesson_type": "regular",
    "status": "scheduled",
    "rate": 75.00,
    "notes": "Focus on scales"
  }' \
  http://localhost:5480/api/lessons | jq .

# Create recurring lesson
curl -s -X POST \
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
    "rate": 75.00,
    "is_recurring": true,
    "recurrence_type": "weekly",
    "recurrence_end_date": "2025-12-31"
  }' \
  http://localhost:5480/api/lessons | jq .

# Update lesson
curl -s -X PUT \
  -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Updated lesson notes",
    "rate": 80.00
  }' \
  http://localhost:5480/api/lessons/1 | jq .

# Cancel lesson
curl -s -X PATCH \
  -H "Authorization: Bearer $KOTTSTER_TOKEN" \
  http://localhost:5480/api/lessons/1/cancel | jq .

# ==============================================================================
# TESTING WITHOUT JQ (if jq not installed)
# ==============================================================================

# Just remove "| jq ." from any command above
# Example:
# curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" http://localhost:5480/api/users

# Or use python to pretty-print:
# curl -s -H "Authorization: Bearer $KOTTSTER_TOKEN" http://localhost:5480/api/users | python -m json.tool
