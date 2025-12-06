#!/bin/bash
# FIWARE IoT Agent JSON - Device Provisioning Script (Bash)
# This script provisions ALL virtual devices for Hanoi districts
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#     http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# 
# @Project smart-air-ngsi-ld
# @Authors 
#    - TT (trungthanhcva2206@gmail.com)
#    - Tankchoi (tadzltv22082004@gmail.com)
#    - Panh (panh812004.apn@gmail.com)
# @Copyright (C) 2025 TAA. All rights reserved
# @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
set -e

IOTA_URL="http://iot-agent:4041"
ORION_URL="http://orion:1026"
FIWARE_SERVICE="hanoi"
API_KEY="hanoi"

echo "=================================================="
echo "FIWARE IoT Agent JSON - Device Provisioning"
echo "=================================================="
echo "IoT Agent URL: $IOTA_URL"
echo "Orion-LD URL: $ORION_URL"
echo "FIWARE Service: $FIWARE_SERVICE"
echo "API Key: $API_KEY"
echo "=================================================="

# Function to provision a service group
provision_service_group() {
    echo ""
    echo "📝 Provisioning Service Group..."
    
    curl -sX POST \
      "$IOTA_URL/iot/services" \
      -H 'Content-Type: application/json' \
      -H "fiware-service: $FIWARE_SERVICE" \
      -H 'fiware-servicepath: /' \
      -d '{
        "services": [
          {
            "apikey": "'"$API_KEY"'",
            "cbroker": "'"$ORION_URL"'",
            "entity_type": "weatherObserved",
            "resource": "/iot/json",
            "protocol": "IoTA-JSON",
            "transport": "MQTT",
            "timezone": "Asia/Ho_Chi_Minh",
            "timestamp": true,
            "autoprovision": false,
            "explicitAttrs": true
          }
        ]
      }' > /dev/null
    
    echo "✅ Service Group provisioned"
}

# Function to normalize Vietnamese characters (matching PowerShell version)
normalize_district() {
    echo "$1" | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | \
    sed 's/à/a/g; s/á/a/g; s/ả/a/g; s/ã/a/g; s/ạ/a/g; s/ă/a/g; s/ằ/a/g; s/ắ/a/g; s/ẳ/a/g; s/ẵ/a/g; s/ặ/a/g; s/â/a/g; s/ầ/a/g; s/ấ/a/g; s/ẩ/a/g; s/ẫ/a/g; s/ậ/a/g; s/è/e/g; s/é/e/g; s/ẻ/e/g; s/ẽ/e/g; s/ẹ/e/g; s/ê/e/g; s/ề/e/g; s/ế/e/g; s/ể/e/g; s/ễ/e/g; s/ệ/e/g; s/đ/d/g; s/ì/i/g; s/í/i/g; s/ỉ/i/g; s/ĩ/i/g; s/ị/i/g; s/ò/o/g; s/ó/o/g; s/ỏ/o/g; s/õ/o/g; s/ọ/o/g; s/ô/o/g; s/ồ/o/g; s/ố/o/g; s/ổ/o/g; s/ỗ/o/g; s/ộ/o/g; s/ơ/o/g; s/ờ/o/g; s/ớ/o/g; s/ở/o/g; s/ỡ/o/g; s/ợ/o/g; s/ù/u/g; s/ú/u/g; s/ủ/u/g; s/ũ/u/g; s/ụ/u/g; s/ư/u/g; s/ừ/u/g; s/ứ/u/g; s/ử/u/g; s/ữ/u/g; s/ự/u/g; s/ỳ/y/g; s/ý/y/g; s/ỷ/y/g; s/ỹ/y/g; s/ỵ/y/g'
}

# Function to provision weather device
provision_weather_device() {
    local DISTRICT=$1
    local DISTRICT_SAFE=$(normalize_district "$DISTRICT")
    local DEVICE_ID="weather-$DISTRICT_SAFE"
    local ENTITY_ID="urn:ngsi-ld:WeatherObserved:Hanoi-$(echo $DISTRICT | tr -d ' ')"
    
    echo ""
    echo "📍 Provisioning Weather Device: $DEVICE_ID → $ENTITY_ID"
    
    curl -sX POST \
      "$IOTA_URL/iot/devices" \
      -H 'Content-Type: application/json' \
      -H "fiware-service: $FIWARE_SERVICE" \
      -H 'fiware-servicepath: /' \
      -d '{
        "devices": [
          {
            "device_id": "'"$DEVICE_ID"'",
            "entity_name": "'"$ENTITY_ID"'",
            "entity_type": "weatherObserved",
            "timezone": "Asia/Ho_Chi_Minh",
            "protocol": "IoTA-JSON",
            "transport": "MQTT",
            "apikey": "'"$API_KEY"'",
            "attributes": [
              {"object_id": "name", "name": "name", "type": "Text"},
              {"object_id": "description", "name": "description", "type": "Text"},
              {"object_id": "stationName", "name": "stationName", "type": "Text"},
              {"object_id": "stationCode", "name": "stationCode", "type": "Text"},
              {"object_id": "temperature", "name": "temperature", "type": "Number"},
              {"object_id": "feelsLikeTemperature", "name": "feelsLikeTemperature", "type": "Number"},
              {"object_id": "pressure", "name": "atmosphericPressure", "type": "Number"},
              {"object_id": "humidity", "name": "relativeHumidity", "type": "Number"},
              {"object_id": "weatherType", "name": "weatherType", "type": "Text"},
              {"object_id": "weatherDescription", "name": "weatherDescription", "type": "Text"},
              {"object_id": "windSpeed", "name": "windSpeed", "type": "Number"},
              {"object_id": "windDirection", "name": "windDirection", "type": "Number"},
              {"object_id": "visibility", "name": "visibility", "type": "Number"},
              {"object_id": "cloudiness", "name": "cloudiness", "type": "Number"},
              {"object_id": "precipitation", "name": "precipitation", "type": "Number"},
              {"object_id": "pressureTendency", "name": "pressureTendency", "type": "Number"},
              {"object_id": "illuminance", "name": "illuminance", "type": "Number"},
              {"object_id": "latitude", "name": "latitude", "type": "Number"},
              {"object_id": "longitude", "name": "longitude", "type": "Number"},
              {"object_id": "dateObserved", "name": "dateObserved", "type": "DateTime"},
              {"object_id": "refDevice", "name": "refDevice", "type": "Text"}
            ],
            "static_attributes": [
              {"name": "address", "type": "StructuredValue", "value": {"addressLocality": "'"$DISTRICT"'", "addressRegion": "Hanoi", "addressCountry": "VN", "type": "PostalAddress"}},
              {"name": "dataProvider", "type": "Text", "value": "OpenWeather"},
              {"name": "source", "type": "URL", "value": "https://openweathermap.org"}
            ]
          }
        ]
      }' > /dev/null
    
    echo "✅ Weather device provisioned: $DEVICE_ID"
}

# Function to provision air quality device
provision_airquality_device() {
    local DISTRICT=$1
    local DISTRICT_SAFE=$(normalize_district "$DISTRICT")
    local DEVICE_ID="airquality-$DISTRICT_SAFE"
    local ENTITY_ID="urn:ngsi-ld:AirQualityObserved:Hanoi-$(echo $DISTRICT | tr -d ' ')"
    
    echo ""
    echo "📍 Provisioning Air Quality Device: $DEVICE_ID → $ENTITY_ID"
    
    curl -sX POST \
      "$IOTA_URL/iot/devices" \
      -H 'Content-Type: application/json' \
      -H "fiware-service: $FIWARE_SERVICE" \
      -H 'fiware-servicepath: /' \
      -d '{
        "devices": [
          {
            "device_id": "'"$DEVICE_ID"'",
            "entity_name": "'"$ENTITY_ID"'",
            "entity_type": "airQualityObserved",
            "timezone": "Asia/Ho_Chi_Minh",
            "protocol": "IoTA-JSON",
            "transport": "MQTT",
            "apikey": "'"$API_KEY"'",
            "attributes": [
              {"object_id": "name", "name": "name", "type": "Text"},
              {"object_id": "description", "name": "description", "type": "Text"},
              {"object_id": "stationName", "name": "stationName", "type": "Text"},
              {"object_id": "stationCode", "name": "stationCode", "type": "Text"},
              {"object_id": "co", "name": "CO", "type": "Number"},
              {"object_id": "no", "name": "NO", "type": "Number"},
              {"object_id": "no2", "name": "NO2", "type": "Number"},
              {"object_id": "nox", "name": "NOx", "type": "Number"},
              {"object_id": "o3", "name": "O3", "type": "Number"},
              {"object_id": "so2", "name": "SO2", "type": "Number"},
              {"object_id": "pm2_5", "name": "pm2_5", "type": "Number"},
              {"object_id": "pm10", "name": "pm10", "type": "Number"},
              {"object_id": "nh3", "name": "NH3", "type": "Number"},
              {"object_id": "aqi", "name": "airQualityIndex", "type": "Number"},
              {"object_id": "airQualityLevel", "name": "airQualityLevel", "type": "Text"},
              {"object_id": "temperature", "name": "temperature", "type": "Number"},
              {"object_id": "humidity", "name": "relativeHumidity", "type": "Number"},
              {"object_id": "windSpeed", "name": "windSpeed", "type": "Number"},
              {"object_id": "windDirection", "name": "windDirection", "type": "Number"},
              {"object_id": "precipitation", "name": "precipitation", "type": "Number"},
              {"object_id": "reliability", "name": "reliability", "type": "Number"},
              {"object_id": "coLevel", "name": "CO_Level", "type": "Text"},
              {"object_id": "latitude", "name": "latitude", "type": "Number"},
              {"object_id": "longitude", "name": "longitude", "type": "Number"},
              {"object_id": "dateObserved", "name": "dateObserved", "type": "DateTime"},
              {"object_id": "refDevice", "name": "refDevice", "type": "Text"},
              {"object_id": "refPointOfInterest", "name": "refPointOfInterest", "type": "Text"}
            ],
            "static_attributes": [
              {"name": "address", "type": "StructuredValue", "value": {"addressLocality": "'"$DISTRICT"'", "addressRegion": "Hanoi", "addressCountry": "VN", "type": "PostalAddress"}},
              {"name": "dataProvider", "type": "Text", "value": "OpenWeather"},
              {"name": "source", "type": "URL", "value": "https://openweathermap.org"}
            ]
          }
        ]
      }' > /dev/null
    
    echo "✅ Air Quality device provisioned: $DEVICE_ID"
}

# Main provisioning
echo ""
echo "🔧 Step 1: Provisioning Service Group..."
provision_service_group

sleep 2

echo ""
echo "🔧 Step 2: Provisioning Devices for all 126 Hanoi wards/communes..."

# List of 126 Hanoi wards/communes (matching HANOI_DISTRICTS from GeoJSON)
DISTRICTS=(
  "Phuong Hoan Kiem"
  "Phuong Cua Nam"
  "Phuong Ba Dinh"
  "Phuong Ngoc Ha"
  "Phuong Giang Vo"
  "Phuong Hai Ba Trung"
  "Phuong Vinh Tuy"
  "Phuong Bach Mai"
  "Phuong Dong Da"
  "Phuong Kim Lien"
  "Phuong Van Mieu Quoc Tu Giam"
  "Phuong Lang"
  "Phuong O Cho Dua"
  "Phuong Hong Ha"
  "Phuong Linh Nam"
  "Phuong Hoang Mai"
  "Phuong Vinh Hung"
  "Phuong Tuong Mai"
  "Phuong Dinh Cong"
  "Phuong Hoang Liet"
  "Phuong Yen So"
  "Phuong Thanh Xuan"
  "Phuong Khuong Dinh"
  "Phuong Phuong Liet"
  "Phuong Cau Giay"
  "Phuong Nghia Do"
  "Phuong Yen Hoa"
  "Phuong Tay Ho"
  "Phuong Phu Thuong"
  "Phuong Tay Tuu"
  "Phuong Phu Dien"
  "Phuong Xuan Dinh"
  "Phuong Dong Ngac"
  "Phuong Thuong Cat"
  "Phuong Tu Liem"
  "Phuong Xuan Phuong"
  "Phuong Tay Mo"
  "Phuong Dai Mo"
  "Phuong Long Bien"
  "Phuong Bo De"
  "Phuong Viet Hung"
  "Phuong Phuc Loi"
  "Phuong Ha Dong"
  "Phuong Duong Noi"
  "Phuong Yen Nghia"
  "Phuong Phu Luong"
  "Phuong Kien Hung"
  "Xa Thanh Tri"
  "Xa Dai Thanh"
  "Xa Nam Phu"
  "Xa Ngoc Hoi"
  "Phuong Thanh Liet"
  "Xa Thuong Phuc"
  "Xa Thuong Tin"
  "Xa Chuong Duong"
  "Xa Hong Van"
  "Xa Phu Xuyen"
  "Xa Phuong Duc"
  "Xa Chuyen My"
  "Xa Dai Xuyen"
  "Xa Thanh Oai"
  "Xa Binh Minh"
  "Xa Tam Hung"
  "Xa Dan Hoa"
  "Xa Van Dinh"
  "Xa Ung Thien"
  "Xa Hoa Xa"
  "Xa Ung Hoa"
  "Xa My Duc"
  "Xa Hong Son"
  "Xa Phuc Son"
  "Xa Huong Son"
  "Phuong Chuong My"
  "Xa Phu Nghia"
  "Xa Xuan Mai"
  "Xa Tran Phu"
  "Xa Hoa Phu"
  "Xa Quang Bi"
  "Xa Minh Chau"
  "Xa Quang Oai"
  "Xa Vat Lai"
  "Xa Co Do"
  "Xa Bat Bat"
  "Xa Suoi Hai"
  "Xa Ba Vi"
  "Xa Yen Bai"
  "Phuong Son Tay"
  "Phuong Tung Thien"
  "Xa Doai Phuong"
  "Xa Phuc Tho"
  "Xa Phuc Loc"
  "Xa Hat Mon"
  "Xa Thach That"
  "Xa Ha Bang"
  "Xa Tay Phuong"
  "Xa Hoa Lac"
  "Xa Yen Xuan"
  "Xa Quoc Oai"
  "Xa Hung Dao"
  "Xa Kieu Phu"
  "Xa Phu Cat"
  "Xa Hoai Duc"
  "Xa Duong Hoa"
  "Xa Son Dong"
  "Xa An Khanh"
  "Xa Dan Phuong"
  "Xa O Dien"
  "Xa Lien Minh"
  "Xa Gia Lam"
  "Xa Thuan An"
  "Xa Bat Trang"
  "Xa Phu Dong"
  "Xa Thu Lam"
  "Xa Dong Anh"
  "Xa Phuc Thinh"
  "Xa Thien Loc"
  "Xa Vinh Thanh"
  "Xa Me Linh"
  "Xa Yen Lang"
  "Xa Tien Thang"
  "Xa Quang Minh"
  "Xa Soc Son"
  "Xa Da Phuc"
  "Xa Noi Bai"
  "Xa Trung Gia"
  "Xa Kim Anh"
)

for DISTRICT in "${DISTRICTS[@]}"; do
    provision_weather_device "$DISTRICT"
    sleep 1
    provision_airquality_device "$DISTRICT"
    sleep 1
done

echo ""
echo "=================================================="
echo "✅ All devices provisioned successfully!"
echo "=================================================="
echo ""
echo "📊 Summary:"
echo "  - Service Groups: 1"
echo "  - Weather Devices: 126"
echo "  - Air Quality Devices: 126"
echo "  - Total Devices: 252"
echo ""
echo "To verify, run: curl http://localhost:4041/iot/devices -H 'fiware-service: hanoi' -H 'fiware-servicepath: /'"
echo ""


