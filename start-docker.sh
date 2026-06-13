#!/bin/bash
# Quick start script for Docker Compose

echo "🚀 Starting Consultation Recording Manager with Docker Compose..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env with your actual values (MongoDB URI, API keys, etc.)"
    echo "   nano .env"
fi

# Build and start
echo "🔨 Building and starting services..."
docker-compose up --build

# After Ctrl+C
echo "✋ Stopping services..."
docker-compose down
