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

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8123';

/**
 * ✅ NEW: Hook to fetch aggregated 30-day historical data for ALL districts
 * Uses single SSE connection instead of multiple connections
 * @param {string} dataType - 'weather' or 'airquality'
 */
export const useAggregatedDistrictHistory = (dataType = 'airquality') => {
    const [historyData, setHistoryData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const eventSourceRef = useRef(null);
    const timeoutRef = useRef(null); // ✅ NEW: Ref để clear timeout

    useEffect(() => {
        setLoading(true);
        setError(null);

        const url = `${BASE_URL}/api/sse/${dataType}/all/history`;
        console.log(`🔌 Connecting to aggregated history SSE:`, url);

        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        // Listen for INITIAL aggregated data
        eventSource.addEventListener(`${dataType}.history.aggregated`, (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log(`📊 Received INITIAL aggregated ${dataType} history:`, data);
                console.log(`✅ Loaded ${Object.keys(data).length} districts`);
                
                setHistoryData(data);
                setLoading(false);
                
                // ✅ IMPORTANT: Clear timeout khi đã nhận được data
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
            } catch (err) {
                console.error(`❌ Error parsing aggregated ${dataType} history:`, err);
                setError(`Lỗi khi xử lý dữ liệu lịch sử`);
                setLoading(false);
            }
        });

        // Listen for LIVE UPDATES
        eventSource.addEventListener(`${dataType}.history.aggregated.update`, (event) => {
            try {
                const data = JSON.parse(event.data);
                const timestamp = new Date().toLocaleTimeString('vi-VN');
                console.log(`🔄 [${timestamp}] Received LIVE UPDATE for aggregated ${dataType} history`);
                console.log(`✅ Updated ${Object.keys(data).length} districts with new data`);
                
                // ✅ Update state - This will trigger React re-render
                setHistoryData(data);
                
                // Debug: Show sample of first district
                const firstDistrictName = Object.keys(data)[0];
                if (firstDistrictName && data[firstDistrictName]?.index?.length > 0) {
                    const lastIndex = data[firstDistrictName].index.length - 1;
                    console.log(`📍 Sample - ${firstDistrictName}: Last timestamp = ${data[firstDistrictName].index[lastIndex]}`);
                }
            } catch (err) {
                console.error(`❌ Error parsing ${dataType} history update:`, err);
            }
        });

        eventSource.onerror = (err) => {
            console.error(`❌ SSE error:`, err);
            setError(`Không thể kết nối đến server`);
            setLoading(false);
        };

        eventSource.onopen = () => {
            console.log(`✅ Connected to aggregated ${dataType} history SSE`);
        };

        // ✅ Timeout fallback: Nếu sau 30s vẫn không có data (TĂNG LÊN 30s)
        timeoutRef.current = setTimeout(() => {
            // ✅ Chỉ set error nếu thực sự chưa có data
            if (Object.keys(historyData).length === 0) {
                console.warn('⚠️ No data received after 30s');
                setLoading(false);
                setError('Không thể tải dữ liệu lịch sử. Vui lòng thử lại.');
            }
        }, 30000); // ✅ TĂNG từ 15s lên 30s

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            console.log(`🔌 Closing aggregated ${dataType} history SSE`);
            eventSource.close();
            eventSourceRef.current = null;
        };
    }, [dataType]); // ✅ QUAN TRỌNG: Remove historyData khỏi dependency

    return { historyData, loading, error };
};

/**
 * OLD: Hook to fetch 30-day historical data for multiple districts (DEPRECATED)
 * Use useAggregatedDistrictHistory instead for better performance
 * @deprecated Use useAggregatedDistrictHistory for better performance
 */
export const useMultiDistrictHistory = (districts, dataType = 'airquality') => {
    const [historyData, setHistoryData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const eventSourcesRef = useRef({});

    useEffect(() => {
        if (!districts || districts.length === 0) {
            setLoading(false);
            return;
        }

        console.warn('⚠️ useMultiDistrictHistory is deprecated. Use useAggregatedDistrictHistory instead.');

        setLoading(true);
        setError(null);

        // Connect to history SSE for each district
        districts.forEach(district => {
            const url = `${BASE_URL}/api/sse/${dataType}/${district}/history`;
            console.log(`🔌 Connecting to history SSE for ${district}:`, url);

            const eventSource = new EventSource(url);
            eventSourcesRef.current[district] = eventSource;

            // Listen for INITIAL data
            eventSource.addEventListener(`${dataType}.history`, (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log(`📊 Received INITIAL ${dataType} history for ${district}:`, data);
                    
                    setHistoryData(prev => ({
                        ...prev,
                        [district]: data
                    }));
                    setLoading(false);
                } catch (err) {
                    console.error(`❌ Error parsing ${dataType} history for ${district}:`, err);
                    setError(`Lỗi khi xử lý dữ liệu lịch sử cho ${district}`);
                }
            });

            // Listen for LIVE UPDATES
            eventSource.addEventListener(`${dataType}.history.update`, (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log(`🔄 Received UPDATE ${dataType} history for ${district}:`, data);
                    
                    setHistoryData(prev => ({
                        ...prev,
                        [district]: data
                    }));
                } catch (err) {
                    console.error(`❌ Error parsing ${dataType} history update for ${district}:`, err);
                }
            });

            eventSource.onerror = (err) => {
                console.error(`❌ SSE error for ${district}:`, err);
                setError(`Không thể kết nối đến server cho ${district}`);
                setLoading(false);
            };

            eventSource.onopen = () => {
                console.log(`✅ Connected to ${dataType} history SSE for ${district}`);
            };
        });

        // Cleanup
        return () => {
            Object.entries(eventSourcesRef.current).forEach(([district, es]) => {
                console.log(`🔌 Closing ${dataType} history SSE for ${district}`);
                es.close();
            });
            eventSourcesRef.current = {};
        };
    }, [districts, dataType]);

    return { historyData, loading, error };
};

/**
 * Transform QuantumLeap data to chart-friendly format
 * @param {Object} quantumLeapData - Raw data from QuantumLeap
 * @returns {Array} Array of {timestamp, ...attributes}
 */
export const transformHistoryToChartData = (quantumLeapData) => {
    if (!quantumLeapData?.attributes || !quantumLeapData?.index) {
        return [];
    }

    const { attributes, index } = quantumLeapData;
    
    return index.map((timestamp, i) => {
        const dataPoint = { 
            timestamp: new Date(timestamp).toLocaleDateString('vi-VN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit'
            }),
            fullTimestamp: new Date(timestamp).toLocaleString('vi-VN')
        };
        
        attributes.forEach(attr => {
            dataPoint[attr.attrName] = attr.values[i];
        });
        
        return dataPoint;
    });
};

/**
 * Calculate statistics from historical data
 * @param {Array} chartData - Transformed chart data
 * @param {string} attribute - Attribute name to calculate stats for
 */
export const calculateHistoryStats = (chartData, attribute) => {
    if (!chartData || chartData.length === 0) {
        return { avg: 0, max: 0, min: 0, latest: 0 };
    }

    const values = chartData.map(d => d[attribute]).filter(v => v != null);
    if (values.length === 0) {
        return { avg: 0, max: 0, min: 0, latest: 0 };
    }

    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const latest = values[values.length - 1];

    return {
        avg: parseFloat(avg.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        min: parseFloat(min.toFixed(2)),
        latest: parseFloat(latest.toFixed(2))
    };
};

/**
 * Aggregate historical data from multiple districts
 * @param {Object} historyData - Object with district names as keys
 * @param {string} attribute - Attribute to aggregate
 */
export const aggregateMultiDistrictHistory = (historyData, attribute) => {
    const allTimestamps = new Set();
    const districtData = {};

    // Collect all unique timestamps and transform data
    Object.entries(historyData).forEach(([district, data]) => {
        const transformed = transformHistoryToChartData(data);
        districtData[district] = transformed;
        transformed.forEach(point => allTimestamps.add(point.timestamp));
    });

    // Sort timestamps
    const sortedTimestamps = Array.from(allTimestamps).sort();

    // Build aggregated dataset
    return sortedTimestamps.map(timestamp => {
        const dataPoint = { timestamp };
        let sum = 0;
        let count = 0;

        Object.entries(districtData).forEach(([district, data]) => {
            const point = data.find(d => d.timestamp === timestamp);
            if (point && point[attribute] != null) {
                sum += point[attribute];
                count++;
            }
        });

        dataPoint[attribute] = count > 0 ? sum / count : 0;
        dataPoint.count = count; // Number of districts with data at this timestamp

        return dataPoint;
    });
};