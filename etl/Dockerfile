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