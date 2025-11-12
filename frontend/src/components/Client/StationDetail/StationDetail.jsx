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

import { useState, useMemo } from 'react';
import { BsGeoAlt, BsCloudRain, BsWind, BsDownload, BsArrowRepeat } from 'react-icons/bs';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import Chart from '../Chart/Chart';
import './StationDetail.scss';

const StationDetail = () => {
    // Mock data cho giao diện
    const [selectedMetric, setSelectedMetric] = useState('co');
    const [selectedWeatherMetric, setSelectedWeatherMetric] = useState('temperature');
    const [timeRange, setTimeRange] = useState('24h');
    const [weatherTimeRange, setWeatherTimeRange] = useState('24h');
    const [chartType, setChartType] = useState('linear');
    const [weatherChartType, setWeatherChartType] = useState('linear');

    // States để kiểm soát việc hiển thị biểu đồ
    const [showAirQualityChart, setShowAirQualityChart] = useState(false);
    const [showWeatherChart, setShowWeatherChart] = useState(false);

    // States lưu config đã apply vào chart (chỉ update khi nhấn Update button)
    const [appliedAirQualityConfig, setAppliedAirQualityConfig] = useState(null);
    const [appliedWeatherConfig, setAppliedWeatherConfig] = useState(null);

    // Generate mock data for charts
    const generateMockData = (hours, metricType) => {
        const data = [];
        const now = new Date();

        for (let i = hours; i >= 0; i--) {
            const time = new Date(now - i * 3600000);
            const timeStr = time.getHours().toString().padStart(2, '0') + ':00';

            let value;
            if (metricType === 'airquality') {
                // Mock air quality data (CO values: 300-500)
                value = 350 + Math.random() * 150 + Math.sin(i / 4) * 50;
            } else {
                // Mock weather data (Temperature: 20-30°C)
                value = 25 + Math.random() * 5 + Math.sin(i / 6) * 3;
            }

            data.push({
                time: timeStr,
                value: parseFloat(value.toFixed(2))
            });
        }

        return data;
    };

    // Get hours from timeRange
    const getHoursFromRange = (range) => {
        switch (range) {
            case '24h': return 24;
            case '48h': return 48;
            case '72h': return 72;
            case '1week': return 168;
            case '1month': return 720;
            default: return 24;
        }
    };

    // Memoized chart data - chỉ generate khi có appliedConfig
    const airQualityChartData = useMemo(
        () => appliedAirQualityConfig
            ? generateMockData(getHoursFromRange(appliedAirQualityConfig.timeRange), 'airquality')
            : [],
        [appliedAirQualityConfig]
    );

    const weatherChartData = useMemo(
        () => appliedWeatherConfig
            ? generateMockData(getHoursFromRange(appliedWeatherConfig.timeRange), 'weather')
            : [],
        [appliedWeatherConfig]
    );

    // Breadcrumb items
    const breadcrumbItems = [
        { label: 'Bản đồ trạm', link: '/' },
        { label: 'Phường Hoàn Kiếm' }
    ];

    // Metrics options cho Air Quality
    const airQualityMetrics = [
        { value: 'co', label: 'CO (μg/m³)' },
        { value: 'no2', label: 'NO₂ (μg/m³)' },
        { value: 'o3', label: 'O₃ (μg/m³)' },
        { value: 'so2', label: 'SO₂ (μg/m³)' },
        { value: 'pm2_5', label: 'PM2.5 (μg/m³)' },
        { value: 'pm10', label: 'PM10 (μg/m³)' },
        { value: 'nh3', label: 'NH₃ (μg/m³)' }
    ];

    // Metrics options cho Weather
    const weatherMetrics = [
        { value: 'temperature', label: 'Nhiệt độ (°C)' },
        { value: 'humidity', label: 'Độ ẩm (%)' },
        { value: 'pressure', label: 'Áp suất (hPa)' },
        { value: 'windSpeed', label: 'Tốc độ gió (m/s)' },
        { value: 'precipitation', label: 'Lượng mưa (mm)' }
    ];

    const timeRangeOptions = [
        { value: '24h', label: '24h trước' },
        { value: '48h', label: '48h trước' },
        { value: '72h', label: '72h trước' },
        { value: '1week', label: '1 tuần trước' },
        { value: '1month', label: '1 tháng trước' }
    ];

    const chartTypeOptions = [
        { value: 'linear', label: 'Linear' },
        { value: 'logarithmic', label: 'Logarithmic' }
    ];

    // Metric color mapping
    const metricColors = {
        co: '#ff6b6b',
        no2: '#feca57',
        o3: '#48dbfb',
        so2: '#ff9ff3',
        pm2_5: '#ee5a6f',
        pm10: '#c44569',
        nh3: '#786fa6',
        temperature: '#ff6348',
        humidity: '#1e90ff',
        pressure: '#2ed573',
        windSpeed: '#00d2d3',
        precipitation: '#5f27cd'
    };

    const handleUpdate = () => {
        console.log('Updating chart with:', { selectedMetric, timeRange, chartType });
        // Apply config và hiển thị biểu đồ
        setAppliedAirQualityConfig({
            metric: selectedMetric,
            timeRange: timeRange,
            chartType: chartType
        });
        setShowAirQualityChart(true);
    };

    const handleWeatherUpdate = () => {
        console.log('Updating weather chart with:', { selectedWeatherMetric, weatherTimeRange, weatherChartType });
        // Apply config và hiển thị biểu đồ
        setAppliedWeatherConfig({
            metric: selectedWeatherMetric,
            timeRange: weatherTimeRange,
            chartType: weatherChartType
        });
        setShowWeatherChart(true);
    };

    const handleExport = () => {
        console.log('Exporting data...');
        // Mock export functionality
        const dataStr = JSON.stringify(airQualityChartData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `air-quality-${selectedMetric}-${new Date().toISOString()}.json`;
        link.click();
    };

    const handleWeatherExport = () => {
        console.log('Exporting weather data...');
        const dataStr = JSON.stringify(weatherChartData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `weather-${selectedWeatherMetric}-${new Date().toISOString()}.json`;
        link.click();
    };

    return (
        <div className="station-detail-page">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Card 1: Thông tin trạm và 2 cảm biến */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    {/* Hàng 1: Thông tin trạm */}
                    <div className="info-section mb-4">
                        <div className="section-header">
                            <BsGeoAlt className="me-2 text-primary" />
                            <h5 className="mb-0">Thông tin trạm</h5>
                        </div>
                        <div className="section-content">
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <div className="info-item">
                                        <label>Tên trạm:</label>
                                        <span>Environment Monitoring Platform - Hoàn Kiếm</span>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="info-item">
                                        <label>Mã trạm:</label>
                                        <span>HN-HOANKIEM</span>
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="info-item">
                                        <label>Địa chỉ:</label>
                                        <span>Hoàn Kiếm, Hà Nội</span>
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="info-item">
                                        <label>Vị trí:</label>
                                        <span>20.98°N, 105.85°E</span>
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="info-item">
                                        <label>Trạng thái:</label>
                                        <span className="badge bg-success">Hoạt động</span>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="info-item">
                                        <label>Loại trạm:</label>
                                        <span>EnvironmentMonitoringStation</span>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="info-item">
                                        <label>Ngày triển khai:</label>
                                        <span>01/01/2025</span>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="info-item">
                                        <label>Chủ sở hữu:</label>
                                        <span>Hanoi Department of Environment</span>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="info-item">
                                        <label>Vận hành bởi:</label>
                                        <span>Hanoi Smart City Initiative</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hàng 2: 2 Cảm biến */}
                    <div className="row g-4">
                        {/* Cột 1: Cảm biến chất lượng không khí */}
                        <div className="col-md-6">
                            <div className="info-section">
                                <div className="section-header">
                                    <BsWind className="me-2 text-info" />
                                    <h5 className="mb-0">Cảm biến chất lượng không khí</h5>
                                </div>
                                <div className="section-content">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Tên thiết bị:</label>
                                                <span>AirQualitySensor-PhuongHoanKiem</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Số serial:</label>
                                                <span>AQ-HN-HOANKIEM-001</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Loại cảm biến:</label>
                                                <span>AirQualityMonitor</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Thương hiệu:</label>
                                                <span>Environmental Sensors Co.</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Model:</label>
                                                <span>Multi-Pollutant Air Quality Monitor</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Phiên bản phần cứng:</label>
                                                <span>2.0</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Phiên bản phần mềm:</label>
                                                <span>1.5.0</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Firmware:</label>
                                                <span>3.2.1</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Trạng thái thiết bị:</label>
                                                <span className="badge bg-success">Active</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Ngày cài đặt:</label>
                                                <span>01/01/2025</span>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="info-item">
                                                <label>Mô tả:</label>
                                                <span>Multi-pollutant air quality monitoring sensor</span>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="info-item">
                                                <label>Thuộc tính quan trắc:</label>
                                                <span className="d-flex flex-wrap gap-1">
                                                    <span className="badge bg-secondary">CO</span>
                                                    <span className="badge bg-secondary">NO₂</span>
                                                    <span className="badge bg-secondary">O₃</span>
                                                    <span className="badge bg-secondary">SO₂</span>
                                                    <span className="badge bg-secondary">PM2.5</span>
                                                    <span className="badge bg-secondary">PM10</span>
                                                    <span className="badge bg-secondary">NH₃</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cột 2: Cảm biến thời tiết */}
                        <div className="col-md-6">
                            <div className="info-section">
                                <div className="section-header">
                                    <BsCloudRain className="me-2 text-primary" />
                                    <h5 className="mb-0">Cảm biến thời tiết</h5>
                                </div>
                                <div className="section-content">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Tên thiết bị:</label>
                                                <span>WeatherSensor-PhuongHoanKiem</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Số serial:</label>
                                                <span>WS-HN-HOANKIEM-001</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Loại cảm biến:</label>
                                                <span>WeatherStation</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Thương hiệu:</label>
                                                <span>OpenWeather</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Model:</label>
                                                <span>Multi-Sensor Weather Station</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Phiên bản phần cứng:</label>
                                                <span>2.0</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Phiên bản phần mềm:</label>
                                                <span>1.5.0</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Firmware:</label>
                                                <span>3.2.1</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Trạng thái thiết bị:</label>
                                                <span className="badge bg-success">Active</span>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="info-item">
                                                <label>Ngày cài đặt:</label>
                                                <span>01/01/2025</span>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="info-item">
                                                <label>Mô tả:</label>
                                                <span>Multi-parameter weather sensor station</span>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="info-item">
                                                <label>Thuộc tính quan trắc:</label>
                                                <span className="d-flex flex-wrap gap-1">
                                                    <span className="badge bg-secondary">Nhiệt độ</span>
                                                    <span className="badge bg-secondary">Độ ẩm</span>
                                                    <span className="badge bg-secondary">Áp suất</span>
                                                    <span className="badge bg-secondary">Gió</span>
                                                    <span className="badge bg-secondary">Mưa</span>
                                                    <span className="badge bg-secondary">Tầm nhìn</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 2: Chất lượng không khí */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h4 className="mb-4">Chất lượng không khí</h4>

                    {/* Controls Row */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={selectedMetric}
                                onChange={(e) => setSelectedMetric(e.target.value)}
                            >
                                {airQualityMetrics.map(metric => (
                                    <option key={metric.value} value={metric.value}>
                                        {metric.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                            >
                                {timeRangeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={chartType}
                                onChange={(e) => setChartType(e.target.value)}
                            >
                                {chartTypeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-primary flex-grow-1"
                                    onClick={handleUpdate}
                                >
                                    <BsArrowRepeat className="me-1" />
                                    Update
                                </button>
                                <button
                                    className="btn btn-success"
                                    onClick={handleExport}
                                >
                                    <BsDownload />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="chart-container">
                        {showAirQualityChart && appliedAirQualityConfig ? (
                            <Chart
                                chartType={appliedAirQualityConfig.chartType}
                                metricLabel={airQualityMetrics.find(m => m.value === appliedAirQualityConfig.metric)?.label}
                                metricColor={metricColors[appliedAirQualityConfig.metric]}
                                data={airQualityChartData}
                                showArea={true}
                            />
                        ) : (
                            <div className="chart-placeholder">
                                <p className="text-muted">Chọn thông số và nhấn "Update" để hiển thị biểu đồ</p>
                                <small className="text-muted">
                                    Biểu đồ chất lượng không khí sẽ được vẽ sau khi bạn nhấn nút Update
                                </small>
                            </div>
                        )}
                    </div>

                    {/* Timezone Note */}
                    <div className="text-muted small mt-3">
                        * Dữ liệu được hiển thị theo múi giờ: {Intl.DateTimeFormat().resolvedOptions().timeZone} (UTC+7)
                    </div>
                </div>
            </div>

            {/* Card 3: Thời tiết */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <h4 className="mb-4">Thời tiết</h4>

                    {/* Controls Row */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={selectedWeatherMetric}
                                onChange={(e) => setSelectedWeatherMetric(e.target.value)}
                            >
                                {weatherMetrics.map(metric => (
                                    <option key={metric.value} value={metric.value}>
                                        {metric.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={weatherTimeRange}
                                onChange={(e) => setWeatherTimeRange(e.target.value)}
                            >
                                {timeRangeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={weatherChartType}
                                onChange={(e) => setWeatherChartType(e.target.value)}
                            >
                                {chartTypeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-primary flex-grow-1"
                                    onClick={handleWeatherUpdate}
                                >
                                    <BsArrowRepeat className="me-1" />
                                    Update
                                </button>
                                <button
                                    className="btn btn-success"
                                    onClick={handleWeatherExport}
                                >
                                    <BsDownload />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="chart-container">
                        {showWeatherChart && appliedWeatherConfig ? (
                            <Chart
                                chartType={appliedWeatherConfig.chartType}
                                metricLabel={weatherMetrics.find(m => m.value === appliedWeatherConfig.metric)?.label}
                                metricColor={metricColors[appliedWeatherConfig.metric]}
                                data={weatherChartData}
                                showArea={false}
                            />
                        ) : (
                            <div className="chart-placeholder">
                                <p className="text-muted">Chọn thông số và nhấn "Update" để hiển thị biểu đồ</p>
                                <small className="text-muted">
                                    Biểu đồ thời tiết sẽ được vẽ sau khi bạn nhấn nút Update
                                </small>
                            </div>
                        )}
                    </div>

                    {/* Timezone Note */}
                    <div className="text-muted small mt-3">
                        * Dữ liệu được hiển thị theo múi giờ: {Intl.DateTimeFormat().resolvedOptions().timeZone} (UTC+7)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StationDetail;
