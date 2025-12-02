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

import logging
import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
from flask import Flask, request, jsonify
import requests
import threading
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class AlertType:
    HIGH_AQI = "high_aqi"
    HIGH_HUMIDITY = "high_humidity"
    LOW_TEMPERATURE = "low_temperature"
    HIGH_TEMPERATURE = "high_temperature"
    HEAVY_RAIN = "heavy_rain"
    HIGH_PM25 = "high_pm25"


class DeviceAction:
    AIR_PURIFIER_ON = "air_purifier_on"
    AIR_PURIFIER_OFF = "air_purifier_off"
    IRRIGATION_ON = "irrigation_on"
    IRRIGATION_OFF = "irrigation_off"
    HEATER_ON = "heater_on"
    HEATER_OFF = "heater_off"
    AC_ON = "ac_on"
    AC_OFF = "ac_off"


@dataclass
class UserSubscription:
    chat_id: int
    district: str
    alert_types: List[str]
    auto_control: bool = False
    active: bool = True


@dataclass
class AlertRule:
    alert_type: str
    condition: str
    message_template: str
    device_action: Optional[str]
    cooldown_minutes: int = 2


@dataclass
class PendingAction:
    alert_type: str
    device_action: str
    district: str
    timestamp: datetime
    data: Dict


class BlynkController:
    """Control Blynk IoT devices"""
    
    def __init__(self, blynk_token: str, blynk_server: str = "blynk.cloud"):
        self.blynk_token = blynk_token
        self.blynk_server = blynk_server
        self.base_url = f"https://{blynk_server}/external/api"
    
        self.device_states: Dict[str, int] = {}
    def get_device_state(self, pin: str) -> Optional[int]:
        """Get current state of a device"""
        try:
            url = f"{self.base_url}/get"
            params = {
                'token': self.blynk_token,
                'pin': pin
            }
            
            response = requests.get(url, params=params, timeout=5)
            if response.status_code == 200:
                state = int(response.text)
                self.device_states[pin] = state
                return state
            return None
        except Exception as e:
            logger.error(f"Error getting device state: {e}")
            return None
    def control_device(self, pin: str, value: int) -> bool:
        """Control a virtual pin on Blynk"""
        try:
            # Kiểm tra trạng thái hiện tại
            current_state = self.get_device_state(pin)
            
            if current_state == value:
                logger.info(f"⏭️  Device {pin} already {'ON' if value == 1 else 'OFF'}")
                return True  # Already in desired state
            
            url = f"{self.base_url}/update"
            params = {
                'token': self.blynk_token,
                'pin': pin,
                'value': value
            }
            
            response = requests.get(url, params=params, timeout=10)
            if response.status_code == 200:
                self.device_states[pin] = value
                logger.info(f"✅ Controlled {pin} = {value} ({'ON' if value == 1 else 'OFF'})")
                return True
            else:
                logger.error(f"❌ Blynk control failed: {response.text}")
                return False
        except Exception as e:
            logger.error(f"Error controlling Blynk device: {e}")
            return False
    
    def execute_action(self, action: str, district: str) -> tuple[bool, str, bool]:
        """Execute a device action
        
        Returns:
            tuple: (success: bool, message: str, already_on: bool)
        """
        action_map = {
            DeviceAction.AIR_PURIFIER_ON: ("V1", 1, "Bật máy lọc không khí"),
            DeviceAction.AIR_PURIFIER_OFF: ("V1", 0, "Tắt máy lọc không khí"),
            DeviceAction.IRRIGATION_ON: ("V2", 1, "Bật hệ thống tưới cây"),
            DeviceAction.IRRIGATION_OFF: ("V2", 0, "Tắt hệ thống tưới cây"),
            DeviceAction.HEATER_ON: ("V3", 1, "Bật máy sưởi"),
            DeviceAction.HEATER_OFF: ("V3", 0, "Tắt máy sưởi"),
            DeviceAction.AC_ON: ("V4", 1, "Bật điều hòa"),
            DeviceAction.AC_OFF: ("V4", 0, "Tắt điều hòa"),
        }
        
        if action in action_map:
            pin, value, action_name = action_map[action]
            
            # Kiểm tra trạng thái hiện tại
            current_state = self.get_device_state(pin)
            
            if current_state == value:
                logger.info(f"⏭️  {action_name}: Đã ở trạng thái này rồi")
                return True, action_name, True  # already_on = True
            
            logger.info(f"🎯 Executing {action} for {district}: {pin}={value}")
            success = self.control_device(pin, value)

            if success:
                return True, action_name, False  # already_on = False
            else:
                return False, f"Lỗi: {action_name}", False
        
        return False, "Hành động không hợp lệ", False


class EventDrivenNotificationService:
    """Event-driven notification service using Orion-LD webhooks"""
    
    def __init__(self, telegram_token: str, blynk_token: str, 
                 webhook_host: str = "0.0.0.0", webhook_port: int = 4999):
        self.telegram_token = telegram_token
        self.blynk = BlynkController(blynk_token)
        self.webhook_host = webhook_host
        self.webhook_port = webhook_port
        
        # User subscriptions
        self.subscriptions: Dict[int, UserSubscription] = {}
        
        # Pending actions
        self.pending_actions: Dict[str, PendingAction] = {}
        
        # Alert cooldowns
        self.alert_cooldowns: Dict[str, datetime] = {}
        
        # Alert rules
        self.alert_rules = self._create_alert_rules()
        
        # Flask app for webhook
        self.flask_app = Flask(__name__)
        self._setup_webhook_routes()
        
        # Telegram application
        self.telegram_app = None
        self.loop = None
    
    def _create_alert_rules(self) -> List[AlertRule]:
        """Create alert rules"""
        return [
            AlertRule(
                alert_type=AlertType.HIGH_AQI,
                condition="aqi >= 3",
                message_template=(
                    "🚨 <b>CẢNH BÁO: Chất lượng không khí kém!</b>\n\n"
                    "📍 Khu vực: <b>{district}</b>\n"
                    "🌫️ AQI: <b>{aqi}</b> ({level})\n"
                    "💨 PM2.5: <b>{pm25} µg/m³</b>\n"
                    "⏰ Thời gian: {time}\n\n"
                    "💡 <b>Khuyến nghị:</b> Bật máy lọc không khí để bảo vệ sức khỏe!"
                ),
                device_action=DeviceAction.AIR_PURIFIER_ON,
                cooldown_minutes=2
            ),
            AlertRule(
                alert_type=AlertType.HIGH_HUMIDITY,
                condition="humidity >= 85",
                message_template=(
                    "💧 <b>CẢNH BÁO: Độ ẩm cao!</b>\n\n"
                    "📍 Khu vực: <b>{district}</b>\n"
                    "💦 Độ ẩm: <b>{humidity}%</b>\n"
                    "🌡️ Nhiệt độ: <b>{temp}°C</b>\n"
                    "⏰ Thời gian: {time}\n\n"
                    "💡 <b>Khuyến nghị:</b> Tắt hệ thống tưới cây tự động!"
                ),
                device_action=DeviceAction.IRRIGATION_OFF,
                cooldown_minutes=2
            ),
            AlertRule(
                alert_type=AlertType.LOW_TEMPERATURE,
                condition="temperature <= 15",
                message_template=(
                    "🥶 <b>CẢNH BÁO: Nhiệt độ thấp!</b>\n\n"
                    "📍 Khu vực: <b>{district}</b>\n"
                    "🌡️ Nhiệt độ: <b>{temp}°C</b>\n"
                    "💨 Cảm giác như: <b>{feels_like}°C</b>\n"
                    "⏰ Thời gian: {time}\n\n"
                    "💡 <b>Khuyến nghị:</b> Bật máy sưởi để giữ ấm!"
                ),
                device_action=DeviceAction.HEATER_ON,
                cooldown_minutes=2
            ),
            AlertRule(
                alert_type=AlertType.HIGH_PM25,
                condition="pm25 >= 55.5",
                message_template=(
                    "😷 <b>CẢNH BÁO: PM2.5 cao!</b>\n\n"
                    "📍 Khu vực: <b>{district}</b>\n"
                    "💨 PM2.5: <b>{pm25} µg/m³</b>\n"
                    "💨 PM10: <b>{pm10} µg/m³</b>\n"
                    "⏰ Thời gian: {time}\n\n"
                    "💡 <b>Khuyến nghị:</b> Bật máy lọc không khí ngay!"
                ),
                device_action=DeviceAction.AIR_PURIFIER_ON,
                cooldown_minutes=2
            ),
            AlertRule(
                alert_type=AlertType.HEAVY_RAIN,
                condition="precipitation >= 5",
                message_template=(
                    "🌧️ <b>CẢNH BÁO: Mưa lớn!</b>\n\n"
                    "📍 Khu vực: <b>{district}</b>\n"
                    "☔ Lượng mưa: <b>{rain} mm/h</b>\n"
                    "💨 Tốc độ gió: <b>{wind} m/s</b>\n"
                    "⏰ Thời gian: {time}\n\n"
                    "💡 <b>Khuyến nghị:</b> Tắt hệ thống tưới cây!"
                ),
                device_action=DeviceAction.IRRIGATION_OFF,
                cooldown_minutes=2
            ),
        ]
    
    def _setup_webhook_routes(self):
        """Setup Flask routes for webhooks"""
        
        @self.flask_app.route('/webhook/weather', methods=['POST'])
        def weather_webhook():
            """Handle weather data notifications from Orion-LD"""
            try:
                data = request.get_json()
                logger.info(f"📥 Received weather notification: {data.get('id', 'unknown')}")
                
                # Schedule async task properly
                if self.loop and self.loop.is_running():
                    asyncio.run_coroutine_threadsafe(
                        self._process_weather_notification(data),
                        self.loop
                    )
                else:
                    logger.warning("⚠️ Event loop not ready, skipping notification")
                
                return jsonify({"status": "ok"}), 200
            except Exception as e:
                logger.error(f"Error processing weather webhook: {e}")
                return jsonify({"status": "error", "message": str(e)}), 500
        
        @self.flask_app.route('/webhook/airquality', methods=['POST'])
        def airquality_webhook():
            """Handle air quality data notifications from Orion-LD"""
            try:
                data = request.get_json()
                logger.info(f"📥 Received air quality notification: {data.get('id', 'unknown')}")
                
                # Schedule async task properly
                if self.loop and self.loop.is_running():
                    asyncio.run_coroutine_threadsafe(
                        self._process_airquality_notification(data),
                        self.loop
                    )
                else:
                    logger.warning("⚠️ Event loop not ready, skipping notification")
                
                return jsonify({"status": "ok"}), 200
            except Exception as e:
                logger.error(f"Error processing air quality webhook: {e}")
                return jsonify({"status": "error", "message": str(e)}), 500
        
        @self.flask_app.route('/health', methods=['GET'])
        def health_check():
            """Health check endpoint"""
            return jsonify({
                "status": "healthy",
                "subscriptions": len(self.subscriptions),
                "loop_running": self.loop is not None and self.loop.is_running(),
                "timestamp": datetime.now().isoformat()
            }), 200
    
    async def _process_weather_notification(self, notification_data: Dict):
        """Process weather notification from Orion-LD"""
        try:
            # Extract entity data
            entity_data = notification_data.get('data', [{}])[0]
            entity_id = entity_data.get('id', '')
            
            # Extract district name from entity ID
            # Format: urn:ngsi-ld:WeatherObserved:Hanoi-PhuongHoanKiem
            district = entity_id.split(':')[-1].replace('Hanoi-', '') if entity_id else 'Unknown'
            
            logger.info(f"🌤️ Processing weather data for {district}")
            
            # Extract values (remember to divide by 10 for temperature)
            temp = entity_data.get('temperature', {}).get('value', 0) / 10
            feels_like = entity_data.get('feelsLikeTemperature', {}).get('value', 0) / 10
            humidity = entity_data.get('relativeHumidity', {}).get('value', 0)
            precipitation = entity_data.get('precipitation', {}).get('value', 0) / 10
            wind = entity_data.get('windSpeed', {}).get('value', 0) / 10
            
            # Check alert conditions
            await self._check_and_send_alerts(
                district=district,
                weather_data={
                    'temperature': temp,
                    'feels_like': feels_like,
                    'humidity': humidity,
                    'precipitation': precipitation,
                    'wind': wind
                },
                air_quality_data=None
            )
            
        except Exception as e:
            logger.error(f"Error processing weather notification: {e}")
    
    async def _process_airquality_notification(self, notification_data: Dict):
        """Process air quality notification from Orion-LD"""
        try:
            # Extract entity data
            entity_data = notification_data.get('data', [{}])[0]
            entity_id = entity_data.get('id', '')
            
            # Extract district name
            district = entity_id.split(':')[-1].replace('Hanoi-', '') if entity_id else 'Unknown'
            
            logger.info(f"🌫️ Processing air quality data for {district}")
            
            # Extract values
            aqi = entity_data.get('airQualityIndex', {}).get('value', 0)
            aqi_level = entity_data.get('airQualityLevel', {}).get('value', 'unknown')
            pm25 = entity_data.get('pm2_5', {}).get('value', 0)
            pm10 = entity_data.get('pm10', {}).get('value', 0)
            logger.info(f"   📊 AQI: {aqi}, PM2.5: {pm25}, PM10: {pm10}")
            temp = entity_data.get('temperature', {}).get('value', 0) / 10 if 'temperature' in entity_data else None
            humidity = entity_data.get('relativeHumidity', {}).get('value', 0) if 'relativeHumidity' in entity_data else None
            
            # Check alert conditions
            await self._check_and_send_alerts(
                district=district,
                weather_data={'temperature': temp, 'humidity': humidity} if temp else None,
                air_quality_data={
                    'aqi': aqi,
                    'level': aqi_level,
                    'pm25': pm25,
                    'pm10': pm10
                }
            )
            
        except Exception as e:
            logger.error(f"Error processing air quality notification: {e}")
    


    async def _check_and_send_alerts(self, district: str, weather_data: Optional[Dict], 
                                    air_quality_data: Optional[Dict]):
        """Check conditions and send alerts to subscribed users"""
        
        # Prepare evaluation context
        context = {
            'temperature': 0,
            'feels_like': 0,
            'humidity': 0,
            'precipitation': 0,
            'wind': 0,
            'aqi': 0,
            'pm25': 0,
            'pm10': 0,
        }
        
        if weather_data:
            context.update({k: v for k, v in weather_data.items() if v is not None})
        
        if air_quality_data:
            context.update({k: v for k, v in air_quality_data.items() if v is not None})
        
        # Find subscribed users for this district
        for chat_id, subscription in self.subscriptions.items():
            logger.info(f"   👤 User {chat_id}: subscribed to '{subscription.district}', active={subscription.active}")
            
            if not subscription.active:
                continue
            
            if subscription.district != district:
                continue
            
            logger.info(f"      ✅ User {chat_id} matched! Checking alert rules...")
            
            # Track device actions already CHECKED (không quan tâm đã bật hay chưa)
            checked_devices = set()
            
            # Check each alert rule
            for rule in self.alert_rules:
                if rule.alert_type not in subscription.alert_types:
                    continue
                
                # ✅ THAY ĐỔI: Nếu device action này đã được check, bỏ qua luôn
                if rule.device_action and rule.device_action in checked_devices:
                    logger.info(f"         ⏭️  Skipping {rule.alert_type}: Device {rule.device_action} already checked")
                    continue
                
                # Check cooldown (theo alert_type)
                cooldown_key = f"{chat_id}_{rule.alert_type}_{district}"
                if cooldown_key in self.alert_cooldowns:
                    last_alert = self.alert_cooldowns[cooldown_key]
                    time_remaining = timedelta(minutes=rule.cooldown_minutes) - (datetime.now() - last_alert)
                    
                    if time_remaining.total_seconds() > 0:
                        logger.info(f"         ⏳ Cooldown: {int(time_remaining.total_seconds()/60)} min")
                        continue
                
                # Evaluate condition
                try:
                    logger.info(f"         🔍 Checking: {rule.condition}")
                    
                    if eval(rule.condition, {"__builtins__": {}}, context):
                        logger.info(f"         ✅ Condition met: {rule.alert_type}")
                        
                        # Send alert
                        device_already_on = await self._send_alert(
                            chat_id, subscription, rule, 
                            weather_data or {}, air_quality_data or {}
                        )
                        
                        # Update cooldown
                        self.alert_cooldowns[cooldown_key] = datetime.now()
                        
                        # ✅ THAY ĐỔI: Mark device đã check (không phụ thuộc vào already_on)
                        if rule.device_action:
                            checked_devices.add(rule.device_action)
                            logger.info(f"         🔒 Device {rule.device_action} marked as checked")
                
                except Exception as e:
                    logger.error(f"         ❌ Error: {e}")
    

    async def _send_alert(self, chat_id: int, subscription: UserSubscription,
                        rule: AlertRule, weather_data: Dict, air_quality_data: Dict) -> bool:
        """Send alert message to user
        
        Returns:
            bool: True if device was already on, False otherwise
        """
        try:
            # Prepare message data
            data = {
                'district': subscription.district,
                'aqi': air_quality_data.get('aqi', 0),
                'level': air_quality_data.get('level', 'unknown'),
                'pm25': air_quality_data.get('pm25', 0),
                'pm10': air_quality_data.get('pm10', 0),
                'temp': weather_data.get('temperature', 0),
                'feels_like': weather_data.get('feels_like', 0),
                'humidity': weather_data.get('humidity', 0),
                'rain': weather_data.get('precipitation', 0),
                'wind': weather_data.get('wind', 0),
                'time': datetime.now().strftime('%H:%M %d/%m/%Y')
            }
            
            message = rule.message_template.format(**data)
            
            # Auto-control mode
            if subscription.auto_control and rule.device_action:
                success, action_msg, already_on = self.blynk.execute_action(
                    rule.device_action, 
                    subscription.district
                )
                
                if already_on:
                    message += f"\n\nℹ️ <i>{action_msg} (Đã bật sẵn)</i>"
                elif success:
                    message += f"\n\n✅ <b>Đã thực hiện: {action_msg}</b>"
                else:
                    message += f"\n\n❌ <b>{action_msg}</b>"
                
                await self.telegram_app.bot.send_message(
                    chat_id=chat_id,
                    text=message,
                    parse_mode='HTML'
                )
                
                return already_on
            
            else:
                # Manual mode - check device state first
                if rule.device_action:
                    # Get device pin
                    action_map = {
                        DeviceAction.AIR_PURIFIER_ON: ("V1", 1),
                        DeviceAction.IRRIGATION_OFF: ("V2", 0),
                        DeviceAction.HEATER_ON: ("V3", 1),
                        DeviceAction.AC_ON: ("V4", 1),
                    }
                    
                    pin, target_value = action_map.get(rule.device_action, (None, None))
                    
                    if pin:
                        current_state = self.blynk.get_device_state(pin)
                        
                        if current_state == target_value:
                            # Device already in desired state - no button needed
                            message += f"\n\nℹ️ <i>{self._action_name(rule.device_action)} (Đã bật sẵn)</i>"
                            
                            await self.telegram_app.bot.send_message(
                                chat_id=chat_id,
                                text=message,
                                parse_mode='HTML'
                            )
                            
                            return True  # Device already on
                    
                    # Device not in desired state - ask user
                    action_id = f"{chat_id}_{rule.alert_type}_{int(datetime.now().timestamp())}"
                    self.pending_actions[action_id] = PendingAction(
                        alert_type=rule.alert_type,
                        device_action=rule.device_action,
                        district=subscription.district,
                        timestamp=datetime.now(),
                        data=data
                    )
                    
                    keyboard = [
                        [
                            InlineKeyboardButton("✅ Đồng ý", callback_data=f"confirm_{action_id}"),
                            InlineKeyboardButton("❌ Từ chối", callback_data=f"reject_{action_id}")
                        ]
                    ]
                    reply_markup = InlineKeyboardMarkup(keyboard)
                    
                    await self.telegram_app.bot.send_message(
                        chat_id=chat_id,
                        text=message,
                        reply_markup=reply_markup,
                        parse_mode='HTML'
                    )
                    
                    return False  # Device not on yet
                
                else:
                    # No device action
                    await self.telegram_app.bot.send_message(
                        chat_id=chat_id,
                        text=message,
                        parse_mode='HTML'
                    )
                    
                    return False
        
        except Exception as e:
            logger.error(f"Error sending alert: {e}")
            return False
    
    def _action_name(self, action: str) -> str:
        """Get friendly name for device action"""
        names = {
            DeviceAction.AIR_PURIFIER_ON: "Bật máy lọc không khí",
            DeviceAction.AIR_PURIFIER_OFF: "Tắt máy lọc không khí",
            DeviceAction.IRRIGATION_ON: "Bật hệ thống tưới cây",
            DeviceAction.IRRIGATION_OFF: "Tắt hệ thống tưới cây",
            DeviceAction.HEATER_ON: "Bật máy sưởi",
            DeviceAction.HEATER_OFF: "Tắt máy sưởi",
            DeviceAction.AC_ON: "Bật điều hòa",
            DeviceAction.AC_OFF: "Tắt điều hòa",
        }
        return names.get(action, action)
    
    # Telegram Bot Handlers
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command"""
        chat_id = update.effective_chat.id
        
        welcome_message = (
            "🌤️ <b>Chào mừng đến với Hệ thống Thông báo Môi trường Real-time!</b>\n\n"
            "✨ <b>Tính năng mới:</b> Cảnh báo <b>NGAY LẬP TỨC</b> khi có dữ liệu mới!\n"
            "Không cần đợi 5 phút nữa! 🚀\n\n"
            "<b>Các lệnh có sẵn:</b>\n"
            "/subscribe - Đăng ký nhận thông báo\n"
            "/settings - Cài đặt tùy chọn\n"
            "/help - Hướng dẫn sử dụng"
        )
        
        await update.message.reply_text(welcome_message, parse_mode='HTML')
    
    async def subscribe_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /subscribe command"""
        chat_id = update.effective_chat.id
        
        if chat_id not in self.subscriptions:
            self.subscriptions[chat_id] = UserSubscription(
                chat_id=chat_id,
                district="PhuongHoanKiem",
                alert_types=[AlertType.HIGH_AQI, AlertType.HIGH_HUMIDITY, 
                           AlertType.HIGH_PM25, AlertType.HEAVY_RAIN],
                auto_control=False,
                active=True
            )
            
            message = (
                "✅ <b>Đăng ký thành công!</b>\n\n"
                "📍 Khu vực: <b>PhuongHoanKiem</b>\n"
                "🔔 Loại cảnh báo: Tất cả\n"
                "🤖 Điều khiển tự động: <b>Tắt</b>\n"
                "⚡ Chế độ: <b>Real-time (Ngay lập tức)</b>\n\n"
                "Sử dụng /settings để thay đổi cài đặt."
            )
        else:
            message = "ℹ️ Bạn đã đăng ký rồi. Sử dụng /settings để thay đổi cài đặt."
        
        await update.message.reply_text(message, parse_mode='HTML')
    
    async def settings_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /settings command"""
        chat_id = update.effective_chat.id
        
        if chat_id not in self.subscriptions:
            await update.message.reply_text(
                "⚠️ Bạn chưa đăng ký. Sử dụng /subscribe để đăng ký!"
            )
            return
        
        subscription = self.subscriptions[chat_id]
        auto_status = "Bật ✅" if subscription.auto_control else "Tắt ❌"
        
        keyboard = [
            [InlineKeyboardButton("🔄 Chuyển chế độ tự động", callback_data="toggle_auto")],
            [InlineKeyboardButton("📍 Đổi khu vực", callback_data="change_district")],
            [InlineKeyboardButton("🔕 Tắt thông báo", callback_data="disable_alerts")],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        message = (
            f"⚙️ <b>Cài đặt</b>\n\n"
            f"📍 Khu vực: <b>{subscription.district}</b>\n"
            f"🤖 Điều khiển tự động: <b>{auto_status}</b>\n"
            f"🔔 Trạng thái: <b>{'Hoạt động' if subscription.active else 'Tạm dừng'}</b>\n"
            f"⚡ Chế độ: <b>Real-time</b>"
        )
        
        await update.message.reply_text(
            message, 
            reply_markup=reply_markup, 
            parse_mode='HTML'
        )
    
    async def button_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle button callbacks"""
        query = update.callback_query
        await query.answer()
        
        chat_id = query.message.chat_id
        data = query.data
        
        if data.startswith("confirm_"):
            action_id = data.replace("confirm_", "")
            await self._handle_confirmation(query, action_id, True)
        
        elif data.startswith("reject_"):
            action_id = data.replace("reject_", "")
            await self._handle_confirmation(query, action_id, False)
        
        elif data == "toggle_auto":
            if chat_id in self.subscriptions:
                self.subscriptions[chat_id].auto_control = not self.subscriptions[chat_id].auto_control
                status = "bật" if self.subscriptions[chat_id].auto_control else "tắt"
                await query.edit_message_text(
                    f"✅ Đã {status} chế độ điều khiển tự động."
                )
        
        elif data == "change_district":
            await query.edit_message_text(
                "📍 Tính năng đổi khu vực sẽ được triển khai sớm!"
            )
        
        elif data == "disable_alerts":
            if chat_id in self.subscriptions:
                self.subscriptions[chat_id].active = False
                await query.edit_message_text(
                    "🔕 Đã tắt thông báo. Sử dụng /subscribe để bật lại."
                )
    
    async def _handle_confirmation(self, query, action_id: str, confirmed: bool):
        """Handle user confirmation for device action"""
        if action_id not in self.pending_actions:
            await query.edit_message_text(
                "⚠️ Yêu cầu này đã hết hạn hoặc không tồn tại."
            )
            return
        
        pending = self.pending_actions[action_id]
        
        if confirmed:
            success = self.blynk.execute_action(pending.device_action, pending.district)
            
            if success:
                await query.edit_message_text(
                    query.message.text + 
                    f"\n\n✅ <b>Đã thực hiện:</b> {self._action_name(pending.device_action)}",
                    parse_mode='HTML'
                )
            else:
                await query.edit_message_text(
                    query.message.text + 
                    "\n\n❌ <b>Lỗi:</b> Không thể điều khiển thiết bị.",
                    parse_mode='HTML'
                )
        else:
            await query.edit_message_text(
                query.message.text + "\n\n🚫 <b>Đã từ chối.</b>",
                parse_mode='HTML'
            )
        
        del self.pending_actions[action_id]
    
    def run_webhook_server(self):
        """Run Flask webhook server"""
        logger.info(f"🌐 Starting webhook server on {self.webhook_host}:{self.webhook_port}")
        self.flask_app.run(
            host=self.webhook_host,
            port=self.webhook_port,
            debug=False,
            use_reloader=False
        )
    
    def run(self):
        """Run the notification service"""
        # Create Telegram application
        self.telegram_app = Application.builder().token(self.telegram_token).build()
        
        # Add handlers
        self.telegram_app.add_handler(CommandHandler("start", self.start_command))
        self.telegram_app.add_handler(CommandHandler("subscribe", self.subscribe_command))
        self.telegram_app.add_handler(CommandHandler("settings", self.settings_command))
        self.telegram_app.add_handler(CallbackQueryHandler(self.button_callback))
        
        # Start Flask webhook server in a separate thread
        webhook_thread = threading.Thread(target=self.run_webhook_server, daemon=True)
        webhook_thread.start()
        
        logger.info("🚀 Event-driven notification service started")
        logger.info(f"📡 Webhook listening on http://{self.webhook_host}:{self.webhook_port}")
        logger.info("⚡ Real-time alerts: ENABLED")
        
        # Initialize the application to get the event loop
        async def setup_and_run():
            # Initialize the application
            await self.telegram_app.initialize()
            await self.telegram_app.start()
            
            # Store the event loop
            self.loop = asyncio.get_running_loop()
            logger.info("✅ Event loop initialized and ready")
            
            # Start polling
            await self.telegram_app.updater.start_polling(
                allowed_updates=Update.ALL_TYPES,
                drop_pending_updates=True
            )
            
            # Keep running
            try:
                await asyncio.Event().wait()
            except KeyboardInterrupt:
                logger.info("🛑 Shutting down...")
                await self.telegram_app.updater.stop()
                await self.telegram_app.stop()
                await self.telegram_app.shutdown()
        
        # Run the async setup
        try:
            asyncio.run(setup_and_run())
        except KeyboardInterrupt:
            logger.info("👋 Service stopped")


# Configuration
if __name__ == "__main__":
    from dotenv import load_dotenv
    env_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),  # lên BlynkNotification/
        'config',
        '.env.blynk'
    )
    
    load_dotenv(env_path)
    
    TELEGRAM_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
    BLYNK_TOKEN = os.getenv('BLYNK_TOKEN')
    WEBHOOK_HOST = os.getenv('WEBHOOK_HOST', '0.0.0.0')
    WEBHOOK_PORT = int(os.getenv('WEBHOOK_PORT', 4999))
    
    if not TELEGRAM_TOKEN or not BLYNK_TOKEN:
        raise ValueError("TELEGRAM_BOT_TOKEN and BLYNK_TOKEN must be set")
    
    # Create and run service
    service = EventDrivenNotificationService(
        telegram_token=TELEGRAM_TOKEN,
        blynk_token=BLYNK_TOKEN,
        webhook_host=WEBHOOK_HOST,
        webhook_port=WEBHOOK_PORT
    )
    
    service.run()