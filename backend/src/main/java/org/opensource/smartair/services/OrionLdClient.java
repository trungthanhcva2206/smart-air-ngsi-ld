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
package org.opensource.smartair.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.opensource.smartair.dtos.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * Client service to query data from Orion-LD Context Broker
 * Used to fetch initial/current data before SSE streaming
 */
@Slf4j
@Service
public class OrionLdClient {

    private final WebClient webClient; // With Link header for type queries
    private final WebClient webClientNoContext; // Without Link header for ID queries
    private final NgsiTransformerService transformerService;
    private final ObjectMapper objectMapper;

    @Value("${orion.url:http://orion:1026}")
    private String orionUrl;

    @Value("${orion.tenant:hanoi}")
    private String tenant;

    public OrionLdClient(NgsiTransformerService transformerService,
            @Value("${orion.url:http://orion:1026}") String orionUrl,
            @Value("${orion.tenant:hanoi}") String tenant) {
        this.transformerService = transformerService;
        this.objectMapper = new ObjectMapper();
        this.orionUrl = orionUrl;
        this.tenant = tenant;

        log.info("Initializing OrionLdClient with URL: {}, Tenant: {}", orionUrl, tenant);

        // WebClient with Link header for queries by type (weather, airquality, platform
        // list)
        this.webClient = WebClient.builder()
                .baseUrl(orionUrl)
                .defaultHeader("Fiware-Service", tenant)
                .defaultHeader("Fiware-ServicePath", "/")
                .defaultHeader("Link",
                        "<https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld>; rel=\"http://www.w3.org/ns/json-ld#context\"; type=\"application/ld+json\"")
                .defaultHeader("NGSILD-Tenant", tenant)
                .build();

        // WebClient without Link header for direct entity queries by ID
        this.webClientNoContext = WebClient.builder()
                .baseUrl(orionUrl)
                .defaultHeader("Fiware-Service", tenant)
                .defaultHeader("Fiware-ServicePath", "/")
                .defaultHeader("NGSILD-Tenant", tenant)
                .build();
    }

    /**
     * Get latest weather observation for a district
     * Query using stationName filter: ?q=stationName=="PhuongHoanKiem"
     */
    public Mono<WeatherDataDTO> getLatestWeather(String district) {
        String entityType = "weatherObserved";
        String query = String.format("stationName==\"%s\"", district);

        log.debug("Querying weather data: type={}, q={}", entityType, query);

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/ngsi-ld/v1/entities")
                        .queryParam("type", entityType)
                        .queryParam("q", query)
                        .queryParam("limit", "1")
                        // Remove keyValues to get normalized format (which transformerService expects)
                        .build())
                .retrieve()
                .bodyToMono(List.class)
                .flatMap(entities -> {
                    if (entities == null || entities.isEmpty()) {
                        log.warn("No weather data found for district: {}", district);
                        return Mono.empty();
                    }

                    try {
                        Map<String, Object> entity = (Map<String, Object>) entities.get(0);
                        WeatherDataDTO data = transformerService.transformWeatherObserved(entity);
                        log.info("Fetched latest weather data for district: {} (temp: {}°C)",
                                data.getDistrict(), data.getTemperature());
                        return Mono.just(data);
                    } catch (Exception e) {
                        log.error("Error transforming weather data for district: {}", district, e);
                        return Mono.empty();
                    }
                })
                .onErrorResume(error -> {
                    log.error("Error fetching weather data from Orion-LD for district: {}", district, error);
                    return Mono.empty();
                });
    }

    /**
     * Get latest air quality observation for a district
     * Query using stationName filter: ?q=stationName=="PhuongHoanKiem"
     */
    public Mono<AirQualityDataDTO> getLatestAirQuality(String district) {
        String entityType = "airQualityObserved";
        String query = String.format("stationName==\"%s\"", district);

        log.debug("Querying air quality data: type={}, q={}", entityType, query);

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/ngsi-ld/v1/entities")
                        .queryParam("type", entityType)
                        .queryParam("q", query)
                        .queryParam("limit", "1")
                        // Remove keyValues to get normalized format
                        .build())
                .retrieve()
                .bodyToMono(List.class)
                .flatMap(entities -> {
                    if (entities == null || entities.isEmpty()) {
                        log.warn("No air quality data found for district: {}", district);
                        return Mono.empty();
                    }

                    try {
                        Map<String, Object> entity = (Map<String, Object>) entities.get(0);
                        AirQualityDataDTO data = transformerService.transformAirQualityObserved(entity);
                        log.info("Fetched latest air quality data for district: {} (AQI: {})",
                                data.getDistrict(), data.getAirQualityIndex());
                        return Mono.just(data);
                    } catch (Exception e) {
                        log.error("Error transforming air quality data for district: {}", district, e);
                        return Mono.empty();
                    }
                })
                .onErrorResume(error -> {
                    log.error("Error fetching air quality data from Orion-LD for district: {}", district, error);
                    return Mono.empty();
                });
    }

    /**
     * Get platform entity by ID
     * Uses webClientNoContext (no Link header needed for direct entity fetch)
     */
    public Mono<PlatformDataDTO> getPlatform(String platformId) {
        return webClientNoContext.get()
                .uri("/ngsi-ld/v1/entities/{entityId}", platformId)
                .retrieve()
                .bodyToMono(Map.class)
                .flatMap(entity -> {
                    try {
                        PlatformDataDTO data = transformerService.transformPlatform(entity);
                        log.info("Fetched platform data: {}", data.getName());
                        return Mono.just(data);
                    } catch (Exception e) {
                        log.error("Error transforming platform data", e);
                        return Mono.empty();
                    }
                })
                .onErrorResume(error -> {
                    log.error("Error fetching platform from Orion-LD: {}", platformId, error);
                    return Mono.empty();
                });
    }

    /**
     * Get device entity by ID
     * Uses webClientNoContext (no Link header needed for direct entity fetch)
     */
    public Mono<DeviceDataDTO> getDevice(String deviceId) {
        return webClientNoContext.get()
                .uri("/ngsi-ld/v1/entities/{entityId}", deviceId)
                .retrieve()
                .bodyToMono(Map.class)
                .flatMap(entity -> {
                    try {
                        DeviceDataDTO data = transformerService.transformDevice(entity);
                        log.info("Fetched device data: {}", data.getName());
                        return Mono.just(data);
                    } catch (Exception e) {
                        log.error("Error transforming device data", e);
                        return Mono.empty();
                    }
                })
                .onErrorResume(error -> {
                    log.error("Error fetching device from Orion-LD: {}", deviceId, error);
                    return Mono.empty();
                });
    }

    /**
     * Get all platforms
     */
    public Mono<List<PlatformDataDTO>> getAllPlatforms() {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/ngsi-ld/v1/entities")
                        .queryParam("type", "Platform")
                        .queryParam("limit", "1000") // Get all platforms (max 1000)
                        // Remove keyValues to get normalized format
                        .build())
                .retrieve()
                .bodyToMono(List.class)
                .map(entities -> {
                    List<PlatformDataDTO> platforms = ((List<Map<String, Object>>) entities).stream()
                            .map(transformerService::transformPlatform)
                            .toList();
                    log.info("Fetched {} platforms from Orion-LD", platforms.size());
                    return platforms;
                })
                .onErrorResume(error -> {
                    log.error("Error fetching platforms from Orion-LD", error);
                    return Mono.just(List.of());
                });
    }
}
