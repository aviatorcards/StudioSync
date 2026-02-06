#!/bin/bash

# Script to run E2E tests for StudioSync
# This script ensures Docker services are running and test data is seeded

set -e

echo "🚀 Starting StudioSync E2E Tests"
echo "================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start Docker Compose services
echo "📦 Starting Docker Compose services..."
docker compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if backend is healthy
echo "🔍 Checking backend health..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost:8000/health/ > /dev/null 2>&1; then
        echo "✅ Backend is healthy"
        break
    fi
    attempt=$((attempt + 1))
    echo "   Attempt $attempt/$max_attempts..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Error: Backend failed to become healthy"
    exit 1
fi

# Check if frontend is healthy
echo "🔍 Checking frontend health..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend is healthy"
        break
    fi
    attempt=$((attempt + 1))
    echo "   Attempt $attempt/$max_attempts..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Error: Frontend failed to become healthy"
    exit 1
fi

# Seed test data
echo "🌱 Seeding test data..."
docker compose exec -T backend python seed_data.py || echo "⚠️  Warning: Seed data may already exist"

# Run Playwright tests
echo "🎭 Running Playwright tests..."
cd frontend
npm run test:e2e "$@"

echo ""
echo "✅ Tests complete!"
echo "📊 View the HTML report: npm run test:e2e:report"
