#!/bin/bash

# Script to create test data in the Kottster API
# This will create sample users, studios, teachers, students, and lessons

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:5480/api"
TOKEN="${KOTTSTER_TOKEN:-}"

if [ -z "$TOKEN" ]; then
  echo -e "${RED}ERROR: No token set${NC}"
  echo "Set KOTTSTER_TOKEN environment variable first"
  echo "Example: export KOTTSTER_TOKEN='your-jwt-token-here'"
  exit 1
fi

echo -e "${YELLOW}Creating test data in Kottster API${NC}"
echo ""

# Helper function
create_resource() {
  local endpoint=$1
  local data=$2
  local description=$3

  echo -e "${YELLOW}Creating: $description${NC}"

  response=$(curl -s -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$data" \
    "$BASE_URL$endpoint")

  if echo "$response" | grep -q '"id"'; then
    id=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo -e "${GREEN}✓ Created: $description (ID: $id)${NC}"
    echo "$id"
  else
    echo -e "${RED}✗ Failed: $description${NC}"
    echo "Response: $response"
    echo "0"
  fi
}

# ==============================================================================
# CREATE USERS
# ==============================================================================

echo -e "\n${GREEN}=== Creating Users ===${NC}"

# Teacher users
teacher1_id=$(create_resource "/users" '{
  "email": "teacher1@example.com",
  "first_name": "Sarah",
  "last_name": "Johnson",
  "phone": "555-0101",
  "role": "teacher",
  "timezone": "America/New_York",
  "is_active": true
}' "Teacher: Sarah Johnson")

teacher2_id=$(create_resource "/users" '{
  "email": "teacher2@example.com",
  "first_name": "Michael",
  "last_name": "Chen",
  "phone": "555-0102",
  "role": "teacher",
  "timezone": "America/Los_Angeles",
  "is_active": true
}' "Teacher: Michael Chen")

# Student users
student1_id=$(create_resource "/users" '{
  "email": "student1@example.com",
  "first_name": "Emma",
  "last_name": "Davis",
  "phone": "555-0201",
  "role": "student",
  "timezone": "America/New_York",
  "is_active": true
}' "Student: Emma Davis")

student2_id=$(create_resource "/users" '{
  "email": "student2@example.com",
  "first_name": "Liam",
  "last_name": "Wilson",
  "phone": "555-0202",
  "role": "student",
  "timezone": "America/New_York",
  "is_active": true
}' "Student: Liam Wilson")

student3_id=$(create_resource "/users" '{
  "email": "student3@example.com",
  "first_name": "Olivia",
  "last_name": "Martinez",
  "phone": "555-0203",
  "role": "student",
  "timezone": "America/Chicago",
  "is_active": true
}' "Student: Olivia Martinez")

# ==============================================================================
# CREATE STUDIOS
# ==============================================================================

echo -e "\n${GREEN}=== Creating Studios ===${NC}"

studio1_id=$(create_resource "/studios" '{
  "name": "Harmony Music Academy",
  "owner_id": 1,
  "email": "info@harmonymusic.com",
  "phone": "555-1000",
  "website": "https://harmonymusic.com",
  "address": "123 Music Lane, New York, NY 10001",
  "timezone": "America/New_York",
  "currency": "USD",
  "settings": {"theme": "light", "notifications": true}
}' "Studio: Harmony Music Academy")

studio2_id=$(create_resource "/studios" '{
  "name": "Creative Arts Studio",
  "owner_id": 1,
  "email": "info@creativearts.com",
  "phone": "555-2000",
  "website": "https://creativearts.com",
  "address": "456 Art Street, Los Angeles, CA 90001",
  "timezone": "America/Los_Angeles",
  "currency": "USD",
  "settings": {"theme": "dark", "notifications": true}
}' "Studio: Creative Arts Studio")

# ==============================================================================
# CREATE TEACHERS
# ==============================================================================

echo -e "\n${GREEN}=== Creating Teachers ===${NC}"

if [ "$teacher1_id" != "0" ] && [ "$studio1_id" != "0" ]; then
  teacher_profile1_id=$(create_resource "/teachers" "{
    \"user_id\": $teacher1_id,
    \"studio_id\": $studio1_id,
    \"bio\": \"Experienced piano instructor with 15 years of teaching experience. Specializes in classical and jazz piano.\",
    \"specialties\": [\"Classical Piano\", \"Jazz\", \"Music Theory\"],
    \"instruments\": [\"Piano\", \"Keyboard\"],
    \"hourly_rate\": 75.00,
    \"availability\": {\"monday\": [\"09:00-17:00\"], \"wednesday\": [\"09:00-17:00\"], \"friday\": [\"09:00-17:00\"]},
    \"auto_accept_bookings\": true,
    \"is_active\": true
  }" "Teacher Profile: Sarah Johnson")
fi

if [ "$teacher2_id" != "0" ] && [ "$studio2_id" != "0" ]; then
  teacher_profile2_id=$(create_resource "/teachers" "{
    \"user_id\": $teacher2_id,
    \"studio_id\": $studio2_id,
    \"bio\": \"Professional guitar teacher and performer. Teaches all styles from classical to rock.\",
    \"specialties\": [\"Guitar\", \"Rock\", \"Blues\"],
    \"instruments\": [\"Guitar\", \"Bass Guitar\"],
    \"hourly_rate\": 65.00,
    \"availability\": {\"tuesday\": [\"10:00-18:00\"], \"thursday\": [\"10:00-18:00\"], \"saturday\": [\"09:00-15:00\"]},
    \"auto_accept_bookings\": false,
    \"is_active\": true
  }" "Teacher Profile: Michael Chen")
fi

# ==============================================================================
# CREATE STUDENTS
# ==============================================================================

echo -e "\n${GREEN}=== Creating Students ===${NC}"

if [ "$student1_id" != "0" ] && [ "$studio1_id" != "0" ] && [ "$teacher_profile1_id" != "0" ]; then
  student_profile1_id=$(create_resource "/students" "{
    \"user_id\": $student1_id,
    \"studio_id\": $studio1_id,
    \"teacher_id\": $teacher_profile1_id,
    \"instrument\": \"Piano\",
    \"skill_level\": \"intermediate\",
    \"goals\": \"Prepare for ABRSM Grade 5 exam\",
    \"enrollment_date\": \"2024-09-01\",
    \"birth_date\": \"2010-03-15\",
    \"emergency_contact\": {\"name\": \"Jane Davis\", \"phone\": \"555-0301\", \"relationship\": \"Mother\"},
    \"is_active\": true
  }" "Student Profile: Emma Davis")
fi

if [ "$student2_id" != "0" ] && [ "$studio1_id" != "0" ] && [ "$teacher_profile1_id" != "0" ]; then
  student_profile2_id=$(create_resource "/students" "{
    \"user_id\": $student2_id,
    \"studio_id\": $studio1_id,
    \"teacher_id\": $teacher_profile1_id,
    \"instrument\": \"Piano\",
    \"skill_level\": \"beginner\",
    \"goals\": \"Learn basic piano skills and reading music\",
    \"enrollment_date\": \"2025-01-15\",
    \"birth_date\": \"2012-07-20\",
    \"emergency_contact\": {\"name\": \"Robert Wilson\", \"phone\": \"555-0302\", \"relationship\": \"Father\"},
    \"is_active\": true
  }" "Student Profile: Liam Wilson")
fi

if [ "$student3_id" != "0" ] && [ "$studio2_id" != "0" ] && [ "$teacher_profile2_id" != "0" ]; then
  student_profile3_id=$(create_resource "/students" "{
    \"user_id\": $student3_id,
    \"studio_id\": $studio2_id,
    \"teacher_id\": $teacher_profile2_id,
    \"instrument\": \"Guitar\",
    \"skill_level\": \"beginner\",
    \"goals\": \"Learn to play favorite songs\",
    \"enrollment_date\": \"2025-01-10\",
    \"birth_date\": \"2011-11-05\",
    \"emergency_contact\": {\"name\": \"Maria Martinez\", \"phone\": \"555-0303\", \"relationship\": \"Mother\"},
    \"is_active\": true
  }" "Student Profile: Olivia Martinez")
fi

# ==============================================================================
# CREATE LESSONS
# ==============================================================================

echo -e "\n${GREEN}=== Creating Lessons ===${NC}"

if [ "$teacher_profile1_id" != "0" ] && [ "$student_profile1_id" != "0" ]; then
  create_resource "/lessons" "{
    \"teacher_id\": $teacher_profile1_id,
    \"student_id\": $student_profile1_id,
    \"scheduled_start\": \"2025-02-03T14:00:00Z\",
    \"scheduled_end\": \"2025-02-03T15:00:00Z\",
    \"duration\": 60,
    \"lesson_type\": \"regular\",
    \"status\": \"scheduled\",
    \"rate\": 75.00,
    \"notes\": \"Work on scales and sight reading\"
  }" "Lesson: Emma Davis - Feb 3, 2025" > /dev/null
fi

if [ "$teacher_profile1_id" != "0" ] && [ "$student_profile2_id" != "0" ]; then
  create_resource "/lessons" "{
    \"teacher_id\": $teacher_profile1_id,
    \"student_id\": $student_profile2_id,
    \"scheduled_start\": \"2025-02-05T15:00:00Z\",
    \"scheduled_end\": \"2025-02-05T16:00:00Z\",
    \"duration\": 60,
    \"lesson_type\": \"regular\",
    \"status\": \"scheduled\",
    \"rate\": 75.00,
    \"notes\": \"Introduction to piano basics\"
  }" "Lesson: Liam Wilson - Feb 5, 2025" > /dev/null
fi

if [ "$teacher_profile2_id" != "0" ] && [ "$student_profile3_id" != "0" ]; then
  create_resource "/lessons" "{
    \"teacher_id\": $teacher_profile2_id,
    \"student_id\": $student_profile3_id,
    \"scheduled_start\": \"2025-02-04T16:00:00Z\",
    \"scheduled_end\": \"2025-02-04T17:00:00Z\",
    \"duration\": 60,
    \"lesson_type\": \"regular\",
    \"status\": \"scheduled\",
    \"rate\": 65.00,
    \"notes\": \"Learn basic chords and strumming patterns\",
    \"is_recurring\": true,
    \"recurrence_type\": \"weekly\",
    \"recurrence_end_date\": \"2025-06-30\"
  }" "Recurring Lesson: Olivia Martinez (weekly through June)" > /dev/null
fi

# ==============================================================================
# CREATE FEATURE FLAGS
# ==============================================================================

echo -e "\n${GREEN}=== Creating Feature Flags ===${NC}"

create_resource "/feature-flags" '{
  "key": "dark_mode_enabled",
  "name": "Dark Mode",
  "description": "Enable dark mode theme",
  "flag_type": "boolean",
  "scope": "global",
  "is_active": true,
  "value_boolean": true,
  "category": "ui"
}' "Feature Flag: Dark Mode" > /dev/null

create_resource "/feature-flags" '{
  "key": "max_students_per_teacher",
  "name": "Max Students Per Teacher",
  "description": "Maximum number of students a teacher can have",
  "flag_type": "number",
  "scope": "global",
  "is_active": true,
  "value_number": 20,
  "category": "business_rules"
}' "Feature Flag: Max Students" > /dev/null

create_resource "/feature-flags" '{
  "key": "welcome_message",
  "name": "Welcome Message",
  "description": "Custom welcome message for students",
  "flag_type": "string",
  "scope": "studio",
  "is_active": true,
  "value_string": "Welcome to our music studio!",
  "category": "content"
}' "Feature Flag: Welcome Message" > /dev/null

# ==============================================================================
# SUMMARY
# ==============================================================================

echo -e "\n${GREEN}=== Test Data Creation Complete ===${NC}"
echo ""
echo "Created:"
echo "  • Users (teachers and students)"
echo "  • Studios"
echo "  • Teacher profiles"
echo "  • Student profiles"
echo "  • Lessons (including recurring)"
echo "  • Feature flags"
echo ""
echo "You can now test the API with real data!"
echo ""
echo "Try these commands:"
echo "  curl -H \"Authorization: Bearer \$KOTTSTER_TOKEN\" http://localhost:5480/api/users"
echo "  curl -H \"Authorization: Bearer \$KOTTSTER_TOKEN\" http://localhost:5480/api/lessons"
echo "  curl -H \"Authorization: Bearer \$KOTTSTER_TOKEN\" 'http://localhost:5480/api/lessons/calendar?start=2025-02-01&end=2025-02-28'"
