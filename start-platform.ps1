#!/usr/bin/env powershell
# Windows PowerShell script to start both services

Write-Host "Starting AI Autism Assistant Platform..." -ForegroundColor Cyan

# Start FastAPI Backend in new window
Write-Host "`n1. Starting FastAPI Backend on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "cd '$PWD\backend'; python -m venv venv; .\venv\Scripts\Activate.ps1; pip install -r requirements.txt; uvicorn main:app --reload --port 8000" -NoNewWindow

# Wait for backend to start
Write-Host "   Waiting for backend to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Check backend health
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 3
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✓ Backend is running!" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠ Backend may still be starting..." -ForegroundColor Yellow
}

# Start Next.js Frontend
Write-Host "`n2. Starting Next.js Frontend on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "cd '$PWD'; npm run dev" -NoNewWindow

Write-Host "`n✅ Platform is starting!" -ForegroundColor Green
Write-Host "`n🌐 Access:" -ForegroundColor Cyan
Write-Host "   Main Chat: http://localhost:3000/assistant" -ForegroundColor White
Write-Host "   Screening: http://localhost:3000/screening" -ForegroundColor White
Write-Host "   Parent Guide: http://localhost:3000/parent-guidance" -ForegroundColor White
Write-Host "`n📊 Metrics API: http://localhost:8000/model-metrics" -ForegroundColor Gray
Write-Host "`nPress Ctrl+C in each window to stop services." -ForegroundColor Yellow