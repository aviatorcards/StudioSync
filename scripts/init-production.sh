#!/bin/bash
set -e

# =============================================================================
# StudioSync — Production Setup
# =============================================================================
# Configures and starts StudioSync for real use: secret keys, integrations
# (Stripe, Twilio, Stream Chat), and your own admin account.
#
# Run from the repo root:  ./scripts/init-production.sh
# =============================================================================

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env"

# ---- Formatting helpers ----
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
DIM='\033[2m'
NC='\033[0m'

step()    { echo -e "\n${BOLD}$1${NC}"; }
success() { echo -e "   ${GREEN}✅ $1${NC}"; }
info()    { echo -e "   ${DIM}$1${NC}"; }
warn()    { echo -e "   ${YELLOW}⚠️  $1${NC}"; }
die()     { echo -e "\n   ${RED}❌ $1${NC}\n"; exit 1; }

prompt_value() {
    # prompt_value "Label" "default"  →  prints result to stdout
    local label="$1" default="$2" value
    if [[ -n "$default" ]]; then
        read -rp "   $label [$default]: " value
        echo "${value:-$default}"
    else
        while [[ -z "$value" ]]; do
            read -rp "   $label: " value
            [[ -z "$value" ]] && echo "   Required — please enter a value."
        done
        echo "$value"
    fi
}

prompt_secret() {
    # Like prompt_value but masked; confirms when no default
    local label="$1" value confirm
    while true; do
        read -rsp "   $label: " value; echo
        [[ ${#value} -lt 8 ]] && echo "   Must be at least 8 characters." && continue
        read -rsp "   Confirm: " confirm; echo
        [[ "$value" == "$confirm" ]] && break
        echo "   Passwords do not match."
    done
    echo "$value"
}

prompt_yn() {
    # prompt_yn "Question" "n"  →  prints "true" or "false"
    local label="$1" default="${2:-n}" response
    if [[ "$default" == "y" ]]; then
        read -rp "   $label [Y/n]: " response
        [[ "${response,,}" == "n" ]] && echo "false" || echo "true"
    else
        read -rp "   $label [y/N]: " response
        [[ "${response,,}" == "y" ]] && echo "true" || echo "false"
    fi
}

generate_key() {
    python3 -c "import secrets; print(secrets.token_urlsafe(50))" 2>/dev/null \
        || openssl rand -base64 50 | tr -d '\n/='
}

# =============================================================================
echo ""
echo -e "${BOLD}🎵 StudioSync — Production Setup${NC}"
echo -e "=================================="
echo ""
echo "This walks you through a first-time production configuration."
echo "Unlike the demo, this sets real secret keys and lets you connect"
echo "Stripe, Twilio, Stream Chat, and cloud file storage."
echo ""

# ---- Pre-flight ----
if ! docker info > /dev/null 2>&1; then
    die "Docker is not running. Start Docker Desktop and try again."
fi
success "Docker is running"

cd "$REPO_ROOT"

# ---- .env handling ----
SKIP_ENV=false
if [[ -f "$ENV_FILE" ]]; then
    warn ".env already exists."
    OVERWRITE=$(prompt_yn "Overwrite with a fresh configuration?" "n")
    [[ "$OVERWRITE" != "true" ]] && SKIP_ENV=true && echo ""
fi

# =============================================================================
if [[ "$SKIP_ENV" != "true" ]]; then

    step "🔐 Generating secrets..."
    SECRET_KEY=$(generate_key)
    success "SECRET_KEY generated"

    # ---- Core ----
    step "🌐 Site configuration"
    info "Hostname(s) this app will be served from (comma-separated)."
    info "For local-only use the default is fine. Add your machine's LAN IP"
    info "if you want other devices on the network to access it."
    ALLOWED_HOSTS=$(prompt_value "Allowed hosts" "localhost,127.0.0.1")

    echo ""
    info "The URL users open in their browser."
    FRONTEND_BASE_URL=$(prompt_value "Frontend URL" "http://localhost:3000")

    # Build CORS list — always include localhost so the admin panel works
    if [[ "$FRONTEND_BASE_URL" == "http://localhost:3000" || "$FRONTEND_BASE_URL" == "http://127.0.0.1:3000" ]]; then
        CORS_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
    else
        CORS_ORIGINS="${FRONTEND_BASE_URL},http://localhost:3000,http://127.0.0.1:3000"
    fi

    # ---- Stripe ----
    step "💳 Stripe — billing & invoices (optional)"
    info "Enables invoice generation, payment tracking, and billing reports."
    info "Keys are available at: dashboard.stripe.com/apikeys"
    info "Leave blank to skip — you can add keys to .env later."
    echo ""
    USE_STRIPE=$(prompt_yn "Configure Stripe now?")
    if [[ "$USE_STRIPE" == "true" ]]; then
        STRIPE_PUBLISHABLE_KEY=$(prompt_value "Publishable key (pk_live_...)" "")
        STRIPE_SECRET_KEY=$(prompt_value "Secret key (sk_live_...)" "")
        STRIPE_WEBHOOK_SECRET=$(prompt_value "Webhook secret (whsec_...)" "")
    else
        STRIPE_PUBLISHABLE_KEY="" STRIPE_SECRET_KEY="" STRIPE_WEBHOOK_SECRET=""
    fi

    # ---- Twilio ----
    step "📱 Twilio — SMS notifications (optional)"
    info "Enables SMS alerts to students and parents."
    info "Keys are available at: console.twilio.com"
    info "Leave blank to skip — you can add keys to .env later."
    echo ""
    USE_TWILIO=$(prompt_yn "Configure Twilio now?")
    if [[ "$USE_TWILIO" == "true" ]]; then
        TWILIO_ACCOUNT_SID=$(prompt_value "Account SID" "")
        TWILIO_AUTH_TOKEN=$(prompt_value "Auth token" "")
        TWILIO_PHONE_NUMBER=$(prompt_value "Phone number (e.g. +15551234567)" "")
    else
        TWILIO_ACCOUNT_SID="" TWILIO_AUTH_TOKEN="" TWILIO_PHONE_NUMBER=""
    fi

    # ---- Stream Chat ----
    step "💬 Stream Chat — real-time messaging (optional)"
    info "Enables the Messages section for teachers, students, and parents."
    info "Free tier available at: getstream.io"
    info "Leave blank to skip — you can add keys to .env later."
    echo ""
    USE_STREAM=$(prompt_yn "Configure Stream Chat now?")
    if [[ "$USE_STREAM" == "true" ]]; then
        STREAM_API_KEY=$(prompt_value "API key" "")
        STREAM_API_SECRET=$(prompt_value "API secret" "")
    else
        STREAM_API_KEY="" STREAM_API_SECRET=""
    fi

    # ---- File storage ----
    step "📁 File storage"
    info "Local storage saves uploads to a Docker volume — good for self-hosting."
    info "Cloud storage (S3 / Cloudflare R2) keeps files independent of containers"
    info "and is recommended if you ever plan to reinstall or move the app."
    echo ""
    USE_CLOUD=$(prompt_yn "Use cloud storage (S3 / R2)?")
    if [[ "$USE_CLOUD" == "true" ]]; then
        info "Enter your S3-compatible credentials:"
        AWS_ACCESS_KEY_ID=$(prompt_value "Access key ID" "")
        AWS_SECRET_ACCESS_KEY=$(prompt_value "Secret access key" "")
        AWS_STORAGE_BUCKET_NAME=$(prompt_value "Bucket name" "studiosync")
        info "(Leave blank for AWS S3; paste your endpoint for R2 or MinIO)"
        AWS_S3_ENDPOINT_URL=$(prompt_value "Endpoint URL" "")
        STORAGE_BLOCK="AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_STORAGE_BUCKET_NAME=${AWS_STORAGE_BUCKET_NAME}
AWS_S3_ENDPOINT_URL=${AWS_S3_ENDPOINT_URL}
AWS_S3_USE_SSL=True"
    else
        STORAGE_BLOCK="# Local file storage (Docker volume). To switch to S3/R2, add AWS_* vars here."
    fi

    # ---- Write .env ----
    step "📝 Writing .env..."

    cat > "$ENV_FILE" << EOF
# =============================================================================
# StudioSync Production Configuration
# Generated by init-production.sh on $(date)
# Edit this file and run: docker compose restart
# =============================================================================

# =============================================================================
# Django Core
# =============================================================================
SECRET_KEY=${SECRET_KEY}
DEBUG=False
ALLOWED_HOSTS=${ALLOWED_HOSTS}
CORS_ALLOWED_ORIGINS=${CORS_ORIGINS}
CSRF_TRUSTED_ORIGINS=${CORS_ORIGINS}
FRONTEND_BASE_URL=${FRONTEND_BASE_URL}

# =============================================================================
# Database  (connects to the "db" service in Docker Compose)
# =============================================================================
DATABASE_URL=postgresql://studio_user:studio_password@db:5432/studiosync

# =============================================================================
# Stripe — billing & invoices
# Leave blank to disable. Restart after adding keys.
# =============================================================================
STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}

# =============================================================================
# Twilio — SMS notifications
# Leave blank to disable. Restart after adding keys.
# =============================================================================
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER}

# =============================================================================
# Stream Chat — real-time messaging
# Leave blank to disable. Restart after adding keys.
# =============================================================================
STREAM_API_KEY=${STREAM_API_KEY}
STREAM_API_SECRET=${STREAM_API_SECRET}

# =============================================================================
# File Storage
# =============================================================================
${STORAGE_BLOCK}

# =============================================================================
# Email  (configure SMTP via the admin panel after setup)
# Go to: Admin → Core → Email Configurations
# StudioSync reads SMTP settings from the database at runtime.
# =============================================================================
DEFAULT_FROM_EMAIL=noreply@studiosync.local

# =============================================================================
# Frontend
# =============================================================================
NEXT_PUBLIC_API_URL=/api
INTERNAL_API_URL=http://backend:8000/api
NEXT_PUBLIC_APP_URL=${FRONTEND_BASE_URL}
EOF

    success ".env written"
fi

# =============================================================================
# Admin account — collected before starting services so startup can proceed
# uninterrupted once it begins.

step "👤 Admin account"
info "These will be your login credentials."
echo ""
ADMIN_EMAIL=$(prompt_value "Email" "")
ADMIN_FIRST=$(prompt_value "First name" "")
ADMIN_LAST=$(prompt_value "Last name" "")
ADMIN_PASSWORD=$(prompt_secret "Password (min 8 chars)")

# =============================================================================
step "🚀 Building and starting services..."
info "First build takes 2–3 minutes."
echo ""
docker compose up -d --build

# ---- Wait for DB + backend ----
echo ""
step "⏳ Waiting for services to be ready..."
sleep 12

READY=false
for i in {1..40}; do
    if docker compose exec -T backend python manage.py check > /dev/null 2>&1; then
        READY=true
        break
    fi
    printf "."
    sleep 3
done
echo ""
[[ "$READY" != "true" ]] && die "Backend did not start in time.\nRun: docker compose logs backend"
success "Backend is ready"

# ---- Migrations ----
step "📊 Running database migrations..."
docker compose exec -T backend python manage.py migrate
success "Migrations applied"

step "🗄️  Creating cache table..."
docker compose exec -T backend python manage.py createcachetable
success "Cache table ready"

# ---- Create admin ----
step "👤 Creating admin user..."
docker compose exec -T \
    -e _ADMIN_EMAIL="$ADMIN_EMAIL" \
    -e _ADMIN_PASSWORD="$ADMIN_PASSWORD" \
    -e _ADMIN_FIRST="$ADMIN_FIRST" \
    -e _ADMIN_LAST="$ADMIN_LAST" \
    backend python manage.py shell -c "
import os
from apps.core.models import User
email    = os.environ['_ADMIN_EMAIL']
password = os.environ['_ADMIN_PASSWORD']
first    = os.environ['_ADMIN_FIRST']
last     = os.environ['_ADMIN_LAST']
if User.objects.filter(email=email).exists():
    print('User already exists — skipping creation.')
else:
    User.objects.create_superuser(email=email, password=password, first_name=first, last_name=last)
    print('Admin user created.')
"
success "Admin user ready"

# =============================================================================
echo ""
echo -e "${BOLD}${GREEN}======================================================"
echo -e "  🎉  StudioSync is running!"
echo -e "======================================================${NC}"
echo ""
echo -e "  🌐  App        ${FRONTEND_BASE_URL:-http://localhost:3000}"
echo -e "  🔧  Admin      http://localhost:8000/admin"
echo -e "  📖  API docs   http://localhost:8000/api/docs"
echo ""
echo -e "  📧  Login:     ${ADMIN_EMAIL}"
echo ""

echo -e "${BOLD}Next steps:${NC}"
echo ""
echo "  1. Configure email (needed for password resets and invoices)"
echo "     → Admin panel → Core → Email Configurations"
echo "     → Add your SMTP credentials (Gmail, SendGrid, Postmark, etc.)"
echo ""

if [[ "$USE_STRIPE" == "true" ]]; then
echo "  2. Register your Stripe webhook"
echo "     → Stripe Dashboard → Developers → Webhooks → Add endpoint"
echo "     → URL: ${FRONTEND_BASE_URL:-http://localhost:3000}/api/billing/webhook"
echo "     → For local testing: stripe listen --forward-to localhost:8000/api/billing/webhook"
echo ""
fi

echo "  3. Complete the studio setup wizard"
echo "     → Log in and follow the on-screen setup steps to configure"
echo "       your studio name, timezone, and lesson preferences."
echo ""
echo -e "${DIM}Config lives in .env — edit it and run 'docker compose restart' to apply changes."
echo -e "Logs: docker compose logs -f    |    Stop: docker compose down${NC}"
echo ""
