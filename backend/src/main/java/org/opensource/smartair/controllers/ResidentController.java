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

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.opensource.smartair.dtos.ApiResponseDTO;
import org.opensource.smartair.dtos.ResidentDTO;
import org.opensource.smartair.dtos.UpdateResidentDTO;
import org.opensource.smartair.services.ResidentService;
import org.opensource.smartair.utils.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller quản lý thông tin Resident
 * - Update profile (notification + subscriptions)
 * Note: Không cần GET /me vì frontend lưu thông tin từ login response
 */
@RestController
@RequestMapping("/api/residents")
@RequiredArgsConstructor
public class ResidentController {

    private final ResidentService residentService;

    /**
     * Update profile của chính mình
     * - notificationEnabled: bật/tắt thông báo
     * - districts: danh sách quận subscribe (replace toàn bộ)
     */
    @PutMapping("/me")
    public ResponseEntity<ApiResponseDTO<ResidentDTO>> updateMyProfile(
            @Valid @RequestBody UpdateResidentDTO updateDTO) {
        try {
            Long currentUserId = SecurityUtils.getCurrentUserId();

            if (currentUserId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponseDTO.error("User not authenticated", null));
            }

            // Update cả notification và subscriptions (ResidentStation table)
            ResidentDTO updated = residentService.updateResident(currentUserId, updateDTO);
            return ResponseEntity.ok(ApiResponseDTO.success("Profile updated successfully", updated));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDTO.error(e.getMessage(), null));
        }
    }
}
