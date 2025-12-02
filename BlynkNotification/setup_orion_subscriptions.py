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

import requests
import json
import logging
import os
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv('config/.env.blynk')

# Configuration
ORION_LD_URL = os.getenv('ORION_LD_URL', 'http://localhost:1026')
ORION_LD_TENANT = os.getenv('ORION_LD_TENANT', 'hanoi')
WEBHOOK_URL = os.getenv('WEBHOOK_URL', 'http://localhost:4999')  # URL của notification service

NGSI_LD_CONTEXT = [
    "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld",
    "https://raw.githubusercontent.com/smart-data-models/dataModel.Environment/master/context.jsonld"
]


def create_weather_notification_subscription():
    """
    Tạo subscription cho WeatherObserved entities
    Mỗi khi có dữ liệu thời tiết mới, Orion-LD sẽ gọi webhook
    """
    subscription = {
        "id": "urn:ngsi-ld:Subscription:WeatherNotification",
        "type": "Subscription",
        "description": "Notify webhook immediately when weather data changes",
        "entities": [
            {
                "type": "weatherObserved"
            }
        ],
        "watchedAttributes": [
            "temperature",
            "feelsLikeTemperature",
            "relativeHumidity",
            "precipitation",
            "windSpeed"
        ],
        "notification": {
            "attributes": [
                "temperature",
                "feelsLikeTemperature",
                "relativeHumidity",
                "precipitation",
                "windSpeed",
                "windDirection",
                "stationName",
                "location",
                "dateObserved"
            ],
            "format": "normalized",
            "endpoint": {
                "uri": f"{WEBHOOK_URL}/webhook/weather",
                "accept": "application/json"
            }
        },
        "@context": NGSI_LD_CONTEXT
    }
    
    return _create_subscription(subscription)


def create_airquality_notification_subscription():
    """
    Tạo subscription cho AirQualityObserved entities
    Mỗi khi có dữ liệu chất lượng không khí mới, Orion-LD sẽ gọi webhook
    """
    subscription = {
        "id": "urn:ngsi-ld:Subscription:AirQualityNotification",
        "type": "Subscription",
        "description": "Notify webhook immediately when air quality data changes",
        "entities": [
            {
                "type": "airQualityObserved"
            }
        ],
        "watchedAttributes": [
            "airQualityIndex",
            "airQualityLevel",
            "pm2_5",
            "pm10",
            "CO",
            "NO2",
            "O3",
            "SO2"
        ],
        "notification": {
            "attributes": [
                "airQualityIndex",
                "airQualityLevel",
                "pm2_5",
                "pm10",
                "CO",
                "NO2",
                "O3",
                "SO2",
                "temperature",
                "relativeHumidity",
                "stationName",
                "location",
                "dateObserved"
            ],
            "format": "normalized",
            "endpoint": {
                "uri": f"{WEBHOOK_URL}/webhook/airquality",
                "accept": "application/json"
            }
        },
        "@context": NGSI_LD_CONTEXT
    }
    
    return _create_subscription(subscription)


def _create_subscription(subscription: dict) -> bool:
    """
    Tạo subscription trong Orion-LD
    """
    try:
        url = f"{ORION_LD_URL}/ngsi-ld/v1/subscriptions"
        headers = {
            'Content-Type': 'application/ld+json',
            'NGSILD-Tenant': ORION_LD_TENANT
        }
        
        # Check if subscription already exists
        existing = _get_subscription(subscription['id'])
        if existing:
            logger.info(f"✅ Subscription {subscription['id']} already exists")
            
            # Delete and recreate to update
            logger.info(f"🔄 Updating subscription...")
            _delete_subscription(subscription['id'])
        
        # Create subscription
        response = requests.post(
            url,
            json=subscription,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 201:
            logger.info(f"✅ Successfully created subscription: {subscription['id']}")
            logger.info(f"   📡 Webhook: {subscription['notification']['endpoint']['uri']}")
            return True
        else:
            logger.error(
                f"❌ Error creating subscription {subscription['id']}: "
                f"{response.status_code} - {response.text}"
            )
            return False
            
    except Exception as e:
        logger.error(f"❌ Error creating subscription: {e}")
        return False


def _get_subscription(subscription_id: str) -> dict:
    """
    Lấy thông tin subscription
    """
    try:
        url = f"{ORION_LD_URL}/ngsi-ld/v1/subscriptions/{subscription_id}"
        headers = {'NGSILD-Tenant': ORION_LD_TENANT}
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return response.json()
        return None
        
    except Exception:
        return None


def _delete_subscription(subscription_id: str) -> bool:
    """
    Xóa subscription
    """
    try:
        url = f"{ORION_LD_URL}/ngsi-ld/v1/subscriptions/{subscription_id}"
        headers = {'NGSILD-Tenant': ORION_LD_TENANT}
        
        response = requests.delete(url, headers=headers, timeout=10)
        
        if response.status_code == 204:
            logger.info(f"🗑️ Deleted old subscription: {subscription_id}")
            return True
        return False
        
    except Exception:
        return False


def list_all_subscriptions():
    """
    Liệt kê tất cả subscriptions
    """
    try:
        url = f"{ORION_LD_URL}/ngsi-ld/v1/subscriptions"
        headers = {'NGSILD-Tenant': ORION_LD_TENANT}
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            subscriptions = response.json()
            logger.info(f"\n📋 Total subscriptions: {len(subscriptions)}")
            
            for sub in subscriptions:
                logger.info(f"\n{'='*60}")
                logger.info(f"ID: {sub.get('id')}")
                logger.info(f"Type: {sub.get('entities', [{}])[0].get('type', 'N/A')}")
                logger.info(f"Webhook: {sub.get('notification', {}).get('endpoint', {}).get('uri', 'N/A')}")
                logger.info(f"Status: {'Active' if sub.get('status', 'active') == 'active' else 'Inactive'}")
            
            logger.info(f"{'='*60}\n")
            return subscriptions
        else:
            logger.error(f"Error listing subscriptions: {response.status_code}")
            return []
            
    except Exception as e:
        logger.error(f"Error listing subscriptions: {e}")
        return []


def test_webhook_connectivity():
    """
    Test xem webhook có accessible từ Orion-LD không
    """
    # Test trên localhost trước (cho Windows/local)
    local_url = f"http://localhost:{WEBHOOK_URL.split(':')[-1]}/health"
    
    try:
        response = requests.get(local_url, timeout=5)
        
        if response.status_code == 200:
            logger.info(f"✅ Webhook is accessible at {local_url}")
            logger.info(f"   Response: {response.json()}")
            
            # Giải thích về Docker URL
            logger.info(f"\nℹ️  Note: Orion-LD (trong Docker) sẽ dùng: {WEBHOOK_URL}")
            logger.info("   Docker containers sẽ dùng 'host.docker.internal' để kết nối đến host machine")
            
            return True
        else:
            logger.warning(f"⚠️ Webhook returned status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        logger.error(f"❌ Cannot connect to webhook at {local_url}")
        logger.error("   Make sure notification service is running!")
        logger.error("\n💡 Run this command in another terminal:")
        logger.error("   cd D:\\smart-air-ngsi-ld\\BlynkNotification")
        logger.error("   python services\\notification_service.py")
        return False
    except Exception as e:
        logger.error(f"❌ Error testing webhook: {e}")
        return False


def main():
    """
    Main function
    """
    logger.info("="*60)
    logger.info("🔧 Orion-LD Subscription Setup for Notification Service")
    logger.info("="*60)
    logger.info(f"Orion-LD URL: {ORION_LD_URL}")
    logger.info(f"Webhook URL: {WEBHOOK_URL}")
    logger.info(f"Tenant: {ORION_LD_TENANT}")
    logger.info("="*60)
    
    # Step 1: Test webhook connectivity
    logger.info("\n[STEP 1/4] Testing webhook connectivity...")
    if not test_webhook_connectivity():
        logger.error("\n❌ Webhook is not accessible!")
        logger.error("Please start the notification service first:")
        logger.error("  python event_driven_notification_service.py")
        return
    
    # Step 2: List existing subscriptions
    logger.info("\n[STEP 2/4] Listing existing subscriptions...")
    list_all_subscriptions()
    
    # Step 3: Create weather subscription
    logger.info("\n[STEP 3/4] Creating weather notification subscription...")
    weather_success = create_weather_notification_subscription()
    
    # Step 4: Create air quality subscription
    logger.info("\n[STEP 4/4] Creating air quality notification subscription...")
    airquality_success = create_airquality_notification_subscription()
    
    # Summary
    logger.info("\n" + "="*60)
    if weather_success and airquality_success:
        logger.info("✅ All subscriptions created successfully!")
        logger.info("\n🎉 Setup complete! Now when ETL pipeline updates data:")
        logger.info("   1. Orion-LD receives new data")
        logger.info("   2. Orion-LD immediately calls webhook")
        logger.info("   3. Notification service processes and sends alerts")
        logger.info("   4. Telegram bot sends message to users")
        logger.info("   5. NO DELAY! ⚡")
    else:
        logger.warning("⚠️ Some subscriptions failed to create")
        logger.warning("Check the errors above and try again")
    logger.info("="*60)


if __name__ == "__main__":
    main()