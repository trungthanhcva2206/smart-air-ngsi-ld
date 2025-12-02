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

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for Device (Sensor)
 * WeatherSensor or AirQualitySensor
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceDataDTO {

    private String entityId;
    private String name;
    private String description;
    private LocationDTO location;

    // Device category
    private List<String> deviceCategory; // ["sensor"]
    private String sensorType; // "WeatherStation" or "AirQualityMonitor"

    // What this device measures
    private List<String> controlledProperty; // ["temperature", "humidity", ...]
    private List<String> observes; // ObservableProperty URNs

    // Relationships
    private String isHostedBy; // Platform URN

    // Device metadata
    private String serialNumber;
    private String hardwareVersion;
    private String softwareVersion;
    private String firmwareVersion;
    private String brandName;
    private String modelName;
    private String deviceState; // "active", "inactive", "maintenance"

    // Installation info
    private String dateInstalled;
    private String dateFirstUsed;
    private String dataProvider;
    private String owner;
}
