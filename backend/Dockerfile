# Multi-stage build for smaller production image
FROM python:3.12-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    gcc \
    musl-dev \
    postgresql-dev \
    postgresql-client \
    linux-headers \
    curl

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Development stage (with all source code mounted as volume)
FROM base AS development

# Copy application code
COPY . .

# Create directory for media files
RUN mkdir -p /app/media

EXPOSE 8000

# Default to runserver for development
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Production stage
FROM base AS production

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app/media /app/staticfiles && \
    chown -R appuser:appuser /app

# Copy application code
COPY --chown=appuser:appuser . .

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Switch to non-root user
USER appuser

EXPOSE 8000

# Use gunicorn with uvicorn workers for ASGI support
CMD ["gunicorn", "config.asgi:application", \
    "--bind", "0.0.0.0:8000", \
    "--workers", "4", \
    "--worker-class", "uvicorn.workers.UvicornWorker", \
    "--access-logfile", "-", \
    "--error-logfile", "-"]
