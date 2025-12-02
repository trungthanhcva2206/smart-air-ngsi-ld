/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @Project AirTrack
 * @Authors 
 * - TT (trungthanhcva2206@gmail.com)
 * - Tankchoi (tadzltv22082004@gmail.com)
 * - Panh (panh812004.apn@gmail.com)
 * @Copyright (C) 2025 CHK. All rights reserved
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
    BsPersonCircle,
    BsShieldLock,
    BsEnvelope
} from 'react-icons/bs';
import './AccountManager.scss';

const AccountManager = () => {
    // --- MOCK DATA ---
    const mockAccounts = [
        { id: 1, name: 'Nguyễn Văn Admin', email: 'admin@airtrack.com', role: 'admin', status: 'active', lastLogin: '2023-10-26 09:15:00', avatar: null },
        { id: 2, name: 'Trần Thị User', email: 'user01@gmail.com', role: 'user', status: 'active', lastLogin: '2023-10-25 14:30:00', avatar: null },
        { id: 3, name: 'Lê Văn Manager', email: 'manager_hbt@airtrack.com', role: 'manager', status: 'active', lastLogin: '2023-10-26 08:00:00', avatar: null },
        { id: 4, name: 'Phạm Văn Locked', email: 'spam_user@yahoo.com', role: 'user', status: 'locked', lastLogin: '2023-09-10 10:20:00', avatar: null },
        { id: 5, name: 'Hoàng Thị Mới', email: 'newbie@outlook.com', role: 'user', status: 'inactive', lastLogin: 'Chưa đăng nhập', avatar: null },
        { id: 6, name: 'System Bot', email: 'bot@system.local', role: 'admin', status: 'active', lastLogin: '2023-10-26 10:00:00', avatar: null },
        { id: 7, name: 'Khách vãng lai', email: 'guest123@temp.mail', role: 'user', status: 'active', lastLogin: '2023-10-24 18:45:00', avatar: null },
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Filter Logic
    const filteredAccounts = mockAccounts.filter(acc => {
        const matchesSearch = acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            acc.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || acc.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || acc.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredAccounts.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => setCurrentPage(page);

    // Helper: Role Badge Color
    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-danger bg-opacity-10 text-danger border-danger border-opacity-25';
            case 'manager': return 'bg-primary bg-opacity-10 text-primary border-primary border-opacity-25';
            default: return 'bg-secondary bg-opacity-10 text-secondary border-secondary border-opacity-25';
        }
    };

    return (
        <div className="account-manager container-fluid">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Quản lý Tài khoản</h2>
                    <p className="text-muted mb-0">Phân quyền và quản lý người dùng hệ thống</p>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm">
                    <BsPlusLg />
                    <span>Thêm tài khoản</span>
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
                                    placeholder="Tìm theo tên hoặc email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        {/* Role Filter */}
                        <div className="col-md-3">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <BsShieldLock className="text-muted" />
                                </span>
                                <select
                                    className="form-select bg-light border-start-0"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="all">Tất cả vai trò</option>
                                    <option value="admin">Quản trị viên (Admin)</option>
                                    <option value="manager">Quản lý (Manager)</option>
                                    <option value="user">Người dùng (User)</option>
                                </select>
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
                                    <option value="inactive">Chưa kích hoạt</option>
                                    <option value="locked">Đã khóa</option>
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
                                <th scope="col" className="ps-4 py-3 text-muted fw-bold text-uppercase small">Người dùng</th>
                                <th scope="col" className="py-3 text-muted fw-bold text-uppercase small">Vai trò</th>
                                <th scope="col" className="py-3 text-muted fw-bold text-uppercase small">Trạng thái</th>
                                <th scope="col" className="py-3 text-muted fw-bold text-uppercase small">Đăng nhập lần cuối</th>
                                <th scope="col" className="py-3 text-muted fw-bold text-uppercase small text-end pe-4">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((acc) => (
                                    <tr key={acc.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center">
                                                <div className="avatar-placeholder me-3 rounded-circle bg-light d-flex align-items-center justify-content-center text-secondary">
                                                    <BsPersonCircle size={24} />
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{acc.name}</div>
                                                    <div className="text-muted small d-flex align-items-center">
                                                        <BsEnvelope className="me-1" size={12} /> {acc.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge border fw-normal text-uppercase ${getRoleBadgeColor(acc.role)}`}>
                                                {acc.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill px-3 py-2 ${acc.status === 'active'
                                                ? 'bg-success bg-opacity-10 text-success'
                                                : acc.status === 'locked' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-warning bg-opacity-10 text-warning'
                                                }`}>
                                                <span className={`d-inline-block rounded-circle me-1 ${acc.status === 'active' ? 'bg-success' : acc.status === 'locked' ? 'bg-danger' : 'bg-warning'
                                                    }`} style={{ width: '6px', height: '6px' }}></span>
                                                {acc.status === 'active' ? 'Active' : acc.status === 'locked' ? 'Locked' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="text-secondary small">
                                            {acc.lastLogin}
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="btn-group">
                                                <button className="btn btn-sm btn-light text-primary me-1" title="Chỉnh sửa">
                                                    <BsPencilSquare />
                                                </button>
                                                {acc.status !== 'locked' ? (
                                                    <button className="btn btn-sm btn-light text-warning me-1" title="Khóa tài khoản">
                                                        <BsShieldLock />
                                                    </button>
                                                ) : (
                                                    <button className="btn btn-sm btn-light text-success me-1" title="Mở khóa">
                                                        <BsShieldLock />
                                                    </button>
                                                )}
                                                <button className="btn btn-sm btn-light text-danger me-1" title="Xóa">
                                                    <BsTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        Không tìm thấy tài khoản nào phù hợp.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredAccounts.length > 0 && (
                    <div className="card-footer bg-white border-top-0 py-3 d-flex justify-content-between align-items-center">
                        <div className="text-muted small">
                            Hiển thị <strong>{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAccounts.length)}</strong> trong tổng số <strong>{filteredAccounts.length}</strong> tài khoản
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

export default AccountManager;