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
import org.opensource.smartair.dtos.AirQualityDataDTO;
import org.opensource.smartair.services.OrionLdClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class ExternalDataController {

    private final OrionLdClient orionLdClient;

    /**
     * API này dùng cho service Python (Tìm đường)
     * Trả về Map<stationName, AirQualityDataDTO>
     * Key sẽ giữ nguyên format từ Orion: "PhuongHoanKiem"
     */
    @GetMapping("/environment-data")
    public Mono<Map<String, AirQualityDataDTO>> getEnvironmentData() {
        log.info("Controller: Nhận yêu cầu /api/v1/environment-data...");

        return orionLdClient.getAllAirQualityData()
                .map(airQualityList -> {
                    log.info("Controller: Nhận được {} AirQuality entities từ Orion", airQualityList.size());

                    Map<String, AirQualityDataDTO> resultMap = new HashMap<>();

                    for (AirQualityDataDTO dto : airQualityList) {
                        String stationName = dto.getStationName();

                        if (stationName == null || stationName.isEmpty()) {
                            log.warn("DTO không có stationName, bỏ qua: {}", dto.getEntityId());
                            continue;
                        }

                        // Giữ nguyên stationName làm key
                        // Python sẽ tự normalize tên từ GeoJSON để match
                        log.debug("Adding to map: key='{}', entityId='{}'", stationName, dto.getEntityId());

                        if (!resultMap.containsKey(stationName)) {
                            resultMap.put(stationName, dto);
                        } else {
                            log.warn("Key '{}' đã tồn tại, bỏ qua", stationName);
                        }
                    }

                    log.info("Controller: Trả về Map với {} entries", resultMap.size());

                    // Log tất cả keys để debug
                    if (log.isInfoEnabled()) {
                        log.info("Danh sách keys trong response:");
                        resultMap.keySet().forEach(key ->
                                log.info("  - '{}'", key)
                        );
                    }

                    return resultMap;
                });
    }
}