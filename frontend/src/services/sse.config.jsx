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

// Backend API base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

// SSE Endpoints
export const SSE_ENDPOINTS = {
    // Stream all platform entities
    PLATFORMS: `${API_BASE_URL}/api/sse/platforms`,

    // Stream weather + air quality for a district
    DISTRICT: (district) => `${API_BASE_URL}/api/sse/district/${district}`,

    // Global air quality alerts (AQI >= 4)
    AIR_QUALITY_ALERTS: `${API_BASE_URL}/api/sse/airquality/alerts`,

    // Optional: Individual streams
    WEATHER: (district) => `${API_BASE_URL}/api/sse/weather/${district}`,
    AIR_QUALITY: (district) => `${API_BASE_URL}/api/sse/airquality/${district}`,
    PLATFORM: (platformId) => `${API_BASE_URL}/api/sse/platform/${platformId}`,
    DEVICE: (deviceId) => `${API_BASE_URL}/api/sse/device/${deviceId}`,
};

// SSE Event Names
export const SSE_EVENTS = {
    // Platform events
    PLATFORM_UPDATE: 'platform.update',

    // Weather events
    WEATHER_UPDATE: 'weather.update',

    // Air Quality events
    AIR_QUALITY_UPDATE: 'airquality.update',
    AIR_QUALITY_ALERT: 'airquality.alert',

    // Device events
    DEVICE_UPDATE: 'device.update',
};
