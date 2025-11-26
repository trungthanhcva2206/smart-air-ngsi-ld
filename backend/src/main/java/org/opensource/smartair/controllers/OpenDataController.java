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
package org.opensource.smartair.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opensource.smartair.dtos.*;
import org.opensource.smartair.services.OrionLdClient;
import org.opensource.smartair.services.QuantumLeapClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Open Data API Controller - Public access to environmental data
 * Returns NGSI-LD normalized format (raw from Orion-LD, no transformation)
 * All endpoints are publicly accessible without authentication
 */
@Slf4j
@RestController
@RequestMapping("/api/open")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Open Data API", description = "Public environmental data endpoints for weather, air quality, and monitoring stations")
public class OpenDataController {

        private final OrionLdClient orionLdClient;
        private final QuantumLeapClient quantumLeapClient;

        /**
         * Get latest weather observations for all districts
         * Returns raw NGSI-LD normalized format
         */
        @Operation(summary = "Get latest weather observations", description = "Retrieve the most recent weather data for all monitoring stations in Hanoi. "
                        +
                        "Returns NGSI-LD normalized format as per ETSI specification. " +
                        "Data includes temperature, humidity, wind speed, precipitation, and more.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved weather data in NGSI-LD format", content = @Content(schema = @Schema(implementation = Map.class))),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        @GetMapping("/weather/latest")
        public Mono<ResponseEntity<List<Map<String, Object>>>> getLatestWeather(
                        @Parameter(description = "Maximum number of records to return (default: 100, max: 1000)") @RequestParam(defaultValue = "100") int limit) {

                log.info("Open API: Fetching latest weather data (limit={})", limit);

                // Validate limit
                if (limit > 1000) {
                        limit = 1000;
                }
                if (limit < 1) {
                        limit = 1;
                }

                final int finalLimit = limit;

                return orionLdClient.getAllWeatherDataRaw()
                                .map(weatherList -> {
                                        // Apply limit
                                        List<Map<String, Object>> limitedList = weatherList.stream()
                                                        .limit(finalLimit)
                                                        .collect(Collectors.toList());

                                        log.info("Open API: Returning {} weather records in NGSI-LD format",
                                                        limitedList.size());
                                        return ResponseEntity.ok(limitedList);
                                })
                                .onErrorResume(e -> {
                                        log.error("Open API: Error fetching weather data: {}", e.getMessage());
                                        return Mono.just(ResponseEntity.ok(List.of()));
                                });
        }

        /**
         * Get latest air quality observations for all districts
         * Returns raw NGSI-LD normalized format
         */
        @Operation(summary = "Get latest air quality observations", description = "Retrieve the most recent air quality data for all monitoring stations in Hanoi. "
                        +
                        "Returns NGSI-LD normalized format as per ETSI specification. " +
                        "Data includes PM2.5, PM10, CO, NO2, O3, SO2, and Air Quality Index (AQI).")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved air quality data in NGSI-LD format", content = @Content(schema = @Schema(implementation = Map.class))),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        @GetMapping("/airquality/latest")
        public Mono<ResponseEntity<List<Map<String, Object>>>> getLatestAirQuality(
                        @Parameter(description = "Maximum number of records to return (default: 100, max: 1000)") @RequestParam(defaultValue = "100") int limit) {

                log.info("Open API: Fetching latest air quality data (limit={})", limit);

                // Validate limit
                if (limit > 1000) {
                        limit = 1000;
                }
                if (limit < 1) {
                        limit = 1;
                }

                final int finalLimit = limit;

                return orionLdClient.getAllAirQualityDataRaw()
                                .map(airQualityList -> {
                                        // Apply limit
                                        List<Map<String, Object>> limitedList = airQualityList.stream()
                                                        .limit(finalLimit)
                                                        .collect(Collectors.toList());

                                        log.info("Open API: Returning {} air quality records in NGSI-LD format",
                                                        limitedList.size());
                                        return ResponseEntity.ok(limitedList);
                                })
                                .onErrorResume(e -> {
                                        log.error("Open API: Error fetching air quality data: {}", e.getMessage());
                                        return Mono.just(ResponseEntity.ok(List.of()));
                                });
        }

        /**
         * Get weather data for a specific district
         * Returns raw NGSI-LD normalized format
         */
        @Operation(summary = "Get weather data for specific district", description = "Retrieve the latest weather observation for a specific district in Hanoi. "
                        +
                        "Returns NGSI-LD normalized format as per ETSI specification.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved weather data in NGSI-LD format", content = @Content(schema = @Schema(implementation = Map.class))),
                        @ApiResponse(responseCode = "404", description = "District not found"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        @GetMapping("/weather/{district}")
        public Mono<ResponseEntity<Map<String, Object>>> getWeatherByDistrict(
                        @Parameter(description = "District/station name (e.g., 'PhuongHoanKiem', 'BaDinh')", required = true) @PathVariable String district) {

                log.info("Open API: Fetching weather data for district: {}", district);

                return orionLdClient.getLatestWeatherRaw(district)
                                .map(weather -> {
                                        log.info("Open API: Found weather data for {} in NGSI-LD format", district);
                                        return ResponseEntity.ok(weather);
                                })
                                .onErrorResume(e -> {
                                        log.error("Open API: Error fetching weather for {}: {}", district,
                                                        e.getMessage());
                                        return Mono.just(ResponseEntity.ok(Map.of()));
                                });
        }

        /**
         * Get air quality data for a specific district
         * Returns raw NGSI-LD normalized format
         */
        @Operation(summary = "Get air quality data for specific district", description = "Retrieve the latest air quality observation for a specific district in Hanoi. "
                        +
                        "Returns NGSI-LD normalized format as per ETSI specification.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved air quality data in NGSI-LD format", content = @Content(schema = @Schema(implementation = Map.class))),
                        @ApiResponse(responseCode = "404", description = "District not found"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        @GetMapping("/airquality/{district}")
        public Mono<ResponseEntity<Map<String, Object>>> getAirQualityByDistrict(
                        @Parameter(description = "District/station name (e.g., 'PhuongHoanKiem', 'BaDinh')", required = true) @PathVariable String district) {

                log.info("Open API: Fetching air quality data for district: {}", district);

                return orionLdClient.getLatestAirQualityRaw(district)
                                .map(airQuality -> {
                                        log.info("Open API: Found air quality data for {} in NGSI-LD format", district);
                                        return ResponseEntity.ok(airQuality);
                                })
                                .onErrorResume(e -> {
                                        log.error("Open API: Error fetching air quality for {}: {}", district,
                                                        e.getMessage());
                                        return Mono.just(ResponseEntity.ok(Map.of()));
                                });
        }

        /**
         * Get all monitoring platforms (stations)
         * Returns raw NGSI-LD normalized format
         */
        @Operation(summary = "Get all monitoring platforms", description = "Retrieve information about all environmental monitoring stations in Hanoi. "
                        +
                        "Returns NGSI-LD normalized format as per ETSI specification. " +
                        "Data includes platform locations, status, and hosted devices.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved platform data in NGSI-LD format", content = @Content(schema = @Schema(implementation = Map.class))),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        @GetMapping("/platforms")
        public Mono<ResponseEntity<List<Map<String, Object>>>> getAllPlatforms(
                        @Parameter(description = "Maximum number of records to return (default: 100, max: 1000)") @RequestParam(defaultValue = "100") int limit) {

                log.info("Open API: Fetching all platforms (limit={})", limit);

                // Validate limit
                if (limit > 1000) {
                        limit = 1000;
                }
                if (limit < 1) {
                        limit = 1;
                }

                final int finalLimit = limit;

                return orionLdClient.getAllPlatformsRaw()
                                .map(platforms -> {
                                        List<Map<String, Object>> limitedList = platforms.stream()
                                                        .limit(finalLimit)
                                                        .collect(Collectors.toList());

                                        log.info("Open API: Returning {} platform records in NGSI-LD format",
                                                        limitedList.size());
                                        return ResponseEntity.ok(limitedList);
                                })
                                .onErrorResume(e -> {
                                        log.error("Open API: Error fetching platforms: {}", e.getMessage());
                                        return Mono.just(ResponseEntity.ok(List.of()));
                                });
        }

        /**
         * Get list of available districts
         * Returns list of stationNames from weather data
         */
        @Operation(summary = "Get list of available districts", description = "Retrieve a list of all districts (stationNames) that have environmental monitoring stations.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved district list"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        @GetMapping("/districts")
        public Mono<ResponseEntity<List<String>>> getAvailableDistricts() {
                log.info("Open API: Fetching available districts");

                return orionLdClient.getAllWeatherDataRaw()
                                .map(weatherList -> {
                                        List<String> districts = weatherList.stream()
                                                        .map(entity -> {
                                                                Map<String, Object> stationName = (Map<String, Object>) entity
                                                                                .get("stationName");
                                                                return stationName != null
                                                                                ? (String) stationName.get("value")
                                                                                : null;
                                                        })
                                                        .filter(d -> d != null && !d.isBlank())
                                                        .distinct()
                                                        .sorted()
                                                        .collect(Collectors.toList());

                                        log.info("Open API: Found {} districts", districts.size());
                                        return ResponseEntity.ok(districts);
                                })
                                .onErrorResume(e -> {
                                        log.error("Open API: Error fetching districts: {}", e.getMessage());
                                        return Mono.just(ResponseEntity.ok(List.of()));
                                });
        }

        /**
         * Get historical weather data for a specific district and attribute
         * Returns raw NGSI-LD time-series format from QuantumLeap
         */
        @Operation(summary = "Get weather attribute history", description = "Retrieve historical time-series data for a specific weather attribute in a district. "
                        +
                        "Returns NGSI-LD time-series format from QuantumLeap. " +
                        "Supports aggregation (avg, sum, min, max) and time periods (hour, day, week, month).")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved historical data in NGSI-LD format", content = @Content(schema = @Schema(implementation = Map.class))),
                        @ApiResponse(responseCode = "404", description = "No data found"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        @GetMapping("/weather/{district}/attrs/{attrName}/history")
        public Mono<ResponseEntity<Map<String, Object>>> getWeatherAttributeHistory(
                        @Parameter(description = "District/station name (e.g., 'PhuongHoanKiem', 'BaDinh')", required = true) @PathVariable String district,
                        @Parameter(description = "Attribute name (e.g., 'temperature', 'humidity', 'windSpeed')", required = true) @PathVariable String attrName,
                        @Parameter(description = "Start date in ISO 8601 format (e.g., '2025-11-01T00:00:00Z')") @RequestParam(required = false) String fromDate,
                        @Parameter(description = "End date in ISO 8601 format (e.g., '2025-11-13T23:59:59Z')") @RequestParam(required = false) String toDate,
                        @Parameter(description = "Aggregation method: avg, sum, min, max, count") @RequestParam(required = false) String aggrMethod,
                        @Parameter(description = "Aggregation period: hour, day, week, month") @RequestParam(required = false) String aggrPeriod,
                        @Parameter(description = "Number of latest data points (fallback if no dates specified)") @RequestParam(required = false) Integer lastN) {

                log.info("Open API: Fetching weather {} history for {} (fromDate={}, toDate={}, aggrMethod={}, aggrPeriod={}, lastN={})",
                                attrName, district, fromDate, toDate, aggrMethod, aggrPeriod, lastN);

                return quantumLeapClient
                                .getWeatherAttributeHistory(district, attrName, fromDate, toDate, aggrMethod,
                                                aggrPeriod, lastN)
                                .map(historyData -> {
                                        if (historyData.isEmpty()) {
                                                log.warn("Open API: No weather {} data found for {}", attrName,
                                                                district);
                                        } else {
                                                log.info("Open API: Successfully retrieved weather {} history for {} in NGSI-LD format",
                                                                attrName, district);
                                        }
                                        return ResponseEntity.ok(historyData);
                                })
                                .onErrorResume(e -> {
                                        log.error("Open API: Error fetching weather {} history for {}: {}", attrName,
                                                        district, e.getMessage());
                                        return Mono.just(ResponseEntity.ok(Map.of()));
                                });
        }

        /**
         * Get historical air quality data for a specific district and attribute
         * Returns raw NGSI-LD time-series format from QuantumLeap
         */
        @Operation(summary = "Get air quality attribute history", description = "Retrieve historical time-series data for a specific air quality attribute in a district. "
                        +
                        "Returns NGSI-LD time-series format from QuantumLeap. " +
                        "Supports aggregation (avg, sum, min, max) and time periods (hour, day, week, month).")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved historical data in NGSI-LD format", content = @Content(schema = @Schema(implementation = Map.class))),
                        @ApiResponse(responseCode = "404", description = "No data found"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        @GetMapping("/airquality/{district}/attrs/{attrName}/history")
        public Mono<ResponseEntity<Map<String, Object>>> getAirQualityAttributeHistory(
                        @Parameter(description = "District/station name (e.g., 'PhuongHoanKiem', 'BaDinh')", required = true) @PathVariable String district,
                        @Parameter(description = "Attribute name (e.g., 'pm2_5', 'pm10', 'CO', 'NO2', 'O3', 'SO2')", required = true) @PathVariable String attrName,
                        @Parameter(description = "Start date in ISO 8601 format (e.g., '2025-11-01T00:00:00Z')") @RequestParam(required = false) String fromDate,
                        @Parameter(description = "End date in ISO 8601 format (e.g., '2025-11-13T23:59:59Z')") @RequestParam(required = false) String toDate,
                        @Parameter(description = "Aggregation method: avg, sum, min, max, count") @RequestParam(required = false) String aggrMethod,
                        @Parameter(description = "Aggregation period: hour, day, week, month") @RequestParam(required = false) String aggrPeriod,
                        @Parameter(description = "Number of latest data points (fallback if no dates specified)") @RequestParam(required = false) Integer lastN) {

                log.info("Open API: Fetching air quality {} history for {} (fromDate={}, toDate={}, aggrMethod={}, aggrPeriod={}, lastN={})",
                                attrName, district, fromDate, toDate, aggrMethod, aggrPeriod, lastN);

                return quantumLeapClient
                                .getAirQualityAttributeHistory(district, attrName, fromDate, toDate, aggrMethod,
                                                aggrPeriod, lastN)
                                .map(historyData -> {
                                        if (historyData.isEmpty()) {
                                                log.warn("Open API: No air quality {} data found for {}", attrName,
                                                                district);
                                        } else {
                                                log.info("Open API: Successfully retrieved air quality {} history for {} in NGSI-LD format",
                                                                attrName, district);
                                        }
                                        return ResponseEntity.ok(historyData);
                                })
                                .onErrorResume(e -> {
                                        log.error("Open API: Error fetching air quality {} history for {}: {}",
                                                        attrName,
                                                        district, e.getMessage());
                                        return Mono.just(ResponseEntity.ok(Map.of()));
                                });
        }
}
