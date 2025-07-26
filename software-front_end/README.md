# QuantumFlow 量子流仓储平台

一个基于Flask和机器学习的下一代智能仓储管理系统，集成了库存管理、销售预测、生产计划、物流调度和智能分析等功能。

## 功能特性

### 核心功能
- **库存管理**: 实时库存监控、预警提醒、自动补货建议
- **销售预测**: 基于机器学习的销售趋势预测和需求分析
- **生产管理**: 智能生产计划制定、进度监控、效率分析
- **物流调度**: Jetson Nano智能小车集成、任务自动分配
- **智能分析**: LLM驱动的业务洞察和策略建议
- **数据看板**: 实时数据可视化、关键指标监控

### 技术特性
- **前后端分离**: Flask后端 + 现代化前端界面
- **机器学习**: scikit-learn驱动的预测算法
- **语音交互**: 语音提示和播报功能
- **实时通信**: MQTT/HTTP双协议支持
- **数据可视化**: Chart.js图表展示
- **响应式设计**: 支持多设备访问

## 系统架构

```
QuantumFlow 量子流仓储平台/
├── app.py                 # 主应用程序
├── requirements.txt       # 依赖包列表
├── backend/              # 后端模块
│   ├── __init__.py
│   ├── database.py       # 数据库配置
│   ├── models.py         # 数据模型
│   ├── api.py           # API接口
│   ├── ml_service.py    # 机器学习服务
│   ├── llm_service.py   # 大语言模型服务
│   ├── logistics_service.py # 物流服务
│   └── voice_service.py # 语音服务
└── frontend/            # 前端模块
    ├── templates/
    │   └── index.html    # 主页面模板
    └── static/
        ├── css/
        │   └── style.css # 样式文件
        └── js/
            ├── app.js    # 主应用脚本
            └── modules/  # 功能模块
                ├── inventory.js
                ├── prediction.js
                ├── production.js
                ├── logistics.js
                ├── analysis.js
                └── dashboard.js
```

## 安装和运行

### 环境要求
- Python 3.8+
- Windows/Linux/macOS
- 8GB+ RAM (推荐)
- 现代浏览器 (Chrome/Firefox/Safari)

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd RBCC Project
   ```

2. **安装依赖**
   ```bash
   pip install -r requirements.txt
   ```

3. **配置环境变量** (可选)
   ```bash
   # 设置OpenAI API密钥 (用于LLM分析)
   export OPENAI_API_KEY="your-api-key-here"
   
   # 设置MQTT服务器 (用于物流通信)
   export MQTT_BROKER="your-mqtt-broker"
   export MQTT_PORT=1883
   ```

4. **初始化数据库**
   ```bash
   python -c "from backend.database import init_db; init_db()"
   ```

5. **启动系统**
   ```bash
   python app.py
   ```

6. **访问系统**
   打开浏览器访问: http://localhost:5000

## 使用指南

### 快速开始

1. **系统概览**: 启动后默认显示数据看板，展示关键业务指标
2. **库存管理**: 点击"库存管理"查看和管理产品库存
3. **销售预测**: 使用"销售预测"功能分析销售趋势
4. **生产管理**: 通过"生产管理"制定和监控生产计划
5. **物流调度**: 在"物流调度"中控制智能小车和任务分配
6. **智能分析**: 使用"智能分析"获取AI驱动的业务洞察

### 主要功能说明

#### 库存管理
- 实时查看所有产品库存状态
- 设置安全库存阈值和自动预警
- 支持库存调整和产品信息编辑
- 提供库存统计和分析报告

#### 销售预测
- 基于历史数据的机器学习预测
- 支持多种预测模型和时间周期
- 可视化销售趋势和预测结果
- 提供预测准确度评估

#### 生产管理
- 智能生产计划制定和优化
- 实时生产进度监控
- 生产效率分析和改进建议
- 设备状态监控和维护提醒

#### 物流调度
- Jetson Nano智能小车集成
- 自动任务分配和路径规划
- 实时位置跟踪和状态监控
- 仓库地图可视化

#### 智能分析
- LLM驱动的业务分析和建议
- 多维度数据洞察
- 自动生成分析报告
- 预警和风险识别

### 语音功能

系统支持语音交互功能:
- **语音提示**: 重要操作的语音反馈
- **状态播报**: 系统状态和警告的语音通知
- **快捷操作**: 语音命令控制 (开发中)

### 键盘快捷键

- `Ctrl + 1-6`: 快速切换功能模块
- `Ctrl + R`: 刷新当前模块数据
- `Ctrl + E`: 导出当前数据
- `F11`: 全屏模式切换
- `Esc`: 关闭模态框

## 配置说明

### 数据库配置
系统默认使用SQLite数据库，数据文件位于 `warehouse.db`。如需使用其他数据库，请修改 `backend/database.py` 中的配置。

### 机器学习配置
- 预测模型自动训练和更新
- 支持自定义模型参数
- 模型文件保存在 `models/` 目录

### 物流设备配置
- 支持MQTT和HTTP两种通信协议
- 可配置多台Jetson Nano设备
- 自定义仓库地图和位置信息

### LLM服务配置
- 支持OpenAI GPT模型
- 可配置API密钥和模型参数
- 提供离线模拟模式

## 开发说明

### 项目结构
- `backend/`: 后端业务逻辑和API
- `frontend/`: 前端界面和交互
- `models/`: 机器学习模型文件
- `data/`: 数据文件和备份

### 扩展开发
1. **添加新功能模块**: 在 `frontend/static/js/modules/` 创建新模块
2. **扩展API接口**: 在 `backend/api.py` 添加新的路由
3. **自定义预测模型**: 修改 `backend/ml_service.py`
4. **集成新设备**: 扩展 `backend/logistics_service.py`

### 测试
```bash
# 运行单元测试
python -m pytest tests/

# 运行API测试
python -m pytest tests/test_api.py

# 运行前端测试
npm test  # 如果有前端测试
```

## 故障排除

### 常见问题

1. **启动失败**
   - 检查Python版本和依赖包
   - 确认端口5000未被占用
   - 查看错误日志信息

2. **数据库错误**
   - 重新初始化数据库
   - 检查文件权限
   - 清理损坏的数据文件

3. **预测功能异常**
   - 确保有足够的历史数据
   - 检查模型文件完整性
   - 重新训练预测模型

4. **物流设备连接失败**
   - 检查网络连接
   - 确认MQTT服务器配置
   - 验证设备IP地址

5. **语音功能无效**
   - 检查音频设备
   - 确认pygame安装
   - 测试TTS服务

### 日志查看
系统日志保存在数据库的 `system_logs` 表中，也可以通过以下方式查看:
```bash
# 查看应用日志
tail -f app.log

# 查看错误日志
tail -f error.log
```

## 更新日志

### v1.0.0 (当前版本)
- 完整的智能仓储管理系统
- 集成机器学习预测功能
- 支持Jetson Nano物流设备
- LLM智能分析功能
- 现代化Web界面
- 语音交互支持

## 技术支持

如有问题或建议，请通过以下方式联系:
- 邮箱: support@warehouse-system.com
- 文档: https://docs.warehouse-system.com
- 社区: https://community.warehouse-system.com

## 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。

---

**QuantumFlow 量子流仓储平台** - 让仓储管理更智能、更高效！