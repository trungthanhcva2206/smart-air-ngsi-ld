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
 * Hook to stream all platform entities via SSE
 * Receives initial data and live updates for all monitoring stations
 */
export const usePlatformsSSE = () => {
    const [platforms, setPlatforms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        // Create EventSource connection
        const eventSource = new EventSource(SSE_ENDPOINTS.PLATFORMS);
        eventSourceRef.current = eventSource;

        const timeout = setTimeout(() => setLoading(false), 3000); // fallback sau 3s

        // Handle platform.update events (sent when platform changes)
        eventSource.addEventListener(SSE_EVENTS.PLATFORM_UPDATE, (event) => {
            try {
                const sseEvent = JSON.parse(event.data);
                const platformData = sseEvent.data;


                // Update existing platform
                setPlatforms(prev => {
                    const index = prev.findIndex(p => p.entityId === platformData.entityId);
                    if (index === -1) {
                        // Platform not found, add it
                        return [...prev, platformData];
                    }
                    // Update existing platform
                    const updated = [...prev];
                    updated[index] = platformData;
                    return updated;
                });
            } catch (err) {
                console.error('Error parsing platform.update:', err);
            }
        });

        // Handle connection errors
        eventSource.onerror = (err) => {
            console.error('SSE Connection Error:', err);
            setError('Không thể kết nối đến server');
            setLoading(false);
        };

        // Handle successful connection
        eventSource.onopen = () => {
            console.log('SSE Connected to platforms endpoint');
            setError(null);
        };

        // Cleanup on unmount
        return () => {
            console.log('Closing SSE connection to platforms');
            eventSource.close();
        };
    }, []);

    return { platforms, loading, error };
};
