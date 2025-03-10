FROM python:3.9-slim

WORKDIR /app

# Add a dedicated user for security
RUN adduser --disabled-password --gecos '' appuser

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the app code
COPY . .

# Create necessary directories if they don't exist
RUN mkdir -p /app/static/css /app/static/js /app/templates && \
    chown -R appuser:appuser /app

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8080
ENV PYTHONDONTWRITEBYTECODE=1

# Expose port
EXPOSE 8080

# Switch to non-root user
USER appuser

# Run the application with gunicorn
CMD python3 app.py