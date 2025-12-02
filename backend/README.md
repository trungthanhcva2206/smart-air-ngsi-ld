# 🌬️ Air Track --- NGSI-LD Backend

**Orion-LD • Spring Boot • SSE • Open Data • Residents & Alerts**

Backend processing real-time data based on NGSI-LD, receiving notifications from **Orion-LD**, streaming via **SSE**, providing **Open Data API**, managing residents, and sending alerts via Email/Telegram/Blynk.

-----

## ✨ Features

- ✔️ Receive & process **NGSI-LD notifications** from Orion-LD
- ✔️ **Auto Subscriptions** to Orion-LD on startup
- ✔️ **Public API**: platforms, weather history, air quality history
- ✔️ **SSE streaming** for real-time dashboard
- ✔️ **JWT Authentication & Authorization** (RESIDENT/ADMIN roles)
- ✔️ **Resident Management**: profile, districts subscription
- ✔️ **Email Alerts**: air quality alert (poor/very poor)
- ✔️ **Rate Limiting**: throttle alerts (default 3 hours/district)
- ✔️ OpenAPI documentation, CORS config, error handling
- ✔️ MySQL 8.0 (production) or H2 (dev mode)

------------------------------------------------------------------------

## 🏗️ Architecture
```
                       ┌──────────────────────────────────────┐
                       │         Air Track Backend            │
                       │     (Spring Boot MVC + WebFlux)      │
                       └──────────────────────────────────────┘
                           ▲           ▲            ▲
                           │           │            │
                  NGSI-LD  │           │ SSE        │ REST API
                  Notify   │           │ Stream     │ (JWT Auth)
                           │           │            │
     ┌──────────────┐      │      ┌────────┐   ┌──────────┐
     │   Orion-LD   │──────┘      │ React  │   │ Residents│
     │ Context      │             │   UI   │   │   CRUD   │
     │   Broker     │             └────────┘   └──────────┘
     └──────────────┘                  │             │
          │   │                        ▼             ▼
          │   │  Subscriptions    ┌─────────────────────┐
          │   └──────────────────▶│   SSE Service       │
          │                       │  (Weather/AirQual)  │
     ┌───────────────┐            └─────────────────────┘
     │ QuantumLeap   │                     │
     │ (TimescaleDB) │                     ▼
     └───────────────┘            ┌─────────────────────┐
                                  │ Notification Service│
                                  │   (Email Alerts)    │
                                  └─────────────────────┘


```
------------------------------------------------------------------------

## ⚙️ Tech Stack

Layer          | Technology
---------------| ---------------------------------
Framework      | Spring Boot 3.5.7 (Java 21+)
API            | Spring MVC (Blocking) + WebFlux (SSE)
Database       | MySQL 8.0 / H2 (dev)
ORM            | Spring Data JPA + Hibernate
Authentication | JWT (jjwt 0.12.6) + Spring Security
Authorization  | Role-based (RESIDENT, ADMIN)
Realtime       | Server-Sent Events (SSE/WebFlux)
NGSI-LD Client | Orion-LD, QuantumLeap (WebClient)
Email          | JavaMailSender (SMTP)
Validation     | Bean Validation (jakarta.validation)

-----

## 📁 Main Structure
```
    src/
     ├─ api/
     ├─ controller/
     ├─ service/
     │    ├─ NgsiTransformer
     │    ├─ Notification
     │    ├─ ResidentService
     │    └─ OrionSubscriptionService
     ├─ model/
     ├─ config/
     └─ repository/
```
-----

## 🔧 Installation

### 1\. Clone repo

```bash
git clone https://github.com/trungthanhcva2206/air-track-ngsi-ld.git
cd air-track-ngsi-ld
```

### 2\. Create configuration file

```bash
cp src/main/resources/application.example.properties
src/main/resources/application.properties
```

### 3\. Build

```bash
mvn clean package -DskipTests
```

### 4\. Run app

```bash
java -jar target/*.jar
```

> If using Docker: Orion-LD cannot access `localhost`; use
> `http://host.docker.internal:8081`.

-----

## 🌐 API Endpoints

### 1. Authentication (Public)

```bash
# Register new resident
POST /api/auth/register
Body: { "fullName", "email", "password", "notificationEnabled", "districts" }

# Login
POST /api/auth/login
Body: { "email", "password" }
Response: { "token", "user", "resident", "subscribedDistricts" }
```

### 2. Resident Management (Protected - JWT required)

```bash
# Update profile
PUT /api/residents/me
Headers: Authorization: Bearer <token>
Body: { "fullName", "email", "notificationEnabled", "districts" }
```

### 3. Public Data APIs

```bash
# Get all platforms (environment monitoring stations)
GET /api/platforms

# Get devices by platform
GET /api/platforms/{platformId}/devices

# Get weather history
GET /api/weather/history/{district}?limit=100

# Get air quality history
GET /api/airquality/history/{district}?limit=100
```

### 4. SSE Realtime Streaming (Public)

```bash
# Stream weather updates
GET /api/sse/stream?type=weather&district=PhuongHoanKiem

# Stream air quality updates
GET /api/sse/stream?type=airquality&district=PhuongHoanKiem
```

### 5. NGSI-LD Notifications (Internal)

```bash
# Receive notifications from Orion-LD
POST /api/notify/ngsi
Headers: Fiware-Service: hanoi
Body: NGSI-LD normalized format
```

### 6. Subscriptions Management (Internal)

```bash
# Create subscription to Orion-LD
POST /api/subscriptions/create
Body: { "entityType", "notificationUrl" }

# List all subscriptions
GET /api/subscriptions/list
```

------------------------------------------------------------------------

## 🔄 Operational Workflow

### Data Flow (Realtime)
```
Orion-LD → POST /api/notify/ngsi → NgsiTransformer
    ↓
WeatherDataDTO / AirQualityDataDTO
    ↓
    ├──▶ SSE Service → Broadcast to React clients
    └──▶ NotificationService (if AQI >= 4)
            ↓
         Filter by subscribed districts
            ↓
         EmailService → Send alerts to residents
```
### Authentication Flow
```
1. User registers → POST /api/auth/register
   - Create User (with encrypted password)
   - Create Resident (linked to User)
   - Create ResidentStation (subscribed districts)
   - Return JWT token

2. User login → POST /api/auth/login
   - Validate credentials (Spring Security)
   - Generate JWT token (userId, email, role, fullName)
   - Load resident profile + subscribed districts
   - Return token + user data

3. Protected requests → PUT /api/residents/me
   - Extract JWT from Authorization header
   - Validate token & extract userId
   - Check ownership (user can only edit own profile)
   - Process request
```
------------------------------------------------------------------------

## 🐞 Troubleshooting

### CORS Issues
- **403 Forbidden from frontend**: Ensure origin (`http://localhost:5173`) is added to `CorsConfig.java`.
- **OPTIONS preflight failed**: Check if `SecurityConfig.java` permits OPTIONS requests.

### NGSI-LD Notifications
- **Not receiving notifications**: Check if the backend URL is accessible from the Orion-LD container (use `host.docker.internal` if running in Docker).
- **Subscription creation failed**: Verify Orion-LD URL and tenant name in `application.properties`.

### SSE Streaming
- **SSE not streaming**: Check CORS headers and WebFlux configuration.
- **Connection timeout**: Increase `spring.webflux.timeout` in config.

### Authentication
- **401 Unauthorized**: JWT token expired or invalid, please login again.
- **403 Forbidden**: User does not have permission to access the endpoint (check role).
- **Email already exists**: The email has already been registered by another user.

### Email Alerts
- **Not receiving emails**: Check SMTP config in `application.properties`.
- **Email spam**: Check email provider settings and whitelist the sender.
- **Throttle alerts**: Alerts are sent at most once every 3 hours per district.

-----

## 📜 License

Apache 2.0 --- view `LICENSE` file.

-----

## 👥 Authors

- **TT** --- trungthanhcva2206@gmail.com
- **Tankchoi** --- tadzltv22082004@gmail.com
- **Panh** --- panh812004.apn@gmail.com

Copyright © 2025 TAA. All rights reserved.

-----

## 💡 Support

If you encounter issues, please:

1.  Check [Issues](https://github.com/trungthanhcva2206/air-track-ngsi-ld/issues)
2.  View [Documentation Wiki](https://github.com/trungthanhcva2206/air-track-ngsi-ld/wiki)
3.  Discuss in [Discussions](https://github.com/trungthanhcva2206/air-track-ngsi-ld/discussions)
4.  Contact authors
