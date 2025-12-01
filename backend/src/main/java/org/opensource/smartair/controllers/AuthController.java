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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opensource.smartair.dtos.ApiResponseDTO;
import org.opensource.smartair.dtos.AuthResponseDTO;
import org.opensource.smartair.dtos.CreateResidentDTO;
import org.opensource.smartair.dtos.LoginRequestDTO;
import org.opensource.smartair.services.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller cho Authentication (Blocking JPA)
 * Base path: /api/auth
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "API đăng ký và đăng nhập")
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/register
     * Đăng ký tài khoản mới (RESIDENT)
     */
    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản", description = "Tạo User + Resident, trả về JWT token")
    public ResponseEntity<ApiResponseDTO<AuthResponseDTO>> register(@Valid @RequestBody CreateResidentDTO dto) {
        log.info("POST /api/auth/register - email: {}", dto.getEmail());

        try {
            AuthResponseDTO authData = authService.register(dto);
            ApiResponseDTO<AuthResponseDTO> response = ApiResponseDTO.<AuthResponseDTO>builder()
                    .ec(0)
                    .em("Đăng ký tài khoản thành công")
                    .dt(authData)
                    .build();
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Registration failed: {}", e.getMessage());
            ApiResponseDTO<AuthResponseDTO> errorResponse = ApiResponseDTO.<AuthResponseDTO>builder()
                    .ec(1)
                    .em("Đăng ký thất bại: " + e.getMessage())
                    .dt(null)
                    .build();
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * POST /api/auth/login
     * Đăng nhập (RESIDENT hoặc ADMIN)
     */
    @PostMapping("/login")
    @Operation(summary = "Đăng nhập", description = "Authenticate và trả về JWT token")
    public ResponseEntity<ApiResponseDTO<AuthResponseDTO>> login(@Valid @RequestBody LoginRequestDTO dto) {
        log.info("POST /api/auth/login - email: {}", dto.getEmail());

        try {
            AuthResponseDTO authData = authService.login(dto);
            ApiResponseDTO<AuthResponseDTO> response = ApiResponseDTO.<AuthResponseDTO>builder()
                    .ec(0)
                    .em("Đăng nhập thành công")
                    .dt(authData)
                    .build();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed: {}", e.getMessage());
            ApiResponseDTO<AuthResponseDTO> errorResponse = ApiResponseDTO.<AuthResponseDTO>builder()
                    .ec(1)
                    .em("Đăng nhập thất bại: " + e.getMessage())
                    .dt(null)
                    .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }
}
