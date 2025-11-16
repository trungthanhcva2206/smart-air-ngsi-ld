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
Main entry point for ETL Pipeline with QuantumLeap Integration
"""
import logging
import schedule
import time
import sys
import os
from datetime import datetime
from .etl_pipeline import ETLPipeline
from .orion_client import OrionLDClient
from .quantum_leap_client import QuantumLeapClient
from .subscription_manager import SubscriptionManager
from .sosa_ssn_models import SensorEntity, PlatformEntity, ObservablePropertyEntity
from .config import (
    ETL_INTERVAL_MINUTES, LOG_LEVEL, HANOI_DISTRICTS,
    QUANTUMLEAP_ENABLED
)

# Configure UTF-8 encoding for stdout/stderr
try:
    # Python 3.7+
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    # fallback
    import io, codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer)
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer)

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('etl.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


def check_sosa_ssn_infrastructure(orion_client: OrionLDClient) -> bool:
    """
    Check if SOSA/SSN infrastructure exists in Orion-LD
    
    Returns:
        True if infrastructure exists, False otherwise
    """
    logger.info("Checking SOSA/SSN infrastructure...")
    
    # Check for at least one ObservableProperty
    try:
        test_property = orion_client.get_entity("urn:ngsi-ld:ObservableProperty:Temperature")
        if test_property:
            logger.info("[OK] SOSA/SSN infrastructure detected")
            return True
    except:
        pass
    
    logger.warning("[NOT FOUND] SOSA/SSN infrastructure not found")
    return False


def initialize_sosa_ssn_infrastructure(orion_client: OrionLDClient) -> bool:
    """
    Initialize SOSA/SSN infrastructure if not exists
    
    Returns:
        True if successful, False otherwise
    """
    logger.info("=" * 70)
    logger.info("Initializing SOSA/SSN Infrastructure")
    logger.info("=" * 70)
    
    total_success = 0
    total_error = 0
    
    try:
        # Step 1: Create Observable Properties
        logger.info("\n[STEP 1/2] Creating Observable Properties...")
        properties = ObservablePropertyEntity.create_all_properties()
        
        for prop in properties:
            if orion_client.create_or_update_entity(prop):
                total_success += 1
            else:
                total_error += 1
        
        logger.info(f"  Created {len(properties)} observable properties")
        
        # Step 2: Create Platforms and Sensors
        logger.info("\n[STEP 2/2] Creating Platforms and Sensors...")
        
        for district_name, location in HANOI_DISTRICTS.items():
            # Unified Environment Platform (hosts both sensors)
            env_platform = PlatformEntity.create_environment_platform(district_name, location)
            if orion_client.create_or_update_entity(env_platform):
                total_success += 1
            else:
                total_error += 1
            
            # Weather Sensor
            weather_sensor = SensorEntity.create_weather_sensor(district_name, location)
            if orion_client.create_or_update_entity(weather_sensor):
                total_success += 1
            else:
                total_error += 1
            
            # Air Quality Sensor
            aq_sensor = SensorEntity.create_air_quality_sensor(district_name, location)
            if orion_client.create_or_update_entity(aq_sensor):
                total_success += 1
            else:
                total_error += 1
            
            logger.info(f"  [OK] Created infrastructure for {district_name}")
        
        logger.info("=" * 70)
        logger.info("[SUCCESS] SOSA/SSN Infrastructure Initialization Complete!")
        logger.info(f"  Total created: {total_success} entities")
        logger.info(f"  Total failed: {total_error} entities")
        logger.info("=" * 70)
        
        return total_error == 0
        
    except Exception as e:
        logger.error(f"Error during SOSA/SSN initialization: {e}", exc_info=True)
        return False


def check_quantumleap_connection() -> bool:
    """
    Check QuantumLeap connection and health
    
    Returns:
        True if QuantumLeap is available, False otherwise
    """
    if not QUANTUMLEAP_ENABLED:
        logger.info("QuantumLeap is disabled in configuration")
        return False
    
    logger.info("Checking QuantumLeap connection...")
    
    try:
        ql_client = QuantumLeapClient()
        
        # Check health
        health = ql_client.get_health()
        if health:
            logger.info("[OK] QuantumLeap is healthy")
            
            # Get version info
            version = ql_client.get_version()
            if version:
                logger.info(f"  Version: {version.get('version', 'unknown')}")
            
            return True
        else:
            logger.warning("[WARNING] QuantumLeap health check failed")
            return False
            
    except Exception as e:
        logger.error(f"Error checking QuantumLeap: {e}")
        return False


def setup_quantumleap_subscriptions() -> bool:
    """
    Set up subscriptions from Orion-LD to QuantumLeap
    
    Returns:
        True if successful, False otherwise
    """
    if not QUANTUMLEAP_ENABLED:
        return True
    
    logger.info("\n" + "=" * 70)
    logger.info("Setting up QuantumLeap Subscriptions")
    logger.info("=" * 70)
    
    try:
        subscription_mgr = SubscriptionManager()
        results = subscription_mgr.setup_all_subscriptions()
        
        return all(results.values())
        
    except Exception as e:
        logger.error(f"Error setting up QuantumLeap subscriptions: {e}", exc_info=True)
        return False


def run_etl_job():
    """Job function to be scheduled"""
    logger.info(f"ETL job started at {datetime.now()}")
    
    try:
        pipeline = ETLPipeline()
        pipeline.run_etl_cycle()
        
        # Log statistics
        stats = pipeline.get_statistics()
        logger.info(f"ETL Statistics: {stats}")
        
        # Cleanup
        pipeline.cleanup()
        
    except Exception as e:
        logger.error(f"Error in ETL job: {e}", exc_info=True)


def main():
    """Main function"""
    logger.info("=" * 70)
    logger.info("Smart Air Quality Monitoring ETL Pipeline")
    logger.info("Hanoi Smart City Project - NGSI-LD + SOSA/SSN + QuantumLeap")
    logger.info("=" * 70)
    
    try:
        # Check and initialize SOSA/SSN infrastructure
        orion_client = OrionLDClient()
        
        if not check_sosa_ssn_infrastructure(orion_client):
            logger.info("\nInitializing SOSA/SSN infrastructure (first time setup)...")
            if not initialize_sosa_ssn_infrastructure(orion_client):
                logger.error("Failed to initialize SOSA/SSN infrastructure")
                logger.error("Please check Orion-LD connection and try again")
                sys.exit(1)
            logger.info("\n" + "=" * 70)
        
        # Check QuantumLeap connection
        if QUANTUMLEAP_ENABLED:
            if check_quantumleap_connection():
                # Setup subscriptions
                if not setup_quantumleap_subscriptions():
                    logger.warning("Failed to set up some QuantumLeap subscriptions")
                    logger.warning("Time series data may not be persisted")
            else:
                logger.warning("QuantumLeap is not available")
                logger.warning("Time series data will not be persisted")
        
        logger.info("\n" + "=" * 70)
        logger.info(f"ETL Interval: {ETL_INTERVAL_MINUTES} minutes")
        logger.info(f"Number of districts: {len(HANOI_DISTRICTS)}")
        logger.info(f"Estimated daily requests: {(1440 / ETL_INTERVAL_MINUTES) * len(HANOI_DISTRICTS) * 2:.0f}")
        logger.info(f"QuantumLeap: {'Enabled' if QUANTUMLEAP_ENABLED else 'Disabled'}")
        
        # Check MQTT configuration
        enable_mqtt = os.getenv('ENABLE_MQTT', 'true').lower() in ('true', '1', 'yes')
        mqtt_host = os.getenv('MQTT_BROKER_HOST', 'localhost')
        mqtt_port = os.getenv('MQTT_BROKER_PORT', '1883')
        
        if enable_mqtt:
            logger.info(f"MQTT Publishing: ENABLED (FIWARE IoT Agent path)")
            logger.info(f"  MQTT Broker: {mqtt_host}:{mqtt_port}")
            logger.info(f"  Dual-path mode: REST + MQTT")
        else:
            logger.info(f"MQTT Publishing: DISABLED (REST-only mode)")
        
        logger.info("=" * 70)
        
        # Run immediately on startup
        logger.info("\nRunning initial ETL cycle...")
        run_etl_job()
        
        # Schedule periodic runs
        schedule.every(ETL_INTERVAL_MINUTES).minutes.do(run_etl_job)
        
        logger.info(f"\nETL scheduled to run every {ETL_INTERVAL_MINUTES} minutes")
        logger.info("Press Ctrl+C to stop")
        
        # Keep the script running
        try:
            while True:
                schedule.run_pending()
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("\nETL Pipeline stopped by user")
            sys.exit(0)
            
    except Exception as e:
        logger.error(f"Error in main: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()