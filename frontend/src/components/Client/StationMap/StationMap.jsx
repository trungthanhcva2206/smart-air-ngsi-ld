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

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './StationMap.scss';
import { BsSearch } from 'react-icons/bs';
import StationInfo from '../StationInfo/StationInfo';
import { usePlatformsSSE } from '../../../hooks/usePlatformSSE';
import { useDistrictSSE } from '../../../hooks/useDistrictSSE';


// Component to handle map fly to selected station
const MapController = ({ selectedStation }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedStation) {
            map.flyTo([selectedStation.lat, selectedStation.lng], 15, {
                duration: 1.5
            });
        }
    }, [selectedStation, map]);

    return null;
};

const StationMap = () => {
    const [selectedStation, setSelectedStation] = useState(null);

    // Stream all platforms via SSE
    const { platforms, loading: platformsLoading, error: platformsError } = usePlatformsSSE();

    // Get district name from selected station
    const selectedDistrict = selectedStation?.platform?.address?.addressLocality
        ? selectedStation.platform.address.addressLocality.replace(/\s+/g, '')
        : null;

    // Stream weather + air quality for selected district
    const {
        weatherData,
        airQualityData,
        loading: districtLoading,
        error: districtError
    } = useDistrictSSE(selectedDistrict);

    // Transform platforms to stations format for map markers
    const stations = platforms.map(platform => ({
        id: platform.entityId,
        lat: platform.location.lat,
        lng: platform.location.lon,
        platform: platform,
    }));
    const [uiLoading, setUiLoading] = useState(true);

    useEffect(() => {
        if (!districtLoading) {
            const timer = setTimeout(() => setUiLoading(false), 1000);
            return () => clearTimeout(timer);
        } else {
            setUiLoading(true);
        }
    }, [districtLoading]);

    // Show loading state
    if (platformsLoading) {
        return (
            <div className="map-page flex-fill d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="text-muted">Đang tải dữ liệu trạm quan trắc...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (platformsError) {
        return (
            <div className="map-page flex-fill d-flex align-items-center justify-content-center">
                <div className="alert alert-danger" role="alert">
                    <h5 className="alert-heading">Lỗi kết nối</h5>
                    <p>{platformsError}</p>
                    <hr />
                    <p className="mb-0">Vui lòng kiểm tra kết nối server và thử lại.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="map-page flex-fill position-relative">
            {/* Search bar - top left */}
            <div className="position-absolute top-0 start-0 p-3 search-bar-container" style={{ zIndex: 1000 }}>
                <div className="input-group shadow-sm">
                    <span className="input-group-text bg-white border-end-0"><BsSearch /></span>
                    <input className="form-control border-start-0" placeholder="Tìm kiếm trạm..." />
                </div>
            </div>

            {/* Station Info Panel - right */}
            <div
                className="position-absolute top-0 end-0"
                style={{ zIndex: 1000 }}
            >
                <StationInfo
                    platform={selectedStation?.platform}
                    weatherData={weatherData}
                    airQualityData={airQualityData}
                    loading={uiLoading}
                    error={districtError}
                    onClose={() => setSelectedStation(null)}
                />
            </div>

            {/* Map */}
            <MapContainer
                className="leaflet-map"
                center={[21.0278, 105.8342]}
                zoom={12}
                zoomControl={false}
                scrollWheelZoom
                maxBoundsViscosity={1.0}
                minZoom={10}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ZoomControl position="bottomleft" />
                <MapController selectedStation={selectedStation} />

                {stations.map((station) => {
                    const isSelected = selectedStation?.id === station.id;

                    return (
                        <CircleMarker
                            key={station.id}
                            center={[station.lat, station.lng]}
                            radius={16}
                            pathOptions={{
                                color: isSelected ? '#85dbd9' : '#ffffff',
                                fillColor: '#6a5cd8',
                                fillOpacity: 0.9,
                                weight: 3,
                            }}
                            eventHandlers={{
                                click: () => setSelectedStation(station)
                            }}
                        >
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default StationMap;