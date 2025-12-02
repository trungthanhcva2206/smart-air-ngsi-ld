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
-   ✔️ **Open Data API**: weather, airquality, districts, platforms
-   ✔️ **SSE streaming** cho dashboard thời gian thực
-   ✔️ **JWT Authentication + RBAC** (Admin/User)
-   ✔️ Residents, stations, district mapping
-   ✔️ Cảnh báo qua **Email / Telegram / Blynk**
-   ✔️ Logging, OpenAPI, retry-policy, GeoJSON loader
-   ✔️ PostgreSQL hoặc H2 (dev mode)

------------------------------------------------------------------------

## 🏗️ Kiến trúc

                       ┌──────────────────────────────────────┐
                       │              Smart Air               │
                       │            Backend API               │
                       └──────────────────────────────────────┘
                                     ▲                ▲
                                     │                │ SSE Stream
                                     │                │ (/api/sse/*)
                             NGSI-LD Notifications    │
                         (POST /api/notify/ngsi)      │
                                     │                │
     ┌──────────────┐     ┌─────────────────┐      ┌───────────────────┐
     │   Orion-LD   │───▶ │  Transformer    │────▶│  NotificationSvc  │───▶ Email/Telegram/Blynk
     └──────────────┘     └─────────────────┘      └───────────────────┘
          ▲   │                             │
          │   │  Subscriptions              ▼
          │   └───────────────────────┐   SSE Emit
          │                           │
     ┌───────────────┐                │
     │ QuantumLeap   │◀───────────────┘
     └───────────────┘

------------------------------------------------------------------------

## ⚙️ Tech stack

  Layer       Technology
  ----------- --------------------------
  Framework   Spring Boot (Java 21+)
  API         Spring MVC + WebFlux Mix
  DB          PostgreSQL / H2
  Realtime    Server-Sent Events (SSE)
  NGSI-LD     Orion-LD, QuantumLeap
  Auth        JWT + RBAC
  Messaging   Email, Telegram, Blynk

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

## 🌐 API chính

### Health

    GET /actuator/health
    GET /api/health

### Notifications (Orion-LD → Backend)

    POST /api/notify/ngsi

### Open Data

    GET /api/open/weather/latest
    GET /api/open/airquality/latest
    GET /api/open/platforms
    GET /api/open/districts

### SSE (Realtime)

    GET /api/sse/weather/{district}
    GET /api/sse/airquality/{district}
    GET /api/sse/airquality/alerts

### Auth

    POST /api/auth/register
    POST /api/auth/login

### Subscriptions

    POST /api/subscriptions/create
    GET  /api/subscriptions/list

Ví dụ:

``` bash
curl -X POST http://localhost:8081/api/subscriptions/create   -H "Content-Type: application/json"   -d '{"type":"AirQuality","notificationUrl":"http://backend:8081/api/notify/ngsi"}'
```

------------------------------------------------------------------------

## 🔄 Quy trình hoạt động

    Orion-LD → /api/notify/ngsi → NgsiTransformer →
    → NotificationService → SSE Emit → Frontend Dashboard
                               ↳ Alerts (Email/Telegram/Blynk)

------------------------------------------------------------------------

## 🐞 Troubleshooting

-   Không nhận notifications → kiểm tra URL backend có reachable từ
    container Orion
-   SSE không stream → kiểm tra headers + logs
-   Lỗi Dev trên Windows → đảm bảo file shell không có BOM, dùng UTF-8
    LF

------------------------------------------------------------------------

## 📜 License

Apache 2.0 --- xem file `LICENSE`.

------------------------------------------------------------------------

## 👥 Authors

-   **TT** --- trungthanhcva2206@gmail.com
-   **Tankchoi** --- tadzltv22082004@gmail.com
-   **Panh** --- panh812004.apn@gmail.com

------------------------------------------------------------------------

## 💡 Support

-   Issues:
    https://github.com/trungthanhcva2206/smart-air-ngsi-ld/issues
-   Email như trên
