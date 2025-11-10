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
import org.springframework.context.annotation.Bean;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;
import reactor.util.retry.Retry;

import java.time.Duration;
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
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {}) // ✅ FIX: Use ParameterizedTypeReference
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
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {}) // ✅ FIX: Use ParameterizedTypeReference
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

    // ============ Helper Methods ============

    private String buildWeatherEntityId(String district) {
        return String.format("urn:ngsi-ld:WeatherObserved:Hanoi-%s", district);
    }

    private String buildAirQualityEntityId(String district) {
        return String.format("urn:ngsi-ld:AirQualityObserved:Hanoi-%s", district);
    }
}