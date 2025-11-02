"""
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
"""

"""
Configuration module for ETL pipeline
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# OpenWeather API Configuration
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
OPENWEATHER_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'
OPENWEATHER_AIR_POLLUTION_URL = 'http://api.openweathermap.org/data/2.5/air_pollution'

# Orion-LD Configuration
ORION_LD_URL = os.getenv('ORION_LD_URL', 'http://localhost:1026')
ORION_LD_TENANT = os.getenv('ORION_LD_TENANT', 'hanoi')

# ETL Configuration
# Với 126 phường/xã: 126 locations × 2 APIs × 3 cycles/day = 756 requests/day < 1000 limit
# 24 hours / 3 cycles = 480 minutes (8 hours) per cycle
ETL_INTERVAL_MINUTES = int(os.getenv('ETL_INTERVAL_MINUTES', 480))

# Logging Configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# Danh sách đầy đủ 126 phường/xã của Hà Nội sau sáp nhập (2025)
# Tọa độ trung tâm hành chính chính xác
HANOI_DISTRICTS = {
 'An Khanh': {'address': 'Thôn Lũng Vân', 'lat': 21.015, 'lon': 105.71},
 'Ba Dinh': {'address': 'Số 2, phố Trúc Bạch', 'lat': 21.0356, 'lon': 105.8267},
 'Ba Vi': {'address': 'Thôn Lặt', 'lat': 21.0875, 'lon': 105.3758},
 'Bach Mai': {'address': 'Số 33 Đại Cồ Việt', 'lat': 20.9967, 'lon': 105.8456},
 'Bat Bat': {'address': 'Thôn Đan Thê', 'lat': 21.09, 'lon': 105.4},
 'Bat Trang': {'address': 'Thôn Đào Xuyên', 'lat': 20.99, 'lon': 105.96},
 'Binh Minh': {'address': 'Số 01 đường Bích Hòa - Cao Viên',
               'lat': 20.9,
               'lon': 105.72},
 'Bo De': {'address': 'Số 270, đường Ngọc Thuỵ',
           'lat': 21.0692,
           'lon': 105.9108},
 'Cau Giay': {'address': 'Số 96 Trần Thái Tông', 'lat': 21.0278, 'lon': 105.7942},
 'Chuong Duong': {'address': 'Thôn Kỳ Dương', 'lat': 20.865, 'lon': 105.64},
 'Chuong My': {'address': 'Số 102, tổ dân phố Bắc Sơn',
               'lat': 20.8964,
               'lon': 105.6411},
 'Chuyen My': {'address': 'Thôn Chính Vân', 'lat': 20.69, 'lon': 105.93},
 'Co Do': {'address': 'Thôn Mai Trai', 'lat': 21.07, 'lon': 105.42},
 'Cua Nam': {'address': 'Số 29 Quang Trung', 'lat': 21.0247, 'lon': 105.8478},
 'Da Phuc': {'address': 'Thôn Đức Hậu', 'lat': 21.27, 'lon': 105.85},
 'Dai Mo': {'address': 'Số 76 đường Trung Văn', 'lat': 21.0089, 'lon': 105.7511},
 'Dai Thanh': {'address': 'Thôn Quỳnh Đô', 'lat': 20.94, 'lon': 105.82},
 'Dai Xuyen': {'address': 'Thôn Hòa Thượng', 'lat': 20.67, 'lon': 105.91},
 'Dan Hoa': {'address': 'Số 45 khu trung tâm thôn Tảo Dương',
             'lat': 20.78,
             'lon': 105.74},
 'Dan Phuong': {'address': 'Số 105, phố Tây Sơn', 'lat': 21.1147, 'lon': 105.57},
 'Dinh Cong': {'address': 'Số 1 ngõ 282 đường Kim Giang',
               'lat': 20.9892,
               'lon': 105.84},
 'Dong Anh': {'address': 'Số 66, đường Cao Lỗ', 'lat': 21.1364, 'lon': 105.8394},
 'Dong Da': {'address': 'Số 59 phố Hoàng Cầu', 'lat': 21.0186, 'lon': 105.8239},
 'Dong Ngac': {'address': 'Phố Văn Hội, tổ dân phố số 2',
               'lat': 21.0833,
               'lon': 105.7833},
 'Duong Hoa': {'address': 'Thôn 5', 'lat': 21.035, 'lon': 105.7},
 'Duong Noi': {'address': 'Lô HC01 - khu A khu đô thị mới Dương Nội',
               'lat': 20.9533,
               'lon': 105.7403},
 'Doai Phuong': {'address': 'Thôn Phúc Lộc', 'lat': 21.15, 'lon': 105.48},
 'Gia Lam': {'address': 'Số 1, phố Thuận An', 'lat': 21.0194, 'lon': 105.9742},
 'Giang Vo': {'address': 'Số 525, phố Kim Mã', 'lat': 21.0261, 'lon': 105.8119},
 'Ha Bang': {'address': 'Thôn Sen Trì', 'lat': 20.98, 'lon': 105.55},
 'Ha Dong': {'address': 'Số 2, phố Hà Cầu', 'lat': 20.9708, 'lon': 105.775},
 'Hai Ba Trung': {'address': 'Số 30 Lê Đại Hành',
                  'lat': 21.0086,
                  'lon': 105.8525},
 'Hat Mon': {'address': 'Thôn 1 - Tam Thuấn', 'lat': 21.06, 'lon': 105.45},
 'Hoai Duc': {'address': 'Số 125 tỉnh lộ 422', 'lat': 21.0219, 'lon': 105.6842},
 'Hoa Lac': {'address': 'Thôn 1, Thạch Hòa', 'lat': 21.01, 'lon': 105.59},
 'Hoa Phu': {'address': 'Thôn Hòa Xá', 'lat': 20.88, 'lon': 105.7},
 'Hoa Xa': {'address': 'Thôn Đặng Giang', 'lat': 20.68, 'lon': 105.76},
 'Hoan Kiem': {'address': 'Số 126 Hàng Trống', 'lat': 21.0285, 'lon': 105.852},
 'Hoang Liet': {'address': 'Số 5, đường Linh Đường',
                'lat': 20.965,
                'lon': 105.865},
 'Hoang Mai': {'address': 'Số 8 ngõ 6 phố Bùi Huy Bích',
               'lat': 20.975,
               'lon': 105.85},
 'Hong Ha': {'address': 'Số 30 phố Tứ Liên', 'lat': 21.045, 'lon': 105.8508},
 'Hong Son': {'address': 'Đường Hồng Sơn, thôn Hạ Sở',
              'lat': 20.69,
              'lon': 105.65},
 'Hong Van': {'address': 'Thôn Nỏ Bạn', 'lat': 20.8811, 'lon': 105.905},
 'Hung Dao': {'address': 'Thôn Thị Ngoại', 'lat': 21.04, 'lon': 105.64},
 'Huong Son': {'address': 'Số 89, xóm 11, thôn Đục Khê',
               'lat': 20.65,
               'lon': 105.61},
 'Khuong Dinh': {'address': 'Số 33 Khương Hạ', 'lat': 20.98, 'lon': 105.8144},
 'Kien Hung': {'address': 'Lô C3, khu đô thị Văn Phú',
               'lat': 20.975,
               'lon': 105.765},
 'Kieu Phu': {'address': 'Thôn Phú Mỹ', 'lat': 21.05, 'lon': 105.66},
 'Kim Anh': {'address': 'Thôn Thắng Trí', 'lat': 21.31, 'lon': 105.89},
 'Kim Lien': {'address': 'Số 2 ngõ 4B phố Đặng Văn Ngữ',
              'lat': 21.0069,
              'lon': 105.83},
 'Lang': {'address': 'Số 79A ngõ 25 Vũ Ngọc Phan', 'lat': 21.0225, 'lon': 105.8075},
 'Lien Minh': {'address': 'Số 121, đường Nam Sông Hồng',
               'lat': 21.12,
               'lon': 105.72},
 'Linh Nam': {'address': 'Số 669 đường Lĩnh Nam', 'lat': 20.9656, 'lon': 105.872},
 'Long Bien': {'address': 'Số 199 đường Bát Khối', 'lat': 21.0536, 'lon': 105.91},
 'Me Linh': {'address': 'Thôn Tráng Việt', 'lat': 21.1747, 'lon': 105.7158},
 'Minh Chau': {'address': 'Thôn Chu Chàng', 'lat': 21.005, 'lon': 105.56},
 'My Duc': {'address': 'Số 2 phố Đại Đồng', 'lat': 20.7094, 'lon': 105.6708},
 'Nam Phu': {'address': 'Thôn 2 Đông Mỹ', 'lat': 20.915, 'lon': 105.895},
 'Nghia Do': {'address': 'Số 45 phố Nghĩa Tân', 'lat': 21.0308, 'lon': 105.7983},
 'Ngoc Ha': {'address': 'Số 25, phố Liễu Giai', 'lat': 21.0383, 'lon': 105.8203},
 'Ngoc Hoi': {'address': 'Thôn Đại Áng', 'lat': 20.8944, 'lon': 105.91},
 'Noi Bai': {'address': 'Thôn Thanh Nhàn', 'lat': 21.23, 'lon': 105.81},
 'O Cho Dua': {'address': 'Số 61 phố Hoàng Cầu', 'lat': 21.0192, 'lon': 105.8197},
 'O Dien': {'address': 'Số 3, đường Phan Xích', 'lat': 21.1, 'lon': 105.7},
 'Phu Cat': {'address': 'Thôn Đông Hạ', 'lat': 21.06, 'lon': 105.68},
 'Phu Dien': {'address': 'Tổ dân phố số 18', 'lat': 21.0789, 'lon': 105.7756},
 'Phu Dong': {'address': 'Thôn Thượng', 'lat': 21.05, 'lon': 105.95},
 'Phu Luong': {'address': 'Tổ dân phố 4', 'lat': 20.9656, 'lon': 105.7556},
 'Phu Nghia': {'address': 'Thôn Yên Kiện', 'lat': 20.86, 'lon': 105.58},
 'Phu Tho': {'address': 'Số 39 đường Lạc Trị', 'lat': 21.0964, 'lon': 105.4106},
 'Phu Thuong': {'address': 'Số 58 Phú Xá', 'lat': 21.0694, 'lon': 105.8089},
 'Phu Xuyen': {'address': 'Tiểu khu Thao Chính', 'lat': 20.7417, 'lon': 105.9153},
 'Phuc Loi': {'address': 'Tổ 6', 'lat': 21.0233, 'lon': 105.95},
 'Phuc Loc': {'address': 'Số 99 thôn Nam Võng', 'lat': 21.08, 'lon': 105.43},
 'Phuc Son': {'address': 'Khu trung tâm Mỹ Thành', 'lat': 20.67, 'lon': 105.63},
 'Phuc Thinh': {'address': 'Thôn Cán Khê', 'lat': 21.16, 'lon': 105.86},
 'Phuong Liet': {'address': 'Số 136 Nguyễn Ngọc Nại',
                 'lat': 20.985,
                 'lon': 105.835},
 'Phuong Duc': {'address': 'Thôn Phượng Vũ', 'lat': 20.715, 'lon': 105.945},
 'Quang Bi': {'address': 'Thôn Thái Hòa', 'lat': 20.92, 'lon': 105.58},
 'Quang Minh': {'address': 'Thôn Nội Đồng', 'lat': 21.185, 'lon': 105.7},
 'Quang Oai': {'address': 'Số 252 đường Quảng Oai',
               'lat': 21.0094,
               'lon': 105.605},
 'Quoc Oai': {'address': 'Số 10, đường 17/8', 'lat': 21.02, 'lon': 105.62},
 'Soc Son': {'address': 'Số 1 đường Núi Đôi', 'lat': 21.2456, 'lon': 105.8306},
 'Son Dong': {'address': 'Số 6, đường Tiền Yên', 'lat': 21.045, 'lon': 105.72},
 'Son Tay': {'address': 'Số 1 phố Phó Đức Chính',
             'lat': 21.1381,
             'lon': 105.5064},
 'Suoi Hai': {'address': 'Thôn Đức Thịnh', 'lat': 21.11, 'lon': 105.38},
 'Tam Hung': {'address': 'Số 65 thôn Gia Vĩnh', 'lat': 20.82, 'lon': 105.76},
 'Tay Ho': {'address': 'Số 657 Lạc Long Quân', 'lat': 21.0583, 'lon': 105.8242},
 'Tay Mo': {'address': 'Số 169 đường Đại Mỗ', 'lat': 20.9978, 'lon': 105.7311},
 'Tay Phuong': {'address': 'Thôn Yên', 'lat': 20.99, 'lon': 105.57},
 'Tay Tuu': {'address': 'Tổ dân phố Ngọa Long 2', 'lat': 21.085, 'lon': 105.7333},
 'Thach That': {'address': 'Đường 419', 'lat': 21.005, 'lon': 105.5281},
 'Thanh Liet': {'address': 'Thôn Triều Khúc', 'lat': 20.96, 'lon': 105.81},
 'Thanh Oai': {'address': 'Số 135 phố Kim Bài', 'lat': 20.8547, 'lon': 105.7794},
 'Thanh Tri': {'address': 'Số 12, Đường Nguyễn Bặc',
               'lat': 20.9528,
               'lon': 105.8881},
 'Thanh Xuan': {'address': 'Số 9 Khuất Duy Tiến',
                'lat': 20.995,
                'lon': 105.8053},
 'Thien Loc': {'address': 'Thôn Bầu', 'lat': 21.18, 'lon': 105.88},
 'Thu Lam': {'address': 'Thôn Thiết Bình', 'lat': 21.15, 'lon': 105.82},
 'Thuan An': {'address': 'Đường Dương Đức Hiền', 'lat': 21.03, 'lon': 105.99},
 'Thuong Cat': {'address': 'Số 55 đường Yên Nội', 'lat': 21.0917, 'lon': 105.7667},
 'Thuong Phuc': {'address': 'Thôn Mai Sao', 'lat': 20.8267, 'lon': 105.8783},
 'Thuong Tin': {'address': 'Số 1 đường Thượng Phúc',
                'lat': 20.8339,
                'lon': 105.8856},
 'Tien Thang': {'address': 'Thôn Văn Lôi', 'lat': 21.2, 'lon': 105.75},
 'Tran Phu': {'address': 'Thôn Thuận An', 'lat': 20.82, 'lon': 105.54},
 'Trung Gia': {'address': 'Thôn 4 - Hồng Kỳ', 'lat': 21.29, 'lon': 105.87},
 'Tu Liem': {'address': 'Số 125 đường Hồ Tùng Mậu',
             'lat': 21.0411,
             'lon': 105.7622},
 'Tung Thien': {'address': 'Số 66 đường Thanh Mỹ', 'lat': 21.13, 'lon': 105.52},
 'Tuong Mai': {'address': 'Số 2/224 đường Hoàng Mai',
               'lat': 20.9719,
               'lon': 105.8589},
 'Ung Hoa': {'address': 'Thôn Trạch Bái', 'lat': 20.7056, 'lon': 105.7744},
 'Ung Thien': {'address': 'Thôn Trung Thịnh', 'lat': 20.7, 'lon': 105.78},
 'Van Dinh': {'address': 'Thôn Hoàng Xá', 'lat': 20.74, 'lon': 105.72},
 'Van Mieu': {'address': 'Số 188 Kim Hoa', 'lat': 21.0278, 'lon': 105.835},
 'Vat Lai': {'address': 'Thôn Vật Lại 3', 'lat': 21.05, 'lon': 105.45},
 'Viet Hung': {'address': 'Số 1 phố Vạn Hạnh', 'lat': 21.0361, 'lon': 105.9333},
 'Vinh Hung': {'address': 'Số 177 phố Thanh Đàm',
               'lat': 20.9833,
               'lon': 105.8833},
 'Vinh Thanh': {'address': 'Thôn Đồng Nhân', 'lat': 21.17, 'lon': 105.9},
 'Vinh Tuy': {'address': 'Số 35 phố Vĩnh Tuy', 'lat': 21.0069, 'lon': 105.89},
 'Xuan Dinh': {'address': 'Phố Minh Tảo', 'lat': 21.0692, 'lon': 105.7528},
 'Xuan Mai': {'address': 'Thôn Trí Thủy', 'lat': 20.84, 'lon': 105.56},
 'Xuan Phuong': {'address': 'Số 28 đường Foresa 4B',
                 'lat': 21.0556,
                 'lon': 105.7311},
 'Yen Bai': {'address': 'Thôn Bặn', 'lat': 21.12, 'lon': 105.36},
 'Yen Hoa': {'address': 'Số 231 Nguyễn Ngọc Vũ', 'lat': 21.0133, 'lon': 105.7944},
 'Yen Lang': {'address': 'Thôn 1 - Thạch Đà', 'lat': 21.19, 'lon': 105.73},
 'Yen Nghia': {'address': 'Tổ dân phố 10', 'lat': 20.9378, 'lon': 105.7289},
 'Yen So': {'address': 'Số 8 ngõ 6 phố Bùi Huy Bích',
            'lat': 20.9556,
            'lon': 105.8444},
 'Yen Xuan': {'address': 'Thôn 3, Yên Bình', 'lat': 21.03, 'lon': 105.61}
}

# NGSI-LD Context
# Chỉ sử dụng các context ổn định và cần thiết
NGSI_LD_CONTEXT = [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld"
]
