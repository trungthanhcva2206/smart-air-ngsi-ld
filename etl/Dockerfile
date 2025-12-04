FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from root
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy ONLY etl directory to /app/etl/
COPY etl/ ./etl/

# Copy .env from root
COPY .env .env

# Create logs directory
RUN mkdir -p logs

# Healthcheck
HEALTHCHECK --interval=60s --timeout=10s --start-period=180s --retries=3 \
  CMD python -c "import sys; sys.exit(0)" || exit 1

# Set Python path
ENV PYTHONPATH=/app

# Run ETL pipeline
CMD ["python", "-m", "etl.Core_ETL.main"]