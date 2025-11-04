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
export const platforms = [
    {
        "@context": "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.8.jsonld",
        "id": "urn:ngsi-ld:Platform:MonitoringStation-BaDinh",
        "type": "Platform",
        "https://smartdatamodels.org/name": {
            "type": "Property",
            "value": "Environmental Monitoring Platform - Ba Dinh"
        },
        "description": {
            "type": "Property",
            "value": "Combined weather and air quality monitoring platform in Ba Dinh, Hanoi"
        },
        "location": {
            "type": "GeoProperty",
            "value": {
                "type": "Point",
                "coordinates": [105.8267, 21.0356]
            }
        },
        "https://smartdatamodels.org/address": {
            "type": "Property",
            "value": {
                "addressLocality": "Ba Dinh",
                "addressRegion": "Hanoi",
                "addressCountry": "VN",
                "type": "PostalAddress"
            }
        },
        "hosts": {
            "type": "Relationship",
            "object": [
                "urn:ngsi-ld:Device:WeatherSensor-BaDinh",
                "urn:ngsi-ld:Device:AirQualitySensor-BaDinh"
            ]
        },
        "platformType": {
            "type": "Property",
            "value": "EnvironmentalMonitoringStation"
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
];
