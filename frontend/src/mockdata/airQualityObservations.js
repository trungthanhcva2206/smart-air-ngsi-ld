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
export const airQualityObservations = [
    {
        "@context": [
            "https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld",
            "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.8.jsonld"
        ],
        "id": "urn:ngsi-ld:AirQualityObserved:Hanoi-BaDinh-2025-11-03T18:07:11.745Z",
        "type": "airQualityObserved",
        "description": {
            "type": "Property",
            "value": "Air quality monitoring station in Ba Dinh, Hanoi"
        },
        "address": {
            "type": "Property",
            "value": {
                "addressLocality": "Ba Dinh",
                "addressRegion": "Hanoi",
                "addressCountry": "VN",
                "type": "PostalAddress"
            }
        },
        "airQualityIndex": {
            "type": "Property",
            "value": 2,
            "observedAt": "2025-11-03T18:07:11.745Z"
        },
        "airQualityLevel": {
            "type": "Property",
            "value": "fair",
            "observedAt": "2025-11-03T18:07:11.745Z"
        },
        "pm10": {
            "type": "Property",
            "value": 16.35,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "GQ"
        },
        "precipitation": {
            "type": "Property",
            "value": 0,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "MMT"
        },
        "refDevice": {
            "type": "Relationship",
            "object": "urn:ngsi-ld:Device:AirQualitySensor-BaDinh"
        },
        "refPointOfInterest": {
            "type": "Relationship",
            "object": "urn:ngsi-ld:PointOfInterest:Hanoi-BaDinh"
        },
        "relativeHumidity": {
            "type": "Property",
            "value": 0.88,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "C62"
        },
        "reliability": {
            "type": "Property",
            "value": 0.85,
            "observedAt": "2025-11-03T18:07:11.745Z"
        },
        "temperature": {
            "type": "Property",
            "value": 18,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "CEL"
        },
        "windDirection": {
            "type": "Property",
            "value": 350,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "DD"
        },
        "windSpeed": {
            "type": "Property",
            "value": 3.69,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "MTS"
        },
        "dataProvider": {
            "type": "Property",
            "value": "OpenWeather"
        },
        "dateObserved": {
            "type": "Property",
            "value": "2025-11-03T18:07:11.745Z"
        },
        "name": {
            "type": "Property",
            "value": "Air Quality Station Ba Dinh"
        },
        "source": {
            "type": "Property",
            "value": "https://openweathermap.org"
        },
        "CO": {
            "type": "Property",
            "value": 266.5,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "GP"
        },
        "CO_Level": {
            "type": "Property",
            "value": "good",
            "observedAt": "2025-11-03T18:07:11.745Z"
        },
        "NH3": {
            "type": "Property",
            "value": 0.55,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "GQ"
        },
        "NO": {
            "type": "Property",
            "value": 0,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "GQ"
        },
        "NO2": {
            "type": "Property",
            "value": 5.21,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "GQ"
        },
        "NOx": {
            "type": "Property",
            "value": 5.21,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "GQ"
        },
        "O3": {
            "type": "Property",
            "value": 32.2,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "GQ"
        },
        "SO2": {
            "type": "Property",
            "value": 1.56,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "GQ"
        },
        "pm2_5": {
            "type": "Property",
            "value": 15.42,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "GQ"
        },
        "stationCode": {
            "type": "Property",
            "value": "HN-AQ-BADINH"
        },
        "stationName": {
            "type": "Property",
            "value": "Ba Dinh"
        },
        "location": {
            "type": "GeoProperty",
            "value": {
                "type": "Point",
                "coordinates": [105.8267, 21.0356]
            }
        }
    }
];
