# CONTRIBUTING.md

# Hướng dẫn đóng góp -- Smart Air NGSI-LD

Cảm ơn bạn đã quan tâm và muốn đóng góp vào dự án **Smart Air
NGSI-LD**!\
Dự án luôn chào đón các đóng góp từ cộng đồng bao gồm sửa lỗi, thêm tính
năng mới, cải thiện tài liệu, tối ưu ETL, mở rộng ontology hoặc cải
thiện mô hình NGSI-LD.

------------------------------------------------------------------------

## 🚀 Cách thức đóng góp

### 1. Fork repository

Nhấn **Fork** ở góc trên bên phải để tạo bản sao của dự án vào tài khoản
của bạn.

### 2. Clone về máy

``` bash
git clone https://github.com/<your-username>/smart-air-ngsi-ld.git
cd smart-air-ngsi-ld
```

### 3. Tạo branch mới cho mỗi thay đổi

Tên branch nên rõ ràng theo chuẩn:

  ----------------------------------------------------------------------------------
  Loại               Format                      Ví dụ
  ------------------ --------------------------- -----------------------------------
  Tính năng mới      `feature/<tên-tính-năng>`   `feature/add-sensor-model`

  Sửa lỗi            `fix/<mô-tả-lỗi>`           `fix/context-mapping-observation`

  Cải thiện hiệu     `perf/<mô-tả>`              `perf/optimize-etl-pipeline`
  năng                                           

  Tài liệu           `docs/<mô-tả>`              `docs/update-readme`
  ----------------------------------------------------------------------------------

Ví dụ:

``` bash
git checkout -b feature/add-etl-converter
```

------------------------------------------------------------------------

## 🔍 Quy tắc viết code & cấu trúc dự án

### 1. Coding Style

-   Python: PEP8\
-   JSON-LD: format theo chuẩn NGSI-LD context\
-   Docker files: chuẩn hoá version & variable\
-   File YAML/Compose: indent 2 spaces\
-   Không push file rác (`.DS_Store`, `.idea/`, `__pycache__/`,...)

### 2. Commit Message chuẩn

Sử dụng **Conventional Commits**:

  Type          Ý nghĩa
  ------------- ------------------------------
  `feat:`       Tính năng mới
  `fix:`        Sửa lỗi
  `docs:`       Tài liệu
  `style:`      Format code, không đổi logic
  `refactor:`   Cải tổ lại code
  `perf:`       Tối ưu hiệu năng
  `test:`       Thêm/sửa test
  `chore:`      Công việc phụ trợ

Ví dụ commit tốt:

    feat(etl): add NGSI-LD converter for PM2.5 sensor
    fix(broker): correct Observation context mapping
    docs: update architecture diagram

------------------------------------------------------------------------

## 🧪 Kiểm tra trước khi gửi PR

✔ Không có lỗi syntax\
✔ JSON-LD hợp lệ\
✔ Docker Compose chạy ổn\
✔ ETL đẩy entity thành công vào Broker\
✔ Không commit file rác\
✔ Cập nhật tài liệu khi thay đổi logic

------------------------------------------------------------------------

## 📤 Gửi Pull Request (PR)

1.  Push branch lên repo cá nhân:

``` bash
git push origin feature/add-etl-converter
```

2.  Mở PR tại:\
    https://github.com/trungthanhcva2206/smart-air-ngsi-ld/pulls

3.  PR cần có:

-   Mô tả mục tiêu thay đổi\
-   File thay đổi\
-   Ảnh minh chứng test (nếu có)\
-   Link Issue

------------------------------------------------------------------------

## 🗂 Quy tắc mở Issue

### Báo lỗi (Bug Report)

-   Môi trường test\
-   Các bước tái tạo lỗi\
-   Log lỗi\
-   Mong đợi

### Đề xuất tính năng (Feature Request)

-   Mục tiêu\
-   Lợi ích\
-   Ảnh hưởng tới kiến trúc / entity\
-   Mockup (nếu có)

------------------------------------------------------------------------

## ❤️ Cảm ơn

Mọi đóng góp -- dù nhỏ -- đều rất quý giá và giúp dự án phát triển bền
vững.
