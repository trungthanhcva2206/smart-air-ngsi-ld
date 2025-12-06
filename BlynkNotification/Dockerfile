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

# ========================================
# Python 3.11 Alpine Base
# ========================================
FROM python:3.11-alpine

WORKDIR /app

# ========================================
# Install System Dependencies (bao gồm GDAL, GEOS, PROJ)
# ========================================
RUN apk add --no-cache \
    gcc \
    g++ \
    musl-dev \
    curl \
    tzdata \
    gdal-dev \
    geos-dev \
    proj-dev \
    proj-util \
    linux-headers \
    postgresql-dev \
    libffi-dev \
    openblas-dev \
    lapack-dev

# Set timezone to Vietnam
ENV TZ=Asia/Ho_Chi_Minh
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# ========================================
# Install Python Dependencies
# ========================================
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ========================================
# Copy Application Files
# ========================================
COPY . .

# Create logs directory
RUN mkdir -p /app/logs

# Create non-root user
RUN addgroup -S blynk && adduser -S blynk -G blynk
RUN chown -R blynk:blynk /app

USER blynk:blynk

# ========================================
# Expose Webhook Port
# ========================================
EXPOSE 4999

# ========================================
# Health Check
# ========================================
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:4999/health || exit 1

# ========================================
# Run Notification Service
# ========================================
CMD ["python", "services/notification_service.py"]