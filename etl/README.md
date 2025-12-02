# Smart Air Monitoring ETL Pipeline

## Tổng quan dự án

ETL Pipeline này được thiết kế để đáp ứng các tiêu chuẩn Smart City với kiến trúc FIWARE hoàn chỉnh:

### 🎯 Các tiêu chí đạt được

1. **✅ Mô hình hóa dữ liệu theo SOSA/SSN Ontology (W3C)**
   - **Sensor**: Các thiết bị cảm biến (Weather Sensor, Air Quality Sensor)
   - **Platform**: Nền tảng chứa sensors (Environment Monitoring Station)
   - **ObservableProperty**: Các thuộc tính có thể quan sát (Temperature, CO, PM2.5, ...)
   - **Observation**: Các quan sát thực tế (WeatherObserved, AirQualityObserved)
   - Relationships: `observes`, `isHostedBy`, `hosts`, `refDevice`
   - Tuân thủ chuẩn W3C SSN: https://www.w3.org/TR/vocab-ssn/

2. **✅ API và mô hình dữ liệu NGSI-LD (ETSI ISG CIM)**
   - Entities theo chuẩn NGSI-LD với @context
   - Properties, GeoProperties, và Relationships đúng chuẩn
   - Tích hợp với Orion-LD Context Broker

3. **✅ Sử dụng Smart Data Models (FIWARE)**
   - `WeatherObserved`: https://github.com/smart-data-models/dataModel.Environment/tree/master/WeatherObserved
   - `AirQualityObserved`: https://github.com/smart-data-models/dataModel.Environment/tree/master/AirQualityObserved
   - Tuân thủ schema và attributes từ smartdatamodels.org

4. **✅ Time Series Data Storage với QuantumLeap**
   - Lưu trữ dữ liệu lịch sử tự động qua subscriptions
   - Hỗ trợ truy vấn dữ liệu theo thời gian
   - Tích hợp với TimescaleDB để lưu trữ hiệu quả

5. **✅ Real-time Notifications**
   - Subscriptions tự động từ Orion-LD đến QuantumLeap
   - Cập nhật entity theo fixed ID (không timestamp trong ID)
   - Hỗ trợ SSE real-time updates cho frontend

6. **✅ Tạo dữ liệu mở từ nguồn thực tế**
   - Tái sử dụng OpenWeather API (nguồn dữ liệu mở)
   - Giả lập 126 trạm cảm biến tại các phường/xã Hà Nội
   - Dữ liệu real-time cho demo sản phẩm
## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FIWARE Platform                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐      ┌──────────────┐                                      │
│  │   Orion-LD  │      │ QuantumLeap  │                                      │
│  │   (1026)    │◄────►│   (8668)     │                                      │
│  │  Context    │      │  Time Series │                                      │
│  │   Broker    │      │   Service    │                                      │
│  └──────▲──────┘      └──────────────┘                                      │
│         │                    ▲                                              │
│         │                    │                                              │
│         │ ┌──────────────────┴─────┐                                        │
│         │ │  subscription/notify   │                                        │
│         │ └────────────────────────┘                                        │
│         │                                                                   │
│         │ NGSI-LD                                                           │
│         │ Entities           ┌─────────────────┐                            │
│         │                    │   IoT Agent     │                            │
│         │                    │   JSON (4041)   │                            │
│         │                    │   - Device Mgmt │                            │
│         │◄───────────────────┤   - Transform   │                            │
│         │                    │   - Provision   │                            │
│         │                    └────────▲────────┘                            │
│         │                             │                                     │
│         │                             │ MQTT                                │
│         │                             │ (Raw Data)                          │
│         │                             │                                     │
│         │                    ┌────────┴────────┐                            │
│         │                    │   Mosquitto     │                            │
│         │                    │   MQTT Broker   │                            │
│         │                    │   (1883)        │                            │
│         │                    └────────▲────────┘                            │
└─────────┼─────────────────────────────┼─────────────────────────────────────┘
          │                             │
          │ REST API                    │ MQTT Publish
          │ (NGSI-LD)                   │ (JSON)
          │                             │
┌─────────┴─────────────────────────────┴───────┐
│           ETL Pipeline (Python)               │
│                                               │
│  ┌──────────────────────────────────────┐     │
│  │   Dual-Path Architecture             │     │
│  │                                      │     │
│  │  PATH 1: REST API → Orion-LD         │     │
│  │  - Full NGSI-LD entities             │     │
│  │  - GeoProperty (location)            │     │  
│  │  - Relationships (refDevice)         │     │
│  │                                      │     │
│  │  PATH 2: MQTT → IoT Agent → Orion-LD │     │
│  │  - Raw measurements                  │     │
│  │  - Device provisioning               │     │
│  │  - FIWARE compliant                  │     │
│  └──────────────────────────────────────┘     │
│                                               │
│  Mode: ETL_MODE environment variable          │
│  - 'rest': REST API only                      │
│  - 'mqtt': MQTT → IoT Agent only              │
│  - 'dual': Both paths (default)               │
└───────────────┬───────────────────────────────┘
                │
                │ Extract (HTTP GET)
                ▼
       ┌────────────────────┐
       │  OpenWeather API   │
       │  - Weather Data    │
       │  - Air Quality     │
       └────────────────────┘
```
## 📊 Luồng dữ liệu

### 1. Dual-Path ETL Architecture

Pipeline hỗ trợ 2 luồng dữ liệu song song hoặc độc lập:

#### PATH 1: REST API → Orion-LD (Traditional)

```
OpenWeather API
      │
      │ 1. Extract (HTTP GET)
      ▼
ETL Pipeline (Python)
      │
      │ 2. Transform to NGSI-LD
      │    - Full entity structure
      │    - GeoProperty (location)
      │    - Relationships (refDevice)
      ▼
NGSI-LD Entities
  - WeatherObserved
  - AirQualityObserved
      │
      │ 3. Upsert (POST/PATCH)
      ▼
Orion-LD Context Broker
```

#### PATH 2: MQTT → IoT Agent → Orion-LD (FIWARE Compliant)

```
OpenWeather API
      │
      │ 1. Extract (HTTP GET)
      ▼
ETL Pipeline (Python)
      │
      │ 2. Transform to RAW JSON
      │    - Measurements only
      │    - Minimal processing
      ▼
MQTT Payload (JSON)
      │
      │ 3. Publish to topic
      │    /{apikey}/{device_id}/attrs
      ▼
Mosquitto MQTT Broker
      │
      │ 4. Subscribe
      ▼
IoT Agent JSON
      │
      │ 5. Transform to NGSI-LD
      │    - Device provisioning
      │    - Attribute mapping
      │    - Static attributes
      ▼
NGSI-LD Entities
      │
      │ 6. Update/Create
      ▼
Orion-LD Context Broker
```

### 2. Subscription Flow (Real-time)

```
Orion-LD
      │
      │ Entity Update Event
      ▼
Subscription Manager
      │
      │ Notify
      ▼
QuantumLeap
      │
      │ Store
      ▼
TimescaleDB (Time Series)
```

### 3. ETL Mode Configuration

Chọn chế độ ETL qua biến môi trường `ETL_MODE`:

- **`rest`**: Chỉ sử dụng REST API (PATH 1)
  - ✅ Đầy đủ entity structure từ models.py
  - ✅ GeoProperty và Relationships
  - ⚠️ Không tuân thủ FIWARE IoT architecture

- **`mqtt`**: Chỉ sử dụng MQTT → IoT Agent (PATH 2)
  - ✅ FIWARE compliant architecture
  - ✅ Device provisioning và management
  - ⚠️ Không có GeoProperty (location phải set qua provisioning)

- **`dual`**: Cả 2 paths chạy song song (mặc định)
  - ✅ REST tạo entity đầy tiên với GeoProperty
  - ✅ MQTT update measurements qua IoT Agent
  - ✅ Backup lẫn nhau
  - ⚠️ REST phải chạy trước để tạo structure
## 📋 Yêu cầu

- Python 3.8+
- OpenWeather API Key (miễn phí 1000 requests/ngày)
- Orion-LD Context Broker (chạy local hoặc remote)

## 🚀 Cài đặt

### 1. Clone repository

```bash
cd smart-air-ngsi-ld
```

### 2. Khởi động FIWARE Platform

```bash
docker-compose up -d
```

Services được khởi động:
- **Orion-LD**: `localhost:1026` - Context Broker
- **QuantumLeap**: `localhost:8668` - Time Series Service
- **TimescaleDB**: `localhost:5432` - PostgreSQL Time Series Database
- **Mosquitto**: `localhost:1883` - MQTT Broker
- **IoT Agent JSON**: `localhost:4041` - IoT Device Management

Kiểm tra services:

```bash
# Orion-LD
curl http://localhost:1026/version

# QuantumLeap
curl http://localhost:8668/version

# TimescaleDB (PostgreSQL)
# Use psql or any PostgreSQL client to connect
# psql -h localhost -p 5432 -U postgres

# IoT Agent
curl http://localhost:4041/iot/about

# MQTT Broker
# Sử dụng MQTT client để test: mosquitto_sub -h localhost -p 1883 -t "#"
```

### 3. Cấu hình ETL Pipeline

```bash
pip install -r requirements.txt
```

Tạo file `.env` từ `.env.example`:

```bash
copy .env.example .env
```

Chỉnh sửa `.env`:

```env
# OpenWeather API
OPENWEATHER_API_KEY=your_api_key_here

# Orion-LD
ORION_LD_URL=http://localhost:1026
ORION_LD_TENANT=hanoi

# QuantumLeap
QUANTUMLEAP_EXTERNAL_URL=http://localhost:8668
QUANTUMLEAP_INTERNAL_URL=http://fiware-quantumleap:8668
QUANTUMLEAP_ENABLED=true

# MQTT Broker Configuration (for FIWARE IoT Agent)
MQTT_BROKER_HOST=localhost
MQTT_BROKER_PORT=1883

# ETL Mode Configuration
# ETL_MODE: 'rest' (REST API only), 'mqtt' (MQTT → IoT Agent only), 'dual' (both paths)
# - rest: Direct REST API to Orion-LD (traditional approach, full entity structure)
# - mqtt: MQTT → IoT Agent → Orion-LD (FIWARE compliant, device provisioning required)
# - dual: Both paths running in parallel (REST creates structure, MQTT updates measurements)
# Recommendation: Use 'dual' for first run, then can switch to 'mqtt' for subsequent runs
ETL_MODE=dual

# ETL Schedule
ETL_INTERVAL_MINUTES=480

# Data Source
# Đường dẫn tới file GeoJSON chứa dữ liệu địa lý các xã/phường Hà Nội.
# Mặc định: ./etl/ha_noi_with_latlon2.geojson
# Bạn có thể đổi sang đường dẫn khác nếu dữ liệu nằm nơi khác.
HANOI_GEOJSON_PATH=./etl/ha_noi_with_latlon2.geojson
```

### 4. Provision IoT Agent Devices (Required for MQTT mode)

Nếu sử dụng `ETL_MODE=mqtt` hoặc `ETL_MODE=dual`, cần provision devices trước:

#### Windows (PowerShell)
```powershell
.\iot-agent-provisioning.ps1
```

#### Linux/Mac (Bash)
```bash
chmod +x iot-agent-provisioning.sh
./iot-agent-provisioning.sh
```

Script sẽ tự động:
- ✅ Provision service group với MQTT transport
- ✅ Provision 252 devices (126 weather + 126 air quality)
- ✅ Mapping attributes theo models.py
- ✅ Static attributes (address, dataProvider, source)

**Lưu ý quan trọng:**
- Chỉ cần chạy **1 lần** khi setup lần đầu
- Nếu sửa attribute mapping → Chạy lại script để update
- Device ID format: `weather-{district}`, `airquality-{district}` (lowercase, hyphens)

### 5. Chạy ETL Pipeline

```bash
python -m etl.Core_ETL.main
```
**Pipeline sẽ tự động:**
1. ✅ Khởi tạo SOSA/SSN infrastructure (ObservableProperty, Platform, Device)
2. ✅ Tạo subscriptions từ Orion-LD đến QuantumLeap
3. ✅ Chạy ETL cycle đầu tiên ngay lập tức
4. ✅ Lên lịch chạy định kỳ theo chu kỳ cấu hình
5. ✅ Publish MQTT messages (nếu mode = 'mqtt' hoặc 'dual')

**Khuyến nghị:**
- **Lần đầu tiên**: Dùng `ETL_MODE=dual` để tạo entities đầy đủ
- **Lần sau**: Có thể chuyển sang `ETL_MODE=mqtt` để chỉ update qua IoT Agent

## 🔧 Subscription Manager

Pipeline tự động tạo các subscriptions sau:

### 1. WeatherObserved → QuantumLeap

```json
{
  "id": "urn:ngsi-ld:Subscription:WeatherObserved-QuantumLeap",
  "type": "Subscription",
  "entities": [{"type": "weatherObserved"}],
  "notification": {
    "endpoint": {
      "uri": "http://fiware-quantumleap:8668/v2/notify"
    }
  }
}
```

### 2. AirQualityObserved → QuantumLeap

```json
{
  "id": "urn:ngsi-ld:Subscription:AirQualityObserved-QuantumLeap",
  "type": "Subscription",
  "entities": [{"type": "airQualityObserved"}],
  "notification": {
    "endpoint": {
      "uri": "http://fiware-quantumleap:8668/v2/notify"
    }
  }
}
```

### 3. Device → QuantumLeap

```json
{
  "id": "urn:ngsi-ld:Subscription:Device-QuantumLeap",
  "type": "Subscription",
  "entities": [{"type": "Device"}],
  "notification": {
    "endpoint": {
      "uri": "http://fiware-quantumleap:8668/v2/notify"
    }
  }
}
```
### 4. Platform → QuantumLeap

```json
{
  "id": "urn:ngsi-ld:Subscription:Platform-QuantumLeap",
  "type": "Subscription",
  "entities": [{"type": "Platform"}],
  "notification": {
    "endpoint": {
      "uri": "http://fiware-quantumleap:8668/v2/notify"
    }
  }
}
```
## 🏗️ Kiến trúc SOSA/SSN

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                       SOSA/SSN Ontology Layer                                              │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────│
│                                                                                                                            │
│  ObservableProperty (17 entities)                                                                                          │
│  ├─ Temperature                                                                                                            │
│  ├─ AtmosphericPressure                                                                                                    │
│  ├─ RelativeHumidity                                                                                                       │
│  ├─ CO, NO, NO2, O3, SO2                                                                                                   │
│  ├─ PM2.5, PM10                                                                                                            │
│  └─ ...                                                                                                                    │
│                                                                                                                            │
│  Platform (N entities - unified per district)                                                                              │
│  ├─ EnvironmentStation-PhuongBaDinh            isHostedBy   Sensor/Device (2N entities)                                    │
│  │   ├─ hosts → WeatherSensor-PhuongBaDinh     ---------->  ├─ WeatherSensor-PhuongBaDinh ───────────> ObservableProperty  │      
│  │   └─ hosts → AirQualitySensor-PhuongBaDinh               ├─ AirQualitySensor-PhuongBaDinh ────────> ObservableProperty  │ 
│  └─ ...                                                     └─ ...                                                         │
│                                                                                    │                                       │
│                                                                                    │ refDevice (madeBySensor)              │
│                                                                                    ▼                                       │
│────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────│
│                                                      Observation Layer (Dynamic)                                           │
│────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────│
│                                                                                                                            │
│                 WeatherObserved (N entities - updated each cycle)                                                          │                           ┌────────────────────────┐
│                 ├─ ID: urn:ngsi-ld:WeatherObserved:Hanoi-{District}                                                        │                           │     QuantumLeap        │
│                 └─ dateObserved updated each cycle                                                                         │   Notify via Subscription │- Time Series Storage   │
│                                                                                                                            │   ---------------->       │- Historical Queries    │
│                                                                                                                            │                           │- Aggregations          │   
│                 AirQualityObserved (N entities - updated each cycle)                                                       │                           └────────────────────────┘
│                 ├─ ID: urn:ngsi-ld:AirQualityObserved:Hanoi-{District}                                                     │                                                                         
│                 └─ dateObserved updated each cycle                                                                         │ 
│                                                                                                                            │ 
│                                                                                                                            │ 
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘                                                                                                                            │ 
```
## 🗺️ Các phường/xã được giám sát

Pipeline giả lập N trạm cảm biến tại **N phường/xã**

**Lưu ý**: Danh sách đầy đủ 126 phường/xã (theo cơ cấu hành chính 2025 sau khi xóa bỏ cấp quận) với tọa độ GPS và địa chỉ các trạm được cấu hình trong file `ha_noi_with_latlon2.geojson`.

## 📈 Quản lý Request Limit

- **Giới hạn**: 1000 requests/ngày (OpenWeather Free Tier)
- **Sử dụng**: 2 APIs × N phường/xã = 2 × N requests/chu kỳ
- **Chu kỳ mặc định**: S = ⌊1000 / (2 × N)⌋
- **Tổng requests/ngày**: ~S × (2 × N) requests/ngày, với S = số chu kỳ/ngày sao cho tổng requests < giới hạn ✅

### Tùy chỉnh chu kỳ
Để thay đổi tần suất cập nhật, chỉnh `ETL_INTERVAL_MINUTES` trong `.env`:
#### Đối với dữ liệu hiện tại
- **240 phút (4 giờ)**:  S = ~6 chu kỳ 
- **360 phút (6 giờ)**:  S = ~4 chu kỳ 
- **480 phút (8 giờ)**:  S = ~3 chu kỳ
- **720 phút (12 giờ)**: S = ~2 chu kỳ

## 📝 Logs

Logs được ghi vào:
- Console (stdout)
- File: `etl.log`

## 🔍 Truy vấn dữ liệu từ Orion-LD

### 📖 Tài liệu API tham khảo

Orion-LD cung cấp API đầy đủ theo chuẩn NGSI-LD để truy vấn, quản lý và đăng ký thông báo cho entities. Dưới đây là tài liệu chính thức để tham khảo:

#### Tài liệu chính thức

- **NGSI-LD API Specification**: [ETSI GS CIM 009 V1.8.1](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.08.01_60/gs_CIM009v010801p.pdf)
  - Đặc tả đầy đủ về NGSI-LD API v1.8.1
  - Định nghĩa các endpoints, parameters, và response formats
  
- **NGSI-LD Primer**: [Understanding NGSI-LD](https://www.etsi.org/deliver/etsi_gr/CIM/001_099/008/01.01.01_60/gr_CIM008v010101p.pdf)
  - Hướng dẫn cơ bản về NGSI-LD
  - Giải thích các khái niệm và use cases

- **Orion-LD Developer Guide**: [GitHub Documentation](https://github.com/FIWARE/context.Orion-LD/blob/develop/doc/manuals-ld/developer-documentation.md)
  - Tài liệu dành cho developers
  - Hướng dẫn chi tiết về API và implementation

- **FIWARE NGSI-LD Tutorials**: [Step-by-Step Guide](https://fiware-tutorials.readthedocs.io/en/latest/)
  - Tutorial từng bước cho NGSI-LD
  - Các ví dụ demo và best practices

- **Orion-LD Operations**: [API Operations Manual](https://github.com/FIWARE/context.Orion-LD/blob/develop/doc/manuals-ld/orionld-operations.md)
  - Hướng dẫn vận hành Orion-LD
  - Các operations và configuration

#### Các loại API chính

1. **Entity Operations** - Quản lý entities (CRUD)
2. **Query Operations** - Truy vấn dữ liệu với filters, geo-queries, temporal queries
3. **Subscription Management** - Đăng ký nhận thông báo real-time
4. **Batch Operations** - Thao tác hàng loạt
5. **Temporal Operations** - Truy vấn dữ liệu theo thời gian
6. **Registration Operations** - Đăng ký context sources

### 🎯 API sử dụng trong dự án này

**Lưu ý**: Trên Windows CMD, sử dụng dấu ngoặc kép `"` thay vì `'` và viết lệnh trên một dòng.

<!-- TODO: Thêm các API examples cụ thể cho dự án -->

#### Các entities được sử dụng
- `ObservableProperty` - 17 thuộc tính quan sát được
- `Platform` - N nền tảng
- `Device` - N thiết bị cảm biến
- `WeatherObserved` - Dữ liệu thời tiết (dynamic)
- `AirQualityObserved` - Dữ liệu chất lượng không khí (dynamic)

#### Tenant
- **NGSILD-Tenant**: `hanoi`

## 📚 Tài liệu tham khảo

- [NGSI-LD Primer](https://www.etsi.org/deliver/etsi_gr/CIM/001_099/008/01.01.01_60/gr_CIM008v010101p.pdf)
- [SOSA/SSN Ontology](https://www.w3.org/TR/vocab-ssn/)
- [Smart Data Models](https://smartdatamodels.org/)
- [OpenWeather API](https://openweathermap.org/api)
- [FIWARE QuantumLeap](https://github.com/FIWARE/quantum-leap)
- [FIWARE Orion-LD](https://github.com/FIWARE/context.Orion-LD)

## 🛠️ Troubleshooting

### 1. Lỗi kết nối Orion-LD

Kiểm tra Orion-LD đang chạy:

```bash
curl http://localhost:1026/version

# Kiểm tra logs
docker logs fiware-orion-ld
```
### 2. QuantumLeap không nhận dữ liệu

```bash
# Kiểm tra subscriptions
curl -X GET "http://localhost:1026/ngsi-ld/v1/subscriptions" \
  -H "NGSILD-Tenant: hanoi"

# Kiểm tra QuantumLeap logs
docker logs fiware-quantumleap

# Kiểm tra TimescaleDB
# Kết nối qua psql
psql -h localhost -p 5432 -U postgres -d quantumleap
```

### 3. Lỗi API Key không hợp lệ

Kiểm tra API key tại: https://home.openweathermap.org/api_keys

### 4. IoT Agent không nhận MQTT messages

```bash
# Kiểm tra IoT Agent status
curl http://localhost:4041/iot/about

# Kiểm tra devices đã provision
curl http://localhost:4041/iot/devices -H "fiware-service: hanoi" -H "fiware-servicepath: /"

# Kiểm tra MQTT broker
docker logs mosquitto

# Kiểm tra IoT Agent logs
docker logs fiware-iot-agent --tail 100

# Test MQTT publish
mosquitto_pub -h localhost -p 1883 -t "/hanoi/weather-test/attrs" -m '{"temperature": 250}'
```

### 5. Device ID mismatch

Nếu thấy lỗi "Device not found" trong IoT Agent logs:
- Kiểm tra device_id format trong MQTT payload khớp với provisioning script
- Device ID phải lowercase + hyphens + Vietnamese normalization
- Ví dụ: "Phường Hoàn Kiếm" → "weather-phuong-hoan-kiem"

### 6. Vượt quá giới hạn requests

Tăng `ETL_INTERVAL_MINUTES` hoặc nâng cấp OpenWeather plan.

## 📄 License

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

## 👥 Contributors

- **TT** - [trungthanhcva2206@gmail.com](mailto:trungthanhcva2206@gmail.com)
- **Tankchoi** - [tadzltv22082004@gmail.com](mailto:tadzltv22082004@gmail.com)
- **Panh** - [panh812004.apn@gmail.com](mailto:panh812004.apn@gmail.com)

## 💡 Support

Nếu gặp vấn đề, vui lòng:

1. Xem [Issues](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/issues)
2. Xem [Documentation Wiki](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/wiki)
3. Trao đổi [Discussions](https://github.com/trungthanhcva2206/smart-air-ngsi-ld/discussions)
4. Liên hệ authors

**Copyright © 2025 CHK. All rights reserved.**
