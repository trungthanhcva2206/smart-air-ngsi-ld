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

import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './StationMap.scss';
import { BsSearch } from 'react-icons/bs';
import StationInfo from '../StationInfo/StationInfo';
import { stations, weatherObservations, airQualityObservations } from '../../../mockdata';

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

    // Get observations for selected station
    const getStationObservations = (station) => {
        if (!station) return { weather: null, airQuality: null };

        // Find weather and air quality devices
        const weatherDevice = station.devices?.find(d =>
            d.id === 'urn:ngsi-ld:Device:WeatherSensor-BaDinh'
        );
        const airQualityDevice = station.devices?.find(d =>
            d.id === 'urn:ngsi-ld:Device:AirQualitySensor-BaDinh'
        );

        // Get observations for each device
        const weather = weatherDevice ? weatherObservations.find(
            obs => obs.refDevice?.object === weatherDevice.id
        ) : null;

        const airQuality = airQualityDevice ? airQualityObservations.find(
            obs => obs.refDevice?.object === airQualityDevice.id
        ) : null;

        return { weather, airQuality };
    };

    const observations = getStationObservations(selectedStation);

    return (
        <div className="map-page flex-fill position-relative">
            {/* Search bar - top left */}
            <div className="position-absolute top-0 start-0 p-3" style={{ zIndex: 1000 }}>
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
                    devices={selectedStation?.devices}
                    weatherData={observations.weather}
                    airQualityData={observations.airQuality}
                />
            </div>

            {/* Map */}
            <MapContainer
                className="leaflet-map"
                center={[21.0278, 105.8342]}
                zoom={12}
                zoomControl={false}
                scrollWheelZoom
                maxBounds={[
                    [20.9, 105.65],  // Southwest coordinates (bottom-left)
                    [21.15, 105.95]  // Northeast coordinates (top-right)
                ]}
                maxBoundsViscosity={1.0}
                minZoom={11}
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