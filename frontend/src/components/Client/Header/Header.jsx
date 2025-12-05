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
 * @Copyright (C) 2025 CHK. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
*/
import { NavLink, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../store/slices/authSlice';
import { BsPersonCircle, BsChevronDown } from 'react-icons/bs';
import { toast } from 'react-toastify';
import './Header.scss';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
        toast.info('Đã đăng xuất');
    };

    return (
        <header className="header navbar navbar-expand-lg bg-body-tertiary border-bottom sticky-top">
            <div className="container-fluid">
                <NavLink to="/" className="navbar-brand fw-bold" style={{ letterSpacing: 0.5 }}>
                    AirTrack
                </NavLink>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <nav className="navbar-nav ms-auto align-items-lg-center gap-2 gap-lg-3">
                        <NavLink to="/" className={({ isActive }) => isActive || window.location.pathname.startsWith('/urn:') ? 'nav-link active' : 'nav-link'}>Bản đồ trạm</NavLink>
                        <NavLink to="/map" className="nav-link">Đường đi</NavLink>
                        <NavLink to="/analysis" className="nav-link">Thống kê</NavLink>
                        <NavLink to="/open-data" className="nav-link">Dữ liệu mở</NavLink>
                        <NavLink to="/air-quality" className="nav-link">Chất lượng không khí</NavLink>
                        <NavLink to="/about" className="nav-link">Về chúng tôi</NavLink>
                    </nav>
                    <div className="auth-links ms-0 ms-lg-4 d-flex gap-3 align-items-center">
                        {isAuthenticated ? (
                            <div className="dropdown">
                                <button
                                    className="btn dropdown-toggle user-dropdown-btn"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <BsPersonCircle className="user-icon" />
                                    <span className="user-greeting">Xin chào, {user?.fullName || 'User'}</span>
                                    <BsChevronDown className="chevron-icon" />
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <Link className="dropdown-item" to="/profile">
                                            Quản lý tài khoản
                                        </Link>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button className="dropdown-item" onClick={handleLogout}>
                                            Đăng xuất
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="auth-link">Đăng nhập</Link>
                                <Link to="/register" className="btn btn-outline-primary btn-sm">Đăng ký</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;