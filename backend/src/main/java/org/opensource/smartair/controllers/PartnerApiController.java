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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opensource.smartair.dtos.ApiResponseDTO;
import org.opensource.smartair.dtos.PartnerAirQualityDTO;
import org.opensource.smartair.services.PartnerApiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * Partner API Controller - Limited access to air quality data
 * Only specific districts with field restrictions
 * 
 * Allowed districts:
 * - PhuongHaDong: pm2_5 only
 * - PhuongHoangMai: pm2_5, temperature, humidity
 */
@Slf4j
@RestController
@RequestMapping("/api/partner")
@RequiredArgsConstructor
@Tag(name = "Partner API", description = "Limited air quality data API for partners")
public class PartnerApiController {

    private final PartnerApiService partnerApiService;

    /**
     * Get air quality data for specific allowed district
     */
    @GetMapping("/air-quality/{district}")
    @Operation(summary = "Get air quality data for specific partner district", description = """
            Returns air quality data for specific district if allowed.

            Field restrictions:
            - PhuongHaDong: pm2_5 only
            - PhuongHoangMai: pm2_5, temperature, humidity
            """)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved air quality data", content = @Content(schema = @Schema(implementation = ApiResponseDTO.class))),
            @ApiResponse(responseCode = "403", description = "Access denied - district not allowed", content = @Content(schema = @Schema(implementation = ApiResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "District not found", content = @Content(schema = @Schema(implementation = ApiResponseDTO.class)))
    })
    public Mono<ResponseEntity<PartnerAirQualityDTO>> getPartnerAirQualityByDistrict(
            @Parameter(description = "District name (PhuongHaDong or PhuongHoangMai)", required = true) @PathVariable String district) {

        log.info("Partner API: Fetching air quality data for district: {}", district);

        return partnerApiService.getPartnerAirQualityByDistrict(district)
                .map(data -> ResponseEntity.ok(data))
                .switchIfEmpty(Mono.just(ResponseEntity.status(403).build()))
                .onErrorResume(e -> {
                    log.error("Error fetching air quality data for district: {}", district, e);
                    return Mono.just(ResponseEntity.status(500).build());
                });
    }
}
