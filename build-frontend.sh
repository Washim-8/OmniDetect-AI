#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}/frontend"

DEFAULT_API_URL="https://omnidetect-ai-cx4w.onrender.com"
VITE_API_URL="${VITE_API_URL:-$DEFAULT_API_URL}"
VITE_API_URL="${VITE_API_URL%/}"
export VITE_API_URL

echo "==> Node version: $(node -v)"
echo "==> npm version: $(npm -v)"
echo "==> Building frontend with VITE_API_URL=${VITE_API_URL}"

npm install --no-audit --no-fund
echo "==> Installed esbuild version:"
npm ls esbuild 2>/dev/null || echo "(esbuild listing skipped)"

echo "==> Running vite build..."
npm run build

echo "==> Build output:"
ls -la dist/
echo "==> Frontend build successful ✓"
