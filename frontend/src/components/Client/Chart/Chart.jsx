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

import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

/**
 * Chart Component using Recharts
 * @param {string} chartType - 'linear' or 'logarithmic'
 * @param {string} metricLabel - Label for the metric
 * @param {string} metricColor - Color for the chart line/area
 * @param {Array} data - Chart data array
 */
const Chart = ({ chartType, metricLabel, metricColor = '#6a5cd8', data, showArea = false }) => {
    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.96)',
                    padding: '12px 16px',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#2c3e50', marginBottom: '6px' }}>
                        {label}
                    </p>
                    <p style={{ margin: 0, color: metricColor, fontWeight: 500 }}>
                        {metricLabel}: {payload[0].value.toFixed(2)}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Gradient definition
    const gradientId = `gradient-${metricColor.replace('#', '')}`;

    return (
        <ResponsiveContainer width="100%" height="100%">
            {showArea ? (
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={metricColor} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={metricColor} stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis
                        dataKey="time"
                        tick={{ fill: '#6c757d', fontSize: 12 }}
                        stroke="#dee2e6"
                    />
                    <YAxis
                        scale={chartType === 'logarithmic' ? 'log' : 'linear'}
                        domain={chartType === 'logarithmic' ? ['auto', 'auto'] : undefined}
                        tick={{ fill: '#6c757d', fontSize: 12 }}
                        stroke="#dee2e6"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={metricColor}
                        strokeWidth={2.5}
                        fill={`url(#${gradientId})`}
                        name={metricLabel}
                        animationDuration={800}
                        dot={{ fill: metricColor, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                </AreaChart>
            ) : (
                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                    <XAxis
                        dataKey="time"
                        tick={{ fill: '#6c757d', fontSize: 12 }}
                        stroke="#dee2e6"
                    />
                    <YAxis
                        scale={chartType === 'logarithmic' ? 'log' : 'linear'}
                        domain={chartType === 'logarithmic' ? ['auto', 'auto'] : undefined}
                        tick={{ fill: '#6c757d', fontSize: 12 }}
                        stroke="#dee2e6"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={metricColor}
                        strokeWidth={2.5}
                        name={metricLabel}
                        animationDuration={800}
                        dot={{ fill: metricColor, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                </LineChart>
            )}
        </ResponsiveContainer>
    );
};

export default Chart;
