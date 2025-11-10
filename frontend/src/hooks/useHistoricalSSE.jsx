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

import { useState, useEffect, useRef } from 'react';

const BASE_URL = process.env.REACT_APP_SSE_URL || 'http://localhost:8081';

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
        console.log('Connecting to weather history SSE:', url);

        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        // Listen for weather.history events
        eventSource.addEventListener('weather.history', (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Received weather history:', data);
                
                // QuantumLeap response structure:
                // {
                //   "attributes": [
                //     { "attrName": "temperature", "values": [28.5, 29.0, ...] },
                //     { "attrName": "humidity", "values": [0.65, 0.70, ...] }
                //   ],
                //   "index": ["2024-11-01T00:00:00Z", "2024-11-01T01:00:00Z", ...]
                // }
                
                setHistoryData(data);
                setLoading(false);
            } catch (err) {
                console.error('Error parsing weather history:', err);
                setError('Lỗi khi xử lý dữ liệu lịch sử thời tiết');
            }
        });

        eventSource.onerror = (err) => {
            console.error('Weather history SSE error:', err);
            setError('Không thể kết nối đến server lịch sử');
            setLoading(false);
        };

        eventSource.onopen = () => {
            console.log('Connected to weather history SSE');
            setError(null);
        };

        return () => {
            console.log('Closing weather history SSE connection');
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
        console.log('Connecting to air quality history SSE:', url);

        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.addEventListener('airquality.history', (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Received air quality history:', data);
                
                // Example structure:
                // {
                //   "attributes": [
                //     { "attrName": "PM2_5", "values": [25.0, 30.0, ...] },
                //     { "attrName": "PM10", "values": [40.0, 45.0, ...] },
                //     { "attrName": "airQualityIndex", "values": [3, 3, 2, ...] }
                //   ],
                //   "index": ["2024-11-01T00:00:00Z", ...]
                // }
                
                setHistoryData(data);
                setLoading(false);
            } catch (err) {
                console.error('Error parsing air quality history:', err);
                setError('Lỗi khi xử lý dữ liệu lịch sử chất lượng không khí');
            }
        });

        eventSource.onerror = (err) => {
            console.error('Air quality history SSE error:', err);
            setError('Không thể kết nối đến server lịch sử');
            setLoading(false);
        };

        eventSource.onopen = () => {
            console.log('Connected to air quality history SSE');
            setError(null);
        };

        return () => {
            console.log('Closing air quality history SSE connection');
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

