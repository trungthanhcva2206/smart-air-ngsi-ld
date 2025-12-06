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
# Stage 1: Build Dependencies (Cache Layer)
# ========================================
FROM eclipse-temurin:21-jdk-alpine AS dependencies

WORKDIR /build

# Install Maven
RUN apk add --no-cache maven

# Copy pom.xml to download dependencies (this layer will be cached)
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# ========================================
# Stage 2: Build Application
# ========================================
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /build

# Install Maven
RUN apk add --no-cache maven

# Copy dependencies from cache layer
COPY --from=dependencies /root/.m2 /root/.m2

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build application (skip tests for faster build)
RUN mvn clean package -DskipTests -B

# ========================================
# Stage 3: Runtime Environment
# ========================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Install curl for healthcheck and set timezone
RUN apk add --no-cache curl tzdata

# Set timezone to Vietnam
ENV TZ=Asia/Ho_Chi_Minh
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copy JAR from build stage
COPY --from=build /build/target/*.jar app.jar

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Create logs directory with correct permissions
RUN mkdir -p /app/logs && chown -R spring:spring /app

# Switch to non-root user
USER spring:spring

# Expose port
EXPOSE 8123

# JVM options for production
ENV JAVA_OPTS="-Xmx1024m \
               -Xms512m \
               -XX:+UseG1GC \
               -XX:MaxGCPauseMillis=200 \
               -XX:+UseStringDeduplication \
               -XX:+HeapDumpOnOutOfMemoryError \
               -XX:HeapDumpPath=/app/logs/heap-dump.hprof \
               -Djava.security.egd=file:/dev/./urandom"


# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]