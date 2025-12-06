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

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Weather Observation Data
 * Used for SSE streaming to frontend
 * Values are converted from integer storage format to doubles
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeatherDataDTO {

    private String entityId;
    private String stationName;
    private String stationCode;
    private String district;
    private String observedAt;
    private LocationDTO location;

    // Temperature (converted from int*10 to double)
    private Double temperature; // °C
    private Double feelsLikeTemperature; // °C

    // Humidity & Pressure
    private Double relativeHumidity; // 0-1 or 0-100 based on UI need
    private Integer atmosphericPressure; // hPa

    // Weather condition
    private String weatherType; // "Clear", "Clouds", "Rain", etc.
    private String weatherDescription; // "clear sky", "light rain", etc.

    // Wind (converted from int*10 to double)
    private Double windSpeed; // m/s
    private Integer windDirection; // degrees 0-360

    // Precipitation (converted from int*10 to double)
    private Double precipitation; // mm

    // Visibility & Light
    private Integer visibility; // meters
    private Integer cloudiness; // 0-100 %
    private Integer illuminance; // lux

    // Optional (converted from double, 0.001 → 0)
    private Double pressureTendency; // hPa/h

    @JsonProperty("refDevice")
    private String refDevice; // Device URN
}
