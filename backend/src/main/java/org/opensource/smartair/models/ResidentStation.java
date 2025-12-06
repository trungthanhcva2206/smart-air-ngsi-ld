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
package org.opensource.smartair.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Model ResidentStation - Quan hệ Many-to-Many giữa Resident và District
 * Lưu thông tin subscription của cư dân cho các trạm quan trắc
 */
@Entity
@Table(name = "resident_stations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResidentStation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Many-to-One relationship với Resident
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resident_id", nullable = false)
    @JsonIgnore
    private Resident resident;

    /**
     * Tên district/trạm (VD: "PhuongHoanKiem", "PhuongBaDinh")
     * Khớp với field `stationName` hoặc `district` trong
     * WeatherObserved/AirQualityObserved
     */
    @Column(nullable = false)
    private String district;

    /**
     * Thời điểm đăng ký
     */
    @Column(name = "subscribed_at", nullable = false, updatable = false)
    private LocalDateTime subscribedAt;

    @PrePersist
    protected void onCreate() {
        subscribedAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof ResidentStation))
            return false;
        ResidentStation that = (ResidentStation) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(district, that.district);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, district);
    }
}
