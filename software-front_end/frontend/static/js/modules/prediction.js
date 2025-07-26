// 销售预测模块

let predictionData = [];
let predictionChartInstances = {};

// 加载销售预测模块
function loadPredictionModule() {
    console.log('加载销售预测模块');
    
    const moduleContent = document.getElementById('prediction-module');
    if (!moduleContent) return;
    
    // 渲染模块界面
    moduleContent.innerHTML = `
        <div class="module-header">
            <h3><i class="fas fa-chart-line"></i> 销售预测</h3>
            <div class="module-actions">
                <button class="btn btn-primary" onclick="generatePrediction()">
                    <i class="fas fa-magic"></i> 生成预测
                </button>
                <button class="btn btn-secondary" onclick="refreshPrediction()">
                    <i class="fas fa-sync-alt"></i> 刷新
                </button>
                <button class="btn btn-info" onclick="exportPrediction()">
                    <i class="fas fa-download"></i> 导出报告
                </button>
            </div>
        </div>
        
        <div class="prediction-controls">
            <div class="control-group">
                <label class="form-label">预测产品</label>
                <select id="product-select" class="form-select">
                    <option value="">选择产品...</option>
                </select>
            </div>
            
            <div class="control-group">
                <label class="form-label">预测周期</label>
                <select id="period-select" class="form-select">
                    <option value="7">未来7天</option>
                    <option value="30" selected>未来30天</option>
                    <option value="90">未来90天</option>
                </select>
            </div>
            
            <div class="control-group">
                <label class="form-label">预测模型</label>
                <select id="model-select" class="form-select">
                    <option value="linear">线性回归</option>
                    <option value="arima" selected>ARIMA模型</option>
                    <option value="lstm">LSTM神经网络</option>
                </select>
            </div>
        </div>
        
        <div class="prediction-summary">
            <div class="summary-card">
                <div class="card-icon">
                    <i class="fas fa-trending-up"></i>
                </div>
                <div class="card-content">
                    <h4>预测销量</h4>
                    <span class="metric-value" id="predicted-sales">-</span>
                    <span class="metric-unit">件</span>
                </div>
            </div>
            
            <div class="summary-card">
                <div class="card-icon">
                    <i class="fas fa-dollar-sign"></i>
                </div>
                <div class="card-content">
                    <h4>预测收入</h4>
                    <span class="metric-value" id="predicted-revenue">-</span>
                    <span class="metric-unit">元</span>
                </div>
            </div>
            
            <div class="summary-card">
                <div class="card-icon">
                    <i class="fas fa-percentage"></i>
                </div>
                <div class="card-content">
                    <h4>增长率</h4>
                    <span class="metric-value" id="growth-rate">-</span>
                    <span class="metric-unit">%</span>
                </div>
            </div>
            
            <div class="summary-card">
                <div class="card-icon">
                    <i class="fas fa-bullseye"></i>
                </div>
                <div class="card-content">
                    <h4>预测准确度</h4>
                    <span class="metric-value" id="accuracy">-</span>
                    <span class="metric-unit">%</span>
                </div>
            </div>
        </div>
        
        <div class="chart-container">
            <div class="chart-header">
                <h4><i class="fas fa-chart-area"></i> 销售趋势预测</h4>
                <div class="chart-controls">
                    <button class="btn btn-sm btn-secondary" onclick="toggleChartType('line')">
                        <i class="fas fa-chart-line"></i> 线图
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="toggleChartType('bar')">
                        <i class="fas fa-chart-bar"></i> 柱图
                    </button>
                </div>
            </div>
            <canvas id="prediction-chart"></canvas>
        </div>
        
        <div class="prediction-details">
            <div class="details-section">
                <h4><i class="fas fa-list"></i> 预测详情</h4>
                <div class="table-container">
                    <table class="table" id="prediction-table">
                        <thead>
                            <tr>
                                <th>日期</th>
                                <th>预测销量</th>
                                <th>置信区间下限</th>
                                <th>置信区间上限</th>
                                <th>历史销量</th>
                                <th>偏差 & 趋势</th>
                            </tr>
                        </thead>
                        <tbody id="prediction-tbody">
                            <!-- 数据将通过JavaScript填充 -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    `;
    
    // 添加样式
    addPredictionStyles();
    
    // 加载预测数据
    loadPredictionData();
    
    // 设置事件监听器
    setupPredictionEventListeners();
    

}

function addPredictionStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .prediction-controls {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
            padding: 20px;
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
        }
        
        .control-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .prediction-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }
        
        .summary-card {
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
        
        .summary-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }
        
        .card-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-color), var(--info-color));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            color: white;
        }
        
        .card-content {
            flex: 1;
        }
        
        .card-content h4 {
            font-size: 1rem;
            color: var(--secondary-color);
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .metric-value {
            font-size: 2rem;
            font-weight: 700;
            color: var(--dark-color);
            margin-right: 5px;
        }
        
        .metric-unit {
            font-size: 1rem;
            color: var(--secondary-color);
            font-weight: 500;
        }
        
        .chart-container {
            background: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
            margin-bottom: 25px;
            min-height: 300px;
            height: auto;
        }
        
        #prediction-chart {
            width: 100% !important;
            height: auto !important;
            min-height: 250px;
        }
        
        .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .chart-header h4 {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--dark-color);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .chart-controls {
            display: flex;
            gap: 10px;
        }
        
        .prediction-details {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 25px;
        }
        
        .details-section {
            background: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
        }
        
        .details-section h4 {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--dark-color);
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        

        

        
        .sales-history-section {
            background: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
            margin-top: 25px;
        }
        
        .history-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .history-header h4 {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--dark-color);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .history-controls {
            display: flex;
            align-items: end;
            gap: 15px;
        }
        
        .history-controls .control-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
            min-width: 120px;
        }
        
        .history-controls .form-label {
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--secondary-color);
        }
        
        .history-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }
        
        .history-summary .summary-card {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            transition: var(--transition);
        }
        
        .history-summary .summary-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }
        
        .history-summary .card-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--success-color), var(--info-color));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: white;
        }
        
        .history-summary .card-content h5 {
            font-size: 0.9rem;
            color: var(--secondary-color);
            margin-bottom: 5px;
            font-weight: 500;
        }
        
        .history-chart-container {
            background: #f8fafc;
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            padding: 20px;
            margin-bottom: 25px;
            min-height: 250px;
            max-height: 400px;
            height: 400px;
            overflow: hidden;
        }
        
        .history-chart-container .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .history-chart-container .chart-header h5 {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--dark-color);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        #history-chart {
            width: 100% !important;
            height: 320px !important;
            max-height: 320px !important;
        }
        
        .history-table-section {
            margin-top: 20px;
        }
        
        .history-table-section h5 {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--dark-color);
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        @media (max-width: 768px) {
            .prediction-details {
                grid-template-columns: 1fr;
            }
            
            .chart-header {
                flex-direction: column;
                gap: 15px;
                align-items: stretch;
            }
            
            .chart-controls {
                justify-content: center;
            }
            
            .history-header {
                flex-direction: column;
                gap: 15px;
                align-items: stretch;
            }
            
            .history-controls {
                flex-direction: column;
                gap: 10px;
            }
            
            .history-controls .control-group {
                min-width: auto;
            }
            
            .history-summary {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            }
        }
    `;
    document.head.appendChild(style);
}

function setupPredictionEventListeners() {
    // 产品选择变化
    const productSelect = document.getElementById('product-select');
    if (productSelect) {
        productSelect.addEventListener('change', onProductChange);
    }
    
    // 预测周期变化
    const periodSelect = document.getElementById('period-select');
    if (periodSelect) {
        periodSelect.addEventListener('change', onPeriodChange);
    }
    
    // 模型选择变化
    const modelSelect = document.getElementById('model-select');
    if (modelSelect) {
        modelSelect.addEventListener('change', onModelChange);
    }
    
    // 销售历史时间范围变化
    const historyPeriodSelect = document.getElementById('history-period');
    if (historyPeriodSelect) {
        historyPeriodSelect.addEventListener('change', onHistoryPeriodChange);
    }
    
    // 销售历史日期变化
    const historyDateInput = document.getElementById('history-date');
    if (historyDateInput) {
        historyDateInput.addEventListener('change', onHistoryDateChange);
    }
}

function transformPredictionData(backendData, period) {
    // 将后端数据转换为前端需要的格式
    const transformedData = [];
    
    // 首先处理历史数据，创建完整的数据结构
    const historicalMap = new Map();
    if (backendData.historical_data && Array.isArray(backendData.historical_data)) {
        backendData.historical_data.forEach(hist => {
            historicalMap.set(hist.date, {
                date: hist.date,
                historical_sales: Math.round(hist.actual_quantity || 0),
                predicted_sales: null,
                predicted_revenue: null,
                growth_rate: 0,
                accuracy: null,
                upper_bound: null,
                lower_bound: null,
                is_historical: true
            });
        });
    }
    
    // 处理预测数据
    if (backendData.predictions && Array.isArray(backendData.predictions)) {
        backendData.predictions.forEach(pred => {
            const quantity = pred.predicted_quantity || 0;
            const predictionItem = {
                date: pred.date,
                predicted_sales: Math.round(quantity),
                predicted_revenue: Math.round(quantity * 50), // 假设平均单价50元
                growth_rate: 0,
                accuracy: backendData.model_accuracy ? (100 - (backendData.model_accuracy.mae || 15)) : 85,
                historical_sales: null,
                upper_bound: Math.round(quantity * 1.2),
                lower_bound: Math.round(Math.max(0, quantity * 0.8)),
                is_historical: false
            };
            
            // 如果该日期有历史数据，合并
            if (historicalMap.has(pred.date)) {
                const historical = historicalMap.get(pred.date);
                predictionItem.historical_sales = historical.historical_sales;
                // 计算增长率
                if (historical.historical_sales > 0) {
                    predictionItem.growth_rate = ((quantity - historical.historical_sales) / historical.historical_sales * 100);
                }
            }
            
            transformedData.push(predictionItem);
        });
    }
    
    // 添加纯历史数据（没有对应预测的日期）
    historicalMap.forEach((historical, date) => {
        const hasPredicton = transformedData.some(item => item.date === date);
        if (!hasPredicton) {
            transformedData.push(historical);
        }
    });
    
    // 按日期排序
    transformedData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return transformedData;
}

function loadPredictionData() {
    app.showLoading();
    
    // 延迟执行API请求，确保页面完全加载
    setTimeout(() => {
        // 加载产品列表
        app.apiRequest('/api/products', { method: 'GET' })
            .then(data => {
                if (data.success) {
                    populateProductSelect(data.data);
                }
            })
            .catch(error => {
                console.error('加载产品列表错误:', error);
            });
        
        // 加载预测数据概览
        app.apiRequest('/api/prediction', { method: 'GET' })
            .then(data => {
                if (data.success) {
                    predictionData = data.data;
                    updatePredictionSummary();
                    renderPredictionChart();
                    renderPredictionTable();
            
                    app.playVoice('销售预测数据已更新');
                } else {
                    app.showNotification('加载预测数据失败', 'error');
                }
            })
            .catch(error => {
                console.error('加载预测数据错误:', error);
                app.showNotification('网络连接错误', 'error');
            })
            .finally(() => {
                app.hideLoading();
            });
    }, 1000);
}

function populateProductSelect(products) {
    const productSelect = document.getElementById('product-select');
    if (!productSelect) return;
    
    productSelect.innerHTML = '<option value="">选择产品...</option>';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (${product.model})`;
        productSelect.appendChild(option);
    });
    
    // 默认选择第一个产品
    if (products.length > 0) {
        productSelect.value = products[0].id;
        onProductChange();
    }
}

function updateModelInfo(backendData) {
    // 更新模型信息显示
    const modelType = backendData.model_type || 'unknown';
    const modelAccuracy = backendData.model_accuracy || {};
    
    // 在页面上显示当前使用的模型信息
    const chartHeader = document.querySelector('.chart-header h4');
    if (chartHeader) {
        const modelName = {
            'linear': '线性回归',
            'arima': 'ARIMA',
            'lstm': 'LSTM神经网络'
        }[modelType] || modelType.toUpperCase();
        
        chartHeader.innerHTML = `<i class="fas fa-chart-area"></i> 销售趋势预测 (${modelName}模型)`;
    }
}

function updatePredictionSummary() {
    if (!predictionData || !Array.isArray(predictionData) || predictionData.length === 0) {
        document.getElementById('predicted-sales').textContent = '0';
        document.getElementById('predicted-revenue').textContent = '¥0';
        document.getElementById('growth-rate').textContent = '0';
        document.getElementById('accuracy').textContent = '0';
        return;
    }
    
    const totalSales = predictionData.reduce((sum, item) => sum + (item.predicted_sales || 0), 0);
    const totalRevenue = predictionData.reduce((sum, item) => sum + (item.predicted_revenue || 0), 0);
    
    // 计算增长率（与历史数据比较）
    const historicalSales = predictionData.filter(item => item.historical_sales).reduce((sum, item) => sum + item.historical_sales, 0);
    const growthRate = historicalSales > 0 ? ((totalSales - historicalSales) / historicalSales * 100) : 0;
    
    // 计算平均准确度
    const accuracies = predictionData.filter(item => item.accuracy !== undefined && item.accuracy > 0);
    const avgAccuracy = accuracies.length > 0 ? 
        accuracies.reduce((sum, item) => sum + item.accuracy, 0) / accuracies.length : 85;
    
    document.getElementById('predicted-sales').textContent = app.formatNumber(Math.round(totalSales));
    document.getElementById('predicted-revenue').textContent = app.formatCurrency(totalRevenue);
    document.getElementById('growth-rate').textContent = growthRate.toFixed(1);
    document.getElementById('accuracy').textContent = avgAccuracy.toFixed(1);
}

function renderPredictionChart() {
    const canvas = document.getElementById('prediction-chart');
    if (!canvas) return;
    
    // 检查数据有效性
    if (!predictionData || !Array.isArray(predictionData) || predictionData.length === 0) {
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // 销毁现有图表
    if (predictionChartInstances.prediction) {
        predictionChartInstances.prediction.destroy();
    }
    
    // 准备图表数据
    const labels = predictionData.map(item => app.formatDate(item.date));
    const predictedData = predictionData.map(item => item.predicted_sales || 0);
    const historicalData = predictionData.map(item => item.historical_sales || null);
    const upperBound = predictionData.map(item => item.upper_bound || 0);
    const lowerBound = predictionData.map(item => item.lower_bound || 0);
    
    // 根据当前选择的模型类型设置颜色
    const modelType = document.getElementById('model-select').value;
    const modelColors = {
        'linear': {
            main: 'rgb(34, 197, 94)',      // 绿色
            light: 'rgba(34, 197, 94, 0.1)'
        },
        'arima': {
            main: 'rgb(37, 99, 235)',       // 蓝色
            light: 'rgba(37, 99, 235, 0.1)'
        },
        'lstm': {
            main: 'rgb(147, 51, 234)',      // 紫色
            light: 'rgba(147, 51, 234, 0.1)'
        }
    };
    
    const currentColor = modelColors[modelType] || modelColors['arima'];
    
    // 创建新图表
    predictionChartInstances.prediction = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '历史销量',
                    data: historicalData,
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: 'rgb(34, 197, 94)',
                    pointBorderColor: 'white',
                    pointBorderWidth: 2,
                    spanGaps: false
                },
                {
                    label: `预测销量 (${getModelName(modelType)})`,
                    data: predictedData,
                    borderColor: currentColor.main,
                    backgroundColor: currentColor.light,
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1,
                    borderDash: [5, 5],
                    pointStyle: 'triangle',
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: currentColor.main,
                    pointBorderColor: 'white',
                    pointBorderWidth: 2,
                    spanGaps: false
                },
                {
                    label: '置信区间上限',
                    data: upperBound,
                    borderColor: 'rgba(156, 163, 175, 0.3)',
                    backgroundColor: 'rgba(156, 163, 175, 0.05)',
                    borderWidth: 1,
                    fill: '+1',
                    tension: 0.1,
                    pointRadius: 0,
                    borderDash: [2, 2],
                    spanGaps: false
                },
                {
                    label: '置信区间下限',
                    data: lowerBound,
                    borderColor: 'rgba(156, 163, 175, 0.3)',
                    backgroundColor: 'rgba(156, 163, 175, 0.05)',
                    borderWidth: 1,
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0,
                    borderDash: [2, 2],
                    spanGaps: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `销售预测趋势图 - ${modelType.toUpperCase()}模型`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        filter: function(item, chart) {
                            // 显示所有非空标签的图例项
                            return item.text && item.text.trim() !== '';
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        title: function(context) {
                            return '日期: ' + context[0].label;
                        },
                        label: function(context) {
                            const label = context.dataset.label || '';
                            if (label && context.parsed.y !== null) {
                                return label + ': ' + Math.round(context.parsed.y) + ' 件';
                            }
                            return '';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '销量 (件)',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '日期',
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            elements: {
                point: {
                    hoverBackgroundColor: 'white',
                    hoverBorderWidth: 2
                }
            }
        }
    });
}

function renderPredictionTable() {
    const tbody = document.getElementById('prediction-tbody');
    if (!tbody) return;
    
    // 检查数据有效性
    if (!predictionData || !Array.isArray(predictionData) || predictionData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">暂无预测数据</td></tr>';
        return;
    }
    
    const modelType = document.getElementById('model-select').value;
    const modelNames = {
        'linear': '线性回归',
        'arima': 'ARIMA',
        'lstm': 'LSTM神经网络'
    };
    
    tbody.innerHTML = predictionData.map((item, index) => {
        // 计算偏差
        let deviation = '-';
        let deviationClass = 'text-gray-500';
        if (item.historical_sales && item.predicted_sales) {
            const deviationValue = ((item.predicted_sales - item.historical_sales) / item.historical_sales * 100);
            deviation = deviationValue.toFixed(1) + '%';
            deviationClass = deviationValue > 0 ? 'text-green-600' : deviationValue < 0 ? 'text-red-600' : 'text-gray-500';
        }
        
        // 计算趋势
        let trend = '-';
        if (item.predicted_sales && item.historical_sales) {
            if (item.predicted_sales > item.historical_sales) {
                trend = '<i class="fas fa-arrow-up text-green-500"></i> 上升';
            } else if (item.predicted_sales < item.historical_sales) {
                trend = '<i class="fas fa-arrow-down text-red-500"></i> 下降';
            } else {
                trend = '<i class="fas fa-arrow-right text-gray-500"></i> 持平';
            }
        } else if (item.predicted_sales && !item.historical_sales) {
            trend = '<i class="fas fa-chart-line text-blue-500"></i> 预测';
        }
        
        // 行样式
        const rowClass = item.is_historical ? 'bg-blue-50' : '';
        
        return `
            <tr class="hover:bg-gray-50 ${rowClass}">
                <td class="px-4 py-2">
                    ${app.formatDate(item.date)}
                    ${item.is_historical ? '<span class="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">历史</span>' : ''}
                </td>
                <td class="px-4 py-2 font-medium ${item.predicted_sales ? 'text-blue-600' : 'text-gray-400'}">
                    ${item.predicted_sales ? Math.round(item.predicted_sales) : '-'}
                </td>
                <td class="px-4 py-2 text-gray-600">
                    ${item.lower_bound ? Math.round(item.lower_bound) : '-'}
                </td>
                <td class="px-4 py-2 text-gray-600">
                    ${item.upper_bound ? Math.round(item.upper_bound) : '-'}
                </td>
                <td class="px-4 py-2 font-medium ${item.historical_sales ? 'text-green-600' : 'text-gray-400'}">
                    ${item.historical_sales ? Math.round(item.historical_sales) : '-'}
                </td>
                <td class="px-4 py-2">
                    <div class="flex items-center gap-2">
                        <span class="${deviationClass} font-medium">${deviation}</span>
                        <span class="text-sm">${trend}</span>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // 更新表格标题以显示当前模型和数据统计
    const tableTitle = document.querySelector('.details-section h4');
    if (tableTitle && tableTitle.textContent.includes('预测详情')) {
        const historicalCount = predictionData.filter(item => item.historical_sales).length;
        const predictionCount = predictionData.filter(item => item.predicted_sales).length;
        tableTitle.innerHTML = `<i class="fas fa-list"></i> 预测详情 - ${modelNames[modelType] || '未知模型'} 
            <small class="text-gray-500">(历史: ${historicalCount}天, 预测: ${predictionCount}天)</small>`;
    }
}





// 辅助函数 - 获取模型名称
function getModelName(modelType) {
    const modelNames = {
        'linear': '线性回归',
        'arima': 'ARIMA',
        'lstm': 'LSTM神经网络'
    };
    return modelNames[modelType] || modelType.toUpperCase();
}

function onProductChange() {
    const productId = document.getElementById('product-select').value;
    if (productId) {
        loadProductPrediction(productId);
    }
}

function onPeriodChange() {
    const period = document.getElementById('period-select').value;
    const productId = document.getElementById('product-select').value;
    if (productId) {
        loadProductPrediction(productId, period);
    }
}

function onModelChange() {
    const model = document.getElementById('model-select').value;
    const productId = document.getElementById('product-select').value;
    const period = document.getElementById('period-select').value;
    if (productId) {
        loadProductPrediction(productId, period, model);
    }
}

function loadProductPrediction(productId, period = 30, model = 'arima') {
    app.showLoading();
    
    app.apiRequest(`/api/prediction/${productId}?days=${period}&model=${model}`, { method: 'GET' })
        .then(data => {
            if (data.success) {
                // 转换后端数据格式为前端需要的格式
                predictionData = transformPredictionData(data.data, period);
                updatePredictionSummary();
                renderPredictionChart();
                renderPredictionTable();
    
                
                // 更新模型信息显示
                updateModelInfo(data.data);
            } else {
                app.showNotification('加载产品预测失败: ' + (data.message || '未知错误'), 'error');
            }
        })
        .catch(error => {
            console.error('加载产品预测错误:', error);
            app.showNotification('网络连接错误', 'error');
        })
        .finally(() => {
            app.hideLoading();
        });
}

function generatePrediction() {
    const productId = document.getElementById('product-select').value;
    const period = document.getElementById('period-select').value;
    const model = document.getElementById('model-select').value;
    
    if (!productId) {
        app.showNotification('请先选择产品', 'warning');
        return;
    }
    
    app.showLoading();
    app.playVoice('正在生成销售预测');
    
    app.apiRequest('/api/prediction/generate', {
        method: 'POST',
        body: JSON.stringify({
            product_id: parseInt(productId),
            period: parseInt(period),
            model: model
        })
    })
    .then(data => {
        if (data.success) {
            app.showNotification('预测生成成功', 'success');
            app.playVoice('预测生成完成');
            // 重新加载预测数据
            loadProductPrediction(productId, period, model);
        } else {
            app.showNotification('预测生成失败: ' + (data.message || '未知错误'), 'error');
        }
    })
    .catch(error => {
        console.error('生成预测错误:', error);
        app.showNotification('网络连接错误', 'error');
    })
    .finally(() => {
        app.hideLoading();
    });
}

function refreshPrediction() {
    loadPredictionData();
    app.playVoice('预测数据已刷新');
}

function exportPrediction() {
    if (!predictionData || predictionData.length === 0) {
        app.showNotification('暂无数据可导出', 'warning');
        return;
    }
    
    // 生成CSV数据
    const csvData = generateCSVData();
    
    // 创建下载链接
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `销售预测报告_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    app.showNotification('预测报告已导出', 'success');
    app.playVoice('预测报告已导出');
}

function generateCSVData() {
    const headers = ['日期', '预测销量', '置信区间下限', '置信区间上限', '历史销量', '偏差'];
    const rows = predictionData.map(item => {
        const deviation = item.historical_sales ? 
            ((item.predicted_sales - item.historical_sales) / item.historical_sales * 100).toFixed(1) + '%' : '-';
        
        return [
            app.formatDate(item.date),
            Math.round(item.predicted_sales),
            Math.round(item.lower_bound),
            Math.round(item.upper_bound),
            item.historical_sales ? Math.round(item.historical_sales) : '-',
            deviation
        ];
    });
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function toggleChartType(type) {
    if (predictionChartInstances.prediction) {
            predictionChartInstances.prediction.config.type = type;
            predictionChartInstances.prediction.update();
        }
}



// 导出函数供全局使用
window.loadPredictionModule = loadPredictionModule;
window.generatePrediction = generatePrediction;
window.refreshPrediction = refreshPrediction;
window.exportPrediction = exportPrediction;
window.toggleChartType = toggleChartType;

console.log('销售预测模块已加载');