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
SOSA/SSN Sensor Models following W3C Ontology
Reference: https://www.w3.org/TR/vocab-ssn/

SOSA (Sensor, Observation, Sample, and Actuator) ontology provides:
- Sensor: Device that observes properties
- Platform: Entity that hosts sensors
- ObservableProperty: Properties that can be observed
- Observation: Act of carrying out an observation (our WeatherObserved/AirQualityObserved)
"""
from typing import Dict, List
from .models import NGSILDEntity


class SensorEntity(NGSILDEntity):
    """
    Sensor Entity following SOSA/SSN Ontology
    A sensor is a device that observes a property and transforms it into data
    """
    
    @staticmethod
    def create_weather_sensor(district_name: str, location: Dict) -> Dict:
        """
        Create Weather Sensor entity
        
        Args:
            district_name: Name of the district
            location: Dictionary with 'lat' and 'lon'
        """
        safe_name = NGSILDEntity._slugify_ascii(district_name)
        ascii_label = NGSILDEntity._ascii_preserve_spaces(district_name)  
        entity_id = f"urn:ngsi-ld:Device:WeatherSensor-{safe_name}"
        
        entity = {
            "id": entity_id,
            "type": "Device",
            
            # Basic information
            "name": NGSILDEntity.create_property(f"WeatherSensor-{safe_name}"),
            "description": NGSILDEntity.create_property(
                f"Multi-parameter weather sensor station in {ascii_label}, Hanoi"
            ),
            
            # Device metadata
            "deviceCategory": NGSILDEntity.create_property(["sensor"]),
            "controlledProperty": NGSILDEntity.create_property([
                "temperature",
                "atmosphericPressure",
                "relativeHumidity",
                "windSpeed",
                "windDirection",
                "precipitation",
                "visibility",
                "illuminance"
            ]),
            
            # Location
            "location": NGSILDEntity.create_geoproperty(location['lat'], location['lon']),
            
            # SOSA/SSN Properties
            "sensorType": NGSILDEntity.create_property("WeatherStation"),
            
            # Observes relationships to ObservableProperty
            "observes": {
                "type": "Relationship",
                "object": [
                    "urn:ngsi-ld:ObservableProperty:Temperature",
                    "urn:ngsi-ld:ObservableProperty:AtmosphericPressure",
                    "urn:ngsi-ld:ObservableProperty:RelativeHumidity",
                    "urn:ngsi-ld:ObservableProperty:WindSpeed",
                    "urn:ngsi-ld:ObservableProperty:WindDirection",
                    "urn:ngsi-ld:ObservableProperty:Precipitation",
                    "urn:ngsi-ld:ObservableProperty:Visibility",
                    "urn:ngsi-ld:ObservableProperty:Illuminance"
                ]
            },
            
            # Hosted by Platform
            "isHostedBy": NGSILDEntity.create_relationship(
                f"urn:ngsi-ld:Platform:EnvironmentStation-{safe_name}"
            ),
            
            # Technical specifications
            "serialNumber": NGSILDEntity.create_property(
                f"WS-HN-{safe_name.upper()}-001"
            ),
            "hardwareVersion": NGSILDEntity.create_property("2.0"),
            "softwareVersion": NGSILDEntity.create_property("1.5.0"),
            "firmwareVersion": NGSILDEntity.create_property("3.2.1"),
            
            # Manufacturer
            "brandName": NGSILDEntity.create_property("OpenWeather"),
            "modelName": NGSILDEntity.create_property("Multi-Sensor Weather Station"),
            
            # Status
            "deviceState": NGSILDEntity.create_property("active"),
            "dateInstalled": NGSILDEntity.create_property("2025-01-01T00:00:00Z"),
            "dateFirstUsed": NGSILDEntity.create_property("2025-01-01T00:00:00Z"),
            
            # Data provider
            "dataProvider": NGSILDEntity.create_property("Hanoi Smart City Initiative"),
            "owner": NGSILDEntity.create_property("Hanoi Department of Environment")
        }
        
        return entity
    
    @staticmethod
    def create_air_quality_sensor(district_name: str, location: Dict) -> Dict:
        """
        Create Air Quality Sensor entity
        
        Args:
            district_name: Name of the district
            location: Dictionary with 'lat' and 'lon'
        """
        safe_name = NGSILDEntity._slugify_ascii(district_name)
        ascii_label = NGSILDEntity._ascii_preserve_spaces(district_name)
        entity_id = f"urn:ngsi-ld:Device:AirQualitySensor-{safe_name}"
        
        entity = {
            "id": entity_id,
            "type": "Device",
            
            # Basic information
            "name": NGSILDEntity.create_property(f"AirQualitySensor-{safe_name}"),
            "description": NGSILDEntity.create_property(
                f"Multi-pollutant air quality monitoring sensor in {ascii_label}, Hanoi"
            ),
            
            # Device metadata
            "deviceCategory": NGSILDEntity.create_property(["sensor"]),
            "controlledProperty": NGSILDEntity.create_property([
                "CO",
                "NO",
                "NO2",
                "NOx",
                "O3",
                "SO2",
                "PM2.5",
                "PM10",
                "NH3",
                "airQualityIndex"
            ]),
            
            # Location
            "location": NGSILDEntity.create_geoproperty(
                location['lat'], 
                location['lon']
            ),
            
            # SOSA/SSN Properties
            "sensorType": NGSILDEntity.create_property("AirQualityMonitor"),
            
            # Observes relationships to ObservableProperty
            "observes": {
                "type": "Relationship",
                "object": [
                    "urn:ngsi-ld:ObservableProperty:CarbonMonoxide",
                    "urn:ngsi-ld:ObservableProperty:NitricOxide",
                    "urn:ngsi-ld:ObservableProperty:NitrogenDioxide",
                    "urn:ngsi-ld:ObservableProperty:Ozone",
                    "urn:ngsi-ld:ObservableProperty:SulfurDioxide",
                    "urn:ngsi-ld:ObservableProperty:ParticulateMatter2.5",
                    "urn:ngsi-ld:ObservableProperty:ParticulateMatter10",
                    "urn:ngsi-ld:ObservableProperty:Ammonia",
                    "urn:ngsi-ld:ObservableProperty:AirQualityIndex"
                ]
            },
            
            # Hosted by Platform
            "isHostedBy": NGSILDEntity.create_relationship(
                f"urn:ngsi-ld:Platform:EnvironmentStation-{safe_name}"
            ),
            
            # Technical specifications
            "serialNumber": NGSILDEntity.create_property(
                f"AQ-HN-{safe_name.upper()}-001"
            ),
            "hardwareVersion": NGSILDEntity.create_property("3.0"),
            "softwareVersion": NGSILDEntity.create_property("2.1.0"),
            "firmwareVersion": NGSILDEntity.create_property("4.0.2"),
            
            # Manufacturer
            "brandName": NGSILDEntity.create_property("OpenWeather"),
            "modelName": NGSILDEntity.create_property("Multi-Gas Air Quality Monitor"),
            
            # Status
            "deviceState": NGSILDEntity.create_property("active"),
            "dateInstalled": NGSILDEntity.create_property("2025-01-01T00:00:00Z"),
            "dateFirstUsed": NGSILDEntity.create_property("2025-01-01T00:00:00Z"),
            
            # Data provider
            "dataProvider": NGSILDEntity.create_property("Hanoi Smart City Initiative"),
            "owner": NGSILDEntity.create_property("Hanoi Department of Environment")
        }
        
        return entity


class PlatformEntity(NGSILDEntity):
    """
    Platform Entity following SOSA/SSN Ontology
    A platform is an entity that hosts sensors
    """
    
    @staticmethod
    def create_environment_platform(district_name: str, location: Dict) -> Dict:
        """
        Create unified Environment Monitoring Platform entity that hosts both
        weather and air quality sensors
        
        Args:
            district_name: Name of the district
            location: Dictionary with 'lat' and 'lon'
        """
        safe_name = NGSILDEntity._slugify_ascii(district_name)
        ascii_label = NGSILDEntity._ascii_preserve_spaces(district_name)
        entity_id = f"urn:ngsi-ld:Platform:EnvironmentStation-{safe_name}"
        
        entity = {
            "id": entity_id,
            "type": "Platform",
            
            # Basic information
            "name": NGSILDEntity.create_property(
                f"Environment Monitoring Platform - {ascii_label}"
            ),
            "description": NGSILDEntity.create_property(
                f"Integrated environment monitoring platform hosting weather and air quality sensors in {ascii_label}, Hanoi"
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
            
            # SOSA/SSN: Hosts both weather and air quality sensors
            "hosts": {
                "type": "Relationship",
                "object": [
                    f"urn:ngsi-ld:Device:WeatherSensor-{safe_name}",
                    f"urn:ngsi-ld:Device:AirQualitySensor-{safe_name}"
                ]
            },
            
            # Platform type - unified environment monitoring
            "platformType": NGSILDEntity.create_property("EnvironmentMonitoringStation"),
            
            # Categories of monitoring
            "monitoringCategories": NGSILDEntity.create_property([
                "weather",
                "airQuality"
            ]),
            
            # Status
            "status": NGSILDEntity.create_property("operational"),
            "deploymentDate": NGSILDEntity.create_property("2025-01-01T00:00:00Z"),
            
            # Owner
            "owner": NGSILDEntity.create_property("Hanoi Department of Environment"),
            "operator": NGSILDEntity.create_property("Hanoi Smart City Initiative"),
            
            # Additional metadata
            "purpose": NGSILDEntity.create_property(
                "Comprehensive environmental monitoring including meteorological parameters and air quality indicators"
            )
        }
        
        return entity


class ObservablePropertyEntity(NGSILDEntity):
    """
    ObservableProperty Entity following SOSA/SSN Ontology
    An observable property is a property that can be observed by a sensor
    """
    
    # Define all observable properties for weather and air quality
    PROPERTIES = {
        # Weather Properties
        "Temperature": {
            "name": "Air Temperature",
            "description": "The temperature of the air",
            "unit": "Celsius (°C)",
            "unitCode": "CEL"
        },
        "AtmosphericPressure": {
            "name": "Atmospheric Pressure",
            "description": "The pressure exerted by the atmosphere",
            "unit": "Hectopascal (hPa)",
            "unitCode": "HPA"
        },
        "RelativeHumidity": {
            "name": "Relative Humidity",
            "description": "The amount of water vapor in the air",
            "unit": "Dimensionless (0-1)",
            "unitCode": "C62"
        },
        "WindSpeed": {
            "name": "Wind Speed",
            "description": "The speed of wind movement",
            "unit": "Meters per second (m/s)",
            "unitCode": "MTS"
        },
        "WindDirection": {
            "name": "Wind Direction",
            "description": "The direction from which the wind is blowing",
            "unit": "Decimal degrees (°)",
            "unitCode": "DD"
        },
        "Precipitation": {
            "name": "Precipitation",
            "description": "The amount of water falling from the atmosphere",
            "unit": "Millimeter (mm)",
            "unitCode": "MMT"
        },
        "Visibility": {
            "name": "Visibility",
            "description": "The distance at which objects can be clearly seen",
            "unit": "Meter (m)",
            "unitCode": "MTR"
        },
        "Illuminance": {
            "name": "Illuminance",
            "description": "The amount of luminous flux per unit area",
            "unit": "Lux (lx)",
            "unitCode": "LUX"
        },
        
        # Air Quality Properties
        "CarbonMonoxide": {
            "name": "Carbon Monoxide (CO)",
            "description": "Concentration of carbon monoxide in air",
            "unit": "Micrograms per cubic meter (μg/m³)",
            "unitCode": "GP"
        },
        "NitricOxide": {
            "name": "Nitric Oxide (NO)",
            "description": "Concentration of nitric oxide in air",
            "unit": "Micrograms per cubic meter (μg/m³)",
            "unitCode": "GQ"
        },
        "NitrogenDioxide": {
            "name": "Nitrogen Dioxide (NO2)",
            "description": "Concentration of nitrogen dioxide in air",
            "unit": "Micrograms per cubic meter (μg/m³)",
            "unitCode": "GQ"
        },
        "Ozone": {
            "name": "Ozone (O3)",
            "description": "Concentration of ozone in air",
            "unit": "Micrograms per cubic meter (μg/m³)",
            "unitCode": "GQ"
        },
        "SulfurDioxide": {
            "name": "Sulfur Dioxide (SO2)",
            "description": "Concentration of sulfur dioxide in air",
            "unit": "Micrograms per cubic meter (μg/m³)",
            "unitCode": "GQ"
        },
        "ParticulateMatter2.5": {
            "name": "Particulate Matter 2.5 (PM2.5)",
            "description": "Concentration of particulate matter with diameter < 2.5 micrometers",
            "unit": "Micrograms per cubic meter (μg/m³)",
            "unitCode": "GQ"
        },
        "ParticulateMatter10": {
            "name": "Particulate Matter 10 (PM10)",
            "description": "Concentration of particulate matter with diameter < 10 micrometers",
            "unit": "Micrograms per cubic meter (μg/m³)",
            "unitCode": "GQ"
        },
        "Ammonia": {
            "name": "Ammonia (NH3)",
            "description": "Concentration of ammonia in air",
            "unit": "Micrograms per cubic meter (μg/m³)",
            "unitCode": "GQ"
        },
        "AirQualityIndex": {
            "name": "Air Quality Index (AQI)",
            "description": "Numerical index representing overall air quality",
            "unit": "Dimensionless",
            "unitCode": "C62"
        }
    }
    
    @staticmethod
    def create_all_properties() -> List[Dict]:
        """
        Create all ObservableProperty entities
        
        Returns:
            List of ObservableProperty entities
        """
        entities = []
        
        for prop_key, prop_data in ObservablePropertyEntity.PROPERTIES.items():
            entity = {
                "id": f"urn:ngsi-ld:ObservableProperty:{prop_key}",
                "type": "ObservableProperty",
                
                "name": NGSILDEntity.create_property(prop_data["name"]),
                "description": NGSILDEntity.create_property(prop_data["description"]),
                "unit": NGSILDEntity.create_property(prop_data["unit"]),
                "unitCode": NGSILDEntity.create_property(prop_data["unitCode"]),
                
                # Property category
                "category": NGSILDEntity.create_property(
                    "weather" if prop_key in [
                        "Temperature", "AtmosphericPressure", "RelativeHumidity",
                        "WindSpeed", "WindDirection", "Precipitation", 
                        "Visibility", "Illuminance"
                    ] else "airQuality"
                )
            }
            
            entities.append(entity)
        
        return entities
