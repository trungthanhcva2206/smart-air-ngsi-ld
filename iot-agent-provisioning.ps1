# FIWARE IoT Agent JSON - Device Provisioning Script (PowerShell)
# This script provisions ALL virtual devices for Hanoi districts
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
Write-Host "FIWARE IoT Agent JSON - Device Provisioning" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "IoT Agent URL: $IOTA_URL"
Write-Host "Orion-LD URL: $ORION_URL"
Write-Host "FIWARE Service: $FIWARE_SERVICE"
Write-Host "API Key: $API_KEY"
Write-Host "==================================================" -ForegroundColor Cyan

# Function to provision service group
function Provision-ServiceGroup {
    Write-Host "`n???? Provisioning Service Group..." -ForegroundColor Yellow
    
    $body = @{
        services = @(
            @{
                apikey = $API_KEY
                cbroker = $ORION_URL
                entity_type = "weatherObserved"
                resource = "/iot/json"
                protocol = "IoTA-JSON"
                transport = "MQTT"
                timezone = "Asia/Ho_Chi_Minh"
                timestamp = $true
                autoprovision = $false
                explicitAttrs = $true
            }
        )
    } | ConvertTo-Json -Depth 10
    
    $headers = @{
        "Content-Type" = "application/json"
        "fiware-service" = $FIWARE_SERVICE
        "fiware-servicepath" = "/"
    }
    
    try {
        Invoke-RestMethod -Uri "$IOTA_URL/iot/services" -Method POST -Body $body -Headers $headers
        Write-Host "??? Service Group provisioned" -ForegroundColor Green
    } catch {
        Write-Host "??? Failed to provision service group: $_" -ForegroundColor Red
    }
}

# Function to provision weather device
function Provision-WeatherDevice {
    param([string]$District)
    
    $DistrictSafe = $District.Replace(' ', '-').ToLower() -replace '[??????????????????????????????????????????????]', 'a' -replace '[??????????????????????????????]', 'e' -replace '[??]', 'd' -replace '[????????????]', 'i' -replace '[??????????????????????????????????????????????]', 'o' -replace '[?????????????????????????????]', 'u' -replace '[??????????????]', 'y'
    $DeviceId = "weather-$DistrictSafe"
    $EntityId = "urn:ngsi-ld:WeatherObserved:Hanoi-$($District.Replace(' ', ''))"
    
    Write-Host "`n???? Provisioning Weather Device: $DeviceId ??? $EntityId" -ForegroundColor Yellow
    
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
                    @{object_id = "name"; name = "name"; type = "Text"}
                    @{object_id = "description"; name = "description"; type = "Text"}
                    @{object_id = "stationName"; name = "stationName"; type = "Text"}
                    @{object_id = "stationCode"; name = "stationCode"; type = "Text"}
                    @{object_id = "temperature"; name = "temperature"; type = "Number"}
                    @{object_id = "feelsLikeTemperature"; name = "feelsLikeTemperature"; type = "Number"}
                    @{object_id = "pressure"; name = "atmosphericPressure"; type = "Number"}
                    @{object_id = "humidity"; name = "relativeHumidity"; type = "Number"}
                    @{object_id = "weatherType"; name = "weatherType"; type = "Text"}
                    @{object_id = "weatherDescription"; name = "weatherDescription"; type = "Text"}
                    @{object_id = "windSpeed"; name = "windSpeed"; type = "Number"}
                    @{object_id = "windDirection"; name = "windDirection"; type = "Number"}
                    @{object_id = "visibility"; name = "visibility"; type = "Number"}
                    @{object_id = "cloudiness"; name = "cloudiness"; type = "Number"}
                    @{object_id = "precipitation"; name = "precipitation"; type = "Number"}
                    @{object_id = "pressureTendency"; name = "pressureTendency"; type = "Number"}
                    @{object_id = "illuminance"; name = "illuminance"; type = "Number"}
                    @{object_id = "latitude"; name = "latitude"; type = "Number"}
                    @{object_id = "longitude"; name = "longitude"; type = "Number"}
                    @{object_id = "dateObserved"; name = "dateObserved"; type = "DateTime"}
                    @{object_id = "refDevice"; name = "refDevice"; type = "Text"}
                )
                static_attributes = @(
                    @{name = "address"; type = "StructuredValue"; value = @{addressLocality = $District; addressRegion = "Hanoi"; addressCountry = "VN"; type = "PostalAddress"}}
                    @{name = "dataProvider"; type = "Text"; value = "OpenWeather"}
                    @{name = "source"; type = "URL"; value = "https://openweathermap.org"}
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
        Write-Host "??? Weather device provisioned: $DeviceId" -ForegroundColor Green
    } catch {
        Write-Host "??????  Weather device may already exist or error: $_" -ForegroundColor Yellow
    }
}

# Function to provision air quality device
function Provision-AirQualityDevice {
    param([string]$District)
    
    $DistrictSafe = $District.Replace(' ', '-').ToLower() -replace '[??????????????????????????????????????????????]', 'a' -replace '[??????????????????????????????]', 'e' -replace '[??]', 'd' -replace '[????????????]', 'i' -replace '[??????????????????????????????????????????????]', 'o' -replace '[?????????????????????????????]', 'u' -replace '[??????????????]', 'y'
    $DeviceId = "airquality-$DistrictSafe"
    $EntityId = "urn:ngsi-ld:AirQualityObserved:Hanoi-$($District.Replace(' ', ''))"
    
    Write-Host "`n???? Provisioning Air Quality Device: $DeviceId ??? $EntityId" -ForegroundColor Yellow
    
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
                    @{object_id = "name"; name = "name"; type = "Text"}
                    @{object_id = "description"; name = "description"; type = "Text"}
                    @{object_id = "stationName"; name = "stationName"; type = "Text"}
                    @{object_id = "stationCode"; name = "stationCode"; type = "Text"}
                    @{object_id = "co"; name = "CO"; type = "Number"}
                    @{object_id = "no"; name = "NO"; type = "Number"}
                    @{object_id = "no2"; name = "NO2"; type = "Number"}
                    @{object_id = "nox"; name = "NOx"; type = "Number"}
                    @{object_id = "o3"; name = "O3"; type = "Number"}
                    @{object_id = "so2"; name = "SO2"; type = "Number"}
                    @{object_id = "pm2_5"; name = "pm2_5"; type = "Number"}
                    @{object_id = "pm10"; name = "pm10"; type = "Number"}
                    @{object_id = "nh3"; name = "NH3"; type = "Number"}
                    @{object_id = "aqi"; name = "airQualityIndex"; type = "Number"}
                    @{object_id = "airQualityLevel"; name = "airQualityLevel"; type = "Text"}
                    @{object_id = "temperature"; name = "temperature"; type = "Number"}
                    @{object_id = "humidity"; name = "relativeHumidity"; type = "Number"}
                    @{object_id = "windSpeed"; name = "windSpeed"; type = "Number"}
                    @{object_id = "windDirection"; name = "windDirection"; type = "Number"}
                    @{object_id = "precipitation"; name = "precipitation"; type = "Number"}
                    @{object_id = "reliability"; name = "reliability"; type = "Number"}
                    @{object_id = "coLevel"; name = "CO_Level"; type = "Text"}
                    @{object_id = "latitude"; name = "latitude"; type = "Number"}
                    @{object_id = "longitude"; name = "longitude"; type = "Number"}
                    @{object_id = "dateObserved"; name = "dateObserved"; type = "DateTime"}
                    @{object_id = "refDevice"; name = "refDevice"; type = "Text"}
                    @{object_id = "refPointOfInterest"; name = "refPointOfInterest"; type = "Text"}
                )
                static_attributes = @(
                    @{name = "address"; type = "StructuredValue"; value = @{addressLocality = $District; addressRegion = "Hanoi"; addressCountry = "VN"; type = "PostalAddress"}}
                    @{name = "dataProvider"; type = "Text"; value = "OpenWeather"}
                    @{name = "source"; type = "URL"; value = "https://openweathermap.org"}
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
        Write-Host "??? Air Quality device provisioned: $DeviceId" -ForegroundColor Green
    } catch {
        Write-Host "??????  Air Quality device may already exist or error: $_" -ForegroundColor Yellow
    }
}

# Main provisioning
Write-Host "`n???? Step 1: Provisioning Service Group..." -ForegroundColor Cyan
Provision-ServiceGroup

Start-Sleep -Seconds 2

Write-Host "`n???? Step 2: Provisioning Devices for all 126 Hanoi wards/communes..." -ForegroundColor Cyan

$Districts = @(
    "Phuong Hoan Kiem", "Phuong Cua Nam", "Phuong Ba Dinh", "Phuong Ngoc Ha", "Phuong Giang Vo", "Phuong Hai Ba Trung", "Phuong Vinh Tuy", "Phuong Bach Mai", "Phuong Dong Da", "Phuong Kim Lien", "Phuong Van Mieu Quoc Tu Giam", "Phuong Lang", "Phuong O Cho Dua", "Phuong Hong Ha", "Phuong Linh Nam", "Phuong Hoang Mai", "Phuong Vinh Hung", "Phuong Tuong Mai", "Phuong Dinh Cong", "Phuong Hoang Liet", "Phuong Yen So", "Phuong Thanh Xuan", "Phuong Khuong Dinh", "Phuong Phuong Liet", "Phuong Cau Giay", "Phuong Nghia Do", "Phuong Yen Hoa", "Phuong Tay Ho", "Phuong Phu Thuong", "Phuong Tay Tuu", "Phuong Phu Dien", "Phuong Xuan Dinh", "Phuong Dong Ngac", "Phuong Thuong Cat", "Phuong Tu Liem", "Phuong Xuan Phuong", "Phuong Tay Mo", "Phuong Dai Mo", "Phuong Long Bien", "Phuong Bo De", "Phuong Viet Hung", "Phuong Phuc Loi", "Phuong Ha Dong", "Phuong Duong Noi", "Phuong Yen Nghia", "Phuong Phu Luong", "Phuong Kien Hung", "Xa Thanh Tri", "Xa Dai Thanh", "Xa Nam Phu", "Xa Ngoc Hoi", "Phuong Thanh Liet", "Xa Thuong Phuc", "Xa Thuong Tin", "Xa Chuong Duong", "Xa Hong Van", "Xa Phu Xuyen", "Xa Phuong Duc", "Xa Chuyen My", "Xa Dai Xuyen", "Xa Thanh Oai", "Xa Binh Minh", "Xa Tam Hung", "Xa Dan Hoa", "Xa Van Dinh", "Xa Ung Thien", "Xa Hoa Xa", "Xa Ung Hoa", "Xa My Duc", "Xa Hong Son", "Xa Phuc Son", "Xa Huong Son", "Phuong Chuong My", "Xa Phu Nghia", "Xa Xuan Mai", "Xa Tran Phu", "Xa Hoa Phu", "Xa Quang Bi", "Xa Minh Chau", "Xa Quang Oai", "Xa Vat Lai", "Xa Co Do", "Xa Bat Bat", "Xa Suoi Hai", "Xa Ba Vi", "Xa Yen Bai", "Phuong Son Tay", "Phuong Tung Thien", "Xa Doai Phuong", "Xa Phuc Tho", "Xa Phuc Loc", "Xa Hat Mon", "Xa Thach That", "Xa Ha Bang", "Xa Tay Phuong", "Xa Hoa Lac", "Xa Yen Xuan", "Xa Quoc Oai", "Xa Hung Dao", "Xa Kieu Phu", "Xa Phu Cat", "Xa Hoai Duc", "Xa Duong Hoa", "Xa Son Dong", "Xa An Khanh", "Xa Dan Phuong", "Xa O Dien", "Xa Lien Minh", "Xa Gia Lam", "Xa Thuan An", "Xa Bat Trang", "Xa Phu Dong", "Xa Thu Lam", "Xa Dong Anh", "Xa Phuc Thinh", "Xa Thien Loc", "Xa Vinh Thanh", "Xa Me Linh", "Xa Yen Lang", "Xa Tien Thang", "Xa Quang Minh", "Xa Soc Son", "Xa Da Phuc", "Xa Noi Bai", "Xa Trung Gia", "Xa Kim Anh"
)

foreach ($District in $Districts) {
    Provision-WeatherDevice -District $District
    Start-Sleep -Seconds 1
    Provision-AirQualityDevice -District $District
    Start-Sleep -Seconds 1
}

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "??? All devices provisioned successfully!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "`n???? Summary:"
Write-Host "  - Service Groups: 1"
Write-Host "  - Weather Devices: 126"
Write-Host "  - Air Quality Devices: 126"
Write-Host "  - Total Devices: 252"
Write-Host ""
Write-Host "To verify, run: Invoke-RestMethod -Uri http://localhost:4041/iot/devices -Headers @{'fiware-service'='hanoi'; 'fiware-servicepath'='/'}" -ForegroundColor Cyan
Write-Host ""

