#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PYTHONPATH="${PYTHONPATH:-${SCRIPT_DIR}}"
export PORT="${PORT:-8000}"
export MODEL_PATH="${MODEL_PATH:-yolov8n.pt}"
export PYTHONUNBUFFERED="${PYTHONUNBUFFERED:-1}"

cd "${SCRIPT_DIR}"
exec uvicorn backend.api.main:app --host 0.0.0.0 --port "$PORT" --workers 1 --timeout-keep-alive 300
