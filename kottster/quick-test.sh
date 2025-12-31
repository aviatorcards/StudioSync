#!/bin/bash

# Quick API test script - tests core functionality of each endpoint

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

BASE_URL="http://localhost:5480"
TOKEN="${KOTTSTER_TOKEN:-}"

test_count=0
pass_count=0
fail_count=0

# Test function
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local expected_status=$4

  test_count=$((test_count + 1))

  if [ -z "$TOKEN" ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE_URL$endpoint")
  else
    status=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "Authorization: Bearer $TOKEN" \
      -X "$method" "$BASE_URL$endpoint")
  fi

  if [ "$status" = "$expected_status" ]; then
    echo -e "${GREEN}✓${NC} $name - HTTP $status"
    pass_count=$((pass_count + 1))
  else
    echo -e "${RED}✗${NC} $name - Expected HTTP $expected_status, got HTTP $status"
    fail_count=$((fail_count + 1))
  fi
}

echo -e "${YELLOW}=== Kottster API Quick Test ===${NC}"
echo ""

if [ -z "$TOKEN" ]; then
  echo -e "${YELLOW}No token set - testing without authentication${NC}"
  echo "Set KOTTSTER_TOKEN to test authenticated endpoints"
  echo ""

  # Without token, we expect 401 Unauthorized
  test_endpoint "Health check" "GET" "/health" "200"
  test_endpoint "Feature Flags list" "GET" "/api/feature-flags" "401"
  test_endpoint "Users list" "GET" "/api/users" "401"
  test_endpoint "Studios list" "GET" "/api/studios" "401"
  test_endpoint "Teachers list" "GET" "/api/teachers" "401"
  test_endpoint "Students list" "GET" "/api/students" "401"
  test_endpoint "Lessons list" "GET" "/api/lessons" "401"
  test_endpoint "Calendar view" "GET" "/api/lessons/calendar" "401"
else
  echo -e "${GREEN}Testing with authentication${NC}"
  echo ""

  # With token, we expect 200 OK
  test_endpoint "Health check" "GET" "/health" "200"
  test_endpoint "API status" "GET" "/api/status" "200"
  test_endpoint "Feature Flags list" "GET" "/api/feature-flags" "200"
  test_endpoint "Users list" "GET" "/api/users" "200"
  test_endpoint "Studios list" "GET" "/api/studios" "200"
  test_endpoint "Teachers list" "GET" "/api/teachers" "200"
  test_endpoint "Students list" "GET" "/api/students" "200"
  test_endpoint "Lessons list" "GET" "/api/lessons" "200"
  test_endpoint "Calendar view" "GET" "/api/lessons/calendar" "200"

  # Test pagination
  test_endpoint "Users paginated" "GET" "/api/users?_page=1&_perPage=5" "200"
  test_endpoint "Lessons sorted" "GET" "/api/lessons?_sort=scheduled_start&_order=ASC" "200"

  # Test 404
  test_endpoint "Non-existent user" "GET" "/api/users/999999" "404"
fi

echo ""
echo -e "${YELLOW}=== Test Summary ===${NC}"
echo "Total tests: $test_count"
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"

if [ $fail_count -eq 0 ]; then
  echo -e "\n${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "\n${RED}✗ Some tests failed${NC}"
  exit 1
fi
