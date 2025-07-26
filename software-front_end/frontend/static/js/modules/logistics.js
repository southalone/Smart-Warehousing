// 物流调度模块

let logisticsData = [];
let robotStatus = {};
let logisticsTasks = [];
let currentLogisticsPage = 1;
const logisticsItemsPerPage = 6;
let warehouseMap = null;
let mapScale = 1.0;
let showRobotPaths = false;

// 加载物流调度模块
function loadLogisticsModule() {
    console.log('加载物流调度模块');
    
    const moduleContent = document.getElementById('logistics-module');
    if (!moduleContent) return;
    
    // 渲染模块界面
    moduleContent.innerHTML = `
        <div class="module-header">
            <h3><i class="fas fa-truck"></i> 物流调度</h3>
            <div class="module-actions">
                <button class="btn btn-primary" onclick="showCreateTaskModal()">
                    <i class="fas fa-plus"></i> 新建任务
                </button>
                <button class="btn btn-secondary" onclick="refreshLogistics()">
                    <i class="fas fa-sync-alt"></i> 刷新
                </button>

            </div>
        </div>
        
        <div class="logistics-overview">
            <div class="overview-card robot-status">
                <div class="card-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="card-content">
                    <h4>机器人状态</h4>
                    <div class="robot-info">
                        <div class="status-indicator" id="robot-status-indicator"></div>
                        <span id="robot-status-text">离线</span>
                    </div>
                    <div class="robot-details">
                        <small>电量: <span id="robot-battery">--</span>%</small>
                        <small>位置: <span id="robot-position">--</span></small>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="logistics-main">
            <div class="warehouse-map-section">
                <h4><i class="fas fa-map"></i> 仓库地图</h4>
                <div class="map-container">
                    <canvas id="warehouse-map" width="600" height="400"></canvas>
                    <div class="map-controls">
                        <button class="btn btn-sm btn-secondary" onclick="zoomIn()">
                            <i class="fas fa-search-plus"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="zoomOut()">
                            <i class="fas fa-search-minus"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="resetView()">
                            <i class="fas fa-home"></i>
                        </button>
                    </div>
                </div>
                
                <div class="map-legend">
                    <div class="legend-item">
                        <div class="legend-color" style="background: #3b82f6;"></div>
                        <span>机器人</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #10b981;"></div>
                        <span>货架</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #f59e0b;"></div>
                        <span>工作站</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: #ef4444;"></div>
                        <span>障碍物</span>
                    </div>
                </div>
            </div>
            
            <div class="robot-control-section">
                <h4><i class="fas fa-gamepad"></i> 机器人控制</h4>
                <div class="control-panel">
                    <div class="direction-controls">
                        <button class="control-btn" onclick="moveRobot('forward')">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <div class="horizontal-controls">
                            <button class="control-btn" onclick="moveRobot('left')">
                                <i class="fas fa-arrow-left"></i>
                            </button>
                            <button class="control-btn stop-btn" onclick="stopRobot()">
                                <i class="fas fa-stop"></i>
                            </button>
                            <button class="control-btn" onclick="moveRobot('right')">
                                <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                        <button class="control-btn" onclick="moveRobot('backward')">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                    </div>
                    
                    <div class="action-controls">
                        <button class="btn btn-success" onclick="pickupItem()">
                            <i class="fas fa-hand-paper"></i> 抓取
                        </button>
                        <button class="btn btn-warning" onclick="releaseItem()">
                            <i class="fas fa-hand-rock"></i> 释放
                        </button>
                        <button class="btn btn-info" onclick="returnHome()">
                            <i class="fas fa-home"></i> 回到原点
                        </button>
                    </div>
                    
                    <div class="speed-control">
                        <label>速度控制</label>
                        <input type="range" id="speed-slider" min="1" max="10" value="5" onchange="setRobotSpeed(this.value)">
                        <span id="speed-value">5</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="tasks-section">
            <h4><i class="fas fa-list"></i> 物流任务</h4>
            
            <div class="task-filters">
                <div class="filter-group">
                    <label>状态筛选</label>
                    <select id="task-status-filter" class="form-select">
                        <option value="">所有状态</option>
                        <option value="pending">待执行</option>
                        <option value="in_progress">执行中</option>
                        <option value="completed">已完成</option>
                        <option value="failed">失败</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label>任务类型</label>
                    <select id="task-type-filter" class="form-select">
                        <option value="">所有类型</option>
                        <option value="pickup">取货</option>
                        <option value="delivery">送货</option>
                        <option value="inventory">盘点</option>
                        <option value="maintenance">维护</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label>优先级</label>
                    <select id="task-priority-filter" class="form-select">
                        <option value="">所有优先级</option>
                        <option value="high">高</option>
                        <option value="medium">中</option>
                        <option value="low">低</option>
                    </select>
                </div>
            </div>
            
            <div class="tasks-grid" id="tasks-grid">
                <!-- 任务卡片将通过JavaScript生成 -->
            </div>
            
            <div class="pagination" id="logistics-pagination">
                <!-- 分页控件将通过JavaScript生成 -->
            </div>
        </div>
        

    `;
    
    // 添加样式
    addLogisticsStyles();
    
    // 加载物流数据
    loadLogisticsData();
    
    // 设置事件监听器
    setupLogisticsEventListeners();
    
    // 初始化仓库地图
    initWarehouseMap();
    
    // 开始实时更新
    startRealTimeUpdates();
}

function addLogisticsStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .logistics-overview {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }
        
        .robot-status .robot-info {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #ef4444;
        }
        
        .status-indicator.online {
            background: #10b981;
        }
        
        .status-indicator.busy {
            background: #f59e0b;
        }
        
        .robot-details {
            display: flex;
            gap: 15px;
            font-size: 0.8rem;
            color: var(--secondary-color);
        }
        
        .logistics-main {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 25px;
            margin-bottom: 25px;
        }
        
        .warehouse-map-section,
        .robot-control-section {
            background: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
        }
        
        .warehouse-map-section h4,
        .robot-control-section h4 {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--dark-color);
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .map-container {
            position: relative;
            border: 2px solid var(--border-color);
            border-radius: var(--border-radius);
            overflow: hidden;
            margin-bottom: 15px;
        }
        
        #warehouse-map {
            display: block;
            width: 100%;
            height: auto;
        }
        
        .map-controls {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .map-legend {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
        }
        
        .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 2px;
        }
        
        .control-panel {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .direction-controls {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        
        .horizontal-controls {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        
        .control-btn {
            width: 50px;
            height: 50px;
            border: 2px solid var(--primary-color);
            background: white;
            border-radius: var(--border-radius);
            color: var(--primary-color);
            font-size: 1.2rem;
            cursor: pointer;
            transition: var(--transition);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .control-btn:hover {
            background: var(--primary-color);
            color: white;
        }
        
        .control-btn.stop-btn {
            border-color: var(--danger-color);
            color: var(--danger-color);
        }
        
        .control-btn.stop-btn:hover {
            background: var(--danger-color);
            color: white;
        }
        
        .action-controls {
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        
        .speed-control {
            text-align: center;
        }
        
        .speed-control label {
            display: block;
            margin-bottom: 10px;
            font-weight: 500;
        }
        
        .speed-control input[type="range"] {
            width: 100%;
            margin-bottom: 5px;
        }
        
        .tasks-section {
            background: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
            margin-bottom: 25px;
        }
        
        .tasks-section h4 {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--dark-color);
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .task-filters {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
            padding: 20px;
            background: var(--light-color);
            border-radius: var(--border-radius);
        }
        
        .filter-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: var(--dark-color);
        }
        
        .tasks-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .task-card {
            background: var(--light-color);
            border-radius: var(--border-radius);
            padding: 20px;
            border: 1px solid var(--border-color);
            transition: var(--transition);
            position: relative;
        }
        
        .task-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow);
        }
        
        .task-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        
        .task-title {
            font-weight: 600;
            color: var(--dark-color);
            font-size: 1.1rem;
        }
        
        .task-priority {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 500;
        }
        
        .task-details {
            margin-bottom: 15px;
        }
        
        .task-detail {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 0.9rem;
        }
        
        .task-detail .label {
            color: var(--secondary-color);
        }
        
        .task-detail .value {
            color: var(--dark-color);
            font-weight: 500;
        }
        
        .task-progress {
            margin-bottom: 15px;
        }
        
        .progress-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 0.9rem;
        }
        
        .task-actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }
        

        
        @media (max-width: 768px) {
            .logistics-main {
                grid-template-columns: 1fr;
            }
            
            .tasks-grid {
                grid-template-columns: 1fr;
            }
            
            .map-legend {
                justify-content: center;
            }
        }
    `;
    document.head.appendChild(style);
}

function setupLogisticsEventListeners() {
    // 筛选器变化事件
    const statusFilter = document.getElementById('task-status-filter');
    const typeFilter = document.getElementById('task-type-filter');
    const priorityFilter = document.getElementById('task-priority-filter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterLogisticsTasks);
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', filterLogisticsTasks);
    }
    
    if (priorityFilter) {
        priorityFilter.addEventListener('change', filterLogisticsTasks);
    }
    
    // 键盘控制
    document.addEventListener('keydown', handleKeyboardControl);
}

function loadLogisticsData() {
    app.showLoading();
    
    // 加载机器人状态
    app.apiRequest('/api/logistics/robots/status', { method: 'GET' })
        .then(data => {
            if (data.success && data.data.length > 0) {
                // 使用第一个机器人的状态
                robotStatus = data.data[0];
                updateRobotStatus();
            }
        })
        .catch(error => {
            console.error('加载机器人状态错误:', error);
        });
    
    // 加载物流任务
    app.apiRequest('/api/logistics/tasks', { method: 'GET' })
        .then(data => {
            if (data.success) {
                logisticsTasks = data.data;
                updateLogisticsOverview();
                renderLogisticsTasks();
                app.playVoice('物流数据已更新');
            } else {
                app.showNotification('加载物流数据失败', 'error');
            }
        })
        .catch(error => {
            console.error('加载物流数据错误:', error);
            app.showNotification('网络连接错误', 'error');
        })
        .finally(() => {
            app.hideLoading();
        });
}

function updateRobotStatus() {
    const statusIndicator = document.getElementById('robot-status-indicator');
    const statusText = document.getElementById('robot-status-text');
    const batteryLevel = document.getElementById('robot-battery');
    const position = document.getElementById('robot-position');
    
    if (statusIndicator && statusText) {
        statusIndicator.className = 'status-indicator';
        
        if (robotStatus.online) {
            if (robotStatus.busy) {
                statusIndicator.classList.add('busy');
                statusText.textContent = '工作中';
            } else {
                statusIndicator.classList.add('online');
                statusText.textContent = '在线';
            }
        } else {
            statusText.textContent = '离线';
        }
    }
    
    if (batteryLevel) {
        batteryLevel.textContent = robotStatus.battery || '--';
    }
    
    if (position) {
        position.textContent = robotStatus.position || '--';
    }
}

function updateLogisticsOverview() {
    // 机器人状态已在updateRobotStatus函数中处理
    // 不再需要更新统计数据
}

function initWarehouseMap() {
    const canvas = document.getElementById('warehouse-map');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 绘制仓库布局
    drawWarehouseLayout(ctx);
    
    // 绘制机器人位置
    if (robotStatus.position) {
        drawRobotPosition(ctx, robotStatus.position);
    }
}

function drawWarehouseLayout(ctx) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 绘制背景
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制网格
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // 绘制货架
    ctx.fillStyle = '#10b981';
    const shelves = [
        {x: 60, y: 60, width: 120, height: 30},
        {x: 240, y: 60, width: 120, height: 30},
        {x: 420, y: 60, width: 120, height: 30},
        {x: 60, y: 150, width: 120, height: 30},
        {x: 240, y: 150, width: 120, height: 30},
        {x: 420, y: 150, width: 120, height: 30},
        {x: 60, y: 240, width: 120, height: 30},
        {x: 240, y: 240, width: 120, height: 30},
        {x: 420, y: 240, width: 120, height: 30}
    ];
    
    shelves.forEach(shelf => {
        ctx.fillRect(shelf.x, shelf.y, shelf.width, shelf.height);
    });
    
    // 绘制工作站
    ctx.fillStyle = '#f59e0b';
    const workstations = [
        {x: 30, y: 330, width: 60, height: 40},
        {x: 510, y: 330, width: 60, height: 40}
    ];
    
    workstations.forEach(station => {
        ctx.fillRect(station.x, station.y, station.width, station.height);
    });
    
    // 绘制充电站
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(270, 330, 60, 40);
    
    // 添加标签
    ctx.fillStyle = '#374151';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // 货架标签
    shelves.forEach((shelf, index) => {
        ctx.fillText(`货架${index + 1}`, shelf.x + shelf.width/2, shelf.y + shelf.height/2 + 4);
    });
    
    // 工作站标签
    ctx.fillText('工作站A', 60, 355);
    ctx.fillText('工作站B', 540, 355);
    ctx.fillText('充电站', 300, 355);
}

function drawRobotPosition(ctx, position) {
    // 解析位置坐标
    const coords = position.split(',').map(Number);
    if (coords.length !== 2) return;
    
    const [x, y] = coords;
    
    // 绘制机器人
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, 2 * Math.PI);
    ctx.fill();
    
    // 绘制方向指示
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y - 5, 3, 0, 2 * Math.PI);
    ctx.fill();
}

function renderLogisticsTasks() {
    const tasksGrid = document.getElementById('tasks-grid');
    if (!tasksGrid) return;
    
    const startIndex = (currentLogisticsPage - 1) * logisticsItemsPerPage;
    const endIndex = startIndex + logisticsItemsPerPage;
    const pageData = logisticsTasks.slice(startIndex, endIndex);
    
    tasksGrid.innerHTML = pageData.map(task => {
        const progress = calculateTaskProgress(task);
        const priorityClass = getPriorityClass(task.priority);
        
        return `
            <div class="task-card">
                <div class="task-header">
                    <div class="task-title">${task.task_name}</div>
                    <span class="task-priority ${priorityClass}">${getPriorityText(task.priority)}</span>
                </div>
                
                <div class="task-details">
                    <div class="task-detail">
                        <span class="label">任务ID:</span>
                        <span class="value">${task.task_id}</span>
                    </div>
                    <div class="task-detail">
                        <span class="label">类型:</span>
                        <span class="value">${getTaskTypeText(task.task_type)}</span>
                    </div>
                    <div class="task-detail">
                        <span class="label">起点:</span>
                        <span class="value">${task.from_location}</span>
                    </div>
                    <div class="task-detail">
                        <span class="label">终点:</span>
                        <span class="value">${task.to_location}</span>
                    </div>
                    <div class="task-detail">
                        <span class="label">状态:</span>
                        <span class="value">
                            <span class="status-badge status-${task.status}">${getTaskStatusText(task.status)}</span>
                        </span>
                    </div>
                    <div class="task-detail">
                        <span class="label">创建时间:</span>
                        <span class="value">${app.formatDate(task.created_at)}</span>
                    </div>
                </div>
                
                <div class="task-progress">
                    <div class="progress-label">
                        <span>进度</span>
                        <span>${progress}%</span>
                    </div>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <div class="task-actions">
                    <button class="btn btn-sm btn-primary" onclick="viewTaskDetails(${task.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="executeTask(${task.id})" ${task.status === 'in_progress' ? 'disabled' : ''}>
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="pauseTask(${task.id})" ${task.status !== 'in_progress' ? 'disabled' : ''}>
                        <i class="fas fa-pause"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="cancelTask(${task.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    renderLogisticsPagination();
}

function renderLogisticsPagination() {
    const pagination = document.getElementById('logistics-pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(logisticsTasks.length / logisticsItemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = `
        <button onclick="changeLogisticsPage(${currentLogisticsPage - 1})" ${currentLogisticsPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentLogisticsPage) {
            paginationHTML += `<button class="active">${i}</button>`;
        } else {
            paginationHTML += `<button onclick="changeLogisticsPage(${i})">${i}</button>`;
        }
    }
    
    paginationHTML += `
        <button onclick="changeLogisticsPage(${currentLogisticsPage + 1})" ${currentLogisticsPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}



function startRealTimeUpdates() {
    // 每5秒更新一次机器人状态
    setInterval(() => {
        if (document.getElementById('logistics-module')) {
            updateRobotStatusRealTime();
        }
    }, 5000);
    
    // 每30秒更新一次任务状态
    setInterval(() => {
        if (document.getElementById('logistics-module')) {
            updateTasksRealTime();
        }
    }, 30000);
}

function updateRobotStatusRealTime() {
    app.apiRequest('/api/logistics/robots/status', { method: 'GET' })
        .then(data => {
            if (data.success && data.data.length > 0) {
                // 使用第一个机器人的状态
                robotStatus = data.data[0];
                updateRobotStatus();
                
                // 更新地图上的机器人位置
                if (robotStatus.position) {
                    initWarehouseMap();
                }
            }
        })
        .catch(error => {
            console.error('实时更新机器人状态错误:', error);
        });
}

function updateTasksRealTime() {
    app.apiRequest('/api/logistics/tasks', { method: 'GET' })
        .then(data => {
            if (data.success) {
                logisticsTasks = data.data;
                updateLogisticsOverview();
                renderLogisticsTasks();
            }
        })
        .catch(error => {
            console.error('实时更新任务状态错误:', error);
        });
}

// 工具函数
function getTaskTypeText(type) {
    switch(type) {
        case 'pickup': return '取货';
        case 'delivery': return '送货';
        case 'inventory': return '盘点';
        case 'maintenance': return '维护';
        default: return '未知';
    }
}

function getTaskStatusText(status) {
    switch(status) {
        case 'pending': return '待执行';
        case 'in_progress': return '执行中';
        case 'completed': return '已完成';
        case 'failed': return '失败';
        case 'cancelled': return '已取消';
        default: return '未知';
    }
}

function calculateTaskProgress(task) {
    if (task.status === 'completed') return 100;
    if (task.status === 'pending') return 0;
    if (task.status === 'failed' || task.status === 'cancelled') return 0;
    
    // 基于时间计算进度
    const now = new Date();
    const start = new Date(task.created_at);
    const estimated = new Date(start.getTime() + (task.estimated_duration || 30) * 60000);
    
    if (now < start) return 0;
    if (now > estimated) return 90; // 执行中但超时
    
    const total = estimated - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 90); // 最多90%，完成后才是100%
}

function filterLogisticsTasks() {
    const statusFilter = document.getElementById('task-status-filter').value;
    const typeFilter = document.getElementById('task-type-filter').value;
    const priorityFilter = document.getElementById('task-priority-filter').value;
    
    // 重新加载原始数据
    loadLogisticsData();
    
    setTimeout(() => {
        let filteredTasks = [...logisticsTasks];
        
        if (statusFilter) {
            filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
        }
        
        if (typeFilter) {
            filteredTasks = filteredTasks.filter(task => task.task_type === typeFilter);
        }
        
        if (priorityFilter) {
            filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
        }
        
        logisticsTasks = filteredTasks;
        currentLogisticsPage = 1;
        renderLogisticsTasks();
        updateLogisticsOverview();
    }, 100);
}

function changeLogisticsPage(page) {
    const totalPages = Math.ceil(logisticsTasks.length / logisticsItemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentLogisticsPage = page;
    renderLogisticsTasks();
}

// 机器人控制函数
function moveRobot(direction) {
    app.playVoice(`机器人${direction === 'forward' ? '前进' : direction === 'backward' ? '后退' : direction === 'left' ? '左转' : '右转'}`);
    
    app.apiRequest('/api/logistics/robot/move', {
        method: 'POST',
        body: JSON.stringify({ direction })
    })
    .then(data => {
        if (data.success) {
            app.showNotification(`机器人${direction}指令已发送`, 'success');
            setTimeout(updateRobotStatusRealTime, 1000);
        } else {
            app.showNotification('控制指令发送失败', 'error');
        }
    })
    .catch(error => {
        console.error('机器人控制错误:', error);
        app.showNotification('网络连接错误', 'error');
    });
}

function stopRobot() {
    app.playVoice('机器人停止');
    
    app.apiRequest('/api/logistics/robot/stop', {
        method: 'POST'
    })
    .then(data => {
        if (data.success) {
            app.showNotification('机器人已停止', 'success');
            updateRobotStatusRealTime();
        } else {
            app.showNotification('停止指令发送失败', 'error');
        }
    })
    .catch(error => {
        console.error('机器人停止错误:', error);
        app.showNotification('网络连接错误', 'error');
    });
}

function pickupItem() {
    app.playVoice('机器人抓取物品');
    
    app.apiRequest('/api/logistics/robot/pickup', {
        method: 'POST'
    })
    .then(data => {
        if (data.success) {
            app.showNotification('抓取指令已发送', 'success');
        } else {
            app.showNotification('抓取指令发送失败', 'error');
        }
    })
    .catch(error => {
        console.error('机器人抓取错误:', error);
        app.showNotification('网络连接错误', 'error');
    });
}

function releaseItem() {
    app.playVoice('机器人释放物品');
    
    app.apiRequest('/api/logistics/robot/release', {
        method: 'POST'
    })
    .then(data => {
        if (data.success) {
            app.showNotification('释放指令已发送', 'success');
        } else {
            app.showNotification('释放指令发送失败', 'error');
        }
    })
    .catch(error => {
        console.error('机器人释放错误:', error);
        app.showNotification('网络连接错误', 'error');
    });
}

function returnHome() {
    app.playVoice('机器人返回原点');
    
    app.apiRequest('/api/logistics/robot/home', {
        method: 'POST'
    })
    .then(data => {
        if (data.success) {
            app.showNotification('返回原点指令已发送', 'success');
        } else {
            app.showNotification('返回指令发送失败', 'error');
        }
    })
    .catch(error => {
        console.error('机器人返回错误:', error);
        app.showNotification('网络连接错误', 'error');
    });
}

function setRobotSpeed(speed) {
    document.getElementById('speed-value').textContent = speed;
    
    app.apiRequest('/api/logistics/robot/speed', {
        method: 'POST',
        body: JSON.stringify({ speed: parseInt(speed) })
    })
    .then(data => {
        if (data.success) {
            app.showNotification(`机器人速度设置为 ${speed}`, 'success');
        }
    })
    .catch(error => {
        console.error('设置速度错误:', error);
    });
}

function handleKeyboardControl(event) {
    // 只在物流模块激活时响应键盘控制
    if (!document.getElementById('logistics-module') || event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
        return;
    }
    
    switch(event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            event.preventDefault();
            moveRobot('forward');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            event.preventDefault();
            moveRobot('backward');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            event.preventDefault();
            moveRobot('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            event.preventDefault();
            moveRobot('right');
            break;
        case ' ':
            event.preventDefault();
            stopRobot();
            break;
        case 'p':
        case 'P':
            event.preventDefault();
            pickupItem();
            break;
        case 'r':
        case 'R':
            event.preventDefault();
            releaseItem();
            break;
        case 'h':
        case 'H':
            event.preventDefault();
            returnHome();
            break;
    }
}

// 地图控制函数
function zoomIn() {
    if (mapScale < 2.0) {
        mapScale += 0.2;
        updateMapScale();
        app.showNotification('地图已放大', 'success');
    } else {
        app.showNotification('已达到最大缩放级别', 'warning');
    }
}

function zoomOut() {
    if (mapScale > 0.5) {
        mapScale -= 0.2;
        updateMapScale();
        app.showNotification('地图已缩小', 'success');
    } else {
        app.showNotification('已达到最小缩放级别', 'warning');
    }
}

function updateMapScale() {
    const canvas = document.getElementById('warehouse-map');
    if (canvas) {
        canvas.style.transform = `scale(${mapScale})`;
        canvas.style.transformOrigin = 'center center';
        canvas.style.transition = 'transform 0.3s ease';
    }
}

function resetView() {
    mapScale = 1.0;
    updateMapScale();
    initWarehouseMap();
    app.showNotification('地图视图已重置', 'success');
}

// 任务操作函数
function showCreateTaskModal() {
    const modalHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>新建物流任务</h3>
                <button class="close-btn" onclick="app.closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="create-task-form">
                    <div class="form-group">
                        <label>任务名称</label>
                        <input type="text" id="task-name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>任务类型</label>
                        <select id="task-type" class="form-select" required>
                            <option value="pickup">取货</option>
                            <option value="delivery">送货</option>
                            <option value="inventory">盘点</option>
                            <option value="maintenance">维护</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>起始位置</label>
                        <input type="text" id="from-location" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>目标位置</label>
                        <input type="text" id="to-location" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>优先级</label>
                        <select id="task-priority" class="form-select">
                            <option value="low">低</option>
                            <option value="medium" selected>中</option>
                            <option value="high">高</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>预计时长(分钟)</label>
                        <input type="number" id="estimated-duration" class="form-control" value="30" min="1">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">取消</button>
                <button class="btn btn-primary" onclick="createLogisticsTask()">创建任务</button>
            </div>
        </div>
    `;
    
    app.showCustomModal(modalHTML);
}

function createLogisticsTask() {
    const taskData = {
        task_name: document.getElementById('task-name').value,
        task_type: document.getElementById('task-type').value,
        from_location: document.getElementById('from-location').value,
        to_location: document.getElementById('to-location').value,
        priority: document.getElementById('task-priority').value,
        estimated_duration: parseInt(document.getElementById('estimated-duration').value)
    };
    
    if (!taskData.task_name || !taskData.from_location || !taskData.to_location) {
        app.showNotification('请填写所有必填字段', 'error');
        return;
    }
    
    app.showLoading();
    
    app.apiRequest('/api/logistics/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
    })
    .then(data => {
        if (data.success) {
            app.showNotification('物流任务创建成功', 'success');
            app.playVoice('任务创建成功');
            app.closeModal();
            loadLogisticsData();
        } else {
            app.showNotification('任务创建失败', 'error');
        }
    })
    .catch(error => {
        console.error('创建任务错误:', error);
        app.showNotification('网络连接错误', 'error');
    })
    .finally(() => {
        app.hideLoading();
    });
}

function refreshLogistics() {
    currentLogisticsPage = 1;
    document.getElementById('task-status-filter').value = '';
    document.getElementById('task-type-filter').value = '';
    document.getElementById('task-priority-filter').value = '';
    loadLogisticsData();
    app.playVoice('物流数据已刷新');
}



function viewTaskDetails(taskId) {
    const task = logisticsTasks.find(t => t.id === taskId);
    if (!task) {
        app.showNotification('任务不存在', 'error');
        return;
    }
    
    const modalHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>任务详情 - ${task.task_name}</h3>
                <button class="close-btn" onclick="app.closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="task-detail-grid">
                    <div class="detail-item">
                        <label>任务ID:</label>
                        <span>${task.task_id}</span>
                    </div>
                    <div class="detail-item">
                        <label>任务类型:</label>
                        <span>${getTaskTypeText(task.task_type)}</span>
                    </div>
                    <div class="detail-item">
                        <label>状态:</label>
                        <span class="status-badge status-${task.status}">${getTaskStatusText(task.status)}</span>
                    </div>
                    <div class="detail-item">
                        <label>优先级:</label>
                        <span class="task-priority ${getPriorityClass(task.priority)}">${getPriorityText(task.priority)}</span>
                    </div>
                    <div class="detail-item">
                        <label>起始位置:</label>
                        <span>${task.from_location}</span>
                    </div>
                    <div class="detail-item">
                        <label>目标位置:</label>
                        <span>${task.to_location}</span>
                    </div>
                    <div class="detail-item">
                        <label>创建时间:</label>
                        <span>${app.formatDate(task.created_at)}</span>
                    </div>
                    <div class="detail-item">
                        <label>预计时长:</label>
                        <span>${task.estimated_duration || 30} 分钟</span>
                    </div>
                    <div class="detail-item">
                        <label>进度:</label>
                        <span>${calculateTaskProgress(task)}%</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="app.closeModal()">关闭</button>
                <button class="btn btn-primary" onclick="executeTask(${task.id}); app.closeModal();">执行任务</button>
            </div>
        </div>
    `;
    
    app.showCustomModal(modalHTML);
}

function executeTask(taskId) {
    app.showModal(
        '确认执行',
        '确定要执行这个物流任务吗？',
        () => {
            app.showLoading();
            app.playVoice('开始执行任务');
            
            app.apiRequest(`/api/logistics/tasks/${taskId}/execute`, {
                method: 'POST'
            })
            .then(data => {
                if (data.success) {
                    app.showNotification(`任务 ID: ${taskId} 开始执行`, 'success');
                    loadLogisticsData();
                } else {
                    app.showNotification('任务执行失败', 'error');
                }
            })
            .catch(error => {
                console.error('执行任务错误:', error);
                app.showNotification('网络连接错误', 'error');
            })
            .finally(() => {
                app.hideLoading();
            });
        }
    );
}

function pauseTask(taskId) {
    app.showModal(
        '确认暂停',
        '确定要暂停这个物流任务吗？',
        () => {
            app.showLoading();
            app.playVoice('暂停任务');
            
            app.apiRequest(`/api/logistics/tasks/${taskId}/pause`, {
                method: 'POST'
            })
            .then(data => {
                if (data.success) {
                    app.showNotification(`任务 ID: ${taskId} 已暂停`, 'warning');
                    loadLogisticsData();
                } else {
                    app.showNotification('任务暂停失败', 'error');
                }
            })
            .catch(error => {
                console.error('暂停任务错误:', error);
                app.showNotification('网络连接错误', 'error');
            })
            .finally(() => {
                app.hideLoading();
            });
        }
    );
}

function cancelTask(taskId) {
    app.showModal(
        '确认取消',
        '确定要取消这个物流任务吗？此操作不可撤销。',
        () => {
            app.showLoading();
            app.playVoice('取消任务');
            
            app.apiRequest(`/api/logistics/tasks/${taskId}/cancel`, {
                method: 'POST'
            })
            .then(data => {
                if (data.success) {
                    app.showNotification(`任务 ID: ${taskId} 已取消`, 'success');
                    loadLogisticsData();
                } else {
                    app.showNotification('任务取消失败', 'error');
                }
            })
            .catch(error => {
                console.error('取消任务错误:', error);
                app.showNotification('网络连接错误', 'error');
            })
            .finally(() => {
                app.hideLoading();
            });
        }
    );
}

// 工具函数
function getPriorityClass(priority) {
    switch(priority) {
        case 'high': return 'priority-high';
        case 'medium': return 'priority-medium';
        case 'low': return 'priority-low';
        default: return 'priority-medium';
    }
}

function getPriorityText(priority) {
    switch(priority) {
        case 'high': return '高';
        case 'medium': return '中';
        case 'low': return '低';
        default: return '中';
    }
}

// 工具函数
function getTaskTypeText(type) {
    switch(type) {
        case 'pickup': return '取货';
        case 'delivery': return '送货';
        case 'inventory': return '盘点';
        case 'maintenance': return '维护';
        default: return '未知';
    }
}

function getTaskStatusText(status) {
    switch(status) {
        case 'pending': return '待执行';
        case 'in_progress': return '执行中';
        case 'completed': return '已完成';
        case 'failed': return '失败';
        case 'cancelled': return '已取消';
        default: return '未知';
    }
}

function calculateTaskProgress(task) {
    if (task.status === 'completed') return 100;
    if (task.status === 'cancelled' || task.status === 'failed') return 0;
    if (task.status === 'in_progress') return Math.floor(Math.random() * 80) + 10;
    return 0;
}

// 导出函数供全局使用
window.loadLogisticsModule = loadLogisticsModule;
window.showCreateTaskModal = showCreateTaskModal;
window.createLogisticsTask = createLogisticsTask;
window.refreshLogistics = refreshLogistics;
window.moveRobot = moveRobot;
window.stopRobot = stopRobot;
window.pickupItem = pickupItem;
window.releaseItem = releaseItem;
window.returnHome = returnHome;
window.setRobotSpeed = setRobotSpeed;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.resetView = resetView;
window.viewTaskDetails = viewTaskDetails;
window.executeTask = executeTask;
window.pauseTask = pauseTask;
window.cancelTask = cancelTask;
window.changeLogisticsPage = changeLogisticsPage;

console.log('物流调度模块已加载');