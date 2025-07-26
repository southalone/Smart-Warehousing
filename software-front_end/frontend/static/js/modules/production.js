// 生产规划模块 - 产品补货与定价策略分析

let salesHistoryData = [];
let priceElasticityParams = {};
let wholesalePricePredictions = {};
let optimizationResults = {};
let optimizationCharts = {
    profitHistory: null,
    priceElasticity: null,
    demandForecast: null
};

// 加载生产规划模块
function loadProductionModule() {
    console.log('加载生产规划模块 - 产品补货与定价策略分析');
    
    const moduleContent = document.getElementById('production-module');
    if (!moduleContent) return;
    
    // 渲染模块界面
    moduleContent.innerHTML = `
        <div class="module-header">
            <h3><i class="fas fa-industry"></i> 生产规划 - 补货与定价策略</h3>
            <div class="module-actions">
                <button class="btn btn-primary" onclick="startOptimization()">
                    <i class="fas fa-play"></i> 开始优化
                </button>
                <button class="btn btn-secondary" onclick="refreshAnalysis()">
                    <i class="fas fa-sync-alt"></i> 刷新分析
                </button>
                <button class="btn btn-success" onclick="exportResults()">
                    <i class="fas fa-download"></i> 导出结果
                </button>
            </div>
        </div>
        
        <div class="optimization-overview">
            <div class="overview-card">
                <div class="card-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="card-content">
                    <h4>预期总收益</h4>
                    <span class="metric-value" id="total-profit">¥0</span>
                </div>
            </div>
            
            <div class="overview-card">
                <div class="card-icon">
                    <i class="fas fa-boxes"></i>
                </div>
                <div class="card-content">
                    <h4>优化品类数</h4>
                    <span class="metric-value" id="optimized-categories">0</span>
                </div>
            </div>
            
            <div class="overview-card">
                <div class="card-icon">
                    <i class="fas fa-calendar-week"></i>
                </div>
                <div class="card-content">
                    <h4>规划天数</h4>
                    <span class="metric-value" id="planning-days">7天</span>
                </div>
            </div>
            
            <div class="overview-card">
                <div class="card-icon">
                    <i class="fas fa-percentage"></i>
                </div>
                <div class="card-content">
                    <h4>平均加成率</h4>
                    <span class="metric-value" id="avg-markup">0%</span>
                </div>
            </div>
        </div>
        
        <div class="optimization-controls">
            <div class="control-group">
                <label class="form-label">优化算法参数</label>
                <div class="param-inputs">
                    <div class="input-group">
                        <label>最大迭代次数</label>
                        <input type="number" id="max-iterations" value="1000" min="100" max="5000">
                    </div>
                    <div class="input-group">
                        <label>初始温度</label>
                        <input type="number" id="initial-temp" value="100" min="10" max="500" step="0.1">
                    </div>
                    <div class="input-group">
                        <label>冷却速率</label>
                        <input type="number" id="cooling-rate" value="0.95" min="0.8" max="0.99" step="0.01">
                    </div>
                </div>
            </div>
            
            <div class="control-group">
                <label class="form-label">价格约束</label>
                <div class="param-inputs">
                    <div class="input-group">
                        <label>最低价格</label>
                        <input type="number" id="min-price" value="0.1" min="0.01" step="0.01">
                    </div>
                    <div class="input-group">
                        <label>最高价格</label>
                        <input type="number" id="max-price" value="50" min="1" step="0.1">
                    </div>
                    <div class="input-group">
                        <label>损耗率</label>
                        <input type="number" id="loss-rate" value="0.04" min="0" max="0.2" step="0.01">
                    </div>
                </div>
            </div>
        </div>
        
        <div class="analysis-progress" id="analysis-progress" style="display: none;">
            <div class="progress-header">
                <h4><i class="fas fa-cog fa-spin"></i> 分析进度</h4>
            </div>
            <div class="progress-steps">
                <div class="step" id="step-data-loading">
                    <i class="fas fa-database"></i>
                    <span>加载销售历史数据</span>
                </div>
                <div class="step" id="step-price-prediction">
                    <i class="fas fa-chart-line"></i>
                    <span>Prophet模型预测批发价格</span>
                </div>
                <div class="step" id="step-elasticity-estimation">
                    <i class="fas fa-calculator"></i>
                    <span>最小二乘法估计价格弹性</span>
                </div>
                <div class="step" id="step-optimization">
                    <i class="fas fa-magic"></i>
                    <span>模拟退火算法优化</span>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill"></div>
            </div>
        </div>
        
        <div class="optimization-results" id="optimization-results">
            <div class="results-section">
                <h4><i class="fas fa-calendar-alt"></i> 7天生产计划</h4>
                <div class="daily-plans" id="daily-plans">
                    <!-- 每日生产计划将通过JavaScript生成 -->
                </div>
            </div>
            
            <div class="results-section">
                <h4><i class="fas fa-chart-bar"></i> 价格弹性分析</h4>
                <canvas id="elasticity-chart" width="800" height="400"></canvas>
            </div>
            
            <div class="results-section">
                <h4><i class="fas fa-line-chart"></i> 需求预测</h4>
                <canvas id="demand-forecast-chart" width="800" height="400"></canvas>
            </div>
            
            <div class="results-section">
                <h4><i class="fas fa-chart-area"></i> 优化收敛过程</h4>
                <canvas id="profit-history-chart" width="800" height="400"></canvas>
            </div>
        </div>
    `;
    
    // 添加样式
    addProductionStyles();
    
    // 加载销售历史数据
    loadSalesHistoryData();
    
    // 设置事件监听器
    setupOptimizationEventListeners();
}

function addProductionStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .optimization-overview {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }
        
        .overview-card {
            background: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
            border: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            gap: 20px;
            transition: var(--transition);
        }
        
        .overview-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }
        
        .optimization-controls {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
            padding: 20px;
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
        }
        
        .param-inputs {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 10px;
        }
        
        .input-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .input-group label {
            font-size: 12px;
            color: #666;
            font-weight: 500;
        }
        
        .input-group input {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        
        .analysis-progress {
            background: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
            margin-bottom: 25px;
        }
        
        .progress-steps {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        
        .step {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            transition: all 0.3s ease;
        }
        
        .step.active {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
        }
        
        .step.completed {
            background: #e8f5e8;
            border-left: 4px solid #4caf50;
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #2196f3, #21cbf3);
            width: 0%;
            transition: width 0.3s ease;
        }
        
        .optimization-results {
            display: grid;
            gap: 25px;
        }
        
        .results-section {
            background: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
        }
        
        .daily-plans {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .daily-plan-card {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            border-left: 4px solid #2196f3;
        }
        
        .plan-date {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
        }
        
        .plan-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .summary-item {
            text-align: center;
        }
        
        .summary-value {
            font-size: 20px;
            font-weight: bold;
            color: #2196f3;
        }
        
        .summary-label {
            font-size: 12px;
            color: #666;
        }
        
        .category-list {
            max-height: 200px;
            overflow-y: auto;
        }
        
        .category-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        
        .category-name {
            font-weight: 500;
        }
        
        .category-details {
            display: flex;
            gap: 15px;
            font-size: 12px;
            color: #666;
        }
        
        .production-timeline h4 {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--dark-color);
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .timeline-container {
            position: relative;
            padding: 20px 0;
        }
        
        .timeline-item {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            position: relative;
        }
        
        .timeline-item::before {
            content: '';
            position: absolute;
            left: 15px;
            top: 40px;
            bottom: -20px;
            width: 2px;
            background: var(--border-color);
        }
        
        .timeline-item:last-child::before {
            display: none;
        }
        
        .timeline-marker {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: var(--primary-color);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            margin-right: 20px;
            z-index: 1;
            position: relative;
        }
        
        .timeline-marker.completed {
            background: var(--success-color);
        }
        
        .timeline-marker.in-progress {
            background: var(--warning-color);
        }
        
        .timeline-marker.pending {
            background: var(--secondary-color);
        }
        
        .timeline-content {
            flex: 1;
            background: var(--light-color);
            padding: 15px;
            border-radius: var(--border-radius);
            border-left: 4px solid var(--primary-color);
        }
        
        .timeline-content.completed {
            border-left-color: var(--success-color);
        }
        
        .timeline-content.in-progress {
            border-left-color: var(--warning-color);
        }
        
        .timeline-content.pending {
            border-left-color: var(--secondary-color);
        }
        
        .timeline-title {
            font-weight: 600;
            color: var(--dark-color);
            margin-bottom: 5px;
        }
        
        .timeline-details {
            font-size: 0.9rem;
            color: var(--secondary-color);
            display: flex;
            gap: 15px;
        }
        
        .production-plans {
            background: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
            margin-bottom: 25px;
        }
        
        .production-plans h4 {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--dark-color);
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .plans-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .plan-card {
            background: var(--light-color);
            border-radius: var(--border-radius);
            padding: 20px;
            border: 1px solid var(--border-color);
            transition: var(--transition);
            position: relative;
        }
        
        .plan-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow);
        }
        
        .plan-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        
        .plan-title {
            font-weight: 600;
            color: var(--dark-color);
            font-size: 1.1rem;
        }
        
        .plan-priority {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 500;
        }
        
        .priority-high {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .priority-medium {
            background: #fef3c7;
            color: #92400e;
        }
        
        .priority-low {
            background: #d1fae5;
            color: #065f46;
        }
        
        .plan-details {
            margin-bottom: 15px;
        }
        
        .plan-detail {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 0.9rem;
        }
        
        .plan-detail .label {
            color: var(--secondary-color);
        }
        
        .plan-detail .value {
            color: var(--dark-color);
            font-weight: 500;
        }
        
        .plan-progress {
            margin-bottom: 15px;
        }
        
        .progress-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 0.9rem;
        }
        
        .plan-actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }
        
        .production-analytics {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
        }
        
        .analytics-section {
            background: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
            height: 400px;
        }
        
        .analytics-section h4 {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--dark-color);
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        #efficiency-chart, #cycle-time-chart {
            max-height: 300px !important;
            width: 100% !important;
            height: 300px !important;
        }
        
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
            text-align: center;
        }
        
        .status-pending {
            background: #f3f4f6;
            color: #374151;
        }
        
        .status-in-progress {
            background: #fef3c7;
            color: #92400e;
        }
        
        .status-completed {
            background: #d1fae5;
            color: #065f46;
        }
        
        .status-paused {
            background: #e0e7ff;
            color: #3730a3;
        }
        
        .status-cancelled {
            background: #fee2e2;
            color: #991b1b;
        }
        
        @media (max-width: 768px) {
            .production-analytics {
                grid-template-columns: 1fr;
            }
            
            .plans-grid {
                grid-template-columns: 1fr;
            }
            
            .timeline-item {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .timeline-marker {
                margin-bottom: 10px;
                margin-right: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// 加载销售历史数据
async function loadSalesHistoryData() {
    try {
        const response = await fetch('/api/production/sales-history');
        if (!response.ok) {
            throw new Error('Failed to load sales history data');
        }
        const result = await response.json();
        if (result.success) {
            salesHistoryData = result.data;
            console.log('销售历史数据加载完成:', salesHistoryData.length, '条记录');
        } else {
            throw new Error(result.message || 'API返回失败状态');
        }
    } catch (error) {
        console.error('加载销售历史数据失败:', error);
        showNotification('加载销售历史数据失败', 'error');
    }
}

// 设置事件监听器
function setupOptimizationEventListeners() {
    // 参数输入变化监听
    const paramInputs = ['max-iterations', 'initial-temp', 'cooling-rate', 'min-price', 'max-price', 'loss-rate'];
    paramInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('change', validateParameters);
        }
    });
}

// 验证参数
function validateParameters() {
    const maxIterations = parseInt(document.getElementById('max-iterations').value);
    const initialTemp = parseFloat(document.getElementById('initial-temp').value);
    const coolingRate = parseFloat(document.getElementById('cooling-rate').value);
    const minPrice = parseFloat(document.getElementById('min-price').value);
    const maxPrice = parseFloat(document.getElementById('max-price').value);
    const lossRate = parseFloat(document.getElementById('loss-rate').value);
    
    let isValid = true;
    
    if (maxIterations < 100 || maxIterations > 5000) {
        showNotification('最大迭代次数应在100-5000之间', 'warning');
        isValid = false;
    }
    
    if (initialTemp < 10 || initialTemp > 500) {
        showNotification('初始温度应在10-500之间', 'warning');
        isValid = false;
    }
    
    if (coolingRate < 0.8 || coolingRate > 0.99) {
        showNotification('冷却速率应在0.8-0.99之间', 'warning');
        isValid = false;
    }
    
    if (minPrice >= maxPrice) {
        showNotification('最低价格应小于最高价格', 'warning');
        isValid = false;
    }
    
    if (lossRate < 0 || lossRate > 0.2) {
        showNotification('损耗率应在0-0.2之间', 'warning');
        isValid = false;
    }
    
    return isValid;
}

// 开始优化
async function startOptimization() {
    if (!validateParameters()) {
        return;
    }
    
    if (salesHistoryData.length === 0) {
        showNotification('请先加载销售历史数据', 'warning');
        return;
    }
    
    // 显示进度条
    const progressContainer = document.getElementById('analysis-progress');
    progressContainer.style.display = 'block';
    
    try {
        // 步骤1: 数据预处理
        updateProgress(1, '加载销售历史数据');
        await sleep(500);
        
        // 步骤2: Prophet模型预测批发价格
        updateProgress(2, 'Prophet模型预测批发价格');
        await predictWholesalePrices();
        
        // 步骤3: 最小二乘法估计价格弹性
        updateProgress(3, '最小二乘法估计价格弹性');
        await estimatePriceElasticity();
        
        // 步骤4: 模拟退火算法优化
        updateProgress(4, '模拟退火算法优化');
        await runSimulatedAnnealing();
        
        // 显示结果
        displayOptimizationResults();
        
        showNotification('优化完成！', 'success');
        
    } catch (error) {
        console.error('优化过程出错:', error);
        showNotification('优化过程出错: ' + error.message, 'error');
    } finally {
        // 隐藏进度条
        setTimeout(() => {
            progressContainer.style.display = 'none';
        }, 2000);
    }
}

// 更新进度
function updateProgress(step, message) {
    const steps = document.querySelectorAll('.step');
    const progressFill = document.getElementById('progress-fill');
    
    // 更新步骤状态
    steps.forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed');
        if (index < step - 1) {
            stepEl.classList.add('completed');
        } else if (index === step - 1) {
            stepEl.classList.add('active');
        }
    });
    
    // 更新进度条
    const progress = (step / 4) * 100;
    progressFill.style.width = progress + '%';
    
    console.log(`步骤 ${step}: ${message}`);
}

// Prophet模型预测批发价格
async function predictWholesalePrices() {
    try {
        // 提取产品类别
        const categories = [...new Set(salesHistoryData.map(item => item.category))];
        
        const response = await fetch('/api/production/predict-wholesale-prices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sales_data: salesHistoryData,
                categories: categories
            })
        });
        
        if (!response.ok) {
            throw new Error('批发价格预测失败');
        }
        
        const result = await response.json();
        if (result.success) {
            wholesalePricePredictions = result.data;
            console.log('批发价格预测完成:', wholesalePricePredictions);
        } else {
            throw new Error(result.message || 'Prophet预测API返回失败状态');
        }
        
    } catch (error) {
        console.error('Prophet预测失败:', error);
        throw error;
    }
}

// 最小二乘法估计价格弹性
async function estimatePriceElasticity() {
    try {
        // 提取产品类别
        const categories = [...new Set(salesHistoryData.map(item => item.category))];
        
        const response = await fetch('/api/production/estimate-price-elasticity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sales_data: salesHistoryData,
                categories: categories
            })
        });
        
        if (!response.ok) {
            throw new Error('价格弹性估计失败');
        }
        
        const result = await response.json();
        if (result.success) {
            priceElasticityParams = result.data;
            console.log('价格弹性估计完成:', priceElasticityParams);
        } else {
            throw new Error(result.message || '价格弹性估计API返回失败状态');
        }
        
    } catch (error) {
        console.error('价格弹性估计失败:', error);
        throw error;
    }
}

// 模拟退火算法优化
async function runSimulatedAnnealing() {
    try {
        const params = {
            wholesale_predictions: wholesalePricePredictions,
            elasticity_params: priceElasticityParams,
            algorithm_params: {
                max_iterations: parseInt(document.getElementById('max-iterations').value),
                initial_temp: parseFloat(document.getElementById('initial-temp').value),
                cooling_rate: parseFloat(document.getElementById('cooling-rate').value)
            },
            price_constraints: {
                min_price: parseFloat(document.getElementById('min-price').value),
                max_price: parseFloat(document.getElementById('max-price').value),
                loss_rate: parseFloat(document.getElementById('loss-rate').value)
            }
        };
        
        const response = await fetch('/api/production/simulated-annealing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        });
        
        if (!response.ok) {
            throw new Error('模拟退火优化失败');
        }
        
        const result = await response.json();
        if (result.success) {
            optimizationResults = result.data;
            console.log('模拟退火优化完成:', optimizationResults);
        } else {
            throw new Error(result.message || '模拟退火优化API返回失败状态');
        }
        
    } catch (error) {
        console.error('模拟退火优化失败:', error);
        throw error;
    }
}

// 显示优化结果
function displayOptimizationResults() {
    // 更新概览卡片
    updateOverviewCards();
    
    // 显示每日生产计划
    displayDailyPlans();
    
    // 绘制图表
    drawElasticityChart();
    drawDemandForecastChart();
    drawProfitHistoryChart();
}

// 更新概览卡片
function updateOverviewCards() {
    if (!optimizationResults.daily_results) return;
    
    const totalProfit = optimizationResults.total_profit || optimizationResults.daily_results.reduce((sum, day) => sum + day.total_profit, 0);
    const categoriesCount = Object.keys(priceElasticityParams).length;
    const avgMarkup = 0.2; // 默认20%利润率，实际应从优化结果计算
    
    document.getElementById('total-profit').textContent = `¥${totalProfit.toFixed(2)}`;
    document.getElementById('optimized-categories').textContent = categoriesCount;
    document.getElementById('avg-markup').textContent = `${(avgMarkup * 100).toFixed(1)}%`;
}

// 显示每日生产计划
function displayDailyPlans() {
    const dailyPlansContainer = document.getElementById('daily-plans');
    if (!optimizationResults.daily_results) {
        dailyPlansContainer.innerHTML = '<p>暂无优化结果</p>';
        return;
    }
    
    const plansHTML = optimizationResults.daily_results.map((dayResult, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);
        const dateStr = date.toLocaleDateString('zh-CN');
        
        const categoriesHTML = Object.entries(dayResult.optimal_prices).map(([category, price]) => {
            const demand = dayResult.demands[category] || 0;
            const profit = dayResult.profits[category] || 0;
            
            return `
                <div class="category-item">
                    <span class="category-name">${category}</span>
                    <div class="category-details">
                        <span>成本: ¥${price.toFixed(2)}</span>
                        <span>需求: ${demand.toFixed(0)}个</span>
                        <span>利润: ¥${profit.toFixed(2)}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        return `
            <div class="daily-plan-card">
                <div class="plan-date">${dateStr} (第${index + 1}天)</div>
                <div class="plan-summary">
                    <div class="summary-item">
                        <div class="summary-value">${Object.keys(dayResult.optimal_prices).length}</div>
                        <div class="summary-label">品类数</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">${Object.values(dayResult.demands).reduce((a, b) => a + b, 0).toFixed(0)}</div>
                        <div class="summary-label">总需求</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">¥${dayResult.total_profit.toFixed(2)}</div>
                        <div class="summary-label">总利润</div>
                    </div>
                </div>
                <div class="category-list">
                    ${categoriesHTML}
                </div>
            </div>
        `;
    }).join('');
    
    dailyPlansContainer.innerHTML = plansHTML;
}

// 刷新分析
function refreshAnalysis() {
    loadSalesHistoryData();
    showNotification('数据已刷新', 'info');
}

// 导出结果
function exportResults() {
    if (!optimizationResults.daily_results) {
        showNotification('暂无结果可导出', 'warning');
        return;
    }
    
    const data = {
        optimization_results: optimizationResults,
        elasticity_params: priceElasticityParams,
        wholesale_predictions: wholesalePricePredictions,
        export_time: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `production_optimization_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('结果已导出', 'success');
}

// 工具函数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setupProductionEventListeners() {
    // 筛选器变化事件
    const statusFilter = document.getElementById('status-filter');
    const priorityFilter = document.getElementById('priority-filter');
    const timeFilter = document.getElementById('time-filter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterProductionPlans);
    }
    
    if (priorityFilter) {
        priorityFilter.addEventListener('change', filterProductionPlans);
    }
    
    if (timeFilter) {
        timeFilter.addEventListener('change', filterProductionPlans);
    }
}

function loadProductionData() {
    app.showLoading();
    
    // 加载生产计划数据
    app.apiRequest('/api/production/plans', { method: 'GET' })
        .then(data => {
            if (data.success) {
                productionPlans = data.data;
                updateProductionOverview();
                renderProductionTimeline();
                renderProductionPlans();
                renderProductionAnalytics();
                app.playVoice('生产数据已更新');
            } else {
                app.showNotification('加载生产数据失败', 'error');
            }
        })
        .catch(error => {
            console.error('加载生产数据错误:', error);
            app.showNotification('网络连接错误', 'error');
        })
        .finally(() => {
            app.hideLoading();
        });
}

function updateProductionOverview() {
    const totalPlans = productionPlans.length;
    const activePlans = productionPlans.filter(plan => plan.status === 'in_progress').length;
    const completedPlans = productionPlans.filter(plan => plan.status === 'completed').length;
    const completionRate = totalPlans > 0 ? (completedPlans / totalPlans * 100).toFixed(1) : 0;
    
    document.getElementById('total-plans').textContent = totalPlans;
    document.getElementById('active-plans').textContent = activePlans;
    document.getElementById('completed-plans').textContent = completedPlans;
    document.getElementById('completion-rate').textContent = completionRate + '%';
}

function renderProductionTimeline() {
    const timelineContainer = document.getElementById('production-timeline');
    if (!timelineContainer) return;
    
    // 获取今天和未来7天的计划
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcomingPlans = productionPlans.filter(plan => {
        const planDate = new Date(plan.start_date);
        return planDate >= today && planDate <= nextWeek;
    }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    
    if (upcomingPlans.length === 0) {
        timelineContainer.innerHTML = '<p class="text-center">未来一周暂无生产计划</p>';
        return;
    }
    
    timelineContainer.innerHTML = upcomingPlans.map(plan => {
        const statusClass = getStatusClass(plan.status);
        return `
            <div class="timeline-item">
                <div class="timeline-marker ${statusClass}">
                    <i class="fas ${getStatusIcon(plan.status)}"></i>
                </div>
                <div class="timeline-content ${statusClass}">
                    <div class="timeline-title">${plan.product_name}</div>
                    <div class="timeline-details">
                        <span>数量: ${plan.quantity}</span>
                        <span>开始: ${app.formatDate(plan.start_date)}</span>
                        <span>预计完成: ${app.formatDate(plan.end_date)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderProductionPlans() {
    const plansGrid = document.getElementById('plans-grid');
    if (!plansGrid) return;
    
    const startIndex = (currentProductionPage - 1) * productionItemsPerPage;
    const endIndex = startIndex + productionItemsPerPage;
    const pageData = productionPlans.slice(startIndex, endIndex);
    
    plansGrid.innerHTML = pageData.map(plan => {
        const progress = calculateProgress(plan);
        const statusClass = getStatusClass(plan.status);
        const priorityClass = getPriorityClass(plan.priority);
        
        return `
            <div class="plan-card">
                <div class="plan-header">
                    <div class="plan-title">${plan.product_name}</div>
                    <span class="plan-priority ${priorityClass}">${getPriorityText(plan.priority)}</span>
                </div>
                
                <div class="plan-details">
                    <div class="plan-detail">
                        <span class="label">计划编号:</span>
                        <span class="value">${plan.plan_code}</span>
                    </div>
                    <div class="plan-detail">
                        <span class="label">生产数量:</span>
                        <span class="value">${plan.quantity} 件</span>
                    </div>
                    <div class="plan-detail">
                        <span class="label">开始时间:</span>
                        <span class="value">${app.formatDate(plan.start_date)}</span>
                    </div>
                    <div class="plan-detail">
                        <span class="label">预计完成:</span>
                        <span class="value">${app.formatDate(plan.end_date)}</span>
                    </div>
                    <div class="plan-detail">
                        <span class="label">状态:</span>
                        <span class="value">
                            <span class="status-badge status-${plan.status}">${getStatusText(plan.status)}</span>
                        </span>
                    </div>
                </div>
                
                <div class="plan-progress">
                    <div class="progress-label">
                        <span>进度</span>
                        <span>${progress}%</span>
                    </div>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <div class="plan-actions">
                    <button class="btn btn-sm btn-primary" onclick="editPlan(${plan.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="startPlan(${plan.id})" ${plan.status === 'in_progress' ? 'disabled' : ''}>
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="pausePlan(${plan.id})" ${plan.status !== 'in_progress' ? 'disabled' : ''}>
                        <i class="fas fa-pause"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deletePlan(${plan.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    renderProductionPagination();
}

function renderProductionPagination() {
    const pagination = document.getElementById('production-pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(productionPlans.length / productionItemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = `
        <button onclick="changeProductionPage(${currentProductionPage - 1})" ${currentProductionPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentProductionPage) {
            paginationHTML += `<button class="active">${i}</button>`;
        } else {
            paginationHTML += `<button onclick="changeProductionPage(${i})">${i}</button>`;
        }
    }
    
    paginationHTML += `
        <button onclick="changeProductionPage(${currentProductionPage + 1})" ${currentProductionPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

function renderProductionAnalytics() {
    renderEfficiencyChart();
    renderCycleTimeChart();
}

function renderEfficiencyChart() {
    const canvas = document.getElementById('efficiency-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 销毁现有图表实例
    if (productionCharts.efficiency) {
        productionCharts.efficiency.destroy();
        productionCharts.efficiency = null;
    }
    
    // 模拟效率数据
    const efficiencyData = {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [{
            label: '生产效率 (%)',
            data: [85, 92, 88, 95, 90, 87, 93],
            backgroundColor: 'rgba(37, 99, 235, 0.2)',
            borderColor: 'rgb(37, 99, 235)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    };
    
    productionCharts.efficiency = new Chart(ctx, {
        type: 'line',
        data: efficiencyData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: '效率 (%)'
                    }
                }
            }
        }
    });
}

function renderCycleTimeChart() {
    const canvas = document.getElementById('cycle-time-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 销毁现有图表实例
    if (productionCharts.cycleTime) {
        productionCharts.cycleTime.destroy();
        productionCharts.cycleTime = null;
    }
    
    // 模拟周期时间数据
    const cycleTimeData = {
        labels: ['产品A', '产品B', '产品C', '产品D', '产品E'],
        datasets: [{
            label: '平均周期时间 (小时)',
            data: [24, 18, 32, 28, 22],
            backgroundColor: [
                'rgba(37, 99, 235, 0.8)',
                'rgba(5, 150, 105, 0.8)',
                'rgba(217, 119, 6, 0.8)',
                'rgba(220, 38, 38, 0.8)',
                'rgba(8, 145, 178, 0.8)'
            ],
            borderWidth: 0
        }]
    };
    
    productionCharts.cycleTime = new Chart(ctx, {
        type: 'bar',
        data: cycleTimeData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '时间 (小时)'
                    }
                }
            }
        }
    });
}

// 工具函数
function getStatusClass(status) {
    switch(status) {
        case 'completed': return 'completed';
        case 'in_progress': return 'in-progress';
        case 'pending': return 'pending';
        default: return 'pending';
    }
}

function getStatusIcon(status) {
    switch(status) {
        case 'completed': return 'fa-check';
        case 'in_progress': return 'fa-play';
        case 'pending': return 'fa-clock';
        case 'paused': return 'fa-pause';
        case 'cancelled': return 'fa-times';
        default: return 'fa-clock';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'pending': return '待开始';
        case 'in_progress': return '进行中';
        case 'completed': return '已完成';
        case 'paused': return '已暂停';
        case 'cancelled': return '已取消';
        default: return '未知';
    }
}

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

function calculateProgress(plan) {
    if (plan.status === 'completed') return 100;
    if (plan.status === 'pending') return 0;
    
    // 基于时间计算进度
    const now = new Date();
    const start = new Date(plan.start_date);
    const end = new Date(plan.end_date);
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
}

function filterProductionPlans() {
    const statusFilter = document.getElementById('status-filter').value;
    const priorityFilter = document.getElementById('priority-filter').value;
    const timeFilter = document.getElementById('time-filter').value;
    
    // 重新加载原始数据
    loadProductionData();
    
    setTimeout(() => {
        let filteredPlans = [...productionPlans];
        
        if (statusFilter) {
            filteredPlans = filteredPlans.filter(plan => plan.status === statusFilter);
        }
        
        if (priorityFilter) {
            filteredPlans = filteredPlans.filter(plan => plan.priority === priorityFilter);
        }
        
        if (timeFilter) {
            const now = new Date();
            filteredPlans = filteredPlans.filter(plan => {
                const planDate = new Date(plan.start_date);
                switch(timeFilter) {
                    case 'today':
                        return planDate.toDateString() === now.toDateString();
                    case 'week':
                        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                        const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
                        return planDate >= weekStart && planDate <= weekEnd;
                    case 'month':
                        return planDate.getMonth() === now.getMonth() && planDate.getFullYear() === now.getFullYear();
                    default:
                        return true;
                }
            });
        }
        
        productionPlans = filteredPlans;
        currentProductionPage = 1;
        renderProductionPlans();
        updateProductionOverview();
    }, 100);
}

function changeProductionPage(page) {
    const totalPages = Math.ceil(productionPlans.length / productionItemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentProductionPage = page;
    renderProductionPlans();
}

function showCreatePlanModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">创建生产计划</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="create-plan-form">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">产品名称</label>
                                    <input type="text" class="form-control" id="plan-product" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">计划数量</label>
                                    <input type="number" class="form-control" id="plan-quantity" min="1" required>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">开始日期</label>
                                    <input type="date" class="form-control" id="plan-start-date" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">结束日期</label>
                                    <input type="date" class="form-control" id="plan-end-date" required>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">优先级</label>
                                    <select class="form-control" id="plan-priority" required>
                                        <option value="high">高</option>
                                        <option value="medium" selected>中</option>
                                        <option value="low">低</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">负责人</label>
                                    <input type="text" class="form-control" id="plan-manager" required>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">备注</label>
                            <textarea class="form-control" id="plan-notes" rows="3"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="createProductionPlan()">创建计划</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    // 设置默认日期
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('plan-start-date').value = today;
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    document.getElementById('plan-end-date').value = nextWeek.toISOString().split('T')[0];
    
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function refreshProduction() {
    currentProductionPage = 1;
    document.getElementById('status-filter').value = '';
    document.getElementById('priority-filter').value = '';
    document.getElementById('time-filter').value = '';
    loadProductionData();
    app.playVoice('生产数据已刷新');
}

function optimizeProduction() {
    app.showLoading();
    app.playVoice('正在进行生产优化分析');
    
    app.apiRequest('/api/production/optimize', {
        method: 'POST'
    })
    .then(data => {
        if (data.success) {
            app.showNotification('生产计划已优化', 'success');
            app.playVoice('生产优化完成');
            loadProductionData();
        } else {
            app.showNotification('生产优化失败', 'error');
        }
    })
    .catch(error => {
        console.error('生产优化错误:', error);
        app.showNotification('网络连接错误', 'error');
    })
    .finally(() => {
        app.hideLoading();
    });
}

function editPlan(planId) {
    const plan = productionPlans.find(p => p.id === planId);
    if (!plan) {
        app.showNotification('未找到指定的生产计划', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">编辑生产计划 - ${plan.plan_code}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="edit-plan-form">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">产品名称</label>
                                    <input type="text" class="form-control" id="edit-plan-product" value="${plan.product_name}" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">计划数量</label>
                                    <input type="number" class="form-control" id="edit-plan-quantity" value="${plan.quantity}" min="1" required>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">开始日期</label>
                                    <input type="date" class="form-control" id="edit-plan-start-date" value="${plan.start_date}" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">结束日期</label>
                                    <input type="date" class="form-control" id="edit-plan-end-date" value="${plan.end_date}" required>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">优先级</label>
                                    <select class="form-control" id="edit-plan-priority" required>
                                        <option value="high" ${plan.priority === 'high' ? 'selected' : ''}>高</option>
                                        <option value="medium" ${plan.priority === 'medium' ? 'selected' : ''}>中</option>
                                        <option value="low" ${plan.priority === 'low' ? 'selected' : ''}>低</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">负责人</label>
                                    <input type="text" class="form-control" id="edit-plan-manager" value="${plan.manager || ''}" required>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">备注</label>
                            <textarea class="form-control" id="edit-plan-notes" rows="3">${plan.notes || ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="updateProductionPlan(${planId})">更新计划</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function startPlan(planId) {
    app.showModal(
        '确认开始',
        '确定要开始这个生产计划吗？',
        () => {
            app.showNotification(`生产计划 ID: ${planId} 已开始`, 'success');
            loadProductionData();
        }
    );
}

function pausePlan(planId) {
    app.showModal(
        '确认暂停',
        '确定要暂停这个生产计划吗？',
        () => {
            app.showNotification(`生产计划 ID: ${planId} 已暂停`, 'warning');
            loadProductionData();
        }
    );
}

function deletePlan(planId) {
    app.showModal(
        '确认删除',
        '确定要删除这个生产计划吗？此操作不可撤销。',
        () => {
            app.showNotification(`生产计划 ID: ${planId} 已删除`, 'success');
            loadProductionData();
        }
    );
}

// 新增功能函数
function createProductionPlan() {
    const productName = document.getElementById('plan-product').value;
    const quantity = document.getElementById('plan-quantity').value;
    const startDate = document.getElementById('plan-start-date').value;
    const endDate = document.getElementById('plan-end-date').value;
    const priority = document.getElementById('plan-priority').value;
    const manager = document.getElementById('plan-manager').value;
    const notes = document.getElementById('plan-notes').value;
    
    if (!productName || !quantity || !startDate || !endDate || !manager) {
        app.showNotification('请填写所有必填字段', 'error');
        return;
    }
    
    const planData = {
        product_name: productName,
        quantity: parseInt(quantity),
        start_date: startDate,
        end_date: endDate,
        priority: priority,
        manager: manager,
        notes: notes,
        status: 'pending'
    };
    
    app.showLoading();
    app.apiRequest('/api/production/plans', {
        method: 'POST',
        body: JSON.stringify(planData)
    })
    .then(data => {
        if (data.success) {
            app.showNotification('生产计划创建成功', 'success');
            app.playVoice('生产计划已创建');
            loadProductionData();
            // 关闭模态框
            const modal = document.querySelector('.modal.show');
            if (modal) {
                bootstrap.Modal.getInstance(modal).hide();
            }
        } else {
            app.showNotification('创建生产计划失败', 'error');
        }
    })
    .catch(error => {
        console.error('创建生产计划错误:', error);
        app.showNotification('网络连接错误', 'error');
    })
    .finally(() => {
        app.hideLoading();
    });
}

function updateProductionPlan(planId) {
    const productName = document.getElementById('edit-plan-product').value;
    const quantity = document.getElementById('edit-plan-quantity').value;
    const startDate = document.getElementById('edit-plan-start-date').value;
    const endDate = document.getElementById('edit-plan-end-date').value;
    const priority = document.getElementById('edit-plan-priority').value;
    const manager = document.getElementById('edit-plan-manager').value;
    const notes = document.getElementById('edit-plan-notes').value;
    
    if (!productName || !quantity || !startDate || !endDate || !manager) {
        app.showNotification('请填写所有必填字段', 'error');
        return;
    }
    
    const planData = {
        product_name: productName,
        quantity: parseInt(quantity),
        start_date: startDate,
        end_date: endDate,
        priority: priority,
        manager: manager,
        notes: notes
    };
    
    app.showLoading();
    app.apiRequest(`/api/production/plans/${planId}`, {
        method: 'PUT',
        body: JSON.stringify(planData)
    })
    .then(data => {
        if (data.success) {
            app.showNotification('生产计划更新成功', 'success');
            app.playVoice('生产计划已更新');
            loadProductionData();
            // 关闭模态框
            const modal = document.querySelector('.modal.show');
            if (modal) {
                bootstrap.Modal.getInstance(modal).hide();
            }
        } else {
            app.showNotification('更新生产计划失败', 'error');
        }
    })
    .catch(error => {
        console.error('更新生产计划错误:', error);
        app.showNotification('网络连接错误', 'error');
    })
    .finally(() => {
        app.hideLoading();
    });
}

// 绘制价格弹性图表
function drawElasticityChart() {
    const canvas = document.getElementById('elasticity-chart');
    if (!canvas || !priceElasticityParams || Object.keys(priceElasticityParams).length === 0) return;
    
    const ctx = canvas.getContext('2d');
    
    if (optimizationCharts.priceElasticity) {
        optimizationCharts.priceElasticity.destroy();
    }
    
    const categories = Object.keys(priceElasticityParams);
    const elasticityValues = categories.map(cat => priceElasticityParams[cat].elasticity);
    
    optimizationCharts.priceElasticity = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: '价格弹性系数',
                data: elasticityValues,
                backgroundColor: elasticityValues.map(val => 
                    val < -1 ? 'rgba(244, 67, 54, 0.8)' :  // 高弹性 - 红色
                    val < -0.5 ? 'rgba(255, 152, 0, 0.8)' : // 中弹性 - 橙色
                    'rgba(76, 175, 80, 0.8)'  // 低弹性 - 绿色
                ),
                borderColor: elasticityValues.map(val => 
                    val < -1 ? 'rgba(244, 67, 54, 1)' :
                    val < -0.5 ? 'rgba(255, 152, 0, 1)' :
                    'rgba(76, 175, 80, 1)'
                ),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '各品类价格弹性分析'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: '弹性系数'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '产品品类'
                    }
                }
            }
        }
    });
}

// 绘制需求预测图表
function drawDemandForecastChart() {
    const canvas = document.getElementById('demand-forecast-chart');
    if (!canvas || !optimizationResults.daily_results) return;
    
    const ctx = canvas.getContext('2d');
    
    if (optimizationCharts.demandForecast) {
        optimizationCharts.demandForecast.destroy();
    }
    
    const days = optimizationResults.daily_results.map((_, index) => `第${index + 1}天`);
    const categories = Object.keys(optimizationResults.daily_results[0].demands || {});
    
    const datasets = categories.slice(0, 5).map((category, index) => {
        const colors = [
            'rgba(33, 150, 243, 0.8)',
            'rgba(76, 175, 80, 0.8)',
            'rgba(255, 152, 0, 0.8)',
            'rgba(156, 39, 176, 0.8)',
            'rgba(244, 67, 54, 0.8)'
        ];
        
        return {
            label: category,
            data: optimizationResults.daily_results.map(day => day.demands[category] || 0),
            borderColor: colors[index],
            backgroundColor: colors[index].replace('0.8', '0.2'),
            tension: 0.4,
            fill: false
        };
    });
    
    optimizationCharts.demandForecast = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '7天需求预测趋势'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '预测需求量'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '时间'
                    }
                }
            }
        }
    });
}

// 绘制利润历史图表
function drawProfitHistoryChart() {
    const canvas = document.getElementById('profit-history-chart');
    if (!canvas || !optimizationResults.profit_history) return;
    
    const ctx = canvas.getContext('2d');
    
    if (optimizationCharts.profitHistory) {
        optimizationCharts.profitHistory.destroy();
    }
    
    const iterations = optimizationResults.profit_history.map((_, index) => index + 1);
    
    optimizationCharts.profitHistory = new Chart(ctx, {
        type: 'line',
        data: {
            labels: iterations,
            datasets: [{
                label: '目标函数值',
                data: optimizationResults.profit_history,
                borderColor: 'rgba(33, 150, 243, 1)',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '模拟退火算法收敛过程'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: '总利润'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '迭代次数'
                    }
                }
            }
        }
    });
}

// 导出函数供全局使用
window.loadProductionModule = loadProductionModule;
window.showCreatePlanModal = showCreatePlanModal;
window.createProductionPlan = createProductionPlan;
window.updateProductionPlan = updateProductionPlan;
window.refreshProduction = refreshProduction;
window.optimizeProduction = optimizeProduction;
window.editPlan = editPlan;
window.startPlan = startPlan;
window.pausePlan = pausePlan;
window.deletePlan = deletePlan;
window.changeProductionPage = changeProductionPage;
window.startOptimization = startOptimization;
window.refreshAnalysis = refreshAnalysis;
window.exportResults = exportResults;
window.drawElasticityChart = drawElasticityChart;
window.drawDemandForecastChart = drawDemandForecastChart;
window.drawProfitHistoryChart = drawProfitHistoryChart;

console.log('生产规划模块已加载 - 补货与定价策略分析');