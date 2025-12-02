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
 * @Copyright (C) 2025 CHK. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
 */
"""

"""
Configuration module for ETL pipeline
"""
import os
from dotenv import load_dotenv

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ENV_PATH = os.path.join(ROOT_DIR, '.env')

load_dotenv(dotenv_path=ENV_PATH)

# OpenWeather API Configuration
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
OPENWEATHER_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'
OPENWEATHER_AIR_POLLUTION_URL = 'http://api.openweathermap.org/data/2.5/air_pollution'

# Orion-LD Configuration
ORION_LD_URL = os.getenv('ORION_LD_URL', 'http://localhost:1026')
ORION_LD_TENANT = os.getenv('ORION_LD_TENANT', 'hanoi')

# QuantumLeap Configuration
QUANTUMLEAP_EXTERNAL_URL = os.getenv('QUANTUMLEAP_EXTERNAL_URL', 'http://localhost:8668')
QUANTUMLEAP_INTERNAL_URL = os.getenv('QUANTUMLEAP_INTERNAL_URL', 'http://fiware-quantumleap:8668')
QUANTUMLEAP_ENABLED = os.getenv('QUANTUMLEAP_ENABLED', 'true').lower() == 'true'

# ETL Mode Configuration
# ETL_MODE: 'rest' (REST only), 'mqtt' (MQTT only), 'dual' (both paths)
ETL_MODE = os.getenv('ETL_MODE', 'dual').lower()

# MQTT Configuration (for IoT Agent path)
MQTT_BROKER_HOST = os.getenv('MQTT_BROKER_HOST', 'localhost')
MQTT_BROKER_PORT = int(os.getenv('MQTT_BROKER_PORT', '1883'))

# ETL Configuration
# Với 126 phường/xã: 126 locations × 2 APIs × 3 cycles/day = 756 requests/day < 1000 limit
# 24 hours / 3 cycles = 480 minutes (8 hours) per cycle
ETL_INTERVAL_MINUTES = int(os.getenv('ETL_INTERVAL_MINUTES', 480))

# Logging Configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# Danh sách đầy đủ 126 phường/xã của Hà Nội sau sáp nhập (2025)
# Tọa độ cacs tram quan trắc sẽ được load từ file GeoJSON
try:
    # try local import (same folder)
    from ..Data.districts_loader import HANOI_DISTRICTS
except Exception:
    # fallback to empty dict if loader not available
    HANOI_DISTRICTS = {}


# NGSI-LD Context
# Chỉ sử dụng các context ổn định và cần thiết
NGSI_LD_CONTEXT = [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld"
]
