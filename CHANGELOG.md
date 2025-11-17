# 📌 CHANGELOG --- Smart Air NGSI-LD System

Tài liệu này ghi lại toàn bộ thay đổi đáng chú ý của dự án.

## 📖 Format

Tuân theo chuẩn **Keep a Changelog**\
Dùng phiên bản hoá **Unreleased → v1.0.0**

------------------------------------------------------------------------

## \[Unreleased\]

### Added

-   Hoàn thiện hạ tầng NGSI-LD cho hệ thống Smart Air Quality.
-   Thêm các entity tuân theo ontology **SOSA/SSN**, bao gồm Sensor,
    Observation, ObservedProperty, FeatureOfInterest.
-   Tích hợp mô hình dữ liệu NGSI-LD dạng JSON-LD.
-   Xây dựng các container nền tảng (MongoDB, Orion-LD/Scorpio,
    QuantumLeap).
-   Tạo pipeline ETL ingest dữ liệu không khí vào NGSI-LD Broker.

### Changed

-   Tái cấu trúc thư mục theo từng nhóm thành phần.
-   Chuẩn hoá dữ liệu cảm biến theo schema NGSI-LD.
-   Cập nhật Docker Compose chạy đầy đủ dịch vụ.

### Fixed

-   Sửa lỗi cấu hình endpoint trong dịch vụ NGSI-LD.
-   Sửa lỗi mapping Observation → FeatureOfInterest.

------------------------------------------------------------------------

## \[v1.0.0\] --- Khởi tạo dự án

### Added

-   Tạo repository Smart Air NGSI-LD.
-   Thiết lập cấu trúc cơ bản: ETL, ontology, Docker.
-   Thêm mã khởi tạo entity NGSI-LD, script Python thu thập dữ liệu.
-   Docker Compose chạy Scorpio Broker, Node-RED, MongoDB, TimescaleDB,
    QuantumLeap.
-   Tạo mẫu dữ liệu chất lượng không khí: PM2.5, PM10, CO₂, nhiệt độ, độ
    ẩm.

### Changed

-   Cấu hình lại container Mercury + QuantumLeap.
-   Chuyển toàn bộ schema sang NGSI-LD JSON-LD.

### Fixed

-   Sửa lỗi không khởi động được Broker khi thiếu Redis.
-   Fix mismatch giữa context file và entity models.
