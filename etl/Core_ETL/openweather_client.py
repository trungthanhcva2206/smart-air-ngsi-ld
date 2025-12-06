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
 * @Copyright (C) 2025 TAA. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
 */
"""

"""
OpenWeather API Client
"""
import requests
import logging
from typing import Dict, Optional
from .config import (
    OPENWEATHER_API_KEY,
    OPENWEATHER_WEATHER_URL,
    OPENWEATHER_AIR_POLLUTION_URL
)

logger = logging.getLogger(__name__)


class OpenWeatherClient:
    """Client for OpenWeather API"""
    
    def __init__(self):
        if not OPENWEATHER_API_KEY:
            raise ValueError("OPENWEATHER_API_KEY is not set in environment variables")
        self.api_key = OPENWEATHER_API_KEY
    
    def get_weather_data(self, lat: float, lon: float) -> Optional[Dict]:
        """
        Fetch weather data from OpenWeather API
        
        Args:
            lat: Latitude
            lon: Longitude
            
        Returns:
            Weather data dictionary or None if request fails
        """
        try:
            params = {
                'lat': lat,
                'lon': lon,
                'appid': self.api_key,
                'units': 'metric'  # Celsius, meter/sec
            }
            
            response = requests.get(OPENWEATHER_WEATHER_URL, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"Successfully fetched weather data for ({lat}, {lon})")
            return data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching weather data: {e}")
            return None
    
    def get_air_quality_data(self, lat: float, lon: float) -> Optional[Dict]:
        """
        Fetch air quality data from OpenWeather API
        
        Args:
            lat: Latitude
            lon: Longitude
            
        Returns:
            Air quality data dictionary or None if request fails
        """
        try:
            params = {
                'lat': lat,
                'lon': lon,
                'appid': self.api_key
            }
            
            response = requests.get(OPENWEATHER_AIR_POLLUTION_URL, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"Successfully fetched air quality data for ({lat}, {lon})")
            return data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching air quality data: {e}")
            return None
