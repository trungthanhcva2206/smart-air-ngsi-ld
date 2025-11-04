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
import { platforms } from './platforms';
import { devices } from './devices';
import { weatherObservations } from './weatherObservations';
import { airQualityObservations } from './airQualityObservations';

/**
 * Combines platform and device data into station objects for map display
 * @returns {Array} Array of station objects with platform and ALL its devices
 */
export const getStations = () => {
    const stations = [];

    platforms.forEach((platform) => {
        const platformId = platform.id;
        const coordinates = platform.location.value.coordinates;

        // Find ALL related devices
        const relatedDeviceIds = platform.hosts?.object || [];
        const platformDevices = devices.filter(d => relatedDeviceIds.includes(d.id));

        if (platformDevices.length > 0) {
            stations.push({
                id: platformId,
                lat: coordinates[1],
                lng: coordinates[0],
                platform,
                devices: platformDevices // Array of all devices
            });
        }
    });

    return stations;
};

// Export individual data arrays
export { platforms, devices, weatherObservations, airQualityObservations };

// Export combined stations for convenience
export const stations = getStations();
