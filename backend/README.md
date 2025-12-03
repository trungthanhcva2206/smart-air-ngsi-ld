# 🌬️ Air Track --- NGSI-LD Backend

**Orion-LD • Spring Boot • SSE • Open Data • Residents & Alerts**

Backend processing real-time data based on NGSI-LD, receiving notifications from **Orion-LD**, streaming via **SSE**, providing **Open Data API**, managing residents, and sending alerts via Email/Telegram/Blynk.

-----

## ✨ Features

- ✔️ Receive & process **NGSI-LD notifications** from Orion-LD
- ✔️ **Auto Subscriptions** to Orion-LD on startup
- ✔️ **Open Data API**: weather, air quality, districts, platforms
- ✔️ **SSE streaming** for real-time dashboard
- ✔️ **JWT Authentication + RBAC** (Admin/User)
- ✔️ Residents, stations, district mapping
- ✔️ Alerts via **Email / Telegram / Blynk**
- ✔️ Logging, OpenAPI, retry-policy, GeoJSON loader
- ✔️ PostgreSQL or H2 (dev mode)

------------------------------------------------------------------------

## 🏗️ Architecture
```
                       ┌──────────────────────────────────────┐
                       │              Air Track               │
                       │            Backend API               │
                       └──────────────────────────────────────┘
                                     ▲                ▲
                                     │                │ SSE Stream
                                     │                │ (/api/sse/\*)
                             NGSI-LD Notifications    │
                         (POST /api/notify/ngsi)      │
                                     │                │
     ┌──────────────┐     ┌─────────────────┐      ┌───────────────────┐
     │   Orion-LD   │───▶ │  Transformer    │────▶│  NotificationSvc  │───▶ Email/Telegram/Blynk
     └──────────────┘     └─────────────────┘      └───────────────────┘
          ▲   │                             │
          │   │  Subscriptions              ▼
          │   └───────────────────────┐   SSE Emit
          │                           │
     ┌───────────────┐                │
     │ QuantumLeap   │◀───────────────┘
     └───────────────┘
```
------------------------------------------------------------------------

## ⚙️ Tech stack

Layer      | Technology
-----------|--------------------------
Framework  | Spring Boot (Java 21+)
API        | Spring MVC + WebFlux Mix
DB         | PostgreSQL / H2
Realtime   | Server-Sent Events (SSE)
NGSI-LD    | Orion-LD, QuantumLeap
Auth       | JWT + RBAC
Messaging  | Email, Telegram, Blynk

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
cp src/main/resources/application.example.properties    src/main/resources/application.properties
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

## 🌐 Main APIs

### Health
```
    GET /actuator/health
    GET /api/health
```
### Notifications (Orion-LD → Backend)
```
    POST /api/notify/ngsi
```
### Open Data
```
    GET /api/open/weather/latest
    GET /api/open/airquality/latest
    GET /api/open/platforms
    GET /api/open/districts
```
### SSE (Realtime)
```
    GET /api/sse/weather/{district}
    GET /api/sse/airquality/{district}
    GET /api/sse/airquality/alerts
```
### Auth
```
    POST /api/auth/register
    POST /api/auth/login
```
### Subscriptions
```
    POST /api/subscriptions/create
    GET  /api/subscriptions/list
```
Example:
```bash
curl -X POST http://localhost:8081/api/subscriptions/create   -H "Content-Type: application/json"   -d '{"type":"AirQuality","notificationUrl":"http://backend:8081/api/notify/ngsi"}'
```

------------------------------------------------------------------------

## 🔄 Operational Workflow
```
    Orion-LD → /api/notify/ngsi → NgsiTransformer →
    → NotificationService → SSE Emit → Frontend Dashboard
                               ↳ Alerts (Email/Telegram/Blynk)
```
------------------------------------------------------------------------

## 🐞 Troubleshooting

- Not receiving notifications → check if backend URL is reachable from the Orion container
- SSE not streaming → check headers + logs
- Dev error on Windows → ensure shell files have no BOM, use UTF-8 LF

-----

## 📜 License

Apache 2.0 --- see `LICENSE` file.

-----

## 👥 Authors

- **TT** --- trungthanhcva2206@gmail.com
- **Tankchoi** --- tadzltv22082004@gmail.com
- **Panh** --- panh812004.apn@gmail.com

-----

## 💡 Support

If you encounter issues, please:

1.  Check [Issues](https://github.com/trungthanhcva2206/air-track-ngsi-ld/issues)
2.  View [Documentation Wiki](https://github.com/trungthanhcva2206/air-track-ngsi-ld/wiki)
3.  Discuss in [Discussions](https://github.com/trungthanhcva2206/air-track-ngsi-ld/discussions)
4.  Contact authors
