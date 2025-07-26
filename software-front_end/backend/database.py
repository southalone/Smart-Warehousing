#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据库配置和初始化模块
作者: AI Assistant
日期: 2024
描述: 智能仓储系统数据库连接和配置管理

本模块负责：
1. SQLAlchemy数据库实例的创建和配置
2. 数据库连接的管理
3. 数据库初始化功能
4. 为整个应用提供统一的数据库访问接口
"""

# Flask-SQLAlchemy ORM框架导入
from flask_sqlalchemy import SQLAlchemy
# 日志记录模块
import logging

# 获取当前模块的日志记录器
logger = logging.getLogger(__name__)

# ==================== 数据库实例创建 ====================

# 创建SQLAlchemy数据库实例
# 这个实例将在Flask应用中初始化，并提供ORM功能
db = SQLAlchemy()

# ==================== 数据库初始化函数 ====================

def init_db():
    """
    初始化数据库表结构
    
    功能说明:
    1. 根据已定义的模型创建所有数据库表
    2. 记录初始化结果日志
    3. 处理初始化过程中的异常
    
    异常处理:
    - 如果初始化失败，记录错误日志并重新抛出异常
    
    注意:
    - 此函数需要在Flask应用上下文中调用
    - 通常在应用启动时调用一次
    """
    try:
        # 根据所有已定义的模型类创建数据库表
        # 如果表已存在，则不会重复创建
        db.create_all()
        
        # 记录成功日志
        logger.info("数据库初始化成功")
        
    except Exception as e:
        # 记录错误日志
        logger.error(f"数据库初始化失败: {e}")
        # 重新抛出异常，让调用者处理
        raise

def reset_db():
    """重置数据库"""
    try:
        db.drop_all()
        db.create_all()
        logger.info("数据库重置成功")
    except Exception as e:
        logger.error(f"数据库重置失败: {e}")
        raise