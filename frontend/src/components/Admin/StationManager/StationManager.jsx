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
    BsSearch,
    BsPlusLg,
    BsFilter,
    BsThreeDotsVertical,
    BsPencilSquare,
    BsTrash,
    BsGeoAlt,
    BsXLg,
    BsThermometerHalf,
    BsWind,
    BsDroplet,
    BsSpeedometer
} from 'react-icons/bs';
import { usePlatformsSSE } from '../../../hooks/usePlatformSSE';
import { getDevicesByPlatform } from '../../../services/deviceService';
import './StationManager.scss';

const StationManager = () => {
    const { platforms, loading } = usePlatformsSSE();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const [showModal, setShowModal] = useState(false);
    const [selectedStation, setSelectedStation] = useState(null);
    const [stationDevices, setStationDevices] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const itemsPerPage = 10;

    const filteredPlatforms = platforms.filter(station => {
        const matchesSearch = station.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            station.entityId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || station.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredPlatforms.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredPlatforms.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleViewDetail = async (station) => {
        setSelectedStation(station);
        setShowModal(true);
        setLoadingDetails(true);
        setStationDevices([]);

        const res = await getDevicesByPlatform(station.entityId);
        if (res && res.EC === 0) {
            setStationDevices(res.DT);
        }
        setLoadingDetails(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedStation(null);
    };

    const handleToggleDevice = (deviceId) => {
        setStationDevices(prev => prev.map(dev => {
            if (dev.id === deviceId || dev._id === deviceId) {
                return { ...dev, deviceState: dev.deviceState === 'active' ? 'inactive' : 'active' };
            }
            return dev;
        }));
    };

    const getAttributeValue = (station, key) => {
        if (!station || !station[key]) return '--';
        return typeof station[key] === 'object' ? station[key].value : station[key];
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center h-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="station-manager container-fluid position-relative">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Quản lý Trạm Quan Trắc</h2>
                    <p className="text-muted mb-0">Quản lý danh sách và trạng thái các trạm đo trong hệ thống</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm">
                    <BsPlusLg />
                    <span>Thêm trạm mới</span>
                </button>
            </div>

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-3">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <BsSearch className="text-muted" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control bg-light border-start-0"
                                    placeholder="Tìm kiếm theo tên hoặc ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <BsFilter className="text-muted" />
                                </span>
                                <select
                                    className="form-select bg-light border-start-0"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">Tất cả trạng thái</option>
                                    <option value="operational">Đang hoạt động</option>
                                    <option value="maintenance">Bảo trì</option>
                                    <option value="offline">Mất kết nối</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th scope="col" className="ps-4 py-3 text-muted fw-bold text-uppercase small">Tên trạm / ID</th>
                                <th scope="col" className="py-3 text-muted fw-bold text-uppercase small">Vị trí</th>
                                <th scope="col" className="py-3 text-muted fw-bold text-uppercase small">Tọa độ</th>
                                <th scope="col" className="py-3 text-muted fw-bold text-uppercase small">Trạng thái</th>
                                <th scope="col" className="py-3 text-muted fw-bold text-uppercase small text-end pe-4">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((station) => (
                                    <tr key={station.entityId}>
                                        <td className="ps-4">
                                            <div className="fw-bold text-dark">{station.name}</div>
                                            <div className="text-muted small font-monospace">{station.entityId}</div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center text-dark">
                                                <BsGeoAlt className="me-2 text-secondary" />
                                                {station.address?.addressLocality || 'Chưa cập nhật'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark border fw-normal font-monospace">
                                                {station.location?.lat.toFixed(4)}, {station.location?.lon.toFixed(4)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill px-3 py-2 ${station.status === 'operational'
                                                ? 'bg-success bg-opacity-10 text-success'
                                                : 'bg-secondary bg-opacity-10 text-secondary'
                                                }`}>
                                                <span className={`d-inline-block rounded-circle me-1 ${station.status === 'operational' ? 'bg-success' : 'bg-secondary'
                                                    }`} style={{ width: '6px', height: '6px' }}></span>
                                                {station.status === 'operational' ? 'Hoạt động' : station.status || 'Không rõ'}
                                            </span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="btn-group">
                                                <button
                                                    className="btn btn-sm btn-light text-primary me-1"
                                                    title="Chi tiết"
                                                    onClick={() => handleViewDetail(station)}
                                                >
                                                    Xem chi tiết
                                                </button>
                                                <button className="btn btn-sm btn-light text-secondary" data-bs-toggle="dropdown">
                                                    <BsThreeDotsVertical />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        Không tìm thấy trạm nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredPlatforms.length > 0 && (
                    <div className="card-footer bg-white border-top-0 py-3 d-flex justify-content-between align-items-center">
                        <div className="text-muted small">
                            Hiển thị <strong>{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredPlatforms.length)}</strong> trong tổng số <strong>{filteredPlatforms.length}</strong> trạm
                        </div>
                        <nav>
                            <ul className="pagination pagination-sm mb-0">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link border-0" onClick={() => handlePageChange(currentPage - 1)}>Trước</button>
                                </li>
                                {[...Array(totalPages)].map((_, i) => (
                                    <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                        <button className="page-link border-0 rounded-circle mx-1" onClick={() => handlePageChange(i + 1)}>
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link border-0" onClick={() => handlePageChange(currentPage + 1)}>Sau</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

            {showModal && selectedStation && (
                <div className="modal-backdrop-custom">
                    <div className="modal-content-custom bg-white rounded-3 shadow-lg">
                        <div className="modal-header p-4 border-bottom d-flex justify-content-between align-items-center">
                            <div>
                                <h4 className="fw-bold mb-1">{selectedStation.name}</h4>
                                <span className="text-muted small font-monospace">{selectedStation.entityId}</span>
                            </div>
                            <button className="btn btn-link text-dark p-0" onClick={handleCloseModal}>
                                <BsXLg size={20} />
                            </button>
                        </div>

                        <div className="modal-body p-4 overflow-auto" style={{ maxHeight: '75vh' }}>
                            <h6 className="fw-bold text-uppercase text-muted mb-3 small">Chỉ số hiện tại</h6>
                            <div className="row g-3 mb-4">
                                <div className="col-6 col-md-3">
                                    <div className="metric-card p-3 rounded-3 bg-light border">
                                        <div className="d-flex align-items-center mb-2">
                                            <BsWind className="text-primary me-2" />
                                            <span className="small text-muted">PM2.5</span>
                                        </div>
                                        <h4 className="fw-bold mb-0 text-dark">
                                            {getAttributeValue(selectedStation, 'pm25') !== '--'
                                                ? parseFloat(getAttributeValue(selectedStation, 'pm25')).toFixed(1)
                                                : '--'}
                                        </h4>
                                        <small className="text-muted" style={{ fontSize: '10px' }}>µg/m³</small>
                                    </div>
                                </div>
                                <div className="col-6 col-md-3">
                                    <div className="metric-card p-3 rounded-3 bg-light border">
                                        <div className="d-flex align-items-center mb-2">
                                            <BsThermometerHalf className="text-danger me-2" />
                                            <span className="small text-muted">Nhiệt độ</span>
                                        </div>
                                        <h4 className="fw-bold mb-0 text-dark">
                                            {getAttributeValue(selectedStation, 'temperature')}
                                        </h4>
                                        <small className="text-muted" style={{ fontSize: '10px' }}>°C</small>
                                    </div>
                                </div>
                                <div className="col-6 col-md-3">
                                    <div className="metric-card p-3 rounded-3 bg-light border">
                                        <div className="d-flex align-items-center mb-2">
                                            <BsDroplet className="text-info me-2" />
                                            <span className="small text-muted">Độ ẩm</span>
                                        </div>
                                        <h4 className="fw-bold mb-0 text-dark">
                                            {getAttributeValue(selectedStation, 'humidity')}
                                        </h4>
                                        <small className="text-muted" style={{ fontSize: '10px' }}>%</small>
                                    </div>
                                </div>
                                <div className="col-6 col-md-3">
                                    <div className="metric-card p-3 rounded-3 bg-light border">
                                        <div className="d-flex align-items-center mb-2">
                                            <BsSpeedometer className="text-warning me-2" />
                                            <span className="small text-muted">AQI</span>
                                        </div>
                                        <h4 className="fw-bold mb-0 text-dark">
                                            {getAttributeValue(selectedStation, 'aqi')}
                                        </h4>
                                        <small className="text-muted" style={{ fontSize: '10px' }}>Index</small>
                                    </div>
                                </div>
                            </div>

                            <h6 className="fw-bold text-uppercase text-muted mb-3 small d-flex justify-content-between align-items-center">
                                <span>Danh sách thiết bị ({stationDevices.length})</span>
                                {loadingDetails && <span className="spinner-border spinner-border-sm text-primary"></span>}
                            </h6>

                            <div className="table-responsive border rounded-3">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="small text-muted fw-bold ps-3">Tên thiết bị</th>
                                            <th className="small text-muted fw-bold">Loại</th>
                                            <th className="small text-muted fw-bold">Trạng thái</th>
                                            <th className="small text-muted fw-bold text-end pe-3">Bật/Tắt</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stationDevices.length > 0 ? (
                                            stationDevices.map(device => (
                                                <tr key={device.id || device._id}>
                                                    <td className="ps-3">
                                                        <div className="fw-bold small">{device.name}</div>
                                                        <div className="text-muted" style={{ fontSize: '10px' }}>{device.serialNumber}</div>
                                                    </td>
                                                    <td>
                                                        <span className="badge border fw-normal text-secondary bg-light">
                                                            {device.sensorType}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge rounded-pill ${device.deviceState === 'active'
                                                            ? 'bg-success bg-opacity-10 text-success'
                                                            : 'bg-secondary bg-opacity-10 text-secondary'
                                                            }`}>
                                                            {device.deviceState === 'active' ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="text-end pe-3">
                                                        <div className="form-check form-switch d-flex justify-content-end">
                                                            <input
                                                                className="form-check-input cursor-pointer"
                                                                type="checkbox"
                                                                checked={device.deviceState === 'active'}
                                                                onChange={() => handleToggleDevice(device.id || device._id)}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-4 small text-muted">
                                                    {loadingDetails ? 'Đang tải thiết bị...' : 'Không có thiết bị nào.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="modal-footer p-3 border-top bg-light rounded-bottom-3 d-flex justify-content-end">
                            <button className="btn btn-secondary btn-sm" onClick={handleCloseModal}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StationManager;