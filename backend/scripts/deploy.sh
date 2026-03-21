#!/bin/bash
set -euo pipefail

# Emelmujiro backend standalone deploy script
# NOTE: Production uses Docker (scripts/auto-deploy.sh). This script is for
# manual non-Docker deployment only.

echo "🚀 Starting Emelmujiro backend deployment..."

# Check environment file
if [ ! -f .env ]; then
    echo "❌ .env file not found. Copy .env.example and fill in real values."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
uv sync --frozen --extra dev

# Collect static files
echo "📁 Collecting static files..."
uv run python manage.py collectstatic --noinput

# Apply migrations
echo "🗄️  Running database migrations..."
uv run python manage.py migrate

# Check for superuser
echo "👤 Checking superuser status..."
uv run python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(is_superuser=True).exists():
    print('No superuser found. Create one with: uv run python manage.py createsuperuser')
else:
    print('Superuser already exists.')
"

# Start server (prefer Gunicorn for production)
echo "🌐 Starting server..."
if command -v gunicorn &> /dev/null || uv run which gunicorn &> /dev/null; then
    echo "Starting with Gunicorn..."
    uv run gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3
else
    echo "Starting dev server... (use Gunicorn for production)"
    uv run python manage.py runserver 0.0.0.0:8000
fi
