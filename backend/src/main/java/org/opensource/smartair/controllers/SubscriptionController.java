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
import org.opensource.smartair.services.OrionSubscriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

/**
 * Controller for managing NGSI-LD subscriptions
 * Provides endpoints to manually trigger subscription creation/deletion
 */
@Slf4j
@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final OrionSubscriptionService subscriptionService;

    /**
     * Create all subscriptions manually
     * POST /api/subscriptions/create
     */
    @PostMapping("/create")
    public Mono<ResponseEntity<Map<String, String>>> createAllSubscriptions() {
        log.info("Manual subscription creation triggered");

        return subscriptionService.createWeatherSubscription()
                .then(subscriptionService.createAirQualitySubscription())
                .then(subscriptionService.createPlatformSubscription())
                .then(subscriptionService.createDeviceSubscription())
                .then(Mono.just(ResponseEntity.ok(Map.of(
                        "status", "success",
                        "message", "All subscriptions created"))))
                .onErrorResume(e -> {
                    log.error("Error creating subscriptions", e);
                    return Mono.just(ResponseEntity.internalServerError()
                            .body(Map.of("status", "error", "message", e.getMessage())));
                });
    }

    /**
     * List all subscriptions
     * GET /api/subscriptions/list
     */
    @GetMapping("/list")
    public Mono<ResponseEntity<List<Map<String, Object>>>> listSubscriptions() {
        return subscriptionService.listSubscriptions()
                .map(ResponseEntity::ok)
                .onErrorResume(e -> {
                    log.error("Error listing subscriptions", e);
                    return Mono.just(ResponseEntity.internalServerError().body(List.of()));
                });
    }

    /**
     * Health check
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "subscription-manager"));
    }
}
