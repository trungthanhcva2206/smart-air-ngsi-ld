# Air Track Monitoring ETL Pipeline

## Project Overview

This ETL Pipeline is designed to meet Smart City standards with a complete FIWARE architecture:

### 🎯 Achieved Criteria

1.  **✅ Data Modeling according to SOSA/SSN Ontology (W3C)**

      * **Sensor**: Sensing devices (Weather Sensor, Air Quality Sensor)
      * **Platform**: Platform hosting sensors (Environment Monitoring Station)
      * **ObservableProperty**: Observable properties (Temperature, CO, PM2.5, ...)
      * **Observation**: Actual observations (WeatherObserved, AirQualityObserved)
      * Relationships: `observes`, `isHostedBy`, `hosts`, `refDevice`
      * Compliant with W3C SSN standard: [https://www.w3.org/TR/vocab-ssn/](https://www.w3.org/TR/vocab-ssn/)

2.  **✅ NGSI-LD API and Data Model (ETSI ISG CIM)**

      * NGSI-LD standard entities with `@context`
      * Standardized Properties, GeoProperties, and Relationships
      * Integration with Orion-LD Context Broker

3.  **✅ Utilization of Smart Data Models (FIWARE)**

      * `WeatherObserved`: [https://github.com/smart-data-models/dataModel.Environment/tree/master/WeatherObserved](https://github.com/smart-data-models/dataModel.Environment/tree/master/WeatherObserved)
      * `AirQualityObserved`: [https://github.com/smart-data-models/dataModel.Environment/tree/master/AirQualityObserved](https://github.com/smart-data-models/dataModel.Environment/tree/master/AirQualityObserved)
      * Adheres to schemas and attributes from smartdatamodels.org

4.  **✅ Time Series Data Storage with QuantumLeap**

      * Automatic historical data storage via subscriptions
      * Supports time-based data querying
      * Integration with TimescaleDB for efficient storage

5.  **✅ Real-time Notifications**

      * Automatic subscriptions from Orion-LD to QuantumLeap
      * Entity updates using fixed IDs (no timestamp in ID)
      * Supports SSE real-time updates for frontend

6.  **✅ Open Data Creation from Real Sources**

      * Reusing OpenWeather API (open data source)
      * Simulating 126 sensor stations at wards/communes in Hanoi
      * Real-time data for product demos

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FIWARE Platform                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐       ┌──────────────┐                                     │
│  │  Orion-LD   │       │ QuantumLeap  │                                     │
│  │  (1026)     │◄────► │   (8668)     │                                     │
│  │ Context     │       │  Time Series │                                     │
│  │  Broker     │       │   Service    │                                     │
│  └──────▲──────┘       └──────────────┘                                     │
│         │                   ▲                                               │
│         │                   │                                               │
│         │ ┌─────────────────┴──────┐                                        │
│         │ │  subscription/notify   │                                        │
│         │ └────────────────────────┘                                        │
│         │                                                                   │
│         │ NGSI-LD                                                           │
│         │ Entities           ┌─────────────────┐                            │
│         │                    │    IoT Agent    │                            │
│         │                    │    JSON (4041)  │                            │
│         │                    │    - Device Mgmt│                            │
│         │◄───────────────────┤    - Transform  │                            │
│         │                    │    - Provision  │                            │
│         │                    └────────▲────────┘                            │
│         │                             │                                     │
│         │                             │ MQTT                                │
│         │                             │ (Raw Data)                          │
│         │                             │                                     │
│         │                    ┌────────┴────────┐                            │
│         │                    │    Mosquitto    │                            │
│         │                    │    MQTT Broker  │                            │
│         │                    │    (1883)       │                            │
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
│  │    Dual-Path Architecture            │     │
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
       │  - Air Track       │
       └────────────────────┘
```

## 📊 Data Flow

### 1\. Dual-Path ETL Architecture

The pipeline supports 2 parallel or independent data streams:

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

### 2\. Subscription Flow (Real-time)

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

### 3\. ETL Mode Configuration

Select ETL mode via the `ETL_MODE` environment variable:

  * **`rest`**: Use REST API only (PATH 1)
      * ✅ Full entity structure from models.py
      * ✅ GeoProperty and Relationships
      * ⚠️ Does not adhere to FIWARE IoT architecture
  * **`mqtt`**: Use MQTT → IoT Agent only (PATH 2)
      * ✅ FIWARE compliant architecture
      * ✅ Device provisioning and management
      * ⚠️ No GeoProperty (location must be set via provisioning)
  * **`dual`**: Both paths running in parallel (Default)
      * ✅ REST creates the initial entity with GeoProperty
      * ✅ MQTT updates measurements via IoT Agent
      * ✅ Mutual backup
      * ⚠️ REST must run first to create the structure

## 📋 Requirements

  * Python 3.8+
  * OpenWeather API Key (Free 1000 requests/day)
  * Orion-LD Context Broker (local or remote)

## 🚀 Installation

### 1\. Clone repository

```bash
cd air-track-ngsi-ld
```

### 2\. Start FIWARE Platform

```bash
docker-compose up -d
```

Services started:

  * **Orion-LD**: `localhost:1026` - Context Broker
  * **QuantumLeap**: `localhost:8668` - Time Series Service
  * **TimescaleDB**: `localhost:5432` - PostgreSQL Time Series Database
  * **Mosquitto**: `localhost:1883` - MQTT Broker
  * **IoT Agent JSON**: `localhost:4041` - IoT Device Management

Check services:

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
# Use MQTT client to test: mosquitto_sub -h localhost -p 1883 -t "#"
```

### 3\. Configure ETL Pipeline

```bash
pip install -r requirements.txt
```

Create `.env` file from `.env.example`:

```bash
copy .env.example .env
```

Edit `.env`:

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
# Path to GeoJSON file containing Hanoi wards/communes geography.
# Default: ./etl/ha_noi_with_latlon2.geojson
# You can change to another path if data is located elsewhere.
HANOI_GEOJSON_PATH=./etl/ha_noi_with_latlon2.geojson
```

### 4\. Provision IoT Agent Devices (Required for MQTT mode)

If using `ETL_MODE=mqtt` or `ETL_MODE=dual`, you need to provision devices first:

#### Windows (PowerShell)

```powershell
.\iot-agent-provisioning.ps1
```

#### Linux/Mac (Bash)

```bash
chmod +x iot-agent-provisioning.sh
./iot-agent-provisioning.sh
```

The script will automatically:

  * ✅ Provision service group with MQTT transport
  * ✅ Provision 252 devices (126 weather + 126 air quality)
  * ✅ Map attributes according to models.py
  * ✅ Set static attributes (address, dataProvider, source)

**Important Note:**

  * Only need to run **once** during initial setup.
  * If attribute mapping changes → Run script again to update.
  * Device ID format: `weather-{district}`, `airquality-{district}` (lowercase, hyphens).

### 5\. Run ETL Pipeline

```bash
python -m etl.Core_ETL.main
```

**The pipeline will automatically:**

1.  ✅ Initialize SOSA/SSN infrastructure (ObservableProperty, Platform, Device)
2.  ✅ Create subscriptions from Orion-LD to QuantumLeap
3.  ✅ Run the first ETL cycle immediately
4.  ✅ Schedule periodic runs according to configuration
5.  ✅ Publish MQTT messages (if mode = 'mqtt' or 'dual')

**Recommendation:**

  * **First time**: Use `ETL_MODE=dual` to create full entities.
  * **Subsequent times**: Can switch to `ETL_MODE=mqtt` to update via IoT Agent only.

## 🔧 Subscription Manager

The pipeline automatically creates the following subscriptions:

### 1\. WeatherObserved → QuantumLeap

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

### 2\. AirQualityObserved → QuantumLeap

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

### 3\. Device → QuantumLeap

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

### 4\. Platform → QuantumLeap

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

## 🏗️ SOSA/SSN Architecture

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
│  ├─ EnvironmentStation-PhuongBaDinh             isHostedBy    Sensor/Device (2N entities)                                  │
│  │   ├─ hosts → WeatherSensor-PhuongBaDinh      ---------->   ├─ WeatherSensor-PhuongBaDinh ───────────> ObservableProperty│      
│  │   └─ hosts → AirQualitySensor-PhuongBaDinh                ├─ AirQualitySensor-PhuongBaDinh ────────> ObservableProperty│ 
│  └─ ...                                                       └─ ...                                                       │
│                                                                                                  │                         │
│                                                                                                  │ refDevice (madeBySensor)│
│                                                                                                  ▼                         │
│────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────│
│                                                      Observation Layer (Dynamic)                                           │
│────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────│
│                                                                                                                            │
│                  WeatherObserved (N entities - updated each cycle)                                                         │                            ┌────────────────────────┐
│                  ├─ ID: urn:ngsi-ld:WeatherObserved:Hanoi-{District}                                                       │                            │      QuantumLeap       │
│                  └─ dateObserved updated each cycle                                                                        │    Notify via Subscription │- Time Series Storage   │
│                                                                                                                            │    ---------------->       │- Historical Queries    │
│                                                                                                                            │                            │- Aggregations          │    
│                  AirQualityObserved (N entities - updated each cycle)                                                      │                            └────────────────────────┘
│                  ├─ ID: urn:ngsi-ld:AirQualityObserved:Hanoi-{District}                                                    │                                                    
│                  └─ dateObserved updated each cycle                                                                        │ 
│                                                                                                                            │ 
│                                                                                                                            │ 
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘                                                                                                                                       │ 
```

## 🗺️ Monitored Wards/Communes

The pipeline simulates N sensor stations at **N wards/communes**.

**Note**: The complete list of 126 wards/communes (according to the 2025 administrative structure after district consolidation) with GPS coordinates and station addresses is configured in the `ha_noi_with_latlon2.geojson` file.

## 📈 Request Limit Management

  * **Limit**: 1000 requests/day (OpenWeather Free Tier)
  * **Usage**: 2 APIs × N wards/communes = 2 × N requests/cycle
  * **Default Cycle**: S = ⌊1000 / (2 × N)⌋
  * **Total requests/day**: \~S × (2 × N) requests/day, where S = number of cycles/day such that total requests \< limit ✅

### Customize Cycle

To change the update frequency, adjust `ETL_INTERVAL_MINUTES` in `.env`:

#### For current data

  * **240 minutes (4 hours)**:  S = \~6 cycles
  * **360 minutes (6 hours)**:  S = \~4 cycles
  * **480 minutes (8 hours)**:  S = \~3 cycles
  * **720 minutes (12 hours)**: S = \~2 cycles

## 📝 Logs

Logs are written to:

  * Console (stdout)
  * File: `etl.log`

## 🔍 Querying Data from Orion-LD

### 📖 Reference API Documentation

Orion-LD provides a full API according to NGSI-LD standards for querying, managing, and registering notifications for entities. Below is official documentation for reference:

#### Official Documentation

  * **NGSI-LD API Specification**: [ETSI GS CIM 009 V1.8.1](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.08.01_60/gs_CIM009v010801p.pdf)
      * Full specification of NGSI-LD API v1.8.1
      * Definitions of endpoints, parameters, and response formats
  * **NGSI-LD Primer**: [Understanding NGSI-LD](https://www.etsi.org/deliver/etsi_gr/CIM/001_099/008/01.01.01_60/gr_CIM008v010101p.pdf)
      * Basic guide to NGSI-LD
      * Concepts and use cases explanation
  * **Orion-LD Developer Guide**: [GitHub Documentation](https://github.com/FIWARE/context.Orion-LD/blob/develop/doc/manuals-ld/developer-documentation.md)
      * Documentation for developers
      * Detailed instructions on API and implementation
  * **FIWARE NGSI-LD Tutorials**: [Step-by-Step Guide](https://fiware-tutorials.readthedocs.io/en/latest/)
      * Step-by-step tutorial for NGSI-LD
      * Demo examples and best practices
  * **Orion-LD Operations**: [API Operations Manual](https://github.com/FIWARE/context.Orion-LD/blob/develop/doc/manuals-ld/orionld-operations.md)
      * Orion-LD operations guide
      * Operations and configuration

#### Main API Types

1.  **Entity Operations** - Manage entities (CRUD)
2.  **Query Operations** - Query data with filters, geo-queries, temporal queries
3.  **Subscription Management** - Register for real-time notifications
4.  **Batch Operations** - Bulk operations
5.  **Temporal Operations** - Query data over time
6.  **Registration Operations** - Register context sources

### 🎯 API used in this project

**Note**: On Windows CMD, use double quotes `"` instead of `'` and write the command on a single line.

#### Entities used

  * `ObservableProperty` - 17 observable properties
  * `Platform` - N platforms
  * `Device` - N sensor devices
  * `WeatherObserved` - Weather data (dynamic)
  * `AirQualityObserved` - Air quality data (dynamic)

#### Tenant

  * **NGSILD-Tenant**: `hanoi`

## 📚 References

  * [NGSI-LD Primer](https://www.etsi.org/deliver/etsi_gr/CIM/001_099/008/01.01.01_60/gr_CIM008v010101p.pdf)
  * [SOSA/SSN Ontology](https://www.w3.org/TR/vocab-ssn/)
  * [Smart Data Models](https://smartdatamodels.org/)
  * [OpenWeather API](https://openweathermap.org/api)
  * [FIWARE QuantumLeap](https://github.com/FIWARE/quantum-leap)
  * [FIWARE Orion-LD](https://github.com/FIWARE/context.Orion-LD)

## 🛠️ Troubleshooting

### 1\. Orion-LD Connection Error

Check if Orion-LD is running:

```bash
curl http://localhost:1026/version

# Check logs
docker logs fiware-orion-ld
```

### 2\. QuantumLeap not receiving data

```bash
# Check subscriptions
curl -X GET "http://localhost:1026/ngsi-ld/v1/subscriptions" \
  -H "NGSILD-Tenant: hanoi"

# Check QuantumLeap logs
docker logs fiware-quantumleap

# Check TimescaleDB
# Connect via psql
psql -h localhost -p 5432 -U postgres -d quantumleap
```

### 3\. Invalid API Key Error

Check your API key at: [https://home.openweathermap.org/api\_keys](https://home.openweathermap.org/api_keys)

### 4\. IoT Agent not receiving MQTT messages

```bash
# Check IoT Agent status
curl http://localhost:4041/iot/about

# Check provisioned devices
curl http://localhost:4041/iot/devices -H "fiware-service: hanoi" -H "fiware-servicepath: /"

# Check MQTT broker
docker logs mosquitto

# Check IoT Agent logs
docker logs fiware-iot-agent --tail 100

# Test MQTT publish
mosquitto_pub -h localhost -p 1883 -t "/hanoi/weather-test/attrs" -m '{"temperature": 250}'
```

### 5\. Device ID mismatch

If you see "Device not found" error in IoT Agent logs:

  * Check if device\_id format in MQTT payload matches the provisioning script.
  * Device ID must be lowercase + hyphens + Vietnamese normalization.
  * Example: "Phường Hoàn Kiếm" → "weather-phuong-hoan-kiem".

### 6\. Exceeding request limits

Increase `ETL_INTERVAL_MINUTES` or upgrade OpenWeather plan.

## 📄 License

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at [http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

## 👥 Contributors

  * **TT** - [trungthanhcva2206@gmail.com](mailto:trungthanhcva2206@gmail.com)
  * **Tankchoi** - [tadzltv22082004@gmail.com](mailto:tadzltv22082004@gmail.com)
  * **Panh** - [panh812004.apn@gmail.com](mailto:panh812004.apn@gmail.com)

## 💡 Support

If you encounter issues, please:

1.  Check [Issues](https://github.com/trungthanhcva2206/air-track-ngsi-ld/issues)
2.  View [Documentation Wiki](https://github.com/trungthanhcva2206/air-track-ngsi-ld/wiki)
3.  Discuss in [Discussions](https://github.com/trungthanhcva2206/air-track-ngsi-ld/discussions)
4.  Contact authors

**Copyright © 2025 TAA. All rights reserved.**
