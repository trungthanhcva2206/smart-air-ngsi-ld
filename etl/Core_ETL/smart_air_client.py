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
 * @Project Air Track NGSI-LD
 * @Authors 
 *    - TT (trungthanhcva2206@gmail.com)
 *    - Tankchoi (tadzltv22082004@gmail.com)
 *    - Panh (panh812004.apn@gmail.com)
 * @Copyright (C) 2025 TAA. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
 */
"""

"""
Smart Air API Client for fetching real-time air quality data
API: https://opendata.quanglv.com/api/airquality/latest
"""
import requests
import logging
from typing import Dict, Optional, List

logger = logging.getLogger(__name__)


class SmartAirClient:
    """Client for Smart Air Quality API"""
    
    BASE_URL = "https://opendata.quanglv.com/api/airquality/latest"
    REQUEST_TIMEOUT = 10  # seconds
    
    # Mapping: Smart Air station ID → Hanoi district name
    STATION_MAPPING = {
        "station-congvienhodh": "Phường Thanh Xuân",  # Công viên hồ điều hòa - Thanh Xuân
        "station-nguyenvancu": "Phường Long Biên",   # Nguyễn Văn Cừ - Long Biên
        "station-oceanpark": "Xã Gia Lâm",     # Ocean Park - Gia Lâm
        # Thêm stations khác tại đây
    }
    
    def __init__(self):
        """Initialize Smart Air client"""
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Smart-Air-NGSI-LD-ETL/1.0'
        })
    
    def get_station_data(self, station_id: str) -> Optional[Dict]:
        """
        Fetch air quality data for a specific station
        
        Args:
            station_id: Smart Air station ID (e.g., "station-hanoi-nguyenvancu")
        
        Returns:
            Dict containing NGSI-LD formatted data or None if error
        """
        try:
            params = {'stationId': station_id}
            
            logger.debug(f"Fetching Smart Air data for station: {station_id}")
            response = self.session.get(
                self.BASE_URL,
                params=params,
                timeout=self.REQUEST_TIMEOUT
            )
            response.raise_for_status()
            
            data = response.json()
            
            # Validate response structure
            if not self._validate_response(data):
                logger.warning(f"Invalid response structure from Smart Air for {station_id}")
                return None
            
            logger.info(f"Fetched Smart Air data for {station_id}")
            return data
            
        except requests.exceptions.Timeout:
            logger.error(f"Timeout fetching Smart Air data for {station_id}")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching Smart Air data for {station_id}: {e}")
            return None
        except ValueError as e:
            logger.error(f"Invalid JSON response from Smart Air for {station_id}: {e}")
            return None
    
    def get_all_stations_data(self) -> Dict[str, Dict]:
        """
        Fetch data for all configured stations
        
        Returns:
            Dict mapping station_id → data
        """
        results = {}
        
        for station_id in self.STATION_MAPPING.keys():
            data = self.get_station_data(station_id)
            if data:
                results[station_id] = data
        
        logger.info(f"Fetched Smart Air data for {len(results)}/{len(self.STATION_MAPPING)} stations")
        return results
    
    def get_district_name(self, station_id: str) -> Optional[str]:
        """
        Get Hanoi district name from Smart Air station ID
        
        Args:
            station_id: Smart Air station ID
        
        Returns:
            District name (e.g., "Phuong Hoan Kiem") or None
        """
        return self.STATION_MAPPING.get(station_id)
    
    def _validate_response(self, data: Dict) -> bool:
        """
        Validate Smart Air API response structure
        
        Args:
            data: Response data from API
        
        Returns:
            True if valid, False otherwise
        """
        required_fields = ['type', 'dateObserved', 'location']
        
        # Check if all required fields exist
        if not all(field in data for field in required_fields):
            return False
        
        # Check if type is AirQualityObserved
        if data.get('type') != 'AirQualityObserved':
            return False
        
        # Check if location has coordinates
        location = data.get('location', {})
        if location.get('type') != 'GeoProperty':
            return False
        
        coordinates = location.get('value', {}).get('coordinates')
        if not coordinates or len(coordinates) != 2:
            return False
        
        return True
    
    def extract_pollutants(self, data: Dict) -> Dict[str, float]:
        """
        Extract pollutant and weather values from Smart Air response
        
        Args:
            data: Smart Air NGSI-LD response
        
        Returns:
            Dict mapping pollutant/weather name → value
        """
        pollutants = {}
        
        # List of fields to extract (case-insensitive)
        pollutant_fields = [
            'PM1', 'pm1',
            'PM25', 'pm2_5', 'PM2.5',
            'PM10', 'pm10',
            'CO', 'co',
            'NO2', 'no2',
            'O3', 'o3',
            'SO2', 'so2',
            'TEMPERATURE', 'temperature',
            'RELATIVEHUMIDITY', 'relativeHumidity', 'humidity',
            'UM003',  # Ultrafine particles count
            'airQualityIndex', 'AQI'
        ]
        
        for field in pollutant_fields:
            if field in data:
                prop = data[field]
                if isinstance(prop, dict) and 'value' in prop:
                    # Normalize field names to lowercase with underscore
                    normalized_name = field.lower().replace('.', '_')
                    pollutants[normalized_name] = prop['value']
        
        logger.debug(f"Extracted {len(pollutants)} fields from Smart Air: {list(pollutants.keys())}")
        return pollutants
    
    def close(self):
        """Close the session"""
        self.session.close()
