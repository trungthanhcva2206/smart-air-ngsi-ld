# FIWARE IoT Agent JSON - Real Sensor Device Provisioning (Hoang Mai District)
# This script provisions ESP32 sensors in IoT Agent for MQTT → NGSI-LD transformation

$IOTA_URL = "http://localhost:4041"
$ORION_URL = "http://localhost:1026"
$FIWARE_SERVICE = "hanoi"
$API_KEY = "hanoi"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "FIWARE IoT Agent - Real Sensor Provisioning (Hoang Mai)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "IoT Agent URL: $IOTA_URL"
Write-Host "Orion-LD URL: $ORION_URL"
Write-Host "FIWARE Service: $FIWARE_SERVICE"
Write-Host "API Key: $API_KEY"
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "`nStep 0: Creating Service Group (MQTT)..." -ForegroundColor Cyan

$serviceGroup = @{
    services = @(
        @{
            apikey = $API_KEY
            cbroker = "http://orion:1026"
            entity_type = "Device"
            resource = "/iot/json"
            protocol = "IoTA-JSON"
            transport = "MQTT"
            timezone = "Asia/Ho_Chi_Minh"
        }
    )
} | ConvertTo-Json -Depth 10

$sgHeaders = @{
    "Content-Type" = "application/json"
    "fiware-service" = $FIWARE_SERVICE
    "fiware-servicepath" = "/"
}

try {
    Invoke-RestMethod -Uri "$IOTA_URL/iot/services" `
        -Method POST `
        -Body $serviceGroup `
        -Headers $sgHeaders | Out-Null
    Write-Host "✅ Service Group created!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "⚠️ Service Group already exists (OK)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Failed to create Service Group: $_" -ForegroundColor Red
    }
}

# Function to provision real dust sensor device (PM2.5)
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
                    @{name = "dataProvider"; type = "Text"; value = "ESP32 Real Sensor - Dust"}
                    @{name = "source"; type = "URL"; value = "urn:ngsi-ld:Device:real-dust-sensor-hoangmai-001"}
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
        Write-Host "Real dust sensor device provisioned in IoT Agent: $DeviceId" -ForegroundColor Green
    } catch {
        Write-Host "Device may already exist or error: $_" -ForegroundColor Yellow
    }
}

# Function to provision real weather sensor device (Temperature & Humidity)
function Provision-RealWeatherSensor {
    param(
        [string]$DeviceId,
        [string]$EntityId,
        [string]$District
    )
    
    Write-Host "`nProvisioning Real Weather Sensor Device: $DeviceId -> $EntityId" -ForegroundColor Yellow
    
    $body = @{
        devices = @(
            @{
                device_id = $DeviceId
                entity_name = $EntityId
                entity_type = "weatherObserved"
                timezone = "Asia/Ho_Chi_Minh"
                protocol = "IoTA-JSON"
                transport = "MQTT"
                apikey = $API_KEY
                attributes = @(
                    @{object_id = "temperature"; name = "temperature"; type = "Number"}
                    @{object_id = "humidity"; name = "relativeHumidity"; type = "Number"}
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
                    @{name = "dataProvider"; type = "Text"; value = "ESP32 Real Sensor - DHT11"}
                    @{name = "source"; type = "URL"; value = "urn:ngsi-ld:Device:real-weather-sensor-hoangmai-001"}
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
        Write-Host "Real weather sensor device provisioned in IoT Agent: $DeviceId" -ForegroundColor Green
    } catch {
        Write-Host "Device may already exist or error: $_" -ForegroundColor Yellow
    }
}

# Main provisioning
Write-Host "`nStep 1: Provisioning ESP32 Sensors in IoT Agent (Hoang Mai)..." -ForegroundColor Cyan

# Provision Dust Sensor (PM2.5)
Provision-RealDustSensor `
    -DeviceId "real-dust-sensor-hoangmai-001" `
    -EntityId "urn:ngsi-ld:AirQualityObserved:Hanoi-PhuongHoangMai" `
    -District "Phuong Hoang Mai"

# Provision Weather Sensor (Temperature & Humidity)
Provision-RealWeatherSensor `
    -DeviceId "real-weather-sensor-hoangmai-001" `
    -EntityId "urn:ngsi-ld:WeatherObserved:Hanoi-PhuongHoangMai" `
    -District "Phuong Hoang Mai"



Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "Real sensors provisioned successfully in IoT Agent!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "`nSummary (Hoang Mai District):"
Write-Host ""
Write-Host "1. DUST SENSOR (PM2.5):"
Write-Host "   - Device ID: real-dust-sensor-hoangmai-001"
Write-Host "   - Entity ID: urn:ngsi-ld:AirQualityObserved:Hanoi-PhuongHoangMai"
Write-Host "   - MQTT Topic: /hanoi/real-dust-sensor-hoangmai-001/attrs"
Write-Host "   - Measured Property: pm2_5 (GP2Y1010AU0F)"
Write-Host ""
Write-Host "2. WEATHER SENSOR (DHT11):"
Write-Host "   - Device ID: real-weather-sensor-hoangmai-001"
Write-Host "   - Entity ID: urn:ngsi-ld:WeatherObserved:Hanoi-PhuongHoangMai"
Write-Host "   - MQTT Topic: /hanoi/real-weather-sensor-hoangmai-001/attrs"
Write-Host "   - Measured Properties: temperature, humidity"
Write-Host ""
Write-Host "API Key: $API_KEY"
Write-Host ""
Write-Host "To verify, run:" -ForegroundColor Cyan
Write-Host "Invoke-RestMethod -Uri http://localhost:4041/iot/devices -Headers @{'fiware-service'='hanoi'; 'fiware-servicepath'='/'}" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step: Update ESP32 code to publish to respective topics" -ForegroundColor Yellow
Write-Host ""