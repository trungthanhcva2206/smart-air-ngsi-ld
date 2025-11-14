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

import axios from '../utils/axiosCustomize';

/**
 * Fetch devices for a platform
 * @param {string} platformId - Platform entity ID (URN)
 * @returns {Promise<{EC: number, EM: string, DT: Array}>}
 */
export const getDevicesByPlatform = async (platformId) => {
    try {
        return await axios.get(`/api/platforms/${platformId}/devices`);
    } catch (error) {
        console.error('Error fetching devices:', error);
        return {
            EC: -1,
            EM: error.message || 'Failed to fetch devices',
            DT: []
        };
    }
};

/**
 * Find specific device by sensor type
 * @param {Array} devices - Array of devices
 * @param {string} sensorType - Type of sensor (e.g., 'WeatherStation', 'AirQualityMonitor')
 * @returns {Object|null}
 */
export const findDeviceBySensorType = (devices, sensorType) => {
    try {
        return devices.find(device => device.sensorType === sensorType) || null;
    } catch (error) {
        console.error('Error finding device:', error);
        return null;
    }
};
