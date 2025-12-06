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
# Build stage - ĐỔI SANG NODE 20
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Fix permissions for node_modules binaries
RUN chmod -R +x node_modules/.bin

# Build arguments
ARG VITE_API_URL
ARG VITE_API_ROUTE_URL

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_ROUTE_URL=$VITE_API_ROUTE_URL

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create directories for certbot
RUN mkdir -p /var/www/certbot /etc/letsencrypt

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]