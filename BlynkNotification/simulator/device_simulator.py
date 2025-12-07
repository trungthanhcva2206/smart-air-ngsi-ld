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
 * @Project Air Track NGSI-LD
 * @Authors 
 *    - TT (trungthanhcva2206@gmail.com)
 *    - Tankchoi (tadzltv22082004@gmail.com)
 *    - Panh (panh812004.apn@gmail.com)
 * @Copyright (C) 2025 TAA. All rights reserved
 * @GitHub https://github.com/trungthanhcva2206/smart-air-ngsi-ld
 */
"""

import os
import sys

from flask.cli import load_dotenv
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import time
import requests
import logging
from datetime import datetime
from typing import Dict, Optional

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DeviceSimulator:
    """Giả lập thiết bị IoT"""
    
    def __init__(self, name: str, pin: str, blynk_token: str):
        self.name = name
        self.pin = pin
        self.blynk_token = blynk_token
        self.state = 0  # 0 = OFF, 1 = ON
        self.last_update = None
        self.base_url = "https://blynk.cloud/external/api"
    
    def get_current_state(self) -> Optional[int]:
        """Lấy trạng thái hiện tại từ Blynk"""
        try:
            url = f"{self.base_url}/get"
            params = {
                'token': self.blynk_token,
                'pin': self.pin
            }
            
            response = requests.get(url, params=params, timeout=5)
            if response.status_code == 200:
                new_state = int(response.text)
                
                # Kiểm tra thay đổi
                if new_state != self.state:
                    old_state = "OFF" if self.state == 0 else "ON"
                    new_state_str = "OFF" if new_state == 0 else "ON"
                    
                    logger.info(
                        f"🔄 [{self.name}] Trạng thái thay đổi: "
                        f"{old_state} → {new_state_str}"
                    )
                    
                    self.state = new_state
                    self.last_update = datetime.now()
                    
                    # Giả lập hành động thiết bị
                    self.simulate_action()
                
                return new_state
            else:
                logger.error(f"Error getting state: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error: {e}")
            return None
    
    def simulate_action(self):
        """Giả lập hành động của thiết bị"""
        if self.state == 1:
            logger.info(f"⚡ [{self.name}] Đang BẬT - Đang hoạt động...")
            # Giả lập hoạt động (LED nhấp nháy, motor quay, etc.)
            self.show_operation()
        else:
            logger.info(f"💤 [{self.name}] Đã TẮT - Đang chờ lệnh...")
    
    def show_operation(self):
        """Hiển thị hoạt động giả lập"""
        operations = {
            "Air Purifier": "🌪️  Đang lọc không khí... Quạt đang quay với công suất cao",
            "Irrigation": "💧 Đang tưới cây... Bơm nước hoạt động",
            "Heater": "🔥 Đang sưởi ấm... Nhiệt độ đang tăng",
            "AC": "❄️  Đang làm mát... Compressor đang chạy"
        }
        
        print(f"    {operations.get(self.name, '⚙️ Đang hoạt động...')}")
    
    def send_telemetry(self, pin: str, value: float):
        """Gửi dữ liệu telemetry về Blynk (optional)"""
        try:
            url = f"{self.base_url}/update"
            params = {
                'token': self.blynk_token,
                'pin': pin,
                'value': value
            }
            
            response = requests.get(url, params=params, timeout=5)
            if response.status_code == 200:
                logger.debug(f"Sent telemetry {pin}={value}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error sending telemetry: {e}")
            return False


class SmartHomeSimulator:
    """Giả lập toàn bộ hệ thống Smart Home"""
    
    def __init__(self, blynk_token: str):
        self.devices = [
            DeviceSimulator("Air Purifier", "V1", blynk_token),
            DeviceSimulator("Irrigation", "V2", blynk_token),
            DeviceSimulator("Heater", "V3", blynk_token),
            DeviceSimulator("AC", "V4", blynk_token),
        ]
        
        # Virtual sensors cho telemetry
        self.sensor_pins = {
            "temperature": "V10",
            "humidity": "V11",
            "aqi": "V12",
            "pm25": "V13"
        }
    
    def monitor_devices(self):
        """Giám sát tất cả thiết bị"""
        logger.info("=" * 60)
        logger.info("🏠 Smart Home Simulator Started")
        logger.info("=" * 60)
        logger.info("Monitoring devices... Press Ctrl+C to stop\n")
        
        try:
            while True:
                print(f"\n{'='*60}")
                print(f"⏰ {datetime.now().strftime('%H:%M:%S %d/%m/%Y')}")
                print(f"{'='*60}")
                
                # Kiểm tra từng thiết bị
                for device in self.devices:
                    state = device.get_current_state()
                    if state is not None:
                        status = "🟢 ON " if state == 1 else "🔴 OFF"
                        print(f"{status} | {device.name:20s} | Pin: {device.pin}")
                
                print(f"{'='*60}\n")
                
                # Đợi 5 giây trước khi kiểm tra lại
                time.sleep(5)
                
        except KeyboardInterrupt:
            logger.info("\n\n🛑 Simulator stopped by user")
            self.shutdown()
    
    def shutdown(self):
        """Tắt tất cả thiết bị khi dừng"""
        logger.info("Shutting down all devices...")
        for device in self.devices:
            if device.state == 1:
                logger.info(f"Turning off {device.name}...")
        logger.info("Goodbye! 👋")
    
    def show_dashboard(self):
        """Hiển thị dashboard giả lập"""
        print("\n" + "="*60)
        print("📊 SMART HOME DASHBOARD")
        print("="*60)
        
        for device in self.devices:
            status = "🟢 ON " if device.state == 1 else "🔴 OFF"
            last_update = device.last_update.strftime('%H:%M:%S') if device.last_update else "Never"
            print(f"{status} | {device.name:20s} | Last update: {last_update}")
        
        print("="*60 + "\n")


def demo_manual_control(blynk_token: str):
    """Demo điều khiển thủ công"""
    print("\n" + "="*60)
    print("🎮 MANUAL CONTROL DEMO")
    print("="*60)
    
    base_url = "https://blynk.cloud/external/api"
    
    # Bật máy lọc không khí
    print("\n1️⃣ Bật máy lọc không khí (V1)...")
    response = requests.get(
        f"{base_url}/update",
        params={'token': blynk_token, 'pin': 'V1', 'value': 1}
    )
    print(f"   Result: {response.status_code} - {response.text}")
    time.sleep(2)
    
    # Kiểm tra trạng thái
    print("\n2️⃣ Kiểm tra trạng thái V1...")
    response = requests.get(
        f"{base_url}/get",
        params={'token': blynk_token, 'pin': 'V1'}
    )
    print(f"   V1 State: {response.text} (1=ON, 0=OFF)")
    time.sleep(2)
    
    # Tắt máy lọc không khí
    print("\n3️⃣ Tắt máy lọc không khí (V1)...")
    response = requests.get(
        f"{base_url}/update",
        params={'token': blynk_token, 'pin': 'V1', 'value': 0}
    )
    print(f"   Result: {response.status_code} - {response.text}")
    
    print("\n" + "="*60)
    print("✅ Demo completed!\n")


def main():
    """Main function"""
    from dotenv import load_dotenv
    
    # Sửa đường dẫn đúng
    env_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),  # lên BlynkNotification/
        'config',
        '.env.blynk'
    )
    
    load_dotenv(env_path)
    
    BLYNK_TOKEN = os.getenv('BLYNK_TOKEN')
    
    if not BLYNK_TOKEN:
        print(f"❌ Error: BLYNK_TOKEN not found")
        print(f"Looking for: {env_path}")
        print(f"File exists: {os.path.exists(env_path)}")
        print("\nPlease check:")
        print("1. File config/.env.blynk exists")
        print("2. BLYNK_TOKEN is set in that file")
        return
    
    print("\n" + "="*60)
    print("🏠 BLYNK DEVICE SIMULATOR")
    print("="*60)
    print(f"✅ Blynk Token loaded: {BLYNK_TOKEN[:10]}...")
    print("\nOptions:")
    print("1. Start continuous monitoring (recommended)")
    print("2. Run manual control demo")
    print("3. Exit")
    
    choice = input("\nSelect option (1-3): ").strip()
    
    if choice == "1":
        simulator = SmartHomeSimulator(BLYNK_TOKEN)
        simulator.monitor_devices()
    
    elif choice == "2":
        demo_manual_control(BLYNK_TOKEN)
        
        # Sau đó chạy monitoring
        print("\nStarting monitoring in 3 seconds...")
        time.sleep(3)
        simulator = SmartHomeSimulator(BLYNK_TOKEN)
        simulator.monitor_devices()
    
    elif choice == "3":
        print("Goodbye! 👋")
    
    else:
        print("Invalid option!")


if __name__ == "__main__":
    main()