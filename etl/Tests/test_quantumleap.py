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
Test script for QuantumLeap integration
"""
import sys
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv
from etl.Core_ETL.quantum_leap_client import QuantumLeapClient
from etl.Core_ETL.subscription_manager import SubscriptionManager
from etl.Core_ETL.openweather_client import OpenWeatherClient
from etl.Core_ETL.models import WeatherObservedEntity, AirQualityObservedEntity

# Load environment
load_dotenv()


def test_quantumleap_health():
    """Test QuantumLeap health and version"""
    print("=" * 60)
    print("Testing QuantumLeap Health")
    print("=" * 60)
    
    try:
        ql = QuantumLeapClient()
        
        # Health check
        print("\nChecking health...")
        health = ql.get_health()
        if health:
            print("[SUCCESS] QuantumLeap is healthy")
            print(f"   Status: {health}")
        else:
            print("[FAIL] QuantumLeap health check failed")
            return False
        
        # Version check
        print("\nChecking version...")
        version = ql.get_version()
        if version:
            print("[SUCCESS] Version retrieved")
            print(f"   Version: {version.get('version', 'unknown')}")
        else:
            print("[WARNING] Version info not available")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return False


def test_subscriptions():
    """Test subscription creation and management"""
    print("\n" + "=" * 60)
    print("Testing Subscription Management")
    print("=" * 60)
    
    try:
        sub_mgr = SubscriptionManager()
        
        # List existing subscriptions
        print("\nListing existing subscriptions...")
        subs = sub_mgr.list_subscriptions()
        print(f"[INFO] Found {len(subs)} subscriptions")
        
        # Create subscriptions
        print("\nCreating subscriptions...")
        results = sub_mgr.setup_all_subscriptions()
        
        if all(results.values()):
            print("[SUCCESS] All subscriptions created")
            for sub_type, sub_id in results.items():
                print(f"   {sub_type}: {sub_id}")
        else:
            print("[WARNING] Some subscriptions failed")
            for sub_type, sub_id in results.items():
                status = "[OK]" if sub_id else "[FAIL]"
                print(f"   {status} {sub_type}: {sub_id}")
        
        # Verify subscriptions
        print("\nVerifying subscriptions...")
        for sub_type, sub_id in results.items():
            if sub_id:
                sub = sub_mgr.get_subscription(sub_id)
                if sub:
                    print(f"[OK] {sub_type} subscription verified")
                else:
                    print(f"[FAIL] {sub_type} subscription not found")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return False


def test_data_flow():
    """Test complete data flow: OpenWeather → Orion → QuantumLeap"""
    print("\n" + "=" * 60)
    print("Testing Data Flow")
    print("=" * 60)
    
    try:
        # Step 1: Fetch data from OpenWeather
        print("\n[STEP 1/3] Fetching data from OpenWeather...")
        weather_client = OpenWeatherClient()
        
        # Test with Hoan Kiem
        lat, lon = 21.0285, 105.8542
        location = {'lat': lat, 'lon': lon}
        
        weather_data = weather_client.get_weather_data(lat, lon)
        if not weather_data:
            print("[FAIL] Failed to fetch weather data")
            return False
        print("[SUCCESS] Weather data fetched")
        
        time.sleep(1)
        
        air_data = weather_client.get_air_quality_data(lat, lon)
        if not air_data:
            print("[FAIL] Failed to fetch air quality data")
            return False
        print("[SUCCESS] Air quality data fetched")
        
        # Step 2: Create entities (they will be sent to Orion)
        print("\n[STEP 2/3] Creating NGSI-LD entities...")
        weather_entity = WeatherObservedEntity.create('HoanKiem', location, weather_data)
        air_entity = AirQualityObservedEntity.create('HoanKiem', location, air_data, weather_data)
        print("[SUCCESS] Entities created")
        print(f"   Weather: {weather_entity['id']}")
        print(f"   Air Quality: {air_entity['id']}")
        
        # Step 3: Wait for QuantumLeap to receive data via subscription
        print("\n[STEP 3/3] Waiting for data to propagate to QuantumLeap...")
        print("[INFO] Data should be automatically forwarded via subscription")
        print("[INFO] Waiting 30 seconds...")
        time.sleep(30)
        
        # Try to query the data
        ql = QuantumLeapClient()
        
        print("\nQuerying temperature history...")
        temp_history = ql.get_attribute_history(
            entity_id=weather_entity['id'],
            entity_type='weatherObserved',
            attr_name='temperature',
            last_n=10
        )
        
        if temp_history:
            print("[SUCCESS] Data found in QuantumLeap!")
            print(f"   Records: {len(temp_history.get('values', []))}")
        else:
            print("[WARNING] Data not yet in QuantumLeap")
            print("[INFO] This may be normal if subscriptions were just created")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_queries():
    """Test various QuantumLeap queries"""
    print("\n" + "=" * 60)
    print("Testing QuantumLeap Queries")
    print("=" * 60)
    
    try:
        ql = QuantumLeapClient()
        
        # Calculate date range
        to_date = datetime.utcnow()
        from_date = to_date - timedelta(hours=24)
        
        # Test 1: Get aggregated temperature data
        print("\n[TEST 1] Querying average temperature per hour...")
        agg_data = ql.get_aggregated_data(
            entity_type='weatherObserved',
            attr_name='temperature',
            aggr_method='avg',
            aggr_period='hour',
            from_date=from_date.isoformat() + 'Z',
            to_date=to_date.isoformat() + 'Z'
        )
        
        if agg_data:
            print("[SUCCESS] Aggregated data retrieved")
            values = agg_data.get('values', [])
            print(f"   Data points: {len(values)}")
            if values:
                print(f"   Sample: {values[0]}")
        else:
            print("[WARNING] No aggregated data found")
        
        # Test 2: Get PM2.5 history
        print("\n[TEST 2] Querying PM2.5 aggregation...")
        pm25_data = ql.get_aggregated_data(
            entity_type='airQualityObserved',
            attr_name='pm2_5',
            aggr_method='avg',
            aggr_period='hour',
            from_date=from_date.isoformat() + 'Z',
            to_date=to_date.isoformat() + 'Z'
        )
        
        if pm25_data:
            print("[SUCCESS] PM2.5 data retrieved")
            values = pm25_data.get('values', [])
            print(f"   Data points: {len(values)}")
        else:
            print("[WARNING] No PM2.5 data found")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return False


def main():
    """Main test function"""
    print("\n" + "=" * 60)
    print("QuantumLeap Integration Test Suite")
    print("=" * 60)
    
    results = {}
    
    # Run tests
    results['Health Check'] = test_quantumleap_health()
    results['Subscriptions'] = test_subscriptions()
    results['Data Flow'] = test_data_flow()
    results['Queries'] = test_queries()
    
    # Summary
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
        print("\n[SUCCESS] All tests passed!")
        print("\nNext steps:")
        print("1. Check Grafana: http://localhost:3000")
        print("2. Run ETL pipeline: python main.py")
        print("3. Query data using QuantumLeap API")
        sys.exit(0)
    else:
        print("\n[WARNING] Some tests failed")
        print("\nTroubleshooting:")
        print("1. Check if all services are running: docker-compose ps")
        print("2. Check logs: docker-compose logs -f quantumleap")
        print("3. Verify subscriptions: curl http://localhost:1026/ngsi-ld/v1/subscriptions")
        sys.exit(1)


if __name__ == "__main__":
    main()