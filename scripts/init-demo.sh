#!/bin/bash
set -e

# Default settings (used for non-interactive or flag-based execution)
INTERACTIVE=true
CLEAN_CONTAINERS=false
START_SERVICES=false
RUN_MIGRATIONS=false
CREATE_ADMIN=false
SEED_BASIC=false
SEED_EXTRA=false
ALL_YES=false

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -y|--yes|--all) 
            ALL_YES=true
            INTERACTIVE=false
            ;;
        --clean) CLEAN_CONTAINERS=true; INTERACTIVE=false ;;
        --start) START_SERVICES=true; INTERACTIVE=false ;;
        --migrate) RUN_MIGRATIONS=true; INTERACTIVE=false ;;
        --admin) CREATE_ADMIN=true; INTERACTIVE=false ;;
        --seed-basic) SEED_BASIC=true; INTERACTIVE=false ;;
        --seed-extra) SEED_EXTRA=true; INTERACTIVE=false ;;
        -h|--help)
            echo "🎵 Music Studio Manager - Demo Setup"
            echo "Usage: ./init-demo.sh [OPTIONS]"
            echo ""
            echo "By default, the script runs in interactive mode."
            echo ""
            echo "Options:"
            echo "  -y, --yes, --all   Run all steps automatically (non-interactive)"
            echo "  --clean            Clean up previous containers only"
            echo "  --start            Build and start services only"
            echo "  --migrate          Run database migrations only"
            echo "  --admin            Create demo admin user only"
            echo "  --seed-basic       Seed basic demo data only"
            echo "  --seed-extra       Seed extra/advanced demo data only"
            echo "  -h, --help         Show this help message"
            exit 0
            ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

if [ "$ALL_YES" = true ]; then
    CLEAN_CONTAINERS=true
    START_SERVICES=true
    RUN_MIGRATIONS=true
    CREATE_ADMIN=true
    SEED_BASIC=true
    SEED_EXTRA=true
fi

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

# Interactive prompts
if [ "$INTERACTIVE" = true ]; then
    echo "Running in interactive mode. Press enter to accept defaults (Y/n)."
    echo "To skip these prompts in the future, run with --yes or -y."
    echo ""
    
    read -p "🧹 Clean up previous containers? [Y/n] " prompt_clean
    if [[ $prompt_clean =~ ^[Nn]$ ]]; then CLEAN_CONTAINERS=false; else CLEAN_CONTAINERS=true; fi
    
    read -p "🚀 Build and start services? [Y/n] " prompt_start
    if [[ $prompt_start =~ ^[Nn]$ ]]; then START_SERVICES=false; else START_SERVICES=true; fi
    
    read -p "📊 Run database migrations? [Y/n] " prompt_migrate
    if [[ $prompt_migrate =~ ^[Nn]$ ]]; then RUN_MIGRATIONS=false; else RUN_MIGRATIONS=true; fi
    
    read -p "👤 Create demo admin user? [Y/n] " prompt_admin
    if [[ $prompt_admin =~ ^[Nn]$ ]]; then CREATE_ADMIN=false; else CREATE_ADMIN=true; fi
    
    read -p "🌱 Seed basic demo data? [Y/n] " prompt_basic
    if [[ $prompt_basic =~ ^[Nn]$ ]]; then SEED_BASIC=false; else SEED_BASIC=true; fi
    
    if [ "$SEED_BASIC" = true ]; then
        read -p "🌱 Seed extra/advanced demo data? [Y/n] " prompt_extra
        if [[ $prompt_extra =~ ^[Nn]$ ]]; then SEED_EXTRA=false; else SEED_EXTRA=true; fi
    else
        SEED_EXTRA=false
    fi
    echo ""
fi

# Execution based on variables

if [ "$CLEAN_CONTAINERS" = true ]; then
    echo "🧹 Cleaning up previous containers..."
    docker compose down 2>/dev/null || true
fi

if [ "$START_SERVICES" = true ]; then
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
fi

if [ "$RUN_MIGRATIONS" = true ]; then
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
fi

if [ "$CREATE_ADMIN" = true ]; then
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
fi

if [ "$SEED_BASIC" = true ]; then
    echo ""
    echo "🌱 Seeding basic demo database..."
    docker compose exec -T backend python seed_data.py
    docker compose exec -T backend python seed_resources.py
fi

if [ "$SEED_EXTRA" = true ]; then
    echo ""
    echo "🌱 Seeding extra demo database..."
    docker compose exec -T backend python seed_extra.py
    docker compose exec -T backend python seed_extra_resources.py
fi

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
