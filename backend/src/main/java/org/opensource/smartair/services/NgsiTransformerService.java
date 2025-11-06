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
package org.opensource.smartair.services;

import org.opensource.smartair.dtos.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Service to transform NGSI-LD normalized format to DTOs
 * Handles data conversion (integer to double) for numeric fields
 */
@Service
public class NgsiTransformerService {

    /**
     * Transform WeatherObserved entity to DTO
     * CRITICAL: Reverse conversion for temperature, windSpeed, precipitation
     */
    public WeatherDataDTO transformWeatherObserved(Map<String, Object> entity) {
        WeatherDataDTO data = WeatherDataDTO.builder()
                .entityId((String) entity.get("id"))
                .stationName(extractStringValue(entity, "stationName"))
                .stationCode(extractStringValue(entity, "stationCode"))
                .district(extractDistrictFromId((String) entity.get("id")))
                .observedAt(extractObservedAt(entity, "temperature"))
                .location(extractLocation(entity))

                // CRITICAL: Reverse conversion (divide by 10)
                .temperature(extractIntValue(entity, "temperature") / 10.0)
                .feelsLikeTemperature(extractIntValue(entity, "feelsLikeTemperature") / 10.0)
                .windSpeed(extractIntValue(entity, "windSpeed") / 10.0)
                .precipitation(extractIntValue(entity, "precipitation") / 10.0)

                // Humidity: can be 0-100 or 0-1 based on frontend need
                // Here we keep 0-1 for consistency
                .relativeHumidity(extractIntValue(entity, "relativeHumidity") / 100.0)

                // Integer values (no conversion)
                .atmosphericPressure(extractIntValue(entity, "atmosphericPressure"))
                .windDirection(extractIntValue(entity, "windDirection"))
                .visibility(extractIntValue(entity, "visibility"))
                .cloudiness(extractIntValue(entity, "cloudiness"))
                .illuminance(extractIntValue(entity, "illuminance"))
                .pressureTendency(extractIntValue(entity, "pressureTendency"))

                // Text values
                .weatherType(extractStringValue(entity, "weatherType"))
                .weatherDescription(extractStringValue(entity, "weatherDescription"))

                // Relationships
                .refDevice(extractRelationship(entity, "refDevice"))

                .build();

        return data;
    }

    /**
     * Transform AirQualityObserved entity to DTO
     */
    public AirQualityDataDTO transformAirQualityObserved(Map<String, Object> entity) {
        AirQualityDataDTO data = AirQualityDataDTO.builder()
                .entityId((String) entity.get("id"))
                .stationName(extractStringValue(entity, "stationName"))
                .stationCode(extractStringValue(entity, "stationCode"))
                .district(extractDistrictFromId((String) entity.get("id")))
                .observedAt(extractObservedAt(entity, "airQualityIndex"))
                .location(extractLocation(entity))

                // Air Quality Index
                .airQualityIndex(extractIntValue(entity, "airQualityIndex"))
                .airQualityLevel(extractStringValue(entity, "airQualityLevel"))

                // Pollutants (already double in NGSI-LD)
                .co(extractDoubleValue(entity, "CO"))
                .no(extractDoubleValue(entity, "NO"))
                .no2(extractDoubleValue(entity, "NO2"))
                .nox(extractDoubleValue(entity, "NOx"))
                .o3(extractDoubleValue(entity, "O3"))
                .so2(extractDoubleValue(entity, "SO2"))
                .pm2_5(extractDoubleValue(entity, "pm2_5"))
                .pm10(extractDoubleValue(entity, "pm10"))
                .nh3(extractDoubleValue(entity, "NH3"))

                // Levels
                .coLevel(extractStringValue(entity, "CO_Level"))
                .no2Level(extractStringValue(entity, "NO2_Level"))
                .o3Level(extractStringValue(entity, "O3_Level"))
                .so2Level(extractStringValue(entity, "SO2_Level"))
                .pm2_5Level(extractStringValue(entity, "pm2_5_Level"))
                .pm10Level(extractStringValue(entity, "pm10_Level"))

                // Metadata
                .reliability(extractDoubleValue(entity, "reliability"))

                // Optional weather data (with conversion if present)
                .temperature(entity.containsKey("temperature") ? extractIntValue(entity, "temperature") / 10.0 : null)
                .relativeHumidity(
                        entity.containsKey("relativeHumidity") ? extractIntValue(entity, "relativeHumidity") / 100.0
                                : null)
                .windSpeed(entity.containsKey("windSpeed") ? extractIntValue(entity, "windSpeed") / 10.0 : null)
                .windDirection(entity.containsKey("windDirection") ? extractIntValue(entity, "windDirection") : null)
                .precipitation(
                        entity.containsKey("precipitation") ? extractIntValue(entity, "precipitation") / 10.0 : null)

                // Relationships
                .refDevice(extractRelationship(entity, "refDevice"))
                .refPointOfInterest(extractRelationship(entity, "refPointOfInterest"))

                .build();

        return data;
    }

    /**
     * Transform Platform entity to DTO
     */
    public PlatformDataDTO transformPlatform(Map<String, Object> entity) {
        return PlatformDataDTO.builder()
                .entityId((String) entity.get("id"))
                .name(extractStringValue(entity, "name"))
                .description(extractStringValue(entity, "description"))
                .location(extractLocation(entity))
                .address(extractAddress(entity))
                .platformType(extractStringValue(entity, "platformType"))
                .monitoringCategories(extractArrayValue(entity, "monitoringCategories"))
                .status(extractStringValue(entity, "status"))
                .hosts(extractRelationshipArray(entity, "hosts"))
                .deploymentDate(extractStringValue(entity, "deploymentDate"))
                .owner(extractStringValue(entity, "owner"))
                .operator(extractStringValue(entity, "operator"))
                .purpose(extractStringValue(entity, "purpose"))
                .build();
    }

    /**
     * Transform Device entity to DTO
     */
    public DeviceDataDTO transformDevice(Map<String, Object> entity) {
        return DeviceDataDTO.builder()
                .entityId((String) entity.get("id"))
                .name(extractStringValue(entity, "name"))
                .description(extractStringValue(entity, "description"))
                .location(extractLocation(entity))
                .deviceCategory(extractArrayValue(entity, "deviceCategory"))
                .sensorType(extractStringValue(entity, "sensorType"))
                .controlledProperty(extractArrayValue(entity, "controlledProperty"))
                .observes(extractRelationshipArray(entity, "observes"))
                .isHostedBy(extractRelationship(entity, "isHostedBy"))
                .serialNumber(extractStringValue(entity, "serialNumber"))
                .hardwareVersion(extractStringValue(entity, "hardwareVersion"))
                .softwareVersion(extractStringValue(entity, "softwareVersion"))
                .firmwareVersion(extractStringValue(entity, "firmwareVersion"))
                .brandName(extractStringValue(entity, "brandName"))
                .modelName(extractStringValue(entity, "modelName"))
                .deviceState(extractStringValue(entity, "deviceState"))
                .dateInstalled(extractStringValue(entity, "dateInstalled"))
                .dateFirstUsed(extractStringValue(entity, "dateFirstUsed"))
                .dataProvider(extractStringValue(entity, "dataProvider"))
                .owner(extractStringValue(entity, "owner"))
                .build();
    }

    // ============ Helper Methods ============

    /**
     * Extract integer value from NGSI-LD Property
     */
    private Integer extractIntValue(Map<String, Object> entity, String attrName) {
        Map<String, Object> attr = (Map<String, Object>) entity.get(attrName);
        if (attr == null)
            return 0;
        Object value = attr.get("value");
        return value instanceof Number ? ((Number) value).intValue() : 0;
    }

    /**
     * Extract double value from NGSI-LD Property
     */
    private Double extractDoubleValue(Map<String, Object> entity, String attrName) {
        Map<String, Object> attr = (Map<String, Object>) entity.get(attrName);
        if (attr == null)
            return 0.0;
        Object value = attr.get("value");
        return value instanceof Number ? ((Number) value).doubleValue() : 0.0;
    }

    /**
     * Extract string value from NGSI-LD Property
     */
    private String extractStringValue(Map<String, Object> entity, String attrName) {
        Map<String, Object> attr = (Map<String, Object>) entity.get(attrName);
        if (attr == null)
            return null;
        Object value = attr.get("value");
        return value != null ? value.toString() : null;
    }

    /**
     * Extract observedAt timestamp from attribute
     */
    private String extractObservedAt(Map<String, Object> entity, String attrName) {
        Map<String, Object> attr = (Map<String, Object>) entity.get(attrName);
        return attr != null ? (String) attr.get("observedAt") : null;
    }

    /**
     * Extract Location from GeoProperty
     * Transform from {"type":"Point","coordinates":[lon,lat]} to {lat,lon}
     */
    private LocationDTO extractLocation(Map<String, Object> entity) {
        Map<String, Object> locationProp = (Map<String, Object>) entity.get("location");
        if (locationProp == null)
            return null;

        Map<String, Object> geoValue = (Map<String, Object>) locationProp.get("value");
        if (geoValue == null)
            return null;

        List<Double> coordinates = (List<Double>) geoValue.get("coordinates");
        if (coordinates == null || coordinates.size() < 2)
            return null;

        // GeoJSON format: [lon, lat]
        return LocationDTO.builder()
                .lon(coordinates.get(0))
                .lat(coordinates.get(1))
                .build();
    }

    /**
     * Extract Address from Property
     */
    private AddressDTO extractAddress(Map<String, Object> entity) {
        Map<String, Object> addressProp = (Map<String, Object>) entity.get("address");
        if (addressProp == null)
            return null;

        Map<String, Object> addressValue = (Map<String, Object>) addressProp.get("value");
        if (addressValue == null)
            return null;

        return AddressDTO.builder()
                .addressLocality((String) addressValue.get("addressLocality"))
                .addressRegion((String) addressValue.get("addressRegion"))
                .addressCountry((String) addressValue.get("addressCountry"))
                .type((String) addressValue.get("type"))
                .build();
    }

    /**
     * Extract Relationship (single URN)
     */
    private String extractRelationship(Map<String, Object> entity, String attrName) {
        Map<String, Object> rel = (Map<String, Object>) entity.get(attrName);
        if (rel == null)
            return null;
        return (String) rel.get("object");
    }

    /**
     * Extract Relationship array (multiple URNs)
     */
    private List<String> extractRelationshipArray(Map<String, Object> entity, String attrName) {
        Map<String, Object> rel = (Map<String, Object>) entity.get(attrName);
        if (rel == null)
            return null;
        Object object = rel.get("object");
        if (object instanceof List) {
            return (List<String>) object;
        }
        return null;
    }

    /**
     * Extract array value from Property
     */
    private List<String> extractArrayValue(Map<String, Object> entity, String attrName) {
        Map<String, Object> prop = (Map<String, Object>) entity.get(attrName);
        if (prop == null)
            return null;
        Object value = prop.get("value");
        if (value instanceof List) {
            return (List<String>) value;
        }
        return null;
    }

    /**
     * Extract district slug from entity ID
     * Pattern: urn:ngsi-ld:Type:Hanoi-{DistrictSlug}-timestamp
     * or: urn:ngsi-ld:Type:Sensor-{DistrictSlug}
     */
    public String extractDistrictFromId(String entityId) {
        if (entityId == null)
            return null;

        String[] parts = entityId.split(":");
        if (parts.length < 4)
            return null;

        String lastPart = parts[3]; // e.g., "Hanoi-PhuongHoanKiem-2025-11-05T..."

        // For observations: extract between "Hanoi-" and "-timestamp"
        if (lastPart.contains("Hanoi-")) {
            String[] subParts = lastPart.split("-");
            if (subParts.length >= 2) {
                return subParts[1]; // "PhuongHoanKiem"
            }
        }

        // For devices/platforms: extract after "Sensor-" or "Station-"
        if (lastPart.contains("Sensor-")) {
            return lastPart.substring(lastPart.indexOf("Sensor-") + 7);
        }
        if (lastPart.contains("Station-")) {
            return lastPart.substring(lastPart.indexOf("Station-") + 8);
        }

        return null;
    }
}
