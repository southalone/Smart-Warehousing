#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据库模型定义模块

本模块定义了智能仓储管理系统的所有数据模型，包括：
1. Product - 产品信息模型
2. Inventory - 库存管理模型
3. SalesHistory - 销售历史模型
4. ProductionPlan - 生产计划模型
5. LogisticsTask - 物流任务模型
6. SystemLog - 系统日志模型

每个模型都包含：
- 完整的字段定义和约束
- 关联关系定义
- to_dict()方法用于序列化
- __repr__()方法用于调试显示

作者: 智能仓储系统开发团队
版本: 1.0
创建时间: 2024
"""

# 日期时间处理模块
from datetime import datetime
# 数据库实例导入
from .database import db

# ==================== 产品信息模型 ====================

class Product(db.Model):
    """
    产品信息模型
    
    用于存储产品的基本信息，包括产品名称、型号、类别等。
    这是系统的核心实体之一，与库存、销售、生产等模块都有关联。
    
    字段说明:
    - id: 产品唯一标识符（主键）
    - name: 产品名称，不能为空
    - model: 产品型号，必须唯一，不能为空
    - category: 产品类别，用于分类管理
    - unit: 计量单位，默认为'个'
    - description: 产品详细描述
    - created_at: 记录创建时间
    - updated_at: 记录最后更新时间
    
    关联关系:
    - inventory: 一对一关联库存信息
    - sales_history: 一对多关联销售历史
    - production_plans: 一对多关联生产计划
    """
    # 数据库表名
    __tablename__ = 'products'
    
    # ========== 字段定义 ==========
    
    # 主键ID，自增整数
    id = db.Column(db.Integer, primary_key=True)
    
    # 产品名称，最大100字符，不能为空
    name = db.Column(db.String(100), nullable=False, comment='产品名称')
    
    # 产品型号，最大50字符，必须唯一，不能为空
    model = db.Column(db.String(50), unique=True, nullable=False, comment='产品型号')
    
    # 产品类别，最大50字符，不能为空
    category = db.Column(db.String(50), nullable=False, comment='产品类别')
    
    # 计量单位，最大20字符，默认为'个'
    unit = db.Column(db.String(20), nullable=False, default='个', comment='计量单位')
    
    # 产品描述，文本类型，可为空
    description = db.Column(db.Text, comment='产品描述')
    

    
    # ========== 关联关系定义 ==========
    
    # 与库存表的一对一关系，删除产品时级联删除库存记录
    inventory = db.relationship('Inventory', backref='product', uselist=False, cascade='all, delete-orphan')
    
    # 与销售历史表的一对多关系，删除产品时级联删除所有销售记录
    sales_history = db.relationship('SalesHistory', backref='product', cascade='all, delete-orphan')
    
    # 与生产计划表的一对多关系，删除产品时级联删除所有生产计划
    production_plans = db.relationship('ProductionPlan', backref='product', cascade='all, delete-orphan')
    
    # 与物流任务表的一对多关系，删除产品时级联删除所有物流任务
    logistics_tasks = db.relationship('LogisticsTask', backref='product', cascade='all, delete-orphan')
    
    # ========== 实例方法 ==========
    
    def to_dict(self):
        """
        将产品对象转换为字典格式
        
        主要用于API响应的JSON序列化，将SQLAlchemy模型对象
        转换为可以被JSON序列化的Python字典。
        
        返回值:
            dict: 包含产品所有字段信息的字典
                - id: 产品ID
                - name: 产品名称
                - model: 产品型号
                - category: 产品类别
                - unit: 计量单位
                - description: 产品描述
                - created_at: 创建时间（ISO格式字符串）
                - updated_at: 更新时间（ISO格式字符串）
        
        注意:
            时间字段会转换为ISO格式字符串，如果为None则保持None
        """
        return {
            'id': self.id,
            'name': self.name,
            'model': self.model,
            'category': self.category,
            'unit': self.unit,
            'description': self.description,

        }
    
    def __repr__(self):
        """
        返回产品对象的字符串表示
        
        主要用于调试和日志输出，提供简洁明了的对象信息。
        
        返回值:
            str: 格式为 '<Product 产品名称(产品型号)>' 的字符串
        
        示例:
            <Product iPhone 14(IP14-128GB)>
        """
        return f'<Product {self.name}({self.model})>'

# ==================== 库存管理模型 ====================

class Inventory(db.Model):
    """
    库存管理模型
    
    用于管理产品的库存信息，包括当前库存量、安全库存、最大库存等。
    与产品表建立一对一关系，每个产品对应一条库存记录。
    
    字段说明:
    - id: 库存记录唯一标识符（主键）
    - product_id: 关联的产品ID（外键）
    - current_stock: 当前实际库存数量
    - safety_stock: 安全库存阈值，低于此值需要补货
    - max_stock: 最大库存容量限制
    - location: 货物存放的具体位置
    - last_updated: 库存信息最后更新时间
    
    业务逻辑:
    - 当current_stock <= safety_stock时，触发低库存预警
    - 当current_stock >= max_stock时，可能需要限制入库
    - location字段用于仓库货位管理
    """
    # 数据库表名
    __tablename__ = 'inventory'
    
    # ========== 字段定义 ==========
    
    # 主键ID，自增整数
    id = db.Column(db.Integer, primary_key=True)
    
    # 产品外键，关联products表的id字段，不能为空
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    
    # 当前库存数量，整数类型，默认为0，不能为空
    current_stock = db.Column(db.Integer, nullable=False, default=0, comment='当前库存')
    
    # 安全库存阈值，整数类型，默认为10，不能为空
    safety_stock = db.Column(db.Integer, nullable=False, default=10, comment='安全库存')
    
    # 最大库存容量，整数类型，默认为1000，不能为空
    max_stock = db.Column(db.Integer, nullable=False, default=1000, comment='最大库存')
    
    # 存放位置，最大50字符，可为空
    location = db.Column(db.String(50), comment='存放位置')
    
    # ========== 实例方法 ==========
    
    def to_dict(self):
        """
        将库存对象转换为字典格式
        
        主要用于API响应的JSON序列化，将SQLAlchemy模型对象
        转换为可以被JSON序列化的Python字典。
        
        返回值:
            dict: 包含库存所有字段信息的字典
                - id: 库存记录ID
                - product_id: 关联的产品ID
                - current_stock: 当前库存数量
                - safety_stock: 安全库存阈值
                - max_stock: 最大库存容量
                - location: 存放位置
                - last_updated: 最后更新时间（ISO格式字符串）
                - is_low_stock: 是否为低库存状态（布尔值）
        
        特殊字段:
            is_low_stock: 计算字段，当当前库存小于等于安全库存时为True
        """
        return {
            'id': self.id,
            'product_id': self.product_id,
            'current_stock': self.current_stock,
            'safety_stock': self.safety_stock,
            'max_stock': self.max_stock,
            'location': self.location,
            # 计算是否为低库存状态
            'is_low_stock': self.current_stock <= self.safety_stock,
            # 注意：由于产品表不再包含单价，库存价值需要通过其他方式计算
            'inventory_value': 0.0  # 需要根据最新销售记录或其他方式计算
        }
    
    def __repr__(self):
        """
        返回库存对象的字符串表示
        
        主要用于调试和日志输出，提供简洁明了的对象信息。
        
        返回值:
            str: 格式为 '<Inventory Product:产品ID Stock:库存数量>' 的字符串
        
        示例:
            <Inventory Product:1 Stock:150>
        """
        return f'<Inventory Product:{self.product_id} Stock:{self.current_stock}>'

# ==================== 销售历史模型 ====================

class SalesHistory(db.Model):
    """
    销售历史模型
    
    用于记录产品的销售历史数据，包括销售数量、客户信息等。
    这些数据用于销售分析、预测和报表生成。
    
    字段说明:
    - id: 销售记录唯一标识符（主键）
    - product_id: 关联的产品ID（外键）
    - quantity: 销售数量，必须大于0
    - sale_date: 销售发生的日期时间
    
    业务用途:
    - 销售趋势分析
    - 客户购买行为分析
    - 产品销售预测
    - 财务报表生成
    
    注意: 单价和总金额通过关联的Product表计算获得，避免数据冗余
    """
    # 数据库表名
    __tablename__ = 'sales_history'
    
    # ========== 字段定义 ==========
    
    # 主键ID，自增整数
    id = db.Column(db.Integer, primary_key=True)
    
    # 产品外键，关联products表的id字段，不能为空
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    
    # 销售数量，整数类型，不能为空
    quantity = db.Column(db.Integer, nullable=False, comment='销售数量')
    
    # 销售日期，默认为当前UTC时间
    sale_date = db.Column(db.DateTime, default=datetime.utcnow, comment='销售日期')
    
    # 销售单价，浮点数类型，不能为空
    unit_price = db.Column(db.Float, nullable=False, default=0.0, comment='销售单价')
    
    # 生产成本，十进制类型，精度为10位，小数点后2位
    production_cost = db.Column(db.Numeric(10, 2), comment='生产成本')
    
    # 平均损耗率，十进制类型，精度为5位，小数点后2位
    average_loss_rate = db.Column(db.Numeric(5, 2), comment='平均损耗率(%)')
    
    # 是否打折销售，布尔类型，默认为False
    is_discount_sale = db.Column(db.Boolean, default=False, comment='是否打折销售')
    
    # ========== 实例方法 ==========
    
    def to_dict(self):
        """
        将销售历史对象转换为字典格式
        
        主要用于API响应的JSON序列化，将SQLAlchemy模型对象
        转换为可以被JSON序列化的Python字典。
        
        返回值:
            dict: 包含销售历史所有字段信息的字典
                - id: 销售记录ID
                - product_id: 关联的产品ID
                - quantity: 销售数量
                - unit_price: 产品单价（从关联Product表获取）
                - total_amount: 销售总金额（计算得出）
                - sale_date: 销售日期（ISO格式字符串）
        
        用途:
            主要用于销售报表、分析图表和API接口返回
        """
        # 使用销售记录中的单价
        unit_price = self.unit_price
        # 计算总金额
        total_amount = self.quantity * unit_price
        
        return {
            'id': self.id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'unit_price': unit_price,
            'total_amount': total_amount,
            # 将datetime对象转换为ISO格式字符串
            'sale_date': self.sale_date.isoformat() if self.sale_date else None,
            # 新增字段
            'production_cost': float(self.production_cost) if self.production_cost else None,
            'average_loss_rate': float(self.average_loss_rate) if self.average_loss_rate else None,
            'is_discount_sale': self.is_discount_sale
        }
    
    def __repr__(self):
        """
        返回销售历史对象的字符串表示
        
        主要用于调试和日志输出，提供简洁明了的对象信息。
        
        返回值:
            str: 格式为 '<SalesHistory Product:产品ID Qty:销售数量>' 的字符串
        
        示例:
            <SalesHistory Product:1 Qty:50>
        """
        return f'<SalesHistory Product:{self.product_id} Qty:{self.quantity}>'

# ==================== 生产计划模型 ====================

class ProductionPlan(db.Model):
    """
    生产计划模型
    
    用于管理产品的生产计划，包括计划数量、实际数量、时间安排等。
    支持生产进度跟踪和生产效率分析。
    
    字段说明:
    - id: 生产计划唯一标识符（主键）
    - product_id: 关联的产品ID（外键）
    - planned_quantity: 计划生产的数量
    - actual_quantity: 实际已生产的数量
    - start_date: 计划开始生产的日期
    - end_date: 计划完成生产的日期
    - status: 生产状态（planned/in_progress/completed/cancelled）
    - priority: 生产优先级（low/normal/high/urgent）
    - notes: 生产备注信息
    - created_at: 计划创建时间
    
    状态流转:
    planned -> in_progress -> completed
                           -> cancelled
    
    业务用途:
    - 生产排程管理
    - 生产进度跟踪
    - 产能规划
    - 生产效率分析
    """
    # 数据库表名
    __tablename__ = 'production_plans'
    
    # ========== 字段定义 ==========
    
    # 主键ID，自增整数
    id = db.Column(db.Integer, primary_key=True)
    
    # 产品外键，关联products表的id字段，不能为空
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    
    # 计划生产数量，整数类型，不能为空
    planned_quantity = db.Column(db.Integer, nullable=False, comment='计划生产数量')
    
    # 实际生产数量，整数类型，默认为0
    actual_quantity = db.Column(db.Integer, default=0, comment='实际生产数量')
    
    # 生产日期，可为空
    production_date = db.Column(db.DateTime, comment='生产日期')
    
    # 生产状态，最大20字符，默认为'planned'
    status = db.Column(db.String(20), default='planned', comment='状态: planned, in_progress, completed, cancelled')
    
    # 优先级，最大20字符，默认为'normal'
    priority = db.Column(db.String(20), default='normal', comment='优先级: low, normal, high, urgent')
    
    # 创建时间，默认为当前UTC时间
    created_at = db.Column(db.DateTime, default=datetime.utcnow, comment='创建时间')
    
    # ========== 实例方法 ==========
    
    def to_dict(self):
        """
        将生产计划对象转换为字典格式
        
        主要用于API响应的JSON序列化，将SQLAlchemy模型对象
        转换为可以被JSON序列化的Python字典。
        
        返回值:
            dict: 包含生产计划所有字段信息的字典
                - id: 生产计划ID
                - product_id: 关联的产品ID
                - planned_quantity: 计划生产数量
                - actual_quantity: 实际生产数量
                - start_date: 开始日期（ISO格式字符串）
                - end_date: 结束日期（ISO格式字符串）
                - status: 生产状态
                - priority: 优先级
                - notes: 备注信息
                - created_at: 创建时间（ISO格式字符串）
        
        用途:
            主要用于生产管理界面、进度报表和API接口返回
        """
        return {
            'id': self.id,
            'product_id': self.product_id,
            'planned_quantity': self.planned_quantity,
            'actual_quantity': self.actual_quantity,
            # 将datetime对象转换为ISO格式字符串
            'production_date': self.production_date.isoformat() if self.production_date else None,
            'status': self.status,
            'priority': self.priority,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        """
        返回生产计划对象的字符串表示
        
        主要用于调试和日志输出，提供简洁明了的对象信息。
        
        返回值:
            str: 格式为 '<ProductionPlan Product:产品ID Qty:计划数量>' 的字符串
        
        示例:
            <ProductionPlan Product:1 Qty:100>
        """
        return f'<ProductionPlan Product:{self.product_id} Qty:{self.planned_quantity}>'

# ==================== 物流任务模型 ====================

class LogisticsTask(db.Model):
    """
    物流任务模型
    
    用于管理仓库内的物流任务，包括入库、出库、转移等操作。
    支持机器人任务分配和执行状态跟踪。
    
    字段说明:
    - id: 物流任务唯一标识符（主键）
    - task_type: 任务类型（inbound入库/outbound出库/transfer转移）
    - product_id: 关联的产品ID（外键）
    - quantity: 操作数量
    - from_location: 起始位置（对于入库任务可为空）
    - to_location: 目标位置
    - status: 任务状态（pending/assigned/in_progress/completed/failed）
    - robot_id: 分配执行任务的机器人ID
    - priority: 任务优先级（1-5，数字越大优先级越高）
    - created_at: 任务创建时间
    - started_at: 任务开始执行时间
    - completed_at: 任务完成时间
    - notes: 任务备注信息
    
    任务类型说明:
    - inbound: 入库任务，将货物从接收区移动到存储位置
    - outbound: 出库任务，将货物从存储位置移动到发货区
    - transfer: 转移任务，在仓库内不同位置间移动货物
    
    状态流转:
    pending -> assigned -> in_progress -> completed
                                      -> failed
    
    业务用途:
    - 自动化仓库操作
    - 机器人任务调度
    - 物流效率分析
    - 任务执行监控
    """
    # 数据库表名
    __tablename__ = 'logistics_tasks'
    
    # ========== 字段定义 ==========
    
    # 主键ID，自增整数
    id = db.Column(db.Integer, primary_key=True)
    
    # 产品外键，关联products表的id字段，不能为空
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    
    # 操作数量，整数类型，不能为空
    quantity = db.Column(db.Integer, nullable=False, comment='数量')
    
    # 起始位置，最大50字符，可为空
    from_location = db.Column(db.String(50), comment='起始位置')
    
    # 目标位置，最大50字符，可为空
    to_location = db.Column(db.String(50), comment='目标位置')
    
    # 任务类型，最大20字符，不能为空
    task_type = db.Column(db.String(20), nullable=False, comment='任务类型')
    
    # 任务状态，最大20字符，默认为pending
    status = db.Column(db.String(20), default='pending', comment='任务状态')
    
    # 分配的机器人ID，最大50字符，可为空
    robot_id = db.Column(db.String(50), comment='机器人ID')
    
    # 任务优先级，整数类型，默认为1
    priority = db.Column(db.Integer, default=1, comment='任务优先级')
    
    # 创建时间，默认为当前UTC时间
    created_at = db.Column(db.DateTime, default=datetime.utcnow, comment='创建时间')
    
    # 开始时间，可为空
    started_at = db.Column(db.DateTime, comment='开始时间')
    
    # 完成时间，可为空
    completed_at = db.Column(db.DateTime, comment='完成时间')
    
    # 任务备注，文本类型，可为空
    notes = db.Column(db.Text, comment='任务备注')
    
    # ========== 实例方法 ==========
    
    def to_dict(self):
        """
        将物流任务对象转换为字典格式
        
        主要用于API响应的JSON序列化，将SQLAlchemy模型对象
        转换为可以被JSON序列化的Python字典。
        
        返回值:
            dict: 包含物流任务所有字段信息的字典
                - id: 物流任务ID
                - task_type: 任务类型
                - product_id: 关联的产品ID
                - quantity: 操作数量
                - from_location: 起始位置
                - to_location: 目标位置
                - status: 任务状态
                - robot_id: 分配的机器人ID
                - priority: 任务优先级
                - created_at: 创建时间（ISO格式字符串）
                - started_at: 开始时间（ISO格式字符串）
                - completed_at: 完成时间（ISO格式字符串）
        
        用途:
            主要用于物流管理界面、任务监控和API接口返回
        """
        return {
            'id': self.id,
            'task_type': self.task_type,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'from_location': self.from_location,
            'to_location': self.to_location,
            'status': self.status,
            'robot_id': self.robot_id,
            'priority': self.priority,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'notes': self.notes
        }
    
    def __repr__(self):
        """
        返回物流任务对象的字符串表示
        
        主要用于调试和日志输出，提供简洁明了的对象信息。
        
        返回值:
            str: 格式为 '<LogisticsTask 任务类型 Product:产品ID>' 的字符串
        
        示例:
            <LogisticsTask inbound Product:1>
        """
        return f'<LogisticsTask Product:{self.product_id}>'

# ==================== 系统日志模型 ====================

class SystemLog(db.Model):
    """
    系统日志模型
    
    用于记录系统运行过程中的各种日志信息，包括操作日志、错误日志、
    安全日志等，支持系统监控、问题排查和审计追踪。
    
    字段说明:
    - id: 日志记录唯一标识符（主键）
    - level: 日志级别（DEBUG/INFO/WARNING/ERROR/CRITICAL）
    - module: 产生日志的模块名称
    - message: 日志消息内容
    - user_id: 相关用户ID（如果是用户操作产生的日志）
    - ip_address: 客户端IP地址（支持IPv4和IPv6）
    - created_at: 日志记录创建时间
    
    日志级别说明:
    - DEBUG: 调试信息，详细的程序执行信息
    - INFO: 一般信息，程序正常运行的信息
    - WARNING: 警告信息，可能存在问题但不影响运行
    - ERROR: 错误信息，程序执行出现错误
    - CRITICAL: 严重错误，可能导致程序无法继续运行
    
    业务用途:
    - 系统运行监控
    - 问题诊断和排查
    - 安全审计
    - 性能分析
    - 用户行为追踪
    """
    # 数据库表名
    __tablename__ = 'system_logs'
    
    # ========== 字段定义 ==========
    
    # 主键ID，自增整数
    id = db.Column(db.Integer, primary_key=True)
    
    # 日志级别，最大20字符，不能为空
    level = db.Column(db.String(20), nullable=False, comment='日志级别')
    
    # 模块名称，最大50字符，不能为空
    module = db.Column(db.String(50), nullable=False, comment='模块名称')
    
    # 日志消息内容，文本类型，不能为空
    message = db.Column(db.Text, nullable=False, comment='日志消息')
    
    # 用户ID，最大50字符，可为空
    user_id = db.Column(db.String(50), comment='用户ID')
    
    # 创建时间，默认为当前UTC时间
    created_at = db.Column(db.DateTime, default=datetime.utcnow, comment='创建时间')
    
    # ========== 实例方法 ==========
    
    def to_dict(self):
        """
        将系统日志对象转换为字典格式
        
        主要用于API响应的JSON序列化，将SQLAlchemy模型对象
        转换为可以被JSON序列化的Python字典。
        
        返回值:
            dict: 包含系统日志所有字段信息的字典
                - id: 日志记录ID
                - level: 日志级别
                - module: 模块名称
                - message: 日志消息
                - user_id: 用户ID
                - ip_address: IP地址
                - created_at: 创建时间（ISO格式字符串）
        
        用途:
            主要用于日志查看界面、监控面板和API接口返回
        """
        return {
            'id': self.id,
            'level': self.level,
            'module': self.module,
            'message': self.message,
            'user_id': self.user_id,
            # 将datetime对象转换为ISO格式字符串
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        """
        返回系统日志对象的字符串表示
        
        主要用于调试和日志输出，提供简洁明了的对象信息。
        
        返回值:
            str: 格式为 '<SystemLog 日志级别: 模块名称>' 的字符串
        
        示例:
            <SystemLog ERROR: api>
        """
        return f'<SystemLog {self.level}: {self.module}>'