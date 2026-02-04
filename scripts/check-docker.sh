#!/bin/bash

echo "🔍 Checking Docker installation..."
echo ""

# Check if Docker command exists
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    echo ""
    echo "📥 To install Docker Desktop on macOS:"
    echo ""
    echo "Option 1: Download from website"
    echo "   open https://www.docker.com/products/docker-desktop/"
    echo ""
    echo "Option 2: Install via Homebrew"
    echo "   brew install --cask docker"
    echo ""
    exit 1
fi

echo "✅ Docker command found"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker is installed but not running"
    echo ""
    echo "Please start Docker Desktop and try again"
    echo "You can start it from Applications or Spotlight"
    exit 1
fi

echo "✅ Docker daemon is running"
echo ""

# Show versions
echo "📋 Versions:"
docker --version
docker compose --version || docker compose version

echo ""
echo "🎉 Docker is ready! You can now run:"
echo "   ./scripts/init-demo.sh"
echo ""
