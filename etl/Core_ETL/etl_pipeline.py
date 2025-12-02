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
ETL Pipeline for OpenWeather to Orion-LD
Dual-path architecture:
1. Direct REST API to Orion-LD (existing path)
2. MQTT to IoT Agent to Orion-LD (new FIWARE compliant path)
"""
import logging
import time
import os
from typing import Dict
from .openweather_client import OpenWeatherClient
from .orion_client import OrionLDClient
from .models import WeatherObservedEntity, AirQualityObservedEntity
from .mqtt_publisher import MQTTPublisher
from .config import HANOI_DISTRICTS, ETL_MODE, MQTT_BROKER_HOST, MQTT_BROKER_PORT

logger = logging.getLogger(__name__)


class ETLPipeline:
    """
    ETL Pipeline with configurable data paths:
    - 'rest': REST API → Orion-LD only
    - 'mqtt': MQTT → IoT Agent → Orion-LD only (FIWARE compliant)
    - 'dual': Both paths (default)
    """
    
    def __init__(self, mode: str = None):
        """
        Initialize ETL Pipeline
        
        Args:
            mode: ETL mode ('rest', 'mqtt', 'dual'). Defaults to ETL_MODE from config.
        """
        self.mode = mode or ETL_MODE
        self.weather_client = OpenWeatherClient()
        self.orion_client = OrionLDClient()
        self.request_count = 0
        self.success_count = 0
        self.error_count = 0
        
        # Validate mode
        if self.mode not in ['rest', 'mqtt', 'dual']:
            logger.warning(f"Invalid mode '{self.mode}', defaulting to 'dual'")
            self.mode = 'dual'
        
        # MQTT Publisher (for 'mqtt' or 'dual' mode)
        self.mqtt_publisher = None
        self.mqtt_enabled = self.mode in ['mqtt', 'dual']
        
        if self.mqtt_enabled:
            try:
                self.mqtt_publisher = MQTTPublisher(MQTT_BROKER_HOST, MQTT_BROKER_PORT)
                logger.info(f"MQTT publishing ENABLED (mode: {self.mode})")
            except Exception as e:
                logger.warning(f"MQTT publisher failed to initialize: {e}")
                if self.mode == 'mqtt':
                    logger.error("Cannot run in 'mqtt' mode without MQTT broker")
                    raise
                logger.warning("Falling back to REST-only mode")
                self.mode = 'rest'
                self.mqtt_enabled = False
        
        logger.info(f"ETL Pipeline initialized in '{self.mode}' mode")
    
    
    def process_district(self, district_name: str, location: Dict) -> bool:
        """
        Process a single district based on ETL mode:
        - 'rest': REST API → Orion-LD
        - 'mqtt': MQTT → IoT Agent → Orion-LD
        - 'dual': Both paths
        
        Args:
            district_name: Name of the district
            location: Dictionary with 'lat' and 'lon'
            
        Returns:
            True if successful, False otherwise
        """
        logger.info(f"Processing district: {district_name} (mode: {self.mode})")
        
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
        
        rest_success = True
        mqtt_success = True
        
        # ============================================================
        # PATH 1: REST API → Orion-LD
        # ============================================================
        if self.mode in ['rest', 'dual']:
            # Transform: Create NGSI-LD entities
            weather_entity = WeatherObservedEntity.create(
                district_name, location, weather_data
            )
            air_quality_entity = AirQualityObservedEntity.create(
                district_name, location, air_quality_data, weather_data
            )
            
            # Load: Send to Orion-LD via REST
            weather_success = self.orion_client.create_or_update_entity(weather_entity)
            air_quality_success = self.orion_client.create_or_update_entity(air_quality_entity)
            rest_success = weather_success and air_quality_success
        
        # ============================================================
        # PATH 2: MQTT → IoT Agent → Orion-LD
        # ============================================================
        if self.mode in ['mqtt', 'dual'] and self.mqtt_publisher:
            try:
                weather_mqtt_ok = self.mqtt_publisher.publish_weather_measurement(
                    district_name, weather_data
                )
                air_mqtt_ok = self.mqtt_publisher.publish_air_quality_measurement(
                    district_name, air_quality_data, weather_data
                )
                mqtt_success = weather_mqtt_ok and air_mqtt_ok
            except Exception as e:
                logger.error(f"MQTT publish error for {district_name}: {e}")
                mqtt_success = False
        
        # ============================================================
        # Determine overall success based on mode
        # ============================================================
        if self.mode == 'rest':
            success = rest_success
        elif self.mode == 'mqtt':
            success = mqtt_success
        else:  # dual
            success = rest_success or mqtt_success  # At least one path succeeds
        
        if success:
            logger.info(f"Successfully processed {district_name}")
            self.success_count += 1
            return True
        else:
            logger.error(f"Failed to process {district_name}")
            self.error_count += 1
            return False
    
    
    def run_etl_cycle(self):
        """Run one complete ETL cycle for all districts"""
        logger.info("=" * 60)
        logger.info("Starting ETL cycle for all Hanoi districts")
        logger.info(f"Mode: {self.mode.upper()}")
        if self.mode in ['rest', 'dual']:
            logger.info("✓ REST → Orion-LD: ENABLED")
        if self.mode in ['mqtt', 'dual']:
            logger.info("✓ MQTT → IoT Agent → Orion-LD: ENABLED")
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
    
    def cleanup(self):
        """Cleanup resources"""
        if self.mqtt_publisher:
            self.mqtt_publisher.disconnect()
    
    def get_statistics(self) -> Dict:
        """Get ETL statistics"""
        return {
            'total_requests': self.request_count,
            'successful_districts': self.success_count,
            'failed_districts': self.error_count
        }
