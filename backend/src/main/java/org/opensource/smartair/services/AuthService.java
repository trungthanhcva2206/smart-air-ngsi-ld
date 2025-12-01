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
import org.opensource.smartair.dtos.AuthResponseDTO;
import org.opensource.smartair.dtos.CreateResidentDTO;
import org.opensource.smartair.dtos.LoginRequestDTO;
import org.opensource.smartair.models.Resident;
import org.opensource.smartair.models.ResidentStation;
import org.opensource.smartair.models.User;
import org.opensource.smartair.models.UserRole;
import org.opensource.smartair.repositories.ResidentRepository;
import org.opensource.smartair.repositories.ResidentStationRepository;
import org.opensource.smartair.repositories.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service xử lý Authentication & Authorization (Blocking JPA)
 * - Register (tạo User + Resident)
 * - Login (validate credentials, generate JWT)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

        private final UserRepository userRepository;
        private final ResidentRepository residentRepository;
        private final ResidentStationRepository residentStationRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;

        /**
         * Register new resident (BLOCKING)
         * 1. Check email đã tồn tại chưa
         * 2. Create User (role = RESIDENT)
         * 3. Create Resident (link với User qua @OneToOne)
         * 4. Subscribe districts nếu có (save to ResidentStation)
         * 5. Generate JWT token
         */
        @Transactional
        public AuthResponseDTO register(CreateResidentDTO dto) {
                log.info("Registering new resident with email: {}", dto.getEmail());

                // 1. Check email exists
                if (userRepository.existsByEmail(dto.getEmail())) {
                        throw new RuntimeException("Email already exists: " + dto.getEmail());
                }

                // 2. Create User
                User user = User.builder()
                                .fullName(dto.getFullName())
                                .email(dto.getEmail())
                                .password(passwordEncoder.encode(dto.getPassword()))
                                .role(UserRole.RESIDENT)
                                .build();
                user = userRepository.save(user);
                log.info("Created user with id: {}", user.getId());

                // 3. Create Resident (với @OneToOne relationship)
                Resident resident = Resident.builder()
                                .user(user)
                                .isVerified(true)
                                .notificationEnabled(dto.getNotificationEnabled() != null ? dto.getNotificationEnabled()
                                                : true)
                                .build();
                resident = residentRepository.save(resident);
                log.info("Created resident with id: {}", resident.getId());

                // 4. Subscribe districts nếu có
                Set<String> districts = Set.of();
                if (resident.getNotificationEnabled() && dto.getDistricts() != null && !dto.getDistricts().isEmpty()) {
                        for (String districtName : dto.getDistricts()) {
                                ResidentStation station = ResidentStation.builder()
                                                .resident(resident)
                                                .district(districtName)
                                                .build();
                                residentStationRepository.save(station);
                        }
                        districts = Set.copyOf(dto.getDistricts());
                        log.info("Subscribed to {} districts", districts.size());
                }

                // 5. Generate JWT
                String token = jwtService.generateToken(user);
                return AuthResponseDTO.builder()
                                .token(token)
                                .type("Bearer")
                                .id(user.getId())
                                .email(user.getEmail())
                                .fullName(user.getFullName())
                                .role(user.getRole())
                                .isVerified(resident.getIsVerified())
                                .subscribedDistricts(districts)
                                .build();
        }

        /**
         * Login existing user (BLOCKING)
         * 1. Authenticate với Spring Security
         * 2. Load User từ database
         * 3. Generate JWT token
         * 4. Load Resident profile + subscribed districts nếu là RESIDENT
         * 5. Return user info + token
         */
        public AuthResponseDTO login(LoginRequestDTO dto) {
                log.info("Login attempt for email: {}", dto.getEmail());

                // 1. Authenticate
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword()));

                // 2. Load user
                User user = userRepository.findByEmail(dto.getEmail())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // 3. Generate JWT
                String token = jwtService.generateToken(user);

                // 4. Build response
                AuthResponseDTO.AuthResponseDTOBuilder responseBuilder = AuthResponseDTO.builder()
                                .token(token)
                                .type("Bearer")
                                .id(user.getId())
                                .email(user.getEmail())
                                .fullName(user.getFullName())
                                .role(user.getRole());

                // 5. Load Resident info nếu là RESIDENT
                if (user.isResident()) {
                        Resident resident = residentRepository.findByUserId(user.getId())
                                        .orElseThrow(() -> new RuntimeException("Resident profile not found"));

                        // Load subscribed districts
                        Set<String> districts = residentStationRepository.findByResidentId(resident.getId())
                                        .stream()
                                        .map(ResidentStation::getDistrict)
                                        .collect(Collectors.toSet());

                        responseBuilder
                                        .isVerified(resident.getIsVerified())
                                        .subscribedDistricts(districts);
                } else {
                        // ADMIN không có resident profile
                        responseBuilder
                                        .isVerified(true)
                                        .subscribedDistricts(Set.of());
                }

                log.info("Login successful for user: {}", dto.getEmail());
                return responseBuilder.build();
        }
}
