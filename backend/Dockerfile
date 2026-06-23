FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

# Set work directory
WORKDIR /app

# Install system dependencies (--no-install-recommends keeps the image lean)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gettext \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (cached layer)
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# Copy project
COPY . .

# Bake the deployed git commit into the image so /api/health/ can report exactly
# which code is running. Placed after COPY . . so it only invalidates this final
# cheap layer (not the dep install). Lets auto-deploy.sh assert the live backend
# matches the pulled HEAD instead of trusting a bare 200 from a stale container.
ARG GIT_COMMIT=unknown
ENV GIT_COMMIT=$GIT_COMMIT

# Create non-root user and data directory for SQLite
RUN adduser --disabled-password --gecos '' appuser && \
    mkdir -p /app/data /app/logs && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Collect static files (SECRET_KEY needed at build time for Django to load settings)
RUN SECRET_KEY=build-only-placeholder SECURE_SSL_REDIRECT=False uv run python manage.py collectstatic --noinput

EXPOSE 8000

# Run gunicorn
CMD ["uv", "run", "gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--threads", "2", "--timeout", "60", "--max-requests", "1000", "--max-requests-jitter", "50", "config.wsgi:application"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD uv run python manage.py check || exit 1
