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
* @Copyright (C) 2025 CHK. All rights reserved
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
     * NO conversion needed - ETL sends float values directly
     * Only handle 0.001 → 0 for precipitation and pressureTendency
     */
    public WeatherDataDTO transformWeatherObserved(Map<String, Object> entity) {
        // Extract values directly (already float/double from ETL)
        double temperature = extractDoubleValue(entity, "temperature");
        double feelsLikeTemperature = extractDoubleValue(entity, "feelsLikeTemperature");
        double windSpeed = extractDoubleValue(entity, "windSpeed");
        double precipitation = extractDoubleValue(entity, "precipitation");
        double pressureTendency = extractDoubleValue(entity, "pressureTendency");

        // Handle 0.001 → 0 for user display
        if (precipitation <= 0.001)
            precipitation = 0.0;
        if (pressureTendency <= 0.001)
            pressureTendency = 0.0;

        WeatherDataDTO data = WeatherDataDTO.builder()
                .entityId((String) entity.get("id"))
                .stationName(extractStringValue(entity, "stationName"))
                .stationCode(extractStringValue(entity, "stationCode"))
                .district(extractDistrictFromId((String) entity.get("id")))
                .observedAt(extractObservedAt(entity, "temperature"))
                .location(extractLocation(entity))

                // Float values - use directly (no conversion)
                .temperature(temperature)
                .feelsLikeTemperature(feelsLikeTemperature)
                .windSpeed(windSpeed)
                .precipitation(precipitation)
                .pressureTendency(pressureTendency)

                // Humidity: already 0-100 integer, convert to 0-1 for consistency
                .relativeHumidity(extractIntValue(entity, "relativeHumidity") / 100.0)

                // Integer values (no conversion)
                .atmosphericPressure(extractIntValue(entity, "atmosphericPressure"))
                .windDirection(extractIntValue(entity, "windDirection"))
                .visibility(extractIntValue(entity, "visibility"))
                .cloudiness(extractIntValue(entity, "cloudiness"))
                .illuminance(extractIntValue(entity, "illuminance"))

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
     * NO conversion needed - ETL sends float values directly
     * Only handle 0.001 → 0 for pollutants
     */
    public AirQualityDataDTO transformAirQualityObserved(Map<String, Object> entity) {
        // Extract pollutants (already double from ETL)
        double co = extractDoubleValue(entity, "CO");
        double no = extractDoubleValue(entity, "NO");
        double no2 = extractDoubleValue(entity, "NO2");
        double nox = extractDoubleValue(entity, "NOx");
        double o3 = extractDoubleValue(entity, "O3");
        double so2 = extractDoubleValue(entity, "SO2");
        double pm2_5 = extractDoubleValue(entity, "pm2_5");
        double pm10 = extractDoubleValue(entity, "pm10");
        double nh3 = extractDoubleValue(entity, "NH3");

        // Handle 0.001 → 0 for user display
        if (co <= 0.001)
            co = 0.0;
        if (no <= 0.001)
            no = 0.0;
        if (no2 <= 0.001)
            no2 = 0.0;
        if (nox <= 0.001)
            nox = 0.0;
        if (o3 <= 0.001)
            o3 = 0.0;
        if (so2 <= 0.001)
            so2 = 0.0;
        if (pm2_5 <= 0.001)
            pm2_5 = 0.0;
        if (pm10 <= 0.001)
            pm10 = 0.0;
        if (nh3 <= 0.001)
            nh3 = 0.0;

        // Optional weather data
        Double temperature = entity.containsKey("temperature") ? extractDoubleValue(entity, "temperature") : null;
        Double windSpeed = entity.containsKey("windSpeed") ? extractDoubleValue(entity, "windSpeed") : null;
        Double precipitation = entity.containsKey("precipitation") ? extractDoubleValue(entity, "precipitation") : null;

        // Handle 0.001 → 0 for optional weather
        if (precipitation != null && precipitation <= 0.001)
            precipitation = 0.0;

        AirQualityDataDTO data = AirQualityDataDTO.builder()
                .entityId((String) entity.get("id"))
                .stationName(extractStringValue(entity, "stationName"))
                .stationCode(extractStringValue(entity, "stationCode"))
                .district(extractDistrictFromId((String) entity.get("id")))
                .observedAt(extractObservedAt(entity, "pm2_5"))
                .location(extractLocation(entity))

                // Air Quality Index
                .airQualityIndex(extractIntValue(entity, "airQualityIndex"))
                .airQualityLevel(extractStringValue(entity, "airQualityLevel"))

                // Pollutants (use directly, 0.001 already converted to 0)
                .co(co)
                .no(no)
                .no2(no2)
                .nox(nox)
                .o3(o3)
                .so2(so2)
                .pm2_5(pm2_5)
                .pm10(pm10)
                .nh3(nh3)

                // Levels
                .coLevel(extractStringValue(entity, "CO_Level"))
                .no2Level(extractStringValue(entity, "NO2_Level"))
                .o3Level(extractStringValue(entity, "O3_Level"))
                .so2Level(extractStringValue(entity, "SO2_Level"))
                .pm2_5Level(extractStringValue(entity, "pm2_5_Level"))
                .pm10Level(extractStringValue(entity, "pm10_Level"))

                // Metadata
                .reliability(extractDoubleValue(entity, "reliability"))

                // Optional weather data (no conversion, already float)
                .temperature(temperature)
                .relativeHumidity(
                        entity.containsKey("relativeHumidity") ? extractIntValue(entity, "relativeHumidity") / 100.0
                                : null)
                .windSpeed(windSpeed)
                .windDirection(entity.containsKey("windDirection") ? extractIntValue(entity, "windDirection") : null)
                .precipitation(precipitation)

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
