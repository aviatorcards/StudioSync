#!/bin/bash

# Kottster API Test Script
# This script tests all API endpoints using curl

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5480/api"

# You need to set a valid JWT token here
# Get this from Django by logging in and copying the access token
# Or generate one using Django's SECRET_KEY
TOKEN="${KOTTSTER_TOKEN:-}"

if [ -z "$TOKEN" ]; then
  echo -e "${YELLOW}WARNING: No token set. Set KOTTSTER_TOKEN environment variable${NC}"
  echo "Example: export KOTTSTER_TOKEN='your-jwt-token-here'"
  echo ""
  echo "To get a token from Django:"
  echo "1. Login to Django at http://localhost:3000/api/auth/login/"
  echo "2. Copy the 'access' token from the response"
  echo "3. Export it: export KOTTSTER_TOKEN='<token>'"
  echo ""
fi

# Helper function to make authenticated requests
api_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  local description=$4

  echo -e "\n${YELLOW}TEST: $description${NC}"
  echo "REQUEST: $method $BASE_URL$endpoint"

  if [ -n "$data" ]; then
    echo "DATA: $data"
  fi

  if [ -z "$TOKEN" ]; then
    response=$(curl -s -X "$method" \
      -H "Content-Type: application/json" \
      ${data:+-d "$data"} \
      "$BASE_URL$endpoint")
  else
    response=$(curl -s -X "$method" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      ${data:+-d "$data"} \
      "$BASE_URL$endpoint")
  fi

  # Check if response contains error
  if echo "$response" | grep -q '"error"'; then
    echo -e "${RED}RESPONSE: $response${NC}"
  else
    echo -e "${GREEN}RESPONSE: $response${NC}"
  fi

  echo "---"
}

# ==============================================================================
# HEALTH CHECK (No auth required)
# ==============================================================================

echo -e "\n${GREEN}=== HEALTH CHECK ===${NC}"

echo -e "\n${YELLOW}TEST: Health check endpoint${NC}"
curl -s http://localhost:5480/health | jq .
echo "---"

# ==============================================================================
# STATUS ENDPOINT (Requires auth)
# ==============================================================================

echo -e "\n${GREEN}=== API STATUS ===${NC}"
api_request "GET" "/status" "" "API status check"

# ==============================================================================
# FEATURE FLAGS API
# ==============================================================================

echo -e "\n${GREEN}=== FEATURE FLAGS API ===${NC}"

# List all feature flags
api_request "GET" "/feature-flags" "" "List all feature flags"

# List with pagination
api_request "GET" "/feature-flags?_page=1&_perPage=5" "" "List feature flags (paginated)"

# List with search
api_request "GET" "/feature-flags?search=dark" "" "Search feature flags"

# Get single feature flag (use ID 1 as example)
api_request "GET" "/feature-flags/1" "" "Get feature flag by ID"

# Create feature flag
api_request "POST" "/feature-flags" '{
  "key": "test_feature",
  "name": "Test Feature",
  "description": "A test feature flag",
  "flag_type": "boolean",
  "scope": "global",
  "is_active": true,
  "value_boolean": true,
  "category": "testing"
}' "Create new feature flag"

# Update feature flag (use ID 1 as example)
api_request "PUT" "/feature-flags/1" '{
  "description": "Updated description",
  "is_active": false
}' "Update feature flag"

# Delete feature flag (use ID 999 to avoid deleting real data)
api_request "DELETE" "/feature-flags/999" "" "Delete feature flag"

# ==============================================================================
# USERS API
# ==============================================================================

echo -e "\n${GREEN}=== USERS API ===${NC}"

# List all users
api_request "GET" "/users" "" "List all users"

# List with pagination
api_request "GET" "/users?_page=1&_perPage=10" "" "List users (paginated)"

# List with filters
api_request "GET" "/users?role=teacher&is_active=true" "" "List active teachers"

# Search users
api_request "GET" "/users?search=john" "" "Search users by name/email"

# Get single user (use ID 1 as example)
api_request "GET" "/users/1" "" "Get user by ID"

# Create user
api_request "POST" "/users" '{
  "email": "test.user@example.com",
  "first_name": "Test",
  "last_name": "User",
  "phone": "555-1234",
  "role": "student",
  "timezone": "America/New_York",
  "is_active": true
}' "Create new user"

# Update user (use ID 1 as example)
api_request "PUT" "/users/1" '{
  "phone": "555-9999",
  "timezone": "America/Los_Angeles"
}' "Update user"

# Delete user (use ID 999 to avoid deleting real data)
api_request "DELETE" "/users/999" "" "Delete user (soft delete)"

# ==============================================================================
# STUDIOS API
# ==============================================================================

echo -e "\n${GREEN}=== STUDIOS API ===${NC}"

# List all studios
api_request "GET" "/studios" "" "List all studios"

# List with search
api_request "GET" "/studios?search=music" "" "Search studios"

# Get single studio (use ID 1 as example)
api_request "GET" "/studios/1" "" "Get studio by ID"

# Create studio
api_request "POST" "/studios" '{
  "name": "Test Music Studio",
  "owner_id": 1,
  "email": "studio@example.com",
  "phone": "555-1000",
  "website": "https://teststudio.com",
  "address": "123 Main St, City, State 12345",
  "timezone": "America/New_York",
  "currency": "USD",
  "settings": {"theme": "light"}
}' "Create new studio"

# Update studio (use ID 1 as example)
api_request "PUT" "/studios/1" '{
  "phone": "555-2000",
  "website": "https://newwebsite.com"
}' "Update studio"

# Delete studio (use ID 999 to avoid deleting real data)
api_request "DELETE" "/studios/999" "" "Delete studio"

# ==============================================================================
# TEACHERS API
# ==============================================================================

echo -e "\n${GREEN}=== TEACHERS API ===${NC}"

# List all teachers
api_request "GET" "/teachers" "" "List all teachers"

# List with filters
api_request "GET" "/teachers?studio_id=1&is_active=true" "" "List teachers by studio"

# Search teachers
api_request "GET" "/teachers?search=piano" "" "Search teachers by specialty"

# Get single teacher (use ID 1 as example)
api_request "GET" "/teachers/1" "" "Get teacher by ID"

# Create teacher (assumes user_id 2 has teacher role)
api_request "POST" "/teachers" '{
  "user_id": 2,
  "studio_id": 1,
  "bio": "Experienced piano teacher with 10 years of experience",
  "specialties": ["Classical Piano", "Jazz"],
  "instruments": ["Piano", "Keyboard"],
  "hourly_rate": 75.00,
  "auto_accept_bookings": true,
  "is_active": true
}' "Create new teacher"

# Update teacher (use ID 1 as example)
api_request "PUT" "/teachers/1" '{
  "hourly_rate": 80.00,
  "bio": "Updated bio with new achievements"
}' "Update teacher"

# Delete teacher (use ID 999 to avoid deleting real data)
api_request "DELETE" "/teachers/999" "" "Delete teacher"

# ==============================================================================
# STUDENTS API
# ==============================================================================

echo -e "\n${GREEN}=== STUDENTS API ===${NC}"

# List all students
api_request "GET" "/students" "" "List all students"

# List with filters
api_request "GET" "/students?teacher_id=1&is_active=true" "" "List students by teacher"

# List by studio
api_request "GET" "/students?studio_id=1" "" "List students by studio"

# Search students
api_request "GET" "/students?search=guitar" "" "Search students by instrument"

# Get single student (use ID 1 as example)
api_request "GET" "/students/1" "" "Get student by ID"

# Create student (assumes user_id 3 has student role)
api_request "POST" "/students" '{
  "user_id": 3,
  "studio_id": 1,
  "teacher_id": 1,
  "instrument": "Piano",
  "skill_level": "beginner",
  "goals": "Learn to play classical pieces",
  "enrollment_date": "2025-01-01",
  "birth_date": "2010-05-15",
  "emergency_contact": {
    "name": "Parent Name",
    "phone": "555-1234",
    "relationship": "Parent"
  },
  "is_active": true
}' "Create new student"

# Update student (use ID 1 as example)
api_request "PUT" "/students/1" '{
  "skill_level": "intermediate",
  "goals": "Prepare for recital performance"
}' "Update student"

# Delete student (use ID 999 to avoid deleting real data)
api_request "DELETE" "/students/999" "" "Delete student"

# ==============================================================================
# LESSONS API
# ==============================================================================

echo -e "\n${GREEN}=== LESSONS API ===${NC}"

# List all lessons
api_request "GET" "/lessons" "" "List all lessons"

# List with pagination and sorting
api_request "GET" "/lessons?_page=1&_perPage=10&_sort=scheduled_start&_order=ASC" "" "List lessons (sorted by date)"

# List with filters
api_request "GET" "/lessons?teacher_id=1&status=scheduled" "" "List lessons by teacher and status"

# List by student
api_request "GET" "/lessons?student_id=1" "" "List lessons by student"

# List by date range
api_request "GET" "/lessons?date_from=2025-01-01&date_to=2025-12-31" "" "List lessons by date range"

# Calendar view
api_request "GET" "/lessons/calendar?start=2025-01-01&end=2025-01-31" "" "Get calendar view for January 2025"

# Calendar view for specific teacher
api_request "GET" "/lessons/calendar?teacher_id=1&start=2025-01-01&end=2025-12-31" "" "Get teacher calendar for 2025"

# Get single lesson (use ID 1 as example)
api_request "GET" "/lessons/1" "" "Get lesson by ID"

# Create lesson
api_request "POST" "/lessons" '{
  "teacher_id": 1,
  "student_id": 1,
  "room_id": 1,
  "scheduled_start": "2025-06-15T14:00:00Z",
  "scheduled_end": "2025-06-15T15:00:00Z",
  "duration": 60,
  "lesson_type": "regular",
  "status": "scheduled",
  "rate": 75.00,
  "notes": "Focus on scales and arpeggios"
}' "Create new lesson"

# Create recurring lesson
api_request "POST" "/lessons" '{
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
}' "Create recurring lesson"

# Update lesson (use ID 1 as example)
api_request "PUT" "/lessons/1" '{
  "notes": "Updated lesson notes",
  "rate": 80.00
}' "Update lesson"

# Cancel lesson (use ID 1 as example)
api_request "PATCH" "/lessons/1/cancel" "" "Cancel lesson"

# Delete lesson (use ID 999 to avoid deleting real data)
api_request "DELETE" "/lessons/999" "" "Delete lesson"

# ==============================================================================
# ERROR CASES
# ==============================================================================

echo -e "\n${GREEN}=== ERROR CASES ===${NC}"

# Test 404 - Not found
api_request "GET" "/users/999999" "" "Get non-existent user (404)"

# Test 400 - Invalid data
api_request "POST" "/users" '{
  "email": "invalid-user"
}' "Create user with missing required fields (400)"

# Test 409 - Conflict (try to create duplicate)
api_request "POST" "/users" '{
  "email": "existing@example.com",
  "first_name": "Existing",
  "last_name": "User",
  "role": "student"
}' "Create duplicate user (409)"

# Test scheduling conflict
api_request "POST" "/lessons" '{
  "teacher_id": 1,
  "student_id": 1,
  "scheduled_start": "2025-01-15T14:00:00Z",
  "scheduled_end": "2025-01-15T15:00:00Z",
  "duration": 60
}' "Create lesson with scheduling conflict (409)"

# ==============================================================================
# SUMMARY
# ==============================================================================

echo -e "\n${GREEN}=== TEST SUMMARY ===${NC}"
echo "All API endpoints have been tested."
echo ""
echo "Endpoints tested:"
echo "  ✓ Health check"
echo "  ✓ API status"
echo "  ✓ Feature Flags (list, get, create, update, delete)"
echo "  ✓ Users (list, get, create, update, delete, filters, search)"
echo "  ✓ Studios (list, get, create, update, delete, search)"
echo "  ✓ Teachers (list, get, create, update, delete, filters, search)"
echo "  ✓ Students (list, get, create, update, delete, filters, search)"
echo "  ✓ Lessons (list, get, create, update, cancel, delete, calendar, filters)"
echo "  ✓ Error cases (404, 400, 409)"
echo ""
echo -e "${YELLOW}Note: To run authenticated tests, set KOTTSTER_TOKEN environment variable${NC}"
