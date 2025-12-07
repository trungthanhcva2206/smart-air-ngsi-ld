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
ETL Pipeline for multi-source air quality data:
1. OpenWeather API (baseline/fallback)
2. Smart Air stations (override OpenWeather)
3. ESP32 real sensors via MQTT/IoT Agent (final override)

Dual-path architecture:
1. Direct REST API to Orion-LD (existing path)
2. MQTT to IoT Agent to Orion-LD (new FIWARE compliant path)
"""
import logging
import time
import os
from typing import Dict
from .openweather_client import OpenWeatherClient
from .smart_air_client import SmartAirClient
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
        self.smart_air_client = SmartAirClient()
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
    
    
    def process_smart_air_override(self, district_name: str) -> bool:
        """
        Override AirQualityObserved entity with Smart Air data if available
        
        This runs AFTER OpenWeather to override pollutant values with more
        accurate Smart Air station data when available.
        
        Args:
            district_name: Name of the district (e.g., "Phuong Hoan Kiem")
        
        Returns:
            True if Smart Air data was applied, False otherwise
        """
        # Check if this district has a Smart Air station
        station_id = None
        for sid, mapped_district in self.smart_air_client.STATION_MAPPING.items():
            if mapped_district == district_name:
                station_id = sid
                break
        
        if not station_id:
            # logger.debug(f"No Smart Air station for {district_name}, skipping override")
            return False
        
        # Fetch Smart Air data
        logger.info(f"Applying Smart Air override for {district_name} (station: {station_id})")
        smart_air_data = self.smart_air_client.get_station_data(station_id)
        
        if not smart_air_data:
            logger.warning(f"Failed to fetch Smart Air data for {station_id}")
            return False
        
        # Extract pollutants from Smart Air response
        pollutants = self.smart_air_client.extract_pollutants(smart_air_data)
        
        if not pollutants:
            logger.warning(f"No pollutant data in Smart Air response for {station_id}")
            return False
        
        # Build NGSI-LD PATCH payload to update only pollutant attributes
        from .models import NGSILDEntity
        safe_name = NGSILDEntity._slugify_ascii(district_name)
        entity_id = f"urn:ngsi-ld:AirQualityObserved:Hanoi-{safe_name}"
        
        # Map Smart Air field names to NGSI-LD attribute names
        # EXCLUDE airQualityIndex because Smart Air uses different reference scale
        # EXCLUDE pm1 and um003 because they don't exist in standard FIWARE models
        field_mapping = {
            # Particulate Matter (standard fields only)
            # 'pm1': 'pm1',  # Not in Smart Data Models - excluded
            'pm25': 'pm2_5',
            'pm2_5': 'pm2_5',
            'pm10': 'pm10',
            # Gases
            'co': 'CO',
            'no2': 'NO2',
            'o3': 'O3',
            'so2': 'SO2',
            # Weather (override OpenWeather if available)
            'temperature': 'temperature',
            'relativehumidity': 'relativeHumidity',
            'humidity': 'relativeHumidity',
            # Ultrafine particles
            # 'um003': 'um003',  # Not in Smart Data Models - excluded
            # 'airqualityindex': 'airQualityIndex',  # Excluded - different scale than OpenWeather
            # 'aqi': 'airQualityIndex'  # Excluded - different scale than OpenWeather
        }
        
        update_payload = {}
        observed_at = smart_air_data.get('dateObserved', {}).get('value')
        
        for smart_field, value in pollutants.items():
            ngsi_field = field_mapping.get(smart_field)
            if ngsi_field:
                update_payload[ngsi_field] = NGSILDEntity.create_property(
                    value, 
                    observed_at=observed_at
                )
        
        if not update_payload:
            logger.warning(f"No mappable pollutants from Smart Air for {station_id}")
            return False
        
        # Update entity in Orion-LD (PATCH operation)
        success = self.orion_client.patch_entity_attributes(entity_id, update_payload)
        
        if success:
            logger.info(f"Smart Air override applied: {len(update_payload)} attributes updated")
            logger.debug(f"   Updated fields: {list(update_payload.keys())}")
            return True
        else:
            logger.error(f"Failed to apply Smart Air override for {entity_id}")
            return False
    
    
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
        """
        Run one complete ETL cycle with data priority:
        1. OpenWeather (baseline for all districts)
        2. Smart Air (override for districts with stations)
        3. ESP32 Sensors (final override via MQTT/IoT Agent)
        """
        logger.info("=" * 60)
        logger.info("Starting ETL cycle for all Hanoi districts")
        logger.info(f"Mode: {self.mode.upper()}")
        if self.mode in ['rest', 'dual']:
            logger.info("✓ REST → Orion-LD: ENABLED")
        if self.mode in ['mqtt', 'dual']:
            logger.info("✓ MQTT → IoT Agent → Orion-LD: ENABLED")
        logger.info("=" * 60)
        
        start_time = time.time()
        smart_air_success = 0
        
        # PHASE 1: Process all districts with OpenWeather (baseline)
        logger.info("\nPHASE 1: OpenWeather baseline data")
        for district_name, location in HANOI_DISTRICTS.items():
            try:
                self.process_district(district_name, location)
                # Small delay between districts to be nice to the API
                time.sleep(1)
            except Exception as e:
                logger.error(f"Unexpected error processing {district_name}: {e}")
                self.error_count += 1
        
        # PHASE 2: Override with Smart Air data (for districts with stations)
        logger.info("=" * 60)
        logger.info("PHASE 2: Smart Air data override")
        logger.info("=" * 60)
        logger.info(f"Checking {len(self.smart_air_client.STATION_MAPPING)} Smart Air stations...")
        for district_name in HANOI_DISTRICTS.keys():
            try:
                if self.process_smart_air_override(district_name):
                    smart_air_success += 1
                time.sleep(0.5)
            except Exception as e:
                logger.error(f"Smart Air override error for {district_name}: {e}")
        
        if smart_air_success == 0:
            logger.info("No Smart Air overrides applied (no matching districts or data unavailable)")
        
        # PHASE 3: ESP32 sensors override happens automatically via MQTT/IoT Agent
        # (no action needed here, sensors publish independently)
        logger.info("=" * 60)
        logger.info("PHASE 3: ESP32 real sensors (via MQTT/IoT Agent)")
        logger.info("=" * 60)
        logger.info("Real sensors will override automatically when they publish")
        
        elapsed_time = time.time() - start_time
        
        logger.info("=" * 60)
        logger.info("ETL cycle completed")
        logger.info(f"Total requests: {self.request_count}")
        logger.info(f"OpenWeather districts: {self.success_count}")
        logger.info(f"Smart Air overrides: {smart_air_success}")
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
