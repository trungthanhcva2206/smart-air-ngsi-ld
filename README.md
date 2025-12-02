# Smart Air NGSI-LD

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![NGSI-LD](https://img.shields.io/badge/NGSI--LD-compatible-green.svg)](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.08.01_60/gs_cim009v010801p.pdf)

Hệ thống theo dõi và quản lý dữ liệu chất lượng không khí dựa trên NGSI-LD và Linked Data.

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Tính năng](#-tính-năng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt nhanh](#-cài-đặt-nhanh)
- [Cài đặt chi tiết](#-cài-đặt-chi-tiết)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Lịch sử thay đổi](#-lịch-sử-thay-đổi)
- [Đóng góp](#-đóng-góp)
- [Giấy phép](#-giấy-phép)
- [Liên hệ](#-liên-hệ)

## 🌟 Giới thiệu

Smart Air NGSI-LD là giải pháp toàn diện để thu thập, lưu trữ và phân tích dữ liệu chất lượng không khí theo chuẩn NGSI-LD (Next Generation Service Interfaces - Linked Data). Hệ thống hỗ trợ theo dõi các thông số:

**Chất lượng không khí:**
- 🌫️ PM2.5 và PM10 (Bụi mịn)
- 💨 CO, NO, NO₂, NOₓ, O₃, SO₂, NH₃ (Các khí gây ô nhiễm)
- 📊 AQI (Air Quality Index - Chỉ số chất lượng không khí)

**Thời tiết:**
- 🌡️ Nhiệt độ và cảm giác nhiệt độ
- 💧 Độ ẩm
- 🌬️ Tốc độ và hướng gió
- 🌧️ Lượng mưa
- ☁️ Độ mây, tầm nhìn xa
- 🔆 Độ sáng (Illuminance)
- ⏲️ Áp suất khí quyển

Dữ liệu được mô hình hóa theo chuẩn ontology **SOSA/SSN** (Sensor, Observation, Sample, and Actuator / Semantic Sensor Network), đảm bảo tính tương thích và khả năng mở rộng cao.

## 🏗️ Kiến trúc hệ thống
<a id="kiến-trúc-hệ-thống"></a>

![Smart Air Architecture](./assets/architecture.drawio.svg)

## 🛠️ Công nghệ sử dụng
<a id="công-nghệ-sử-dụng"></a>

### Core Technologies
- **NGSI-LD**: Context Information Management API
- **JSON-LD**: Linked Data format
- **SOSA/SSN Ontology**: Sensor network ontology

### Infrastructure
- **Docker & Docker Compose**: Container orchestration
- **MongoDB**: Document database cho Orion-LD và IoT Agent
- **TimescaleDB**: Time-series database tối ưu cho dữ liệu chuỗi thời gian
- **Redis**: Caching layer cho QuantumLeap

### FIWARE Components
- **Orion-LD Context Broker**: 
  - NGSI-LD API endpoint cho entity management
  - Real-time context data storage và subscription
  - Multi-tenancy support (tenant: `hanoi`)
  - Integration với MongoDB backend
- **IoT Agent JSON**:
  - Protocol translation MQTT ↔ NGSI-LD
  - Device provisioning và attribute mapping
  - Southbound: MQTT protocol via Mosquitto
  - Northbound: NGSI-LD entities tới Orion-LD
- **Eclipse Mosquitto**:
  - MQTT Broker cho IoT devices (ESP32)
  - Support MQTT protocol (port 1883) và WebSocket (port 9001)
  - Allow anonymous connections cho development
- **QuantumLeap**:
  - Time-series data API theo chuẩn FIWARE
  - Automatic subscription tới Orion-LD notifications
  - Storage backend: TimescaleDB với Redis caching
  - RESTful API cho historical data queries

### Backend
- **Python**: 
  - ETL pipeline xử lý dữ liệu OpenWeather API
  - MQTT publisher gửi dữ liệu tới IoT Agent
  - NGSI-LD entity creation theo chuẩn SOSA/SSN
  - Data transformation và validation
- **Spring Boot**: 
  - RESTful API endpoints (Platform, Weather, Air Quality history)
  - JWT Authentication & Authorization
  - Email notification service cho air quality alerts
  - SSE (Server-Sent Events) cho real-time data streaming
  - Integration với FIWARE Orion-LD Context Broker
  - Integration với QuantumLeap cho time-series data

### Frontend
- **React 18**: UI framework với Hooks
- **React Router**: Client-side routing
- **React Leaflet**: Interactive maps
- **Recharts**: Data visualization
- **React Toastify**: Real-time notifications
- **Axios**: HTTP client
- **SCSS**: Styling

## ✨ Tính năng

- **Thu thập dữ liệu thời gian thực**: Streaming data từ cảm biến thật (ESP32) và API nguồn mở (OpenWeather)
- **Chuẩn hóa NGSI-LD**: ETL pipeline chuyển đổi dữ liệu thô sang NGSI-LD theo chuẩn FIWARE
- **Quản lý entity**: CRUD operations cho Platform, Device, WeatherObserved, AirQualityObserved
- **Lưu trữ Time Series**: QuantumLeap + TimescaleDB tối ưu cho dữ liệu chuỗi thời gian
- **Dashboard trực quan**: Real-time SSE streaming, interactive charts, air quality alerts
- **Tìm đường tối ưu**: Thuật toán A* routing tránh vùng ô nhiễm cao
- **Cổng dữ liệu mở**: OpenAPI 3.0 endpoints 

## 💻 Yêu cầu hệ thống

- Docker (>= 20.10)
- Docker Compose (>= 2.0)
- RAM: Tối thiểu 4GB (khuyến nghị 8GB)
- Disk: Tối thiểu 10GB trống
- OS: Linux, macOS, Windows với WSL2

## 🚀 Cài đặt nhanh

### 1. Clone repository

```bash
git clone https://github.com/trungthanhcva2206/smart-air-ngsi-ld.git
cd smart-air-ngsi-ld
git checkout develop
```

### 2. Cấu hình environment

```bash
# Copy file environment mẫu
cp .env.example .env

# Chỉnh sửa các biến môi trường nếu cần
nano .env
```

### 3. Khởi động hệ thống

```bash
# Build và khởi động tất cả services
docker-compose up -d

# Kiểm tra trạng thái
docker-compose ps
```

### 4. Truy cập ứng dụng

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **NGSI-LD Broker**: http://localhost:1026
- **Database Admin**: http://localhost:8081

## 📖 Cài đặt chi tiết

Mỗi component có hướng dẫn cài đặt chi tiết riêng:

### ETL Pipeline
Hệ thống Extract-Transform-Load để xử lý dữ liệu cảm biến.

👉 [Xem hướng dẫn cài đặt ETL](./etl/README.md)

### ByLink Integration
Tích hợp với hệ thống ByLink để thu thập dữ liệu.

👉 [Xem hướng dẫn cài đặt ByLink](./BlynkNotification/README.md)

### Backend API
RESTful API server xử lý logic nghiệp vụ.

👉 [Xem hướng dẫn cài đặt Backend](./backend/README.md)

### Frontend Dashboard
Giao diện web hiển thị và quản lý dữ liệu.

👉 [Xem hướng dẫn cài đặt Frontend](./frontend/README.md)

### Routefinding Service
Dịch vụ tìm đường tối ưu dựa trên chất lượng không khí.

👉 [Xem hướng dẫn cài đặt Routefinding](./route-finding/README.md)

## 📝 Lịch sử thay đổi

### Xem các phiên bản và cập nhật

Để theo dõi các thay đổi, cập nhật và cải tiến trong từng phiên bản của dự án:

👉 **[Xem CHANGELOG.md](./CHANGELOG.md)**

CHANGELOG bao gồm:
- ✨ Tính năng mới (New Features)
- 🐛 Sửa lỗi (Bug Fixes)
- 🔧 Cải tiến (Improvements)
- 💥 Breaking Changes
- 📚 Cập nhật tài liệu (Documentation)
- 🔒 Bảo mật (Security)

### Phiên bản hiện tại

Kiểm tra phiên bản hiện tại của hệ thống:

```bash
# Xem phiên bản từ git tag
git describe --tags --abbrev=0

# Hoặc kiểm tra từ package.json
cat package.json | grep version
```

### Cập nhật lên phiên bản mới

```bash
# Pull code mới nhất
git pull origin main

# Kiểm tra các thay đổi trong CHANGELOG
cat CHANGELOG.md

# Rebuild và khởi động lại services
docker-compose down
docker-compose up -d --build
```

### Theo dõi các bản phát hành

- Xem tất cả [Releases](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/releases)
- Theo dõi các [Tags](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/tags)
- Subscribe để nhận thông báo về bản phát hành mới

## 🤝 Đóng góp

Chúng tôi luôn chào đón mọi đóng góp từ cộng đồng!

Vui lòng đọc [CONTRIBUTING.md](./CONTRIBUTING.md) để biết chi tiết về quy trình đóng góp, coding conventions và hướng dẫn phát triển.

## 📄 Giấy phép

### Code License

Dự án này được phát hành dưới giấy phép **Apache License 2.0**.

Xem file [LICENSE](./LICENSE) để biết thêm chi tiết.

### Data License

Dữ liệu trong dự án này được phát hành dưới giấy phép **Open Data Commons – Open Database License (ODbL) v1.0**.

[![ODbL](https://img.shields.io/badge/License-ODbL%20v1.0-brightgreen.svg)](https://opendatacommons.org/licenses/odbl/1.0/)

Điều này có nghĩa là bạn có quyền:
- **Chia sẻ**: Sao chép và phân phối dữ liệu
- **Tạo**: Tạo ra các tác phẩm từ dữ liệu
- **Chỉnh sửa**: Điều chỉnh, biến đổi và xây dựng dựa trên dữ liệu

Với các điều kiện:
- **Ghi công**: Bạn phải ghi công nguồn dữ liệu
- **Chia sẻ tương tự**: Nếu bạn chỉnh sửa hoặc xây dựng dựa trên dữ liệu, bạn phải phân phối kết quả dưới cùng giấy phép
- **Giữ nguyên**: Nếu bạn phân phối lại dữ liệu, bạn phải giữ nguyên giấy phép

Xem [ODbL-1.0 Full Text](https://opendatacommons.org/licenses/odbl/1.0/) để biết chi tiết đầy đủ.

## 📧 Liên hệ

### Team Members

- **Trung Thành**
  - Email: [trungthanhcva2206@gmail.com](mailto:trungthanhcva2206@gmail.com)
  - GitHub: [@trungthanhcva2206](https://github.com/trungthanhcva2206)

- **Tankchoi** 
  - Email: [tadzltv22082004@gmail.com](mailto:tadzltv22082004@gmail.com)

- **Panh**
  - Email: [panh812004.apn@gmail.com](mailto:panh812004.apn@gmail.com)

### Báo lỗi và đề xuất

- Sử dụng [GitHub Issues](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/issues) để báo lỗi
- Tham gia [Discussions](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/discussions) để thảo luận
- Để tìm hiểu sâu hơn về hệ thống, xem tài liệu đầy đủ trên Wiki: [Xem Wiki Documentation](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/wiki)

---

<p align="center">
  Made with ❤️ by Smart Air Team
</p>

<p align="center">
  <a href="#-mục-lục">Về đầu trang ↑</a>
</p>

