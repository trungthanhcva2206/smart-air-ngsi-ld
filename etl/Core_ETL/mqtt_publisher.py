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
MQTT Publisher for FIWARE IoT Agent JSON
Publishes RAW measurements from OpenWeather to MQTT broker
"""

import json
import logging
from typing import Dict, Optional
import paho.mqtt.client as mqtt
from datetime import datetime
from .config import ORION_LD_TENANT
from .models import NGSILDEntity

logger = logging.getLogger(__name__)


class MQTTPublisher:
    """
    MQTT Publisher for sending RAW measurements to IoT Agent
    """
    
    def __init__(self, broker_host: str = "localhost", broker_port: int = 1883):
        """
        Initialize MQTT Publisher
        
        Args:
            broker_host: MQTT broker hostname
            broker_port: MQTT broker port
        """
        self.broker_host = broker_host
        self.broker_port = broker_port
        self.client = mqtt.Client(client_id=f"etl_publisher_{datetime.utcnow().timestamp()}")
        self.connected = False
        
        # Set callbacks
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_publish = self._on_publish
        
        # Connect to broker
        try:
            self.client.connect(self.broker_host, self.broker_port, keepalive=60)
            self.client.loop_start()
            logger.info(f"MQTT Publisher initialized: {broker_host}:{broker_port}")
        except Exception as e:
            logger.error(f"Failed to connect to MQTT broker: {e}")
    
    def _on_connect(self, client, userdata, flags, rc):
        """Callback when connected to MQTT broker"""
        if rc == 0:
            self.connected = True
            logger.info("Connected to MQTT broker")
        else:
            logger.error(f"Connection failed with code {rc}")
    
    def _on_disconnect(self, client, userdata, rc):
        """Callback when disconnected from MQTT broker"""
        self.connected = False
        if rc != 0:
            logger.warning(f"Unexpected disconnect from MQTT broker: {rc}")
    
    def _on_publish(self, client, userdata, mid):
        """Callback when message is published"""
        logger.debug(f"Message published (mid: {mid})")
    
    def prepare_weather_raw_payload(self, district_name: str, weather_data: Dict) -> Dict:
        """
        Prepare RAW weather payload for IoT Agent
        Minimal processing - keep OpenWeather structure
        
        Args:
            district_name: Name of the district
            weather_data: Raw weather data from OpenWeather
            
        Returns:
            RAW payload dict
        """
        # Match provisioning script format: lowercase + hyphens + Vietnamese normalization
        safe_name = district_name.replace(' ', '-').lower()
        safe_name = (safe_name
            .replace('à', 'a').replace('á', 'a').replace('ả', 'a').replace('ã', 'a').replace('ạ', 'a')
            .replace('ă', 'a').replace('ắ', 'a').replace('ằ', 'a').replace('ẳ', 'a').replace('ẵ', 'a').replace('ặ', 'a')
            .replace('â', 'a').replace('ấ', 'a').replace('ầ', 'a').replace('ẩ', 'a').replace('ẫ', 'a').replace('ậ', 'a')
            .replace('è', 'e').replace('é', 'e').replace('ẻ', 'e').replace('ẽ', 'e').replace('ẹ', 'e')
            .replace('ê', 'e').replace('ế', 'e').replace('ề', 'e').replace('ể', 'e').replace('ễ', 'e').replace('ệ', 'e')
            .replace('đ', 'd')
            .replace('ì', 'i').replace('í', 'i').replace('ỉ', 'i').replace('ĩ', 'i').replace('ị', 'i')
            .replace('ò', 'o').replace('ó', 'o').replace('ỏ', 'o').replace('õ', 'o').replace('ọ', 'o')
            .replace('ô', 'o').replace('ố', 'o').replace('ồ', 'o').replace('ổ', 'o').replace('ỗ', 'o').replace('ộ', 'o')
            .replace('ơ', 'o').replace('ớ', 'o').replace('ờ', 'o').replace('ở', 'o').replace('ỡ', 'o').replace('ợ', 'o')
            .replace('ù', 'u').replace('ú', 'u').replace('ủ', 'u').replace('ũ', 'u').replace('ụ', 'u')
            .replace('ư', 'u').replace('ứ', 'u').replace('ừ', 'u').replace('ử', 'u').replace('ữ', 'u').replace('ự', 'u')
            .replace('ỳ', 'y').replace('ý', 'y').replace('ỷ', 'y').replace('ỹ', 'y').replace('ỵ', 'y')
        )
        
        # Extract and normalize data
        main = weather_data.get('main', {})
        wind = weather_data.get('wind', {})
        clouds = weather_data.get('clouds', {})
        visibility = weather_data.get('visibility', 10000)
        
        # Match models.py WeatherObservedEntity exactly
        # API returns Celsius (units=metric), keep as float
        temp_celsius = main.get('temp', 0)
        feels_like_celsius = main.get('feels_like', 0)
        wind_speed = wind.get('speed', 0)
        observed_at = datetime.utcnow().isoformat(timespec='milliseconds') + 'Z'
        
        # Illuminance estimation map (from models.py)
        illuminance_map = {
            'Clear': 100000, 'Clouds': 50000, 'Rain': 10000, 'Drizzle': 15000,
            'Thunderstorm': 5000, 'Snow': 20000, 'Mist': 30000, 'Smoke': 25000,
            'Haze': 40000, 'Dust': 35000, 'Fog': 10000, 'Sand': 30000,
            'Ash': 20000, 'Squall': 15000, 'Tornado': 5000
        }
        weather_type = weather_data.get('weather', [{}])[0].get('main', 'Clouds')
        
        raw_payload = {
            # Device ID for MQTT routing (not sent to Orion)
            "device_id": f"weather-{safe_name}",
            
            # Station information (match models.py)
            "name": f"Weather-{NGSILDEntity._slugify_ascii(district_name)}",
            "description": f"Weather observation station in {NGSILDEntity._ascii_preserve_spaces(district_name)}, Hanoi",
            "stationName": NGSILDEntity._slugify_ascii(district_name),
            "stationCode": f"HN-{NGSILDEntity._slugify_ascii(district_name).upper()}",
            
            # Observation time
            "dateObserved": observed_at,
            
            # Temperature measurements - Keep as float
            "temperature": round(temp_celsius, 2),
            "feelsLikeTemperature": round(feels_like_celsius, 2),
            
            # Atmospheric measurements
            "pressure": int(round(main.get('pressure', 0))),
            "humidity": main.get('humidity', 0),
            
            # Weather conditions
            "weatherType": weather_data.get('weather', [{}])[0].get('main', ''),
            "weatherDescription": weather_data.get('weather', [{}])[0].get('description', ''),
            
            # Wind measurements
            "windSpeed": round(wind_speed, 2),
            "windDirection": wind.get('deg', 0),
            
            # Visibility and cloudiness
            "visibility": visibility,
            "cloudiness": clouds.get('all', 0),
            
            # Precipitation (mm as float)
            "precipitation": round(weather_data.get('rain', {}).get('1h', 0.001), 2) if 'rain' in weather_data and '1h' in weather_data['rain'] else (round(weather_data.get('rain', {}).get('3h', 0.001) / 3, 2) if 'rain' in weather_data and '3h' in weather_data['rain'] else 0.001),
            
            # Pressure tendency (placeholder)
            "pressureTendency": 0.001,
            
            # Illuminance (estimated from weather condition)
            "illuminance": illuminance_map.get(weather_type, 50000),
            
            # Location
            "latitude": float(weather_data.get('coord', {}).get('lat', 0)),
            "longitude": float(weather_data.get('coord', {}).get('lon', 0)),
            
            # Device reference
            "refDevice": f"urn:ngsi-ld:Device:WeatherSensor-{NGSILDEntity._slugify_ascii(district_name)}"
        }
        
        return raw_payload
    
    def prepare_air_quality_raw_payload(self, district_name: str, 
                                       air_quality_data: Dict, 
                                       weather_data: Dict) -> Dict:
        """
        Prepare RAW air quality payload for IoT Agent
        Minimal processing - keep OpenWeather structure
        
        Args:
            district_name: Name of the district
            air_quality_data: Raw air quality data from OpenWeather
            weather_data: Raw weather data (for temperature)
            
        Returns:
            RAW payload dict
        """
        # Match provisioning script format: lowercase + hyphens + Vietnamese normalization
        safe_name = district_name.replace(' ', '-').lower()
        safe_name = (safe_name
            .replace('à', 'a').replace('á', 'a').replace('ả', 'a').replace('ã', 'a').replace('ạ', 'a')
            .replace('ă', 'a').replace('ằ', 'a').replace('ắ', 'a').replace('ẳ', 'a').replace('ẵ', 'a').replace('ặ', 'a')
            .replace('â', 'a').replace('ầ', 'a').replace('ấ', 'a').replace('ẩ', 'a').replace('ẫ', 'a').replace('ậ', 'a')
            .replace('è', 'e').replace('é', 'e').replace('ẻ', 'e').replace('ẽ', 'e').replace('ẹ', 'e')
            .replace('ê', 'e').replace('ề', 'e').replace('ế', 'e').replace('ể', 'e').replace('ễ', 'e').replace('ệ', 'e')
            .replace('ì', 'i').replace('í', 'i').replace('ỉ', 'i').replace('ĩ', 'i').replace('ị', 'i')
            .replace('ò', 'o').replace('ó', 'o').replace('ỏ', 'o').replace('õ', 'o').replace('ọ', 'o')
            .replace('ô', 'o').replace('ồ', 'o').replace('ố', 'o').replace('ổ', 'o').replace('ỗ', 'o').replace('ộ', 'o')
            .replace('ơ', 'o').replace('ờ', 'o').replace('ớ', 'o').replace('ở', 'o').replace('ỡ', 'o').replace('ợ', 'o')
            .replace('ù', 'u').replace('ú', 'u').replace('ủ', 'u').replace('ũ', 'u').replace('ụ', 'u')
            .replace('ư', 'u').replace('ừ', 'u').replace('ứ', 'u').replace('ử', 'u').replace('ữ', 'u').replace('ự', 'u')
            .replace('ỳ', 'y').replace('ý', 'y').replace('ỷ', 'y').replace('ỹ', 'y').replace('ỵ', 'y')
            .replace('đ', 'd')
        )
        
        # Extract components
        components = air_quality_data.get('list', [{}])[0].get('components', {})
        main_aqi = air_quality_data.get('list', [{}])[0].get('main', {})
        aqi = main_aqi.get('aqi', 1)
        observed_at = datetime.utcnow().isoformat(timespec='milliseconds') + 'Z'
        
        # AQI levels mapping (from models.py)
        aqi_levels = {1: "good", 2: "fair", 3: "moderate", 4: "poor", 5: "very poor"}
        
        # CO level classification (from models.py)
        co_value = components.get('co', 0)
        if co_value < 4400:
            co_level = "good"
        elif co_value < 9400:
            co_level = "moderate"
        elif co_value < 12400:
            co_level = "poor"
        else:
            co_level = "very poor"
        
        # Weather context
        temp_celsius = weather_data.get('main', {}).get('temp', 0)
        
        # Match models.py AirQualityObservedEntity exactly
        raw_payload = {
            # Device ID for MQTT routing (not sent to Orion)
            "device_id": f"airquality-{safe_name}",
            
            # Station information (match models.py)
            "name": f"AirQuality-{NGSILDEntity._slugify_ascii(district_name)}",
            "description": f"Air quality monitoring station in {NGSILDEntity._ascii_preserve_spaces(district_name)}, Hanoi",
            "stationName": NGSILDEntity._slugify_ascii(district_name),
            "stationCode": f"HN-AQ-{NGSILDEntity._slugify_ascii(district_name).upper()}",
            
            # Observation time
            "dateObserved": observed_at,
            
            # Air Quality Index
            "aqi": aqi,
            "airQualityLevel": aqi_levels.get(aqi, "unknown"),
            
            # Pollutants (concentrations in μg/m³)
            "co": round(components.get('co', 0.001), 2),
            "no": round(components.get('no', 0.001), 2),
            "no2": round(components.get('no2', 0.001), 2),
            "nox": round(components.get('no', 0.001) + components.get('no2', 0.001), 2),
            "o3": round(components.get('o3', 0.001), 2),
            "so2": round(components.get('so2', 0.001), 2),
            "pm2_5": round(components.get('pm2_5', 0.001), 2),
            "pm10": round(components.get('pm10', 0.001), 2),
            "nh3": round(components.get('nh3', 0.001), 2),
            
            # Data quality
            "reliability": 0.85,
            
            # CO level classification
            "coLevel": co_level,
            
            # Weather context
            "temperature": round(temp_celsius, 2),
            "humidity": weather_data.get('main', {}).get('humidity', 0),
            "windSpeed": round(weather_data.get('wind', {}).get('speed', 0), 2),
            "windDirection": weather_data.get('wind', {}).get('deg', 0),
            "precipitation": round(weather_data.get('rain', {}).get('1h', 0.001), 2) if 'rain' in weather_data and '1h' in weather_data['rain'] else (round(weather_data.get('rain', {}).get('3h', 0.001) / 3, 2) if 'rain' in weather_data and '3h' in weather_data['rain'] else 0.001),
            
            # Location
            "latitude": float(air_quality_data.get('coord', {}).get('lat', 0)),
            "longitude": float(air_quality_data.get('coord', {}).get('lon', 0)),
            
            # Device references
            "refDevice": f"urn:ngsi-ld:Device:AirQualitySensor-{NGSILDEntity._slugify_ascii(district_name)}",
            "refPointOfInterest": f"urn:ngsi-ld:PointOfInterest:Hanoi-{NGSILDEntity._slugify_ascii(district_name)}"
        }
        
        return raw_payload
    
    def publish_weather_measurement(self, district_name: str, weather_data: Dict) -> bool:
        """
        Publish weather measurement to MQTT
        
        Args:
            district_name: Name of the district
            weather_data: Raw weather data from OpenWeather
            
        Returns:
            True if published successfully
        """
        if not self.connected:
            logger.warning("MQTT not connected, skipping publish")
            return False
        
        try:
            # Prepare RAW payload
            raw_payload = self.prepare_weather_raw_payload(district_name, weather_data)
            device_id = raw_payload['device_id']
            
            # MQTT topic for IoT Agent JSON: /{apikey}/{device_id}/attrs
            # Using tenant as apikey
            topic = f"/{ORION_LD_TENANT}/{device_id}/attrs"
            
            # Publish
            payload_json = json.dumps(raw_payload)
            result = self.client.publish(topic, payload_json, qos=1)
            
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                logger.info(f"Published weather data for {district_name} to {topic}")
                return True
            else:
                logger.error(f"Failed to publish weather data: {result.rc}")
                return False
                
        except Exception as e:
            logger.error(f"Error publishing weather measurement: {e}")
            return False
    
    def publish_air_quality_measurement(self, district_name: str, 
                                       air_quality_data: Dict,
                                       weather_data: Dict) -> bool:
        """
        Publish air quality measurement to MQTT
        
        Args:
            district_name: Name of the district
            air_quality_data: Raw air quality data from OpenWeather
            weather_data: Raw weather data (for temperature)
            
        Returns:
            True if published successfully
        """
        if not self.connected:
            logger.warning("MQTT not connected, skipping publish")
            return False
        
        try:
            # Prepare RAW payload
            raw_payload = self.prepare_air_quality_raw_payload(
                district_name, air_quality_data, weather_data
            )
            device_id = raw_payload['device_id']
            
            # MQTT topic for IoT Agent JSON
            topic = f"/{ORION_LD_TENANT}/{device_id}/attrs"
            
            # Publish
            payload_json = json.dumps(raw_payload)
            result = self.client.publish(topic, payload_json, qos=1)
            
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                logger.info(f"Published air quality data for {district_name} to {topic}")
                return True
            else:
                logger.error(f"Failed to publish air quality data: {result.rc}")
                return False
                
        except Exception as e:
            logger.error(f"Error publishing air quality measurement: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from MQTT broker"""
        if self.connected:
            self.client.loop_stop()
            self.client.disconnect()
            logger.info("Disconnected from MQTT broker")
    
    def __del__(self):
        """Cleanup on object destruction"""
        self.disconnect()
