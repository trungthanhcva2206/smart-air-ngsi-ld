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

import axios from '../utils/axiosCustomize';

/**
 * Get weather attribute history
 * @param {string} district - District name (e.g., "PhuongBaDinh")
 * @param {string} attribute - Attribute name (e.g., "temperature", "relativeHumidity")
 * @param {string} timeRange - Time range ("24h", "48h", "72h", "1week", "1month")
 * @returns {Promise<{EC: number, EM: string, DT: object}>}
 */
export const getWeatherHistory = async (district, attribute, timeRange) => {
    try {
        // Calculate date range
        const toDate = new Date();
        const fromDate = new Date();

        // Determine aggrPeriod based on timeRange
        let aggrPeriod = 'hour';
        switch (timeRange) {
            case '24h':
                fromDate.setHours(fromDate.getHours() - 24);
                break;
            case '48h':
                fromDate.setHours(fromDate.getHours() - 48);
                break;
            case '72h':
                fromDate.setHours(fromDate.getHours() - 72);
                break;
            case '1week':
                fromDate.setDate(fromDate.getDate() - 7);
                break;
            case '1month':
                fromDate.setMonth(fromDate.getMonth() - 1);
                aggrPeriod = 'day'; // Use day aggregation for 1 month
                break;
            default:
                fromDate.setHours(fromDate.getHours() - 24);
        }

        // Format dates to ISO string
        const fromDateStr = fromDate.toISOString();
        const toDateStr = toDate.toISOString();

        // Convert attribute to lowercase (backend stores attributes in lowercase)
        const attributeLower = attribute.toLowerCase();

        const response = await axios.get(
            `/api/weather/${district}/attrs/${attributeLower}/history`,
            {
                params: {
                    aggrMethod: 'avg',
                    aggrPeriod: aggrPeriod,
                    fromDate: fromDateStr,
                    toDate: toDateStr
                }
            }
        );

        return response;
    } catch (error) {
        console.error('Error fetching weather history:', error);
        return {
            EC: -1,
            EM: error.response?.data?.EM || error.message || 'Không thể tải dữ liệu thời tiết',
            DT: null
        };
    }
};

/**
 * Get air quality attribute history
 * @param {string} district - District name (e.g., "PhuongBaDinh")
 * @param {string} attribute - Attribute name (e.g., "CO", "PM2.5", "airQualityIndex")
 * @param {string} timeRange - Time range ("24h", "48h", "72h", "1week", "1month")
 * @returns {Promise<{EC: number, EM: string, DT: object}>}
 */
export const getAirQualityHistory = async (district, attribute, timeRange) => {
    try {
        // Calculate date range
        const toDate = new Date();
        const fromDate = new Date();

        // Determine aggrPeriod based on timeRange
        let aggrPeriod = 'hour';
        switch (timeRange) {
            case '24h':
                fromDate.setHours(fromDate.getHours() - 24);
                break;
            case '48h':
                fromDate.setHours(fromDate.getHours() - 48);
                break;
            case '72h':
                fromDate.setHours(fromDate.getHours() - 72);
                break;
            case '1week':
                fromDate.setDate(fromDate.getDate() - 7);
                break;
            case '1month':
                fromDate.setMonth(fromDate.getMonth() - 1);
                aggrPeriod = 'day'; // Use day aggregation for 1 month
                break;
            default:
                fromDate.setHours(fromDate.getHours() - 24);
        }

        // Format dates to ISO string
        const fromDateStr = fromDate.toISOString();
        const toDateStr = toDate.toISOString();

        // Convert attribute to lowercase (backend stores attributes in lowercase)
        const attributeConverted = attribute.replace('PM2.5', 'pm2_5');
        const attributeLower = attributeConverted.toLowerCase();

        const response = await axios.get(
            `/api/airquality/${district}/attrs/${attributeLower}/history`,
            {
                params: {
                    aggrMethod: 'avg',
                    aggrPeriod: aggrPeriod,
                    fromDate: fromDateStr,
                    toDate: toDateStr
                }
            }
        );

        return response;
    } catch (error) {
        console.error('Error fetching air quality history:', error);
        return {
            EC: -1,
            EM: error.response?.data?.EM || error.message || 'Không thể tải dữ liệu chất lượng không khí',
            DT: null
        };
    }
};

/**
 * Transform API response to chart data format
 * @param {object} apiResponse - Response from getWeatherHistory or getAirQualityHistory
 * @returns {Array<{time: string, value: number}>}
 */
export const transformToChartData = (apiResponse) => {
    if (!apiResponse || apiResponse.EC !== 0 || !apiResponse.DT) {
        return [];
    }

    const { index, values } = apiResponse.DT;

    if (!index || !values || index.length !== values.length) {
        return [];
    }

    return index.map((timestamp, idx) => {
        const date = new Date(timestamp);
        // Format time for display
        const timeStr = date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Values are already in correct format (double precision from ETL)
        // No need to divide by 10 anymore
        const value = values[idx];

        return {
            time: timeStr,
            value: parseFloat(value.toFixed(2))
        };
    });
};
