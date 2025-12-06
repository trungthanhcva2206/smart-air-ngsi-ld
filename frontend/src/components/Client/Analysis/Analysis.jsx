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
import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    RadarChart, PolarGrid, PolarAngleAxis, Radar,
    ResponsiveContainer
} from 'recharts';
import './Analysis.css';
import {
    useAggregatedDistrictHistory,
    transformHistoryToChartData,
    calculateHistoryStats
} from '../../../hooks/useAnalysisHistorySSE';
import { getAllWards } from '../../../utils/geoJsonParser';

const Analysis = () => {
    const [selectedStation, setSelectedStation] = useState('all');
    const [sliderTimeRange, setSliderTimeRange] = useState('30d');
    const [selectedMetric, setSelectedMetric] = useState('pm2_5');
    const [districts, setDistricts] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ Fetch BOTH air quality AND weather data
    const {
        historyData: airQualityHistory,
        loading: airLoading,
        error: airError
    } = useAggregatedDistrictHistory('airquality');

    const {
        historyData: weatherHistory,
        loading: weatherLoading,
        error: weatherError
    } = useAggregatedDistrictHistory('weather');

    // ✅ Load districts từ GeoJSON
    useEffect(() => {
        const loadDistricts = async () => {
            try {
                const wards = await getAllWards();
                console.log(`✅ Loaded ${wards.length} districts from GeoJSON`);
                setDistricts(wards);
                setLoading(false);
            } catch (err) {
                console.error('❌ Error loading districts:', err);
                setLoading(false);
            }
        };
        loadDistricts();
    }, []);

    // ✅ Debug when station changes
    useEffect(() => {
        console.log('🎯 Selected Station:', selectedStation);
    }, [selectedStation]);

    // ============================================
    // ✅ GET FILTERED DISTRICTS (based on selectedStation)
    // ============================================
    const getFilteredDistricts = () => {
        if (selectedStation === 'all') {
            return Object.keys(airQualityHistory);
        }

        const matchingDistrict = Object.keys(airQualityHistory).find(districtName => {
            const normalizedDistrictName = districtName.toLowerCase().replace(/\s+/g, '');
            const normalizedSelectedStation = selectedStation.toLowerCase().replace(/\s+/g, '');
            return normalizedDistrictName.includes(normalizedSelectedStation) ||
                normalizedSelectedStation.includes(normalizedDistrictName);
        });

        console.log('🔍 Found matching district:', matchingDistrict);

        return matchingDistrict ? [matchingDistrict] : [];
    };

    // ============================================
    // ✅ ROUND TIMESTAMP TO NEAREST 2 MINUTES
    // ============================================
    const roundToNearestMinutes = (timestamp, minutes = 2) => {
        const date = new Date(timestamp);
        const ms = 1000 * 60 * minutes;
        return new Date(Math.round(date.getTime() / ms) * ms).toISOString();
    };

    // ============================================
    // ✅ BUILD TIME SERIES DATA
    // ============================================
    const buildTimeSeriesData = () => {
        const filteredDistricts = getFilteredDistricts();

        if (filteredDistricts.length === 0) {
            console.log('⚠️ No districts to process');
            return [];
        }

        console.log(`📊 Processing ${filteredDistricts.length} districts:`, filteredDistricts);

        const allTimestampsSet = new Set();

        filteredDistricts.forEach(districtName => {
            const airData = airQualityHistory[districtName];
            const weatherData = weatherHistory[districtName];

            if (airData?.index) {
                airData.index.forEach(ts => {
                    const roundedTs = roundToNearestMinutes(ts, 2);
                    allTimestampsSet.add(roundedTs);
                });
            }
            if (weatherData?.index) {
                weatherData.index.forEach(ts => {
                    const roundedTs = roundToNearestMinutes(ts, 2);
                    allTimestampsSet.add(roundedTs);
                });
            }
        });

        const allTimestamps = Array.from(allTimestampsSet).sort((a, b) =>
            new Date(a) - new Date(b)
        );

        console.log(`📅 Found ${allTimestamps.length} unique timestamps`);

        const timeSeriesMap = new Map();

        allTimestamps.forEach(timestamp => {
            timeSeriesMap.set(timestamp, {
                timestamp,
                pm2_5: [],
                pm10: [],
                CO: [],
                NO2: [],
                SO2: [],
                O3: [],
                NH3: [],
                temperature: [],
                humidity: [],
                pressure: [],
                windSpeed: []
            });
        });

        filteredDistricts.forEach(districtName => {
            const airData = airQualityHistory[districtName];
            const weatherData = weatherHistory[districtName];

            if (airData?.index && airData?.attributes) {
                airData.index.forEach((timestamp, idx) => {
                    const roundedTs = roundToNearestMinutes(timestamp, 2);

                    if (timeSeriesMap.has(roundedTs)) {
                        const point = timeSeriesMap.get(roundedTs);

                        airData.attributes.forEach(attr => {
                            if (point.hasOwnProperty(attr.attrName) && attr.values[idx] != null) {
                                point[attr.attrName].push(attr.values[idx]);
                            }
                        });
                    }
                });
            }

            if (weatherData?.index && weatherData?.attributes) {
                weatherData.index.forEach((timestamp, idx) => {
                    const roundedTs = roundToNearestMinutes(timestamp, 2);

                    if (timeSeriesMap.has(roundedTs)) {
                        const point = timeSeriesMap.get(roundedTs);

                        weatherData.attributes.forEach(attr => {
                            if (attr.attrName === 'temperature' && attr.values[idx] != null) {
                                point.temperature.push(attr.values[idx]);
                            } else if (attr.attrName === 'relativeHumidity' && attr.values[idx] != null) {
                                point.humidity.push(attr.values[idx]);
                            } else if (attr.attrName === 'atmosphericPressure' && attr.values[idx] != null) {
                                point.pressure.push(attr.values[idx]);
                            } else if (attr.attrName === 'windSpeed' && attr.values[idx] != null) {
                                point.windSpeed.push(attr.values[idx]);
                            }
                        });
                    }
                });
            }
        });

        const timeSeriesArray = Array.from(timeSeriesMap.values()).map(point => {
            const avgPoint = {
                timestamp: point.timestamp,
                displayTime: new Date(point.timestamp).toLocaleDateString('vi-VN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };

            ['pm2_5', 'pm10', 'CO', 'NO2', 'SO2', 'O3', 'NH3', 'temperature', 'humidity', 'pressure', 'windSpeed'].forEach(metric => {
                const values = point[metric].filter(v => v != null && !isNaN(v));

                if (values.length > 0) {
                    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
                    // All values are already in correct format (double precision from ETL)
                    avgPoint[metric] = parseFloat(avg.toFixed(2));
                } else {
                    avgPoint[metric] = null;
                }
            });

            return avgPoint;
        });

        const validTimeSeriesArray = timeSeriesArray.filter(point =>
            point[selectedMetric] !== null && point[selectedMetric] !== undefined
        );

        console.log(`📊 Generated ${validTimeSeriesArray.length} time series points`);

        return validTimeSeriesArray;
    };

    const timeSeriesData = buildTimeSeriesData();

    // ============================================
    // ✅ CALCULATE STATISTICS
    // ============================================
    const calculateStatsFromTimeSeries = () => {
        if (timeSeriesData.length === 0) {
            return {
                airQuality: {
                    pm2_5: { avg: 0, max: 0, min: 0, latest: 0 },
                    pm10: { avg: 0, max: 0, min: 0, latest: 0 },
                    CO: { avg: 0, max: 0, min: 0, latest: 0 },
                    NO2: { avg: 0, max: 0, min: 0, latest: 0 },
                    SO2: { avg: 0, max: 0, min: 0, latest: 0 },
                    O3: { avg: 0, max: 0, min: 0, latest: 0 },
                    NH3: { avg: 0, max: 0, min: 0, latest: 0 }
                },
                weather: {
                    temperature: { avg: 0, max: 0, min: 0, latest: 0 },
                    humidity: { avg: 0, max: 0, min: 0, latest: 0 },
                    pressure: { avg: 0, max: 0, min: 0, latest: 0 },
                    windSpeed: { avg: 0, max: 0, min: 0, latest: 0 }
                }
            };
        }

        const calculateMetricStats = (metricName) => {
            const values = timeSeriesData
                .map(point => point[metricName])
                .filter(v => v != null && !isNaN(v));

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

        return {
            airQuality: {
                pm2_5: calculateMetricStats('pm2_5'),
                pm10: calculateMetricStats('pm10'),
                CO: calculateMetricStats('CO'),
                NO2: calculateMetricStats('NO2'),
                SO2: calculateMetricStats('SO2'),
                O3: calculateMetricStats('O3'),
                NH3: calculateMetricStats('NH3')
            },
            weather: {
                temperature: calculateMetricStats('temperature'),
                humidity: calculateMetricStats('humidity'),
                pressure: calculateMetricStats('pressure'),
                windSpeed: calculateMetricStats('windSpeed')
            }
        };
    };

    const stats = calculateStatsFromTimeSeries();
    const airQualityStats = stats.airQuality;
    const weatherStats = stats.weather;

    // ============================================
    // ✅ PROGRESS DATA
    // ============================================
    const progressData = [
        {
            label: 'PM2.5',
            value: airQualityStats.pm2_5.avg,
            maxValue: 150,
            unit: 'µg/m³',
            color: '#3197B1',
            description: `Min: ${airQualityStats.pm2_5.min} | Max: ${airQualityStats.pm2_5.max}`
        },
        {
            label: 'PM10',
            value: airQualityStats.pm10.avg,
            maxValue: 250,
            unit: 'µg/m³',
            color: '#FF6B6B',
            description: `Min: ${airQualityStats.pm10.min} | Max: ${airQualityStats.pm10.max}`
        },
        {
            label: 'CO',
            value: airQualityStats.CO.avg,
            maxValue: 1000,
            unit: 'µg/m³',
            color: '#4ECDC4',
            description: `Min: ${airQualityStats.CO.min} | Max: ${airQualityStats.CO.max}`
        },
        {
            label: 'NO2',
            value: airQualityStats.NO2.avg,
            maxValue: 100,
            unit: 'µg/m³',
            color: '#FFA726',
            description: `Min: ${airQualityStats.NO2.min} | Max: ${airQualityStats.NO2.max}`
        },
        {
            label: 'SO2',
            value: airQualityStats.SO2.avg,
            maxValue: 50,
            unit: 'µg/m³',
            color: '#AB47BC',
            description: `Min: ${airQualityStats.SO2.min} | Max: ${airQualityStats.SO2.max}`
        },
        {
            label: 'O3',
            value: airQualityStats.O3.avg,
            maxValue: 100,
            unit: 'µg/m³',
            color: '#66BB6A',
            description: `Min: ${airQualityStats.O3.min} | Max: ${airQualityStats.O3.max}`
        },
        {
            label: 'NH3',
            value: airQualityStats.NH3.avg,
            maxValue: 20,
            unit: 'µg/m³',
            color: '#42A5F5',
            description: `Min: ${airQualityStats.NH3.min} | Max: ${airQualityStats.NH3.max}`
        },
        {
            label: 'Nhiệt độ',
            value: weatherStats.temperature.avg,
            maxValue: 35,
            unit: '°C',
            color: '#EF5350',
            description: `Min: ${weatherStats.temperature.min} | Max: ${weatherStats.temperature.max}`
        },
        {
            label: 'Độ ẩm',
            value: weatherStats.humidity.avg,
            maxValue: 100,
            unit: '%',
            color: '#26C6DA',
            description: `Min: ${weatherStats.humidity.min} | Max: ${weatherStats.humidity.max}`
        },
        {
            label: 'Áp suất',
            value: weatherStats.pressure.avg,
            maxValue: 1050,
            unit: 'hPa',
            color: '#8D6E63',
            description: `Min: ${weatherStats.pressure.min} | Max: ${weatherStats.pressure.max}`
        },
        {
            label: 'Tốc độ gió',
            value: weatherStats.windSpeed.avg,
            maxValue: 20,
            unit: 'm/s',
            color: '#78909C',
            description: `Min: ${weatherStats.windSpeed.min} | Max: ${weatherStats.windSpeed.max}`
        }
    ];

    // ============================================
    // ✅ SLIDER DATA
    // ============================================
    const sliderData = [
        {
            label: 'PM2.5',
            value: Math.min((airQualityStats.pm2_5.avg / 150) * 100, 100),
            rawValue: airQualityStats.pm2_5.avg.toFixed(1),
            unit: 'µg/m³',
            maxValue: 150
        },
        {
            label: 'PM10',
            value: Math.min((airQualityStats.pm10.avg / 250) * 100, 100),
            rawValue: airQualityStats.pm10.avg.toFixed(1),
            unit: 'µg/m³',
            maxValue: 250
        },
        {
            label: 'CO',
            value: Math.min((airQualityStats.CO.avg / 1000) * 100, 100),
            rawValue: airQualityStats.CO.avg.toFixed(1),
            unit: 'µg/m³',
            maxValue: 1000
        },
        {
            label: 'NO2',
            value: Math.min((airQualityStats.NO2.avg / 100) * 100, 100),
            rawValue: airQualityStats.NO2.avg.toFixed(1),
            unit: 'µg/m³',
            maxValue: 100
        },
        {
            label: 'SO2',
            value: Math.min((airQualityStats.SO2.avg / 50) * 100, 100),
            rawValue: airQualityStats.SO2.avg.toFixed(1),
            unit: 'µg/m³',
            maxValue: 50
        },
        {
            label: 'O3',
            value: Math.min((airQualityStats.O3.avg / 100) * 100, 100),
            rawValue: airQualityStats.O3.avg.toFixed(1),
            unit: 'µg/m³',
            maxValue: 100
        },
        {
            label: 'NH3',
            value: Math.min((airQualityStats.NH3.avg / 20) * 100, 100),
            rawValue: airQualityStats.NH3.avg.toFixed(1),
            unit: 'µg/m³',
            maxValue: 20
        },
        {
            label: 'Nhiệt độ',
            value: Math.min((weatherStats.temperature.avg / 35) * 100, 100),
            rawValue: weatherStats.temperature.avg.toFixed(1),
            unit: '°C',
            maxValue: 35
        }
    ];

    // ============================================
    // ✅ RADAR CHART DATA
    // ============================================
    const radarData = [
        { subject: 'PM2.5', A: Math.round(airQualityStats.pm2_5.avg), fullMark: 150 },
        { subject: 'PM10', A: Math.round(airQualityStats.pm10.avg), fullMark: 250 },
        { subject: 'CO', A: Math.round(airQualityStats.CO.avg), fullMark: 1000 },
        { subject: 'NO2', A: Math.round(airQualityStats.NO2.avg), fullMark: 100 },
        { subject: 'SO2', A: Math.round(airQualityStats.SO2.avg), fullMark: 50 },
        { subject: 'O3', A: Math.round(airQualityStats.O3.avg), fullMark: 100 }
    ];

    // ============================================
    // ✅ AQI CALCULATION
    // ============================================
    const calculateAQI = () => {
        const pm25 = airQualityStats.pm2_5.avg;
        if (pm25 <= 12) return 1;
        if (pm25 <= 35.4) return 2;
        if (pm25 <= 55.4) return 3;
        if (pm25 <= 150.4) return 4;
        return 5;
    };

    const currentAQI = calculateAQI();

    const getStatusInfo = (aqi) => {
        const statuses = {
            1: { label: 'Tốt', color: '#00E400' },
            2: { label: 'Trung bình', color: '#FFFF00' },
            3: { label: 'Kém', color: '#FF7E00' },
            4: { label: 'Xấu', color: '#FF0000' },
            5: { label: 'Rất xấu', color: '#8F3F97' }
        };
        return statuses[aqi] || { label: 'Không rõ', color: '#999' };
    };

    const statusInfo = getStatusInfo(currentAQI);

    // ============================================
    // ✅ WEATHER SUMMARY
    // ============================================
    const weatherSummary = {
        temperature: weatherStats.temperature.avg.toFixed(1),
        humidity: weatherStats.humidity.avg.toFixed(0),
        pressure: weatherStats.pressure.avg.toFixed(0),
        windSpeed: weatherStats.windSpeed.avg.toFixed(1)
    };

    // ============================================
    // ✅ LOADING & ERROR STATES
    // ============================================
    if (loading || airLoading || weatherLoading) {
        return (
            <div className="analysis-wrapper">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (airError || weatherError) {
        return (
            <div className="analysis-wrapper">
                <div className="error-container">
                    <p>❌ Lỗi: {airError || weatherError}</p>
                    <button onClick={() => window.location.reload()}>Thử lại</button>
                </div>
            </div>
        );
    }

    // ============================================
    // ✅ STATION LIST
    // ============================================
    const stations = [
        { value: 'all', label: 'Tất cả trạm (126 trạm) - Giá trị trung bình' },
        ...districts.map(ward => ({
            value: ward.value,
            label: ward.name
        }))
    ];

    const metrics = [
        { value: 'pm2_5', label: 'PM2.5' },
        { value: 'pm10', label: 'PM10' },
        { value: 'CO', label: 'CO' },
        { value: 'NO2', label: 'NO2' },
        { value: 'SO2', label: 'SO2' },
        { value: 'O3', label: 'O3' },
        { value: 'NH3', label: 'NH3' },
        { value: 'temperature', label: 'Nhiệt độ' },
        { value: 'humidity', label: 'Độ ẩm' },
        { value: 'pressure', label: 'Áp suất' },
        { value: 'windSpeed', label: 'Tốc độ gió' }
    ];

    // ✅ Custom Tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '5px' }}>
                        {payload[0].payload.displayTime}
                    </p>
                    <p style={{ margin: 0, color: '#3197B1' }}>
                        {`${metrics.find(m => m.value === selectedMetric)?.label}: ${payload[0].value.toFixed(2)}`}
                        {selectedStation === 'all' && <span style={{ fontSize: '11px', color: '#666' }}> (TB)</span>}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="analysis-wrapper">
            <div className="analysis-container">
                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="filter-group" style={{ maxWidth: '500px' }}>
                        <label className="filter-label">
                            Trạm quan trắc ({stations.length - 1} trạm)
                            {selectedStation !== 'all' && ` - Đang xem: ${stations.find(s => s.value === selectedStation)?.label}`}
                        </label>
                        <select
                            className="filter-select"
                            value={selectedStation}
                            onChange={(e) => setSelectedStation(e.target.value)}
                        >
                            {stations.map(station => (
                                <option key={station.value} value={station.value}>
                                    {station.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Progress Cards */}
                <div className="progress-cards">
                    {progressData.map((item, idx) => (
                        <div key={idx} className="progress-card">
                            <div className="progress-card-header">
                                <h4 className="progress-card-title">{item.label}</h4>
                                <span className="progress-card-value">
                                    {item.value.toFixed(1)} {item.unit}
                                    {selectedStation === 'all' && <span style={{ fontSize: '11px', color: '#666', marginLeft: '5px' }}>(TB)</span>}
                                </span>
                            </div>
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar-fill"
                                    style={{
                                        width: `${Math.min((item.value / item.maxValue) * 100, 100)}%`,
                                        backgroundColor: item.color
                                    }}
                                ></div>
                            </div>
                            <div className="progress-card-footer">
                                <span className="progress-max">{item.description}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Grid */}
                <div className="main-grid">
                    <div className="left-column">
                        {/* TIME SERIES CHART */}
                        <div className="analysis-card chart-card">
                            <div className="chart-header">
                                <h3 className="chart-title">
                                    Xu hướng 30 ngày qua ({timeSeriesData.length} điểm dữ liệu)
                                    {selectedStation === 'all' && <span style={{ fontSize: '14px', color: '#666', marginLeft: '8px' }}>(Trung bình {Object.keys(airQualityHistory).length} trạm)</span>}
                                </h3>
                                <div className="chart-filters">
                                    <div className="filter-group-inline">
                                        <label className="filter-label-small">Chỉ số</label>
                                        <select
                                            className="filter-select-small"
                                            value={selectedMetric}
                                            onChange={(e) => setSelectedMetric(e.target.value)}
                                        >
                                            {metrics.map(m => (
                                                <option key={m.value} value={m.value}>{m.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="chart-container">
                                {timeSeriesData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={380}>
                                        <AreaChart data={timeSeriesData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3AA5C2" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#3AA5C2" stopOpacity={0.05} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                            <XAxis
                                                dataKey="displayTime"
                                                stroke="#9CA3AF"
                                                tick={{ fontSize: 10 }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                            />
                                            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area
                                                type="monotone"
                                                dataKey={selectedMetric}
                                                stroke="#3197B1"
                                                strokeWidth={2}
                                                fill="url(#colorValue)"
                                                dot={false}
                                                activeDot={{ r: 5 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="no-data-message">
                                        <p>Chưa có dữ liệu lịch sử cho trạm này</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Slider Card */}
                        <div className="analysis-card slider-card">
                            <div className="chart-header">
                                <h3 className="chart-title">
                                    Chỉ số chất lượng không khí
                                    {selectedStation === 'all' && <span style={{ fontSize: '13px', color: '#666', marginLeft: '8px' }}>(Trung bình)</span>}
                                </h3>
                            </div>
                            <div className="slider-list">
                                {sliderData.map((item, idx) => (
                                    <div key={idx} className="slider-container">
                                        <span className="slider-label">{item.label}</span>
                                        <div className="slider-track">
                                            <div className="slider-fill" style={{ width: `${item.value}%` }}></div>
                                            <div className="slider-tooltip" style={{ left: `${item.value}%` }}>
                                                {item.rawValue} {item.unit}
                                            </div>
                                        </div>
                                        <div className="slider-value-group">
                                            <span className="slider-end-value">{item.maxValue} {item.unit}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="right-column">
                        {/* AQI Card - ENLARGED */}
                        <div className="analysis-card aqi-status-card-large">
                            <h3 className="card-title">
                                Tình trạng không khí
                                {selectedStation === 'all' && <span style={{ fontSize: '12px', color: '#666', marginLeft: '5px' }}>(TB)</span>}
                            </h3>
                            <div className="aqi-status-content-large">
                                <div className="aqi-circle-large" style={{ borderColor: statusInfo.color }}>
                                    <span className="aqi-value-large">{currentAQI}</span>
                                    <span className="aqi-label-large">{statusInfo.label}</span>
                                </div>

                                {/* Weather Info Inline */}
                                <div className="weather-inline">
                                    <div className="weather-inline-item">
                                        <span className="weather-inline-icon">🌡️</span>
                                        <div className="weather-inline-content">
                                            <span className="weather-inline-label">Nhiệt độ</span>
                                            <span className="weather-inline-value">{weatherSummary.temperature}°C</span>
                                        </div>
                                    </div>
                                    <div className="weather-inline-item">
                                        <span className="weather-inline-icon">💧</span>
                                        <div className="weather-inline-content">
                                            <span className="weather-inline-label">Độ ẩm</span>
                                            <span className="weather-inline-value">{weatherSummary.humidity}%</span>
                                        </div>
                                    </div>
                                    <div className="weather-inline-item">
                                        <span className="weather-inline-icon">🌀</span>
                                        <div className="weather-inline-content">
                                            <span className="weather-inline-label">Áp suất</span>
                                            <span className="weather-inline-value">{weatherSummary.pressure} hPa</span>
                                        </div>
                                    </div>
                                    <div className="weather-inline-item">
                                        <span className="weather-inline-icon">💨</span>
                                        <div className="weather-inline-content">
                                            <span className="weather-inline-label">Tốc độ gió</span>
                                            <span className="weather-inline-value">{weatherSummary.windSpeed} m/s</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Radar Chart */}
                        <div className="analysis-card radar-card">
                            <h3 className="card-title">
                                Phân tích đa chỉ số
                                {selectedStation === 'all' && <span style={{ fontSize: '12px', color: '#666', marginLeft: '5px' }}>(TB)</span>}
                            </h3>
                            <div className="radar-container">
                                <ResponsiveContainer width="100%" height={300}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="#E5E7EB" />
                                        <PolarAngleAxis dataKey="subject" stroke="#6B7280" />
                                        <Radar
                                            name="Giá trị"
                                            dataKey="A"
                                            stroke="#3197B1"
                                            fill="#3197B1"
                                            fillOpacity={0.5}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analysis;