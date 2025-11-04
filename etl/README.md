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
   - Giả lập N trạm cảm biến tại các quận Hà Nội
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

# Đường dẫn tới file GeoJSON chứa dữ liệu địa lý các xã/phường Hà Nội.
# Mặc định: ./etl/ha_noi_with_latlon2.geojson
# Bạn có thể đổi sang đường dẫn khác nếu dữ liệu nằm nơi khác.
HANOI_GEOJSON_PATH=./etl/ha_noi_with_latlon2.geojson
```

### 3. Khởi động Orion-LD

Orion-LD là **FIWARE Context Broker** dùng để lưu trữ và truy vấn dữ liệu NGSI-LD.  
Bạn có thể khởi động Orion-LD bằng **Docker Compose** để dễ quản lý.

```bash
docker run -d --name orion-ld -p 1026:1026 fiware/orion-ld
```
---

## 🏃 Chạy ETL Pipeline

```bash
python main.py
```

**Pipeline sẽ tự động:**
1. ✅ Kiểm tra SOSA/SSN infrastructure
2. ✅ Tự động khởi tạo nếu chưa có (N entities)
3. ✅ Chạy ETL cycle ngay lập tức
4. ✅ Lên lịch chạy định kỳ theo chu kỳ


## 📊 Cấu trúc dữ liệu SOSA/SSN

### 1. ObservableProperty (Thuộc tính quan sát được)

```json
{
  "@context": "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.8.jsonld",
  "id": "urn:ngsi-ld:ObservableProperty:Temperature",
  "type": "ObservableProperty",
  "description": {
      "type": "Property",
      "value": "The temperature of the air"
  },
  "https://smartdatamodels.org/name": {
      "type": "Property",
      "value": "Air Temperature"
  },
  "category": {
      "type": "Property",
      "value": "weather"
  },
  "unit": {
      "type": "Property",
      "value": "Celsius (°C)"
  },
  "unitCode": {
      "type": "Property",
      "value": "CEL"
  }
}
```

### 2. Platform (Nền tảng chứa sensor)

```json
{
 "@context": "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.8.jsonld",
 "id": "urn:ngsi-ld:Platform:WeatherStation-PhuongBaDinh",
 "type": "Platform",
 "https://smartdatamodels.org/name": {
     "type": "Property",
     "value": "Weather Monitoring Platform - Phuong Ba Dinh"
 },
 "description": {
     "type": "Property",
     "value": "Weather monitoring platform hosting sensors in Phuong Ba Dinh, Hanoi"
 },
 "location": {
     "type": "GeoProperty",
     "value": {
         "type": "Point",
         "coordinates": [
             105.837998409,
             21.038569263
         ]
     }
 },
 "https://smartdatamodels.org/address": {
     "type": "Property",
     "value": {
         "addressLocality": "Phuong Ba Dinh",
         "addressRegion": "Hanoi",
         "addressCountry": "VN",
         "type": "PostalAddress"
     }
 },
 "hosts": {
     "type": "Relationship",
     "object": [
         "urn:ngsi-ld:Device:WeatherSensor-PhuongBaDinh"
     ]
 },
 "platformType": {
     "type": "Property",
     "value": "WeatherMonitoringStation"
 },
 "status": {
     "type": "Property",
     "value": "operational"
 },
 "deploymentDate": {
     "type": "Property",
     "value": "2025-01-01T00:00:00Z"
 },
 "https://smartdatamodels.org/owner": {
     "type": "Property",
     "value": "Hanoi Department of Environment"
 },
 "operator": {
     "type": "Property",
     "value": "Hanoi Smart City Initiative"
 }
}
```

### 3. Sensor (Thiết bị cảm biến)

```json
{
 "@context": "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.8.jsonld",
 "id": "urn:ngsi-ld:Device:WeatherSensor-PhuongBaDinh",
 "type": "Device",
 "https://smartdatamodels.org/name": {
     "type": "Property",
     "value": "WeatherSensor-PhuongBaDinh"
 },
 "description": {
     "type": "Property",
     "value": "Multi-parameter weather sensor station in Phuong Ba Dinh, Hanoi"
 },
 "deviceCategory": {
     "type": "Property",
     "value": "sensor"
 },
 "controlledProperty": {
     "type": "Property",
     "value": [
         "temperature",
         "atmosphericPressure",
         "relativeHumidity",
         "windSpeed",
         "windDirection",
         "precipitation",
         "visibility",
         "illuminance"
     ]
 },
 "location": {
     "type": "GeoProperty",
     "value": {
         "type": "Point",
         "coordinates": [
             105.837998409,
             21.038569263
         ]
     }
 },
 "sensorType": {
     "type": "Property",
     "value": "WeatherStation"
 },
 "observes": {
     "type": "Relationship",
     "object": [
         "urn:ngsi-ld:ObservableProperty:Temperature",
         "urn:ngsi-ld:ObservableProperty:AtmosphericPressure",
         "urn:ngsi-ld:ObservableProperty:RelativeHumidity",
         "urn:ngsi-ld:ObservableProperty:WindSpeed",
         "urn:ngsi-ld:ObservableProperty:WindDirection",
         "urn:ngsi-ld:ObservableProperty:Precipitation",
         "urn:ngsi-ld:ObservableProperty:Visibility",
         "urn:ngsi-ld:ObservableProperty:Illuminance"
     ]
 },
 "isHostedBy": {
     "type": "Relationship",
     "object": "urn:ngsi-ld:Platform:WeatherStation-PhuongBaDinh"
 },
 "serialNumber": {
     "type": "Property",
     "value": "WS-HN-PHUONGBADINH-001"
 },
 "hardwareVersion": {
     "type": "Property",
     "value": "2.0"
 },
 "softwareVersion": {
     "type": "Property",
     "value": "1.5.0"
 },
 "firmwareVersion": {
     "type": "Property",
     "value": "3.2.1"
 },
 "https://smartdatamodels.org/dataModel.Environment/brandName": {
     "type": "Property",
     "value": "OpenWeather"
 },
 "https://smartdatamodels.org/dataModel.Environment/modelName": {
     "type": "Property",
     "value": "Multi-Sensor Weather Station"
 },
 "deviceState": {
     "type": "Property",
     "value": "active"
 },
 "dateInstalled": {
     "type": "Property",
     "value": "2025-01-01T00:00:00Z"
 },
 "dateFirstUsed": {
     "type": "Property",
     "value": "2025-01-01T00:00:00Z"
 },
 "https://smartdatamodels.org/dataProvider": {
     "type": "Property",
     "value": "Hanoi Smart City Initiative"
 },
 "https://smartdatamodels.org/owner": {
     "type": "Property",
     "value": "Hanoi Department of Environment"
 }
}
```

### 4. Observation (Quan sát - WeatherObserved)

```json
{
  "@context": [
      "https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld",
      "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.8.jsonld"
  ],
  "id": "urn:ngsi-ld:WeatherObserved:Hanoi-PhuongBaDinh-2025-11-04T06:38:37.505Z",
  "type": "weatherObserved",
  "description": {
      "type": "Property",
      "value": "Weather observation station in Phuong Ba Dinh, Hanoi"
  },
  "address": {
      "type": "Property",
      "value": {
          "addressLocality": "Phuong Ba Dinh",
          "addressRegion": "Hanoi",
          "addressCountry": "VN",
          "type": "PostalAddress"
      }
  },
  "atmosphericPressure": {
      "type": "Property",
      "value": 1018,
      "observedAt": "2025-11-04T06:38:37.505Z",
      "unitCode": "HPA"
  },
  "feelsLikeTemperature": {
      "type": "Property",
      "value": 22.4,
      "observedAt": "2025-11-04T06:38:37.505Z",
      "unitCode": "CEL"
  },
  "illuminance": {
      "type": "Property",
      "value": 50000,
      "observedAt": "2025-11-04T06:38:37.505Z",
      "unitCode": "LUX"
  },
  "precipitation": {
      "type": "Property",
      "value": 0,
      "observedAt": "2025-11-04T06:38:37.505Z",
      "unitCode": "MMT"
  },
  "refDevice": {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Device:WeatherSensor-PhuongBaDinh"
  },
  "relativeHumidity": {
      "type": "Property",
      "value": 0.85,
      "observedAt": "2025-11-04T06:38:37.505Z",
      "unitCode": "C62"
  },
  "temperature": {
      "type": "Property",
      "value": 22,
      "observedAt": "2025-11-04T06:38:37.505Z",
      "unitCode": "CEL"
  },
  "visibility": {
      "type": "Property",
      "value": 10000,
      "observedAt": "2025-11-04T06:38:37.505Z",
      "unitCode": "MTR"
  },
  "weatherType": {
      "type": "Property",
      "value": "Clouds",
      "observedAt": "2025-11-04T06:38:37.505Z"
  },
  "windDirection": {
      "type": "Property",
      "value": 331,
      "observedAt": "2025-11-04T06:38:37.505Z",
      "unitCode": "DD"
  },
  "windSpeed": {
      "type": "Property",
      "value": 2.9,
      "observedAt": "2025-11-04T06:38:37.505Z",
      "unitCode": "MTS"
  },
  "dataProvider": {
      "type": "Property",
      "value": "OpenWeather"
  },
  "dateObserved": {
      "type": "Property",
      "value": {
          "@type": "DateTime",
          "@value": "2025-11-04T06:38:37.505Z"
      }
  },
  "name": {
      "type": "Property",
      "value": "WeatherStation-PhuongBaDinh"
  },
  "source": {
      "type": "Property",
      "value": "https://openweathermap.org"
  },
  "cloudiness": {
      "type": "Property",
      "value": 1,
      "observedAt": "2025-11-04T06:38:37.505Z",
      "unitCode": "C62"
  },
  "pressureTendency": {
      "type": "Property",
      "value": 0,
      "observedAt": "2025-11-04T06:38:37.505Z",
      "unitCode": "A97"
  },
  "stationCode": {
      "type": "Property",
      "value": "HN-PHUONGBADINH"
  },
  "stationName": {
      "type": "Property",
      "value": "PhuongBaDinh"
  },
  "weatherDescription": {
      "type": "Property",
      "value": "overcast clouds",
      "observedAt": "2025-11-04T06:38:37.505Z"
  },
  "location": {
      "type": "GeoProperty",
      "value": {
          "type": "Point",
          "coordinates": [
              105.837998409,
              21.038569263
          ]
      }
  }
}
```

### 5. Observation (Quan sát - AirQualityObserved)

```json
 {
  "@context": [
      "https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld",
      "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.8.jsonld"
  ],
  "id": "urn:ngsi-ld:AirQualityObserved:Hanoi-PhuongBaDinh-2025-11-04T06:38:37.506Z",
  "type": "airQualityObserved",
  "description": {
      "type": "Property",
      "value": "Air quality monitoring station in Phuong Ba Dinh, Hanoi"
  },
  "address": {
      "type": "Property",
      "value": {
          "addressLocality": "Phuong Ba Dinh",
          "addressRegion": "Hanoi",
          "addressCountry": "VN",
          "type": "PostalAddress"
      }
  },
  "airQualityIndex": {
      "type": "Property",
      "value": 2,
      "observedAt": "2025-11-04T06:38:37.506Z"
  },
  "airQualityLevel": {
      "type": "Property",
      "value": "fair",
      "observedAt": "2025-11-04T06:38:37.506Z"
  },
  "pm10": {
      "type": "Property",
      "value": 11.64,
      "observedAt": "2025-11-04T06:38:37.506Z",
      "unitCode": "GQ"
  },
  "precipitation": {
      "type": "Property",
      "value": 0,
      "observedAt": "2025-11-04T06:38:37.506Z",
      "unitCode": "MMT"
  },
  "refDevice": {
      "type": "Relationship",
      "object": "urn:ngsi-ld:Device:AirQualitySensor-PhuongBaDinh"
  },
  "refPointOfInterest": {
      "type": "Relationship",
      "object": "urn:ngsi-ld:PointOfInterest:Hanoi-PhuongBaDinh"
  },
  "relativeHumidity": {
      "type": "Property",
      "value": 0.85,
      "observedAt": "2025-11-04T06:38:37.506Z",
      "unitCode": "C62"
  },
  "reliability": {
      "type": "Property",
      "value": 0.85,
      "observedAt": "2025-11-04T06:38:37.506Z"
  },
  "temperature": {
      "type": "Property",
      "value": 22,
      "observedAt": "2025-11-04T06:38:37.506Z",
      "unitCode": "CEL"
  },
  "windDirection": {
      "type": "Property",
      "value": 331,
      "observedAt": "2025-11-04T06:38:37.506Z",
      "unitCode": "DD"
  },
  "windSpeed": {
      "type": "Property",
      "value": 2.85,
      "observedAt": "2025-11-04T06:38:37.506Z",
      "unitCode": "MTS"
  },
  "dataProvider": {
      "type": "Property",
      "value": "OpenWeather"
  },
  "dateObserved": {
      "type": "Property",
      "value": "2025-11-04T06:38:37.506Z"
  },
  "name": {
      "type": "Property",
      "value": "AirQualityStation-PhuongBaDinh"
  },
  "source": {
      "type": "Property",
      "value": "https://openweathermap.org"
  },
  "CO": {
      "type": "Property",
      "value": 225.48,
      "observedAt": "2025-11-04T06:38:37.506Z",
      "unitCode": "GP"
  },
  "CO_Level": {
      "type": "Property",
      "value": "good",
      "observedAt": "2025-11-04T06:38:37.506Z"
  },
  "NH3": {
      "type": "Property",
      "value": 0.82,
      "observedAt": "2025-11-04T06:38:37.506Z",
      "unitCode": "GQ"
  },
  "NO": {
      "type": "Property",
      "value": 0.28,
      "observedAt": "2025-11-04T06:38:37.506Z",
      "unitCode": "GQ"
  },
  "NO2": {
      "type": "Property",
      "value": 3.99,
      "observedAt": "2025-11-04T06:38:37.506Z",
      "unitCode": "GQ"
  },
  "NOx": {
      "type": "Property",
      "value": 4.27,
      "observedAt": "2025-11-04T06:38:37.506Z",
      "unitCode": "GQ"
  },
  "O3": {
      "type": "Property",
      "value": 43.74,
      "observedAt": "2025-11-04T06:38:37.506Z",
      "unitCode": "GQ"
  },
  "SO2": {
      "type": "Property",
      "value": 2.1,
      "observedAt": "2025-11-04T06:38:37.506Z",
      "unitCode": "GQ"
  },
  "pm2_5": {
      "type": "Property",
      "value": 10.3,
      "observedAt": "2025-11-04T06:38:37.506Z",
      "unitCode": "GQ"
  },
  "stationCode": {
      "type": "Property",
      "value": "HN-AQ-PHUONGBADINH"
  },
  "stationName": {
      "type": "Property",
      "value": "PhuongBaDinh"
  },
  "location": {
      "type": "GeoProperty",
      "value": {
          "type": "Point",
          "coordinates": [
              105.837998409,
              21.038569263
          ]
      }
  }
}
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

---

*Phần này sẽ được bổ sung với các API calls cụ thể cho dự án...*

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
│  Platform (N entities - N phường/xã)                           │
│  ├─ WeatherStation-PhuongBaDinh ─────────────> WeatherSensor   │
│  ├─ AirQualityStation-PhuongBaDinh ─────────> AQSensor         │
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
│  WeatherObserved (tạo mới mỗi chu kỳ)                          │
│  AirQualityObserved (tạo mới mỗi chu kỳ)                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                         │
                         │ ETL Pipeline
                         ▼
          ┌─────────────────────────────┐
          │      OpenWeather API        │
          │  - Weather Data             │
          │  - Air Quality Data         │
          └─────────────────────────────┘

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
