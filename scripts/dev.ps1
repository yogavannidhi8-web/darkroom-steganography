# DARKROOM / Image Security Lab - Local Development Startup (Windows PowerShell)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " DARKROOM / Image Security Lab - Starting Development Servers" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start backend in background job
Write-Host "`n[1/2] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Yellow
$BackendProcess = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\backend'; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8000" -PassThru

Start-Sleep -Seconds 2

# 2. Start frontend
Write-Host "[2/2] Starting React/Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
cd "$PSScriptRoot\..\frontend"
npm run dev
