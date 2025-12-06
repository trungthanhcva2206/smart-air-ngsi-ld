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
Script để test kết nối với OpenWeather API và Orion-LD
"""
import sys
from dotenv import load_dotenv
from etl.Core_ETL.openweather_client import OpenWeatherClient
from etl.Core_ETL.orion_client import OrionLDClient
from etl.Core_ETL.models import WeatherObservedEntity, AirQualityObservedEntity

# Load environment
load_dotenv()


def test_openweather():
    """Test kết nối OpenWeather API"""
    print("=" * 60)
    print("Testing OpenWeather API Connection")
    print("=" * 60)
    
    try:
        client = OpenWeatherClient()
        
        # Test với tọa độ Hoàn Kiếm
        lat, lon = 21.0285, 105.852
        
        print(f"\nFetching weather data for Hoàn Kiếm ({lat}, {lon})...")
        weather_data = client.get_weather_data(lat, lon)
        
        if weather_data:
            print("[SUCCESS] Weather API: SUCCESS")
            print(f"   Temperature: {weather_data['main']['temp']}°C")
            print(f"   Weather: {weather_data['weather'][0]['description']}")
        else:
            print("[FAIL] Weather API: FAILED")
            return False
        
        print(f"\nFetching air quality data for Hoàn Kiếm ({lat}, {lon})...")
        air_data = client.get_air_quality_data(lat, lon)
        
        if air_data:
            print("[SUCCESS] Air Quality API: SUCCESS")
            aqi = air_data['list'][0]['main']['aqi']
            pm25 = air_data['list'][0]['components']['pm2_5']
            print(f"   AQI: {aqi}")
            print(f"   PM2.5: {pm25} μg/m³")
        else:
            print("[FAIL] Air Quality API: FAILED")
            return False
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return False


def test_orion_ld():
    """Test kết nối Orion-LD"""
    print("\n" + "=" * 60)
    print("Testing Orion-LD Connection")
    print("=" * 60)
    
    try:
        client = OrionLDClient()
        
        # Create a test entity
        test_entity = {
            "id": "urn:ngsi-ld:Test:ConnectionTest",
            "type": "Test",
            "name": {
                "type": "Property",
                "value": "Connection Test"
            }
        }
        
        print("\nCreating test entity...")
        success = client.create_or_update_entity(test_entity)
        
        if success:
            print("[SUCCESS] Create Entity: SUCCESS")
        else:
            print("[FAIL] Create Entity: FAILED")
            return False
        
        print("\nRetrieving test entity...")
        entity = client.get_entity(test_entity['id'])
        
        if entity:
            print("[SUCCESS] Get Entity: SUCCESS")
            print(f"   Entity ID: {entity['id']}")
            print(f"   Entity Type: {entity['type']}")
        else:
            print("[FAIL] Get Entity: FAILED")
            return False
        
        print("\nDeleting test entity...")
        success = client.delete_entity(test_entity['id'])
        
        if success:
            print("[SUCCESS] Delete Entity: SUCCESS")
        else:
            print("[FAIL] Delete Entity: FAILED")
            return False
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return False


def test_entity_creation():
    """Test tạo NGSI-LD entities"""
    print("\n" + "=" * 60)
    print("Testing NGSI-LD Entity Creation")
    print("=" * 60)
    
    try:
        # Mock data
        location = {'lat': 21.0285, 'lon': 105.8542}
        
        weather_data = {
            'main': {
                'temp': 25.5,
                'feels_like': 26.0,
                'pressure': 1013,
                'humidity': 75
            },
            'weather': [
                {'main': 'Clear', 'description': 'clear sky'}
            ],
            'wind': {
                'speed': 3.5,
                'deg': 180
            },
            'visibility': 10000,
            'clouds': {'all': 20}
        }
        
        air_data = {
            'list': [{
                'main': {'aqi': 3},
                'components': {
                    'co': 400.0,
                    'no': 0.5,
                    'no2': 20.0,
                    'o3': 50.0,
                    'so2': 10.0,
                    'pm2_5': 35.0,
                    'pm10': 45.0,
                    'nh3': 5.0
                }
            }]
        }
        
        print("\nCreating WeatherObserved entity...")
        weather_entity = WeatherObservedEntity.create(
            'HoanKiem', location, weather_data
        )
        print("[SUCCESS] WeatherObserved entity created")
        print(f"   ID: {weather_entity['id']}")
        print(f"   Type: {weather_entity['type']}")
        
        print("\nCreating AirQualityObserved entity...")
        air_entity = AirQualityObservedEntity.create(
            'HoanKiem', location, air_data, weather_data  # Pass weather_data
        )
        print("[SUCCESS] AirQualityObserved entity created")
        print(f"   ID: {air_entity['id']}")
        print(f"   Type: {air_entity['type']}")
        print(f"   Has temperature: {'temperature' in air_entity}")
        print(f"   Has windSpeed: {'windSpeed' in air_entity}")
        print(f"   CO Level: {air_entity.get('CO_Level', {}).get('value', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return False


def main():
    """Main test function"""
    print("\n" + "=" * 60)
    print("ETL Pipeline Connection Test")
    print("=" * 60)
    
    results = {
        'OpenWeather API': test_openweather(),
        'Orion-LD': test_orion_ld(),
        'Entity Creation': test_entity_creation()
    }
    
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    
    all_passed = True
    for test_name, result in results.items():
        status = "[PASSED]" if result else "[FAILED]"
        print(f"{test_name}: {status}")
        if not result:
            all_passed = False
    
    print("=" * 60)
    
    if all_passed:
        print("\n[SUCCESS] All tests passed! You're ready to run the ETL pipeline.")
        print("Run: python main.py")
        sys.exit(0)
    else:
        print("\n[ERROR] Some tests failed. Please check your configuration.")
        sys.exit(1)


if __name__ == "__main__":
    main()
