#!/usr/bin/env bash
# DARKROOM / Image Security Lab - Local Development Startup (Unix/macOS)

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

echo "=========================================================="
echo " DARKROOM / Image Security Lab - Starting Development Servers"
echo "=========================================================="

# Start backend
echo "[1/2] Starting FastAPI Backend on http://localhost:8000..."
(
  cd "$DIR/../backend"
  source .venv/bin/activate
  uvicorn app.main:app --reload --port 8000
) &
BACKEND_PID=$!

trap "kill $BACKEND_PID 2>/dev/null || true" EXIT

sleep 2

# Start frontend
echo "[2/2] Starting React/Vite Frontend on http://localhost:5173..."
cd "$DIR/../frontend"
npm run dev
