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
import org.opensource.smartair.dtos.DeviceDataDTO;
import org.opensource.smartair.dtos.PlatformDataDTO;
import org.opensource.smartair.services.OrionLdClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * REST API Controller for Platform operations
 */
@Slf4j
@RestController
@RequestMapping("/api/platforms")
@RequiredArgsConstructor
public class PlatformController {

    private final OrionLdClient orionLdClient;

    /**
     * Get all platforms (environment monitoring stations)
     * 
     * @return ApiResponseDTO with list of all platforms
     * 
     *         Example: GET /api/platforms
     */
    @GetMapping
    public Mono<ResponseEntity<ApiResponseDTO<List<PlatformDataDTO>>>> getAllPlatforms() {
        log.info("Fetching all platforms");

        return orionLdClient.getAllPlatforms()
                .map(platforms -> {
                    log.info("Found {} platforms", platforms.size());
                    return ResponseEntity.ok(
                            ApiResponseDTO.success("Successfully retrieved platforms", platforms));
                })
                .onErrorResume(e -> {
                    log.error("Error fetching platforms", e);
                    return Mono.just(
                            ResponseEntity.ok(
                                    ApiResponseDTO.error("Failed to retrieve platforms: " + e.getMessage())));
                });
    }

    /**
     * Get all devices hosted by a platform
     * 
     * @param platformId Platform entity ID (e.g.,
     *                   "urn:ngsi-ld:Platform:EnvironmentStation-PhuongHoanKiem")
     * @return ApiResponseDTO with list of devices
     * 
     *         Example: GET
     *         /api/platforms/urn:ngsi-ld:Platform:EnvironmentStation-PhuongHoanKiem/devices
     */
    @GetMapping("/{platformId}/devices")
    public Mono<ResponseEntity<ApiResponseDTO<List<DeviceDataDTO>>>> getDevicesByPlatform(
            @PathVariable String platformId) {

        log.info("Fetching devices for platform: {}", platformId);

        return orionLdClient.getDevicesByPlatform(platformId)
                .map(devices -> {
                    log.info("Found {} devices for platform: {}", devices.size(), platformId);
                    return ResponseEntity.ok(
                            ApiResponseDTO.success("Successfully retrieved devices", devices));
                })
                .onErrorResume(e -> {
                    log.error("Error fetching devices for platform: {}", platformId, e);
                    return Mono.just(
                            ResponseEntity.ok(
                                    ApiResponseDTO.error("Failed to retrieve devices: " + e.getMessage())));
                });
    }

    /**
     * Get all devices hosted by a platform (using query parameter)
     * 
     * @param platformId Platform entity ID
     * @return ApiResponseDTO with list of devices
     * 
     *         Example: GET
     *         /api/platforms/devices?platformId=urn:ngsi-ld:Platform:EnvironmentStation-PhuongHoanKiem
     */
    @GetMapping("/devices")
    public Mono<ResponseEntity<ApiResponseDTO<List<DeviceDataDTO>>>> getDevicesByPlatformQuery(
            @RequestParam String platformId) {

        return getDevicesByPlatform(platformId);
    }
}
