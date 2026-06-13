# Quick start script for Docker Compose (Windows PowerShell)

Write-Host "🚀 Starting Consultation Recording Manager with Docker Compose..." -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Please edit .env with your actual values:" -ForegroundColor Blue
    Write-Host "   notepad .env"
}

# Build and start
Write-Host "🔨 Building and starting services..." -ForegroundColor Green
docker-compose up --build

# After Ctrl+C
Write-Host "✋ Stopping services..." -ForegroundColor Yellow
docker-compose down
