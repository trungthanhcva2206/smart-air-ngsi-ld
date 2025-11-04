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
export const weatherObservations = [
    {
        "@context": [
            "https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld",
            "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.8.jsonld"
        ],
        "id": "urn:ngsi-ld:WeatherObserved:Hanoi-BaDinh-2025-11-03T18:07:11.745Z",
        "type": "weatherObserved",
        "description": {
            "type": "Property",
            "value": "Weather observation station in Ba Dinh, Hanoi"
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
        "atmosphericPressure": {
            "type": "Property",
            "value": 1018,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "HPA"
        },
        "feelsLikeTemperature": {
            "type": "Property",
            "value": 18.1,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "CEL"
        },
        "illuminance": {
            "type": "Property",
            "value": 50000,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "LUX"
        },
        "precipitation": {
            "type": "Property",
            "value": 0,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "MMT"
        },
        "refDevice": {
            "type": "Relationship",
            "object": "urn:ngsi-ld:Device:WeatherSensor-BaDinh"
        },
        "relativeHumidity": {
            "type": "Property",
            "value": 0.88,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "C62"
        },
        "temperature": {
            "type": "Property",
            "value": 18,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "CEL"
        },
        "visibility": {
            "type": "Property",
            "value": 10000,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "MTR"
        },
        "weatherType": {
            "type": "Property",
            "value": "Clouds",
            "observedAt": "2025-11-03T18:07:11.745Z"
        },
        "windDirection": {
            "type": "Property",
            "value": 350,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "DD"
        },
        "windSpeed": {
            "type": "Property",
            "value": 3.7,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "MTS"
        },
        "dataProvider": {
            "type": "Property",
            "value": "OpenWeather"
        },
        "dateObserved": {
            "type": "Property",
            "value": {
                "@type": "DateTime",
                "@value": "2025-11-03T18:07:11.745Z"
            }
        },
        "name": {
            "type": "Property",
            "value": "Weather Station Ba Dinh"
        },
        "source": {
            "type": "Property",
            "value": "https://openweathermap.org"
        },
        "cloudiness": {
            "type": "Property",
            "value": 1,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "C62"
        },
        "pressureTendency": {
            "type": "Property",
            "value": 0,
            "observedAt": "2025-11-03T18:07:11.745Z",
            "unitCode": "A97"
        },
        "stationCode": {
            "type": "Property",
            "value": "HN-BADINH"
        },
        "stationName": {
            "type": "Property",
            "value": "Ba Dinh"
        },
        "weatherDescription": {
            "type": "Property",
            "value": "overcast clouds",
            "observedAt": "2025-11-03T18:07:11.745Z"
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
