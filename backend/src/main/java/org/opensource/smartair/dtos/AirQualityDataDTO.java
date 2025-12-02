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
package org.opensource.smartair.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Air Quality Observation Data
 * Used for SSE streaming to frontend
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AirQualityDataDTO {

    private String entityId;
    private String stationName;
    private String stationCode;
    private String district;
    private String observedAt;
    private LocationDTO location;

    // Air Quality Index
    private Integer airQualityIndex; // 1-5 (1=good, 5=very poor)
    private String airQualityLevel; // "good", "fair", "moderate", "poor", "very poor"

    // Pollutants (μg/m³)
    private Double co; // Carbon Monoxide
    private Double no; // Nitric Oxide
    private Double no2; // Nitrogen Dioxide
    private Double nox; // Nitrogen Oxides
    private Double o3; // Ozone
    private Double so2; // Sulfur Dioxide
    private Double pm2_5; // Particulate Matter 2.5
    private Double pm10; // Particulate Matter 10
    private Double nh3; // Ammonia

    // Levels per pollutant
    private String coLevel;
    private String no2Level;
    private String o3Level;
    private String so2Level;
    private String pm2_5Level;
    private String pm10Level;

    // Metadata
    private Double reliability; // 0-1

    // Optional weather data (if included)
    private Double temperature; // °C (converted from int*10)
    private Double relativeHumidity; // 0-1 or 0-100
    private Double windSpeed; // m/s (converted from int*10)
    private Integer windDirection; // degrees
    private Double precipitation; // mm (converted from int*10)

    @JsonProperty("refDevice")
    private String refDevice; // Device URN

    @JsonProperty("refPointOfInterest")
    private String refPointOfInterest;
}
