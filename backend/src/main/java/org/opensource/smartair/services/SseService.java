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

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opensource.smartair.dtos.*;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for managing SSE (Server-Sent Events) streams
 * Uses Reactor Sinks for reactive streaming
 * Fetches initial data from Orion-LD when client connects
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SseService {

    private final OrionLdClient orionLdClient;

    // Separate sinks for each data type
    private final Map<String, Sinks.Many<SseEventDTO<WeatherDataDTO>>> weatherSinks = new ConcurrentHashMap<>();
    private final Map<String, Sinks.Many<SseEventDTO<AirQualityDataDTO>>> airQualitySinks = new ConcurrentHashMap<>();
    private final Map<String, Sinks.Many<SseEventDTO<PlatformDataDTO>>> platformSinks = new ConcurrentHashMap<>();
    private final Map<String, Sinks.Many<SseEventDTO<DeviceDataDTO>>> deviceSinks = new ConcurrentHashMap<>();
    private final Map<String, Sinks.Many<Map<String, Object>>> weatherHistorySinks = new ConcurrentHashMap<>();
    private final Map<String, Sinks.Many<Map<String, Object>>> airQualityHistorySinks = new ConcurrentHashMap<>();

    // Global sink for broadcasting ALL platform updates to map view
    private final Sinks.Many<SseEventDTO<PlatformDataDTO>> allPlatformsSink = Sinks.many().multicast()
            .onBackpressureBuffer();

    private final Sinks.Many<Map<String, AirQualityDataDTO>> allEnvironmentSink = 
        Sinks.many().multicast().onBackpressureBuffer();
    // ============ Weather Streams ============

    /**
     * Subscribe to weather updates for a specific district
     * Returns a Flux that emits WeatherDataDTO events
     * Fetches initial data from Orion-LD before streaming updates
     */
    public Flux<SseEventDTO<WeatherDataDTO>> subscribeWeather(String district) {
        String key = "weather:" + district;

        Sinks.Many<SseEventDTO<WeatherDataDTO>> sink = weatherSinks.computeIfAbsent(key,
                k -> Sinks.many().multicast().onBackpressureBuffer());

        log.info("Client subscribed to weather stream for district: {}", district);

        // Fetch initial data from Orion-LD
        Flux<SseEventDTO<WeatherDataDTO>> initialData = orionLdClient.getLatestWeather(district)
                .map(data -> SseEventDTO.<WeatherDataDTO>builder()
                        .eventType("weather.initial")
                        .district(district)
                        .timestamp(data.getObservedAt())
                        .data(data)
                        .build())
                .flux()
                .doOnNext(event -> log.info("Sending initial weather data for district: {}", district));

        // Combine initial data + live stream
        return Flux.concat(
                initialData,
                sink.asFlux()
                        .doOnCancel(() -> {
                            log.info("Client unsubscribed from weather stream for district: {}", district);
                            if (sink.currentSubscriberCount() == 0) {
                                weatherSinks.remove(key);
                            }
                        })
                        .timeout(Duration.ofHours(24))
                        .onErrorResume(e -> {
                            log.error("Error in weather stream for district {}: {}", district, e.getMessage());
                            return Flux.empty();
                        }));
    }

    public Flux<Map<String, Object>> subscribeWeatherHistory(String district) {
        String key = "weather-history:" + district;

        Sinks.Many<Map<String, Object>> sink = weatherHistorySinks.computeIfAbsent(key,
                k -> Sinks.many().multicast().onBackpressureBuffer());

        log.info("Client subscribed to weather history stream for district: {}", district);

        return sink.asFlux()
                .doOnCancel(() -> {
                    log.info("Client unsubscribed from weather history stream for district: {}", district);
                    if (sink.currentSubscriberCount() == 0) {
                        weatherHistorySinks.remove(key);
                    }
                })
                .timeout(Duration.ofHours(24))
                .onErrorResume(e -> {
                    log.error("Error in weather history stream for district {}: {}", district, e.getMessage());
                    return Flux.empty();
                });
    }

    public void broadcastWeatherHistory(String district, Map<String, Object> historyData) {
        if (district == null || historyData == null || historyData.isEmpty()) {
            log.warn("Invalid weather history data for district: {}", district);
            return;
        }

        String key = "weather-history:" + district;
        Sinks.Many<Map<String, Object>> sink = weatherHistorySinks.get(key);

        if (sink != null) {
            Sinks.EmitResult result = sink.tryEmitNext(historyData);
            if (result.isSuccess()) {
                log.debug("Broadcasted weather history update for district: {}", district);
            } else {
                log.warn("Failed to broadcast weather history for district {}: {}", district, result);
            }
        } else {
            log.debug("No subscribers for weather history in district: {}", district);
        }
    }

    public Flux<Map<String, Object>> subscribeAirQualityHistory(String district) {
        String key = "airquality-history:" + district;

        Sinks.Many<Map<String, Object>> sink = airQualityHistorySinks.computeIfAbsent(key,
                k -> Sinks.many().multicast().onBackpressureBuffer());

        log.info("Client subscribed to air quality history stream for district: {}", district);

        return sink.asFlux()
                .doOnCancel(() -> {
                    log.info("Client unsubscribed from air quality history stream for district: {}", district);
                    if (sink.currentSubscriberCount() == 0) {
                        airQualityHistorySinks.remove(key);
                    }
                })
                .timeout(Duration.ofHours(24))
                .onErrorResume(e -> {
                    log.error("Error in air quality history stream for district {}: {}", district, e.getMessage());
                    return Flux.empty();
                });
    }

    public void broadcastAirQualityHistory(String district, Map<String, Object> historyData) {
        if (district == null || historyData == null || historyData.isEmpty()) {
            log.warn("Invalid air quality history data for district: {}", district);
            return;
        }

        String key = "airquality-history:" + district;
        Sinks.Many<Map<String, Object>> sink = airQualityHistorySinks.get(key);

        if (sink != null) {
            Sinks.EmitResult result = sink.tryEmitNext(historyData);
            if (result.isSuccess()) {
                log.debug("Broadcasted air quality history update for district: {}", district);
            } else {
                log.warn("Failed to broadcast air quality history for district {}: {}", district, result);
            }
        } else {
            log.debug("No subscribers for air quality history in district: {}", district);
        }
    }
    /**
     * Broadcast weather data to subscribed clients
     */
    public void broadcastWeather(WeatherDataDTO data) {
        String district = data.getDistrict();
        if (district == null) {
            log.warn("Weather data missing district, cannot broadcast");
            return;
        }

        String key = "weather:" + district;
        Sinks.Many<SseEventDTO<WeatherDataDTO>> sink = weatherSinks.get(key);

        if (sink != null) {
            SseEventDTO<WeatherDataDTO> event = SseEventDTO.<WeatherDataDTO>builder()
                    .eventType("weather.update")
                    .district(district)
                    .timestamp(data.getObservedAt())
                    .data(data)
                    .build();

            Sinks.EmitResult result = sink.tryEmitNext(event);
            if (result.isSuccess()) {
                log.debug("Broadcasted weather update for district: {}", district);
            } else {
                log.warn("Failed to broadcast weather update for district {}: {}", district, result);
            }
        } else {
            log.debug("No subscribers for weather updates in district: {}", district);
        }
    }

    // ============ Air Quality Streams ============

    /**
     * Subscribe to air quality updates for a specific district
     * Fetches initial data from Orion-LD before streaming updates
     */
    public Flux<SseEventDTO<AirQualityDataDTO>> subscribeAirQuality(String district) {
        String key = "airquality:" + district;

        Sinks.Many<SseEventDTO<AirQualityDataDTO>> sink = airQualitySinks.computeIfAbsent(key,
                k -> Sinks.many().multicast().onBackpressureBuffer());

        log.info("Client subscribed to air quality stream for district: {}", district);

        // Fetch initial data from Orion-LD
        Flux<SseEventDTO<AirQualityDataDTO>> initialData = orionLdClient.getLatestAirQuality(district)
                .map(data -> SseEventDTO.<AirQualityDataDTO>builder()
                        .eventType("airquality.initial")
                        .district(district)
                        .timestamp(data.getObservedAt())
                        .data(data)
                        .build())
                .flux()
                .doOnNext(event -> log.info("Sending initial air quality data for district: {}", district));

        return Flux.concat(
                initialData,
                sink.asFlux()
                        .doOnCancel(() -> {
                            log.info("Client unsubscribed from air quality stream for district: {}", district);
                            if (sink.currentSubscriberCount() == 0) {
                                airQualitySinks.remove(key);
                            }
                        })
                        .timeout(Duration.ofHours(24))
                        .onErrorResume(e -> {
                            log.error("Error in air quality stream for district {}: {}", district, e.getMessage());
                            return Flux.empty();
                        }));
    }

    /**
     * Broadcast air quality data to subscribed clients
     */
    public void broadcastAirQuality(AirQualityDataDTO data) {
        String district = data.getDistrict();
        if (district == null) {
            log.warn("Air quality data missing district, cannot broadcast");
            return;
        }

        String key = "airquality:" + district;
        Sinks.Many<SseEventDTO<AirQualityDataDTO>> sink = airQualitySinks.get(key);

        if (sink != null) {
            SseEventDTO<AirQualityDataDTO> event = SseEventDTO.<AirQualityDataDTO>builder()
                    .eventType("airquality.update")
                    .district(district)
                    .timestamp(data.getObservedAt())
                    .data(data)
                    .build();

            Sinks.EmitResult result = sink.tryEmitNext(event);
            if (result.isSuccess()) {
                log.debug("Broadcasted air quality update for district: {}", district);
            } else {
                log.warn("Failed to broadcast air quality update for district {}: {}", district, result);
            }
        } else {
            log.debug("No subscribers for air quality updates in district: {}", district);
        }
    }

    // ============ Platform Streams ============

    /**
     * Subscribe to platform updates for a specific platform ID
     * Fetches initial data from Orion-LD before streaming updates
     */
    public Flux<SseEventDTO<PlatformDataDTO>> subscribePlatform(String platformId) {
        String key = "platform:" + platformId;

        Sinks.Many<SseEventDTO<PlatformDataDTO>> sink = platformSinks.computeIfAbsent(key,
                k -> Sinks.many().multicast().onBackpressureBuffer());

        log.info("Client subscribed to platform stream: {}", platformId);

        // Fetch initial data from Orion-LD
        Flux<SseEventDTO<PlatformDataDTO>> initialData = orionLdClient.getPlatform(platformId)
                .map(data -> SseEventDTO.<PlatformDataDTO>builder()
                        .eventType("platform.initial")
                        .district(null)
                        .timestamp(java.time.Instant.now().toString())
                        .data(data)
                        .build())
                .flux()
                .doOnNext(event -> log.info("Sending initial platform data: {}", platformId));

        return Flux.concat(
                initialData,
                sink.asFlux()
                        .doOnCancel(() -> {
                            log.info("Client unsubscribed from platform stream: {}", platformId);
                            if (sink.currentSubscriberCount() == 0) {
                                platformSinks.remove(key);
                            }
                        })
                        .timeout(Duration.ofHours(24))
                        .onErrorResume(e -> {
                            log.error("Error in platform stream {}: {}", platformId, e.getMessage());
                            return Flux.empty();
                        }));
    }

    /**
     * Broadcast platform data to subscribed clients
     * Also broadcasts to ALL platforms stream for map view
     */
    public void broadcastPlatform(PlatformDataDTO data) {
        String platformId = data.getEntityId();
        if (platformId == null) {
            log.warn("Platform data missing entity ID, cannot broadcast");
            return;
        }

        SseEventDTO<PlatformDataDTO> event = SseEventDTO.<PlatformDataDTO>builder()
                .eventType("platform.update")
                .district(null) // Platform doesn't have district in same way
                .timestamp(java.time.Instant.now().toString())
                .data(data)
                .build();

        // Broadcast to specific platform subscribers
        String key = "platform:" + platformId;
        Sinks.Many<SseEventDTO<PlatformDataDTO>> sink = platformSinks.get(key);

        if (sink != null) {
            Sinks.EmitResult result = sink.tryEmitNext(event);
            if (result.isSuccess()) {
                log.debug("Broadcasted platform update: {}", platformId);
            } else {
                log.warn("Failed to broadcast platform update {}: {}", platformId, result);
            }
        } else {
            log.debug("No subscribers for platform: {}", platformId);
        }

        // Also broadcast to ALL platforms stream (for map view)
        Sinks.EmitResult globalResult = allPlatformsSink.tryEmitNext(event);
        if (globalResult.isSuccess()) {
            log.debug("Broadcasted platform update to global stream: {}", platformId);
        }
    }

    /**
     * Subscribe to ALL platform updates
     * Use this for map view to receive updates for all platforms
     */
    public Flux<SseEventDTO<PlatformDataDTO>> subscribeAllPlatforms() {
        log.info("Client subscribed to all-platforms stream");

        // Fetch initial data - all platforms
        Flux<SseEventDTO<PlatformDataDTO>> initialData = orionLdClient.getAllPlatforms()
                .flatMapMany(platforms -> Flux.fromIterable(platforms))
                .map(data -> SseEventDTO.<PlatformDataDTO>builder()
                        .eventType("platform.initial")
                        .district(null)
                        .timestamp(java.time.Instant.now().toString())
                        .data(data)
                        .build())
                .doOnNext(event -> log.debug("Sending initial platform: {}", event.getData().getName()));

        // Combine initial data + live stream
        return Flux.concat(
                initialData,
                allPlatformsSink.asFlux()
                        .timeout(Duration.ofHours(24))
                        .onErrorResume(e -> {
                            log.error("Error in all-platforms stream: {}", e.getMessage());
                            return Flux.empty();
                        }));
    }

    // ============ Device Streams ============

    /**
     * Subscribe to device updates for a specific device ID
     * Fetches initial data from Orion-LD before streaming updates
     */
    public Flux<SseEventDTO<DeviceDataDTO>> subscribeDevice(String deviceId) {
        String key = "device:" + deviceId;

        Sinks.Many<SseEventDTO<DeviceDataDTO>> sink = deviceSinks.computeIfAbsent(key,
                k -> Sinks.many().multicast().onBackpressureBuffer());

        log.info("Client subscribed to device stream: {}", deviceId);

        // Fetch initial data from Orion-LD
        Flux<SseEventDTO<DeviceDataDTO>> initialData = orionLdClient.getDevice(deviceId)
                .map(data -> SseEventDTO.<DeviceDataDTO>builder()
                        .eventType("device.initial")
                        .district(null)
                        .timestamp(java.time.Instant.now().toString())
                        .data(data)
                        .build())
                .flux()
                .doOnNext(event -> log.info("Sending initial device data: {}", deviceId));

        return Flux.concat(
                initialData,
                sink.asFlux()
                        .doOnCancel(() -> {
                            log.info("Client unsubscribed from device stream: {}", deviceId);
                            if (sink.currentSubscriberCount() == 0) {
                                deviceSinks.remove(key);
                            }
                        })
                        .timeout(Duration.ofHours(24))
                        .onErrorResume(e -> {
                            log.error("Error in device stream {}: {}", deviceId, e.getMessage());
                            return Flux.empty();
                        }));
    }
    public Flux<Map<String, AirQualityDataDTO>> subscribeAllEnvironmentData() {
        log.info("Client subscribed to all-environment-data stream");
        
        return allEnvironmentSink.asFlux()
            .timeout(Duration.ofHours(24))
            .onErrorResume(e -> {
                log.error("Error in all-environment-data stream: {}", e.getMessage());
                return Flux.empty();
            });
    }

    public void broadcastAllEnvironmentData(Map<String, AirQualityDataDTO> dataMap) {
        if (dataMap == null || dataMap.isEmpty()) {
            log.warn("Empty environment data map, not broadcasting");
            return;
        }
        
        Sinks.EmitResult result = allEnvironmentSink.tryEmitNext(dataMap);
        if (result.isSuccess()) {
            log.debug("Broadcasted environment data update to Python service ({} stations)", 
                dataMap.size());
        } else {
            log.warn("Failed to broadcast environment data: {}", result);
        }
    }
    /**
     * Broadcast device data to subscribed clients
     */
    public void broadcastDevice(DeviceDataDTO data) {
        String deviceId = data.getEntityId();
        if (deviceId == null) {
            log.warn("Device data missing entity ID, cannot broadcast");
            return;
        }

        String key = "device:" + deviceId;
        Sinks.Many<SseEventDTO<DeviceDataDTO>> sink = deviceSinks.get(key);

        if (sink != null) {
            SseEventDTO<DeviceDataDTO> event = SseEventDTO.<DeviceDataDTO>builder()
                    .eventType("device.update")
                    .district(null)
                    .timestamp(java.time.Instant.now().toString())
                    .data(data)
                    .build();

            Sinks.EmitResult result = sink.tryEmitNext(event);
            if (result.isSuccess()) {
                log.debug("Broadcasted device update: {}", deviceId);
            } else {
                log.warn("Failed to broadcast device update {}: {}", deviceId, result);
            }
        } else {
            log.debug("No subscribers for device: {}", deviceId);
        }
    }

    // ============ Utility Methods ============

    /**
     * Get active subscriber counts for monitoring
     */
    public Map<String, Integer> getSubscriberCounts() {
        Map<String, Integer> counts = new ConcurrentHashMap<>();
        counts.put("weather", weatherSinks.size());
        counts.put("airQuality", airQualitySinks.size());
        counts.put("platform", platformSinks.size());
        counts.put("device", deviceSinks.size());
        counts.put("weatherHistory", weatherHistorySinks.size());
        counts.put("airQualityHistory", airQualityHistorySinks.size());
        return counts;
    }
}