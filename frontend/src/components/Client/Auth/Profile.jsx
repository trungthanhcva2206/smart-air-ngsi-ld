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
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfileAction, logout } from '../../../store/slices/authSlice';
import { getPlatforms } from '../../../services/platformService';
import { BsPersonCircle, BsPencil, BsCheck, BsX, BsShieldLock } from 'react-icons/bs';
import { toast } from 'react-toastify';
import './Profile.scss';

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, resident, loading } = useSelector((state) => state.auth);

    // Local state for form fields
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        notificationEnabled: true,
        districts: []
    });

    const [originalData, setOriginalData] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [editingField, setEditingField] = useState(null); // 'fullName' or 'email'
    const [tempValue, setTempValue] = useState('');
    const [districtSearch, setDistrictSearch] = useState('');
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [platformsLoading, setPlatformsLoading] = useState(true);

    // Load initial data
    useEffect(() => {
        if (user && resident) {
            const initialData = {
                fullName: user.fullName || '',
                email: user.email || '',
                notificationEnabled: resident.notificationEnabled ?? true,
                districts: resident.districts || []
            };
            setFormData(initialData);
            setOriginalData(initialData);
        }
    }, [user, resident]);

    // Fetch platforms and extract districts
    useEffect(() => {
        const fetchPlatforms = async () => {
            try {
                setPlatformsLoading(true);
                const response = await getPlatforms();

                if (response.EC === 0 && response.DT) {
                    // Extract unique districts from platforms
                    const uniqueDistricts = [];
                    const seen = new Set();

                    response.DT.forEach(platform => {
                        const districtSlug = platform.address?.addressLocality?.replace(/\s+/g, '');
                        const displayName = platform.address?.addressLocality;
                        if (districtSlug && !seen.has(districtSlug)) {
                            seen.add(districtSlug);
                            uniqueDistricts.push({
                                slug: districtSlug,
                                name: displayName || districtSlug
                            });
                        }
                    });

                    uniqueDistricts.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
                    setAvailableDistricts(uniqueDistricts);
                } else {
                    toast.error('Không thể tải danh sách quận/phường');
                }
            } catch (error) {
                console.error('Error fetching platforms:', error);
                toast.error('Có lỗi khi tải danh sách quận/phường');
            } finally {
                setPlatformsLoading(false);
            }
        };

        fetchPlatforms();
    }, []);

    // Check for changes
    useEffect(() => {
        const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
        setHasChanges(changed);
    }, [formData, originalData]);

    // Inline edit handlers
    const startEdit = (field) => {
        setEditingField(field);
        setTempValue(formData[field]);
    };

    const cancelEdit = () => {
        setEditingField(null);
        setTempValue('');
    };

    const saveEdit = () => {
        if (tempValue.trim()) {
            setFormData({ ...formData, [editingField]: tempValue.trim() });
            setEditingField(null);
        }
    };

    // Toggle notification
    const handleNotificationToggle = () => {
        setFormData({ ...formData, notificationEnabled: !formData.notificationEnabled });
    };

    // District selection
    const handleDistrictToggle = (districtSlug) => {
        const newDistricts = formData.districts.includes(districtSlug)
            ? formData.districts.filter(d => d !== districtSlug)
            : [...formData.districts, districtSlug];
        setFormData({ ...formData, districts: newDistricts });
    };

    // Select all districts
    const handleSelectAll = () => {
        const allDistrictSlugs = filteredDistricts.map(d => d.slug);
        setFormData({ ...formData, districts: allDistrictSlugs });
    };

    // Deselect all districts
    const handleDeselectAll = () => {
        setFormData({ ...formData, districts: [] });
    };

    // Filter districts by search
    const filteredDistricts = availableDistricts.filter(d =>
        d.name.toLowerCase().includes(districtSearch.toLowerCase())
    );

    // Save changes
    const handleSave = async () => {
        try {
            const result = await dispatch(updateProfileAction(formData));
            if (updateProfileAction.fulfilled.match(result)) {
                toast.success('Cập nhật thông tin thành công');
                setOriginalData(formData);
                setHasChanges(false);
            } else {
                toast.error(result.payload || 'Cập nhật thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra, vui lòng thử lại');
        }
    };

    // Cancel changes
    const handleCancel = () => {
        setFormData(originalData);
        setHasChanges(false);
        setEditingField(null);
    };

    // Logout
    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
        toast.info('Đã đăng xuất');
    };

    if (!user || !resident) {
        navigate('/login');
        return null;
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <BsPersonCircle className="avatar-icon" />
                    <h2>Thông tin cá nhân</h2>
                </div>

                {/* Personal Info Section */}
                <div className="profile-section">
                    <h4 className="section-title">Thông tin cá nhân</h4>
                    <div className="info-grid">
                        {/* Full Name */}
                        <div className="info-item">
                            <label>Họ và tên:</label>
                            {editingField === 'fullName' ? (
                                <div className="edit-field">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        autoFocus
                                    />
                                    <button className="btn btn-success btn-sm" onClick={saveEdit}>
                                        <BsCheck />
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>
                                        <BsX />
                                    </button>
                                </div>
                            ) : (
                                <div className="value-with-edit">
                                    <span>{formData.fullName}</span>
                                    <button
                                        className="btn-edit"
                                        onClick={() => startEdit('fullName')}
                                    >
                                        <BsPencil />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div className="info-item">
                            <label>Email:</label>
                            {editingField === 'email' ? (
                                <div className="edit-field">
                                    <input
                                        type="email"
                                        className="form-control form-control-sm"
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        autoFocus
                                    />
                                    <button className="btn btn-success btn-sm" onClick={saveEdit}>
                                        <BsCheck />
                                    </button>
                                    <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>
                                        <BsX />
                                    </button>
                                </div>
                            ) : (
                                <div className="value-with-edit">
                                    <span>{formData.email}</span>
                                    <button
                                        className="btn-edit"
                                        onClick={() => startEdit('email')}
                                    >
                                        <BsPencil />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Join Date */}
                        <div className="info-item">
                            <label>Ngày tham gia:</label>
                            <div className="value-readonly">
                                <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'N/A'}</span>
                            </div>
                        </div>

                        {/* Last Updated */}
                        <div className="info-item">
                            <label>Cập nhật gần nhất:</label>
                            <div className="value-readonly">
                                <span>{user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="profile-section">
                    <h4 className="section-title">Cài đặt thông báo</h4>
                    <div className="notification-setting">
                        <div className="d-flex align-items-center justify-content-between">
                            <label className="mb-0">Nhận thông báo qua email</label>
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    checked={formData.notificationEnabled}
                                    onChange={handleNotificationToggle}
                                    style={{ width: '3rem', height: '1.5rem', cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                        <div className="notification-desc">
                            <small className="text-muted">
                                Bạn sẽ nhận email cảnh báo khi chất lượng không khí ở mức poor (xấu) hoặc very poor (rất xấu)
                                tại các quận/phường bạn đang theo dõi. Cảnh báo chỉ gửi tối đa 1 lần mỗi 3 giờ cho mỗi khu vực.
                            </small>
                        </div>
                    </div>
                </div>

                {/* Districts Section */}
                <div className="profile-section">
                    <h4 className="section-title">Theo dõi Quận/Phường</h4>

                    <div className="search-box mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm kiếm quận/phường..."
                            value={districtSearch}
                            onChange={(e) => setDistrictSearch(e.target.value)}
                        />
                    </div>

                    <div className="district-actions mb-3">
                        <button
                            className="btn btn-sm btn-outline-purple me-2"
                            onClick={handleSelectAll}
                            disabled={platformsLoading || filteredDistricts.length === 0}
                        >
                            Chọn tất cả
                        </button>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={handleDeselectAll}
                            disabled={platformsLoading || formData.districts.length === 0}
                        >
                            Bỏ chọn tất cả
                        </button>
                    </div>

                    {platformsLoading ? (
                        <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="districts-list">
                                {filteredDistricts.map(district => (
                                    <div key={district.slug} className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`district-${district.slug}`}
                                            checked={formData.districts.includes(district.slug)}
                                            onChange={() => handleDistrictToggle(district.slug)}
                                        />
                                        <label className="form-check-label" htmlFor={`district-${district.slug}`}>
                                            {district.name}
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div className="district-summary mt-3">
                                {formData.districts.length === 0 ? (
                                    <div className="alert alert-warning py-2 mb-0">
                                        <small>Bạn chưa theo dõi quận/phường nào. Bạn sẽ không nhận được thông báo.</small>
                                    </div>
                                ) : (
                                    <div className="text-muted">
                                        <small>Đã chọn: <strong>{formData.districts.length}</strong> quận/phường</small>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="profile-actions">
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={!hasChanges || loading}
                    >
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={handleCancel}
                        disabled={!hasChanges || loading}
                    >
                        Hủy
                    </button>
                    <button className="btn btn-outline-secondary" disabled>
                        <BsShieldLock className="me-2" />
                        Đổi mật khẩu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
