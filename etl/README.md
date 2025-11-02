# Smart Air Monitoring ETL Pipeline

## Tổng quan dự án

ETL Pipeline này được thiết kế để đáp ứng các tiêu chuẩn Smart City:

### 🎯 Các tiêu chí đạt được

1. **✅ Mô hình hóa dữ liệu theo SOSA/SSN Ontology (W3C)**
   - **Sensor**: Các thiết bị cảm biến (Weather Sensor, Air Quality Sensor)
   - **Platform**: Nền tảng chứa sensors (Weather Station, Air Quality Station)
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

4. **✅ Tạo dữ liệu mở từ nguồn thực tế**
   - Tái sử dụng OpenWeather API (nguồn dữ liệu mở)
   - Giả lập 12 trạm cảm biến tại các quận Hà Nội
   - Dữ liệu real-time cho demo sản phẩm

## 📋 Yêu cầu

- Python 3.8+
- OpenWeather API Key (miễn phí 1000 requests/ngày)
- Orion-LD Context Broker (chạy local hoặc remote)

## 🚀 Cài đặt

### 1. Clone và cài đặt dependencies

```bash
cd smart-air-ngsi-ld\etl
pip install -r requirements.txt
```

### 2. Cấu hình environment

Tạo file `.env` từ `.env.example`:

```bash
copy .env.example .env
```

Chỉnh sửa `.env`:

```env
# Đăng ký API key miễn phí tại: https://openweathermap.org/api
OPENWEATHER_API_KEY=your_api_key_here

# URL của Orion-LD broker
ORION_LD_URL=http://localhost:1026
ORION_LD_TENANT=hanoi

# Chu kỳ ETL (phút)
# 480 phút (8 giờ): ~3 chu kỳ/ngày × 252 requests/chu kỳ = 756 requests/ngày (< 1000)
ETL_INTERVAL_MINUTES=480

LOG_LEVEL=INFO
```

### 3. Khởi động Orion-LD (nếu chưa có)

Sử dụng Docker:

```bash
docker run -d --name orion-ld -p 1026:1026 fiware/orion-ld
```

## 🏃 Chạy ETL Pipeline

```bash
python main.py
```

**Pipeline sẽ tự động:**
1. ✅ Kiểm tra SOSA/SSN infrastructure
2. ✅ Tự động khởi tạo nếu chưa có (521 entities)
3. ✅ Chạy ETL cycle ngay lập tức
4. ✅ Lên lịch chạy định kỳ theo chu kỳ


## 📊 Cấu trúc dữ liệu SOSA/SSN

### 1. ObservableProperty (Thuộc tính quan sát được)

```json
{
  "id": "urn:ngsi-ld:ObservableProperty:Temperature",
  "type": "ObservableProperty",
  "name": {
    "type": "Property",
    "value": "Air Temperature"
  },
  "description": {
    "type": "Property",
    "value": "The temperature of the air"
  },
  "unit": {
    "type": "Property",
    "value": "Celsius (°C)"
  },
  "unitCode": {
    "type": "Property",
    "value": "CEL"
  },
  "category": {
    "type": "Property",
    "value": "weather"
  }
}
```

### 2. Platform (Nền tảng chứa sensor)

```json
{
  "id": "urn:ngsi-ld:Platform:WeatherStation-BaDinh",
  "type": "Platform",
  "name": {
    "type": "Property",
    "value": "Weather Monitoring Platform - Ba Dinh"
  },
  "location": {
    "type": "GeoProperty",
    "value": {
      "type": "Point",
      "coordinates": [105.8200, 21.0333]
    }
  },
  "hosts": {
    "type": "Relationship",
    "object": ["urn:ngsi-ld:Device:WeatherSensor-BaDinh"]
  },
  "platformType": {
    "type": "Property",
    "value": "WeatherMonitoringStation"
  },
  "status": {
    "type": "Property",
    "value": "operational"
  }
}
```

### 3. Sensor (Thiết bị cảm biến)

```json
{
  "id": "urn:ngsi-ld:Device:WeatherSensor-BaDinh",
  "type": "Device",
  "name": {
    "type": "Property",
    "value": "Weather Sensor - Ba Dinh"
  },
  "deviceCategory": {
    "type": "Property",
    "value": ["sensor"]
  },
  "controlledProperty": {
    "type": "Property",
    "value": ["temperature", "atmosphericPressure", "relativeHumidity", ...]
  },
  "observes": {
    "type": "Relationship",
    "object": [
      "urn:ngsi-ld:ObservableProperty:Temperature",
      "urn:ngsi-ld:ObservableProperty:AtmosphericPressure",
      ...
    ]
  },
  "isHostedBy": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Platform:WeatherStation-BaDinh"
  },
  "sensorType": {
    "type": "Property",
    "value": "WeatherStation"
  },
  "deviceState": {
    "type": "Property",
    "value": "active"
  }
}
```

### 4. Observation (Quan sát - WeatherObserved)

```json
{
  "id": "urn:ngsi-ld:WeatherObserved:Hanoi-BaDinh-2025-11-03T10:30:00.123Z",
  "type": "WeatherObserved",
  "name": {
    "type": "Property",
    "value": "Weather Station Ba Dinh"
  },
  "stationName": {
    "type": "Property",
    "value": "Ba Dinh"
  },
  "stationCode": {
    "type": "Property",
    "value": "HN-BADINH"
  },
  "location": {
    "type": "GeoProperty",
    "value": {
      "type": "Point",
      "coordinates": [105.8200, 21.0333]
    }
  },
  "address": {
    "type": "Property",
    "value": {
      "addressLocality": "Ba Dinh",
      "addressRegion": "Hanoi",
      "addressCountry": "VN",
      "type": "PostalAddress"
    }
  },
  "dateObserved": {
    "type": "Property",
    "value": {
      "@type": "DateTime",
      "@value": "2025-11-03T10:30:00.123Z"
    }
  },
  "temperature": {
    "type": "Property",
    "value": 25.5,
    "unitCode": "CEL",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "feelsLikeTemperature": {
    "type": "Property",
    "value": 26.0,
    "unitCode": "CEL",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "atmosphericPressure": {
    "type": "Property",
    "value": 1013.0,
    "unitCode": "HPA",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "relativeHumidity": {
    "type": "Property",
    "value": 0.75,
    "unitCode": "C62",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "windSpeed": {
    "type": "Property",
    "value": 3.5,
    "unitCode": "MTS",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "windDirection": {
    "type": "Property",
    "value": 180,
    "unitCode": "DD",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "precipitation": {
    "type": "Property",
    "value": 0,
    "unitCode": "MMT",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "visibility": {
    "type": "Property",
    "value": 10000,
    "unitCode": "MTR",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "illuminance": {
    "type": "Property",
    "value": 100000,
    "unitCode": "LUX",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "weatherType": {
    "type": "Property",
    "value": "Clear",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "weatherDescription": {
    "type": "Property",
    "value": "clear sky",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "pressureTendency": {
    "type": "Property",
    "value": 0,
    "unitCode": "A97",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "source": {
    "type": "Property",
    "value": "https://openweathermap.org"
  },
  "dataProvider": {
    "type": "Property",
    "value": "OpenWeather"
  },
  "refDevice": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Device:WeatherSensor-BaDinh"
  },
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld"
  ]
}
```

### 5. Observation (Quan sát - AirQualityObserved)

```json
{
  "id": "urn:ngsi-ld:AirQualityObserved:Hanoi-BaDinh-2025-11-03T10:30:00.123Z",
  "type": "AirQualityObserved",
  "name": {
    "type": "Property",
    "value": "Air Quality Station Ba Dinh"
  },
  "stationName": {
    "type": "Property",
    "value": "Ba Dinh"
  },
  "stationCode": {
    "type": "Property",
    "value": "HN-AQ-BADINH"
  },
  "location": {
    "type": "GeoProperty",
    "value": {
      "type": "Point",
      "coordinates": [105.8200, 21.0333]
    }
  },
  "address": {
    "type": "Property",
    "value": {
      "addressLocality": "Ba Dinh",
      "addressRegion": "Hanoi",
      "addressCountry": "VN",
      "type": "PostalAddress"
    }
  },
  "dateObserved": {
    "type": "Property",
    "value": "2025-11-03T10:30:00.123Z"
  },
  "airQualityIndex": {
    "type": "Property",
    "value": 3,
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "airQualityLevel": {
    "type": "Property",
    "value": "moderate",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "CO": {
    "type": "Property",
    "value": 400.5,
    "unitCode": "GP",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "NO": {
    "type": "Property",
    "value": 0.5,
    "unitCode": "GQ",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "NO2": {
    "type": "Property",
    "value": 20.0,
    "unitCode": "GQ",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "NOx": {
    "type": "Property",
    "value": 20.5,
    "unitCode": "GQ",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "O3": {
    "type": "Property",
    "value": 50.0,
    "unitCode": "GQ",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "SO2": {
    "type": "Property",
    "value": 10.0,
    "unitCode": "GQ",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "pm2_5": {
    "type": "Property",
    "value": 35.2,
    "unitCode": "GQ",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "pm10": {
    "type": "Property",
    "value": 45.8,
    "unitCode": "GQ",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "NH3": {
    "type": "Property",
    "value": 5.0,
    "unitCode": "GQ",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "temperature": {
    "type": "Property",
    "value": 25.5,
    "unitCode": "CEL",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "relativeHumidity": {
    "type": "Property",
    "value": 0.75,
    "unitCode": "C62",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "windSpeed": {
    "type": "Property",
    "value": 3.5,
    "unitCode": "MTS",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "windDirection": {
    "type": "Property",
    "value": 180,
    "unitCode": "DD",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "precipitation": {
    "type": "Property",
    "value": 0,
    "unitCode": "MMT",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "CO_Level": {
    "type": "Property",
    "value": "good",
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "reliability": {
    "type": "Property",
    "value": 0.85,
    "observedAt": "2025-11-03T10:30:00.123Z"
  },
  "source": {
    "type": "Property",
    "value": "https://openweathermap.org"
  },
  "dataProvider": {
    "type": "Property",
    "value": "OpenWeather"
  },
  "refDevice": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:Device:AirQualitySensor-BaDinh"
  },
  "refPointOfInterest": {
    "type": "Relationship",
    "object": "urn:ngsi-ld:PointOfInterest:Hanoi-BaDinh"
  },
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld"
  ]
}
```

## 🗺️ Các phường/xã được giám sát

Pipeline giả lập 126 trạm cảm biến tại **126 phường/xã của Hà Nội** (theo cơ cấu hành chính 2025 sau khi xóa bỏ cấp quận)

**Lưu ý**: Danh sách đầy đủ 126 phường/xã với tọa độ GPS và địa chỉ được cấu hình trong file `config.py`.

## 📈 Quản lý Request Limit

- **Giới hạn**: 1000 requests/ngày (OpenWeather Free Tier)
- **Sử dụng**: 2 APIs × 126 phường/xã = 252 requests/chu kỳ
- **Chu kỳ mặc định**: 480 phút (8 giờ)
- **Tổng requests/ngày**: ~3 chu kỳ × 252 = 756 requests/ngày ✅

### Tùy chỉnh chu kỳ

Để thay đổi tần suất cập nhật, chỉnh `ETL_INTERVAL_MINUTES` trong `.env`:

- **240 phút (4 giờ)**: ~6 chu kỳ × 252 = 1512 requests/ngày (vượt giới hạn free tier)
- **360 phút (6 giờ)**: ~4 chu kỳ × 252 = 1008 requests/ngày (vượt giới hạn free tier)
- **480 phút (8 giờ)**: ~3 chu kỳ × 252 = 756 requests/ngày (khuyến nghị cho free tier) ✅
- **720 phút (12 giờ)**: ~2 chu kỳ × 252 = 504 requests/ngày (an toàn)

## 📝 Logs

Logs được ghi vào:
- Console (stdout)
- File: `etl.log`

## 🔍 Truy vấn dữ liệu từ Orion-LD

### Lấy tất cả ObservableProperties

```bash
curl -X GET 'http://localhost:1026/ngsi-ld/v1/entities?type=ObservableProperty' \
  -H 'NGSILD-Tenant: hanoi'
```

### Lấy tất cả Platforms

```bash
curl -X GET 'http://localhost:1026/ngsi-ld/v1/entities?type=Platform' \
  -H 'NGSILD-Tenant: hanoi'
```

### Lấy tất cả Sensors (Devices)

```bash
curl -X GET 'http://localhost:1026/ngsi-ld/v1/entities?type=Device' \
  -H 'NGSILD-Tenant: hanoi'
```

### Lấy Sensor của một quận cụ thể

```bash
curl -X GET 'http://localhost:1026/ngsi-ld/v1/entities/urn:ngsi-ld:Device:WeatherSensor-BaDinh' \
  -H 'NGSILD-Tenant: hanoi'
```

### Lấy tất cả WeatherObserved entities

```bash
curl -X GET 'http://localhost:1026/ngsi-ld/v1/entities?type=WeatherObserved' \
  -H 'NGSILD-Tenant: hanoi'
```

### Lấy dữ liệu của một quận cụ thể

```bash
curl -X GET 'http://localhost:1026/ngsi-ld/v1/entities/urn:ngsi-ld:WeatherObserved:Hanoi-BaDinh' \
  -H 'NGSILD-Tenant: hanoi'
```

### Lấy AirQualityObserved entities

```bash
curl -X GET 'http://localhost:1026/ngsi-ld/v1/entities?type=AirQualityObserved' \
  -H 'NGSILD-Tenant: hanoi'
```

## 🏗️ Kiến trúc SOSA/SSN

```
┌─────────────────────────────────────────────────────────────┐
│                    SOSA/SSN Ontology Layer                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ObservableProperty (17 entities)                           │
│  ├─ Temperature                                             │
│  ├─ AtmosphericPressure                                     │
│  ├─ RelativeHumidity                                        │
│  ├─ CO, NO, NO2, O3, SO2                                    │
│  ├─ PM2.5, PM10                                             │
│  └─ ...                                                     │
│                                                             │
│  Platform (252 entities - 126 phường/xã)     hosts          │
│  ├─ WeatherStation-BaDinh ─────────────> WeatherSensor      │
│  ├─ AirQualityStation-BaDinh ──────────> AQSensor           │
│  └─ ...                                                     │
│                         │                                   │
│                         │ isHostedBy                        │
│                         ▼                                   │
│  Sensor/Device (252 entities)             observes          │
│  ├─ WeatherSensor-BaDinh ──────────────> ObservableProperty │
│  ├─ AirQualitySensor-BaDinh ───────────> ObservableProperty │
│  └─ ...                                                     │
│                         │                                   │
│                         │ refDevice (madeBySensor)          │
│                         ▼                                   │
├─────────────────────────────────────────────────────────────┤
│              Observation Layer (Dynamic)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  WeatherObserved (tạo mới mỗi chu kỳ)                       │
│  AirQualityObserved (tạo mới mỗi chu kỳ)                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ ETL Pipeline
                         ▼
         ┌──────────────────────┐
         │   OpenWeather API    │
         │  - Weather Data      │
         │  - Air Quality Data  │
         └──────────────────────┘
```

## 🔗 Mối quan hệ SOSA/SSN

1. **Platform `hosts` Sensor**: Platform chứa các Sensor
2. **Sensor `isHostedBy` Platform**: Sensor được chứa bởi Platform
3. **Sensor `observes` ObservableProperty**: Sensor quan sát các thuộc tính
4. **Observation `refDevice` Sensor**: Observation được tạo bởi Sensor
5. **Observation `observedProperty`**: Liên kết đến ObservableProperty

## 🏗️ Kiến trúc ETL Pipeline

```
┌─────────────────┐
│  OpenWeather    │
│      API        │
└────────┬────────┘
         │ Extract (HTTP GET)
         │
         ▼
┌─────────────────┐
│  ETL Pipeline   │
│   (Python)      │
│                 │
│  - Extract      │
│  - Transform    │──┐
│  - Load         │  │
└─────────────────┘  │ Transform to
                     │ NGSI-LD Entities
                     │
                     ▼
         ┌──────────────────────┐
         │   NGSI-LD Entities   │
         │  - WeatherObserved   │
         │  - AirQualityObserved│
         └──────────┬───────────┘
                    │ Load (HTTP POST/PATCH)
                    │
                    ▼
         ┌──────────────────────┐
         │    Orion-LD          │
         │  Context Broker      │
         └──────────────────────┘
```

## 📚 Tài liệu tham khảo

- [NGSI-LD Primer](https://www.etsi.org/deliver/etsi_gr/CIM/001_099/008/01.01.01_60/gr_CIM008v010101p.pdf)
- [SOSA/SSN Ontology](https://www.w3.org/TR/vocab-ssn/)
- [Smart Data Models](https://smartdatamodels.org/)
- [OpenWeather API](https://openweathermap.org/api)
- [FIWARE Orion-LD](https://github.com/FIWARE/context.Orion-LD)

## 🛠️ Troubleshooting

### Lỗi kết nối Orion-LD

Kiểm tra Orion-LD đang chạy:

```bash
curl http://localhost:1026/version
```

### Lỗi API Key không hợp lệ

Kiểm tra API key tại: https://home.openweathermap.org/api_keys

### Vượt quá giới hạn requests

Tăng `ETL_INTERVAL_MINUTES` hoặc nâng cấp OpenWeather plan.

## 📄 License

MIT License - Free for educational and commercial use.

## 👥 Contributors

Hanoi Smart City Project Team
