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

import { useState, useEffect, useRef } from 'react';
import { SSE_ENDPOINTS, SSE_EVENTS } from '../services/sse.config';

/**
 * Hook to stream weather + air quality data for a specific district via SSE
 * Receives combined weather and air quality updates
 * 
 * @param {string} district - District name (e.g., "PhuongHoanKiem", "BaDinh")
 */
export const useDistrictSSE = (district) => {
    const [weatherData, setWeatherData] = useState(null);
    const [airQualityData, setAirQualityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        // Don't connect if no district is selected
        if (!district) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // Create EventSource connection for the district
        const eventSource = new EventSource(SSE_ENDPOINTS.DISTRICT(district));
        eventSourceRef.current = eventSource;

        // ========== UPDATE EVENTS (sent when data changes) ==========

        // Handle weather.update events
        eventSource.addEventListener(SSE_EVENTS.WEATHER_UPDATE, (event) => {
            try {
                const sseEvent = JSON.parse(event.data);
                const weather = sseEvent.data.data;
                console.log('Received weather update for district:', district, weather);
                setWeatherData(weather);
                setLoading(false);
            } catch (err) {
                console.error('Error parsing weather.update:', err);
                setError('Lỗi khi xử lý dữ liệu thời tiết');
            }
        });

        // Handle airquality.update events
        eventSource.addEventListener(SSE_EVENTS.AIR_QUALITY_UPDATE, (event) => {
            try {
                const sseEvent = JSON.parse(event.data);
                const airQuality = sseEvent.data.data;

                setAirQualityData(airQuality);
                setLoading(false);
            } catch (err) {
                console.error('Error parsing airquality.update:', err);
                setError('Lỗi khi xử lý dữ liệu chất lượng không khí');
            }
        });

        // Handle connection errors
        eventSource.onerror = (err) => {
            console.error('SSE Connection Error for district:', district, err);
            setError('Không thể kết nối đến server');
            setLoading(false);
        };

        // Handle successful connection
        eventSource.onopen = () => {
            console.log('SSE Connected to district:', district);
            setError(null);
        };

        // Cleanup on unmount or district change
        return () => {
            console.log('Closing SSE connection to district:', district);
            eventSource.close();
        };
    }, [district]); // Reconnect when district changes

    return { weatherData, airQualityData, loading, error };
};
