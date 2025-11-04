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
import os
import json
import logging
from typing import Dict

logger = logging.getLogger(__name__)


def load_hanoi_districts_from_geojson(path: str) -> Dict[str, Dict]:
    """
    Load districts from a GeoJSON file. Expects Feature.properties to contain
    a name key (e.g. 'Tên đơn vị' or 'name') and 'lat'/'lon'.
    Returns a dict keyed by district name with {'address','lat','lon'}.
    """
    try:
        with open(path, 'r', encoding='utf-8') as f:
            gj = json.load(f)
    except Exception as e:
        logger.error(f"Failed to load GeoJSON {path}: {e}")
        return {}

    districts: Dict[str, Dict] = {}
    for feat in gj.get('features', []):
        props = feat.get('properties', {})
        name = props.get('Tên đơn vị') or props.get('Tên đơn vị'.encode('utf-8').decode('utf-8')) or props.get('name') or props.get('NAME')
        # fallback to any common label
        if not name:
            # try other possible keys
            for k in ('ten', 'Ten', 'NAME', 'name'):
                if k in props:
                    name = props[k]
                    break

        lat = props.get('lat')
        lon = props.get('lon')

        if name is None or lat is None or lon is None:
            continue

        districts[str(name)] = {
            'address': props.get('address') or props.get('Địa chỉ') or str(name),
            'lat': float(lat),
            'lon': float(lon)
        }

    logger.info(f"Loaded {len(districts)} districts from {path}")
    return districts


# Default path can be overridden with env var HANOI_GEOJSON_PATH
DEFAULT_GEOJSON = os.getenv('HANOI_GEOJSON_PATH', r'd:\smart-air-ngsi-ld\etl\ha_noi_with_latlon2.geojson')
HANOI_DISTRICTS = load_hanoi_districts_from_geojson(DEFAULT_GEOJSON)