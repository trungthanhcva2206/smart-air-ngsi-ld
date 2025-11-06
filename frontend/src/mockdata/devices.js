/*
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
 * @Copyright (C) 2024 CHK. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
*/
export const devices = [
    {
        "@context": "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.8.jsonld",
        "id": "urn:ngsi-ld:Device:WeatherSensor-BaDinh",
        "type": "Device",
        "https://smartdatamodels.org/name": {
            "type": "Property",
            "value": "Weather Sensor - Ba Dinh"
        },
        "description": {
            "type": "Property",
            "value": "Multi-parameter weather sensor station in Ba Dinh, Hanoi"
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
                "coordinates": [105.8267, 21.0356]
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
            "object": "urn:ngsi-ld:Platform:MonitoringStation-BaDinh"
        },
        "serialNumber": {
            "type": "Property",
            "value": "WS-HN-BADINH-001"
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
    },
    {
        "@context": "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.8.jsonld",
        "id": "urn:ngsi-ld:Device:AirQualitySensor-BaDinh",
        "type": "Device",
        "https://smartdatamodels.org/name": {
            "type": "Property",
            "value": "Air Quality Sensor - Ba Dinh"
        },
        "description": {
            "type": "Property",
            "value": "Multi-pollutant air quality monitoring sensor in Ba Dinh, Hanoi"
        },
        "deviceCategory": {
            "type": "Property",
            "value": "sensor"
        },
        "controlledProperty": {
            "type": "Property",
            "value": [
                "CO",
                "NO",
                "NO2",
                "NOx",
                "O3",
                "SO2",
                "PM2.5",
                "PM10",
                "NH3",
                "airQualityIndex"
            ]
        },
        "location": {
            "type": "GeoProperty",
            "value": {
                "type": "Point",
                "coordinates": [105.8267, 21.0356]
            }
        },
        "sensorType": {
            "type": "Property",
            "value": "AirQualityMonitor"
        },
        "observes": {
            "type": "Relationship",
            "object": [
                "urn:ngsi-ld:ObservableProperty:CarbonMonoxide",
                "urn:ngsi-ld:ObservableProperty:NitricOxide",
                "urn:ngsi-ld:ObservableProperty:NitrogenDioxide",
                "urn:ngsi-ld:ObservableProperty:Ozone",
                "urn:ngsi-ld:ObservableProperty:SulfurDioxide",
                "urn:ngsi-ld:ObservableProperty:ParticulateMatter2.5",
                "urn:ngsi-ld:ObservableProperty:ParticulateMatter10",
                "urn:ngsi-ld:ObservableProperty:Ammonia",
                "urn:ngsi-ld:ObservableProperty:AirQualityIndex"
            ]
        },
        "isHostedBy": {
            "type": "Relationship",
            "object": "urn:ngsi-ld:Platform:MonitoringStation-BaDinh"
        },
        "serialNumber": {
            "type": "Property",
            "value": "AQ-HN-BADINH-001"
        },
        "hardwareVersion": {
            "type": "Property",
            "value": "3.0"
        },
        "softwareVersion": {
            "type": "Property",
            "value": "2.1.0"
        },
        "firmwareVersion": {
            "type": "Property",
            "value": "4.0.2"
        },
        "https://smartdatamodels.org/dataModel.Environment/brandName": {
            "type": "Property",
            "value": "OpenWeather"
        },
        "https://smartdatamodels.org/dataModel.Environment/modelName": {
            "type": "Property",
            "value": "Multi-Gas Air Quality Monitor"
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
];
