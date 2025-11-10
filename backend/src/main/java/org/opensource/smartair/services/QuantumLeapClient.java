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

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class QuantumLeapClient {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${quantumleap.url:http://localhost:8668}")
    private String quantumLeapUrl;

    @Value("${orion.tenant:hanoi}")
    private String tenant;

    public QuantumLeapClient(
            @Value("${quantumleap.url:http://localhost:8668}") String quantumLeapUrl,
            @Value("${orion.tenant:hanoi}") String tenant) {
        this.quantumLeapUrl = quantumLeapUrl;
        this.tenant = tenant;
        this.objectMapper = new ObjectMapper();

        log.info("Initializing QuantumLeapClient with URL: {}, Tenant: {}", quantumLeapUrl, tenant);

        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(10 * 1024 * 1024)) // 10MB
                .build();

        this.webClient = WebClient.builder()
                .baseUrl(quantumLeapUrl)
                .exchangeStrategies(strategies)
                .defaultHeader("Fiware-Service", tenant)
                .defaultHeader("Fiware-ServicePath", "/")
                .build();
    }

    /**
     * Get historical data for an entity (last 30 days)
     * @param entityId - Full URN (e.g., urn:ngsi-ld:AirQualityObserved:Hanoi-PhuongBaDinh)
     */
    public Mono<Map<String, Object>> getHistoricalData(String entityId) {
        log.info("Querying QuantumLeap for entity: {}", entityId);

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/entities/{entityId}")
                        .queryParam("lastN", "720") // 30 days * 24 hours = 720 data points (if hourly)
                        .build(entityId))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .doOnSuccess(data -> log.info("Successfully fetched historical data for: {}", entityId))
                .doOnError(error -> log.error("Error fetching historical data from QuantumLeap for: {}", entityId, error))
                .onErrorResume(error -> {
                    log.warn("QuantumLeap query failed, returning empty data");
                    return Mono.just(Map.of());
                });
    }

    /**
     * Get historical weather data for a district
     */
    public Mono<Map<String, Object>> getWeatherHistory(String district) {
        String entityId = String.format("urn:ngsi-ld:WeatherObserved:Hanoi-%s", district);
        return getHistoricalData(entityId);
    }

    /**
     * Get historical air quality data for a district
     */
    public Mono<Map<String, Object>> getAirQualityHistory(String district) {
        String entityId = String.format("urn:ngsi-ld:AirQualityObserved:Hanoi-%s", district);
        return getHistoricalData(entityId);
    }

    /**
     * Query with custom time range
     * @param entityId - Full URN
     * @param fromDate - ISO 8601 format (e.g., "2024-01-01T00:00:00Z")
     * @param toDate - ISO 8601 format
     */
    public Mono<Map<String, Object>> getHistoricalDataRange(String entityId, String fromDate, String toDate) {
        log.info("Querying QuantumLeap for entity: {} from {} to {}", entityId, fromDate, toDate);

        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/entities/{entityId}")
                        .queryParam("fromDate", fromDate)
                        .queryParam("toDate", toDate)
                        .build(entityId))
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .doOnSuccess(data -> log.info("Successfully fetched historical data range for: {}", entityId))
                .doOnError(error -> log.error("Error fetching historical data range from QuantumLeap", error))
                .onErrorResume(error -> Mono.just(Map.of()));
    }
}