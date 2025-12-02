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
 * @Copyright (C) 2025 CHK. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
 */
package org.opensource.smartair.services;

import lombok.RequiredArgsConstructor;
import org.opensource.smartair.dtos.ResidentDTO;
import org.opensource.smartair.dtos.UpdateResidentDTO;
import org.opensource.smartair.models.Resident;
import org.opensource.smartair.models.ResidentStation;
import org.opensource.smartair.repositories.ResidentRepository;
import org.opensource.smartair.repositories.ResidentStationRepository;
import org.opensource.smartair.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

/**
 * Service xử lý business logic cho Resident
 */
@Service
@RequiredArgsConstructor
public class ResidentService {

    private final ResidentRepository residentRepository;
    private final UserRepository userRepository;

    /**
     * Lấy thông tin resident theo userId
     */
    @Transactional(readOnly = true)
    public ResidentDTO getResidentByUserId(Long userId) {
        Resident resident = residentRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Resident not found for userId: " + userId));

        return mapToDTO(resident);
    }

    /**
     * Update thông tin resident
     * - Update fullName, email (User table)
     * - Update notificationEnabled (Resident table)
     * - Update subscriptions (ResidentStation table)
     */
    @Transactional
    public ResidentDTO updateResident(Long userId, UpdateResidentDTO updateDTO) {
        Resident resident = residentRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Resident not found"));

        // 1. Update User info (fullName, email)
        if (updateDTO.getFullName() != null && !updateDTO.getFullName().isBlank()) {
            resident.getUser().setFullName(updateDTO.getFullName());
        }

        if (updateDTO.getEmail() != null && !updateDTO.getEmail().isBlank()) {
            // Check email đã tồn tại chưa (trừ email của chính user này)
            if (userRepository.existsByEmail(updateDTO.getEmail()) &&
                    !resident.getUser().getEmail().equals(updateDTO.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            resident.getUser().setEmail(updateDTO.getEmail());
        }

        // 2. Update notification settings
        if (updateDTO.getNotificationEnabled() != null) {
            resident.setNotificationEnabled(updateDTO.getNotificationEnabled());
        }

        // 3. Update subscriptions (CẬP NHẬT ResidentStation table)
        if (updateDTO.getDistricts() != null) {
            // Xóa hết subscriptions cũ (orphanRemoval=true sẽ DELETE khỏi DB)
            resident.getStations().clear();

            // Thêm subscriptions mới (cascade=ALL sẽ INSERT vào DB)
            for (String district : updateDTO.getDistricts()) {
                ResidentStation station = new ResidentStation();
                station.setResident(resident);
                station.setDistrict(district);
                station.setSubscribedAt(LocalDateTime.now());
                resident.getStations().add(station);
            }
        }

        // 4. Force update updatedAt timestamp
        resident.setUpdatedAt(LocalDateTime.now());

        Resident saved = residentRepository.save(resident);
        return mapToDTO(saved);
    }

    /**
     * Map Resident entity → ResidentDTO
     */
    private ResidentDTO mapToDTO(Resident resident) {
        ResidentDTO dto = new ResidentDTO();
        dto.setId(resident.getId());
        dto.setUserId(resident.getUser().getId());
        dto.setFullName(resident.getUser().getFullName());
        dto.setEmail(resident.getUser().getEmail());
        dto.setNotificationEnabled(resident.getNotificationEnabled());
        dto.setCreatedAt(resident.getCreatedAt());
        dto.setUpdatedAt(resident.getUpdatedAt());

        // Map subscribed stations (từ ResidentStation)
        dto.setDistricts(
                resident.getStations().stream()
                        .map(ResidentStation::getDistrict)
                        .collect(Collectors.toList()));

        return dto;
    }
}
