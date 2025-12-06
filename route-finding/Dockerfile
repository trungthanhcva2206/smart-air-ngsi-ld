# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# @Project smart-air-ngsi-ld
# @Authors
#    - TT (trungthanhcva2206@gmail.com)
#    - Tankchoi (tadzltv22082004@gmail.com)
#    - Panh (panh812004.apn@gmail.com)
# @Copyright (C) 2025 TAA. All rights reserved
# @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
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