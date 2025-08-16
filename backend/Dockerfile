# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=judgeflow.settings

# Set work directory
WORKDIR /app

# Install system dependencies including build tools for Python packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        netcat-openbsd \
        gcc \
        g++ \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js for JavaScript code execution
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy project
COPY . /app/

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Run the application using Gunicorn
CMD ["gunicorn", "judgeflow.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]