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

import React, { useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    RadarChart, PolarGrid, PolarAngleAxis, Radar,
    ResponsiveContainer
} from 'recharts';
import './Analysis.css';

const Analysis = () => {
    const [timeRange, setTimeRange] = useState('historical');

    const monthlyData = [
        { month: 'T1', value: 800 }, { month: 'T2', value: 600 },
        { month: 'T3', value: 550 }, { month: 'T4', value: 500 },
        { month: 'T5', value: 620 }, { month: 'T6', value: 580 },
        { month: 'T7', value: 560 }, { month: 'T8', value: 550 },
        { month: 'T9', value: 480 }, { month: 'T10', value: 420 },
        { month: 'T11', value: 600 }
    ];

    const radarData = [
        { subject: 'PM2.5', value: 80 }, { subject: 'PM10', value: 65 },
        { subject: 'CO', value: 45 }, { subject: 'NO2', value: 70 },
        { subject: 'SO2', value: 30 }, { subject: 'O3', value: 55 }
    ];

    const progressData = [
        { value: 25, label: 'Trung bình PM2.5', id: '01' },
        { value: 50, label: 'Trạm chất lượng tốt', id: '02' },
        { value: 75, label: 'Độ ẩm trung bình', id: '03' },
        { value: 100, label: 'AQI toàn thành phố', id: '04' }
    ];

    const sliderData = [
        { label: 'PM2.5', value: 65 },
        { label: 'PM10', value: 45 },
        { label: 'CO', value: 80 },
        { label: 'NO2', value: 55 },
        { label: 'SO2', value: 30 },
        { label: 'O3', value: 70 },
        { label: 'NH3', value: 40 },
        { label: 'Nhiệt độ', value: 60 }
    ];

    return (
        <div className="analysis-wrapper">
            <div className="analysis-container">

                <div className="progress-grid">
                    {progressData.map((item, idx) => (
                        <div key={idx} className="analysis-card progress-card">
                            <div className="card-header">
                                <span className="card-title">Phân tích</span>
                                <div className="button-group">
                                    <button
                                        className={`btn-time ${timeRange === 'month' ? 'active' : ''}`}
                                        onClick={() => setTimeRange('month')}
                                    >
                                        Tháng
                                    </button>
                                    <button
                                        className={`btn-time primary ${timeRange === 'historical' ? 'active' : ''}`}
                                        onClick={() => setTimeRange('historical')}
                                    >
                                        Lịch sử
                                    </button>
                                </div>
                            </div>

                            <div className="progress-circle-container">
                                <svg className="progress-circle" viewBox="0 0 96 96">
                                    <circle
                                        className="progress-bg"
                                        cx="48" cy="48" r="40"
                                        strokeWidth="8"
                                        fill="transparent"
                                    />
                                    <circle
                                        className={`progress-bar progress-${item.value}`}
                                        cx="48" cy="48" r="40"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={`${2 * Math.PI * 40}`}
                                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - item.value / 100)}`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className={`progress-value value-${item.value}`}>
                                    {item.value}%
                                </div>
                            </div>

                            <div className="progress-info">
                                <p className="progress-id">{item.id}</p>
                                <p className="progress-label">{item.label}</p>
                                <p className="progress-time">7 ngày qua</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="main-grid">

                    <div className="left-column">

                        <div className="analysis-card chart-card">
                            <div className="chart-header">
                                <h3 className="chart-title">Xu hướng theo tháng</h3>
                                <div className="button-group">
                                    <button className="btn-secondary">Tháng</button>
                                    <button className="btn-primary">Lịch sử</button>
                                </div>
                            </div>

                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={380}>
                                    <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3AA5C2" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#3AA5C2" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                                        <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                                        <Tooltip wrapperClassName="custom-tooltip" />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#3197B1"
                                            strokeWidth={3}
                                            fill="url(#colorValue)"
                                            dot={{ fill: '#3197B1', r: 5, strokeWidth: 2, stroke: 'white' }}
                                            activeDot={{ r: 7 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="analysis-card slider-card">
                            <div className="chart-header">
                                <h3 className="chart-title">Chi tiết thông số</h3>
                                <div className="button-group">
                                    <button className="btn-secondary">Tháng</button>
                                    <button className="btn-primary">Lịch sử</button>
                                </div>
                            </div>

                            <div className="slider-list">
                                {sliderData.map((item, idx) => (
                                    <div key={idx} className="slider-container">
                                        <span className="slider-label">{item.label}</span>
                                        <div className="slider-track">
                                            <div className={`slider-fill fill-${item.value}`}>
                                                <div className={`slider-thumb thumb-${item.value}`}></div>
                                            </div>
                                        </div>
                                        <span className="slider-value">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="right-column">

                        <div className="analysis-card column-card">
                            <div className="card-header-inline">
                                <h4 className="card-subtitle">Biểu đồ theo ngày</h4>
                                <div className="toggle-switch active">
                                    <div className="toggle-knob"></div>
                                </div>
                            </div>

                            <div className="column-chart">
                                {[80, 70, 100, 60].map((value, idx) => (
                                    <div key={idx} className="column-item">
                                        <div className={`column-dot dot-${idx % 2}`}></div>
                                        <div className={`column-bar bar-${idx % 2} bar-height-${value}`}></div>
                                    </div>
                                ))}
                            </div>

                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>HƯỚNG</th>
                                        <th>VÒNG</th>
                                        <th>THỜI GIAN</th>
                                        <th>KHOẢNG CÁCH</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>750 m</td>
                                        <td>0</td>
                                        <td>5 phút</td>
                                        <td>20 giờ</td>
                                    </tr>
                                    <tr>
                                        <td>250 m</td>
                                        <td>0</td>
                                        <td>5 phút</td>
                                        <td>15 giờ</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="analysis-card radar-card">
                            <div className="card-header-inline">
                                <h4 className="card-subtitle">Phân tích chất ô nhiễm</h4>
                                <div className="button-group-small">
                                    <button className="btn-small active">Tháng</button>
                                    <button className="btn-small">Ngày</button>
                                    <button className="btn-small">Năm</button>
                                </div>
                            </div>

                            <div className="radar-container">
                                <ResponsiveContainer width="100%" height={280}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="#E5E7EB" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 11 }} />
                                        <Radar
                                            dataKey="value"
                                            stroke="#3DC488"
                                            fill="#51D291"
                                            fillOpacity={0.6}
                                            strokeWidth={2}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="activity-section">
                            <div className="section-header">
                                <h4 className="section-title">Hoạt động</h4>
                                <div className="button-group">
                                    <button className="btn-text">Tháng</button>
                                    <button className="btn-primary-small">Lịch sử</button>
                                </div>
                            </div>

                            <div className="activity-card card-teal">
                                <div className="activity-content">
                                    <div className="activity-icon icon-teal"></div>
                                    <div className="activity-info">
                                        <span className="activity-value">96</span>
                                        <span className="activity-unit">trạm</span>
                                    </div>
                                </div>
                                <button className="btn-primary">Xem</button>
                            </div>

                            <div className="activity-card card-emerald">
                                <div className="activity-content">
                                    <div className="activity-icon icon-emerald"></div>
                                    <div className="activity-info">
                                        <span className="activity-value">12</span>
                                        <span className="activity-unit">cảnh báo</span>
                                    </div>
                                </div>
                                <button className="btn-emerald">Xem</button>
                            </div>

                            <div className="analysis-card gauge-card">
                                <div className="gauge-container">
                                    <svg viewBox="0 0 100 100" className="gauge-svg">
                                        <circle className="gauge-bg" cx="50" cy="50" r="40" strokeWidth="10" fill="none" />
                                        <circle className="gauge-progress" cx="50" cy="50" r="40" strokeWidth="10" fill="none"
                                            strokeDasharray="125.6" strokeDashoffset="62.8" strokeLinecap="round" />
                                    </svg>
                                    <div className="gauge-value">50%</div>
                                </div>
                                <div className="gauge-label">
                                    <span>25%</span>
                                    <span className="gauge-text">Chất lượng không khí tốt</span>
                                    <span>100%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analysis;
