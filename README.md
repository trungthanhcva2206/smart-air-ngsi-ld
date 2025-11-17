# Smart Air NGSI‑LD

Hệ thống theo dõi và quản lý dữ liệu chất lượng không khí dựa trên
NGSI‑LD

## Giới thiệu

Dự án Smart Air NGSI‑LD xây dựng giải pháp thu thập, lưu trữ và phân
tích dữ liệu không khí (PM2.5, PM10, CO₂, nhiệt độ, độ ẩm) theo mô hình
ngữ cảnh (NGSI‑LD) và Linked Data.\
Hệ thống hỗ trợ quản lý cảm biến, quan sát và đối tượng quan tâm theo
chuẩn ontology như SOSA/SSN.

## Tính năng chính

-   Thiết lập Broker NGSI‑LD để quản lý entity/ngữ cảnh.\
-   Định nghĩa các entity: Sensor, Observation, ObservedProperty,
    FeatureOfInterest.\
-   Pipeline ETL chuyển dữ liệu cảm biến thô thành NGSI‑LD JSON‑LD.\
-   Hỗ trợ lưu trữ dữ liệu thời gian thực (Time Series DB).\
-   Cấu hình Docker Compose để chạy toàn bộ hệ thống.

## Kiến trúc hệ thống

Sensor → ETL → NGSI‑LD Broker → Database / Time Series → Dashboard

## Hướng dẫn cài đặt

1.  Clone:

    ``` bash
    git clone https://github.com/trungthanhcva2206/smart-air-ngsi-ld.git
    cd smart-air-ngsi-ld
    ```

2.  Cài Docker & Docker Compose\

3.  Chạy:

    ``` bash
    docker-compose up -d
    ```

## Cấu trúc thư mục

    /ontology/ — định nghĩa entity & context  
    /broker/   — cấu hình broker  
    /etl/      — script thu thập dữ liệu  
    /docker/   — docker-compose  
    /frontend/ — giao diện (nếu có)

## Công nghệ sử dụng

-   NGSI‑LD\
-   JSON‑LD\
-   Docker\
-   MongoDB / TimescaleDB\
-   Python / NodeJS\
-   SOSA/SSN Ontology

## Đóng góp

-   Fork và tạo nhánh `feature/...` hoặc `fix/...`\
-   Tạo Pull Request kèm mô tả rõ ràng\
-   Tuân thủ cấu trúc mã nguồn và conventions của dự án

## License

Apache 2.0 License

## Liên hệ

-   **Trung Thành** -- trungthanhcva2206@gmail.com\
-   **Tadz** -- tadzltv22082004@gmail.com\
-   **Panh** -- panh812004.apn@gmail.com
