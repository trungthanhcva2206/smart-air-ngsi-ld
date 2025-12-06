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
import { BsGeoAlt, BsCloudRain, BsWind, BsInfoCircle, BsArrowRight, BsX } from 'react-icons/bs';
import './StationInfo.scss';
import { useNavigate } from 'react-router-dom';

const StationInfo = ({ platform, weatherData, airQualityData, loading, error, onClose }) => {
    const navigate = useNavigate();
    if (!platform) {
        return (
            <div className="station-info card shadow">
                <div className="card-body text-center text-muted">
                    <BsInfoCircle size={32} className="mb-2" />
                    <p>Chọn một trạm trên bản đồ để xem chi tiết</p>
                </div>
            </div>
        );
    }

    // API returns flat keyValues format, not NGSI-LD normalized
    // Access properties directly without .value wrapper
    const platformAddress = platform.address;
    const addressText = platformAddress
        ? `${platformAddress.addressLocality}, ${platformAddress.addressRegion}, ${platformAddress.addressCountry}`
        : 'N/A';

    // Show sensor sections based on available data
    const hasWeatherData = !!weatherData;
    const hasAirQualityData = !!airQualityData;

    return (
        <div className="station-info card shadow">
            {/* Header with Address and Close Button */}
            <div className="card-header">
                <div className="d-flex align-items-start gap-2">
                    <BsGeoAlt className="text-primary mt-1" />
                    <div className="flex-grow-1">
                        <div className="fw-semibold">{addressText}</div>
                        <div className="small text-muted">{platform.name || 'N/A'}</div>
                    </div>
                    {/* Close Button */}
                    <button
                        className="btn btn-sm btn-link text-muted p-0 ms-2"
                        onClick={onClose}
                        aria-label="Đóng"
                        title="Đóng"
                    >
                        <BsX size={28} />
                    </button>
                </div>
            </div>

            <div className="card-body p-0">
                {/* Loading State */}
                {loading && (
                    <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                        <p className="text-muted small mt-2">Đang tải dữ liệu quan trắc...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="alert alert-warning m-3" role="alert">
                        <small>{error}</small>
                    </div>
                )}

                {/* Data Grid */}
                {!loading && !error && (
                    <div className="sensors-grid">
                        {/* Weather Sensor Section */}
                        {hasWeatherData && (
                            <div className="sensor-section weather-section">
                                <div className="sensor-header">
                                    <BsCloudRain className="me-2" />
                                    <span className="fw-semibold">Thời Tiết</span>
                                </div>
                                <div className="sensor-content">
                                    <div className="info-item">
                                        <label>Nguồn dữ liệu:</label>
                                        <span>{platform.owner || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Cập nhật lần cuối:</label>
                                        <span className="small">
                                            {weatherData.observedAt
                                                ? new Date(weatherData.observedAt).toLocaleString('vi-VN')
                                                : 'N/A'}
                                        </span>
                                    </div>

                                    <div className="measurements mt-3">
                                        <h6 className="small fw-semibold mb-2">Đo đạc:</h6>
                                        <div className="measurement-grid">
                                            {weatherData.temperature !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">Nhiệt độ</span>
                                                    <span className="value">{weatherData.temperature}°C</span>
                                                </div>
                                            )}
                                            {weatherData.feelsLikeTemperature !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">Cảm giác như</span>
                                                    <span className="value">{weatherData.feelsLikeTemperature}°C</span>
                                                </div>
                                            )}
                                            {weatherData.relativeHumidity !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">Độ ẩm</span>
                                                    <span className="value">{(weatherData.relativeHumidity * 100).toFixed(0)}%</span>
                                                </div>
                                            )}
                                            {weatherData.atmosphericPressure !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">Áp suất</span>
                                                    <span className="value">{weatherData.atmosphericPressure} hPa</span>
                                                </div>
                                            )}
                                            {weatherData.windSpeed !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">Tốc độ gió</span>
                                                    <span className="value">{weatherData.windSpeed} m/s</span>
                                                </div>
                                            )}
                                            {weatherData.windDirection !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">Hướng gió</span>
                                                    <span className="value">{weatherData.windDirection}°</span>
                                                </div>
                                            )}
                                            {weatherData.precipitation !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">Lượng mưa</span>
                                                    <span className="value">{weatherData.precipitation} mm</span>
                                                </div>
                                            )}
                                            {weatherData.visibility !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">Tầm nhìn</span>
                                                    <span className="value">{weatherData.visibility} m</span>
                                                </div>
                                            )}
                                            {weatherData.cloudiness !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">Mây che phủ</span>
                                                    <span className="value">{weatherData.cloudiness}%</span>
                                                </div>
                                            )}
                                            {weatherData.illuminance !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">Độ sáng</span>
                                                    <span className="value">{weatherData.illuminance} lux</span>
                                                </div>
                                            )}
                                            {weatherData.weatherType && (
                                                <div className="measurement-item">
                                                    <span className="label">Loại thời tiết</span>
                                                    <span className="value">{weatherData.weatherType}</span>
                                                </div>
                                            )}
                                            {weatherData.pressureTendency !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">Xu hướng áp suất</span>
                                                    <span className="value">{weatherData.pressureTendency}</span>
                                                </div>
                                            )}
                                            {weatherData.weatherDescription && (
                                                <div className="measurement-item full-width">
                                                    <span className="label">Mô tả</span>
                                                    <span className="value">{weatherData.weatherDescription}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Air Quality Sensor Section */}
                        {hasAirQualityData && (
                            <div className="sensor-section air-quality-section">
                                <div className="sensor-header">
                                    <BsWind className="me-2" />
                                    <span className="fw-semibold">Chất Lượng Không Khí</span>
                                </div>
                                <div className="sensor-content">
                                    <div className="info-item">
                                        <label>Nguồn dữ liệu:</label>
                                        <span>{platform.owner || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Cập nhật lần cuối:</label>
                                        <span className="small">
                                            {airQualityData.observedAt
                                                ? new Date(airQualityData.observedAt).toLocaleString('vi-VN')
                                                : 'N/A'}
                                        </span>
                                    </div>

                                    {/* AQI Badge */}
                                    {airQualityData.airQualityIndex !== undefined && (
                                        <div className="aqi-badge mt-2">
                                            <span className="badge bg-info">
                                                AQI: {airQualityData.airQualityIndex} - {
                                                    airQualityData.airQualityLevel === 'good' ? 'Tốt' :
                                                        airQualityData.airQualityLevel === 'fair' ? 'Trung bình' :
                                                            airQualityData.airQualityLevel === 'moderate' ? 'Khá' :
                                                                airQualityData.airQualityLevel === 'poor' ? 'Kém' :
                                                                    airQualityData.airQualityLevel === 'very poor' ? 'Rất kém' :
                                                                        airQualityData.airQualityLevel || 'N/A'
                                                }
                                            </span>
                                        </div>
                                    )}

                                    {/* Reliability */}
                                    {airQualityData.reliability !== undefined && (
                                        <div className="info-item mt-2">
                                            <label>Độ tin cậy:</label>
                                            <span>{(airQualityData.reliability * 100).toFixed(0)}%</span>
                                        </div>
                                    )}

                                    <div className="measurements mt-3">
                                        <h6 className="small fw-semibold mb-2">Chất gây ô nhiễm:</h6>
                                        <div className="measurement-grid">
                                            {airQualityData.co !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">CO</span>
                                                    <span className="value">{airQualityData.co.toFixed(2)} μg/m³</span>
                                                </div>
                                            )}
                                            {airQualityData.coLevel && (
                                                <div className="measurement-item">
                                                    <span className="label">Mức CO</span>
                                                    <span className="value">{
                                                        airQualityData.coLevel === 'good' ? 'Tốt' :
                                                            airQualityData.coLevel === 'fair' ? 'Trung bình' :
                                                                airQualityData.coLevel === 'moderate' ? 'Khá' :
                                                                    airQualityData.coLevel === 'poor' ? 'Kém' :
                                                                        airQualityData.coLevel
                                                    }</span>
                                                </div>
                                            )}
                                            {airQualityData.no !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">NO</span>
                                                    <span className="value">{airQualityData.no.toFixed(2)} μg/m³</span>
                                                </div>
                                            )}
                                            {airQualityData.no2 !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">NO₂</span>
                                                    <span className="value">{airQualityData.no2.toFixed(2)} μg/m³</span>
                                                </div>
                                            )}
                                            {airQualityData.nox !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">NOₓ</span>
                                                    <span className="value">{airQualityData.nox.toFixed(2)} μg/m³</span>
                                                </div>
                                            )}
                                            {airQualityData.o3 !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">O₃</span>
                                                    <span className="value">{airQualityData.o3.toFixed(2)} μg/m³</span>
                                                </div>
                                            )}
                                            {airQualityData.so2 !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">SO₂</span>
                                                    <span className="value">{airQualityData.so2.toFixed(2)} μg/m³</span>
                                                </div>
                                            )}
                                            {airQualityData.pm2_5 !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">PM2.5</span>
                                                    <span className="value">{airQualityData.pm2_5.toFixed(2)} μg/m³</span>
                                                </div>
                                            )}
                                            {airQualityData.pm10 !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">PM10</span>
                                                    <span className="value">{airQualityData.pm10.toFixed(2)} μg/m³</span>
                                                </div>
                                            )}
                                            {airQualityData.nh3 !== undefined && (
                                                <div className="measurement-item">
                                                    <span className="label">NH₃</span>
                                                    <span className="value">{airQualityData.nh3.toFixed(2)} μg/m³</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* View Details Button */}
            <div className="card-footer bg-white border-top">
                <button
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => navigate(`/${platform.entityId}`, { state: { platform } })}
                >
                    <span>Xem chi tiết</span>
                    <BsArrowRight />
                </button>
            </div>
        </div>
    );
};

export default StationInfo;
