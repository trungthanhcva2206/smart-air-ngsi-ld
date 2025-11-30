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
import org.opensource.smartair.dtos.*;
import org.opensource.smartair.services.GeoJsonService;
import org.opensource.smartair.services.OrionLdClient;
import org.opensource.smartair.services.SseService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.opensource.smartair.services.QuantumLeapClient;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for SSE (Server-Sent Events) streaming
 * Frontend subscribes to these endpoints to receive real-time updates
 */
@Slf4j
@RestController
@RequestMapping("/api/sse")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow CORS for frontend
public class SseController {

        private final SseService sseService;
        private final QuantumLeapClient quantumLeapClient;
        private final OrionLdClient orionLdClient;
        private final GeoJsonService geoJsonService;

        /**
         * SSE endpoint for weather updates
         * URL: GET /api/sse/weather/{district}
         * Example: /api/sse/weather/PhuongHoanKiem
         */
        @GetMapping(value = "/weather/{district}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
        public Flux<ServerSentEvent<SseEventDTO<WeatherDataDTO>>> streamWeather(
                        @PathVariable String district) {

                log.info("Client connecting to weather SSE stream for district: {}", district);

                return sseService.subscribeWeather(district)
                                .map(event -> ServerSentEvent.<SseEventDTO<WeatherDataDTO>>builder()
                                                .id(String.valueOf(System.currentTimeMillis()))
                                                .event("weather.update")
                                                .data(event)
                                                .build())
                                .concatWith(keepAlive());
        }

        /**
         * SSE endpoint for air quality updates
         * URL: GET /api/sse/airquality/{district}
         * Example: /api/sse/airquality/PhuongHoanKiem
         */
        @GetMapping(value = "/airquality/{district}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
        public Flux<ServerSentEvent<SseEventDTO<AirQualityDataDTO>>> streamAirQuality(
                        @PathVariable String district) {

                log.info("Client connecting to air quality SSE stream for district: {}", district);

                return sseService.subscribeAirQuality(district)
                                .map(event -> ServerSentEvent.<SseEventDTO<AirQualityDataDTO>>builder()
                                                .id(String.valueOf(System.currentTimeMillis()))
                                                .event("airquality.update")
                                                .data(event)
                                                .build())
                                .concatWith(keepAlive());
        }

        /**
         * SSE endpoint for GLOBAL air quality alerts
         * URL: GET /api/sse/airquality/alerts
         * 
         * Client chỉ cần MỘT kết nối SSE để nhận alerts từ TẤT CẢ 126 trạm
         * Chỉ broadcast khi có district nào đó có AQI >= 4 (poor/very poor)
         * 
         * Example event:
         * {
         * "eventType": "airquality.alert",
         * "district": "PhuongHoanKiem",
         * "timestamp": "2025-11-30T16:45:00Z",
         * "data": { airQualityIndex: 5, pm2_5: 150.5, ... }
         * }
         */
        @GetMapping(value = "/airquality/alerts", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
        public Flux<ServerSentEvent<SseEventDTO<AirQualityDataDTO>>> streamAirQualityAlerts() {
                log.info("Client connecting to GLOBAL air quality alerts stream");

                return sseService.subscribeAirQualityAlerts()
                                .map(event -> ServerSentEvent.<SseEventDTO<AirQualityDataDTO>>builder()
                                                .id(String.valueOf(System.currentTimeMillis()))
                                                .event("airquality.alert")
                                                .data(event)
                                                .build())
                                .concatWith(keepAlive())
                                .doOnCancel(() -> log.info("Client disconnected from air quality alerts stream"));
        }

        @GetMapping(value = "/airquality/all/history", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
        public Flux<ServerSentEvent<Map<String, Object>>> streamAggregatedAirQualityHistory() {
                log.info("Client subscribed to aggregated air quality history stream");

                // Get all districts from GeoJSON
                List<String> allDistricts = geoJsonService.getAllDistricts();
                log.info("📊 Fetching history for {} districts", allDistricts.size());

                // Fetch initial aggregated data from QuantumLeap
                Flux<ServerSentEvent<Map<String, Object>>> initialData = quantumLeapClient
                                .getAggregatedAirQualityHistory(allDistricts)
                                .map(aggregatedData -> ServerSentEvent.<Map<String, Object>>builder()
                                                .id(String.valueOf(System.currentTimeMillis()))
                                                .event("airquality.history.aggregated")
                                                .data(aggregatedData)
                                                .build())
                                .flux()
                                .doOnNext(event -> log.info("Sending initial aggregated air quality history"));

                // Subscribe to live updates (when any district updates)
                Flux<ServerSentEvent<Map<String, Object>>> liveUpdates = sseService
                                .subscribeAggregatedAirQualityHistory()
                                .map(aggregatedData -> ServerSentEvent.<Map<String, Object>>builder()
                                                .id(String.valueOf(System.currentTimeMillis()))
                                                .event("airquality.history.aggregated.update")
                                                .data(aggregatedData)
                                                .build());

                return Flux.concat(initialData, liveUpdates)
                                .concatWith(keepAlive())
                                .doOnCancel(() -> log.info("Client unsubscribed from aggregated air quality history"));
        }

        @GetMapping(value = "/weather/all/history", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
        public Flux<ServerSentEvent<Map<String, Object>>> streamAggregatedWeatherHistory() {
                log.info("Client subscribed to aggregated weather history stream");

                List<String> allDistricts = geoJsonService.getAllDistricts();
                log.info("📊 Fetching weather history for {} districts", allDistricts.size());

                // Step 1: Send initial data
                Flux<ServerSentEvent<Map<String, Object>>> initialData = quantumLeapClient
                                .getAggregatedWeatherHistory(allDistricts)
                                .map(aggregatedData -> ServerSentEvent.<Map<String, Object>>builder()
                                                .id(String.valueOf(System.currentTimeMillis()))
                                                .event("weather.history.aggregated")
                                                .data(aggregatedData)
                                                .build())
                                .flux()
                                .doOnNext(event -> log.info("✅ Sending initial aggregated weather history"));

                // ✅ NEW: Step 2: Subscribe to live updates
                Flux<ServerSentEvent<Map<String, Object>>> liveUpdates = sseService.subscribeAggregatedWeatherHistory()
                                .map(aggregatedData -> ServerSentEvent.<Map<String, Object>>builder()
                                                .id(String.valueOf(System.currentTimeMillis()))
                                                .event("weather.history.aggregated.update")
                                                .data(aggregatedData)
                                                .build())
                                .doOnNext(event -> log.debug("📤 Sending weather history update to client"));

                // Step 3: Combine initial + live updates + keep-alive
                return Flux.concat(initialData, liveUpdates)
                                .concatWith(keepAlive())
                                .doOnCancel(() -> log.info("Client unsubscribed from aggregated weather history"));
        }

        /**
         * SSE endpoint for platform updates
         * URL: GET /api/sse/platform/{platformId}
         * Example:
         * /api/sse/platform/urn:ngsi-ld:Platform:EnvironmentStation-PhuongHoanKiem
         */
        @GetMapping(value = "/platform/{platformId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
        public Flux<ServerSentEvent<SseEventDTO<PlatformDataDTO>>> streamPlatform(
                        @PathVariable String platformId) {

                log.info("Client connecting to platform SSE stream: {}", platformId);

                return sseService.subscribePlatform(platformId)
                                .map(event -> ServerSentEvent.<SseEventDTO<PlatformDataDTO>>builder()
                                                .id(String.valueOf(System.currentTimeMillis()))
                                                .event("platform.update")
                                                .data(event)
                                                .build())
                                .concatWith(keepAlive());
        }

        /**
         * SSE endpoint for device updates
         * URL: GET /api/sse/device/{deviceId}
         * Example: /api/sse/device/urn:ngsi-ld:Device:WeatherSensor-PhuongHoanKiem
         */
        @GetMapping(value = "/device/{deviceId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
        public Flux<ServerSentEvent<SseEventDTO<DeviceDataDTO>>> streamDevice(
                        @PathVariable String deviceId) {

                log.info("Client connecting to device SSE stream: {}", deviceId);

                return sseService.subscribeDevice(deviceId)
                                .map(event -> ServerSentEvent.<SseEventDTO<DeviceDataDTO>>builder()
                                                .id(String.valueOf(System.currentTimeMillis()))
                                                .event("device.update")
                                                .data(event)
                                                .build())
                                .concatWith(keepAlive());
        }

        /**
         * Combined SSE endpoint for district (weather + air quality)
         * URL: GET /api/sse/district/{district}
         * Returns both weather and air quality updates for a district
         */
        @GetMapping(value = "/district/{district}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
        public Flux<ServerSentEvent<Map<String, Object>>> streamDistrict(
                        @PathVariable String district) {

                log.info("Client connecting to combined district SSE stream: {}", district);

                Flux<ServerSentEvent<Map<String, Object>>> weatherStream = sseService.subscribeWeather(district)
                                .map(event -> ServerSentEvent.<Map<String, Object>>builder()
                                                .id(String.valueOf(System.currentTimeMillis()))
                                                .event("weather.update")
                                                .data(Map.of("type", "weather", "data", event))
                                                .build());

                Flux<ServerSentEvent<Map<String, Object>>> airQualityStream = sseService.subscribeAirQuality(district)
                                .map(event -> ServerSentEvent.<Map<String, Object>>builder()
                                                .id(String.valueOf(System.currentTimeMillis()))
                                                .event("airquality.update")
                                                .data(Map.of("type", "airquality", "data", event))
                                                .build());

                return Flux.merge(weatherStream, airQualityStream)
                                .concatWith(keepAlive());
        }

        /**
         * SSE endpoint for weather historical data (30 days)
         * URL: GET /api/sse/weather/{district}/history
         */
        @GetMapping(value = "/weather/{district}/history", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
        public Flux<ServerSentEvent<Map<String, Object>>> streamWeatherHistory(
                        @PathVariable String district) {

                log.info("Client connecting to weather history SSE stream for district: {}", district);

                // Fetch initial data from QuantumLeap
                Flux<ServerSentEvent<Map<String, Object>>> initialData = quantumLeapClient.getWeatherHistory(district)
                                .map(historyData -> ServerSentEvent.<Map<String, Object>>builder()
                                                .id(String.valueOf(System.currentTimeMillis()))
                                                .event("weather.history")
                                                .data(historyData)
                                                .build())
                                .flux()
                                .doOnNext(event -> log.info("Sending initial weather history for district: {}",
                                                district));

                // Subscribe to live updates
                Flux<ServerSentEvent<Map<String, Object>>> liveUpdates = sseService.subscribeWeatherHistory(district)
                                .map(historyData -> ServerSentEvent.<Map<String, Object>>builder()
                                                .id(String.valueOf(System.currentTimeMillis()))
                                                .event("weather.history.update")
                                                .data(historyData)
                                                .build());

                return Flux.concat(initialData, liveUpdates)
                                .concatWith(keepAlive());
        }

        /**
         * SSE endpoint for air quality historical data (30 days)
         * URL: GET /api/sse/airquality/{district}/history
         */
        @GetMapping(value = "/airquality/{district}/history", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
        public Flux<ServerSentEvent<Map<String, Object>>> streamAirQualityHistory(
                        @PathVariable String district) {

                log.info("Client connecting to air quality history SSE stream for district: {}", district);

                // Fetch initial data from QuantumLeap
                Flux<ServerSentEvent<Map<String, Object>>> initialData = quantumLeapClient
                                .getAirQualityHistory(district)
                                .map(historyData -> ServerSentEvent.<Map<String, Object>>builder()
                                                .id(String.valueOf(System.currentTimeMillis()))
                                                .event("airquality.history")
                                                .data(historyData)
                                                .build())
                                .flux()
                                .doOnNext(event -> log.info("Sending initial air quality history for district: {}",
                                                district));

                // Subscribe to live updates
                Flux<ServerSentEvent<Map<String, Object>>> liveUpdates = sseService.subscribeAirQualityHistory(district)
                                .map(historyData -> ServerSentEvent.<Map<String, Object>>builder()
                                                .id(String.valueOf(System.currentTimeMillis()))
                                                .event("airquality.history.update")
                                                .data(historyData)
                                                .build());

                return Flux.concat(initialData, liveUpdates)
                                .concatWith(keepAlive());
        }

        /**
         * SSE endpoint for Python route-finding service
         * Streams ALL air quality data updates
         * URL: GET /api/sse/environment-data
         */
        @GetMapping(value = "/environment-data", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
        public Flux<ServerSentEvent<Map<String, AirQualityDataDTO>>> streamEnvironmentData() {
                log.info("Python service connecting to environment-data SSE stream");

                // Fetch initial data from Orion-LD
                Flux<ServerSentEvent<Map<String, AirQualityDataDTO>>> initialData = orionLdClient.getAllAirQualityData()
                                .map(airQualityList -> {
                                        Map<String, AirQualityDataDTO> dataMap = new HashMap<>();
                                        for (AirQualityDataDTO dto : airQualityList) {
                                                if (dto.getStationName() != null) {
                                                        dataMap.put(dto.getStationName(), dto);
                                                }
                                        }
                                        return ServerSentEvent.<Map<String, AirQualityDataDTO>>builder()
                                                        .id(String.valueOf(System.currentTimeMillis()))
                                                        .event("environment.initial")
                                                        .data(dataMap)
                                                        .build();
                                })
                                .flux()
                                .doOnNext(event -> log.info("Sending initial environment data to Python service"));

                // Subscribe to live updates for ALL districts
                Flux<ServerSentEvent<Map<String, AirQualityDataDTO>>> liveUpdates = sseService
                                .subscribeAllEnvironmentData()
                                .map(dataMap -> ServerSentEvent.<Map<String, AirQualityDataDTO>>builder()
                                                .id(String.valueOf(System.currentTimeMillis()))
                                                .event("environment.update")
                                                .data(dataMap)
                                                .build());

                return Flux.concat(initialData, liveUpdates)
                                .concatWith(keepAlive());
        }

        /**
         * Monitoring endpoint - get active subscriber counts
         */
        @GetMapping("/stats")
        public ResponseEntity<Map<String, Integer>> getStats() {
                return ResponseEntity.ok(sseService.getSubscriberCounts());
        }

        /**
         * SSE endpoint for ALL platform updates
         * URL: GET /api/sse/platforms
         * Use this to receive real-time updates for all platforms on the map
         */
        @GetMapping(value = "/platforms", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
        public Flux<ServerSentEvent<SseEventDTO<PlatformDataDTO>>> streamAllPlatforms() {
                log.info("Client connecting to all-platforms SSE stream");

                return sseService.subscribeAllPlatforms()
                                .map(event -> ServerSentEvent.<SseEventDTO<PlatformDataDTO>>builder()
                                                .id(String.valueOf(System.currentTimeMillis()))
                                                .event("platform.update")
                                                .data(event)
                                                .build())
                                .concatWith(keepAlive());
        }

        /**
         * Keep-alive mechanism to prevent connection timeout
         * Sends a comment every 30 seconds
         */
        private <T> Flux<ServerSentEvent<T>> keepAlive() {
                return Flux.interval(Duration.ofSeconds(30))
                                .map(seq -> ServerSentEvent.<T>builder()
                                                .comment("keep-alive")
                                                .build());
        }
}