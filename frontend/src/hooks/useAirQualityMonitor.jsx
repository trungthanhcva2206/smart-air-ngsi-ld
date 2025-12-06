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

import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { SSE_ENDPOINTS } from '../services/sse.config';

/**
 * Custom hook to monitor GLOBAL air quality alerts from all districts
 * Uses single SSE connection to /api/sse/airquality/alerts
 * Backend only broadcasts when AQI >= 4 (poor/very poor)
 * 
 * @param {number} throttleMinutes - Minutes between notifications per district (default: 15)
 */
export const useAirQualityMonitor = (throttleMinutes = 15) => {
    const lastNotificationTime = useRef({});
    const NOTIFICATION_THROTTLE = throttleMinutes * 60 * 1000;

    useEffect(() => {
        let isMounted = true;
        let eventSource = null;

        try {
            // Single SSE connection for ALL districts
            eventSource = new EventSource(SSE_ENDPOINTS.AIR_QUALITY_ALERTS);

            // Listen for air quality alerts (AQI >= 4)
            eventSource.addEventListener('airquality.alert', (event) => {
                if (!isMounted) return;

                try {
                    const eventData = JSON.parse(event.data);
                    const { district, data: airQuality } = eventData;

                    // Check throttle
                    const now = Date.now();
                    const lastNotified = lastNotificationTime.current[district] || 0;

                    if (now - lastNotified >= NOTIFICATION_THROTTLE) {
                        const levelText = airQuality.airQualityIndex === 4 ? 'Kém' : 'Rất kém';

                        toast.error(
                            `CẢNH BÁO: Chất lượng không khí tại ${district} đang ở mức ${levelText} (AQI: ${airQuality.airQualityIndex})`,
                            {
                                position: "bottom-left"
                            }
                        );

                        // Update last notification time for this district
                        lastNotificationTime.current[district] = now;
                    }
                } catch (error) {
                    console.error('Error parsing air quality alert:', error);
                }
            });

            eventSource.onerror = (error) => {
                if (!isMounted) return;

                if (eventSource.readyState !== EventSource.CLOSED) {
                    console.error('SSE air quality alerts error:', error);
                }
            };

            eventSource.onopen = () => {
                console.log('Connected to air quality alerts stream');
            };

        } catch (error) {
            console.error('Failed to create air quality alerts SSE connection:', error);
        }

        // Cleanup on unmount
        return () => {
            isMounted = false;
            if (eventSource) {
                setTimeout(() => {
                    try {
                        eventSource.close();
                        console.log('Disconnected from air quality alerts stream');
                    } catch (error) {
                        // Ignore cleanup errors
                    }
                }, 100);
            }
        };
    }, [NOTIFICATION_THROTTLE]);
};
