#!/bin/bash
set -e

echo "🎵 Music Studio Manager - Demo Setup"
echo "===================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Clean up any previous containers
echo "🧹 Cleaning up previous containers..."
docker compose down 2>/dev/null || true

# Start services
echo ""
echo "🚀 Building and starting services..."
echo "   (This may take 2-3 minutes on first run)"
docker compose up -d --build

echo ""
echo "⏳ Waiting for database to be ready..."
sleep 15

# Check if backend is ready
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
    if docker compose exec -T backend python manage.py check >/dev/null 2>&1; then
        echo "✅ Backend is strongly connected to database"
        break
    fi
    sleep 2
done

# Run migrations
echo ""
echo "📊 Running database migrations..."
if ! docker compose exec -T backend python manage.py migrate; then
    echo "❌ Migrations failed! Please check the backend logs."
    exit 1
fi

# Create cache table for database caching
echo ""
echo "🗄️ Creating cache table..."
if ! docker compose exec -T backend python manage.py createcachetable; then
    echo "❌ Failed to create cache table!"
    exit 1
fi

# Create superuser non-interactively
echo ""
echo "👤 Creating demo admin user..."
docker compose exec -T backend python manage.py shell <<'EOF'
from apps.core.models import User
if not User.objects.filter(email='admin@demo.com').exists():
    User.objects.create_superuser(
        email='admin@demo.com',
        password='demo123',
        first_name='Admin',
        last_name='User'
    )
    print('✅ Demo user created!')
else:
    print('ℹ️  Demo user already exists')
EOF

# Seed basic and advanced demo data
echo ""
echo "🌱 Seeding demo database..."
docker compose exec -T backend python seed_data.py
docker compose exec -T backend python seed_extra.py
docker compose exec -T backend python seed_resources.py
docker compose exec -T backend python seed_extra_resources.py

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Access your application:"
echo "   Frontend:    http://localhost:3000"
echo "   Backend API: http://localhost:8000/api"  
echo "   Admin Panel: http://localhost:8000/admin"
echo ""
echo "🔑 Demo Login:"
echo "   Email:    admin@demo.com"
echo "   Password: demo123"
echo ""
echo "📝 Useful commands:"
echo "   View logs:        docker compose logs -f"
echo "   Stop services:    docker compose down"
echo "   Restart services: docker compose restart"
echo ""
echo "⏳ Note: Frontend may take 1-2 minutes to compile on first start"
echo ""
