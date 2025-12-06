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
 * @Copyright (C) 2025 TAA. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
 */
package org.opensource.smartair.dtos;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO for Partner API - NGSI-LD format with Property structure
 * PhuongHaDong: only pm2_5
 * PhuongHoangMai: pm2_5, temperature, relativeHumidity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PartnerAirQualityDTO {

    // NGSI-LD Context
    @JsonProperty("@context")
    private Object context;

    // NGSI-LD Entity metadata
    private String id;
    private String type;

    // NGSI-LD Standard Properties
    private Map<String, Object> name;
    private Map<String, Object> description;
    private Map<String, Object> address;
    private Map<String, Object> location;
    private Map<String, Object> dateObserved;
    private Map<String, Object> source;
    private Map<String, Object> dataProvider;
    private Map<String, Object> stationName;
    private Map<String, Object> stationCode;
    private Map<String, Object> latitude;
    private Map<String, Object> longitude;

    // Air Quality Data - Always included for both districts
    @JsonProperty("pm2_5")
    private Map<String, Object> pm2_5;

    // Weather Data - Only for PhuongHoangMai
    private Map<String, Object> temperature;
    private Map<String, Object> relativeHumidity;

    // Relationships
    private Map<String, Object> refDevice;
    private Map<String, Object> refPointOfInterest;

    // Helper method to create Property structure
    public static Map<String, Object> createProperty(Object value, String observedAt, String unitCode) {
        Map<String, Object> property = new java.util.HashMap<>();
        property.put("type", "Property");
        property.put("value", value);
        if (observedAt != null) {
            property.put("observedAt", observedAt);
        }
        if (unitCode != null) {
            property.put("unitCode", unitCode);
        }
        return property;
    }

    // Helper method to create Relationship structure
    public static Map<String, Object> createRelationship(String objectId, String observedAt) {
        Map<String, Object> relationship = new java.util.HashMap<>();
        relationship.put("type", "Relationship");
        relationship.put("object", objectId);
        if (observedAt != null) {
            relationship.put("observedAt", observedAt);
        }
        return relationship;
    }

    // Helper method to create GeoProperty structure
    public static Map<String, Object> createGeoProperty(LocationDTO location, String observedAt) {
        Map<String, Object> geoProperty = new java.util.HashMap<>();
        geoProperty.put("type", "GeoProperty");

        Map<String, Object> value = new java.util.HashMap<>();
        value.put("type", "Point");
        value.put("coordinates", new double[] { location.getLon(), location.getLat() });
        geoProperty.put("value", value);

        if (observedAt != null) {
            geoProperty.put("observedAt", observedAt);
        }
        return geoProperty;
    }
}
