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
package org.opensource.smartair.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO cho Update Resident Profile
 * TẤT CẢ fields đều OPTIONAL (null = không update field đó)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateResidentDTO {

    /**
     * Full name - OPTIONAL
     */
    @Size(min = 2, max = 100, message = "Họ tên phải từ 2-100 ký tự")
    private String fullName;

    /**
     * Email - OPTIONAL
     */
    @Email(message = "Email không hợp lệ")
    private String email;

    /**
     * Notification enabled - OPTIONAL
     */
    private Boolean notificationEnabled;

    /**
     * Districts to subscribe - OPTIONAL
     * - null: Không update subscriptions
     * - []: Xóa hết subscriptions
     * - ["HoanKiem", "BaDinh"]: Replace bằng list mới
     */
    private List<String> districts;
}
