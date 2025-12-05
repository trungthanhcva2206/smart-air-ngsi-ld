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
import { NavLink } from 'react-router-dom';
import './Header.scss';

const Header = () => {
    return (
        <header className="header navbar navbar-expand-lg bg-body-tertiary border-bottom sticky-top">
            <div className="container-fluid">
                <NavLink to="/" className="navbar-brand fw-bold" style={{ letterSpacing: 0.5 }}>
                    SmartCity
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
                        {/* <NavLink to="/analysis" className="nav-link">Thống kê</NavLink> */}
                        <NavLink to="/air-quality" className="nav-link">Chất lượng không khí</NavLink>
                        <NavLink to="/open-data" className="nav-link">Dữ liệu mở</NavLink>
                        <NavLink to="/about" className="nav-link">Về chúng tôi</NavLink>
                    </nav>
                    <div className="auth-links ms-0 ms-lg-4 d-flex gap-3 align-items-center">
                        <NavLink to="/register" className="auth-link">Đăng ký</NavLink>
                        <NavLink to="/login" className="btn btn-outline-primary btn-sm">Đăng nhập</NavLink>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;