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
import org.opensource.smartair.dtos.AirQualityDataDTO;
import org.opensource.smartair.models.Resident;
import org.opensource.smartair.repositories.ResidentRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service xử lý logic gửi thông báo
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final ResidentRepository residentRepository;
    private final EmailService emailService;

    /**
     * Gửi cảnh báo chất lượng không khí đến tất cả residents
     * CHỈ gửi khi AQI ở mức poor (4) hoặc very poor (5)
     */
    @Async
    public void sendAirQualityAlert(AirQualityDataDTO airQuality) {
        // Kiểm tra có cần gửi cảnh báo không
        if (!shouldSendAlert(airQuality)) {
            log.debug("Air quality level is acceptable ({}), no alert needed",
                    airQuality.getAirQualityLevel());
            return;
        }

        // Lấy tất cả residents đã verify và bật notification
        List<Resident> recipients = residentRepository.findByIsVerifiedTrueAndNotificationEnabledTrue();

        if (recipients.isEmpty()) {
            log.warn("No residents found to send air quality alert");
            return;
        }

        String district = airQuality.getDistrict() != null ? airQuality.getDistrict() : airQuality.getStationName();
        log.info("Sending air quality alert for {} (AQI: {}, Level: {}) to {} residents",
                district, airQuality.getAirQualityIndex(), airQuality.getAirQualityLevel(), recipients.size());

        // Gửi email đến từng resident
        for (Resident resident : recipients) {
            try {
                emailService.sendAirQualityAlert(
                        resident.getEmail(),
                        resident.getFullName(),
                        airQuality);
            } catch (Exception e) {
                log.error("Failed to send alert to resident: {}", resident.getEmail(), e);
            }
        }

        log.info("Successfully sent air quality alerts to {} residents", recipients.size());
    }

    /**
     * Kiểm tra có nên gửi cảnh báo không
     * Chỉ gửi khi:
     * - AQI Index = 4 (poor) hoặc 5 (very poor)
     * - HOẶC Level = "poor" hoặc "very poor"
     */
    private boolean shouldSendAlert(AirQualityDataDTO airQuality) {
        // Kiểm tra theo AQI Index
        Integer aqi = airQuality.getAirQualityIndex();
        if (aqi != null && aqi >= 4) {
            return true;
        }

        // Kiểm tra theo Level text
        String level = airQuality.getAirQualityLevel();
        if (level != null) {
            String lowerLevel = level.toLowerCase();
            return lowerLevel.equals("poor") || lowerLevel.equals("very poor");
        }

        return false;
    }
}
