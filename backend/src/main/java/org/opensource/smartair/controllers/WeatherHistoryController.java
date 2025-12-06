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
package org.opensource.smartair.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opensource.smartair.dtos.ApiResponseDTO;
import org.opensource.smartair.services.QuantumLeapClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * REST API Controller for Weather observation historical data from QuantumLeap
 */
@Slf4j
@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherHistoryController {

    private final QuantumLeapClient quantumLeapClient;

    /**
     * Get historical data for weather attribute from QuantumLeap
     * 
     * @param district   District name (e.g., "PhuongBaDinh", "PhuongHoanKiem")
     * @param attrName   Attribute name (e.g., "temperature", "humidity",
     *                   "windSpeed")
     * @param fromDate   Start date ISO 8601 (e.g., "2025-11-01T00:00:00Z")
     * @param toDate     End date ISO 8601 (e.g., "2025-11-13T23:59:59Z")
     * @param aggrMethod Aggregation: avg, sum, min, max, count (optional)
     * @param aggrPeriod Period: hour, day, week, month (optional)
     * @param lastN      Number of data points (optional, fallback)
     * @return ApiResponseDTO with time-series data
     * 
     *         Example: GET
     *         /api/weather/PhuongBaDinh/attrs/temperature/history?aggrMethod=avg&aggrPeriod=hour&fromDate=2025-11-01T00:00:00Z&toDate=2025-11-13T23:59:59Z
     */
    @GetMapping("/{district}/attrs/{attrName}/history")
    public Mono<ResponseEntity<ApiResponseDTO<Map<String, Object>>>> getWeatherAttributeHistory(
            @PathVariable String district,
            @PathVariable String attrName,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String aggrMethod,
            @RequestParam(required = false) String aggrPeriod,
            @RequestParam(required = false) Integer lastN) {

        log.info("Fetching weather {} history for {}: fromDate={}, toDate={}, aggrMethod={}, aggrPeriod={}, lastN={}",
                attrName, district, fromDate, toDate, aggrMethod, aggrPeriod, lastN);

        return quantumLeapClient
                .getWeatherAttributeHistory(district, attrName, fromDate, toDate, aggrMethod, aggrPeriod, lastN)
                .map(historyData -> {
                    if (historyData.isEmpty()) {
                        log.warn("No weather {} data found for {}", attrName, district);
                        return ResponseEntity.ok(
                                ApiResponseDTO.<Map<String, Object>>success("No historical data found", historyData));
                    }
                    log.info("Successfully retrieved weather {} history for {}", attrName, district);
                    return ResponseEntity.ok(
                            ApiResponseDTO.success("Successfully retrieved weather attribute history", historyData));
                })
                .onErrorResume(e -> {
                    log.error("Error fetching weather {} history for {}: {}", attrName, district, e.getMessage());
                    return Mono.just(
                            ResponseEntity.ok(
                                    ApiResponseDTO.<Map<String, Object>>error(
                                            "Failed to retrieve weather history: " + e.getMessage())));
                });
    }

    /**
     * Alternative endpoint with attrName as query parameter
     * 
     * Example: GET
     * /api/weather/PhuongBaDinh/history?attrName=temperature&aggrMethod=avg&aggrPeriod=hour&fromDate=2025-11-01T00:00:00Z&toDate=2025-11-13T23:59:59Z
     */
    @GetMapping("/{district}/history")
    public Mono<ResponseEntity<ApiResponseDTO<Map<String, Object>>>> getWeatherHistoryQuery(
            @PathVariable String district,
            @RequestParam String attrName,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String aggrMethod,
            @RequestParam(required = false) String aggrPeriod,
            @RequestParam(required = false) Integer lastN) {

        return getWeatherAttributeHistory(district, attrName, fromDate, toDate, aggrMethod, aggrPeriod, lastN);
    }
}
