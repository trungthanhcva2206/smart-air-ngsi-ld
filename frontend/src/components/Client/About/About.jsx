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
import { BsGithub, BsEnvelope, BsShieldCheck, BsGraphUpArrow, BsMap, BsClouds } from 'react-icons/bs';
import './About.scss';

const About = () => {
    const features = [
        {
            icon: <BsMap className="feature-icon text-primary" />,
            title: "Bản đồ trực quan",
            desc: "Theo dõi vị trí và trạng thái các trạm quan trắc trên toàn thành phố với bản đồ tương tác thời gian thực."
        },
        {
            icon: <BsGraphUpArrow className="feature-icon text-success" />,
            title: "Phân tích dữ liệu",
            desc: "Biểu đồ lịch sử và thống kê chi tiết về các chỉ số không khí (PM2.5, CO, NO2...) và thời tiết."
        },
        {
            icon: <BsClouds className="feature-icon text-info" />,
            title: "Tìm đường sạch",
            desc: "Đề xuất lộ trình di chuyển tránh các khu vực ô nhiễm, bảo vệ sức khỏe người tham gia giao thông."
        },
        {
            icon: <BsShieldCheck className="feature-icon text-warning" />,
            title: "Dữ liệu mở",
            desc: "Tuân thủ chuẩn NGSI-LD, cung cấp API mở giúp cộng đồng và nhà nghiên cứu dễ dàng tiếp cận dữ liệu."
        }
    ];

    const teamMembers = [
        {
            name: "Trung Thành (TT)",
            email: "trungthanhcva2206@gmail.com",
            avatar: "T"
        },
        {
            name: "Tankchoi",
            email: "tadzltv22082004@gmail.com",
            avatar: "K"
        },
        {
            name: "Panh",
            email: "panh812004.apn@gmail.com",
            avatar: "P"
        }
    ];

    return (
        <div className="about-page container py-5">
            {/* Intro Section */}
            <div className="row justify-content-center mb-5">
                <div className="col-lg-8 text-center">
                    <h1 className="display-4 fw-bold mb-3 text-primary">Về AirTrack</h1>
                    <p className="lead text-muted">
                        Hệ thống giám sát chất lượng không khí thông minh cho đô thị hiện đại.
                        Chúng tôi cung cấp dữ liệu chính xác, kịp thời để giúp bạn thở sạch hơn, sống khỏe hơn.
                    </p>
                </div>
            </div>

            {/* Features Grid */}
            <div className="row g-4 mb-5">
                {features.map((item, index) => (
                    <div className="col-md-6 col-lg-3" key={index}>
                        <div className="card h-100 shadow-sm border-0 feature-card">
                            <div className="card-body text-center p-4">
                                <div className="mb-3 icon-wrapper">
                                    {item.icon}
                                </div>
                                <h5 className="card-title fw-bold">{item.title}</h5>
                                <p className="card-text text-muted small">{item.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Team Section */}
            <div className="mb-5">
                <h3 className="text-center fw-bold mb-4">Đội ngũ phát triển</h3>
                <div className="row justify-content-center g-4">
                    {teamMembers.map((member, index) => (
                        <div className="col-md-6 col-lg-4" key={index}>
                            <div className="card h-100 shadow-sm border-0 team-card">
                                <div className="card-body p-4 d-flex align-items-center">
                                    <div className="avatar-circle me-3 bg-primary text-white fw-bold d-flex align-items-center justify-content-center">
                                        {member.avatar}
                                    </div>
                                    <div>
                                        <h5 className="mb-1 fw-bold">{member.name}</h5>
                                        <a href={`mailto:${member.email}`} className="text-muted small d-flex align-items-center text-decoration-none">
                                            <BsEnvelope className="me-2" /> {member.email}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* GitHub Footer */}
            <div className="text-center mt-5 pt-4 border-top">
                <p className="text-muted mb-2">Dự án mã nguồn mở</p>
                <a
                    href="https://github.com/trungthanhcva2206/smart-air-ngsi-ld"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-dark"
                >
                    <BsGithub className="me-2" /> Xem trên GitHub
                </a>
            </div>
        </div >
    );
};

export default About;