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
   - Tích hợp với CrateDB để lưu trữ hiệu quả

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
┌─────────────────────────────────────────────────────────────┐
│                    FIWARE Platform                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐      ┌──────────────┐     ┌──────────────┐ │
│  │   Orion-LD  │      │ QuantumLeap  │     │   CrateDB    │ │
│  │   (1026)    │◄────►│   (8668)     │────►│   (4200)     │ │
│  │  Context    │      │  Time Series │     │   Storage    │ │
│  │   Broker    │      │   Service    │     │              │ │
│  └──────┬──────┘      └──────────────┘     └──────────────┘ │
│         │                    ▲                              │
│         │ subscription       │ notify                       │
│         └────────────────────┘                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         ▲                    
         │ HTTP POST/PATCH (upsert entities)
         │
┌────────┴─────────┐
│   ETL Pipeline   │
│    (Python)      │
│                  │
│  - Extract       │──┐
│  - Transform     │  │ Transform to
│  - Load          │  │ NGSI-LD
│  - Schedule      │  │
└────────┬─────────┘  │
         │            │
         │ Extract    ▼
         │      ┌──────────────────┐
         └─────►│  NGSI-LD Models  │
                │  - Weather       │
                │  - AirQuality    │
                │  - SOSA/SSN      │
                └──────────────────┘
                         ▲
                         │ HTTP GET
                         │
                ┌────────┴─────────┐
                │  OpenWeather API │
                │  - Weather Data  │
                │  - Air Quality   │
                └──────────────────┘
```
## 📊 Luồng dữ liệu

### 1. ETL Process (Định kỳ theo chu kỳ)

```
OpenWeather API
      │
      │ 1. Extract (HTTP GET)
      ▼
ETL Pipeline (Python)
      │
      │ 2. Transform to NGSI-LD
      ▼
NGSI-LD Entities
  - WeatherObserved
  - AirQualityObserved
      │
      │ 3. Upsert (POST/PATCH)
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
CrateDB (Time Series)
```
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
- **CrateDB**: `localhost:5432` - Time Series Database
- **CrateDB Admin UI**: `localhost:5432` - Database Admin Interface

Kiểm tra services:

```bash
# Orion-LD
curl http://localhost:1026/version

# QuantumLeap
curl http://localhost:8668/version

# CrateDB
curl http://localhost:5432
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

# ETL Schedule
ETL_INTERVAL_MINUTES=480

# Data Source
# Đường dẫn tới file GeoJSON chứa dữ liệu địa lý các xã/phường Hà Nội.
# Mặc định: ./etl/ha_noi_with_latlon2.geojson
# Bạn có thể đổi sang đường dẫn khác nếu dữ liệu nằm nơi khác.
HANOI_GEOJSON_PATH=./etl/ha_noi_with_latlon2.geojson
```

### 4. Chạy ETL Pipeline

```bash
python -m etl.Core_ETL.main
```
**Pipeline sẽ tự động:**
1. ✅ Khởi tạo SOSA/SSN infrastructure (ObservableProperty, Platform, Device)
2. ✅ Tạo subscriptions từ Orion-LD đến QuantumLeap
3. ✅ Chạy ETL cycle đầu tiên ngay lập tức
4. ✅ Lên lịch chạy định kỳ theo chu kỳ cấu hình

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
┌────────────────────────────────────────────────────────────────┐
│                  SOSA/SSN Ontology Layer                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ObservableProperty (17 entities)                              │
│  ├─ Temperature                                                │
│  ├─ AtmosphericPressure                                        │
│  ├─ RelativeHumidity                                           │
│  ├─ CO, NO, NO2, O3, SO2                                       │
│  ├─ PM2.5, PM10                                                │
│  └─ ...                                                        │
│                                                                │
│  Platform (N entities - unified per district)                  │
│  ├─ EnvironmentStation-PhuongBaDinh                            │
│  │   ├─ hosts → WeatherSensor-PhuongBaDinh                     │
│  │   └─ hosts → AirQualitySensor-PhuongBaDinh                  │
│  └─ ...                                                        │
│                         │                                      │
│                         │ isHostedBy                           │
│                         ▼                                      │
│  Sensor/Device (N entities)                                    │
│  ├─ WeatherSensor-PhuongBaDinh ───────────> ObservableProperty │
│  ├─ AirQualitySensor-PhuongBaDinh ────────> ObservableProperty │
│  └─ ...                                                        │
│                         │                                      │
│                         │ refDevice (madeBySensor)             │
│                         ▼                                      │
├─────────────────────────────────────────────────────────────── ┤
│                Observation Layer (Dynamic)                     │
├─────────────────────────────────────────────────────────────── ┤
│                                                                │
│  WeatherObserved (N entities - updated each cycle)             │
│  ├─ ID: urn:ngsi-ld:WeatherObserved:Hanoi-{District}           │
│  │  (Fixed ID - no timestamp for SSE)                          │
│  └─ dateObserved updated each cycle                            │
│                                                                │
│  AirQualityObserved (N entities - updated each cycle)          │
│  ├─ ID: urn:ngsi-ld:AirQualityObserved:Hanoi-{District}        │
│  │  (Fixed ID - no timestamp for SSE)                          │
│  └─ dateObserved updated each cycle                            │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                         │
                         │ Notify via Subscription
                         ▼
          ┌─────────────────────────────┐
          │      QuantumLeap            │
          │  - Time Series Storage      │
          │  - Historical Queries       │
          │  - Aggregations             │
          └──────────┬──────────────────┘
                     │
                     ▼
          ┌─────────────────────────────┐
          │        CrateDB              │
          │  - Columnar Storage         │
          │  - Time-based Partitioning  │
          └─────────────────────────────┘
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

# Kiểm tra CrateDB
curl http://localhost:5432
```

### 3. Lỗi API Key không hợp lệ

Kiểm tra API key tại: https://home.openweathermap.org/api_keys

### 4. Vượt quá giới hạn requests

Tăng `ETL_INTERVAL_MINUTES` hoặc nâng cấp OpenWeather plan.

## 📄 License

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

## 👥 Contributors

Hanoi Smart City Project Team
