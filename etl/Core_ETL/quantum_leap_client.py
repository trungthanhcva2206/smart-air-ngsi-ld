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
QuantumLeap Client for Time Series Data Storage
"""
import requests
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from .config import QUANTUMLEAP_EXTERNAL_URL, ORION_LD_TENANT

logger = logging.getLogger(__name__)


class QuantumLeapClient:
    """Client for QuantumLeap Time Series API"""
    
    def __init__(self):
        self.base_url = QUANTUMLEAP_EXTERNAL_URL 
        self.tenant = ORION_LD_TENANT
        
        # QuantumLeap headers
        self.headers = {
            'Content-Type': 'application/json',
            'Fiware-Service': self.tenant.lower()
        }
    
    def notify_entity(self, entity: Dict) -> bool:
        """
        Send entity to QuantumLeap for time series storage
        This is typically done via subscription, but can be done manually
        
        Args:
            entity: NGSI-LD entity dictionary
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # QuantumLeap expects v2 notify format
            # Convert NGSI-LD to v2 format
            v2_entity = self._convert_to_v2(entity)
            
            url = f"{self.base_url}/v2/notify"
            payload = {
                "data": [v2_entity],
                "subscriptionId": "manual-notification"
            }
            
            response = requests.post(
                url,
                json=payload,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code in [200, 201, 204]:
                logger.info(f"Successfully notified QuantumLeap for entity: {entity['id']}")
                return True
            else:
                logger.error(
                    f"Error notifying QuantumLeap for {entity['id']}: "
                    f"{response.status_code} - {response.text}"
                )
                return False
                
        except Exception as e:
            logger.error(f"Error notifying QuantumLeap: {e}")
            return False
    
    def get_entity_history(self, entity_id: str, entity_type: str,
                          from_date: Optional[str] = None,
                          to_date: Optional[str] = None,
                          limit: int = 100,
                          offset: int = 0) -> Optional[Dict]:
        """
        Get historical data for an entity
        
        Args:
            entity_id: Entity ID
            entity_type: Entity type
            from_date: Start date (ISO 8601)
            to_date: End date (ISO 8601)
            limit: Maximum number of records
            offset: Offset for pagination
            
        Returns:
            Historical data or None if request fails
        """
        try:
            url = f"{self.base_url}/v2/entities/{entity_id}"
            params = {
                'type': entity_type,
                'limit': limit,
                'offset': offset
            }
            
            if from_date:
                params['fromDate'] = from_date
            if to_date:
                params['toDate'] = to_date
            
            response = requests.get(
                url,
                params=params,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info(f"Successfully retrieved history for {entity_id}")
                return response.json()
            else:
                logger.error(
                    f"Error getting history for {entity_id}: "
                    f"{response.status_code} - {response.text}"
                )
                return None
                
        except Exception as e:
            logger.error(f"Error getting entity history: {e}")
            return None
    
    def get_attribute_history(self, entity_id: str, entity_type: str,
                             attr_name: str,
                             from_date: Optional[str] = None,
                             to_date: Optional[str] = None,
                             limit: int = 100,
                             offset: int = 0,
                             last_n: Optional[int] = None) -> Optional[Dict]:
        """
        Get historical data for a specific attribute
        
        Args:
            entity_id: Entity ID
            entity_type: Entity type
            attr_name: Attribute name
            from_date: Start date (ISO 8601)
            to_date: End date (ISO 8601)
            limit: Maximum number of records
            offset: Offset for pagination
            last_n: Get last N values
            
        Returns:
            Attribute historical data or None if request fails
        """
        try:
            url = f"{self.base_url}/v2/entities/{entity_id}/attrs/{attr_name}"
            params = {
                'type': entity_type,
                'limit': limit,
                'offset': offset
            }
            
            if from_date:
                params['fromDate'] = from_date
            if to_date:
                params['toDate'] = to_date
            if last_n:
                params['lastN'] = last_n
            
            response = requests.get(
                url,
                params=params,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info(f"Successfully retrieved attribute history for {entity_id}.{attr_name}")
                return response.json()
            else:
                logger.error(
                    f"Error getting attribute history for {entity_id}.{attr_name}: "
                    f"{response.status_code} - {response.text}"
                )
                return None
                
        except Exception as e:
            logger.error(f"Error getting attribute history: {e}")
            return None
    
    def get_aggregated_data(self, entity_type: str,
                           attr_name: str,
                           aggr_method: str = 'avg',
                           aggr_period: str = 'hour',
                           from_date: Optional[str] = None,
                           to_date: Optional[str] = None) -> Optional[Dict]:
        """
        Get aggregated time series data
        
        Args:
            entity_type: Entity type
            attr_name: Attribute name
            aggr_method: Aggregation method (avg, sum, min, max, count)
            aggr_period: Aggregation period (second, minute, hour, day, month, year)
            from_date: Start date (ISO 8601)
            to_date: End date (ISO 8601)
            
        Returns:
            Aggregated data or None if request fails
        """
        try:
            url = f"{self.base_url}/v2/types/{entity_type}/attrs/{attr_name}"
            params = {
                'aggrMethod': aggr_method,
                'aggrPeriod': aggr_period
            }
            
            if from_date:
                params['fromDate'] = from_date
            if to_date:
                params['toDate'] = to_date
            
            response = requests.get(
                url,
                params=params,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                logger.info(
                    f"Successfully retrieved aggregated data for {entity_type}.{attr_name}"
                )
                return response.json()
            else:
                logger.error(
                    f"Error getting aggregated data: "
                    f"{response.status_code} - {response.text}"
                )
                return None
                
        except Exception as e:
            logger.error(f"Error getting aggregated data: {e}")
            return None
    
    def delete_entity_history(self, entity_id: str, entity_type: str) -> bool:
        """
        Delete all historical data for an entity
        
        Args:
            entity_id: Entity ID
            entity_type: Entity type
            
        Returns:
            True if successful, False otherwise
        """
        try:
            url = f"{self.base_url}/v2/entities/{entity_id}"
            params = {'type': entity_type}
            
            response = requests.delete(
                url,
                params=params,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code in [200, 204]:
                logger.info(f"Successfully deleted history for {entity_id}")
                return True
            else:
                logger.error(
                    f"Error deleting history for {entity_id}: "
                    f"{response.status_code} - {response.text}"
                )
                return False
                
        except Exception as e:
            logger.error(f"Error deleting entity history: {e}")
            return False
    
    def get_health(self) -> Optional[Dict]:
        """
        Check QuantumLeap health status
        
        Returns:
            Health status or None if request fails
        """
        try:
            url = f"{self.base_url}/health"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                return response.json()
            else:
                return None
                
        except Exception as e:
            logger.error(f"Error checking QuantumLeap health: {e}")
            return None
    
    def get_version(self) -> Optional[Dict]:
        """
        Get QuantumLeap version information
        
        Returns:
            Version info or None if request fails
        """
        try:
            url = f"{self.base_url}/version"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                return response.json()
            else:
                return None
                
        except Exception as e:
            logger.error(f"Error getting QuantumLeap version: {e}")
            return None
    
    def _convert_to_v2(self, ngsi_ld_entity: Dict) -> Dict:
        """
        Convert NGSI-LD entity to NGSIv2 format for QuantumLeap
        
        Args:
            ngsi_ld_entity: NGSI-LD entity
            
        Returns:
            NGSIv2 entity
        """
        v2_entity = {
            'id': ngsi_ld_entity['id'],
            'type': ngsi_ld_entity['type']
        }
        
        for key, value in ngsi_ld_entity.items():
            if key in ['id', 'type', '@context']:
                continue
            
            if isinstance(value, dict):
                if value.get('type') == 'Property':
                    v2_entity[key] = {
                        'value': value.get('value'),
                        'type': self._infer_v2_type(value.get('value'))
                    }
                    if 'observedAt' in value:
                        v2_entity[key]['metadata'] = {
                            'timestamp': {
                                'value': value['observedAt'],
                                'type': 'DateTime'
                            }
                        }
                    if 'unitCode' in value:
                        if 'metadata' not in v2_entity[key]:
                            v2_entity[key]['metadata'] = {}
                        v2_entity[key]['metadata']['unitCode'] = {
                            'value': value['unitCode'],
                            'type': 'Text'
                        }
                
                elif value.get('type') == 'GeoProperty':
                    v2_entity[key] = {
                        'value': value.get('value'),
                        'type': 'geo:json'
                    }
                
                elif value.get('type') == 'Relationship':
                    v2_entity[key] = {
                        'value': value.get('object'),
                        'type': 'Relationship'
                    }
        
        return v2_entity
    
    def _infer_v2_type(self, value) -> str:
        """Infer NGSIv2 type from value"""
        if isinstance(value, bool):
            return 'Boolean'
        elif isinstance(value, int):
            return 'Integer'
        elif isinstance(value, float):
            return 'Number'
        elif isinstance(value, str):
            return 'Text'
        elif isinstance(value, list):
            return 'Array'
        elif isinstance(value, dict):
            return 'StructuredValue'
        else:
            return 'Text'