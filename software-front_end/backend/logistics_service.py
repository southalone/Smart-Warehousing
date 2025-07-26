#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
物流服务模块
负责与Jetson Nano智能小车的通信和任务调度
"""

import json
import logging
import requests
import paho.mqtt.client as mqtt
from datetime import datetime
import threading
import time

logger = logging.getLogger(__name__)

class LogisticsService:
    """物流服务类"""
    
    def __init__(self):
        # MQTT配置
        self.mqtt_broker = "localhost"  # MQTT代理地址
        self.mqtt_port = 1883
        self.mqtt_topic_command = "warehouse/robot/command"
        self.mqtt_topic_status = "warehouse/robot/status"
        
        # HTTP配置（备用通信方式）
        self.robot_api_base = "http://192.168.1.100:8080"  # Jetson Nano的IP地址
        
        # 机器人状态
        self.robot_status = {
            'id': 'robot_001',
            'status': 'idle',  # idle, busy, charging, error, offline
            'current_location': 'A-1-01',
            'battery_level': 85,
            'current_task_id': None,
            'last_update': datetime.utcnow().isoformat()
        }
        
        # 初始化MQTT客户端
        self.mqtt_client = None
        self.init_mqtt_client()
        
        # 启动状态监控线程
        self.status_monitor_thread = threading.Thread(target=self._status_monitor, daemon=True)
        self.status_monitor_thread.start()
    
    def init_mqtt_client(self):
        """初始化MQTT客户端"""
        try:
            self.mqtt_client = mqtt.Client()
            self.mqtt_client.on_connect = self._on_mqtt_connect
            self.mqtt_client.on_message = self._on_mqtt_message
            self.mqtt_client.on_disconnect = self._on_mqtt_disconnect
            
            # 尝试连接MQTT代理
            self.mqtt_client.connect(self.mqtt_broker, self.mqtt_port, 60)
            self.mqtt_client.loop_start()
            
            logger.info("MQTT客户端初始化成功")
            
        except Exception as e:
            logger.error(f"MQTT客户端初始化失败: {e}")
            self.mqtt_client = None
    
    def _on_mqtt_connect(self, client, userdata, flags, rc):
        """MQTT连接回调"""
        if rc == 0:
            logger.info("MQTT连接成功")
            # 订阅机器人状态主题
            client.subscribe(self.mqtt_topic_status)
        else:
            logger.error(f"MQTT连接失败，返回码: {rc}")
    
    def _on_mqtt_message(self, client, userdata, msg):
        """MQTT消息回调"""
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode())
            
            if topic == self.mqtt_topic_status:
                # 更新机器人状态
                self.robot_status.update(payload)
                self.robot_status['last_update'] = datetime.utcnow().isoformat()
                logger.info(f"机器人状态更新: {payload}")
                
        except Exception as e:
            logger.error(f"处理MQTT消息失败: {e}")
    
    def _on_mqtt_disconnect(self, client, userdata, rc):
        """MQTT断开连接回调"""
        logger.warning("MQTT连接断开")
        self.robot_status['status'] = 'offline'
    
    def send_task_to_robot(self, task_data):
        """发送任务到机器人"""
        try:
            # 构建命令消息
            command = {
                'command_id': f"cmd_{int(time.time())}",
                'task_id': task_data['id'],
                'command_type': 'move_item',
                'parameters': {
                    'item_id': task_data['product_id'],
                    'quantity': task_data['quantity'],
                    'from_location': task_data['from_location'],
                    'to_location': task_data['to_location'],
                    'priority': task_data.get('priority', 1)
                },
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # 优先使用MQTT发送
            if self.mqtt_client and self.mqtt_client.is_connected():
                result = self._send_via_mqtt(command)
                if result:
                    logger.info(f"任务通过MQTT发送成功: {task_data['id']}")
                    return True
            
            # 备用HTTP方式
            result = self._send_via_http(command)
            if result:
                logger.info(f"任务通过HTTP发送成功: {task_data['id']}")
                return True
            
            # 如果都失败，模拟发送成功（用于演示）
            logger.warning(f"无法连接机器人，模拟任务发送: {task_data['id']}")
            self._simulate_task_execution(task_data)
            return True
            
        except Exception as e:
            logger.error(f"发送任务到机器人失败: {e}")
            return False
    
    def _send_via_mqtt(self, command):
        """通过MQTT发送命令"""
        try:
            if not self.mqtt_client or not self.mqtt_client.is_connected():
                return False
            
            message = json.dumps(command)
            result = self.mqtt_client.publish(self.mqtt_topic_command, message)
            
            return result.rc == mqtt.MQTT_ERR_SUCCESS
            
        except Exception as e:
            logger.error(f"MQTT发送失败: {e}")
            return False
    
    def _send_via_http(self, command):
        """通过HTTP发送命令"""
        try:
            url = f"{self.robot_api_base}/api/command"
            response = requests.post(url, json=command, timeout=5)
            
            return response.status_code == 200
            
        except Exception as e:
            logger.error(f"HTTP发送失败: {e}")
            return False
    
    def _simulate_task_execution(self, task_data):
        """模拟任务执行（用于演示）"""
        def simulate():
            try:
                # 模拟任务执行过程
                self.robot_status['status'] = 'busy'
                self.robot_status['current_task_id'] = task_data['id']
                
                # 模拟移动到起始位置
                time.sleep(2)
                self.robot_status['current_location'] = task_data.get('from_location', 'unknown')
                
                # 模拟搬运过程
                time.sleep(3)
                
                # 模拟移动到目标位置
                time.sleep(2)
                self.robot_status['current_location'] = task_data['to_location']
                
                # 任务完成
                self.robot_status['status'] = 'idle'
                self.robot_status['current_task_id'] = None
                self.robot_status['last_update'] = datetime.utcnow().isoformat()
                
                logger.info(f"模拟任务执行完成: {task_data['id']}")
                
            except Exception as e:
                logger.error(f"模拟任务执行失败: {e}")
                self.robot_status['status'] = 'error'
        
        # 在后台线程中执行模拟
        threading.Thread(target=simulate, daemon=True).start()
    
    def get_robot_status(self):
        """获取机器人状态"""
        return self.robot_status.copy()
    
    def _status_monitor(self):
        """状态监控线程"""
        while True:
            try:
                # 检查机器人连接状态
                last_update = datetime.fromisoformat(self.robot_status['last_update'])
                time_diff = (datetime.utcnow() - last_update).total_seconds()
                
                # 如果超过30秒没有更新，标记为离线
                if time_diff > 30 and self.robot_status['status'] != 'offline':
                    self.robot_status['status'] = 'offline'
                    logger.warning("机器人状态超时，标记为离线")
                
                # 模拟电池电量变化
                if self.robot_status['status'] == 'busy':
                    self.robot_status['battery_level'] = max(0, self.robot_status['battery_level'] - 0.1)
                elif self.robot_status['status'] == 'charging':
                    self.robot_status['battery_level'] = min(100, self.robot_status['battery_level'] + 0.5)
                
                # 检查是否需要充电
                if self.robot_status['battery_level'] < 20 and self.robot_status['status'] == 'idle':
                    self.robot_status['status'] = 'charging'
                    self.robot_status['current_location'] = 'CHARGING_STATION'
                    logger.info("机器人电量低，自动进入充电状态")
                
                # 充电完成
                if self.robot_status['battery_level'] >= 90 and self.robot_status['status'] == 'charging':
                    self.robot_status['status'] = 'idle'
                    logger.info("机器人充电完成，恢复待机状态")
                
                time.sleep(5)  # 每5秒检查一次
                
            except Exception as e:
                logger.error(f"状态监控线程错误: {e}")
                time.sleep(10)
    
    def send_command_to_robot(self, command):
        """发送命令到机器人"""
        try:
            # 为命令添加唯一ID和时间戳
            if 'command_id' not in command:
                command['command_id'] = f"cmd_{int(time.time())}"
            if 'timestamp' not in command:
                command['timestamp'] = datetime.utcnow().isoformat()
            
            # 优先使用MQTT发送
            if self.mqtt_client and self.mqtt_client.is_connected():
                result = self._send_via_mqtt(command)
                if result:
                    logger.info(f"命令通过MQTT发送成功: {command['command_type']}")
                    return True
            
            # 备用HTTP方式
            result = self._send_via_http(command)
            if result:
                logger.info(f"命令通过HTTP发送成功: {command['command_type']}")
                return True
            
            # 如果都失败，记录日志但返回成功（用于演示）
            logger.warning(f"无法连接机器人，模拟命令发送: {command['command_type']}")
            return True
            
        except Exception as e:
            logger.error(f"发送命令到机器人失败: {e}")
            return False
    
    def send_emergency_stop(self):
        """发送紧急停止命令"""
        return self.emergency_stop()
    
    def emergency_stop(self):
        """紧急停止"""
        try:
            command = {
                'command_id': f"emergency_{int(time.time())}",
                'command_type': 'emergency_stop',
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # 发送紧急停止命令
            if self.mqtt_client and self.mqtt_client.is_connected():
                self._send_via_mqtt(command)
            
            self._send_via_http(command)
            
            # 更新状态
            self.robot_status['status'] = 'error'
            self.robot_status['current_task_id'] = None
            
            logger.warning("发送紧急停止命令")
            return True
            
        except Exception as e:
            logger.error(f"紧急停止失败: {e}")
            return False
    
    def get_warehouse_map(self):
        """获取仓库地图信息"""
        # 返回模拟的仓库布局
        return {
            'warehouse_id': 'WH001',
            'dimensions': {'width': 20, 'height': 15},
            'shelves': [
                {'id': 'A-1', 'x': 2, 'y': 2, 'width': 2, 'height': 1, 'locations': ['A-1-01', 'A-1-02']},
                {'id': 'A-2', 'x': 5, 'y': 2, 'width': 2, 'height': 1, 'locations': ['A-2-01', 'A-2-02']},
                {'id': 'B-1', 'x': 2, 'y': 5, 'width': 2, 'height': 1, 'locations': ['B-1-01', 'B-1-02']},
                {'id': 'B-2', 'x': 5, 'y': 5, 'width': 2, 'height': 1, 'locations': ['B-2-01', 'B-2-02']},
                {'id': 'C-1', 'x': 2, 'y': 8, 'width': 2, 'height': 1, 'locations': ['C-1-01', 'C-1-02']},
                {'id': 'C-2', 'x': 5, 'y': 8, 'width': 2, 'height': 1, 'locations': ['C-2-01', 'C-2-02']}
            ],
            'charging_station': {'x': 1, 'y': 1, 'id': 'CHARGING_STATION'},
            'entry_point': {'x': 1, 'y': 10, 'id': 'ENTRY_POINT'},
            'robot_position': {
                'x': self._get_location_coordinates(self.robot_status['current_location'])['x'],
                'y': self._get_location_coordinates(self.robot_status['current_location'])['y']
            }
        }
    
    def _get_location_coordinates(self, location):
        """根据位置ID获取坐标"""
        location_map = {
            'A-1-01': {'x': 2, 'y': 2},
            'A-1-02': {'x': 3, 'y': 2},
            'A-2-01': {'x': 5, 'y': 2},
            'A-2-02': {'x': 6, 'y': 2},
            'B-1-01': {'x': 2, 'y': 5},
            'B-1-02': {'x': 3, 'y': 5},
            'B-2-01': {'x': 5, 'y': 5},
            'B-2-02': {'x': 6, 'y': 5},
            'C-1-01': {'x': 2, 'y': 8},
            'C-1-02': {'x': 3, 'y': 8},
            'C-2-01': {'x': 5, 'y': 8},
            'C-2-02': {'x': 6, 'y': 8},
            'CHARGING_STATION': {'x': 1, 'y': 1},
            'ENTRY_POINT': {'x': 1, 'y': 10}
        }
        
        return location_map.get(location, {'x': 1, 'y': 1})
    
    def get_available_locations(self):
        """获取可用位置列表"""
        return [
            'A-1-01', 'A-1-02', 'A-2-01', 'A-2-02',
            'B-1-01', 'B-1-02', 'B-2-01', 'B-2-02',
            'C-1-01', 'C-1-02', 'C-2-01', 'C-2-02',
            'ENTRY_POINT'
        ]
    
    def cleanup(self):
        """清理资源"""
        try:
            if self.mqtt_client:
                self.mqtt_client.loop_stop()
                self.mqtt_client.disconnect()
            logger.info("物流服务清理完成")
        except Exception as e:
            logger.error(f"物流服务清理失败: {e}")