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
/*
 * Service for managing SSE streams (with historical data support)
 */
/*
 * Service to query historical data from QuantumLeap
 */
package org.opensource.smartair.services;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class QuantumLeapClient {

    private final WebClient webClient;
    private final String fiwareService;

    @Value("${quantumleap.query.lastN:720}")
    private int lastN;

    public QuantumLeapClient(
            @Value("${quantumleap.url}") String quantumLeapUrl,
            @Value("${quantumleap.fiware-service:hanoi}") String fiwareService) {

        this.fiwareService = fiwareService;

        // ✅ Cấu hình Connection Pool
        ConnectionProvider connectionProvider = ConnectionProvider.builder("quantumleap-pool")
                .maxConnections(50)
                .maxIdleTime(Duration.ofSeconds(20))
                .maxLifeTime(Duration.ofSeconds(60))
                .pendingAcquireTimeout(Duration.ofSeconds(45))
                .evictInBackground(Duration.ofSeconds(120))
                .build();

        // ✅ Cấu hình HttpClient với timeouts
        HttpClient httpClient = HttpClient.create(connectionProvider)
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10000)
                .responseTimeout(Duration.ofSeconds(30))
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(30, TimeUnit.SECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(30, TimeUnit.SECONDS)));

        // ✅ Tạo WebClient với custom HttpClient
        this.webClient = WebClient.builder()
                .baseUrl(quantumLeapUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();

        log.info("✅ QuantumLeap WebClient initialized: {}", quantumLeapUrl);
    }

    // ============ Weather History ============
    public Mono<Map<String, Object>> getAggregatedAirQualityHistory(List<String> districts) {
        log.info("📊 Fetching aggregated air quality history for {} districts", districts.size());

        // Fetch history for each district in parallel
        List<Mono<Map.Entry<String, Object>>> monos = districts.stream()
                .map(district -> {
                    String entityId = String.format("urn:ngsi-ld:AirQualityObserved:Hanoi-%s", district);

                    return getAirQualityHistory(district)
                            .map(historyData -> Map.entry(district, (Object) historyData))
                            .onErrorResume(error -> {
                                log.warn("⚠️ Failed to fetch history for {}: {}", district, error.getMessage());
                                return Mono.just(Map.entry(district, (Object) new HashMap<>()));
                            });
                })
                .toList();

        // Combine all results into a single Map
        return Flux.merge(monos)
                .collectMap(Map.Entry::getKey, Map.Entry::getValue)
                .doOnSuccess(aggregated -> log.info("✅ Successfully aggregated history for {}/{} districts",
                        aggregated.size(), districts.size()))
                .doOnError(error -> log.error("❌ Error aggregating history: {}", error.getMessage()));
    }

    /**
     * ✅ NEW: Fetch aggregated weather history for ALL districts
     */
    public Mono<Map<String, Object>> getAggregatedWeatherHistory(List<String> districts) {
        log.info("📊 Fetching aggregated weather history for {} districts", districts.size());

        List<Mono<Map.Entry<String, Object>>> monos = districts.stream()
                .map(district -> getWeatherHistory(district)
                        .map(historyData -> Map.entry(district, (Object) historyData))
                        .onErrorResume(error -> {
                            log.warn("⚠️ Failed to fetch weather history for {}: {}", district, error.getMessage());
                            return Mono.just(Map.entry(district, (Object) new HashMap<>()));
                        }))
                .toList();

        return Flux.merge(monos)
                .collectMap(Map.Entry::getKey, Map.Entry::getValue)
                .doOnSuccess(aggregated -> log.info("✅ Successfully aggregated weather history for {}/{} districts",
                        aggregated.size(), districts.size()));
    }

    public Mono<Map<String, Object>> getWeatherHistory(String district) {
        String entityId = buildWeatherEntityId(district);

        log.info("Querying QuantumLeap for entity: {}", entityId);

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/entities/{entityId}")
                        .queryParam("lastN", lastN)
                        .queryParam("type", "WeatherObserved")
                        .build(entityId))
                .header("Fiware-Service", fiwareService)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                }) // ✅ FIX: Use ParameterizedTypeReference
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                        .filter(throwable -> throwable instanceof org.springframework.web.reactive.function.client.WebClientRequestException)
                        .doBeforeRetry(retrySignal -> log.warn("🔄 Retrying QuantumLeap request for {} (attempt {})",
                                entityId, retrySignal.totalRetries() + 1)))
                .doOnSuccess(data -> log.info("✅ Successfully fetched historical data for: {}", entityId))
                .onErrorResume(WebClientResponseException.NotFound.class, e -> {
                    log.warn("⚠️ No historical data found in QuantumLeap for: {}", entityId);
                    return Mono.just(Map.of());
                })
                .onErrorResume(WebClientResponseException.class, e -> {
                    log.error("❌ HTTP error fetching data from QuantumLeap for {}: {} - {}",
                            entityId, e.getStatusCode(), e.getMessage());
                    return Mono.just(Map.of());
                })
                .onErrorResume(Exception.class, e -> {
                    log.error("❌ Error fetching historical data from QuantumLeap for: {}", entityId, e);
                    return Mono.just(Map.of());
                })
                .doOnTerminate(() -> log.debug("✅ QuantumLeap request completed for: {}", entityId))
                .defaultIfEmpty(Map.of());
    }

    // ============ Air Quality History ============

    public Mono<Map<String, Object>> getAirQualityHistory(String district) {
        String entityId = buildAirQualityEntityId(district);

        log.info("Querying QuantumLeap for entity: {}", entityId);

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/entities/{entityId}")
                        .queryParam("lastN", lastN)
                        .queryParam("type", "AirQualityObserved")
                        .build(entityId))
                .header("Fiware-Service", fiwareService)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                }) // ✅ FIX: Use ParameterizedTypeReference
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                        .filter(throwable -> throwable instanceof org.springframework.web.reactive.function.client.WebClientRequestException)
                        .doBeforeRetry(retrySignal -> log.warn("🔄 Retrying QuantumLeap request for {} (attempt {})",
                                entityId, retrySignal.totalRetries() + 1)))
                .doOnSuccess(data -> log.info("✅ Successfully fetched historical data for: {}", entityId))
                .onErrorResume(WebClientResponseException.NotFound.class, e -> {
                    log.warn("⚠️ No historical data found in QuantumLeap for: {}", entityId);
                    return Mono.just(Map.of());
                })
                .onErrorResume(WebClientResponseException.class, e -> {
                    log.error("❌ HTTP error fetching data from QuantumLeap for {}: {} - {}",
                            entityId, e.getStatusCode(), e.getMessage());
                    return Mono.just(Map.of());
                })
                .onErrorResume(Exception.class, e -> {
                    log.error("❌ Error fetching historical data from QuantumLeap for: {}", entityId, e);
                    return Mono.just(Map.of());
                })
                .doOnTerminate(() -> log.debug("✅ QuantumLeap request completed for: {}", entityId))
                .defaultIfEmpty(Map.of());
    }

    // ============ Attribute History (Generic) ============

    /**
     * Get historical data for a specific attribute from QuantumLeap
     * Generic method for any entity type (Weather, AirQuality, Device)
     * 
     * @param entityId   Full URN (e.g.,
     *                   "urn:ngsi-ld:WeatherObserved:Hanoi-PhuongBaDinh")
     * @param attrName   Attribute name (e.g., "temperature", "pm2_5")
     * @param fromDate   Start date ISO 8601 (optional)
     * @param toDate     End date ISO 8601 (optional)
     * @param aggrMethod Aggregation: avg, sum, min, max, count (optional)
     * @param aggrPeriod Period: hour, day, week, month (optional)
     * @param lastN      Number of points (optional, fallback if no dates)
     * @return Mono with historical data
     */
    public Mono<Map<String, Object>> getAttributeHistory(
            String entityId, String attrName, String fromDate, String toDate,
            String aggrMethod, String aggrPeriod, Integer lastN) {

        // Clean and validate input parameters
        String cleanFromDate = fromDate != null ? fromDate.trim().replaceAll("^['\"]|['\"]$", "") : null;
        String cleanToDate = toDate != null ? toDate.trim().replaceAll("^['\"]|['\"]$", "") : null;

        log.info(
                "Querying QuantumLeap: {} attr: {} (fromDate: {}, toDate: {}, aggrMethod: {}, aggrPeriod: {}, lastN: {})",
                entityId, attrName, cleanFromDate, cleanToDate, aggrMethod, aggrPeriod, lastN);

        return webClient.get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder
                            .path("/v2/entities/{entityId}/attrs/{attrName}");

                    // QuantumLeap parameter order: aggrMethod -> aggrPeriod -> fromDate -> toDate
                    if (aggrMethod != null) {
                        builder.queryParam("aggrMethod", aggrMethod);
                    }
                    if (aggrPeriod != null) {
                        builder.queryParam("aggrPeriod", aggrPeriod);
                    }
                    if (cleanFromDate != null && cleanToDate != null) {
                        builder.queryParam("fromDate", cleanFromDate);
                        builder.queryParam("toDate", cleanToDate);
                    } else if (lastN != null) {
                        builder.queryParam("lastN", lastN);
                    } else {
                        builder.queryParam("lastN", this.lastN);
                    }

                    // Spring auto URL-encodes path variables
                    return builder.build(entityId, attrName);
                })
                .header("Fiware-Service", fiwareService)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                        .filter(throwable -> throwable instanceof org.springframework.web.reactive.function.client.WebClientRequestException)
                        .doBeforeRetry(
                                retrySignal -> log.warn("Retrying QuantumLeap request for {} attr {} (attempt {})",
                                        entityId, attrName, retrySignal.totalRetries() + 1)))
                .doOnSuccess(data -> log.info("Successfully fetched {} history for: {}", attrName, entityId))
                .onErrorResume(WebClientResponseException.NotFound.class, e -> {
                    log.warn("No historical data found in QuantumLeap for: {} attr: {}", entityId, attrName);
                    return Mono.just(Map.of());
                })
                .onErrorResume(WebClientResponseException.class, e -> {
                    log.error("HTTP error fetching {} history from QuantumLeap for {}: {} - {}",
                            attrName, entityId, e.getStatusCode(), e.getMessage());
                    return Mono.just(Map.of());
                })
                .onErrorResume(Exception.class, e -> {
                    log.error("Error fetching {} history from QuantumLeap for: {}", attrName, entityId, e);
                    return Mono.just(Map.of());
                })
                .doOnTerminate(() -> log.debug("QuantumLeap request completed for: {} attr: {}", entityId, attrName))
                .defaultIfEmpty(Map.of());
    }

    /**
     * Get weather attribute history by district name
     * Convenience method that builds WeatherObserved URN
     */
    public Mono<Map<String, Object>> getWeatherAttributeHistory(
            String district, String attrName, String fromDate, String toDate,
            String aggrMethod, String aggrPeriod, Integer lastN) {

        String entityId = buildWeatherEntityId(district);
        return getAttributeHistory(entityId, attrName, fromDate, toDate, aggrMethod, aggrPeriod, lastN);
    }

    /**
     * Get air quality attribute history by district name
     * Convenience method that builds AirQualityObserved URN
     */
    public Mono<Map<String, Object>> getAirQualityAttributeHistory(
            String district, String attrName, String fromDate, String toDate,
            String aggrMethod, String aggrPeriod, Integer lastN) {

        String entityId = buildAirQualityEntityId(district);
        return getAttributeHistory(entityId, attrName, fromDate, toDate, aggrMethod, aggrPeriod, lastN);
    }

    // ============ Helper Methods ============

    private String buildWeatherEntityId(String district) {
        return String.format("urn:ngsi-ld:WeatherObserved:Hanoi-%s", district);
    }

    private String buildAirQualityEntityId(String district) {
        return String.format("urn:ngsi-ld:AirQualityObserved:Hanoi-%s", district);
    }

}