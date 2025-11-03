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
NGSI-LD Entity Models following SOSA/SSN ontology and Smart Data Models
Reference: https://smartdatamodels.org/dataModel.Environment/
"""
from datetime import datetime
from typing import Dict, Any, Optional
import unicodedata
import re

class NGSILDEntity:
    """Base class for NGSI-LD entities"""
    @staticmethod
    def _slugify_ascii(name: str) -> str:
        """
        Convert name with accents to ASCII PascalCase string safe for URNs.
        "Phường Cầu Giấy" -> "PhuongCauGiay"
        """
        if not name:
            return ""
        name = name.replace('Đ', 'D').replace('đ', 'd')

        # Normalize and remove remaining accents
        ascii_name = unicodedata.normalize('NFKD', name)
        ascii_name = ascii_name.encode('ascii', 'ignore').decode('ascii')

        # Keep only alphanumerics, split into words and PascalCase them
        words = re.findall(r'[A-Za-z0-9]+', ascii_name)
        return ''.join(w.capitalize() for w in words)
    
    @staticmethod
    def _ascii_preserve_spaces(name: str) -> str:
        """
        Convert name with accents to plain ASCII but keep spaces.
        "Đa Phúc" -> "Da Phuc"
        """
        if not name:
            return ""
        name = name.replace('Đ', 'D').replace('đ', 'd')
        normalized = unicodedata.normalize('NFKD', name)
        # remove combining marks
        no_marks = ''.join(ch for ch in normalized if unicodedata.category(ch) != 'Mn')
        # keep only alphanumerics and spaces
        cleaned = re.sub(r'[^A-Za-z0-9\s]', '', no_marks)
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        return cleaned

    @staticmethod
    def create_property(value: Any, observed_at: Optional[str] = None, 
                       unit_code: Optional[str] = None) -> Dict:
        """Create a NGSI-LD Property"""
        prop = {
            "type": "Property",
            "value": value
        }
        if observed_at:
            prop["observedAt"] = observed_at
        if unit_code:
            prop["unitCode"] = unit_code
        return prop
    
    @staticmethod
    def create_geoproperty(lat: float, lon: float) -> Dict:
        """Create a NGSI-LD GeoProperty"""
        return {
            "type": "GeoProperty",
            "value": {
                "type": "Point",
                "coordinates": [lon, lat]
            }
        }
    
    @staticmethod
    def create_relationship(object_id: str) -> Dict:
        """Create a NGSI-LD Relationship"""
        return {
            "type": "Relationship",
            "object": object_id
        }


class WeatherObservedEntity(NGSILDEntity):
    """
    WeatherObserved Entity following Smart Data Models
    https://github.com/smart-data-models/dataModel.Environment/tree/master/WeatherObserved
    """
    
    @staticmethod
    def create(district_name: str, location: Dict, weather_data: Dict) -> Dict:
        """
        Create WeatherObserved NGSI-LD entity
        
        Args:
            district_name: Name of the district
            location: Dictionary with 'lat' and 'lon'
            weather_data: OpenWeather API response
        """
        observed_at = datetime.utcnow().isoformat(timespec='milliseconds') + "Z"
        safe_name = NGSILDEntity._slugify_ascii(district_name)
        ascii_label = NGSILDEntity._ascii_preserve_spaces(district_name)
        entity_id = f"urn:ngsi-ld:WeatherObserved:Hanoi-{safe_name}-{observed_at}"
        
        entity = {
            "id": entity_id,
            "type": "WeatherObserved",
            
            # Station information
            "name": NGSILDEntity.create_property(f"WeatherStation-{safe_name}"),
            "description": NGSILDEntity.create_property(
                f"Weather observation station in {ascii_label}, Hanoi"
            ),
            "stationName": NGSILDEntity.create_property(safe_name),
            "stationCode": NGSILDEntity.create_property(f"HN-{safe_name.upper()}"),
            
            # Location
            "location": NGSILDEntity.create_geoproperty(
                location['lat'], 
                location['lon']
            ),
            "address": NGSILDEntity.create_property({
                "addressLocality": ascii_label,
                "addressRegion": "Hanoi",
                "addressCountry": "VN",
                "type": "PostalAddress"
            }),
            
            # Observation time - FIWARE format với DateTime object
            "dateObserved": {
                "type": "Property",
                "value": {
                    "@type": "DateTime",
                    "@value": observed_at
                }
            },
            
            # Temperature (Celsius)
            "temperature": NGSILDEntity.create_property(
                round(weather_data['main']['temp'], 1),
                observed_at,
                "CEL"
            ),
            "feelsLikeTemperature": NGSILDEntity.create_property(
                round(weather_data['main']['feels_like'], 1),
                observed_at,
                "CEL"
            ),
            
            # Pressure (hPa)
            "atmosphericPressure": NGSILDEntity.create_property(
                round(weather_data['main']['pressure'], 1),
                observed_at,
                "HPA"
            ),
            
            # Humidity (0-1 range)
            "relativeHumidity": NGSILDEntity.create_property(
                round(weather_data['main']['humidity'] / 100, 2),
                observed_at,
                "C62"  # Dimensionless (0-1)
            ),
            
            # Weather conditions
            "weatherType": NGSILDEntity.create_property(
                weather_data['weather'][0]['main'],
                observed_at
            ),
            "weatherDescription": NGSILDEntity.create_property(
                weather_data['weather'][0]['description'],
                observed_at
            ),
            
            # Wind
            "windSpeed": NGSILDEntity.create_property(
                round(weather_data['wind']['speed'], 1),
                observed_at,
                "MTS"
            ),
            
            # Data source
            "source": NGSILDEntity.create_property("https://openweathermap.org"),
            "dataProvider": NGSILDEntity.create_property("OpenWeather"),
        }
        
        # Optional: Wind direction
        if 'deg' in weather_data['wind']:
            entity["windDirection"] = NGSILDEntity.create_property(
                weather_data['wind']['deg'],
                observed_at,
                "DD"
            )
        
        # Optional: Visibility (meters)
        if 'visibility' in weather_data:
            entity["visibility"] = NGSILDEntity.create_property(
                weather_data['visibility'],
                observed_at,
                "MTR"
            )
        
        # Optional: Cloudiness (0-1 range)
        if 'clouds' in weather_data:
            entity["cloudiness"] = NGSILDEntity.create_property(
                round(weather_data['clouds']['all'] / 100, 2),
                observed_at,
                "C62"
            )
        
        # Optional: Precipitation (mm) - rain in last 1h
        if 'rain' in weather_data and '1h' in weather_data['rain']:
            entity["precipitation"] = NGSILDEntity.create_property(
                weather_data['rain']['1h'],
                observed_at,
                "MMT"  # Millimeter
            )
        elif 'rain' in weather_data and '3h' in weather_data['rain']:
            # Convert 3h to 1h average
            entity["precipitation"] = NGSILDEntity.create_property(
                round(weather_data['rain']['3h'] / 3, 2),
                observed_at,
                "MMT"
            )
        else:
            entity["precipitation"] = NGSILDEntity.create_property(
                0,
                observed_at,
                "MMT"
            )
        
        # Optional: Pressure tendency (if we have historical data)
        # For now, set to 0 as we don't have historical comparison
        entity["pressureTendency"] = NGSILDEntity.create_property(
            0,
            observed_at,
            "A97"  # Hectopascal per hour
        )
        
        # Optional: Illuminance (lux) - estimate from weather condition
        # Clear sky = high, Clouds = medium, Rain/Storm = low
        illuminance_map = {
            'Clear': 100000,
            'Clouds': 50000,
            'Rain': 10000,
            'Drizzle': 15000,
            'Thunderstorm': 5000,
            'Snow': 20000,
            'Mist': 30000,
            'Smoke': 25000,
            'Haze': 40000,
            'Dust': 35000,
            'Fog': 10000,
            'Sand': 30000,
            'Ash': 20000,
            'Squall': 15000,
            'Tornado': 5000
        }
        weather_type = weather_data['weather'][0]['main']
        entity["illuminance"] = NGSILDEntity.create_property(
            illuminance_map.get(weather_type, 50000),
            observed_at,
            "LUX"
        )
        
        # SOSA/SSN: Add sensor reference
        entity["refDevice"] = NGSILDEntity.create_relationship(
            f"urn:ngsi-ld:Device:WeatherSensor-{safe_name}"
        )
        
        return entity


class AirQualityObservedEntity(NGSILDEntity):
    """
    AirQualityObserved Entity following Smart Data Models
    https://github.com/smart-data-models/dataModel.Environment/tree/master/AirQualityObserved
    """
    
    # Air Quality Index mapping (OpenWeather AQI)
    AQI_LEVELS = {
        1: "good",
        2: "fair",
        3: "moderate",
        4: "poor",
        5: "very poor"
    }
    
    @staticmethod
    def create(district_name: str, location: Dict, air_quality_data: Dict, 
               weather_data: Optional[Dict] = None) -> Dict:
        """
        Create AirQualityObserved NGSI-LD entity
        
        Args:
            district_name: Name of the district
            location: Dictionary with 'lat' and 'lon'
            air_quality_data: OpenWeather Air Pollution API response
            weather_data: Optional OpenWeather weather data for additional context
        """
        observed_at = datetime.utcnow().isoformat(timespec='milliseconds') + "Z"
        safe_name = NGSILDEntity._slugify_ascii(district_name)
        ascii_label = NGSILDEntity._ascii_preserve_spaces(district_name)
        entity_id = f"urn:ngsi-ld:AirQualityObserved:Hanoi-{safe_name}-{observed_at}"
        
        components = air_quality_data['list'][0]['components']
        aqi = air_quality_data['list'][0]['main']['aqi']
        
        entity = {
            "id": entity_id,
            "type": "AirQualityObserved",
            
            # Station information
            "name": NGSILDEntity.create_property(f"AirQualityStation-{safe_name}"),
            "description": NGSILDEntity.create_property(
                f"Air quality monitoring station in {ascii_label}, Hanoi"
            ),
            "stationName": NGSILDEntity.create_property(safe_name),
            "stationCode": NGSILDEntity.create_property(
                f"HN-AQ-{safe_name.upper()}"
            ),
            
            # Location
            "location": NGSILDEntity.create_geoproperty(
                location['lat'], 
                location['lon']
            ),
            "address": NGSILDEntity.create_property({
                "addressLocality": ascii_label,
                "addressRegion": "Hanoi",
                "addressCountry": "VN",
                "type": "PostalAddress"
            }),
            
            # Observation time - Support interval format như FIWARE
            "dateObserved": NGSILDEntity.create_property(observed_at),
            
            # Air Quality Index
            "airQualityIndex": NGSILDEntity.create_property(
                aqi,
                observed_at
            ),
            "airQualityLevel": NGSILDEntity.create_property(
                AirQualityObservedEntity.AQI_LEVELS.get(aqi, "unknown"),
                observed_at
            ),
            
            # Pollutants (concentrations in μg/m³)
            # Carbon Monoxide
            "CO": NGSILDEntity.create_property(
                round(components.get('co', 0), 2),
                observed_at,
                "GP"  # Micrograms per cubic meter
            ),
            
            # Nitrogen Oxides
            "NO": NGSILDEntity.create_property(
                round(components.get('no', 0), 2),
                observed_at,
                "GQ"  # Micrograms per cubic meter
            ),
            "NO2": NGSILDEntity.create_property(
                round(components.get('no2', 0), 2),
                observed_at,
                "GQ"
            ),
            
            # Calculate NOx (NO + NO2)
            "NOx": NGSILDEntity.create_property(
                round(components.get('no', 0) + components.get('no2', 0), 2),
                observed_at,
                "GQ"
            ),
            
            # Ozone
            "O3": NGSILDEntity.create_property(
                round(components.get('o3', 0), 2),
                observed_at,
                "GQ"
            ),
            
            # Sulfur Dioxide
            "SO2": NGSILDEntity.create_property(
                round(components.get('so2', 0), 2),
                observed_at,
                "GQ"
            ),
            
            # Particulate Matter
            "pm2_5": NGSILDEntity.create_property(
                round(components.get('pm2_5', 0), 2),
                observed_at,
                "GQ"
            ),
            "pm10": NGSILDEntity.create_property(
                round(components.get('pm10', 0), 2),
                observed_at,
                "GQ"
            ),
            
            # Ammonia
            "NH3": NGSILDEntity.create_property(
                round(components.get('nh3', 0), 2),
                observed_at,
                "GQ"
            ),
            
            # Data quality - reliability score (0-1)
            # OpenWeather data is generally reliable, set to 0.85
            "reliability": NGSILDEntity.create_property(
                0.85,
                observed_at
            ),
            
            # Data source
            "source": NGSILDEntity.create_property("https://openweathermap.org"),
            "dataProvider": NGSILDEntity.create_property("OpenWeather"),
        }
        
        # Add weather context if available
        if weather_data:
            # Temperature
            entity["temperature"] = NGSILDEntity.create_property(
                round(weather_data['main']['temp'], 1),
                observed_at,
                "CEL"
            )
            
            # Relative Humidity (0-1 range)
            entity["relativeHumidity"] = NGSILDEntity.create_property(
                round(weather_data['main']['humidity'] / 100, 2),
                observed_at,
                "C62"
            )
            
            # Wind Speed
            entity["windSpeed"] = NGSILDEntity.create_property(
                round(weather_data['wind']['speed'], 2),
                observed_at,
                "MTS"
            )
            
            # Wind Direction
            if 'deg' in weather_data['wind']:
                entity["windDirection"] = NGSILDEntity.create_property(
                    weather_data['wind']['deg'],
                    observed_at,
                    "DD"
                )
            
            # Precipitation
            if 'rain' in weather_data and '1h' in weather_data['rain']:
                entity["precipitation"] = NGSILDEntity.create_property(
                    round(weather_data['rain']['1h'], 2),
                    observed_at,
                    "MMT"
                )
            elif 'rain' in weather_data and '3h' in weather_data['rain']:
                entity["precipitation"] = NGSILDEntity.create_property(
                    round(weather_data['rain']['3h'] / 3, 2),
                    observed_at,
                    "MMT"
                )
            else:
                entity["precipitation"] = NGSILDEntity.create_property(
                    0,
                    observed_at,
                    "MMT"
                )
        
        # Add pollutant level classifications based on concentration
        # CO levels (μg/m³): good <4400, moderate <9400, poor <12400, very poor >12400
        co_value = components.get('co', 0)
        if co_value < 4400:
            co_level = "good"
        elif co_value < 9400:
            co_level = "moderate"
        elif co_value < 12400:
            co_level = "poor"
        else:
            co_level = "very poor"
        
        entity["CO_Level"] = NGSILDEntity.create_property(
            co_level,
            observed_at
        )
        
        # SOSA/SSN: Add device reference (use slug)
        entity["refDevice"] = NGSILDEntity.create_relationship(
            f"urn:ngsi-ld:Device:AirQualitySensor-{safe_name}"
        )
        
        # Optional: Point of Interest reference (landmark in the district) - use slug
        entity["refPointOfInterest"] = NGSILDEntity.create_relationship(
            f"urn:ngsi-ld:PointOfInterest:Hanoi-{safe_name}"
        )
        
        return entity
