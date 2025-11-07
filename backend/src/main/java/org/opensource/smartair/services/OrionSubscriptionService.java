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

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * Service to manage NGSI-LD subscriptions in Orion-LD
 * Automatically creates subscriptions when backend starts
 */
@Slf4j
@Service
public class OrionSubscriptionService {

    private final WebClient webClient;

    @Value("${orion.url:http://orion:1026}")
    private String orionUrl;

    @Value("${orion.tenant:hanoi}")
    private String tenant;

    @Value("${backend.url:http://backend:8081}")
    private String backendUrl;

    public OrionSubscriptionService(
            @Value("${orion.url:http://orion:1026}") String orionUrl,
            @Value("${orion.tenant:hanoi}") String tenant) {
        this.orionUrl = orionUrl;
        this.tenant = tenant;

        this.webClient = WebClient.builder()
                .baseUrl(orionUrl)
                .defaultHeader("Fiware-Service", tenant)
                .defaultHeader("Fiware-ServicePath", "/")
                .defaultHeader("NGSILD-Tenant", tenant)
                .defaultHeader("Content-Type", "application/ld+json")
                .build();

        log.info("Initialized OrionSubscriptionService for Orion: {}, Tenant: {}", orionUrl, tenant);
    }

    /**
     * Create all subscriptions when application starts
     */
    @EventListener(ApplicationReadyEvent.class)
    public void createSubscriptionsOnStartup() {
        log.info("Creating NGSI-LD subscriptions in Orion-LD...");

        createWeatherSubscription()
                .then(createAirQualitySubscription())
                .then(createPlatformSubscription())
                .then(createDeviceSubscription())
                .doOnSuccess(v -> log.info("All subscriptions created successfully"))
                .doOnError(e -> log.error("Error creating subscriptions", e))
                .subscribe();
    }

    /**
     * Create subscription for WeatherObserved entities
     */
    public Mono<Void> createWeatherSubscription() {
        String subscriptionId = "urn:ngsi-ld:Subscription:WeatherObserved-Backend";

        Map<String, Object> subscription = Map.of(
                "id", subscriptionId,
                "type", "Subscription",
                "entities", List.of(Map.of("type", "weatherObserved")),
                "notification", Map.of(
                        "endpoint", Map.of(
                                "uri", backendUrl + "/api/notify/ngsi",
                                "accept", "application/json"),
                        "format", "normalized"),
                "@context",
                "https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld");

        return createOrUpdateSubscription(subscriptionId, subscription, "WeatherObserved");
    }

    /**
     * Create subscription for AirQualityObserved entities
     */
    public Mono<Void> createAirQualitySubscription() {
        String subscriptionId = "urn:ngsi-ld:Subscription:AirQualityObserved-Backend";

        Map<String, Object> subscription = Map.of(
                "id", subscriptionId,
                "type", "Subscription",
                "entities", List.of(Map.of("type", "airQualityObserved")),
                "notification", Map.of(
                        "endpoint", Map.of(
                                "uri", backendUrl + "/api/notify/ngsi",
                                "accept", "application/json"),
                        "format", "normalized"),
                "@context",
                "https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld");

        return createOrUpdateSubscription(subscriptionId, subscription, "AirQualityObserved");
    }

    /**
     * Create subscription for Platform entities
     */
    public Mono<Void> createPlatformSubscription() {
        String subscriptionId = "urn:ngsi-ld:Subscription:Platform-Backend";

        Map<String, Object> subscription = Map.of(
                "id", subscriptionId,
                "type", "Subscription",
                "entities", List.of(Map.of("type", "Platform")),
                "notification", Map.of(
                        "endpoint", Map.of(
                                "uri", backendUrl + "/api/notify/ngsi",
                                "accept", "application/json"),
                        "format", "normalized"),
                "@context",
                "https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld");

        return createOrUpdateSubscription(subscriptionId, subscription, "Platform");
    }

    /**
     * Create subscription for Device entities
     */
    public Mono<Void> createDeviceSubscription() {
        String subscriptionId = "urn:ngsi-ld:Subscription:Device-Backend";

        Map<String, Object> subscription = Map.of(
                "id", subscriptionId,
                "type", "Subscription",
                "entities", List.of(Map.of("type", "Device")),
                "notification", Map.of(
                        "endpoint", Map.of(
                                "uri", backendUrl + "/api/notify/ngsi",
                                "accept", "application/json"),
                        "format", "normalized"),
                "@context",
                "https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld");

        return createOrUpdateSubscription(subscriptionId, subscription, "Device");
    }

    /**
     * Create or update subscription (idempotent)
     * Check if exists, delete old one, create new one
     */
    private Mono<Void> createOrUpdateSubscription(String subscriptionId, Map<String, Object> subscription,
            String entityType) {
        return checkSubscriptionExists(subscriptionId)
                .flatMap(exists -> {
                    if (exists) {
                        log.info("Subscription {} already exists, deleting old one...", subscriptionId);
                        return deleteSubscription(subscriptionId);
                    }
                    return Mono.empty();
                })
                .then(webClient.post()
                        .uri("/ngsi-ld/v1/subscriptions")
                        .bodyValue(subscription)
                        .retrieve()
                        .bodyToMono(Void.class)
                        .doOnSuccess(v -> log.info("Created subscription for {} entities", entityType))
                        .doOnError(e -> log.error("Failed to create subscription for {}: {}", entityType,
                                e.getMessage())))
                .onErrorResume(e -> {
                    log.warn("Error in subscription creation for {}, continuing...", entityType);
                    return Mono.empty();
                });
    }

    /**
     * Check if subscription exists
     */
    private Mono<Boolean> checkSubscriptionExists(String subscriptionId) {
        return webClient.get()
                .uri("/ngsi-ld/v1/subscriptions/{id}", subscriptionId)
                .retrieve()
                .toBodilessEntity()
                .map(response -> response.getStatusCode().is2xxSuccessful())
                .onErrorReturn(false);
    }

    /**
     * Delete subscription
     */
    private Mono<Void> deleteSubscription(String subscriptionId) {
        return webClient.delete()
                .uri("/ngsi-ld/v1/subscriptions/{id}", subscriptionId)
                .retrieve()
                .bodyToMono(Void.class)
                .doOnSuccess(v -> log.info("Deleted old subscription: {}", subscriptionId))
                .onErrorResume(e -> {
                    log.warn("Failed to delete subscription {}: {}", subscriptionId, e.getMessage());
                    return Mono.empty();
                });
    }

    /**
     * List all subscriptions (for debugging)
     */
    public Mono<List<Map<String, Object>>> listSubscriptions() {
        return webClient.get()
                .uri("/ngsi-ld/v1/subscriptions")
                .retrieve()
                .bodyToFlux(Map.class)
                .cast(Map.class)
                .collectList()
                .map(list -> (List<Map<String, Object>>) (List<?>) list)
                .doOnSuccess(subs -> log.info("Found {} subscriptions", subs != null ? subs.size() : 0))
                .onErrorResume(e -> {
                    log.error("Error listing subscriptions", e);
                    return Mono.just(List.of());
                });
    }
}
