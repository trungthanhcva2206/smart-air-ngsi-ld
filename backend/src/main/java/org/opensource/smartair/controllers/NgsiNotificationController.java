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
import org.opensource.smartair.dtos.*;
import org.opensource.smartair.services.GeoJsonService;
import org.opensource.smartair.services.NgsiTransformerService;
import org.opensource.smartair.services.NotificationService;
import org.opensource.smartair.services.OrionLdClient;
import org.opensource.smartair.services.QuantumLeapClient;
import org.opensource.smartair.services.SseService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for receiving NGSI-LD notifications from Orion-LD
 * Endpoint: POST /api/notify/ngsi
 */
@Slf4j
@RestController
@RequestMapping("/api/notify")
@RequiredArgsConstructor
public class NgsiNotificationController {

    private final NgsiTransformerService transformerService;
    private final SseService sseService;
    private final QuantumLeapClient quantumLeapClient;
    private final OrionLdClient orionLdClient;
    private final NotificationService notificationService;
    private final GeoJsonService geoJsonService;

    @Value("${quantumleap.query.delay.seconds:2}")
    private int quantumLeapDelaySeconds;

    /**
     * Receive NGSI-LD notification and broadcast via SSE
     * This endpoint is called by Orion-LD subscriptions
     */
    @PostMapping("/ngsi")
    public ResponseEntity<Void> receiveNotification(
            @RequestHeader(value = "Fiware-Service", required = false) String fiwareService,
            @RequestHeader(value = "Fiware-ServicePath", required = false) String fiwareServicePath,
            @RequestBody Map<String, Object> notification) {

        log.info("Received NGSI-LD notification. Fiware-Service: {}, Fiware-ServicePath: {}",
                fiwareService, fiwareServicePath);

        try {
            // Parse notification data
            List<Map<String, Object>> entities = (List<Map<String, Object>>) notification.get("data");

            if (entities == null || entities.isEmpty()) {
                log.warn("Notification contains no entities");
                return ResponseEntity.ok().build();
            }

            // Process each entity
            for (Map<String, Object> entity : entities) {
                String entityType = (String) entity.get("type");
                String entityId = (String) entity.get("id");

                log.debug("Processing entity: {} (type: {})", entityId, entityType);

                // Transform and broadcast based on entity type
                switch (entityType) {
                    case "weatherObserved":
                        handleWeatherObserved(entity);
                        break;
                    case "airQualityObserved":
                        handleAirQualityObserved(entity);
                        break;
                    case "Device":
                        handleDevice(entity);
                        break;
                    case "Platform":
                        handlePlatform(entity);
                        break;
                    default:
                        log.warn("Unknown entity type: {}", entityType);
                }
            }

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            log.error("Error processing NGSI-LD notification", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Handle WeatherObserved entity
     */
    private void handleWeatherObserved(Map<String, Object> entity) {
        try {
            WeatherDataDTO data = transformerService.transformWeatherObserved(entity);
            String district = data.getDistrict();

            log.info("Transformed weather data for district: {} (temp: {}°C)",
                    district, data.getTemperature());

            // 1. Broadcast live update immediately
            sseService.broadcastWeather(data);

            // 2. Query QuantumLeap for historical data (with delay)
            queryAndBroadcastWeatherHistory(district);

            // ✅ NEW: 3. Update aggregated weather history
            updateAggregatedWeatherHistory();

        } catch (Exception e) {
            log.error("Error handling WeatherObserved entity", e);
        }
    }

    private void updateAggregatedWeatherHistory() {
        Mono.delay(Duration.ofSeconds(quantumLeapDelaySeconds))
            .flatMap(tick -> {
                List<String> allDistricts = geoJsonService.getAllDistricts();
                return quantumLeapClient.getAggregatedWeatherHistory(allDistricts);
            })
            .subscribe(
                aggregatedData -> {
                    log.info("✅ Broadcasting updated aggregated weather history");
                    sseService.broadcastAggregatedWeatherHistoryUpdate(aggregatedData);
                },
                error -> log.error("❌ Error updating aggregated weather history: {}", error.getMessage())
            );
    }

    private void queryAndBroadcastWeatherHistory(String district) {
        Mono.delay(Duration.ofSeconds(quantumLeapDelaySeconds))
                .flatMap(tick -> quantumLeapClient.getWeatherHistory(district))
                .subscribe(
                        historyData -> {
                            log.info("Queried QuantumLeap weather history for district: {}", district);
                            sseService.broadcastWeatherHistory(district, historyData);
                        },
                        error -> log.error("Error querying QuantumLeap weather history for district: {}",
                                district, error));
    }

    /**
     * Query QuantumLeap for air quality history and broadcast via SSE
     * Uses delay to wait for QuantumLeap to persist data
     */
    private void queryAndBroadcastAirQualityHistory(String district) {
        Mono.delay(Duration.ofSeconds(quantumLeapDelaySeconds))
                .flatMap(tick -> quantumLeapClient.getAirQualityHistory(district))
                .subscribe(
                        historyData -> {
                            log.info("Queried QuantumLeap air quality history for district: {}", district);
                            sseService.broadcastAirQualityHistory(district, historyData);
                        },
                        error -> log.error("Error querying QuantumLeap air quality history for district: {}",
                                district, error));
    }

    /**
     * Handle AirQualityObserved entity
     */
    private void handleAirQualityObserved(Map<String, Object> entity) {
        try {
            AirQualityDataDTO data = transformerService.transformAirQualityObserved(entity);
            String district = data.getDistrict();

            log.info("Transformed air quality data for district: {} (AQI: {})",
                    district, data.getAirQualityIndex());

            // 1. Broadcast live update immediately
            sseService.broadcastAirQuality(data);

            // 2. Query QuantumLeap for historical data (with delay)
            queryAndBroadcastAirQualityHistory(district);

            // ✅ NEW: 3. Update aggregated history for ALL districts
            updateAggregatedAirQualityHistory();

            // 4. Broadcast ALL environment data to Python service
            broadcastAllEnvironmentDataToPython();

            // 5. Auto-trigger email notifications if air quality is poor/very poor
            notificationService.sendAirQualityAlert(data);

        } catch (Exception e) {
            log.error("Error handling AirQualityObserved entity", e);
        }
    }

    private void updateAggregatedAirQualityHistory() {
        Mono.delay(Duration.ofSeconds(quantumLeapDelaySeconds))
            .flatMap(tick -> {
                List<String> allDistricts = geoJsonService.getAllDistricts();
                return quantumLeapClient.getAggregatedAirQualityHistory(allDistricts);
            })
            .subscribe(
                aggregatedData -> {
                    log.info("✅ Broadcasting updated aggregated air quality history");
                    sseService.broadcastAggregatedAirQualityHistoryUpdate(aggregatedData);
                },
                error -> log.error("❌ Error updating aggregated air quality history: {}", error.getMessage())
            );
    }

    private void broadcastAllEnvironmentDataToPython() {
        orionLdClient.getAllAirQualityData()
                .subscribe(
                        airQualityList -> {
                            Map<String, AirQualityDataDTO> dataMap = new HashMap<>();
                            for (AirQualityDataDTO dto : airQualityList) {
                                if (dto.getStationName() != null) {
                                    dataMap.put(dto.getStationName(), dto);
                                }
                            }
                            sseService.broadcastAllEnvironmentData(dataMap);
                            log.info("Broadcasted environment data to Python service ({} stations)",
                                    dataMap.size());
                        },
                        error -> log.error("Error fetching air quality data for Python broadcast", error));
    }

    /**
     * Handle Device entity
     */
    private void handleDevice(Map<String, Object> entity) {
        try {
            DeviceDataDTO data = transformerService.transformDevice(entity);
            log.info("Transformed device data: {} ({})", data.getName(), data.getSensorType());
            sseService.broadcastDevice(data);
        } catch (Exception e) {
            log.error("Error handling Device entity", e);
        }
    }

    /**
     * Handle Platform entity
     */
    private void handlePlatform(Map<String, Object> entity) {
        try {
            PlatformDataDTO data = transformerService.transformPlatform(entity);
            log.info("Transformed platform data: {} (status: {})", data.getName(), data.getStatus());
            sseService.broadcastPlatform(data);
        } catch (Exception e) {
            log.error("Error handling Platform entity", e);
        }
    }

    /**
     * Health check endpoint for Orion-LD to verify notification endpoint
     */
    @GetMapping("/ngsi/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "ngsi-notification-receiver"));
    }
}