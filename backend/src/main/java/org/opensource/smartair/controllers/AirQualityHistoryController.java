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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opensource.smartair.dtos.ApiResponse;
import org.opensource.smartair.services.QuantumLeapClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * REST API Controller for Air Quality observation historical data from
 * QuantumLeap
 */
@Slf4j
@RestController
@RequestMapping("/api/airquality")
@RequiredArgsConstructor
public class AirQualityHistoryController {

    private final QuantumLeapClient quantumLeapClient;

    /**
     * Get historical data for air quality attribute from QuantumLeap
     * 
     * @param district   District name (e.g., "PhuongBaDinh", "PhuongHoanKiem")
     * @param attrName   Attribute name (e.g., "pm2_5", "pm10", "CO", "NO2", "O3")
     * @param fromDate   Start date ISO 8601 (e.g., "2025-11-01T00:00:00Z")
     * @param toDate     End date ISO 8601 (e.g., "2025-11-13T23:59:59Z")
     * @param aggrMethod Aggregation: avg, sum, min, max, count (optional)
     * @param aggrPeriod Period: hour, day, week, month (optional)
     * @param lastN      Number of data points (optional, fallback)
     * @return ApiResponse with time-series data
     * 
     *         Example: GET
     *         /api/airquality/PhuongBaDinh/attrs/pm2_5/history?aggrMethod=avg&aggrPeriod=hour&fromDate=2025-11-01T00:00:00Z&toDate=2025-11-13T23:59:59Z
     */
    @GetMapping("/{district}/attrs/{attrName}/history")
    public Mono<ResponseEntity<ApiResponse<Map<String, Object>>>> getAirQualityAttributeHistory(
            @PathVariable String district,
            @PathVariable String attrName,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String aggrMethod,
            @RequestParam(required = false) String aggrPeriod,
            @RequestParam(required = false) Integer lastN) {

        log.info(
                "Fetching air quality {} history for {}: fromDate={}, toDate={}, aggrMethod={}, aggrPeriod={}, lastN={}",
                attrName, district, fromDate, toDate, aggrMethod, aggrPeriod, lastN);

        return quantumLeapClient
                .getAirQualityAttributeHistory(district, attrName, fromDate, toDate, aggrMethod, aggrPeriod, lastN)
                .map(historyData -> {
                    if (historyData.isEmpty()) {
                        log.warn("No air quality {} data found for {}", attrName, district);
                        return ResponseEntity.ok(
                                ApiResponse.<Map<String, Object>>success("No historical data found", historyData));
                    }
                    log.info("Successfully retrieved air quality {} history for {}", attrName, district);
                    return ResponseEntity.ok(
                            ApiResponse.success("Successfully retrieved air quality attribute history", historyData));
                })
                .onErrorResume(e -> {
                    log.error("Error fetching air quality {} history for {}: {}", attrName, district, e.getMessage());
                    return Mono.just(
                            ResponseEntity.ok(
                                    ApiResponse.<Map<String, Object>>error(
                                            "Failed to retrieve air quality history: " + e.getMessage())));
                });
    }

    /**
     * Alternative endpoint with attrName as query parameter
     * 
     * Example: GET
     * /api/airquality/PhuongBaDinh/history?attrName=pm2_5&aggrMethod=avg&aggrPeriod=hour&fromDate=2025-11-01T00:00:00Z&toDate=2025-11-13T23:59:59Z
     */
    @GetMapping("/{district}/history")
    public Mono<ResponseEntity<ApiResponse<Map<String, Object>>>> getAirQualityHistoryQuery(
            @PathVariable String district,
            @RequestParam String attrName,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String aggrMethod,
            @RequestParam(required = false) String aggrPeriod,
            @RequestParam(required = false) Integer lastN) {

        return getAirQualityAttributeHistory(district, attrName, fromDate, toDate, aggrMethod, aggrPeriod, lastN);
    }
}
