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
Orion-LD Context Broker Client
"""
import requests
import logging
from typing import Dict, Optional
from .config import ORION_LD_URL, ORION_LD_TENANT, NGSI_LD_CONTEXT

logger = logging.getLogger(__name__)


class OrionLDClient:
    """Client for Orion-LD Context Broker"""
    
    def __init__(self):
        self.base_url = ORION_LD_URL
        self.tenant = ORION_LD_TENANT
        
        # NGSI-LD headers
        self.headers = {
            'Content-Type': 'application/ld+json',
            'NGSILD-Tenant': self.tenant
        }
    
    def create_or_update_entity(self, entity: Dict) -> bool:
        """
        Upsert entity in Orion-LD (create if not exists, update if exists)
        This ensures notifications always reference the same entity ID for SSE real-time
        
        Args:
            entity: NGSI-LD entity dictionary
            
        Returns:
            True if successful, False otherwise
        """
        entity_id = entity['id']
        
        # Add @context to entity
        entity_with_context = entity.copy()
        entity_with_context['@context'] = NGSI_LD_CONTEXT
        
        try:
            # Try POST first (create new entity)
            url = f"{self.base_url}/ngsi-ld/v1/entities"
            response = requests.post(
                url,
                json=entity_with_context,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 201:
                logger.info(f"Successfully created entity: {entity_id}")
                return True
            elif response.status_code == 409:
                # Entity already exists, update it with PATCH
                logger.debug(f"Entity {entity_id} exists, updating attributes...")
                return self._update_entity(entity)
            else:
                logger.error(
                    f"Error creating entity {entity_id}: "
                    f"{response.status_code} - {response.text}"
                )
                return False
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Error creating entity {entity_id}: {e}")
            return False
    
    def _update_entity(self, entity: Dict) -> bool:
        """
        Update an existing entity using PATCH operation
        
        Args:
            entity: NGSI-LD entity dictionary
            
        Returns:
            True if successful, False otherwise
        """
        entity_id = entity['id']
        
        # Remove id, type, and Relationships from update payload
        # Orion-LD doesn't allow updating Relationships via PATCH /attrs
        update_payload = {
            k: v for k, v in entity.items() 
            if k not in ['id', 'type'] and 
            (not isinstance(v, dict) or v.get('type') != 'Relationship')
        }
        update_payload['@context'] = NGSI_LD_CONTEXT
        
        try:
            url = f"{self.base_url}/ngsi-ld/v1/entities/{entity_id}/attrs"
            response = requests.patch(
                url,
                json=update_payload,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 204:
                logger.info(f"Successfully updated entity: {entity_id}")
                return True
            else:
                logger.error(
                    f"Error updating entity {entity_id}: "
                    f"{response.status_code} - {response.text}"
                )
                return False
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Error updating entity {entity_id}: {e}")
            return False
    
    def get_entity(self, entity_id: str) -> Optional[Dict]:
        """
        Retrieve an entity from Orion-LD
        
        Args:
            entity_id: Entity ID
            
        Returns:
            Entity dictionary or None if not found
        """
        try:
            url = f"{self.base_url}/ngsi-ld/v1/entities/{entity_id}"
            response = requests.get(
                url,
                headers={'NGSILD-Tenant': self.tenant},
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                logger.warning(f"Entity not found: {entity_id}")
                return None
            else:
                logger.error(
                    f"Error getting entity {entity_id}: "
                    f"{response.status_code} - {response.text}"
                )
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Error getting entity {entity_id}: {e}")
            return None
    
    def delete_entity(self, entity_id: str) -> bool:
        """
        Delete an entity from Orion-LD
        
        Args:
            entity_id: Entity ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            url = f"{self.base_url}/ngsi-ld/v1/entities/{entity_id}"
            response = requests.delete(
                url,
                headers={'NGSILD-Tenant': self.tenant},
                timeout=10
            )
            
            if response.status_code == 204:
                logger.info(f"Successfully deleted entity: {entity_id}")
                return True
            else:
                logger.error(
                    f"Error deleting entity {entity_id}: "
                    f"{response.status_code} - {response.text}"
                )
                return False
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Error deleting entity {entity_id}: {e}")
            return False
