#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}/frontend"

VITE_API_URL="${VITE_API_URL:-https://object-detection-backend.onrender.com}"
export VITE_API_URL

echo "Building frontend with VITE_API_URL=${VITE_API_URL}"

npm install --no-audit --no-fund
npm run build
