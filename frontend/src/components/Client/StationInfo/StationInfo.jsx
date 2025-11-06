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
import { BsGeoAlt, BsCloudRain, BsWind, BsActivity, BsInfoCircle, BsArrowRight } from 'react-icons/bs';
import './StationInfo.scss';

const StationInfo = ({ platform, devices, weatherData, airQualityData }) => {
    if (!platform || !devices || devices.length === 0) {
        return (
            <div className="station-info card shadow">
                <div className="card-body text-center text-muted">
                    <BsInfoCircle size={32} className="mb-2" />
                    <p>Chọn một trạm trên bản đồ để xem chi tiết</p>
                </div>
            </div>
        );
    }

    const getPropertyValue = (obj, key) => {
        return obj[key]?.value || obj[key] || 'N/A';
    };

    const platformAddress = platform['https://smartdatamodels.org/address']?.value;
    const addressText = platformAddress
        ? `${platformAddress.addressLocality}, ${platformAddress.addressRegion}, ${platformAddress.addressCountry}`
        : 'N/A';

    // Show sensor sections based on available data
    const hasWeatherData = !!weatherData;
    const hasAirQualityData = !!airQualityData;

    return (
        <div className="station-info card shadow">
            {/* Header with Address */}
            <div className="card-header">
                <div className="d-flex align-items-start gap-2">
                    <BsGeoAlt className="text-primary mt-1" />
                    <div className="flex-grow-1">
                        <div className="fw-semibold">{addressText}</div>
                        <div className="small text-muted">{getPropertyValue(platform, 'https://smartdatamodels.org/name')}</div>
                    </div>
                </div>
            </div>

            <div className="card-body p-0">
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
                                    <span>{getPropertyValue(weatherData, 'dataProvider')}</span>
                                </div>
                                <div className="info-item">
                                    <label>Cập nhật lần cuối:</label>
                                    <span className="small">
                                        {weatherData.dateObserved?.value?.['@value']
                                            ? new Date(weatherData.dateObserved.value['@value']).toLocaleString('vi-VN')
                                            : 'N/A'}
                                    </span>
                                </div>

                                <div className="measurements mt-3">
                                    <h6 className="small fw-semibold mb-2">Đo đạc:</h6>
                                    <div className="measurement-grid">
                                        {weatherData.temperature && (
                                            <div className="measurement-item">
                                                <span className="label">Nhiệt độ</span>
                                                <span className="value">{weatherData.temperature.value}°C</span>
                                            </div>
                                        )}
                                        {weatherData.feelsLikeTemperature && (
                                            <div className="measurement-item">
                                                <span className="label">Cảm giác như</span>
                                                <span className="value">{weatherData.feelsLikeTemperature.value}°C</span>
                                            </div>
                                        )}
                                        {weatherData.relativeHumidity && (
                                            <div className="measurement-item">
                                                <span className="label">Độ ẩm</span>
                                                <span className="value">{(weatherData.relativeHumidity.value * 100).toFixed(0)}%</span>
                                            </div>
                                        )}
                                        {weatherData.atmosphericPressure && (
                                            <div className="measurement-item">
                                                <span className="label">Áp suất</span>
                                                <span className="value">{weatherData.atmosphericPressure.value} hPa</span>
                                            </div>
                                        )}
                                        {weatherData.windSpeed && (
                                            <div className="measurement-item">
                                                <span className="label">Tốc độ gió</span>
                                                <span className="value">{weatherData.windSpeed.value} m/s</span>
                                            </div>
                                        )}
                                        {weatherData.windDirection && (
                                            <div className="measurement-item">
                                                <span className="label">Hướng gió</span>
                                                <span className="value">{weatherData.windDirection.value}°</span>
                                            </div>
                                        )}
                                        {weatherData.precipitation && (
                                            <div className="measurement-item">
                                                <span className="label">Lượng mưa</span>
                                                <span className="value">{weatherData.precipitation.value} mm</span>
                                            </div>
                                        )}
                                        {weatherData.visibility && (
                                            <div className="measurement-item">
                                                <span className="label">Tầm nhìn</span>
                                                <span className="value">{weatherData.visibility.value} m</span>
                                            </div>
                                        )}
                                        {weatherData.cloudiness && (
                                            <div className="measurement-item">
                                                <span className="label">Mây che phủ</span>
                                                <span className="value">{(weatherData.cloudiness.value * 100).toFixed(0)}%</span>
                                            </div>
                                        )}
                                        {weatherData.illuminance && (
                                            <div className="measurement-item">
                                                <span className="label">Độ sáng</span>
                                                <span className="value">{weatherData.illuminance.value} lux</span>
                                            </div>
                                        )}
                                        {weatherData.weatherType && (
                                            <div className="measurement-item">
                                                <span className="label">Loại thời tiết</span>
                                                <span className="value">{weatherData.weatherType.value}</span>
                                            </div>
                                        )}
                                        {weatherData.pressureTendency && (
                                            <div className="measurement-item">
                                                <span className="label">Xu hướng áp suất</span>
                                                <span className="value">{weatherData.pressureTendency.value}</span>
                                            </div>
                                        )}
                                        {weatherData.weatherDescription && (
                                            <div className="measurement-item full-width">
                                                <span className="label">Mô tả</span>
                                                <span className="value">{weatherData.weatherDescription.value}</span>
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
                                    <span>{getPropertyValue(airQualityData, 'dataProvider')}</span>
                                </div>
                                <div className="info-item">
                                    <label>Cập nhật lần cuối:</label>
                                    <span className="small">
                                        {airQualityData.dateObserved?.value
                                            ? new Date(airQualityData.dateObserved.value).toLocaleString('vi-VN')
                                            : 'N/A'}
                                    </span>
                                </div>

                                {/* AQI Badge */}
                                {airQualityData.airQualityIndex && (
                                    <div className="aqi-badge mt-2">
                                        <span className="badge bg-info">
                                            AQI: {airQualityData.airQualityIndex.value} - {
                                                airQualityData.airQualityLevel?.value === 'good' ? 'Tốt' :
                                                    airQualityData.airQualityLevel?.value === 'fair' ? 'Trung bình' :
                                                        airQualityData.airQualityLevel?.value === 'moderate' ? 'Khá' :
                                                            airQualityData.airQualityLevel?.value === 'poor' ? 'Kém' :
                                                                airQualityData.airQualityLevel?.value === 'very poor' ? 'Rất kém' :
                                                                    airQualityData.airQualityLevel?.value || 'N/A'
                                            }
                                        </span>
                                    </div>
                                )}

                                {/* Reliability */}
                                {airQualityData.reliability && (
                                    <div className="info-item mt-2">
                                        <label>Độ tin cậy:</label>
                                        <span>{(airQualityData.reliability.value * 100).toFixed(0)}%</span>
                                    </div>
                                )}

                                <div className="measurements mt-3">
                                    <h6 className="small fw-semibold mb-2">Chất gây ô nhiễm:</h6>
                                    <div className="measurement-grid">
                                        {airQualityData.CO && (
                                            <div className="measurement-item">
                                                <span className="label">CO</span>
                                                <span className="value">{airQualityData.CO.value.toFixed(2)} μg/m³</span>
                                            </div>
                                        )}
                                        {airQualityData.CO_Level && (
                                            <div className="measurement-item">
                                                <span className="label">Mức CO</span>
                                                <span className="value">{
                                                    airQualityData.CO_Level.value === 'good' ? 'Tốt' :
                                                        airQualityData.CO_Level.value === 'fair' ? 'Trung bình' :
                                                            airQualityData.CO_Level.value === 'moderate' ? 'Khá' :
                                                                airQualityData.CO_Level.value === 'poor' ? 'Kém' :
                                                                    airQualityData.CO_Level.value
                                                }</span>
                                            </div>
                                        )}
                                        {airQualityData.NO && (
                                            <div className="measurement-item">
                                                <span className="label">NO</span>
                                                <span className="value">{airQualityData.NO.value.toFixed(2)} μg/m³</span>
                                            </div>
                                        )}
                                        {airQualityData.NO2 && (
                                            <div className="measurement-item">
                                                <span className="label">NO₂</span>
                                                <span className="value">{airQualityData.NO2.value.toFixed(2)} μg/m³</span>
                                            </div>
                                        )}
                                        {airQualityData.NOx && (
                                            <div className="measurement-item">
                                                <span className="label">NOₓ</span>
                                                <span className="value">{airQualityData.NOx.value.toFixed(2)} μg/m³</span>
                                            </div>
                                        )}
                                        {airQualityData.O3 && (
                                            <div className="measurement-item">
                                                <span className="label">O₃</span>
                                                <span className="value">{airQualityData.O3.value.toFixed(2)} μg/m³</span>
                                            </div>
                                        )}
                                        {airQualityData.SO2 && (
                                            <div className="measurement-item">
                                                <span className="label">SO₂</span>
                                                <span className="value">{airQualityData.SO2.value.toFixed(2)} μg/m³</span>
                                            </div>
                                        )}
                                        {airQualityData.pm2_5 && (
                                            <div className="measurement-item">
                                                <span className="label">PM2.5</span>
                                                <span className="value">{airQualityData.pm2_5.value.toFixed(2)} μg/m³</span>
                                            </div>
                                        )}
                                        {airQualityData.pm10 && (
                                            <div className="measurement-item">
                                                <span className="label">PM10</span>
                                                <span className="value">{airQualityData.pm10.value.toFixed(2)} μg/m³</span>
                                            </div>
                                        )}
                                        {airQualityData.NH3 && (
                                            <div className="measurement-item">
                                                <span className="label">NH₃</span>
                                                <span className="value">{airQualityData.NH3.value.toFixed(2)} μg/m³</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* View Details Button */}
            <div className="card-footer bg-white border-top">
                <button className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2">
                    <span>Xem chi tiết</span>
                    <BsArrowRight />
                </button>
            </div>
        </div>
    );
};

export default StationInfo;
