# Multi-stage production build: Frontend + Backend in one container
# Stage 1: Build React Vite Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python Backend + Static Asset Host
FROM python:3.12-slim
WORKDIR /app

# Install system libraries needed by OpenCV and SciPy
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY backend/ ./

# Copy built frontend assets from Stage 1 into backend's static directory
COPY --from=frontend-builder /app/frontend/dist ./static

# Security: run as non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Run uvicorn on dynamic platform port
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
