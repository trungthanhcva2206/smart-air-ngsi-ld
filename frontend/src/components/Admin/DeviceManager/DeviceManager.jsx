import React, { useState } from 'react';
import {
    BsSearch,
    BsPlusLg,
    BsFilter,
    BsThreeDotsVertical,
    BsPencilSquare,
    BsTrash,
    BsCpu,
    BsHddNetwork
} from 'react-icons/bs';
import './DeviceManager.scss';

const DeviceManager = () => {
    // --- MOCK DATA ---
    const mockDevices = [
        { id: 'urn:ngsi-ld:Device:001', name: 'Air Sensor HBT', type: 'AirQualityMonitor', station: 'Trạm Hai Bà Trưng', status: 'active', lastUpdate: '2023-10-25 08:30:00' },
        { id: 'urn:ngsi-ld:Device:002', name: 'Weather Station HBT', type: 'WeatherStation', station: 'Trạm Hai Bà Trưng', status: 'active', lastUpdate: '2023-10-25 08:30:00' },
        { id: 'urn:ngsi-ld:Device:003', name: 'Air Sensor CG', type: 'AirQualityMonitor', station: 'Trạm Cầu Giấy', status: 'maintenance', lastUpdate: '2023-10-24 10:15:00' },
        { id: 'urn:ngsi-ld:Device:004', name: 'Camera Traffic 01', type: 'Camera', station: 'Trạm Ngã Tư Sở', status: 'active', lastUpdate: '2023-10-25 08:29:45' },
        { id: 'urn:ngsi-ld:Device:005', name: 'Noise Sensor HK', type: 'NoiseMonitor', station: 'Trạm Hoàn Kiếm', status: 'offline', lastUpdate: '2023-10-20 14:00:00' },
        { id: 'urn:ngsi-ld:Device:006', name: 'Air Sensor LB', type: 'AirQualityMonitor', station: 'Trạm Long Biên', status: 'active', lastUpdate: '2023-10-25 08:31:00' },
        { id: 'urn:ngsi-ld:Device:007', name: 'Weather Station LB', type: 'WeatherStation', station: 'Trạm Long Biên', status: 'active', lastUpdate: '2023-10-25 08:31:00' },
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Filter Logic
    const filteredDevices = mockDevices.filter(device => {
        const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            device.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
        const matchesType = typeFilter === 'all' || device.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredDevices.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => setCurrentPage(page);

    // Helper: Badge color for device type
    const getTypeBadgeColor = (type) => {
        switch (type) {
            case 'AirQualityMonitor': return 'text-info bg-info bg-opacity-10';
            case 'WeatherStation': return 'text-warning bg-warning bg-opacity-10';
            case 'Camera': return 'text-primary bg-primary bg-opacity-10';
            default: return 'text-secondary bg-secondary bg-opacity-10';
        }
    };

    return (
        <div className="device-manager container-fluid">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Quản lý Thiết bị IoT</h2>
                    <p className="text-muted mb-0">Giám sát trạng thái các cảm biến và thiết bị ngoại vi</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm">
                    <BsPlusLg />
                    <span>Thêm thiết bị</span>
                </button>
            </div>

            {/* Filter Card */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body p-3">
                    <div className="row g-3">
                        {/* Search */}
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <BsSearch className="text-muted" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control bg-light border-start-0"
                                    placeholder="Tìm tên thiết bị hoặc ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        {/* Status Filter */}
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
                                    <option value="active">Đang hoạt động</option>
                                    <option value="maintenance">Bảo trì</option>
                                    <option value="offline">Mất kết nối</option>
                                </select>
                            </div>
                        </div>
                        {/* Type Filter */}
                        <div className="col-md-3">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <BsCpu className="text-muted" />
                                </span>
                                <select
                                    className="form-select bg-light border-start-0"
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                >
                                    <option value="all">Tất cả loại thiết bị</option>
                                    <option value="AirQualityMonitor">Cảm biến không khí</option>
                                    <option value="WeatherStation">Trạm thời tiết</option>
                                    <option value="Camera">Camera giám sát</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th scope="col" className="ps-4 py-3 text-muted fw-bold text-uppercase small">Tên thiết bị / ID</th>
                                <th scope="col" className="py-3 text-muted fw-bold text-uppercase small">Loại thiết bị</th>
                                <th scope="col" className="py-3 text-muted fw-bold text-uppercase small">Thuộc trạm</th>
                                <th scope="col" className="py-3 text-muted fw-bold text-uppercase small">Trạng thái</th>
                                <th scope="col" className="py-3 text-muted fw-bold text-uppercase small">Lần cuối nhận tin</th>
                                <th scope="col" className="py-3 text-muted fw-bold text-uppercase small text-end pe-4">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((device) => (
                                    <tr key={device.id}>
                                        <td className="ps-4">
                                            <div className="fw-bold text-dark">{device.name}</div>
                                            <div className="text-muted small font-monospace">{device.id}</div>
                                        </td>
                                        <td>
                                            <span className={`badge border fw-normal ${getTypeBadgeColor(device.type)}`}>
                                                {device.type}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center text-dark">
                                                <BsHddNetwork className="me-2 text-secondary" /> {/* Sử dụng icon đúng */}
                                                {device.station}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill px-3 py-2 ${device.status === 'active'
                                                ? 'bg-success bg-opacity-10 text-success'
                                                : device.status === 'maintenance' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-secondary bg-opacity-10 text-secondary'
                                                }`}>
                                                <span className={`d-inline-block rounded-circle me-1 ${device.status === 'active' ? 'bg-success' : device.status === 'maintenance' ? 'bg-warning' : 'bg-secondary'
                                                    }`} style={{ width: '6px', height: '6px' }}></span>
                                                {device.status === 'active' ? 'Hoạt động' : device.status === 'maintenance' ? 'Bảo trì' : 'Offline'}
                                            </span>
                                        </td>
                                        <td className="text-secondary small">
                                            {device.lastUpdate}
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="btn-group">
                                                <button className="btn btn-sm btn-light text-primary me-1" title="Chỉnh sửa">
                                                    <BsPencilSquare />
                                                </button>
                                                <button className="btn btn-sm btn-light text-danger me-1" title="Xóa">
                                                    <BsTrash />
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
                                    <td colSpan="6" className="text-center py-5 text-muted">
                                        Không tìm thấy thiết bị nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredDevices.length > 0 && (
                    <div className="card-footer bg-white border-top-0 py-3 d-flex justify-content-between align-items-center">
                        <div className="text-muted small">
                            Hiển thị <strong>{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredDevices.length)}</strong> trong tổng số <strong>{filteredDevices.length}</strong> thiết bị
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
        </div>
    );
};

export default DeviceManager;