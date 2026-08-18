FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . /app/backend
COPY yolov8n.pt /app/yolov8n.pt 2>/dev/null || true

ENV PYTHONPATH=/app
ENV PORT=${PORT:-8000}

CMD sh -c "uvicorn backend.api.main:app --host 0.0.0.0 --port ${PORT}"
