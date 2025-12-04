FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (including geospatial libs)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    curl \
    libgeos-dev \
    libproj-dev \
    libspatialindex-dev \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ✅ FIX: Copy requirements from root (build context = project root)
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Copy route-finding application
COPY route-finding/ /app/

# Create cache directory
RUN mkdir -p /app/cache

# Create non-root user
RUN useradd -m -u 1000 routefinder && chown -R routefinder:routefinder /app
USER routefinder

# Expose Flask port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run build script first, then start API server
CMD ["sh", "-c", "python build_road_graph.py && python api_server.py"]