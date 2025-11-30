import { NavLink } from 'react-router-dom';
import { BsSpeedometer2, BsBroadcast, BsCpu, BsPeople } from 'react-icons/bs';
import './Sidebar.scss';

const Sidebar = () => {
    return (
        <div className="admin-sidebar d-flex flex-column text-white bg-dark">
            {/* 1. Logo Section - Tăng padding để tách biệt */}
            <div className="sidebar-header p-4">
                <a href="/" className="d-flex align-items-center text-white text-decoration-none">
                    <span className="fs-4 fw-bold tracking-tight">AirTrack Admin</span>
                </a>
            </div>

            {/* 2. Menu Section - Dùng flex-column và gap để tạo khoảng cách đều */}
            <div className="sidebar-menu flex-grow-1 px-3">
                <ul className="nav nav-pills flex-column gap-2"> {/* gap-2 tạo khoảng cách giữa các nút */}
                    <li className="nav-item">
                        <NavLink
                            to="/admin"
                            end
                            className={({ isActive }) => isActive ? "nav-link active d-flex align-items-center" : "nav-link text-white-50 d-flex align-items-center hover-light"}
                        >
                            <BsSpeedometer2 className="me-3" size={20} /> {/* Tăng size icon và margin */}
                            <span>Dashboard</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin/stations"
                            className={({ isActive }) => isActive ? "nav-link active d-flex align-items-center" : "nav-link text-white-50 d-flex align-items-center hover-light"}
                        >
                            <BsBroadcast className="me-3" size={20} />
                            <span>Quản lý Trạm</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin/devices"
                            className={({ isActive }) => isActive ? "nav-link active d-flex align-items-center" : "nav-link text-white-50 d-flex align-items-center hover-light"}
                        >
                            <BsCpu className="me-3" size={20} />
                            <span>Quản lý Thiết bị</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/admin/accounts"
                            className={({ isActive }) => isActive ? "nav-link active d-flex align-items-center" : "nav-link text-white-50 d-flex align-items-center hover-light"}
                        >
                            <BsPeople className="me-3" size={20} />
                            <span>Quản lý Tài khoản</span>
                        </NavLink>
                    </li>
                </ul>
            </div>

            {/* 3. User Profile Section - Ghim dưới đáy */}
            <div className="sidebar-footer p-3 mt-auto border-top border-secondary">
                <div className="dropdown">
                    <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle p-2 rounded hover-bg-dark" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                        <img src="https://github.com/mdo.png" alt="" width="40" height="40" className="rounded-circle me-3 border border-2 border-secondary" />
                        <div className="d-flex flex-column">
                            <strong className="fs-6">Admin User</strong>
                            <span className="small text-white-50">Super Admin</span>
                        </div>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
                        <li><a className="dropdown-item" href="#">Cài đặt</a></li>
                        <li><a className="dropdown-item" href="#">Hồ sơ</a></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><NavLink className="dropdown-item" to="/">Đăng xuất</NavLink></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;