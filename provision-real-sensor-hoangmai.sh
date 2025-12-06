#!/usr/bin/env bash
set -euo pipefail

ORION_URL="${ORION_URL:-http://localhost:1026}"
FIWARE_SERVICE="${FIWARE_SERVICE:-hanoi}"

echo "Orion URL: $ORION_URL"
echo "Fiware service: $FIWARE_SERVICE"
echo

# Dust entity payload (explicit, validated)
dust_entity='{
  "id": "urn:ngsi-ld:Device:real-dust-sensor-hoangmai-001",
  "type": "Device",
  "name": { "type": "Property", "value": "ESP32 Dust Sensor - Hoang Mai District" },
  "description": { "type": "Property", "value": "ESP32-DevKit-V1 with GP2Y1010AU0F optical dust sensor" },
  "deviceCategory": { "type": "Property", "value": ["sensor"] },
  "controlledProperty": { "type": "Property", "value": ["PM2.5"] },
  "sensorType": { "type": "Property", "value": "AirQualityMonitor" },
  "observes": { "type": "Relationship", "object": ["urn:ngsi-ld:ObservableProperty:ParticulateMatter2.5"] },
  "isHostedBy": { "type": "Relationship", "object": "urn:ngsi-ld:Platform:EnvironmentStation-PhuongHoangMai" },
  "serialNumber": { "type": "Property", "value": "ESP32-HOANGMAI-DUST-001" },
  "hardwareVersion": { "type": "Property", "value": "1.0" },
  "softwareVersion": { "type": "Property", "value": "1.0.0" },
  "firmwareVersion": { "type": "Property", "value": "1.0.0" },
  "brandName": { "type": "Property", "value": "Sharp" },
  "modelName": { "type": "Property", "value": "GP2Y1010AU0F Dust Sensor" },
  "deviceState": { "type": "Property", "value": "active" },
  "dateInstalled": { "type": "Property", "value": "2025-12-01T00:00:00Z" },
  "dateFirstUsed": { "type": "Property", "value": "2025-12-01T00:00:00Z" },
  "dataProvider": { "type": "Property", "value": "Hanoi Smart City Initiative" },
  "owner": { "type": "Property", "value": "Hanoi Department of Environment" },
  "supportedProtocol": { "type": "Property", "value": ["mqtt"] },
  "configuration": { "type": "Property", "value": { "publishInterval": 300 } },
  "location": { "type": "GeoProperty", "value": { "type": "Point", "coordinates": [105.8516, 20.9817] } },
  "address": { "type": "Property", "value": { "addressLocality": "Phuong Hoang Mai", "addressRegion": "Hanoi", "addressCountry": "VN", "type": "PostalAddress" } },
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld"
  ]
}'

# Weather entity payload (explicit)
weather_entity='{
  "id": "urn:ngsi-ld:Device:real-weather-sensor-hoangmai-001",
  "type": "Device",
  "name": { "type": "Property", "value": "ESP32 Weather Sensor - Hoang Mai District" },
  "description": { "type": "Property", "value": "ESP32-DevKit-V1 with DHT11 sensor measuring temperature and humidity" },
  "deviceCategory": { "type": "Property", "value": ["sensor"] },
  "controlledProperty": { "type": "Property", "value": ["temperature","relativeHumidity"] },
  "sensorType": { "type": "Property", "value": "WeatherStation" },
  "observes": { "type": "Relationship", "object": ["urn:ngsi-ld:ObservableProperty:Temperature","urn:ngsi-ld:ObservableProperty:RelativeHumidity"] },
  "isHostedBy": { "type": "Relationship", "object": "urn:ngsi-ld:Platform:EnvironmentStation-PhuongHoangMai" },
  "serialNumber": { "type": "Property", "value": "ESP32-HOANGMAI-WEATHER-001" },
  "hardwareVersion": { "type": "Property", "value": "1.0" },
  "softwareVersion": { "type": "Property", "value": "1.0.0" },
  "firmwareVersion": { "type": "Property", "value": "1.0.0" },
  "brandName": { "type": "Property", "value": "Aosong" },
  "modelName": { "type": "Property", "value": "DHT11 Temperature & Humidity Sensor" },
  "deviceState": { "type": "Property", "value": "active" },
  "dateInstalled": { "type": "Property", "value": "2025-12-01T00:00:00Z" },
  "dateFirstUsed": { "type": "Property", "value": "2025-12-01T00:00:00Z" },
  "dataProvider": { "type": "Property", "value": "Hanoi Smart City Initiative" },
  "owner": { "type": "Property", "value": "Hanoi Department of Environment" },
  "supportedProtocol": { "type": "Property", "value": ["mqtt"] },
  "configuration": { "type": "Property", "value": { "publishInterval": 300 } },
  "location": { "type": "GeoProperty", "value": { "type": "Point", "coordinates": [105.8516, 20.9817] } },
  "address": { "type": "Property", "value": { "addressLocality": "Phuong Hoang Mai", "addressRegion": "Hanoi", "addressCountry": "VN", "type": "PostalAddress" } },
  "@context": [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld"
  ]
}'

post_entity() {
  local payload="$1"
  local tmp_resp
  tmp_resp=$(mktemp)
  http_code=$(curl -s -o "$tmp_resp" -w "%{http_code}" -X POST "$ORION_URL/ngsi-ld/v1/entities" \
    -H "Content-Type: application/ld+json" \
    -H "fiware-service: $FIWARE_SERVICE" \
    --data-binary "$payload" || true)

  if [ "$http_code" = "201" ]; then
    echo "✅ Entity created (201)."
  elif [ "$http_code" = "409" ]; then
    echo "⚠️ Entity already exists (409)."
  else
    echo "❌ Entity POST returned HTTP $http_code"
    cat "$tmp_resp"
  fi
  rm -f "$tmp_resp"
}

echo "Creating dust device entity in Orion-LD..."
post_entity "$dust_entity"

echo
echo "Creating weather device entity in Orion-LD..."
post_entity "$weather_entity"

echo
echo "Done."
