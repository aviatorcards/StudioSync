#!/bin/bash

# Find the local IP address (works on Linux/macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    IP=$(ipconfig getifaddr en0)
else
    IP=$(hostname -I | cut -d' ' -f1)
fi

echo "🚀 Starting StudioSync in Networked Mode"
echo "========================================"
echo "📡 Local IP detected: $IP"
echo "🔌 Backend will be accessible at: http://$IP:8000/api"
echo ""

# Export variable for Docker Compose
export NEXT_PUBLIC_API_URL="http://$IP:8000/api"
export ALLOWED_HOSTS="*"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose down

# Start containers
echo "🟢 Starting containers..."
docker compose up -d --build

echo ""
echo "✅ Setup complete!"
echo "🌐 Access the app on other devices at: http://$IP:3000"
