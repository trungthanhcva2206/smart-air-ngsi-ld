# FIWARE Orion-LD - Real Sensor Device Entity Provisioning (Hoang Mai)
# This script creates SOSA/SSN compliant Device entities in Orion-LD for ESP32 sensors
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
 * @Copyright (C) 2025 CHK. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
#>
$ORION_URL = "http://localhost:1026"
$FIWARE_SERVICE = "hanoi"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "FIWARE Orion-LD - Real Sensor Device Provisioning (Hoang Mai)" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Orion-LD URL: $ORION_URL"
Write-Host "FIWARE Service: $FIWARE_SERVICE"
Write-Host "==================================================" -ForegroundColor Cyan

# Function to create Dust Sensor Device entity
function Create-DustSensorEntity {
    param(
        [string]$DeviceId,
        [string]$Name,
        [string]$Description,
        [string]$SerialNumber,
        [string]$Location,
        [double]$Latitude,
        [double]$Longitude
    )
    
    Write-Host "`nCreating Dust Sensor Device Entity: $DeviceId" -ForegroundColor Yellow
    
    $body = @{
        id = "urn:ngsi-ld:Device:$DeviceId"
        type = "Device"
        name = @{
            type = "Property"
            value = $Name
        }
        description = @{
            type = "Property"
            value = $Description
        }
        deviceCategory = @{
            type = "Property"
            value = ,@("sensor")
        }
        controlledProperty = @{
            type = "Property"
            value = ,@("PM2.5")
        }
        sensorType = @{
            type = "Property"
            value = "AirQualityMonitor"
        }
        observes = @{
            type = "Relationship"
            object = @("urn:ngsi-ld:ObservableProperty:ParticulateMatter2.5")
        }
        isHostedBy = @{
            type = "Relationship"
            object = "urn:ngsi-ld:Platform:EnvironmentStation-PhuongHoangMai"
        }
        serialNumber = @{
            type = "Property"
            value = $SerialNumber
        }
        hardwareVersion = @{
            type = "Property"
            value = "1.0"
        }
        softwareVersion = @{
            type = "Property"
            value = "1.0.0"
        }
        firmwareVersion = @{
            type = "Property"
            value = "1.0.0"
        }
        brandName = @{
            type = "Property"
            value = "Sharp"
        }
        modelName = @{
            type = "Property"
            value = "GP2Y1010AU0F Dust Sensor"
        }
        deviceState = @{
            type = "Property"
            value = "active"
        }
        dateInstalled = @{
            type = "Property"
            value = "2025-12-01T00:00:00Z"
        }
        dateFirstUsed = @{
            type = "Property"
            value = "2025-12-01T00:00:00Z"
        }
        dataProvider = @{
            type = "Property"
            value = "Hanoi Smart City Initiative"
        }
        owner = @{
            type = "Property"
            value = "Hanoi Department of Environment"
        }
        supportedProtocol = @{
            type = "Property"
            value = @("mqtt")
        }
        configuration = @{
            type = "Property"
            value = @{
                publishInterval = 300
            }
        }
        location = @{
            type = "GeoProperty"
            value = @{
                type = "Point"
                coordinates = @($Longitude, $Latitude)
            }
        }
        address = @{
            type = "Property"
            value = @{
                addressLocality = $Location
                addressRegion = "Hanoi"
                addressCountry = "VN"
                type = "PostalAddress"
            }
        }
        "@context" = @(
            "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
            "https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld"
        )
    } | ConvertTo-Json -Depth 10
    
    $headers = @{
        "Content-Type" = "application/ld+json"
        "fiware-service" = $FIWARE_SERVICE
        "fiware-servicepath" = "/"
    }
    
    try {
        Invoke-RestMethod -Uri "$ORION_URL/ngsi-ld/v1/entities" -Method POST -Body $body -Headers $headers
        Write-Host "Dust sensor device entity created: $DeviceId" -ForegroundColor Green
    } catch {
        Write-Host "Device entity may already exist or error: $_" -ForegroundColor Yellow
    }
}

# Function to create Weather Sensor Device entity
function Create-WeatherSensorEntity {
    param(
        [string]$DeviceId,
        [string]$Name,
        [string]$Description,
        [string]$SerialNumber,
        [string]$Location,
        [double]$Latitude,
        [double]$Longitude
    )
    
    Write-Host "`nCreating Weather Sensor Device Entity: $DeviceId" -ForegroundColor Yellow
    
    $body = @{
        id = "urn:ngsi-ld:Device:$DeviceId"
        type = "Device"
        name = @{
            type = "Property"
            value = $Name
        }
        description = @{
            type = "Property"
            value = $Description
        }
        deviceCategory = @{
            type = "Property"
            value = ,@("sensor")
        }
        controlledProperty = @{
            type = "Property"
            value = @("temperature", "relativeHumidity")
        }
        sensorType = @{
            type = "Property"
            value = "WeatherStation"
        }
        observes = @{
            type = "Relationship"
            object = @("urn:ngsi-ld:ObservableProperty:Temperature", "urn:ngsi-ld:ObservableProperty:RelativeHumidity")
        }
        isHostedBy = @{
            type = "Relationship"
            object = "urn:ngsi-ld:Platform:EnvironmentStation-PhuongHoangMai"
        }
        serialNumber = @{
            type = "Property"
            value = $SerialNumber
        }
        hardwareVersion = @{
            type = "Property"
            value = "1.0"
        }
        softwareVersion = @{
            type = "Property"
            value = "1.0.0"
        }
        firmwareVersion = @{
            type = "Property"
            value = "1.0.0"
        }
        brandName = @{
            type = "Property"
            value = "Aosong"
        }
        modelName = @{
            type = "Property"
            value = "DHT11 Temperature & Humidity Sensor"
        }
        deviceState = @{
            type = "Property"
            value = "active"
        }
        dateInstalled = @{
            type = "Property"
            value = "2025-12-01T00:00:00Z"
        }
        dateFirstUsed = @{
            type = "Property"
            value = "2025-12-01T00:00:00Z"
        }
        dataProvider = @{
            type = "Property"
            value = "Hanoi Smart City Initiative"
        }
        owner = @{
            type = "Property"
            value = "Hanoi Department of Environment"
        }
        supportedProtocol = @{
            type = "Property"
            value = @("mqtt")
        }
        configuration = @{
            type = "Property"
            value = @{
                publishInterval = 300
            }
        }
        location = @{
            type = "GeoProperty"
            value = @{
                type = "Point"
                coordinates = @($Longitude, $Latitude)
            }
        }
        address = @{
            type = "Property"
            value = @{
                addressLocality = $Location
                addressRegion = "Hanoi"
                addressCountry = "VN"
                type = "PostalAddress"
            }
        }
        "@context" = @(
            "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
            "https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld"
        )
    } | ConvertTo-Json -Depth 10
    
    $headers = @{
        "Content-Type" = "application/ld+json"
        "fiware-service" = $FIWARE_SERVICE
        "fiware-servicepath" = "/"
    }
    
    try {
        Invoke-RestMethod -Uri "$ORION_URL/ngsi-ld/v1/entities" -Method POST -Body $body -Headers $headers
        Write-Host "Weather sensor device entity created: $DeviceId" -ForegroundColor Green
    } catch {
        Write-Host "Device entity may already exist or error: $_" -ForegroundColor Yellow
    }
}

# Main provisioning
Write-Host "`nStep 1: Creating Real Sensor Device Entities (Hoang Mai)..." -ForegroundColor Cyan

# Tọa độ Hoàng Mai (ví dụ - bạn có thể thay đổi)
$LATITUDE = 20.9817
$LONGITUDE = 105.8516

# Create Dust Sensor Device
Create-DustSensorEntity `
    -DeviceId "real-dust-sensor-hoangmai-001" `
    -Name "ESP32 Dust Sensor - Hoang Mai District" `
    -Description "ESP32-DevKit-V1 with GP2Y1010AU0F optical dust sensor measuring PM2.5 particulate matter in Hoang Mai, Hanoi" `
    -SerialNumber "ESP32-HOANGMAI-DUST-001" `
    -Location "Phuong Hoang Mai" `
    -Latitude $LATITUDE `
    -Longitude $LONGITUDE

# Create Weather Sensor Device
Create-WeatherSensorEntity `
    -DeviceId "real-weather-sensor-hoangmai-001" `
    -Name "ESP32 Weather Sensor - Hoang Mai District" `
    -Description "ESP32-DevKit-V1 with DHT11 sensor measuring temperature and humidity in Hoang Mai, Hanoi" `
    -SerialNumber "ESP32-HOANGMAI-WEATHER-001" `
    -Location "Phuong Hoang Mai" `
    -Latitude $LATITUDE `
    -Longitude $LONGITUDE

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "Real sensor device entities provisioned successfully!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "`nSummary (Hoang Mai District):"
Write-Host ""
Write-Host "1. DUST SENSOR DEVICE:"
Write-Host "   - Device ID: real-dust-sensor-hoangmai-001"
Write-Host "   - Sensor Type: GP2Y1010AU0F (PM2.5)"
Write-Host ""
Write-Host "2. WEATHER SENSOR DEVICE:"
Write-Host "   - Device ID: real-weather-sensor-hoangmai-001"
Write-Host "   - Sensor Type: DHT11 (Temperature & Humidity)"
Write-Host ""
Write-Host "   - Location: Phuong Hoang Mai, Hanoi"
Write-Host "   - Coordinates: $LATITUDE N, $LONGITUDE E"
Write-Host ""
Write-Host "To verify:" -ForegroundColor Cyan
Write-Host "Invoke-RestMethod -Uri http://localhost:1026/ngsi-ld/v1/entities/urn:ngsi-ld:Device:real-dust-sensor-hoangmai-001 -Headers @{'fiware-service'='hanoi'; 'Accept'='application/ld+json'}" -ForegroundColor Cyan
Write-Host "Invoke-RestMethod -Uri http://localhost:1026/ngsi-ld/v1/entities/urn:ngsi-ld:Device:real-weather-sensor-hoangmai-001 -Headers @{'fiware-service'='hanoi'; 'Accept'='application/ld+json'}" -ForegroundColor Cyan
Write-Host ""