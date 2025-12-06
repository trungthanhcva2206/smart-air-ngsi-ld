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
 * @Copyright (C) 2025 TAA. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
 */
import { BsExclamationTriangle, BsShieldCheck, BsLungs, BsHeart, BsPeople, BsGraphUp } from 'react-icons/bs';
import './AirQuality.scss';

const AirQuality = () => {
    return (
        <div className="air-quality-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">Chất lượng không khí</h1>
                        <p className="hero-subtitle">
                            Hiểu rõ tác động của ô nhiễm không khí và tầm quan trọng của việc theo dõi môi trường
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="stat-card">
                                <div className="stat-icon danger">
                                    <BsExclamationTriangle />
                                </div>
                                <h3 className="stat-number">7 triệu</h3>
                                <p className="stat-label">Ca tử vong hàng năm do ô nhiễm không khí (WHO)</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="stat-card">
                                <div className="stat-icon warning">
                                    <BsPeople />
                                </div>
                                <h3 className="stat-number">90%</h3>
                                <p className="stat-label">Dân số thế giới hít thở không khí ô nhiễm</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="stat-card">
                                <div className="stat-icon info">
                                    <BsGraphUp />
                                </div>
                                <h3 className="stat-number">25%</h3>
                                <p className="stat-label">Tăng nguy cơ mắc bệnh tim mạch ở vùng ô nhiễm</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Health Impact Section */}
            <section className="impact-section">
                <div className="container">
                    <h2 className="section-title">Tác động đến sức khỏe</h2>
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="impact-card">
                                <div className="impact-icon">
                                    <BsLungs />
                                </div>
                                <h3>Hệ hô hấp</h3>
                                <ul>
                                    <li>Hen suyễn và viêm phế quản mãn tính</li>
                                    <li>Giảm chức năng phổi ở trẻ em</li>
                                    <li>Tăng nguy cơ ung thư phổi</li>
                                    <li>Viêm đường hô hấp cấp tính</li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="impact-card">
                                <div className="impact-icon">
                                    <BsHeart />
                                </div>
                                <h3>Hệ tim mạch</h3>
                                <ul>
                                    <li>Tăng huyết áp và nhồi máu cơ tim</li>
                                    <li>Đột quỵ não</li>
                                    <li>Rối loạn nhịp tim</li>
                                    <li>Tăng nguy cơ suy tim</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pollutants Section */}
            <section className="pollutants-section">
                <div className="container">
                    <h2 className="section-title">Các chất gây ô nhiễm chính</h2>
                    <div className="pollutants-grid">
                        <div className="pollutant-item">
                            <div className="pollutant-header">
                                <h4>PM2.5 & PM10</h4>
                                <span className="pollutant-badge danger">Nguy hiểm cao</span>
                            </div>
                            <p className="pollutant-desc">
                                Bụi mịn có đường kính nhỏ hơn 2.5μm và 10μm, có thể xâm nhập sâu vào phổi và gây tổn thương nghiêm trọng.
                            </p>
                            <div className="pollutant-sources">
                                <strong>Nguồn:</strong> Khói xe, nhà máy, đốt rác, xây dựng
                            </div>
                        </div>

                        <div className="pollutant-item">
                            <div className="pollutant-header">
                                <h4>NO₂ (Nitrogen Dioxide)</h4>
                                <span className="pollutant-badge warning">Nguy hiểm</span>
                            </div>
                            <p className="pollutant-desc">
                                Khí độc gây kích ứng đường hô hấp, giảm khả năng miễn dịch và tăng nguy cơ nhiễm trùng.
                            </p>
                            <div className="pollutant-sources">
                                <strong>Nguồn:</strong> Khí thải xe cộ, nhà máy nhiệt điện
                            </div>
                        </div>

                        <div className="pollutant-item">
                            <div className="pollutant-header">
                                <h4>O₃ (Ozone)</h4>
                                <span className="pollutant-badge warning">Nguy hiểm</span>
                            </div>
                            <p className="pollutant-desc">
                                Ozone tầng đối lưu gây kích ứng mắt, mũi, họng và làm giảm chức năng phổi.
                            </p>
                            <div className="pollutant-sources">
                                <strong>Nguồn:</strong> Phản ứng quang hóa từ NOx và VOCs
                            </div>
                        </div>

                        <div className="pollutant-item">
                            <div className="pollutant-header">
                                <h4>CO (Carbon Monoxide)</h4>
                                <span className="pollutant-badge moderate">Trung bình</span>
                            </div>
                            <p className="pollutant-desc">
                                Khí không màu, không mùi gây thiếu oxy máu, đau đầu, chóng mặt và có thể gây tử vong ở nồng độ cao.
                            </p>
                            <div className="pollutant-sources">
                                <strong>Nguồn:</strong> Đốt cháy không hoàn toàn nhiên liệu
                            </div>
                        </div>

                        <div className="pollutant-item">
                            <div className="pollutant-header">
                                <h4>SO₂ (Sulfur Dioxide)</h4>
                                <span className="pollutant-badge warning">Nguy hiểm</span>
                            </div>
                            <p className="pollutant-desc">
                                Gây kích ứng hệ hô hấp, đặc biệt nguy hiểm với người bị hen suyễn và bệnh phổi mãn tính.
                            </p>
                            <div className="pollutant-sources">
                                <strong>Nguồn:</strong> Nhà máy nhiệt điện, luyện kim
                            </div>
                        </div>

                        <div className="pollutant-item">
                            <div className="pollutant-header">
                                <h4>NH₃ (Ammonia)</h4>
                                <span className="pollutant-badge moderate">Trung bình</span>
                            </div>
                            <p className="pollutant-desc">
                                Khí có mùi hăng, gây kích ứng mắt, mũi, họng và có thể gây phù phổi ở nồng độ cao.
                            </p>
                            <div className="pollutant-sources">
                                <strong>Nguồn:</strong> Chăn nuôi, phân bón hóa học
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* AQI Guide Section */}
            <section className="aqi-section">
                <div className="container">
                    <h2 className="section-title">Chỉ số chất lượng không khí (AQI)</h2>
                    <div className="aqi-guide">
                        <div className="aqi-level aqi-good">
                            <div className="aqi-badge">1</div>
                            <h4>Tốt (Good)</h4>
                            <p>Chất lượng không khí tốt, không có rủi ro sức khỏe</p>
                        </div>
                        <div className="aqi-level aqi-fair">
                            <div className="aqi-badge">2</div>
                            <h4>Khá (Fair)</h4>
                            <p>Chất lượng không khí chấp nhận được, nhóm nhạy cảm nên hạn chế hoạt động ngoài trời</p>
                        </div>
                        <div className="aqi-level aqi-moderate">
                            <div className="aqi-badge">3</div>
                            <h4>Trung bình (Moderate)</h4>
                            <p>Nhóm nhạy cảm có thể gặp vấn đề sức khỏe, nên đeo khẩu trang khi ra ngoài</p>
                        </div>
                        <div className="aqi-level aqi-poor">
                            <div className="aqi-badge">4</div>
                            <h4>Kém (Poor)</h4>
                            <p>Mọi người có thể gặp vấn đề sức khỏe, hạn chế ra ngoài nếu không cần thiết</p>
                        </div>
                        <div className="aqi-level aqi-very-poor">
                            <div className="aqi-badge">5</div>
                            <h4>Rất kém (Very Poor)</h4>
                            <p>Cảnh báo sức khỏe khẩn cấp, mọi người nên ở trong nhà và đóng cửa</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Protection Section */}
            <section className="protection-section">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <h2 className="section-title text-start">Bảo vệ sức khỏe</h2>
                            <div className="protection-content">
                                <h4><BsShieldCheck className="me-2 text-primary" />Biện pháp phòng tránh</h4>
                                <ul className="protection-list">
                                    <li>Theo dõi chỉ số AQI hàng ngày qua ứng dụng</li>
                                    <li>Hạn chế hoạt động ngoài trời khi AQI ở mức xấu</li>
                                    <li>Đeo khẩu trang N95/KN95 khi ra ngoài vùng ô nhiễm</li>
                                    <li>Sử dụng máy lọc không khí trong nhà</li>
                                    <li>Đóng cửa sổ khi không khí bên ngoài ô nhiễm</li>
                                    <li>Tăng cường rau xanh, trái cây giàu vitamin C</li>
                                    <li>Uống đủ nước để thanh lọc cơ thể</li>
                                    <li>Khám sức khỏe định kỳ, đặc biệt hệ hô hấp</li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="protection-card">
                                <h4>Nhóm nguy cơ cao</h4>
                                <div className="risk-groups">
                                    <div className="risk-item">
                                        <span className="risk-icon">👶</span>
                                        <span>Trẻ em và trẻ sơ sinh</span>
                                    </div>
                                    <div className="risk-item">
                                        <span className="risk-icon">👴</span>
                                        <span>Người cao tuổi</span>
                                    </div>
                                    <div className="risk-item">
                                        <span className="risk-icon">🤰</span>
                                        <span>Phụ nữ mang thai</span>
                                    </div>
                                    <div className="risk-item">
                                        <span className="risk-icon">🫁</span>
                                        <span>Người bệnh hô hấp, tim mạch</span>
                                    </div>
                                    <div className="risk-item">
                                        <span className="risk-icon">🏃</span>
                                        <span>Người lao động ngoài trời</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Cùng chung tay bảo vệ không khí trong lành</h2>
                        <p>Theo dõi chất lượng không khí thời gian thực tại khu vực của bạn</p>
                        <a href="/" className="btn btn-primary btn-lg">
                            Xem bản đồ chất lượng không khí
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AirQuality;
