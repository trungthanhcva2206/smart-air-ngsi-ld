/* */
import React from 'react';
import {
    BsBroadcast,
    BsCpu,
    BsExclamationTriangle,
    BsActivity,
    BsArrowUpShort
} from 'react-icons/bs';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { usePlatformsSSE } from '../../../hooks/usePlatformSSE';
import './Dashboard.scss';

const Dashboard = () => {
    const { platforms, loading } = usePlatformsSSE();

    // Mock data 
    const dataHistory = [
        { name: 'T2', pm25: 45, co: 240 },
        { name: 'T3', pm25: 52, co: 139 },
        { name: 'T4', pm25: 38, co: 980 },
        { name: 'T5', pm25: 65, co: 308 },
        { name: 'T6', pm25: 48, co: 480 },
        { name: 'T7', pm25: 58, co: 380 },
        { name: 'CN', pm25: 43, co: 430 },
    ];

    const dataStatus = [
        { name: 'Hoạt động', value: platforms.filter(p => p.status === 'operational').length || 80 },
        { name: 'Bảo trì', value: platforms.filter(p => p.status !== 'operational').length || 20 },
    ];

    const COLORS = ['#00C49F', '#FFBB28'];
    const totalStations = platforms.length;
    const activeSensors = totalStations * 2;
    const alertsCount = 3;

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
        <div className="admin-dashboard container-fluid">
            {/* Header */}
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom">
                <h1 className="h2">Tổng quan hệ thống</h1>
                <div className="btn-toolbar mb-2 mb-md-0">
                    <button type="button" className="btn btn-sm btn-outline-secondary dropdown-toggle">
                        <span data-feather="calendar"></span>
                        Tuần này
                    </button>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="row g-4 mb-4">
                {/* Card 1: Tổng số trạm (Màu Primary - Xanh dương) */}
                <div className="col-xl-3 col-md-6">
                    <div className="card stat-card border-primary h-100 bg-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="mb-0 text-muted small text-uppercase fw-bold">Tổng trạm</p>
                                    <h3 className="fw-bold mb-0 text-primary">{totalStations}</h3>
                                </div>
                                <div className="icon-box bg-primary bg-opacity-10 text-primary rounded-circle p-3">
                                    <BsBroadcast size={24} />
                                </div>
                            </div>
                            <div className="mt-3 small text-muted">
                                <span className="fw-bold text-success"><BsArrowUpShort /> 12%</span> so với tháng trước
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 2: Thiết bị hoạt động (Màu Success - Xanh lá) */}
                <div className="col-xl-3 col-md-6">
                    <div className="card stat-card border-success h-100 bg-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="mb-0 text-muted small text-uppercase fw-bold">Cảm biến Online</p>
                                    <h3 className="fw-bold mb-0 text-success">{activeSensors}</h3>
                                </div>
                                <div className="icon-box bg-success bg-opacity-10 text-success rounded-circle p-3">
                                    <BsCpu size={24} />
                                </div>
                            </div>
                            <div className="mt-3 small text-muted">
                                <span className="fw-bold text-success">100%</span> trạng thái ổn định
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 3: Cảnh báo (Màu Warning - Vàng cam) */}
                <div className="col-xl-3 col-md-6">
                    <div className="card stat-card border-warning h-100 bg-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="mb-0 text-muted small text-uppercase fw-bold">Cảnh báo ô nhiễm</p>
                                    <h3 className="fw-bold mb-0 text-warning">{alertsCount}</h3>
                                </div>
                                <div className="icon-box bg-warning bg-opacity-10 text-warning rounded-circle p-3">
                                    <BsExclamationTriangle size={24} />
                                </div>
                            </div>
                            <div className="mt-3 small text-muted">
                                <span className="fw-bold text-danger"><BsArrowUpShort /> 2</span> khu vực AQI cao
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 4: AQI Trung bình (Màu Info - Xanh nhạt) */}
                <div className="col-xl-3 col-md-6">
                    <div className="card stat-card border-info h-100 bg-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="mb-0 text-muted small text-uppercase fw-bold">AQI Trung bình</p>
                                    <h3 className="fw-bold mb-0 text-info">85</h3>
                                </div>
                                <div className="icon-box bg-info bg-opacity-10 text-info rounded-circle p-3">
                                    <BsActivity size={24} />
                                </div>
                            </div>
                            <div className="mt-3 small text-muted">
                                <span className="fw-bold text-dark">Trung bình</span> toàn thành phố
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="row g-4 mb-4">
                {/* Main Chart */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-3 border-bottom-0">
                            <h5 className="mb-0 fw-bold text-dark">Xu hướng không khí (7 ngày)</h5>
                        </div>
                        <div className="card-body">
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={dataHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorPm25" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#888888" />
                                        <YAxis stroke="#888888" />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="pm25" stroke="#8884d8" strokeWidth={3} fillOpacity={1} fill="url(#colorPm25)" name="PM2.5" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Pie Chart */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white py-3 border-bottom-0">
                            <h5 className="mb-0 fw-bold text-dark">Trạng thái trạm</h5>
                        </div>
                        <div className="card-body">
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={dataStatus}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {dataStatus.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Stations Table */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom-0">
                    <h5 className="mb-0 fw-bold text-dark">Trạm quan trắc mới cập nhật</h5>
                    <button className="btn btn-sm btn-light text-primary fw-bold">Xem tất cả</button>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th scope="col" className="ps-4 border-bottom-0 text-muted">Tên trạm</th>
                                <th scope="col" className="border-bottom-0 text-muted">Khu vực</th>
                                <th scope="col" className="border-bottom-0 text-muted">Trạng thái</th>
                                <th scope="col" className="border-bottom-0 text-muted">Cập nhật</th>
                                <th scope="col" className="text-end pe-4 border-bottom-0 text-muted">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {platforms.slice(0, 5).map((station) => (
                                <tr key={station.entityId}>
                                    <td className="ps-4 fw-bold text-dark">{station.name}</td>
                                    <td className="text-secondary">{station.address?.addressLocality || 'N/A'}</td>
                                    <td>
                                        <span className={`badge rounded-pill ${station.status === 'operational' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`}>
                                            {station.status === 'operational' ? '• Hoạt động' : `• ${station.status}`}
                                        </span>
                                    </td>
                                    <td className="text-secondary">{new Date().toLocaleDateString('vi-VN')}</td>
                                    <td className="text-end pe-4">
                                        <button className="btn btn-sm btn-outline-primary rounded-pill px-3">Chi tiết</button>
                                    </td>
                                </tr>
                            ))}
                            {platforms.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">Không có dữ liệu trạm</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;