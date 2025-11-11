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
package org.opensource.smartair.configs;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opensource.smartair.models.Resident;
import org.opensource.smartair.repositories.ResidentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seeder để tạo dữ liệu mẫu khi khởi động ứng dụng
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ApplicationSeeder implements CommandLineRunner {

    private final ResidentRepository residentRepository;

    @Override
    public void run(String... args) throws Exception {
        seedResidents();
    }

    /**
     * Tạo 2 resident mẫu nếu chưa có trong database
     */
    private void seedResidents() {
        long count = residentRepository.count();

        if (count > 0) {
            log.info("Database đã có {} residents, bỏ qua seeding", count);
            return;
        }

        log.info("Bắt đầu seed residents vào database...");

        // Resident 1
        Resident resident1 = Resident.builder()
                .fullName("Nguyễn Lê Tuấn Anh")
                .email("tadzltv22082004@gmail.com")
                .isVerified(true)
                .notificationEnabled(true)
                .build();

        // Resident 2
        Resident resident2 = Resident.builder()
                .fullName("Đặng Ngọc Linh")
                .email("ngoc.linhhh2110@gmail.com")
                .isVerified(true)
                .notificationEnabled(true)
                .build();

        residentRepository.save(resident1);
        residentRepository.save(resident2);

        log.info("Đã seed thành công 2 residents:");
        log.info("   1. {} - {}", resident1.getFullName(), resident1.getEmail());
        log.info("   2. {} - {}", resident2.getFullName(), resident2.getEmail());
    }
}
