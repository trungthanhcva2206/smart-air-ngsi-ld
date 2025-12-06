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
package org.opensource.smartair.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.opensource.smartair.dtos.AirQualityDataDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Service gửi email thông báo
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${mail.from-name:Smart Air Hanoi}")
    private String fromName;

    @Value("${app.frontend.url:http://localhost:5137}")
    private String frontendUrl;

    /**
     * Gửi email cảnh báo chất lượng không khí
     */
    @Async
    public void sendAirQualityAlert(String toEmail, String fullName, AirQualityDataDTO airQuality) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Set FROM with display name: "Tên Hiển Thị <email@example.com>"
            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject(getAlertSubject(airQuality));
            helper.setText(buildAlertEmailContent(fullName, airQuality), true);

            mailSender.send(message);
            log.info("Sent air quality alert email to: {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send email to: {}", toEmail, e);
        } catch (Exception e) {
            log.error("Unexpected error sending email to: {}", toEmail, e);
        }
    }

    /**
     * Tạo subject email dựa trên mức độ nghiêm trọng
     */
    private String getAlertSubject(AirQualityDataDTO airQuality) {
        String level = airQuality.getAirQualityLevel();
        String district = airQuality.getDistrict() != null ? airQuality.getDistrict() : airQuality.getStationName();

        if ("very poor".equalsIgnoreCase(level)) {
            return "CẢNH BÁO KHẨN CẤP - Chất lượng không khí rất xấu tại " + district;
        } else if ("poor".equalsIgnoreCase(level)) {
            return "CẢNH BÁO - Chất lượng không khí xấu tại " + district;
        }
        return "Thông báo chất lượng không khí tại " + district;
    }

    /**
     * Xây dựng nội dung email HTML
     */
    private String buildAlertEmailContent(String fullName, AirQualityDataDTO airQuality) {
        String district = airQuality.getDistrict() != null ? airQuality.getDistrict() : airQuality.getStationName();
        String level = airQuality.getAirQualityLevel();
        Integer aqi = airQuality.getAirQualityIndex();

        String levelColor = getLevelColor(level);
        String levelText = getLevelText(level);

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<style>");
        html.append("body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }");
        html.append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }");
        html.append(
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }");
        html.append(".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }");
        html.append(".alert-box { background: ").append(levelColor)
                .append("; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }");
        html.append(
                ".metric { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid ")
                .append(levelColor).append("; }");
        html.append(".metric-label { font-size: 12px; color: #666; text-transform: uppercase; }");
        html.append(".metric-value { font-size: 24px; font-weight: bold; color: #333; }");
        html.append(
                ".recommendations { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }");
        html.append(".footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }");
        html.append(
                ".button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        html.append("<div class='container'>");

        // Header
        html.append("<div class='header'>");
        html.append("<h1>CẢNH BÁO CHẤT LƯỢNG KHÔNG KHÍ</h1>");
        html.append("<p>Hệ thống giám sát môi trường Hà Nội</p>");
        html.append("</div>");

        // Content
        html.append("<div class='content'>");
        html.append("<p>Xin chào <strong>").append(fullName).append("</strong>,</p>");
        html.append("<p>Hệ thống phát hiện chất lượng không khí tại <strong>").append(district)
                .append("</strong> đang ở mức <strong>").append(levelText).append("</strong>.</p>");

        // Alert Box
        html.append("<div class='alert-box'>");
        html.append("<h2 style='margin: 0;'>").append(levelText).append("</h2>");
        html.append("<p style='font-size: 48px; margin: 10px 0;'>AQI: ").append(aqi).append("</p>");
        html.append("<p style='margin: 0;'>Khu vực: ").append(district).append("</p>");
        html.append("</div>");

        // Metrics
        html.append("<h3>Chi tiết các chỉ số ô nhiễm:</h3>");

        if (airQuality.getPm2_5() != null) {
            html.append("<div class='metric'>");
            html.append("<div class='metric-label'>PM2.5 (Bụi mịn 2.5 micromet)</div>");
            html.append("<div class='metric-value'>").append(String.format("%.1f", airQuality.getPm2_5()))
                    .append(" µg/m³</div>");
            if (airQuality.getPm2_5Level() != null) {
                html.append("<div style='color: #666;'>Mức độ: ").append(getLevelText(airQuality.getPm2_5Level()))
                        .append("</div>");
            }
            html.append("</div>");
        }

        if (airQuality.getPm10() != null) {
            html.append("<div class='metric'>");
            html.append("<div class='metric-label'>PM10 (Bụi mịn 10 micromet)</div>");
            html.append("<div class='metric-value'>").append(String.format("%.1f", airQuality.getPm10()))
                    .append(" µg/m³</div>");
            if (airQuality.getPm10Level() != null) {
                html.append("<div style='color: #666;'>Mức độ: ").append(getLevelText(airQuality.getPm10Level()))
                        .append("</div>");
            }
            html.append("</div>");
        }

        if (airQuality.getO3() != null) {
            html.append("<div class='metric'>");
            html.append("<div class='metric-label'>O3 (Ozon)</div>");
            html.append("<div class='metric-value'>").append(String.format("%.1f", airQuality.getO3()))
                    .append(" µg/m³</div>");
            if (airQuality.getO3Level() != null) {
                html.append("<div style='color: #666;'>Mức độ: ").append(getLevelText(airQuality.getO3Level()))
                        .append("</div>");
            }
            html.append("</div>");
        }

        if (airQuality.getNo2() != null) {
            html.append("<div class='metric'>");
            html.append("<div class='metric-label'>NO2 (Nitơ dioxit)</div>");
            html.append("<div class='metric-value'>").append(String.format("%.1f", airQuality.getNo2()))
                    .append(" µg/m³</div>");
            if (airQuality.getNo2Level() != null) {
                html.append("<div style='color: #666;'>Mức độ: ").append(getLevelText(airQuality.getNo2Level()))
                        .append("</div>");
            }
            html.append("</div>");
        }

        if (airQuality.getSo2() != null) {
            html.append("<div class='metric'>");
            html.append("<div class='metric-label'>SO2 (Lưu huỳnh dioxit)</div>");
            html.append("<div class='metric-value'>").append(String.format("%.1f", airQuality.getSo2()))
                    .append(" µg/m³</div>");
            if (airQuality.getSo2Level() != null) {
                html.append("<div style='color: #666;'>Mức độ: ").append(getLevelText(airQuality.getSo2Level()))
                        .append("</div>");
            }
            html.append("</div>");
        }

        if (airQuality.getCo() != null) {
            html.append("<div class='metric'>");
            html.append("<div class='metric-label'>CO (Cacbon monoxit)</div>");
            html.append("<div class='metric-value'>").append(String.format("%.1f", airQuality.getCo()))
                    .append(" µg/m³</div>");
            if (airQuality.getCoLevel() != null) {
                html.append("<div style='color: #666;'>Mức độ: ").append(getLevelText(airQuality.getCoLevel()))
                        .append("</div>");
            }
            html.append("</div>");
        }

        // Recommendations
        html.append("<div class='recommendations'>");
        html.append("<h3 style='margin-top: 0;'>Khuyến cáo sức khỏe:</h3>");
        html.append(getHealthRecommendations(level));
        html.append("</div>");

        // Time
        if (airQuality.getObservedAt() != null) {
            html.append("<p style='color: #666; font-size: 12px;'>Thời gian quan trắc: ")
                    .append(airQuality.getObservedAt()).append("</p>");
        }

        // CTA Button
        html.append("<div style='text-align: center; margin: 30px 0;'>");
        html.append("<a href='").append(frontendUrl).append("/stations' class='button'>Xem bản đồ đầy đủ</a>");
        html.append("</div>");

        html.append("</div>");

        // Footer
        html.append("<div class='footer'>");
        html.append(
                "<p>Bạn nhận được email này vì bạn đã đăng ký nhận thông báo từ Hệ thống giám sát môi trường Hà Nội.</p>");
        html.append("<p>Nguồn dữ liệu: OpenWeatherMap API | Powered by FIWARE Orion-LD</p>");
        html.append("<p>&copy; 2024 Smart Air Quality Monitoring System</p>");
        html.append("</div>");

        html.append("</div>");
        html.append("</body>");
        html.append("</html>");

        return html.toString();
    }

    /**
     * Lấy màu theo mức độ
     */
    private String getLevelColor(String level) {
        if (level == null)
            return "#6c757d";

        return switch (level.toLowerCase()) {
            case "very poor" -> "#dc3545";
            case "poor" -> "#fd7e14";
            case "moderate" -> "#ffc107";
            case "fair" -> "#28a745";
            case "good" -> "#20c997";
            default -> "#6c757d";
        };
    }

    /**
     * Chuyển level sang tiếng Việt
     */
    private String getLevelText(String level) {
        if (level == null)
            return "Không xác định";

        return switch (level.toLowerCase()) {
            case "very poor" -> "Rất xấu";
            case "poor" -> "Xấu";
            case "moderate" -> "Trung bình";
            case "fair" -> "Khá";
            case "good" -> "Tốt";
            default -> "Không xác định";
        };
    }

    /**
     * Khuyến cáo sức khỏe theo mức độ
     */
    private String getHealthRecommendations(String level) {
        if (level == null)
            return "<p>Không có dữ liệu để đánh giá.</p>";

        return switch (level.toLowerCase()) {
            case "very poor" -> """
                    <ul style='margin: 0; padding-left: 20px;'>
                        <li>HẠN CHẾ RA NGOÀI nếu không cần thiết</li>
                        <li>Đóng cửa sổ, sử dụng máy lọc không khí trong nhà</li>
                        <li>Đeo khẩu trang N95 nếu bắt buộc phải ra ngoài</li>
                        <li>Không tập thể dục ngoài trời</li>
                        <li>Người già, trẻ em, phụ nữ mang thai và người có bệnh lý nên ở trong nhà</li>
                    </ul>
                    """;
            case "poor" -> """
                    <ul style='margin: 0; padding-left: 20px;'>
                        <li>Giảm thời gian hoạt động ngoài trời</li>
                        <li>Đeo khẩu trang khi ra ngoài</li>
                        <li>Tránh tập luyện nặng ngoài trời</li>
                        <li>Đóng cửa sổ trong giờ cao điểm ô nhiễm</li>
                        <li>Người nhạy cảm nên hạn chế tiếp xúc</li>
                    </ul>
                    """;
            case "moderate" -> """
                    <ul style='margin: 0; padding-left: 20px;'>
                        <li>Người nhạy cảm nên cân nhắc giảm hoạt động ngoài trời</li>
                        <li>Theo dõi tình trạng sức khỏe nếu có triệu chứng</li>
                        <li>Có thể hoạt động ngoài trời bình thường với người khỏe mạnh</li>
                    </ul>
                    """;
            case "fair" -> """
                    <ul style='margin: 0; padding-left: 20px;'>
                        <li>Chất lượng không khí khá, có thể hoạt động bình thường</li>
                        <li>Người nhạy cảm nên theo dõi tình trạng sức khỏe</li>
                    </ul>
                    """;
            case "good" -> """
                    <ul style='margin: 0; padding-left: 20px;'>
                        <li>Chất lượng không khí tốt, an toàn cho mọi người</li>
                        <li>Có thể hoạt động ngoài trời tự do</li>
                    </ul>
                    """;
            default -> "<p>Vui lòng tham khảo thông tin chi tiết trên website.</p>";
        };
    }
}
