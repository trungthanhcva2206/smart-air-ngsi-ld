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

import { useState, useMemo, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { BsGeoAlt, BsCloudRain, BsWind, BsDownload, BsArrowRepeat } from 'react-icons/bs';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import Chart from '../Chart/Chart';
import { getDevicesByPlatform, findDeviceBySensorType } from '../../../services/deviceService';
import { getWeatherHistory, getAirQualityHistory, transformToChartData } from '../../../services/observationService';
import './StationDetail.scss';

const StationDetail = () => {
    // Get platform ID from URL params
    const { platformId } = useParams();
    // Get platform data from location state (passed from StationInfo)
    const location = useLocation();
    const platform = location.state?.platform || null;

    // Device states
    const [devices, setDevices] = useState([]);
    const [weatherDevice, setWeatherDevice] = useState(null);
    const [airQualityDevice, setAirQualityDevice] = useState(null);
    const [devicesLoading, setDevicesLoading] = useState(true);
    const [devicesError, setDevicesError] = useState(null);

    // Chart control states
    const [selectedMetric, setSelectedMetric] = useState('');
    const [selectedWeatherMetric, setSelectedWeatherMetric] = useState('');
    const [timeRange, setTimeRange] = useState('24h');
    const [weatherTimeRange, setWeatherTimeRange] = useState('24h');
    const [chartType, setChartType] = useState('linear');
    const [weatherChartType, setWeatherChartType] = useState('linear');

    // States để kiểm soát việc hiển thị biểu đồ
    const [showAirQualityChart, setShowAirQualityChart] = useState(false);
    const [showWeatherChart, setShowWeatherChart] = useState(false);
    const [airQualityChartLoading, setAirQualityChartLoading] = useState(false);
    const [weatherChartLoading, setWeatherChartLoading] = useState(false);
    const [airQualityChartError, setAirQualityChartError] = useState(null);
    const [weatherChartError, setWeatherChartError] = useState(null);

    // States lưu config đã apply vào chart (chỉ update khi nhấn Update button)
    const [appliedAirQualityConfig, setAppliedAirQualityConfig] = useState(null);
    const [appliedWeatherConfig, setAppliedWeatherConfig] = useState(null);

    // Chart data states
    const [airQualityChartData, setAirQualityChartData] = useState([]);
    const [weatherChartData, setWeatherChartData] = useState([]);

    // States cho Chart Card 2 và 3
    const [airQualityConfig, setAirQualityConfig] = useState({
        metric: '',
        timeRange: '24h',
        chartType: 'linear'
    });
    const [combinedConfig, setCombinedConfig] = useState({
        weatherMetric: '',
        airQualityMetric: '',
        timeRange: '24h'
    });
    const [appliedCombinedConfig, setAppliedCombinedConfig] = useState({
        weatherMetric: null,
        airQualityMetric: null,
        timeRange: '24h'
    });
    const [combinedChartData, setCombinedChartData] = useState([]);

    // Fetch devices when component mounts
    useEffect(() => {
        const fetchDevices = async () => {
            if (!platformId) {
                setDevicesError('Platform ID không hợp lệ');
                setDevicesLoading(false);
                return;
            }

            setDevicesLoading(true);
            setDevicesError(null);

            const response = await getDevicesByPlatform(platformId);

            if (response.EC === 0) {
                const deviceList = response.DT || [];
                setDevices(deviceList);

                // Find specific devices
                const weatherDev = findDeviceBySensorType(deviceList, 'WeatherStation');
                const airQualityDev = findDeviceBySensorType(deviceList, 'AirQualityMonitor');

                setWeatherDevice(weatherDev);
                setAirQualityDevice(airQualityDev);

                // Set default selected metrics for old charts
                if (airQualityDev && airQualityDev.controlledProperty?.length > 0) {
                    setSelectedMetric(airQualityDev.controlledProperty[0]);
                }
                if (weatherDev && weatherDev.controlledProperty?.length > 0) {
                    setSelectedWeatherMetric(weatherDev.controlledProperty[0]);
                }

                // Set default metrics for new chart cards
                if (airQualityDev && airQualityDev.controlledProperty?.length > 0) {
                    setAirQualityConfig(prev => ({
                        ...prev,
                        metric: airQualityDev.controlledProperty[0]
                    }));
                }
                if (weatherDev && weatherDev.controlledProperty?.length > 0) {
                    setCombinedConfig(prev => ({
                        ...prev,
                        weatherMetric: weatherDev.controlledProperty[0]
                    }));
                }
                if (airQualityDev && airQualityDev.controlledProperty?.length > 0) {
                    setCombinedConfig(prev => ({
                        ...prev,
                        airQualityMetric: airQualityDev.controlledProperty[0]
                    }));
                }
            } else {
                setDevicesError(response.EM || 'Không thể tải dữ liệu thiết bị');
            }

            setDevicesLoading(false);
        };

        fetchDevices();
    }, [platformId]);

    // Breadcrumb items
    const breadcrumbItems = [
        { label: 'Bản đồ trạm', link: '/' },
        { label: platform?.address?.addressLocality || 'Chi tiết trạm' }
    ];

    // Build metrics options dynamically from device's controlledProperty
    const airQualityMetrics = useMemo(() => {
        if (!airQualityDevice || !airQualityDevice.controlledProperty) return [];

        const metricLabels = {
            'CO': 'CO (μg/m³)',
            'NO': 'NO (μg/m³)',
            'NO2': 'NO₂ (μg/m³)',
            'NOx': 'NOₓ (μg/m³)',
            'O3': 'O₃ (μg/m³)',
            'SO2': 'SO₂ (μg/m³)',
            'PM2.5': 'PM2.5 (μg/m³)',
            'PM10': 'PM10 (μg/m³)',
            'NH3': 'NH₃ (μg/m³)',
            'airQualityIndex': 'AQI'
        };

        return airQualityDevice.controlledProperty.map(prop => ({
            value: prop,
            label: metricLabels[prop] || prop
        }));
    }, [airQualityDevice]);

    // Build weather metrics dynamically from device's controlledProperty
    const weatherMetrics = useMemo(() => {
        if (!weatherDevice || !weatherDevice.controlledProperty) return [];

        const metricLabels = {
            'temperature': 'Nhiệt độ (°C)',
            'relativeHumidity': 'Độ ẩm (%)',
            'atmosphericPressure': 'Áp suất (hPa)',
            'windSpeed': 'Tốc độ gió (m/s)',
            'windDirection': 'Hướng gió (°)',
            'precipitation': 'Lượng mưa (mm)',
            'visibility': 'Tầm nhìn (m)',
            'illuminance': 'Độ sáng (lux)'
        };

        return weatherDevice.controlledProperty.map(prop => ({
            value: prop,
            label: metricLabels[prop] || prop
        }));
    }, [weatherDevice]);

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

    // Metric color mapping - extended with more properties
    const metricColors = {
        CO: '#ff6b6b',
        NO: '#feca57',
        NO2: '#feca57',
        NOx: '#ffd32a',
        O3: '#48dbfb',
        SO2: '#ff9ff3',
        'PM2.5': '#ee5a6f',
        PM10: '#c44569',
        NH3: '#786fa6',
        airQualityIndex: '#8395a7',
        temperature: '#ff6348',
        relativeHumidity: '#1e90ff',
        atmosphericPressure: '#2ed573',
        windSpeed: '#00d2d3',
        windDirection: '#5f27cd',
        precipitation: '#5f27cd',
        visibility: '#54a0ff',
        illuminance: '#feca57'
    };

    const handleUpdate = async () => {
        if (!platform?.address?.addressLocality || !selectedMetric) {
            return;
        }

        setAirQualityChartLoading(true);
        setAirQualityChartError(null);
        setShowAirQualityChart(false);

        // Get district name from platform
        const district = platform.address.addressLocality.replace(/\s+/g, '');
        // Call API to get air quality history
        const response = await getAirQualityHistory(district, selectedMetric, timeRange);
        if (response.EC === 0) {
            // Transform API response to chart data
            const chartData = transformToChartData(response, selectedMetric);
            setAirQualityChartData(chartData);

            // Apply config và hiển thị biểu đồ
            setAppliedAirQualityConfig({
                metric: selectedMetric,
                timeRange: timeRange,
                chartType: chartType
            });
            setShowAirQualityChart(true);
        } else {
            setAirQualityChartError(response.EM);
        }

        setAirQualityChartLoading(false);
    };

    const handleWeatherUpdate = async () => {
        if (!platform?.address?.addressLocality || !selectedWeatherMetric) {
            return;
        }

        setWeatherChartLoading(true);
        setWeatherChartError(null);
        setShowWeatherChart(false);

        // Get district name from platform
        const district = platform.address.addressLocality.replace(/\s+/g, '');

        // Call API to get weather history
        const response = await getWeatherHistory(district, selectedWeatherMetric, weatherTimeRange);

        if (response.EC === 0) {
            // Transform API response to chart data
            const chartData = transformToChartData(response, selectedWeatherMetric);
            setWeatherChartData(chartData);

            // Apply config và hiển thị biểu đồ
            setAppliedWeatherConfig({
                metric: selectedWeatherMetric,
                timeRange: weatherTimeRange,
                chartType: weatherChartType
            });
            setShowWeatherChart(true);
        } else {
            setWeatherChartError(response.EM);
        }

        setWeatherChartLoading(false);
    };

    // Convert chart data to NGSI-LD format
    const convertToNGSILD = (chartData, metric, entityType, district) => {
        const now = new Date().toISOString();
        const entityId = `urn:ngsi-ld:${entityType}:Hanoi-${district}-Export-${Date.now()}`;

        // Create NGSI-LD entity
        const ngsiEntity = {
            "id": entityId,
            "type": entityType,
            "@context": [
                "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"
            ],
            "location": {
                "type": "GeoProperty",
                "value": {
                    "type": "Point",
                    "coordinates": [
                        platform?.location?.lon || 105.85,
                        platform?.location?.lat || 20.98
                    ]
                }
            },
            "address": {
                "type": "Property",
                "value": {
                    "addressLocality": district,
                    "addressRegion": platform?.address?.addressRegion || "Hanoi",
                    "addressCountry": platform?.address?.addressCountry || "VN",
                    "type": "PostalAddress"
                }
            },
            "dataProvider": {
                "type": "Property",
                "value": platform?.owner || "Hanoi Smart City Initiative"
            },
            "dateExported": {
                "type": "Property",
                "value": {
                    "@type": "DateTime",
                    "@value": now
                }
            },
            "exportMetadata": {
                "type": "Property",
                "value": {
                    "metric": metric,
                    "timeRange": entityType === "AirQualityObserved" ? timeRange : weatherTimeRange,
                    "chartType": entityType === "AirQualityObserved" ? chartType : weatherChartType,
                    "dataPoints": chartData.length
                }
            },
            "timeSeries": {
                "type": "Property",
                "value": chartData.map(point => {
                    // Safe date parsing - point.time is already ISO string from API
                    const observedAt = point.time || new Date().toISOString();
                    return {
                        "time": point.time,
                        "value": point.value,
                        "observedAt": observedAt
                    };
                })
            }
        };

        // Add metric-specific property
        if (chartData.length > 0) {
            ngsiEntity[metric] = {
                "type": "Property",
                "value": chartData[chartData.length - 1].value,
                "observedAt": now,
                "unitCode": getUnitCode(metric)
            };
        }

        return ngsiEntity;
    };

    // Get unit code for metric
    const getUnitCode = (metric) => {
        const units = {
            // Air Quality
            'CO': 'GP',         // μg/m³
            'NO': 'GP',
            'NO2': 'GP',
            'NOx': 'GP',
            'O3': 'GP',
            'SO2': 'GP',
            'PM2.5': 'GP',
            'PM10': 'GP',
            'NH3': 'GP',
            'airQualityIndex': 'C62',  // dimensionless
            // Weather
            'temperature': 'CEL',       // Celsius
            'relativeHumidity': 'P1',   // Percentage
            'atmosphericPressure': 'A97', // hPa
            'windSpeed': 'MTS',         // m/s
            'windDirection': 'DD',      // degree
            'precipitation': 'MMT',     // mm
            'visibility': 'MTR',        // meter
            'illuminance': 'LUX'        // lux
        };
        return units[metric] || 'C62';
    };

    const handleExport = () => {
        const district = platform?.address?.addressLocality.replace(/\s+/g, '') || 'Unknown';
        const ngsiData = convertToNGSILD(
            airQualityChartData,
            selectedMetric,
            'AirQualityObserved',
            district
        );

        const dataStr = JSON.stringify(ngsiData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/ld+json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `air-quality-${selectedMetric}-${district}-${new Date().toISOString()}.jsonld`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleWeatherExport = () => {
        const district = platform?.address?.addressLocality.replace(/\s+/g, '') || 'Unknown';
        const ngsiData = convertToNGSILD(
            weatherChartData,
            selectedWeatherMetric,
            'WeatherObserved',
            district
        );

        const dataStr = JSON.stringify(ngsiData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/ld+json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `weather-${selectedWeatherMetric}-${district}-${new Date().toISOString()}.jsonld`;
        link.click();
        URL.revokeObjectURL(url);
    };



    // Helper function to get property label
    const getPropertyLabel = (prop) => {
        const allLabels = {
            // Air Quality
            'CO': 'CO',
            'NO': 'NO',
            'NO2': 'NO₂',
            'NOx': 'NOₓ',
            'O3': 'O₃',
            'SO2': 'SO₂',
            'PM2.5': 'PM2.5',
            'PM10': 'PM10',
            'NH3': 'NH₃',
            'airQualityIndex': 'AQI',
            // Weather
            'temperature': 'Nhiệt độ',
            'relativeHumidity': 'Độ ẩm',
            'atmosphericPressure': 'Áp suất',
            'windSpeed': 'Tốc độ gió',
            'windDirection': 'Hướng gió',
            'precipitation': 'Lượng mưa',
            'visibility': 'Tầm nhìn',
            'illuminance': 'Độ sáng'
        };
        return allLabels[prop] || prop;
    };

    return (
        <div className="station-detail-page">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Loading State */}
            {devicesLoading && (
                <div className="card shadow-sm mb-4">
                    <div className="card-body text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                        <p className="text-muted mt-3">Đang tải dữ liệu thiết bị...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {devicesError && (
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <div className="alert alert-danger mb-0" role="alert">
                            <strong>Lỗi:</strong> {devicesError}
                        </div>
                    </div>
                </div>
            )}

            {/* Card 1: Thông tin trạm và 2 cảm biến */}
            {!devicesLoading && !devicesError && (
                <>
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
                                                <span>{platform?.name || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="info-item">
                                                <label>Địa chỉ:</label>
                                                <span>
                                                    {platform?.address
                                                        ? `${platform.address.addressLocality}, ${platform.address.addressRegion}`
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="info-item">
                                                <label>Vị trí:</label>
                                                <span>
                                                    {platform?.location
                                                        ? `${platform.location.lat.toFixed(2)}°N, ${platform.location.lon.toFixed(2)}°E`
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="info-item">
                                                <label>Trạng thái:</label>
                                                <span className={`badge ${platform?.status === 'operational' ? 'bg-success' : 'bg-secondary'}`}>
                                                    {platform?.status === 'operational' ? 'Hoạt động' : platform?.status || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="info-item">
                                                <label>Loại trạm:</label>
                                                <span>{platform?.platformType || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="info-item">
                                                <label>Ngày triển khai:</label>
                                                <span>
                                                    {platform?.deploymentDate
                                                        ? new Date(platform.deploymentDate).toLocaleDateString('vi-VN')
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="info-item">
                                                <label>Chủ sở hữu:</label>
                                                <span>{platform?.owner || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="info-item">
                                                <label>Vận hành bởi:</label>
                                                <span>{platform?.operator || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="info-item">
                                                <label>Danh mục giám sát:</label>
                                                <span>
                                                    {platform?.monitoringCategories?.join(', ') || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hàng 2: 2 Cảm biến */}
                            <div className="row g-4">
                                {/* Cột 1: Cảm biến chất lượng không khí */}
                                {airQualityDevice && (
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
                                                            <span>{airQualityDevice.name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item">
                                                            <label>Số serial:</label>
                                                            <span>{airQualityDevice.serialNumber || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item">
                                                            <label>Loại cảm biến:</label>
                                                            <span>{airQualityDevice.sensorType}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item">
                                                            <label>Thương hiệu:</label>
                                                            <span>{airQualityDevice.brandName || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item">
                                                            <label>Model:</label>
                                                            <span>{airQualityDevice.modelName || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item">
                                                            <label>Phiên bản phần cứng:</label>
                                                            <span>{airQualityDevice.hardwareVersion || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item">
                                                            <label>Phiên bản phần mềm:</label>
                                                            <span>{airQualityDevice.softwareVersion || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item">
                                                            <label>Firmware:</label>
                                                            <span>{airQualityDevice.firmwareVersion || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item">
                                                            <label>Trạng thái thiết bị:</label>
                                                            <span className={`badge ${airQualityDevice.deviceState === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                                                {airQualityDevice.deviceState === 'active' ? 'Active' : airQualityDevice.deviceState || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item">
                                                            <label>Ngày cài đặt:</label>
                                                            <span>
                                                                {airQualityDevice.dateInstalled
                                                                    ? new Date(airQualityDevice.dateInstalled).toLocaleDateString('vi-VN')
                                                                    : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="info-item">
                                                            <label>Mô tả:</label>
                                                            <span>{airQualityDevice.description || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="info-item">
                                                            <label>Thuộc tính quan trắc:</label>
                                                            <span className="d-flex flex-wrap gap-1">
                                                                {airQualityDevice.controlledProperty?.map((prop, idx) => (
                                                                    <span key={idx} className="badge bg-secondary">{getPropertyLabel(prop)}</span>
                                                                ))}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Cột 2: Cảm biến thời tiết */}
                                {weatherDevice && (
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
                                                            <span>{weatherDevice.name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item">
                                                            <label>Số serial:</label>
                                                            <span>{weatherDevice.serialNumber || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item">
                                                            <label>Loại cảm biến:</label>
                                                            <span>{weatherDevice.sensorType}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item">
                                                            <label>Thương hiệu:</label>
                                                            <span>{weatherDevice.brandName || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item">
                                                            <label>Model:</label>
                                                            <span>{weatherDevice.modelName || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item">
                                                            <label>Phiên bản phần cứng:</label>
                                                            <span>{weatherDevice.hardwareVersion || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item">
                                                            <label>Phiên bản phần mềm:</label>
                                                            <span>{weatherDevice.softwareVersion || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item">
                                                            <label>Firmware:</label>
                                                            <span>{weatherDevice.firmwareVersion || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item">
                                                            <label>Trạng thái thiết bị:</label>
                                                            <span className={`badge ${weatherDevice.deviceState === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                                                {weatherDevice.deviceState === 'active' ? 'Active' : weatherDevice.deviceState || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="info-item">
                                                            <label>Ngày cài đặt:</label>
                                                            <span>
                                                                {weatherDevice.dateInstalled
                                                                    ? new Date(weatherDevice.dateInstalled).toLocaleDateString('vi-VN')
                                                                    : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="info-item">
                                                            <label>Mô tả:</label>
                                                            <span>{weatherDevice.description || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="info-item">
                                                            <label>Thuộc tính quan trắc:</label>
                                                            <span className="d-flex flex-wrap gap-1">
                                                                {weatherDevice.controlledProperty?.map((prop, idx) => (
                                                                    <span key={idx} className="badge bg-secondary">{getPropertyLabel(prop)}</span>
                                                                ))}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                                {airQualityChartLoading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Đang tải...</span>
                                        </div>
                                        <p className="text-muted mt-3">Đang tải dữ liệu chất lượng không khí...</p>
                                    </div>
                                ) : airQualityChartError ? (
                                    <div className="alert alert-warning" role="alert">
                                        <strong>Lỗi:</strong> {airQualityChartError}
                                    </div>
                                ) : showAirQualityChart && appliedAirQualityConfig ? (
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
                                {weatherChartLoading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Đang tải...</span>
                                        </div>
                                        <p className="text-muted mt-3">Đang tải dữ liệu thời tiết...</p>
                                    </div>
                                ) : weatherChartError ? (
                                    <div className="alert alert-warning" role="alert">
                                        <strong>Lỗi:</strong> {weatherChartError}
                                    </div>
                                ) : showWeatherChart && appliedWeatherConfig ? (
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
                </>
            )}
        </div>
    );
};

export default StationDetail;
