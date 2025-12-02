# 🌬️ Smart Air --- NGSI-LD Backend

**Orion-LD • Spring Boot • SSE • Open Data • Residents & Alerts**

Backend xử lý dữ liệu thời gian thực dựa trên NGSI-LD, nhận
notifications từ **Orion-LD**, stream qua **SSE**, cung cấp **Open Data
API**, quản lý cư dân/residents và phát cảnh báo qua
Email/Telegram/Blynk.

------------------------------------------------------------------------

## ✨ Features

-   ✔️ Nhận & xử lý **NGSI-LD notifications** từ Orion-LD
-   ✔️ **Auto Subscriptions** vào Orion-LD khi khởi động
-   ✔️ **Public API**: platforms, weather history, air quality history
-   ✔️ **SSE streaming** cho dashboard thời gian thực
-   ✔️ **JWT Authentication & Authorization** (RESIDENT/ADMIN roles)
-   ✔️ **Resident Management**: profile, districts subscription
-   ✔️ **Email Alerts**: cảnh báo chất lượng không khí (poor/very poor)
-   ✔️ **Rate Limiting**: throttle alerts (mặc định 3 giờ/district)
-   ✔️ OpenAPI documentation, CORS config, error handling
-   ✔️ MySQL 8.0 (production) hoặc H2 (dev mode)

------------------------------------------------------------------------

## 🏗️ Kiến trúc

                       ┌──────────────────────────────────────┐
                       │         Smart Air Backend            │
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

------------------------------------------------------------------------

## ⚙️ Tech Stack

  Layer           Technology
  --------------- ---------------------------------
  Framework       Spring Boot 3.5.7 (Java 21+)
  API             Spring MVC (Blocking) + WebFlux (SSE)
  Database        MySQL 8.0 / H2 (dev)
  ORM             Spring Data JPA + Hibernate
  Authentication  JWT (jjwt 0.12.6) + Spring Security
  Authorization   Role-based (RESIDENT, ADMIN)
  Realtime        Server-Sent Events (SSE/WebFlux)
  NGSI-LD Client  Orion-LD, QuantumLeap (WebClient)
  Email           JavaMailSender (SMTP)
  Validation      Bean Validation (jakarta.validation)

------------------------------------------------------------------------

## 📁 Cấu trúc chính

    src/
     ├─ api/
     ├─ controller/
     ├─ service/
     │    ├─ NgsiTransformer
     │    ├─ Notification
     │    ├─ ResidentService
     │    └─ OrionSubscriptionService
     ├─ model/
     ├─ config/
     └─ repository/

------------------------------------------------------------------------

## 🔧 Cài đặt

### 1. Clone repo

``` bash
git clone https://github.com/trungthanhcva2206/smart-air-ngsi-ld.git
cd smart-air-ngsi-ld
```

### 2. Tạo file cấu hình

``` bash
cp src/main/resources/application.example.properties    src/main/resources/application.properties
```

### 3. Build

``` bash
mvn clean package -DskipTests
```

### 4. Chạy app

``` bash
java -jar target/*.jar
```

> Nếu dùng Docker: Orion-LD không thể truy cập `localhost`; dùng
> `http://host.docker.internal:8081`.

------------------------------------------------------------------------

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

## 🔄 Quy trình hoạt động

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
- **403 Forbidden from frontend**: Đảm bảo origin (`http://localhost:5173`) đã được thêm vào `CorsConfig.java`
- **OPTIONS preflight failed**: Check `SecurityConfig.java` đã permit OPTIONS requests chưa

### NGSI-LD Notifications
- **Không nhận notifications**: Kiểm tra URL backend có accessible từ Orion-LD container không (dùng `host.docker.internal` nếu chạy Docker)
- **Subscription không tạo được**: Verify Orion-LD URL và tenant name trong `application.properties`

### SSE Streaming
- **SSE không stream**: Kiểm tra CORS headers và WebFlux configuration
- **Connection timeout**: Tăng `spring.webflux.timeout` trong config

### Authentication
- **401 Unauthorized**: JWT token expired hoặc invalid, login lại
- **403 Forbidden**: User không có quyền truy cập endpoint (check role)
- **Email already exists**: Email đã được đăng ký bởi user khác

### Email Alerts
- **Không nhận email**: Kiểm tra SMTP config trong `application.properties`
- **Email spam**: Check email provider settings, whitelist sender
- **Throttle alerts**: Alerts chỉ gửi tối đa 1 lần / 3 giờ cho mỗi district

------------------------------------------------------------------------

## 📜 License

Apache 2.0 - xem file `LICENSE`

------------------------------------------------------------------------

## 👥 Authors

-   **TT** - trungthanhcva2206@gmail.com
-   **Tankchoi** - tadzltv22082004@gmail.com  
-   **Panh** - panh812004.apn@gmail.com

Copyright © 2025 CHK. All rights reserved.

------------------------------------------------------------------------

## 💡 Support

Nếu gặp vấn đề, vui lòng:

1. Check [Issues](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/issues)
2. Đọc [Wiki Documentation](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/wiki)
3. Tham gia [Discussions](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/discussions)
4. Liên hệ trực tiếp authors
