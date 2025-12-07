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
 * @Project Air Track NGSI-LD
 * @Authors 
 *    - TT (trungthanhcva2206@gmail.com)
 *    - Tankchoi (tadzltv22082004@gmail.com)
 *    - Panh (panh812004.apn@gmail.com)
 * @Copyright (C) 2025 TAA. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
 */

/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * ...existing license...
 */

import { useState, useEffect, useRef } from 'react';

// ✅ ĐÚNG PORT 8123
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8123';

/**
 * Hook to stream weather historical data (30 days)
 * @param {string} district - District name (e.g., "PhuongBaDinh")
 */
export const useWeatherHistory = (district) => {
    const [historyData, setHistoryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        if (!district) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const url = `${BASE_URL}/api/sse/weather/${district}/history`;
        console.log('🔌 [useWeatherHistory] Connecting to:', url);

        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        // ✅ Listen for INITIAL data
        eventSource.addEventListener('weather.history', (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('📊 [useWeatherHistory] Received INITIAL data:', data);
                setHistoryData(data);
                setLoading(false);
            } catch (err) {
                console.error('❌ [useWeatherHistory] Error parsing initial data:', err);
                setError('Lỗi khi xử lý dữ liệu lịch sử thời tiết');
            }
        });

        // ✅ Listen for LIVE UPDATES (khi Orion notify → Backend query QL → Broadcast)
        eventSource.addEventListener('weather.history.update', (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('🔄 [useWeatherHistory] Received UPDATE:', data);
                setHistoryData(data); // ← CẬP NHẬT STATE → RE-RENDER CHART
            } catch (err) {
                console.error('❌ [useWeatherHistory] Error parsing update:', err);
            }
        });

        eventSource.onerror = (err) => {
            console.error('❌ [useWeatherHistory] SSE error:', err);
            setError('Không thể kết nối đến server lịch sử');
            setLoading(false);
        };

        eventSource.onopen = () => {
            console.log('✅ [useWeatherHistory] Connected');
            setError(null);
        };

        return () => {
            console.log('🔌 [useWeatherHistory] Closing connection');
            eventSource.close();
        };
    }, [district]);

    return { historyData, loading, error };
};

/**
 * Hook to stream air quality historical data (30 days)
 * @param {string} district - District name
 */
export const useAirQualityHistory = (district) => {
    const [historyData, setHistoryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        if (!district) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const url = `${BASE_URL}/api/sse/airquality/${district}/history`;
        console.log('🔌 [useAirQualityHistory] Connecting to:', url);

        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        // ✅ Listen for INITIAL data
        eventSource.addEventListener('airquality.history', (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('📊 [useAirQualityHistory] Received INITIAL data:', data);
                setHistoryData(data);
                setLoading(false);
            } catch (err) {
                console.error('❌ [useAirQualityHistory] Error parsing initial data:', err);
                setError('Lỗi khi xử lý dữ liệu lịch sử chất lượng không khí');
            }
        });

        // ✅ Listen for LIVE UPDATES
        eventSource.addEventListener('airquality.history.update', (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('🔄 [useAirQualityHistory] Received UPDATE:', data);
                setHistoryData(data); // ← CẬP NHẬT STATE → RE-RENDER CHART
            } catch (err) {
                console.error('❌ [useAirQualityHistory] Error parsing update:', err);
            }
        });

        eventSource.onerror = (err) => {
            console.error('❌ [useAirQualityHistory] SSE error:', err);
            setError('Không thể kết nối đến server lịch sử');
            setLoading(false);
        };

        eventSource.onopen = () => {
            console.log('✅ [useAirQualityHistory] Connected');
            setError(null);
        };

        return () => {
            console.log('🔌 [useAirQualityHistory] Closing connection');
            eventSource.close();
        };
    }, [district]);

    return { historyData, loading, error };
};

/**
 * Helper function to transform QuantumLeap data to chart-friendly format
 * @param {Object} quantumLeapData - Raw data from QuantumLeap
 * @returns {Array} Array of {timestamp, ...attributes}
 */
export const transformHistoryToChartData = (quantumLeapData) => {
    if (!quantumLeapData || !quantumLeapData.attributes || !quantumLeapData.index) {
        return [];
    }

    const { attributes, index } = quantumLeapData;
    
    // Convert to array of objects with timestamps
    return index.map((timestamp, i) => {
        const dataPoint = { timestamp };
        
        // Add all attributes for this timestamp
        attributes.forEach(attr => {
            dataPoint[attr.attrName] = attr.values[i];
        });
        
        return dataPoint;
    });
};

