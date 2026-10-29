FROM python:3.12-alpine3.24 AS dependencies

COPY --from=ghcr.io/astral-sh/uv:0.12.24 /uv /uvx /bin/

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

# Set work directory
WORKDIR /app

# Install build dependencies only in the dependency stage.
RUN apk add --no-cache build-base postgresql-dev gettext

# Install Python dependencies (cached layer)
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# Keep compilers, headers and build utilities out of the runtime image.
# uv stays in the dependency stage: the runtime runs the venv directly, so the
# image ships no uv/uvx binaries and none of their bundled crates (#705).
FROM python:3.12-alpine3.24
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    VIRTUAL_ENV=/app/.venv \
    PATH=/app/.venv/bin:$PATH
WORKDIR /app
COPY --from=dependencies /app/.venv /app/.venv
# Dependencies come from the uv-built venv; pip from the base image is not needed here.
RUN apk upgrade --no-cache && /usr/local/bin/python -m pip uninstall --yes pip

# Copy project
COPY . .

# Bake the deployed git commit into the image so /api/health/ can report exactly
# which code is running. Placed after COPY . . so it only invalidates this final
# cheap layer (not the dep install). Lets auto-deploy.sh assert the live backend
# matches the pulled HEAD instead of trusting a bare 200 from a stale container.
ARG GIT_COMMIT=unknown
ENV GIT_COMMIT=$GIT_COMMIT

# Create non-root user and data directory for SQLite
RUN adduser -D appuser && \
    mkdir -p /app/data /app/logs && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Collect static files (SECRET_KEY needed at build time for Django to load settings)
RUN SECRET_KEY=build-only-placeholder SECURE_SSL_REDIRECT=False /app/.venv/bin/python manage.py collectstatic --noinput

EXPOSE 8000

# Apply migrations, then run gunicorn. Nothing in auto-deploy.sh migrates, and
# the new image serves the new models the moment it starts, so an unapplied
# migration would 500 every endpoint that reads the changed table while
# /api/health/ stays green. `exec` hands PID 1 to gunicorn for signals; a
# failed migration stops the container instead of serving a mismatched schema.
CMD ["sh", "-c", "/app/.venv/bin/python manage.py migrate --noinput && exec /app/.venv/bin/gunicorn --bind 0.0.0.0:8000 --workers 3 --threads 2 --timeout 60 --max-requests 1000 --max-requests-jitter 50 config.wsgi:application"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD /app/.venv/bin/python manage.py check || exit 1
