#!/usr/bin/env bash
# DARKROOM / Image Security Lab - Automated Test Suite

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

echo "=== Running Backend Tests ==="
cd "$DIR/../backend"
source .venv/bin/activate
pytest tests/ -v

echo "=== Running Frontend Build Check ==="
cd "$DIR/../frontend"
npm run build

echo "=== All Tests and Builds Succeeded ==="
