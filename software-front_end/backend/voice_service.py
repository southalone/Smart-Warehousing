#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
语音服务模块
提供语音提示和播报功能
"""

import os
import logging
import threading
import time
from gtts import gTTS
import pygame
from io import BytesIO
import tempfile

logger = logging.getLogger(__name__)

class VoiceService:
    """语音服务类"""
    
    def __init__(self):
        self.audio_dir = 'frontend/static/audio'
        os.makedirs(self.audio_dir, exist_ok=True)
        
        # 初始化pygame音频模块
        try:
            pygame.mixer.init()
            self.pygame_available = True
            logger.info("语音服务初始化成功")
        except Exception as e:
            logger.error(f"pygame初始化失败: {e}")
            self.pygame_available = False
        
        # 语音队列和锁
        self.voice_queue = []
        self.queue_lock = threading.Lock()
        self.is_speaking = False
        
        # 启动语音播放线程
        self.voice_thread = threading.Thread(target=self._voice_worker, daemon=True)
        self.voice_thread.start()
        
        # 预定义常用语音
        self.predefined_voices = {
            'welcome': '欢迎使用QuantumFlow量子流仓储平台',
            'task_created': '任务已创建',
            'task_completed': '任务已完成',
            'low_stock_warning': '库存不足警告',
            'system_ready': '系统就绪',
            'operation_success': '操作成功',
            'operation_failed': '操作失败',
            'robot_busy': '机器人正在执行任务',
            'robot_idle': '机器人空闲中',
            'charging_needed': '机器人需要充电'
        }
        
        # 预生成常用语音文件
        self._pregenerate_voices()
    
    def speak(self, text, priority='normal'):
        """添加语音到播放队列"""
        try:
            if not text or not text.strip():
                return False
            
            with self.queue_lock:
                voice_item = {
                    'text': text.strip(),
                    'priority': priority,
                    'timestamp': time.time()
                }
                
                # 根据优先级插入队列
                if priority == 'urgent':
                    self.voice_queue.insert(0, voice_item)
                else:
                    self.voice_queue.append(voice_item)
            
            logger.info(f"语音已添加到队列: {text}")
            return True
            
        except Exception as e:
            logger.error(f"添加语音到队列失败: {e}")
            return False
    
    def speak_predefined(self, key, priority='normal'):
        """播放预定义语音"""
        if key in self.predefined_voices:
            return self.speak(self.predefined_voices[key], priority)
        else:
            logger.warning(f"未找到预定义语音: {key}")
            return False
    
    def _voice_worker(self):
        """语音播放工作线程"""
        while True:
            try:
                voice_item = None
                
                # 从队列获取语音项
                with self.queue_lock:
                    if self.voice_queue and not self.is_speaking:
                        voice_item = self.voice_queue.pop(0)
                        self.is_speaking = True
                
                if voice_item:
                    self._play_voice(voice_item['text'])
                    self.is_speaking = False
                else:
                    time.sleep(0.1)  # 短暂休眠
                    
            except Exception as e:
                logger.error(f"语音播放线程错误: {e}")
                self.is_speaking = False
                time.sleep(1)
    
    def _play_voice(self, text):
        """播放语音"""
        try:
            if not self.pygame_available:
                logger.warning(f"语音播放不可用，文本: {text}")
                return
            
            # 检查是否有预生成的语音文件
            audio_file = self._get_predefined_audio_file(text)
            
            if audio_file and os.path.exists(audio_file):
                # 播放预生成的文件
                self._play_audio_file(audio_file)
            else:
                # 实时生成并播放
                self._generate_and_play(text)
                
        except Exception as e:
            logger.error(f"播放语音失败: {e}")
    
    def _get_predefined_audio_file(self, text):
        """获取预定义语音文件路径"""
        for key, predefined_text in self.predefined_voices.items():
            if text == predefined_text:
                return os.path.join(self.audio_dir, f'{key}.mp3')
        return None
    
    def _generate_and_play(self, text):
        """实时生成并播放语音"""
        try:
            # 检查网络连接和gTTS可用性
            try:
                # 使用gTTS生成语音
                tts = gTTS(text=text, lang='zh', slow=False)
                
                # 保存到临时文件
                with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
                    tts.save(temp_file.name)
                    temp_file_path = temp_file.name
                
                # 播放音频文件
                self._play_audio_file(temp_file_path)
                
                # 删除临时文件
                try:
                    os.unlink(temp_file_path)
                except:
                    pass
                    
            except Exception as tts_error:
                logger.warning(f"gTTS语音生成失败，使用备用方案: {tts_error}")
                # 备用方案：仅记录日志，不播放语音
                logger.info(f"语音内容（无法播放）: {text}")
                
        except Exception as e:
            logger.error(f"语音生成过程失败: {e}")
    
    def _play_audio_file(self, file_path):
        """播放音频文件"""
        try:
            if not os.path.exists(file_path):
                logger.error(f"音频文件不存在: {file_path}")
                return
            
            # 使用pygame播放音频
            pygame.mixer.music.load(file_path)
            pygame.mixer.music.play()
            
            # 等待播放完成
            while pygame.mixer.music.get_busy():
                time.sleep(0.1)
                
        except Exception as e:
            logger.error(f"播放音频文件失败: {e}")
    
    def _pregenerate_voices(self):
        """预生成常用语音文件"""
        try:
            for key, text in self.predefined_voices.items():
                audio_file = os.path.join(self.audio_dir, f'{key}.mp3')
                
                # 如果文件不存在，则生成
                if not os.path.exists(audio_file):
                    try:
                        tts = gTTS(text=text, lang='zh', slow=False)
                        tts.save(audio_file)
                        logger.info(f"预生成语音文件: {key}.mp3")
                    except Exception as e:
                        logger.warning(f"预生成语音文件失败 {key}: {e}，将在运行时尝试")
            
            logger.info("预生成语音文件过程完成")
            
        except Exception as e:
            logger.warning(f"预生成语音文件过程失败: {e}，语音功能仍可使用")
    
    def clear_queue(self):
        """清空语音队列"""
        try:
            with self.queue_lock:
                self.voice_queue.clear()
            logger.info("语音队列已清空")
        except Exception as e:
            logger.error(f"清空语音队列失败: {e}")
    
    def get_queue_status(self):
        """获取队列状态"""
        try:
            with self.queue_lock:
                return {
                    'queue_length': len(self.voice_queue),
                    'is_speaking': self.is_speaking,
                    'pygame_available': self.pygame_available
                }
        except Exception as e:
            logger.error(f"获取队列状态失败: {e}")
            return {'queue_length': 0, 'is_speaking': False, 'pygame_available': False}
    
    def stop_current_speech(self):
        """停止当前播放的语音"""
        try:
            if self.pygame_available and pygame.mixer.music.get_busy():
                pygame.mixer.music.stop()
                self.is_speaking = False
                logger.info("当前语音播放已停止")
        except Exception as e:
            logger.error(f"停止语音播放失败: {e}")
    
    def set_volume(self, volume):
        """设置音量 (0.0 - 1.0)"""
        try:
            if self.pygame_available:
                volume = max(0.0, min(1.0, volume))  # 限制范围
                pygame.mixer.music.set_volume(volume)
                logger.info(f"音量设置为: {volume}")
                return True
        except Exception as e:
            logger.error(f"设置音量失败: {e}")
        return False
    
    def test_voice(self):
        """测试语音功能"""
        test_message = "语音系统测试，功能正常"
        return self.speak(test_message, priority='urgent')
    
    def cleanup(self):
        """清理资源"""
        try:
            self.clear_queue()
            self.stop_current_speech()
            
            if self.pygame_available:
                pygame.mixer.quit()
            
            logger.info("语音服务清理完成")
        except Exception as e:
            logger.error(f"语音服务清理失败: {e}")
    
    def get_predefined_voices(self):
        """获取预定义语音列表"""
        return self.predefined_voices.copy()
    
    def add_predefined_voice(self, key, text):
        """添加预定义语音"""
        try:
            self.predefined_voices[key] = text
            
            # 生成音频文件
            audio_file = os.path.join(self.audio_dir, f'{key}.mp3')
            tts = gTTS(text=text, lang='zh', slow=False)
            tts.save(audio_file)
            
            logger.info(f"添加预定义语音: {key} - {text}")
            return True
            
        except Exception as e:
            logger.error(f"添加预定义语音失败: {e}")
            return False
    
    def remove_predefined_voice(self, key):
        """删除预定义语音"""
        try:
            if key in self.predefined_voices:
                del self.predefined_voices[key]
                
                # 删除音频文件
                audio_file = os.path.join(self.audio_dir, f'{key}.mp3')
                if os.path.exists(audio_file):
                    os.unlink(audio_file)
                
                logger.info(f"删除预定义语音: {key}")
                return True
            else:
                logger.warning(f"预定义语音不存在: {key}")
                return False
                
        except Exception as e:
            logger.error(f"删除预定义语音失败: {e}")
            return False