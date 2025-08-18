#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset

echo "🚀 Starting Django + Gunicorn on Render..."

# Wait for database (only if DATABASE_URL is set)
if [ -n "${DATABASE_URL:-}" ]; then
  echo "⏳ Waiting for database to be ready..."
  while ! nc -z $(echo $DATABASE_URL | sed -E 's/^.*@([^:]+):([0-9]+).*$/\1 \2/'); do
    sleep 1
  done
fi

# Run migrations
echo "📦 Running database migrations..."
python manage.py migrate --noinput

# Collect static files (optional at runtime)
# echo "🎨 Collecting static files..."
# python manage.py collectstatic --noinput

# Start Gunicorn
echo "🔥 Launching Gunicorn..."
exec gunicorn judgeflow.wsgi:application --bind 0.0.0.0:${PORT} --workers 3

