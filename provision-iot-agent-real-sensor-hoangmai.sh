#!/usr/bin/env bash
set -euo pipefail

IOTA_URL="${IOTA_URL:-http://localhost:4041}"
ORION_URL="${ORION_URL:-http://localhost:1026}"
FIWARE_SERVICE="${FIWARE_SERVICE:-hanoi}"
API_KEY="${API_KEY:-hanoi}"

echo "IoT Agent URL: $IOTA_URL"
echo "Orion URL: $ORION_URL"
echo "Fiware service: $FIWARE_SERVICE"
echo

# Create service group
service_group_json='{
  "services": [
    {
      "apikey": "'"${API_KEY}"'",
      "cbroker": "http://orion:1026",
      "entity_type": "Device",
      "resource": "/iot/json",
      "protocol": "IoTA-JSON",
      "transport": "MQTT",
      "timezone": "Asia/Ho_Chi_Minh"
    }
  ]
}'

echo "Creating IoT Agent Service Group..."
http_code=$(curl -s -o /tmp/iota_service_resp -w "%{http_code}" -X POST "$IOTA_URL/iot/services" \
  -H "Content-Type: application/json" \
  -H "fiware-service: $FIWARE_SERVICE" \
  -H "fiware-servicepath: /" \
  -d "$service_group_json" || true)

if [ "$http_code" = "201" ]; then
  echo "✅ Service Group created (201)."
elif [ "$http_code" = "409" ]; then
  echo "⚠️ Service Group already exists (409)."
else
  echo "❌ Service Group request returned HTTP $http_code"
  cat /tmp/iota_service_resp
fi

# Provision devices: Dust sensor
dust_device_json='{
  "devices": [
    {
      "device_id": "real-dust-sensor-hoangmai-001",
      "entity_name": "urn:ngsi-ld:AirQualityObserved:Hanoi-PhuongHoangMai",
      "entity_type": "airQualityObserved",
      "timezone": "Asia/Ho_Chi_Minh",
      "protocol": "IoTA-JSON",
      "transport": "MQTT",
      "apikey": "'"${API_KEY}"'",
      "attributes": [
        {"object_id":"pm2_5","name":"pm2_5","type":"Number"},
        {"object_id":"name","name":"name","type":"Text"},
        {"object_id":"description","name":"description","type":"Text"},
        {"object_id":"stationName","name":"stationName","type":"Text"},
        {"object_id":"stationCode","name":"stationCode","type":"Text"},
        {"object_id":"dateObserved","name":"dateObserved","type":"DateTime"},
        {"object_id":"refDevice","name":"refDevice","type":"Text"},
        {"object_id":"latitude","name":"latitude","type":"Number"},
        {"object_id":"longitude","name":"longitude","type":"Number"}
      ],
      "static_attributes": [
        {"name":"address","type":"StructuredValue","value":{"addressLocality":"Phuong Hoang Mai","addressRegion":"Hanoi","addressCountry":"VN","type":"PostalAddress"}},
        {"name":"dataProvider","type":"Text","value":"ESP32 Real Sensor - Dust"},
        {"name":"source","type":"URL","value":"urn:ngsi-ld:Device:real-dust-sensor-hoangmai-001"}
      ]
    }
  ]
}'

echo
echo "Provisioning dust sensor device in IoT Agent..."
http_code=$(curl -s -o /tmp/iota_device_resp -w "%{http_code}" -X POST "$IOTA_URL/iot/devices" \
  -H "Content-Type: application/json" \
  -H "fiware-service: $FIWARE_SERVICE" \
  -H "fiware-servicepath: /" \
  -d "$dust_device_json" || true)

if [ "$http_code" = "201" ]; then
  echo "✅ Dust device provisioned (201)."
elif [ "$http_code" = "409" ]; then
  echo "⚠️ Dust device already exists (409)."
else
  echo "❌ Dust device request returned HTTP $http_code"
  cat /tmp/iota_device_resp
fi

# Provision devices: Weather sensor
weather_device_json='{
  "devices": [
    {
      "device_id": "real-weather-sensor-hoangmai-001",
      "entity_name": "urn:ngsi-ld:WeatherObserved:Hanoi-PhuongHoangMai",
      "entity_type": "weatherObserved",
      "timezone": "Asia/Ho_Chi_Minh",
      "protocol": "IoTA-JSON",
      "transport": "MQTT",
      "apikey": "'"${API_KEY}"'",
      "attributes": [
        {"object_id":"temperature","name":"temperature","type":"Number"},
        {"object_id":"humidity","name":"relativeHumidity","type":"Number"},
        {"object_id":"name","name":"name","type":"Text"},
        {"object_id":"description","name":"description","type":"Text"},
        {"object_id":"stationName","name":"stationName","type":"Text"},
        {"object_id":"stationCode","name":"stationCode","type":"Text"},
        {"object_id":"dateObserved","name":"dateObserved","type":"DateTime"},
        {"object_id":"refDevice","name":"refDevice","type":"Text"},
        {"object_id":"latitude","name":"latitude","type":"Number"},
        {"object_id":"longitude","name":"longitude","type":"Number"}
      ],
      "static_attributes": [
        {"name":"address","type":"StructuredValue","value":{"addressLocality":"Phuong Hoang Mai","addressRegion":"Hanoi","addressCountry":"VN","type":"PostalAddress"}},
        {"name":"dataProvider","type":"Text","value":"ESP32 Real Sensor - DHT11"},
        {"name":"source","type":"URL","value":"urn:ngsi-ld:Device:real-weather-sensor-hoangmai-001"}
      ]
    }
  ]
}'

echo
echo "Provisioning weather sensor device in IoT Agent..."
http_code=$(curl -s -o /tmp/iota_device_resp2 -w "%{http_code}" -X POST "$IOTA_URL/iot/devices" \
  -H "Content-Type: application/json" \
  -H "fiware-service: $FIWARE_SERVICE" \
  -H "fiware-servicepath: /" \
  -d "$weather_device_json" || true)

if [ "$http_code" = "201" ]; then
  echo "✅ Weather device provisioned (201)."
elif [ "$http_code" = "409" ]; then
  echo "⚠️ Weather device already exists (409)."
else
  echo "❌ Weather device request returned HTTP $http_code"
  cat /tmp/iota_device_resp2
fi

echo
echo "Done."
