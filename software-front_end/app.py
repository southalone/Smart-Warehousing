#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
QuantumFlow 量子流仓储平台主应用程序
作者: RBCC项目团队
日期: 2024年
版本: 1.0.0
描述: 中小型金属加工件企业智能仓储管理系统

本文件是整个ForgeFlow量子流仓储平台的入口点，负责：
1. Flask应用的创建和配置
2. 数据库的初始化和连接
3. 路由的定义和注册
4. 定时任务的设置
5. 系统的启动和运行
"""

# 标准库导入
import os          # 操作系统接口，用于文件路径操作
import sys         # 系统相关参数和函数
import json        # JSON数据处理
import logging     # 日志记录
from datetime import datetime  # 日期时间处理

# Flask框架相关导入
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS                    # 跨域资源共享支持
from flask_sqlalchemy import SQLAlchemy        # SQLAlchemy ORM支持
from apscheduler.schedulers.background import BackgroundScheduler  # 后台定时任务调度器

# 添加项目根目录到Python路径，确保能够导入自定义模块
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 导入自定义后端模块
from backend.database import db, init_db                              # 数据库连接和初始化
from backend.models import Product, Inventory, SalesHistory, ProductionPlan  # 数据模型
from backend.api import api_bp                                        # API蓝图
# 导入所有服务模块
from backend.ml_service import MLService        # 机器学习服务
from backend.llm_service import LLMService      # 大语言模型服务
from backend.logistics_service import LogisticsService  # 物流调度服务
from backend.voice_service import VoiceService  # 语音服务

# 配置日志系统
# 设置日志级别为INFO，包含时间戳、模块名、日志级别和消息内容
logging.basicConfig(
    level=logging.INFO,  # 设置日志级别为INFO
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',  # 日志格式
    handlers=[
        logging.FileHandler('logs/app.log'),  # 输出到文件
        logging.StreamHandler()               # 输出到控制台
    ]
)
# 获取当前模块的日志记录器
logger = logging.getLogger(__name__)

def create_app():
    """
    创建并配置Flask应用实例
    
    Returns:
        Flask: 配置完成的Flask应用实例
    
    功能说明:
    1. 创建Flask应用实例并设置模板和静态文件目录
    2. 配置应用的基本参数（密钥、数据库URI等）
    3. 启用跨域资源共享(CORS)
    4. 初始化数据库连接
    5. 注册API蓝图
    6. 创建必要的目录结构
    7. 创建数据库表并初始化示例数据
    8. 定义应用路由
    """
    # 创建Flask应用实例，指定模板和静态文件目录
    app = Flask(__name__, 
                template_folder='frontend/templates',  # 前端模板目录
                static_folder='frontend/static')       # 前端静态文件目录
    
    # 应用基本配置
    app.config['SECRET_KEY'] = 'intelligent-warehouse-system-2024'  # 应用密钥，用于会话加密
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///warehouse.db'  # SQLite数据库文件路径
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # 禁用SQLAlchemy事件系统，节省内存
    
    # 启用跨域资源共享，允许前端JavaScript访问API
    CORS(app)
    
    # 将数据库实例与Flask应用绑定
    db.init_app(app)
    
    # 注册API蓝图，所有API路由都以'/api'为前缀
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # 创建必要的目录结构，exist_ok=True表示目录已存在时不报错
    os.makedirs('data', exist_ok=True)                    # 数据存储目录
    os.makedirs('logs', exist_ok=True)                    # 日志文件目录
    os.makedirs('frontend/static/audio', exist_ok=True)   # 音频文件目录
    
    # 在应用上下文中执行数据库操作
    with app.app_context():
        # 根据模型定义创建所有数据库表
        db.create_all()
        
        # 示例数据初始化功能已移除
    
    # ==================== 路由定义 ====================
    
    @app.route('/')
    def index():
        """
        系统主页路由
        
        Returns:
            str: 渲染后的主页HTML内容
        """
        import time
        return render_template('index.html', timestamp=int(time.time()))

    @app.route('/inventory')
    def inventory_page():
        """
        库存管理页面路由
        
        Returns:
            str: 渲染后的库存管理页面HTML内容
        """
        return render_template('inventory.html')

    @app.route('/logistics')
    def logistics_page():
        """
        物流调度页面路由
        
        Returns:
            str: 渲染后的物流调度页面HTML内容
        """
        return render_template('logistics.html')

    @app.route('/prediction')
    def prediction_page():
        """
        预测分析页面路由
        
        Returns:
            str: 渲染后的预测分析页面HTML内容
        """
        return render_template('prediction.html')
    
    # 返回配置完成的Flask应用实例
    return app

# 示例数据初始化功能已移除

def setup_scheduler(app):
    """
    设置和配置后台定时任务调度器
    
    Args:
        app (Flask): Flask应用实例
    
    Returns:
        BackgroundScheduler: 配置完成的后台调度器实例
    
    功能说明:
    1. 创建后台调度器实例
    2. 定义预测模型训练任务（每日凌晨2点执行）
    3. 定义库存预警检查任务（每小时执行）
    4. 启动调度器并返回实例
    """
    # 创建后台调度器实例
    scheduler = BackgroundScheduler()
    
    # ==================== 定时任务定义 ====================
    
    def daily_prediction_update():
        """
        每日预测模型训练任务
        
        功能说明:
        - 在Flask应用上下文中执行
        - 训练所有机器学习预测模型
        - 记录训练结果日志
        """
        with app.app_context():  # 确保在Flask应用上下文中执行
            try:
                # 启用机器学习服务进行模型训练
                ml_service = MLService()
                ml_service.train_all_models()
                logger.info("定时预测模型训练完成")
            except Exception as e:
                logger.error(f"定时预测模型训练失败: {e}")
    
    def check_inventory_alerts():
        """
        库存预警检查任务
        
        功能说明:
        - 查询当前库存低于安全库存的产品
        - 生成预警消息并记录日志
        - 可选：触发语音提醒（暂时注释）
        """
        with app.app_context():  # 确保在Flask应用上下文中执行
            try:
                # 查询库存不足的产品（当前库存 <= 安全库存）
                low_stock_products = db.session.query(Product, Inventory).join(
                    Inventory, Product.id == Inventory.product_id
                ).filter(Inventory.current_stock <= Inventory.safety_stock).all()
                
                # 如果存在库存不足的产品，生成预警
                if low_stock_products:
                    # 启用语音服务进行预警播报
                    voice_service = VoiceService()
                    for product, inventory in low_stock_products:
                        # 生成预警消息
                        message = f"警告：{product.name}库存不足，当前库存{inventory.current_stock}，请及时补货"
                        # 语音播报预警信息
                        voice_service.speak(message)
                        # 记录预警日志
                        logger.warning(message)
                        
            except Exception as e:
                logger.error(f"库存预警检查失败: {e}")
    
    # ==================== 添加定时任务到调度器 ====================
    
    # 添加每日凌晨2点执行的预测模型训练任务
    scheduler.add_job(daily_prediction_update, 'cron', hour=2, minute=0)
    
    # 添加每小时执行的库存预警检查任务
    scheduler.add_job(check_inventory_alerts, 'interval', hours=1)
    
    # 启动调度器
    scheduler.start()
    
    # 返回调度器实例，供主程序管理
    return scheduler



# ==================== 主程序入口 ====================

if __name__ == '__main__':
    """
    主程序入口点
    
    执行流程:
    1. 创建Flask应用实例
    2. 设置后台定时任务调度器
    3. 启动Web服务器
    4. 处理系统关闭和异常情况
    """
    
    # 创建并配置Flask应用实例
    app = create_app()
    
    # 设置并启动后台定时任务调度器
    scheduler = setup_scheduler(app)
    
    try:
        # 记录系统启动日志
        logger.info("QuantumFlow 量子流仓储平台启动中...")
        
        # 启动Flask开发服务器
        # host='0.0.0.0' - 允许外部访问
        # port=5000 - 监听5000端口
        # debug=True - 启用调试模式（开发环境）
        app.run(host='0.0.0.0', port=5000, debug=True)
        
    except KeyboardInterrupt:
        # 处理用户手动中断（Ctrl+C）
        logger.info("系统正在关闭...")
        scheduler.shutdown()  # 优雅关闭调度器
        
    except Exception as e:
        # 处理其他异常情况
        logger.error(f"系统启动失败: {e}")
        scheduler.shutdown()  # 确保调度器被正确关闭