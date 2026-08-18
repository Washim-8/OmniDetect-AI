#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}/frontend"

DEFAULT_API_URL="https://omnidetect-ai-cx4w.onrender.com"
VITE_API_URL="${VITE_API_URL:-$DEFAULT_API_URL}"
VITE_API_URL="${VITE_API_URL%/}"
export VITE_API_URL

NODE_MAJOR_DESIRED="${NODE_MAJOR_DESIRED:-20}"
echo "==> Node version:  $(node -v)  (want v${NODE_MAJOR_DESIRED}.x LTS)"
echo "==> npm  version:  $(npm -v)"
echo "==> cwd:           $(pwd)"
echo "==> VITE_API_URL:  ${VITE_API_URL}"

export NPM_CONFIG_LEGACY_PEER_DEPS=true
export NPM_CONFIG_ENGINE_STRICT=false
export NODE_OPTIONS="--max-old-space-size=4096"

if [[ -f package-lock.json ]]; then
  echo "==> package-lock.json found; using --prefer-offline --no-audit --no-fund"
  npm ci --no-audit --no-fund --prefer-offline --legacy-peer-deps 2>/dev/null || \
    npm ci --no-audit --no-fund --prefer-offline --legacy-peer-deps --force 2>/dev/null || \
    npm install --no-audit --no-fund --prefer-offline --legacy-peer-deps || \
    npm install --no-audit --no-fund --prefer-offline --legacy-peer-deps --force
else
  echo "==> No package-lock.json; installing with --legacy-peer-deps (see frontend/.npmrc)"
  npm install --legacy-peer-deps || \
    npm install --legacy-peer-deps --force
fi

echo "==> Installed versions:"
npm ls vite esbuild --depth=0 2>/dev/null || true

echo "==> Running vite build..."
npm run build

echo "==> Build output (dist/):"
du -sh dist 2>/dev/null || true
find dist -maxdepth 2 -type f | sort | head -n 30
echo "==> Frontend build successful"
