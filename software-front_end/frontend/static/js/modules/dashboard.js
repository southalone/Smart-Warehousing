// 数据看板模块

let dashboardData = {};
let dashboardCharts = {};
let refreshInterval = null;

// 加载数据看板模块
function loadDashboardModule() {
    console.log('加载数据看板模块');
    
    const moduleContent = document.getElementById('dashboard-module');
    if (!moduleContent) return;
    
    // 渲染模块界面
    moduleContent.innerHTML = `
        <div class="module-header">
            <h3><i class="fas fa-tachometer-alt"></i> 数据看板</h3>
            <div class="module-actions">
                <button class="btn btn-primary" onclick="refreshDashboard()">
                    <i class="fas fa-sync-alt"></i> 刷新数据
                </button>
                <button class="btn btn-secondary" onclick="toggleAutoRefresh()">
                    <i class="fas fa-clock"></i> <span id="auto-refresh-text">开启自动刷新</span>
                </button>
                <button class="btn btn-success" onclick="exportDashboard()">
                    <i class="fas fa-download"></i> 导出报表
                </button>
                <button class="btn btn-info" onclick="toggleFullscreen()">
                    <i class="fas fa-expand"></i> 全屏显示
                </button>
            </div>
        </div>
        
        <div class="dashboard-content">
            <!-- 关键指标卡片 -->
            <div class="metrics-grid">
                <div class="metric-card sales-card">
                    <div class="metric-header">
                        <h4><i class="fas fa-chart-line"></i> 今日销售</h4>
                        <span class="metric-period">今日</span>
                    </div>
                    <div class="metric-body">
                        <div class="metric-value" id="today-sales">¥0</div>
                        <div class="metric-change" id="sales-change">
                            <i class="fas fa-arrow-up"></i> +0%
                        </div>
                    </div>
                    <div class="metric-footer">
                        <small>较昨日</small>
                    </div>
                </div>
                
                <div class="metric-card inventory-card">
                    <div class="metric-header">
                        <h4><i class="fas fa-boxes"></i> 库存状态</h4>
                        <span class="metric-period">实时</span>
                    </div>
                    <div class="metric-body">
                        <div class="metric-value" id="inventory-status">正常</div>
                        <div class="metric-change" id="inventory-alerts">
                            <i class="fas fa-exclamation-triangle"></i> <span id="alert-count">0</span>个预警
                        </div>
                    </div>
                    <div class="metric-footer">
                        <small>库存预警</small>
                    </div>
                </div>
                
                <div class="metric-card production-card">
                    <div class="metric-header">
                        <h4><i class="fas fa-cogs"></i> 生产效率</h4>
                        <span class="metric-period">当前</span>
                    </div>
                    <div class="metric-body">
                        <div class="metric-value" id="production-efficiency">0%</div>
                        <div class="metric-change" id="efficiency-trend">
                            <i class="fas fa-arrow-up"></i> 良好
                        </div>
                    </div>
                    <div class="metric-footer">
                        <small>设备运行状态</small>
                    </div>
                </div>
                
                <div class="metric-card logistics-card">
                    <div class="metric-header">
                        <h4><i class="fas fa-truck"></i> 物流状态</h4>
                        <span class="metric-period">实时</span>
                    </div>
                    <div class="metric-body">
                        <div class="metric-value" id="logistics-status">运行中</div>
                        <div class="metric-change" id="robot-status">
                            <i class="fas fa-robot"></i> <span id="active-robots">0</span>台在线
                        </div>
                    </div>
                    <div class="metric-footer">
                        <small>智能机器人</small>
                    </div>
                </div>
            </div>
            
            <!-- 图表区域 -->
            <div class="charts-grid">
                <!-- 销售趋势图 -->
                <div class="chart-container sales-trend">
                    <div class="chart-header">
                        <h4><i class="fas fa-chart-area"></i> 销售趋势</h4>
                        <div class="chart-controls">
                            <select id="sales-period" onchange="updateSalesTrend()">
                                <option value="7d">近7天</option>
                                <option value="30d" selected>近30天</option>
                                <option value="90d">近90天</option>
                            </select>
                        </div>
                    </div>
                    <div class="chart-body">
                        <canvas id="sales-trend-chart" width="400" height="200"></canvas>
                    </div>
                </div>
                
                <!-- 库存分布图 -->
                <div class="chart-container inventory-distribution">
                    <div class="chart-header">
                        <h4><i class="fas fa-chart-pie"></i> 库存分布</h4>
                        <div class="chart-controls">
                            <button class="btn btn-sm" onclick="updateInventoryView('category')">
                                按类别
                            </button>
                            <button class="btn btn-sm" onclick="updateInventoryView('status')">
                                按状态
                            </button>
                        </div>
                    </div>
                    <div class="chart-body">
                        <canvas id="inventory-chart" width="400" height="200"></canvas>
                    </div>
                </div>
                
                <!-- 生产监控 -->
                <div class="chart-container production-monitor">
                    <div class="chart-header">
                        <h4><i class="fas fa-industry"></i> 生产监控</h4>
                        <div class="chart-controls">
                            <span class="status-indicator" id="production-indicator">
                                <i class="fas fa-circle"></i> 运行中
                            </span>
                        </div>
                    </div>
                    <div class="chart-body">
                        <div class="production-metrics">
                            <div class="production-item">
                                <label>当前产量</label>
                                <span id="current-output">0</span>
                                <small>件/小时</small>
                            </div>
                            <div class="production-item">
                                <label>目标产量</label>
                                <span id="target-output">0</span>
                                <small>件/小时</small>
                            </div>
                            <div class="production-item">
                                <label>完成率</label>
                                <span id="completion-rate">0%</span>
                                <small>当日</small>
                            </div>
                            <div class="production-item">
                                <label>设备状态</label>
                                <span id="equipment-status">正常</span>
                                <small>运行状态</small>
                            </div>
                        </div>
                        <div class="production-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" id="production-progress" style="width: 0%"></div>
                            </div>
                            <span class="progress-text">生产进度</span>
                        </div>
                    </div>
                </div>
                
                <!-- 物流地图 -->
                <div class="chart-container logistics-map">
                    <div class="chart-header">
                        <h4><i class="fas fa-map"></i> 物流地图</h4>
                        <div class="chart-controls">
                            <button class="btn btn-sm" onclick="centerMap()">
                                <i class="fas fa-crosshairs"></i> 居中
                            </button>
                            <button class="btn btn-sm" onclick="toggleRobotPaths()">
                                <i class="fas fa-route"></i> 路径
                            </button>
                        </div>
                    </div>
                    <div class="chart-body">
                        <div class="warehouse-map" id="warehouse-map">
                            <!-- 仓库地图将通过JavaScript渲染 -->
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 实时数据表格 -->
            <div class="data-tables">
                <!-- 最新订单 -->
                <div class="table-container recent-orders">
                    <div class="table-header">
                        <h4><i class="fas fa-shopping-cart"></i> 最新订单</h4>
                        <a href="#" onclick="switchModule('sales')">查看全部</a>
                    </div>
                    <div class="table-body">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>订单号</th>
                                    <th>客户</th>
                                    <th>产品</th>
                                    <th>数量</th>
                                    <th>金额</th>
                                    <th>状态</th>
                                    <th>时间</th>
                                </tr>
                            </thead>
                            <tbody id="recent-orders-body">
                                <!-- 订单数据将通过JavaScript填充 -->
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- 库存预警 -->
                <div class="table-container inventory-alerts">
                    <div class="table-header">
                        <h4><i class="fas fa-exclamation-triangle"></i> 库存预警</h4>
                        <a href="#" onclick="switchModule('inventory')">查看全部</a>
                    </div>
                    <div class="table-body">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>产品名称</th>
                                    <th>当前库存</th>
                                    <th>安全库存</th>
                                    <th>预警类型</th>
                                    <th>建议操作</th>
                                </tr>
                            </thead>
                            <tbody id="inventory-alerts-body">
                                <!-- 预警数据将通过JavaScript填充 -->
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- 生产任务 -->
                <div class="table-container production-tasks">
                    <div class="table-header">
                        <h4><i class="fas fa-tasks"></i> 生产任务</h4>
                        <a href="#" onclick="switchModule('production')">查看全部</a>
                    </div>
                    <div class="table-body">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>任务编号</th>
                                    <th>产品</th>
                                    <th>计划数量</th>
                                    <th>完成数量</th>
                                    <th>进度</th>
                                    <th>预计完成</th>
                                </tr>
                            </thead>
                            <tbody id="production-tasks-body">
                                <!-- 任务数据将通过JavaScript填充 -->
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- 物流任务 -->
                <div class="table-container logistics-tasks">
                    <div class="table-header">
                        <h4><i class="fas fa-shipping-fast"></i> 物流任务</h4>
                        <a href="#" onclick="switchModule('logistics')">查看全部</a>
                    </div>
                    <div class="table-body">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>任务ID</th>
                                    <th>类型</th>
                                    <th>起点</th>
                                    <th>终点</th>
                                    <th>状态</th>
                                    <th>机器人</th>
                                </tr>
                            </thead>
                            <tbody id="logistics-tasks-body">
                                <!-- 物流任务数据将通过JavaScript填充 -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加样式
    addDashboardStyles();
    
    // 加载数据
    loadDashboardData();
    
    // 设置事件监听器
    setupDashboardEventListeners();
}

function addDashboardStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .dashboard-content {
            padding: 0;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
            border: 1px solid var(--border-color);
            transition: var(--transition);
            position: relative;
            overflow: hidden;
        }
        
        .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
        }
        
        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }
        
        .sales-card::before {
            background: linear-gradient(90deg, #3b82f6, #1d4ed8);
        }
        
        .inventory-card::before {
            background: linear-gradient(90deg, #059669, #047857);
        }
        
        .production-card::before {
            background: linear-gradient(90deg, #d97706, #b45309);
        }
        
        .logistics-card::before {
            background: linear-gradient(90deg, #dc2626, #b91c1c);
        }
        
        .metric-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .metric-header h4 {
            font-size: 1rem;
            font-weight: 600;
            color: var(--dark-color);
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .metric-period {
            font-size: 0.75rem;
            color: var(--secondary-color);
            background: var(--light-color);
            padding: 4px 8px;
            border-radius: 12px;
            font-weight: 500;
        }
        
        .metric-body {
            margin-bottom: 15px;
        }
        
        .metric-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--dark-color);
            line-height: 1;
            margin-bottom: 8px;
        }
        
        .metric-change {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        .metric-change.positive {
            color: var(--success-color);
        }
        
        .metric-change.negative {
            color: var(--danger-color);
        }
        
        .metric-change.neutral {
            color: var(--secondary-color);
        }
        
        .metric-footer {
            font-size: 0.8rem;
            color: var(--secondary-color);
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        
        .chart-container {
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            border: 1px solid var(--border-color);
            overflow: hidden;
        }
        
        .chart-header {
            padding: 20px 25px 15px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .chart-header h4 {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--dark-color);
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .chart-controls {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        
        .chart-controls select {
            padding: 6px 12px;
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            font-size: 0.9rem;
            background: white;
        }
        
        .chart-controls .btn {
            padding: 6px 12px;
            font-size: 0.8rem;
        }
        
        .chart-body {
            padding: 25px;
        }
        
        .production-metrics {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .production-item {
            text-align: center;
            padding: 15px;
            background: var(--light-color);
            border-radius: var(--border-radius);
        }
        
        .production-item label {
            display: block;
            font-size: 0.9rem;
            color: var(--secondary-color);
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .production-item span {
            display: block;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 4px;
        }
        
        .production-item small {
            font-size: 0.75rem;
            color: var(--secondary-color);
        }
        
        .production-progress {
            text-align: center;
        }
        
        .progress-bar {
            width: 100%;
            height: 12px;
            background: var(--light-color);
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 8px;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
            transition: width 0.3s ease;
        }
        
        .progress-text {
            font-size: 0.9rem;
            color: var(--secondary-color);
            font-weight: 500;
        }
        
        .status-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        .status-indicator.running {
            color: var(--success-color);
        }
        
        .status-indicator.stopped {
            color: var(--danger-color);
        }
        
        .status-indicator.warning {
            color: var(--warning-color);
        }
        
        .warehouse-map {
            width: 100%;
            height: 200px;
            background: var(--light-color);
            border-radius: var(--border-radius);
            position: relative;
            overflow: hidden;
        }
        
        .data-tables {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 25px;
        }
        
        .table-container {
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            border: 1px solid var(--border-color);
            overflow: hidden;
        }
        
        .table-header {
            padding: 20px 25px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--light-color);
        }
        
        .table-header h4 {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--dark-color);
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .table-header a {
            color: var(--primary-color);
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        .table-header a:hover {
            text-decoration: underline;
        }
        
        .table-body {
            max-height: 300px;
            overflow-y: auto;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .data-table th {
            background: var(--light-color);
            padding: 12px 15px;
            text-align: left;
            font-weight: 600;
            color: var(--dark-color);
            font-size: 0.9rem;
            border-bottom: 1px solid var(--border-color);
            position: sticky;
            top: 0;
            z-index: 1;
        }
        
        .data-table td {
            padding: 12px 15px;
            border-bottom: 1px solid var(--border-color);
            font-size: 0.9rem;
            color: var(--dark-color);
        }
        
        .data-table tr:hover {
            background: var(--light-color);
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
            text-align: center;
            min-width: 60px;
            display: inline-block;
        }
        
        .status-badge.success {
            background: rgba(5, 150, 105, 0.1);
            color: var(--success-color);
        }
        
        .status-badge.warning {
            background: rgba(217, 119, 6, 0.1);
            color: var(--warning-color);
        }
        
        .status-badge.danger {
            background: rgba(220, 38, 38, 0.1);
            color: var(--danger-color);
        }
        
        .status-badge.info {
            background: rgba(37, 99, 235, 0.1);
            color: var(--primary-color);
        }
        
        .progress-mini {
            width: 60px;
            height: 6px;
            background: var(--light-color);
            border-radius: 3px;
            overflow: hidden;
            display: inline-block;
            vertical-align: middle;
        }
        
        .progress-mini-fill {
            height: 100%;
            background: var(--primary-color);
            transition: width 0.3s ease;
        }
        
        @media (max-width: 768px) {
            .metrics-grid {
                grid-template-columns: 1fr;
            }
            
            .charts-grid {
                grid-template-columns: 1fr;
            }
            
            .data-tables {
                grid-template-columns: 1fr;
            }
            
            .production-metrics {
                grid-template-columns: 1fr;
            }
            
            .chart-header {
                flex-direction: column;
                gap: 15px;
                align-items: flex-start;
            }
            
            .table-body {
                overflow-x: auto;
            }
        }
        
        /* 全屏模式样式 */
        .dashboard-fullscreen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: var(--bg-color);
            z-index: 9999;
            overflow-y: auto;
            padding: 20px;
        }
        
        .dashboard-fullscreen .module-header {
            position: sticky;
            top: 0;
            background: var(--bg-color);
            z-index: 100;
            padding-bottom: 20px;
        }
    `;
    document.head.appendChild(style);
}

function setupDashboardEventListeners() {
    // 设置自动刷新
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoRefresh();
        } else {
            if (refreshInterval) {
                startAutoRefresh();
            }
        }
    });
}

function loadDashboardData() {
    app.showLoading();
    
    // 并行加载所有数据
    Promise.all([
        loadMetricsData(),
        loadChartsData(),
        loadTablesData()
    ]).then(() => {
        app.hideLoading();
        app.playVoice('数据看板已更新');
    }).catch(error => {
        console.error('加载看板数据错误:', error);
        app.hideLoading();
        app.showNotification('数据加载失败', 'error');
    });
}

function loadMetricsData() {
    // 并行加载多个数据源
    const promises = [
        app.apiRequest('/api/sales/today', { method: 'GET' }),
        app.apiRequest('/api/inventory/alerts', { method: 'GET' }),
        app.apiRequest('/api/production/efficiency', { method: 'GET' }),
        app.apiRequest('/api/logistics/robots/status', { method: 'GET' })
    ];
    
    return Promise.allSettled(promises)
        .then(results => {
            const metrics = {};
            
            // 处理今日销售数据
            if (results[0].status === 'fulfilled' && results[0].value.success) {
                const salesData = results[0].value.data;
                metrics.today_sales = salesData.total_amount || 0;
                metrics.sales_change = salesData.change_percentage || 0;
            } else {
                metrics.today_sales = 0;
                metrics.sales_change = 0;
            }
            
            // 处理库存预警数据
            if (results[1].status === 'fulfilled' && results[1].value.success) {
                metrics.inventory_alerts = results[1].value.data.length || 0;
            } else {
                metrics.inventory_alerts = 0;
            }
            
            // 处理生产效率数据
            if (results[2].status === 'fulfilled' && results[2].value.success) {
                metrics.production_efficiency = results[2].value.data.efficiency || 0;
            } else {
                metrics.production_efficiency = 0;
            }
            
            // 处理机器人状态数据
            if (results[3].status === 'fulfilled' && results[3].value.success) {
                const robotData = results[3].value.data;
                metrics.active_robots = robotData.filter(robot => robot.status === 'active').length || 0;
            } else {
                metrics.active_robots = 0;
            }
            
            dashboardData.metrics = metrics;
            updateMetricsCards();
        })
        .catch(error => {
            console.error('加载指标数据错误:', error);
            // 使用模拟数据作为后备
            dashboardData.metrics = {};
            updateMetricsCards();
        });
}

function loadChartsData() {
    // 并行加载图表数据
    const promises = [
        app.apiRequest('/api/sales/trend?days=30', { method: 'GET' }),
        app.apiRequest('/api/inventory/distribution', { method: 'GET' }),
        app.apiRequest('/api/production/monitor', { method: 'GET' })
    ];
    
    return Promise.allSettled(promises)
        .then(results => {
            const charts = {};
            
            // 处理销售趋势数据
            if (results[0].status === 'fulfilled' && results[0].value.success) {
                const salesTrend = results[0].value.data;
                charts.sales_trend = {
                    labels: salesTrend.map(item => item.date),
                    data: salesTrend.map(item => item.amount)
                };
            } else {
                charts.sales_trend = {
                    labels: ['1日', '2日', '3日', '4日', '5日', '6日', '7日'],
                    data: [12000, 15000, 13000, 18000, 16000, 20000, 22000]
                };
            }
            
            // 处理库存分布数据
            if (results[1].status === 'fulfilled' && results[1].value.success) {
                const inventoryData = results[1].value.data;
                charts.inventory = {
                    labels: inventoryData.map(item => item.category),
                    data: inventoryData.map(item => item.percentage)
                };
            } else {
                charts.inventory = {
                    labels: ['原材料', '半成品', '成品', '包装材料'],
                    data: [35, 25, 30, 10]
                };
            }
            
            // 处理生产监控数据
            if (results[2].status === 'fulfilled' && results[2].value.success) {
                charts.production = results[2].value.data;
            } else {
                charts.production = {
                    current_output: 0,
                    target_output: 100,
                    completion_rate: 0,
                    equipment_status: 'normal'
                };
            }
            
            dashboardData.charts = charts;
            updateCharts();
        })
        .catch(error => {
            console.error('加载图表数据错误:', error);
            // 使用模拟数据作为后备
            dashboardData.charts = {};
            updateCharts();
        });
}

function loadTablesData() {
    // 并行加载表格数据
    const promises = [
        app.apiRequest('/api/sales/recent?limit=5', { method: 'GET' }),
        app.apiRequest('/api/inventory/alerts', { method: 'GET' }),
        app.apiRequest('/api/production/tasks/active', { method: 'GET' }),
        app.apiRequest('/api/logistics/tasks/recent?limit=5', { method: 'GET' })
    ];
    
    return Promise.allSettled(promises)
        .then(results => {
            const tables = {};
            
            // 处理最新订单数据
            if (results[0].status === 'fulfilled' && results[0].value.success) {
                tables.recent_orders = results[0].value.data.map(sale => ({
                    order_id: sale.order_number || `ORD${sale.id}`,
                    customer: sale.customer || '未知客户',
                    product: sale.product?.name || '未知产品',
                    quantity: sale.quantity,
                    amount: sale.total_amount || (sale.quantity * sale.unit_price),
                    status: 'completed',
                    time: new Date(sale.sale_date).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                }));
            } else {
                tables.recent_orders = [];
            }
            
            // 处理库存预警数据
            if (results[1].status === 'fulfilled' && results[1].value.success) {
                tables.inventory_alerts = results[1].value.data.map(alert => ({
                    product: alert.product.name,
                    current_stock: alert.inventory.current_stock,
                    safety_stock: alert.inventory.safety_stock,
                    alert_type: alert.alert_type,
                    action: alert.alert_type === 'low_stock' ? '立即补货' : '检查库存'
                }));
            } else {
                tables.inventory_alerts = [];
            }
            
            // 处理生产任务数据
            if (results[2].status === 'fulfilled' && results[2].value.success) {
                tables.production_tasks = results[2].value.data.map(task => ({
                    task_id: `PROD${task.id}`,
                    product: task.product?.name || '未知产品',
                    planned_quantity: task.planned_quantity,
                    completed_quantity: task.actual_quantity,
                    progress: Math.round((task.actual_quantity / task.planned_quantity) * 100),
                    estimated_completion: task.end_date ? 
                        new Date(task.end_date).toLocaleString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '未设定'
                }));
            } else {
                tables.production_tasks = [];
            }
            
            // 处理物流任务数据
            if (results[3].status === 'fulfilled' && results[3].value.success) {
                tables.logistics_tasks = results[3].value.data.map(task => ({
                    task_id: `LOG${task.id}`,
                    type: getTaskTypeText(task.task_type),
                    from: task.from_location || '-',
                    to: task.to_location,
                    status: task.status,
                    robot: task.robot_id || '-'
                }));
            } else {
                tables.logistics_tasks = [];
            }
            
            dashboardData.tables = tables;
            updateTables();
        })
        .catch(error => {
            console.error('加载表格数据错误:', error);
            // 使用模拟数据作为后备
            dashboardData.tables = {};
            updateTables();
        });
}

// 辅助函数：将任务类型转换为中文
function getTaskTypeText(taskType) {
    const typeMap = {
        'inbound': '入库',
        'outbound': '出库',
        'transfer': '转移',
        'inventory': '盘点'
    };
    return typeMap[taskType] || taskType;
}


function updateMetricsCards() {
    const metrics = dashboardData.metrics;
    if (!metrics) return;
    
    // 更新今日销售
    const todaySales = document.getElementById('today-sales');
    const salesChange = document.getElementById('sales-change');
    if (todaySales && salesChange) {
        todaySales.textContent = `¥${metrics.today_sales || 0}`;
        const change = metrics.sales_change || 0;
        salesChange.innerHTML = `
            <i class="fas fa-arrow-${change >= 0 ? 'up' : 'down'}"></i> 
            ${change >= 0 ? '+' : ''}${change}%
        `;
        salesChange.className = `metric-change ${change >= 0 ? 'positive' : 'negative'}`;
    }
    
    // 更新库存状态
    const inventoryStatus = document.getElementById('inventory-status');
    const inventoryAlerts = document.getElementById('inventory-alerts');
    const alertCount = document.getElementById('alert-count');
    if (inventoryStatus && inventoryAlerts && alertCount) {
        const alerts = metrics.inventory_alerts || 0;
        inventoryStatus.textContent = alerts > 0 ? '有预警' : '正常';
        alertCount.textContent = alerts;
        inventoryAlerts.className = `metric-change ${alerts > 0 ? 'negative' : 'positive'}`;
    }
    
    // 更新生产效率
    const productionEfficiency = document.getElementById('production-efficiency');
    const efficiencyTrend = document.getElementById('efficiency-trend');
    if (productionEfficiency && efficiencyTrend) {
        const efficiency = metrics.production_efficiency || 0;
        productionEfficiency.textContent = `${efficiency}%`;
        const trend = efficiency > 80 ? '优秀' : efficiency > 60 ? '良好' : '需改进';
        const trendClass = efficiency > 80 ? 'positive' : efficiency > 60 ? 'neutral' : 'negative';
        efficiencyTrend.innerHTML = `
            <i class="fas fa-arrow-${efficiency > 70 ? 'up' : 'down'}"></i> ${trend}
        `;
        efficiencyTrend.className = `metric-change ${trendClass}`;
    }
    
    // 更新物流状态
    const logisticsStatus = document.getElementById('logistics-status');
    const robotStatus = document.getElementById('robot-status');
    const activeRobots = document.getElementById('active-robots');
    if (logisticsStatus && robotStatus && activeRobots) {
        const robots = metrics.active_robots || 0;
        logisticsStatus.textContent = robots > 0 ? '运行中' : '空闲';
        activeRobots.textContent = robots;
        robotStatus.className = `metric-change ${robots > 0 ? 'positive' : 'neutral'}`;
    }
}

function updateCharts() {
    updateSalesTrendChart();
    updateInventoryChart();
    updateProductionMonitor();
    updateLogisticsMap();
}

function updateSalesTrendChart() {
    const canvas = document.getElementById('sales-trend-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 销毁现有图表
    if (dashboardCharts.salesTrend) {
        dashboardCharts.salesTrend.destroy();
    }
    
    const chartData = dashboardData.charts?.sales_trend || {
        labels: ['1日', '2日', '3日', '4日', '5日', '6日', '7日'],
        data: [12000, 15000, 13000, 18000, 16000, 20000, 22000]
    };
    
    dashboardCharts.salesTrend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: '销售额',
                data: chartData.data,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointBorderColor: 'white',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '¥' + value.toLocaleString();
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function updateInventoryChart() {
    const canvas = document.getElementById('inventory-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 销毁现有图表
    if (dashboardCharts.inventory) {
        dashboardCharts.inventory.destroy();
    }
    
    const chartData = dashboardData.charts?.inventory || {
        labels: ['原材料', '半成品', '成品', '包装材料'],
        data: [35, 25, 30, 10]
    };
    
    dashboardCharts.inventory = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.data,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(5, 150, 105, 0.8)',
                    'rgba(217, 119, 6, 0.8)',
                    'rgba(220, 38, 38, 0.8)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function updateProductionMonitor() {
    const production = dashboardData.charts?.production || {
        current_output: 85,
        target_output: 100,
        completion_rate: 78,
        equipment_status: 'normal'
    };
    
    // 更新生产指标
    const currentOutput = document.getElementById('current-output');
    const targetOutput = document.getElementById('target-output');
    const completionRate = document.getElementById('completion-rate');
    const equipmentStatus = document.getElementById('equipment-status');
    const productionProgress = document.getElementById('production-progress');
    const productionIndicator = document.getElementById('production-indicator');
    
    if (currentOutput) currentOutput.textContent = production.current_output;
    if (targetOutput) targetOutput.textContent = production.target_output;
    if (completionRate) completionRate.textContent = `${production.completion_rate}%`;
    if (equipmentStatus) {
        const statusText = {
            'normal': '正常',
            'warning': '警告',
            'error': '故障'
        };
        equipmentStatus.textContent = statusText[production.equipment_status] || '未知';
    }
    
    if (productionProgress) {
        productionProgress.style.width = `${production.completion_rate}%`;
    }
    
    if (productionIndicator) {
        const statusClass = {
            'normal': 'running',
            'warning': 'warning',
            'error': 'stopped'
        };
        productionIndicator.className = `status-indicator ${statusClass[production.equipment_status] || 'running'}`;
        productionIndicator.innerHTML = `
            <i class="fas fa-circle"></i> 
            ${production.equipment_status === 'normal' ? '运行中' : 
              production.equipment_status === 'warning' ? '警告' : '已停止'}
        `;
    }
}

function updateLogisticsMap() {
    const mapContainer = document.getElementById('warehouse-map');
    if (!mapContainer) return;
    
    const logistics = dashboardData.charts?.logistics || {
        robots: [
            { id: 'R001', x: 20, y: 30, status: 'moving' },
            { id: 'R002', x: 60, y: 70, status: 'idle' },
            { id: 'R003', x: 80, y: 40, status: 'charging' }
        ],
        zones: [
            { name: '入库区', x: 10, y: 10, width: 30, height: 20 },
            { name: '存储区', x: 45, y: 15, width: 40, height: 50 },
            { name: '出库区', x: 10, y: 70, width: 30, height: 20 }
        ]
    };
    
    // 清空地图
    mapContainer.innerHTML = '';
    
    // 创建SVG地图
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 100 100');
    
    // 绘制区域
    logistics.zones.forEach(zone => {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', zone.x);
        rect.setAttribute('y', zone.y);
        rect.setAttribute('width', zone.width);
        rect.setAttribute('height', zone.height);
        rect.setAttribute('fill', 'rgba(59, 130, 246, 0.2)');
        rect.setAttribute('stroke', 'rgba(59, 130, 246, 0.5)');
        rect.setAttribute('stroke-width', '0.5');
        svg.appendChild(rect);
        
        // 添加区域标签
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', zone.x + zone.width / 2);
        text.setAttribute('y', zone.y + zone.height / 2);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '3');
        text.setAttribute('fill', 'rgba(59, 130, 246, 0.8)');
        text.textContent = zone.name;
        svg.appendChild(text);
    });
    
    // 绘制机器人
    logistics.robots.forEach(robot => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', robot.x);
        circle.setAttribute('cy', robot.y);
        circle.setAttribute('r', '2');
        
        const colors = {
            'moving': '#059669',
            'idle': '#d97706',
            'charging': '#dc2626'
        };
        
        circle.setAttribute('fill', colors[robot.status] || '#6b7280');
        circle.setAttribute('stroke', 'white');
        circle.setAttribute('stroke-width', '0.5');
        svg.appendChild(circle);
        
        // 添加机器人标签
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', robot.x);
        text.setAttribute('y', robot.y - 3);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '2');
        text.setAttribute('fill', colors[robot.status] || '#6b7280');
        text.textContent = robot.id;
        svg.appendChild(text);
    });
    
    mapContainer.appendChild(svg);
}

function updateTables() {
    updateRecentOrders();
    updateInventoryAlerts();
    updateProductionTasks();
    updateLogisticsTasks();
}

function updateRecentOrders() {
    const tbody = document.getElementById('recent-orders-body');
    if (!tbody) return;
    
    const orders = dashboardData.tables?.recent_orders || [];
    
    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    <i class="fas fa-inbox"></i> 暂无最新订单数据
                </td>
            </tr>
        `;
        return;
    }
    
    const statusClass = {
        'pending': 'warning',
        'processing': 'info',
        'completed': 'success',
        'cancelled': 'danger'
    };
    
    const statusText = {
        'pending': '待处理',
        'processing': '处理中',
        'completed': '已完成',
        'cancelled': '已取消'
    };
    
    tbody.innerHTML = orders.map(order => {
        return `
            <tr>
                <td>${order.order_id}</td>
                <td>${order.customer}</td>
                <td>${order.product}</td>
                <td>${order.quantity}</td>
                <td>¥${(order.amount || 0).toLocaleString()}</td>
                <td>
                    <span class="status-badge ${statusClass[order.status] || 'secondary'}">
                        ${statusText[order.status] || order.status}
                    </span>
                </td>
                <td>${order.time}</td>
            </tr>
        `;
    }).join('');
}

function updateInventoryAlerts() {
    const tbody = document.getElementById('inventory-alerts-body');
    if (!tbody) return;
    
    const alerts = dashboardData.tables?.inventory_alerts || [];
    
    if (alerts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-success">
                    <i class="fas fa-check-circle"></i> 库存状态正常，无预警信息
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = alerts.map(alert => {
        const alertClass = {
            'low_stock': 'warning',
            'out_of_stock': 'danger',
            'overstock': 'info'
        };
        
        const alertText = {
            'low_stock': '库存不足',
            'out_of_stock': '缺货',
            'overstock': '库存过剩'
        };
        
        return `
            <tr>
                <td>${alert.product}</td>
                <td>${alert.current_stock}</td>
                <td>${alert.safety_stock}</td>
                <td>
                    <span class="status-badge ${alertClass[alert.alert_type] || 'secondary'}">
                        ${alertText[alert.alert_type] || alert.alert_type}
                    </span>
                </td>
                <td>${alert.action}</td>
            </tr>
        `;
    }).join('');
}

function updateProductionTasks() {
    const tbody = document.getElementById('production-tasks-body');
    if (!tbody) return;
    
    const tasks = dashboardData.tables?.production_tasks || [
        {
            task_id: 'PROD001',
            product: '产品A',
            planned_quantity: 100,
            completed_quantity: 75,
            progress: 75,
            estimated_completion: '14:30'
        },
        {
            task_id: 'PROD002',
            product: '产品B',
            planned_quantity: 50,
            completed_quantity: 50,
            progress: 100,
            estimated_completion: '已完成'
        },
        {
            task_id: 'PROD003',
            product: '产品C',
            planned_quantity: 200,
            completed_quantity: 45,
            progress: 23,
            estimated_completion: '18:00'
        }
    ];
    
    tbody.innerHTML = tasks.map(task => `
        <tr>
            <td>${task.task_id}</td>
            <td>${task.product}</td>
            <td>${task.planned_quantity}</td>
            <td>${task.completed_quantity}</td>
            <td>
                <div class="progress-mini">
                    <div class="progress-mini-fill" style="width: ${task.progress}%"></div>
                </div>
                ${task.progress}%
            </td>
            <td>${task.estimated_completion}</td>
        </tr>
    `).join('');
}

function updateLogisticsTasks() {
    const tbody = document.getElementById('logistics-tasks-body');
    if (!tbody) return;
    
    const tasks = dashboardData.tables?.logistics_tasks || [
        {
            task_id: 'LOG001',
            type: '取货',
            from: 'A1',
            to: 'B2',
            status: 'executing',
            robot: 'R001'
        },
        {
            task_id: 'LOG002',
            type: '送货',
            from: 'B2',
            to: 'C3',
            status: 'pending',
            robot: '-'
        },
        {
            task_id: 'LOG003',
            type: '盘点',
            from: 'D1',
            to: 'D5',
            status: 'completed',
            robot: 'R002'
        }
    ];
    
    tbody.innerHTML = tasks.map(task => {
        const statusClass = {
            'pending': 'warning',
            'executing': 'info',
            'completed': 'success',
            'failed': 'danger'
        };
        
        const statusText = {
            'pending': '等待中',
            'executing': '执行中',
            'completed': '已完成',
            'failed': '失败'
        };
        
        return `
            <tr>
                <td>${task.task_id}</td>
                <td>${task.type}</td>
                <td>${task.from}</td>
                <td>${task.to}</td>
                <td>
                    <span class="status-badge ${statusClass[task.status]}">
                        ${statusText[task.status]}
                    </span>
                </td>
                <td>${task.robot}</td>
            </tr>
        `;
    }).join('');
}

// 生成模拟数据的函数
// 模拟数据生成函数已移除

// 控制函数
function refreshDashboard() {
    app.showLoading();
    loadDashboardData();
    app.showNotification('看板数据已刷新', 'success');
}

function toggleAutoRefresh() {
    const button = document.getElementById('auto-refresh-text');
    if (refreshInterval) {
        stopAutoRefresh();
        button.textContent = '开启自动刷新';
        app.showNotification('自动刷新已关闭', 'info');
    } else {
        startAutoRefresh();
        button.textContent = '关闭自动刷新';
        app.showNotification('自动刷新已开启', 'success');
    }
}

function startAutoRefresh() {
    refreshInterval = setInterval(() => {
        loadDashboardData();
    }, 30000); // 30秒刷新一次
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

function exportDashboard() {
    app.showLoading();
    
    // 准备导出数据
    const exportData = {
        metrics: dashboardData.metrics || {},
        charts: dashboardData.charts || {},
        tables: dashboardData.tables || {},
        export_time: new Date().toISOString(),
        export_user: 'system'
    };
    
    // 创建Excel格式的数据
    const csvContent = convertDashboardToCSV(exportData);
    
    // 下载文件
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `数据看板_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    app.hideLoading();
    app.showNotification('看板数据导出完成', 'success');
    app.playVoice('看板数据已导出');
}

function convertDashboardToCSV(data) {
    const headers = ['数据类型', '项目', '值', '单位', '时间'];
    const rows = [headers.join(',')];
    const timestamp = new Date().toLocaleString('zh-CN');
    
    // 指标数据
    if (data.metrics) {
        rows.push(`指标,今日销售,${data.metrics.today_sales || 0},元,${timestamp}`);
        rows.push(`指标,销售变化,${data.metrics.sales_change || 0},%,${timestamp}`);
        rows.push(`指标,库存预警,${data.metrics.inventory_alerts || 0},个,${timestamp}`);
        rows.push(`指标,生产效率,${data.metrics.production_efficiency || 0},%,${timestamp}`);
        rows.push(`指标,活跃机器人,${data.metrics.active_robots || 0},台,${timestamp}`);
    }
    
    // 订单数据
    if (data.tables?.recent_orders) {
        data.tables.recent_orders.forEach(order => {
            rows.push(`订单,${order.order_id},${order.amount},元,${timestamp}`);
        });
    }
    
    // 库存预警数据
    if (data.tables?.inventory_alerts) {
        data.tables.inventory_alerts.forEach(alert => {
            rows.push(`库存预警,${alert.product},${alert.current_stock},件,${timestamp}`);
        });
    }
    
    return rows.join('\n');
}

function toggleFullscreen() {
    const dashboardContent = document.querySelector('.dashboard-content');
    const button = event.target.closest('button');
    
    if (dashboardContent.classList.contains('dashboard-fullscreen')) {
        // 退出全屏
        dashboardContent.classList.remove('dashboard-fullscreen');
        button.innerHTML = '<i class="fas fa-expand"></i> 全屏显示';
        app.showNotification('已退出全屏模式', 'info');
    } else {
        // 进入全屏
        dashboardContent.classList.add('dashboard-fullscreen');
        button.innerHTML = '<i class="fas fa-compress"></i> 退出全屏';
        app.showNotification('已进入全屏模式', 'success');
    }
}

function updateSalesTrend() {
    const period = document.getElementById('sales-period').value;
    
    // 根据选择的时间段更新数据
    let chartData;
    switch(period) {
        case '7d':
            chartData = {
                labels: ['1日', '2日', '3日', '4日', '5日', '6日', '7日'],
                data: Array.from({length: 7}, () => Math.floor(Math.random() * 20000) + 10000)
            };
            break;
        case '30d':
            chartData = {
                labels: Array.from({length: 30}, (_, i) => `${i+1}日`),
                data: Array.from({length: 30}, () => Math.floor(Math.random() * 25000) + 15000)
            };
            break;
        case '90d':
            chartData = {
                labels: Array.from({length: 90}, (_, i) => `${i+1}日`),
                data: Array.from({length: 90}, () => Math.floor(Math.random() * 30000) + 20000)
            };
            break;
    }
    
    // 更新图表数据
    if (dashboardCharts.salesTrend) {
        dashboardCharts.salesTrend.data.labels = chartData.labels;
        dashboardCharts.salesTrend.data.datasets[0].data = chartData.data;
        dashboardCharts.salesTrend.update();
    }
    
    app.playVoice(`已切换到${period === '7d' ? '近7天' : period === '30d' ? '近30天' : '近90天'}数据`);
}

function updateInventoryView(viewType) {
    let chartData;
    
    if (viewType === 'category') {
        chartData = {
            labels: ['原材料', '半成品', '成品', '包装材料'],
            data: [35, 25, 30, 10]
        };
    } else {
        chartData = {
            labels: ['正常', '不足', '过剩', '缺货'],
            data: [60, 20, 15, 5]
        };
    }
    
    // 更新图表数据
    if (dashboardCharts.inventory) {
        dashboardCharts.inventory.data.labels = chartData.labels;
        dashboardCharts.inventory.data.datasets[0].data = chartData.data;
        dashboardCharts.inventory.update();
    }
    
    app.playVoice(`已切换到${viewType === 'category' ? '按类别' : '按状态'}视图`);
}

function centerMap() {
    // 重新渲染地图到中心位置
    updateLogisticsMap();
    app.playVoice('地图已居中');
}

function toggleRobotPaths() {
    // 切换机器人路径显示
    app.showNotification('路径显示功能开发中', 'info');
    app.playVoice('路径显示功能开发中');
}

// 导出模块函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadDashboardModule,
        refreshDashboard,
        toggleAutoRefresh,
        exportDashboard,
        toggleFullscreen,
        updateSalesTrend,
        updateInventoryView
    };
}