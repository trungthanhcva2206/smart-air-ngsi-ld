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
ETL Pipeline for OpenWeather to Orion-LD
"""
import logging
import time
from typing import Dict
from openweather_client import OpenWeatherClient
from orion_client import OrionLDClient
from models import WeatherObservedEntity, AirQualityObservedEntity
from config import HANOI_DISTRICTS

logger = logging.getLogger(__name__)


class ETLPipeline:
    """ETL Pipeline to extract data from OpenWeather and load to Orion-LD"""
    
    def __init__(self):
        self.weather_client = OpenWeatherClient()
        self.orion_client = OrionLDClient()
        self.request_count = 0
        self.success_count = 0
        self.error_count = 0
    
    def process_district(self, district_name: str, location: Dict) -> bool:
        """
        Process a single district: fetch data and send to Orion-LD
        
        Args:
            district_name: Name of the district
            location: Dictionary with 'lat' and 'lon'
            
        Returns:
            True if successful, False otherwise
        """
        logger.info(f"Processing district: {district_name}")
        
        lat = location['lat']
        lon = location['lon']
        
        # Extract: Fetch weather data
        weather_data = self.weather_client.get_weather_data(lat, lon)
        self.request_count += 1
        
        if not weather_data:
            logger.error(f"Failed to fetch weather data for {district_name}")
            self.error_count += 1
            return False
        
        # Small delay to avoid rate limiting
        time.sleep(0.5)
        
        # Extract: Fetch air quality data
        air_quality_data = self.weather_client.get_air_quality_data(lat, lon)
        self.request_count += 1
        
        if not air_quality_data:
            logger.error(f"Failed to fetch air quality data for {district_name}")
            self.error_count += 1
            return False
        
        # Transform: Create NGSI-LD entities
        weather_entity = WeatherObservedEntity.create(
            district_name, location, weather_data
        )
        # Pass weather_data to air quality entity for additional context
        air_quality_entity = AirQualityObservedEntity.create(
            district_name, location, air_quality_data, weather_data
        )
        
        # Load: Send to Orion-LD
        weather_success = self.orion_client.create_or_update_entity(weather_entity)
        air_quality_success = self.orion_client.create_or_update_entity(air_quality_entity)
        
        if weather_success and air_quality_success:
            logger.info(f"Successfully processed {district_name}")
            self.success_count += 1
            return True
        else:
            logger.error(f"Failed to send entities to Orion-LD for {district_name}")
            self.error_count += 1
            return False
    
    def run_etl_cycle(self):
        """Run one complete ETL cycle for all districts"""
        logger.info("=" * 60)
        logger.info("Starting ETL cycle for all Hanoi districts")
        logger.info("=" * 60)
        
        start_time = time.time()
        
        for district_name, location in HANOI_DISTRICTS.items():
            try:
                self.process_district(district_name, location)
                # Small delay between districts to be nice to the API
                time.sleep(1)
            except Exception as e:
                logger.error(f"Unexpected error processing {district_name}: {e}")
                self.error_count += 1
        
        elapsed_time = time.time() - start_time
        
        logger.info("=" * 60)
        logger.info("ETL cycle completed")
        logger.info(f"Total requests: {self.request_count}")
        logger.info(f"Successful districts: {self.success_count}")
        logger.info(f"Failed districts: {self.error_count}")
        logger.info(f"Elapsed time: {elapsed_time:.2f} seconds")
        logger.info("=" * 60)
    
    def get_statistics(self) -> Dict:
        """Get ETL statistics"""
        return {
            'total_requests': self.request_count,
            'successful_districts': self.success_count,
            'failed_districts': self.error_count
        }
