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
Subscription Manager for Orion-LD to QuantumLeap
Automatically creates subscriptions to forward data to QuantumLeap
"""
import requests
import logging
from typing import Dict, List, Optional
from config import ORION_LD_URL, ORION_LD_TENANT, QUANTUMLEAP_INTERNAL_URL, NGSI_LD_CONTEXT

logger = logging.getLogger(__name__)


class SubscriptionManager:
    """Manager for NGSI-LD Subscriptions"""
    
    def __init__(self):
        self.orion_url = ORION_LD_URL
        self.quantumleap_url = QUANTUMLEAP_INTERNAL_URL
        self.tenant = ORION_LD_TENANT
        
        self.headers = {
            'Content-Type': 'application/ld+json',
            'NGSILD-Tenant': self.tenant
        }
    
    def create_weather_subscription(self) -> Optional[str]:
        """
        Create subscription for WeatherObserved entities
        
        Returns:
            Subscription ID or None if failed
        """
        subscription = {
            "id": "urn:ngsi-ld:Subscription:WeatherObserved-QuantumLeap",
            "type": "Subscription",
            "description": "Notify QuantumLeap of all WeatherObserved changes",
            "entities": [
                {
                    "type": "weatherObserved"
                }
            ],
            "watchedAttributes": [
                "temperature",
                "feelsLikeTemperature",
                "atmosphericPressure",
                "relativeHumidity",
                "windSpeed",
                "windDirection",
                "precipitation",
                "pressureTendency",
                "visibility",
                "cloudiness",
                "illuminance",
                "weatherType",
                "weatherDescription"
            ],
            "notification": {
                "attributes": [
                    "temperature",
                    "feelsLikeTemperature",
                    "atmosphericPressure",
                    "relativeHumidity",
                    "windSpeed",
                    "windDirection",
                    "precipitation",
                    "pressureTendency",
                    "visibility",
                    "cloudiness",
                    "illuminance",
                    "weatherType",
                    "weatherDescription",
                    "stationName",
                    "stationCode",
                    "location",
                    "dateObserved",
                    "name",
                    "description",
                    "address",
                    "source",
                    "dataProvider",
                    "refDevice"
                ],
                "format": "normalized",
                "endpoint": {
                    "uri": f"{self.quantumleap_url}/v2/notify",
                    "accept": "application/json"
                }
            },
            "@context": NGSI_LD_CONTEXT
        }
        
        return self._create_subscription(subscription)
    
    def create_air_quality_subscription(self) -> Optional[str]:
        """
        Create subscription for AirQualityObserved entities
        
        Returns:
            Subscription ID or None if failed
        """
        subscription = {
            "id": "urn:ngsi-ld:Subscription:AirQualityObserved-QuantumLeap",
            "type": "Subscription",
            "description": "Notify QuantumLeap of all AirQualityObserved changes",
            "entities": [
                {
                    "type": "airQualityObserved"
                }
            ],
            "watchedAttributes": [
                "airQualityIndex",
                "airQualityLevel",
                "CO",
                "NO",
                "NO2",
                "NOx",
                "O3",
                "SO2",
                "pm2_5",
                "pm10",
                "NH3",
                "reliability",
                "temperature",
                "relativeHumidity",
                "windSpeed",
                "windDirection",
                "precipitation",
                "CO_Level"
            ],
            "notification": {
                "attributes": [
                    "airQualityIndex",
                    "airQualityLevel",
                    "CO",
                    "NO",
                    "NO2",
                    "NOx",
                    "O3",
                    "SO2",
                    "pm2_5",
                    "pm10",
                    "NH3",
                    "reliability",
                    "temperature",
                    "relativeHumidity",
                    "windSpeed",
                    "windDirection",
                    "precipitation",
                    "CO_Level",
                    "stationName",
                    "stationCode",
                    "location",
                    "dateObserved",
                    "name",
                    "description",
                    "address",
                    "source",
                    "dataProvider",
                    "refDevice",
                    "refPointOfInterest"
                ],
                "format": "normalized",
                "endpoint": {
                    "uri": f"{self.quantumleap_url}/v2/notify",
                    "accept": "application/json"
                }
            },
            "@context": NGSI_LD_CONTEXT
        }
        
        return self._create_subscription(subscription)
    
    def create_device_subscription(self) -> Optional[str]:
        """
        Create subscription for Device entities (Sensors)
        
        Returns:
            Subscription ID or None if failed
        """
        subscription = {
            "id": "urn:ngsi-ld:Subscription:Device-QuantumLeap",
            "type": "Subscription",
            "description": "Notify QuantumLeap of all Device (Sensor) changes",
            "entities": [
                {
                    "type": "Device"
                }
            ],
            "watchedAttributes": [
                "deviceState",
                "location",
                "controlledProperty",
                "deviceCategory",
                "hardwareVersion",
                "softwareVersion",
                "firmwareVersion"
            ],
            "notification": {
                "attributes": [
                    "name",
                    "description",
                    "deviceState",
                    "deviceCategory",
                    "controlledProperty",
                    "location",
                    "sensorType",
                    "serialNumber",
                    "hardwareVersion",
                    "softwareVersion",
                    "firmwareVersion",
                    "brandName",
                    "modelName",
                    "dateInstalled",
                    "dateFirstUsed",
                    "dataProvider",
                    "owner",
                    "observes",
                    "isHostedBy"
                ],
                "format": "normalized",
                "endpoint": {
                    "uri": f"{self.quantumleap_url}/v2/notify",
                    "accept": "application/json"
                }
            },
            "@context": NGSI_LD_CONTEXT
        }
        
        return self._create_subscription(subscription)
    
    def create_platform_subscription(self) -> Optional[str]:
        """
        Create subscription for Platform entities
        
        Returns:
            Subscription ID or None if failed
        """
        subscription = {
            "id": "urn:ngsi-ld:Subscription:Platform-QuantumLeap",
            "type": "Subscription",
            "description": "Notify QuantumLeap of all Platform changes",
            "entities": [
                {
                    "type": "Platform"
                }
            ],
            "watchedAttributes": [
                "status",
                "location",
                "hosts",
                "monitoringCategories"
            ],
            "notification": {
                "attributes": [
                    "name",
                    "description",
                    "location",
                    "address",
                    "hosts",
                    "platformType",
                    "monitoringCategories",
                    "status",
                    "deploymentDate",
                    "owner",
                    "operator",
                    "purpose"
                ],
                "format": "normalized",
                "endpoint": {
                    "uri": f"{self.quantumleap_url}/v2/notify",
                    "accept": "application/json"
                }
            },
            "@context": NGSI_LD_CONTEXT
        }
        
        return self._create_subscription(subscription)
    
    def _create_subscription(self, subscription: Dict) -> Optional[str]:
        """
        Create a subscription in Orion-LD
        
        Args:
            subscription: Subscription definition
            
        Returns:
            Subscription ID or None if failed
        """
        try:
            url = f"{self.orion_url}/ngsi-ld/v1/subscriptions"
            
            # Check if subscription already exists
            existing = self.get_subscription(subscription['id'])
            if existing:
                logger.info(f"Subscription {subscription['id']} already exists")
                return subscription['id']
            
            response = requests.post(
                url,
                json=subscription,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 201:
                logger.info(f"Successfully created subscription: {subscription['id']}")
                return subscription['id']
            else:
                logger.error(
                    f"Error creating subscription {subscription['id']}: "
                    f"{response.status_code} - {response.text}"
                )
                return None
                
        except Exception as e:
            logger.error(f"Error creating subscription: {e}")
            return None
    
    def get_subscription(self, subscription_id: str) -> Optional[Dict]:
        """
        Get a subscription by ID
        
        Args:
            subscription_id: Subscription ID
            
        Returns:
            Subscription or None if not found
        """
        try:
            url = f"{self.orion_url}/ngsi-ld/v1/subscriptions/{subscription_id}"
            response = requests.get(
                url,
                headers={'NGSILD-Tenant': self.tenant},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                return None
            else:
                logger.error(
                    f"Error getting subscription {subscription_id}: "
                    f"{response.status_code} - {response.text}"
                )
                return None
                
        except Exception as e:
            logger.error(f"Error getting subscription: {e}")
            return None
    
    def list_subscriptions(self) -> List[Dict]:
        """
        List all subscriptions
        
        Returns:
            List of subscriptions
        """
        try:
            url = f"{self.orion_url}/ngsi-ld/v1/subscriptions"
            response = requests.get(
                url,
                headers={'NGSILD-Tenant': self.tenant},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(
                    f"Error listing subscriptions: "
                    f"{response.status_code} - {response.text}"
                )
                return []
                
        except Exception as e:
            logger.error(f"Error listing subscriptions: {e}")
            return []
    
    def delete_subscription(self, subscription_id: str) -> bool:
        """
        Delete a subscription
        
        Args:
            subscription_id: Subscription ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            url = f"{self.orion_url}/ngsi-ld/v1/subscriptions/{subscription_id}"
            response = requests.delete(
                url,
                headers={'NGSILD-Tenant': self.tenant},
                timeout=10
            )
            
            if response.status_code == 204:
                logger.info(f"Successfully deleted subscription: {subscription_id}")
                return True
            else:
                logger.error(
                    f"Error deleting subscription {subscription_id}: "
                    f"{response.status_code} - {response.text}"
                )
                return False
                
        except Exception as e:
            logger.error(f"Error deleting subscription: {e}")
            return False
    
    def update_subscription(self, subscription_id: str, updates: Dict) -> bool:
        """
        Update a subscription
        
        Args:
            subscription_id: Subscription ID
            updates: Updates to apply
            
        Returns:
            True if successful, False otherwise
        """
        try:
            url = f"{self.orion_url}/ngsi-ld/v1/subscriptions/{subscription_id}"
            
            # Add context
            updates['@context'] = NGSI_LD_CONTEXT
            
            response = requests.patch(
                url,
                json=updates,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 204:
                logger.info(f"Successfully updated subscription: {subscription_id}")
                return True
            else:
                logger.error(
                    f"Error updating subscription {subscription_id}: "
                    f"{response.status_code} - {response.text}"
                )
                return False
                
        except Exception as e:
            logger.error(f"Error updating subscription: {e}")
            return False
    
    def setup_all_subscriptions(self) -> Dict[str, Optional[str]]:
        """
        Set up all subscriptions for QuantumLeap
        
        Returns:
            Dictionary with subscription IDs
        """
        logger.info("=" * 70)
        logger.info("Setting up QuantumLeap Subscriptions")
        logger.info("=" * 70)
        
        results = {}
        
        logger.info("\n[1/4] Creating WeatherObserved subscription...")
        weather_sub_id = self.create_weather_subscription()
        results['weather'] = weather_sub_id
        if weather_sub_id:
            logger.info(f"  [OK] WeatherObserved subscription: {weather_sub_id}")
        else:
            logger.error("  [FAIL] Failed to create WeatherObserved subscription")
        
        logger.info("\n[2/4] Creating AirQualityObserved subscription...")
        air_quality_sub_id = self.create_air_quality_subscription()
        results['air_quality'] = air_quality_sub_id
        if air_quality_sub_id:
            logger.info(f"  [OK] AirQualityObserved subscription: {air_quality_sub_id}")
        else:
            logger.error("  [FAIL] Failed to create AirQualityObserved subscription")
        
        logger.info("\n[3/4] Creating Device subscription...")
        device_sub_id = self.create_device_subscription()
        results['device'] = device_sub_id
        if device_sub_id:
            logger.info(f"  [OK] Device subscription: {device_sub_id}")
        else:
            logger.error("  [FAIL] Failed to create Device subscription")
        
        logger.info("\n[4/4] Creating Platform subscription...")
        platform_sub_id = self.create_platform_subscription()
        results['platform'] = platform_sub_id
        if platform_sub_id:
            logger.info(f"  [OK] Platform subscription: {platform_sub_id}")
        else:
            logger.error("  [FAIL] Failed to create Platform subscription")
        
        logger.info("\n" + "=" * 70)
        if all(results.values()):
            logger.info("[SUCCESS] All subscriptions created successfully!")
        else:
            logger.warning("[WARNING] Some subscriptions failed to create")
        logger.info("=" * 70)
        
        return results