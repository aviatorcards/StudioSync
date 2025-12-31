#!/bin/bash

# Script to get a JWT token from Django authentication
# This token can be used to test the Kottster API

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

DJANGO_URL="${DJANGO_URL:-http://localhost:3000}"

echo -e "${YELLOW}Django JWT Token Helper${NC}"
echo ""

# Check if credentials are provided
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./get-token.sh <email> <password>"
  echo ""
  echo "Example:"
  echo "  ./get-token.sh admin@example.com password123"
  echo ""
  echo "This will login to Django and return JWT tokens."
  exit 1
fi

EMAIL=$1
PASSWORD=$2

echo "Logging in to Django..."
echo "URL: $DJANGO_URL/api/auth/login/"
echo "Email: $EMAIL"
echo ""

# Make login request
response=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  "$DJANGO_URL/api/auth/login/")

# Check if response contains access token
if echo "$response" | grep -q '"access"'; then
  echo -e "${GREEN}✓ Login successful!${NC}"
  echo ""

  # Extract access token
  access_token=$(echo "$response" | grep -o '"access":"[^"]*' | cut -d'"' -f4)
  refresh_token=$(echo "$response" | grep -o '"refresh":"[^"]*' | cut -d'"' -f4)

  echo "Access Token:"
  echo "$access_token"
  echo ""
  echo "Refresh Token:"
  echo "$refresh_token"
  echo ""
  echo -e "${YELLOW}To use with test-api.sh:${NC}"
  echo "export KOTTSTER_TOKEN='$access_token'"
  echo ""
  echo -e "${YELLOW}Or test a single endpoint:${NC}"
  echo "curl -H \"Authorization: Bearer $access_token\" http://localhost:5480/api/users"
else
  echo "Login failed!"
  echo "Response: $response"
  exit 1
fi
