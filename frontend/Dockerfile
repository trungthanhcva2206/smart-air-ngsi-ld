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