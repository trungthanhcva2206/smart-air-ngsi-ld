# FIWARE IoT Agent JSON - Real Sensor Device Provisioning
# This script provisions ESP32 dust sensor in IoT Agent for MQTT → NGSI-LD transformation
<# 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @Project smart-air-ngsi-ld
 * @Authors 
 *    - TT (trungthanhcva2206@gmail.com)
 *    - Tankchoi (tadzltv22082004@gmail.com)
 *    - Panh (panh812004.apn@gmail.com)
 * @Copyright (C) 2025 TAA. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
#>
$IOTA_URL = "http://localhost:4041"
$ORION_URL = "http://localhost:1026"
$FIWARE_SERVICE = "hanoi"
$API_KEY = "hanoi"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "FIWARE IoT Agent - Real Sensor Provisioning" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "IoT Agent URL: $IOTA_URL"
Write-Host "Orion-LD URL: $ORION_URL"
Write-Host "FIWARE Service: $FIWARE_SERVICE"
Write-Host "API Key: $API_KEY"
Write-Host "==================================================" -ForegroundColor Cyan

# Function to provision real dust sensor device
function Provision-RealDustSensor {
    param(
        [string]$DeviceId,
        [string]$EntityId,
        [string]$District
    )
    
    Write-Host "`nProvisioning Real Dust Sensor Device: $DeviceId -> $EntityId" -ForegroundColor Yellow
    
    $body = @{
        devices = @(
            @{
                device_id = $DeviceId
                entity_name = $EntityId
                entity_type = "airQualityObserved"
                timezone = "Asia/Ho_Chi_Minh"
                protocol = "IoTA-JSON"
                transport = "MQTT"
                apikey = $API_KEY
                attributes = @(
                    @{object_id = "pm2_5"; name = "pm2_5"; type = "Number"}
                    @{object_id = "name"; name = "name"; type = "Text"}
                    @{object_id = "description"; name = "description"; type = "Text"}
                    @{object_id = "stationName"; name = "stationName"; type = "Text"}
                    @{object_id = "stationCode"; name = "stationCode"; type = "Text"}
                    @{object_id = "dateObserved"; name = "dateObserved"; type = "DateTime"}
                    @{object_id = "refDevice"; name = "refDevice"; type = "Text"}
                    @{object_id = "latitude"; name = "latitude"; type = "Number"}
                    @{object_id = "longitude"; name = "longitude"; type = "Number"}
                )
                static_attributes = @(
                    @{name = "address"; type = "StructuredValue"; value = @{addressLocality = $District; addressRegion = "Hanoi"; addressCountry = "VN"; type = "PostalAddress"}}
                    @{name = "dataProvider"; type = "Text"; value = "ESP32 Real Sensor"}
                    @{name = "source"; type = "URL"; value = "urn:ngsi-ld:Device:real-dust-sensor-hadong-001"}
                )
            }
        )
    } | ConvertTo-Json -Depth 10
    
    $headers = @{
        "Content-Type" = "application/json"
        "fiware-service" = $FIWARE_SERVICE
        "fiware-servicepath" = "/"
    }
    
    try {
        Invoke-RestMethod -Uri "$IOTA_URL/iot/devices" -Method POST -Body $body -Headers $headers
        Write-Host "Real sensor device provisioned in IoT Agent: $DeviceId" -ForegroundColor Green
    } catch {
        Write-Host "Device may already exist or error: $_" -ForegroundColor Yellow
    }
}

# Main provisioning
Write-Host "`nStep 1: Provisioning ESP32 Dust Sensor in IoT Agent..." -ForegroundColor Cyan

Provision-RealDustSensor `
    -DeviceId "real-dust-sensor-hadong-001" `
    -EntityId "urn:ngsi-ld:AirQualityObserved:Hanoi-PhuongHaDong" `
    -District "Phuong Ha Dong"

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "Real sensor provisioned successfully in IoT Agent!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "`nSummary:"
Write-Host "  - Device ID: real-dust-sensor-hadong-001"
Write-Host "  - Entity ID: urn:ngsi-ld:AirQualityObserved:Hanoi-PhuongHaDong"
Write-Host "  - MQTT Topic: /hanoi/real-dust-sensor-hadong-001/attrs"
Write-Host "  - API Key: $API_KEY"
Write-Host "  - Measured Property: pm2_5 (PM2.5 from GP2Y1010AU0F)"
Write-Host ""
Write-Host "Data Fusion:"
Write-Host "  - ESP32 provides: pm2_5 (real sensor)"
Write-Host "  - ETL provides: CO, NO2, O3, SO2, pm10, temperature, humidity, windSpeed"
Write-Host "  - IoT Agent merges both into: urn:ngsi-ld:AirQualityObserved:Hanoi-PhuongHaDong"
Write-Host ""
Write-Host "To verify, run: Invoke-RestMethod -Uri http://localhost:4041/iot/devices -Headers @{'fiware-service'='hanoi'; 'fiware-servicepath'='/'}" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step: Update ESP32 code to publish to topic '/hanoi/real-dust-sensor-hadong-001/attrs'" -ForegroundColor Yellow
Write-Host ""
