// 智能分析模块

let analysisData = {};
let currentAnalysisType = 'overview';
let analysisChartInstances = {};

// 加载智能分析模块
function loadAnalysisModule() {
    console.log('加载DEEPSEEK-R1智能分析模块');
    
    const moduleContent = document.getElementById('analysis-module');
    if (!moduleContent) return;
    
    // 渲染简化的模块界面，专注于DEEPSEEK-R1分析
    moduleContent.innerHTML = `
        <div class="module-header">
            <h3><i class="fas fa-robot"></i> DEEPSEEK-R1 智能分析</h3>
            <div class="module-actions">
                <button class="btn btn-primary" onclick="triggerDeepSeekAnalysis()">
                    <i class="fas fa-brain"></i> 开始AI分析
                </button>
                <button class="btn btn-secondary" onclick="refreshDeepSeekAnalysis()">
                    <i class="fas fa-sync-alt"></i> 刷新分析
                </button>
                <button class="btn btn-success" onclick="exportAnalysisReport()">
                    <i class="fas fa-download"></i> 导出报告
                </button>
            </div>
        </div>
        
        <div class="analysis-config">
            <div class="config-panel">
                <h4><i class="fas fa-cog"></i> 分析配置</h4>
                <div class="config-options">
                    <div class="config-item">
                        <label>分析类型:</label>
                        <select id="analysis-type" class="form-control">
                            <option value="comprehensive">综合分析</option>
                            <option value="inventory">库存专项</option>
                            <option value="sales">销售专项</option>
                            <option value="production">生产专项</option>
                        </select>
                    </div>
                    <div class="config-item">
                        <label>时间范围:</label>
                        <select id="time-range" class="form-control">
                            <option value="7">最近7天</option>
                            <option value="30" selected>最近30天</option>
                            <option value="60">最近60天</option>
                            <option value="90">最近90天</option>
                        </select>
                    </div>
                    <div class="config-item">
                        <label>关注领域:</label>
                        <div class="checkbox-group">
                            <label><input type="checkbox" value="inventory" checked> 库存管理</label>
                            <label><input type="checkbox" value="sales" checked> 销售分析</label>
                            <label><input type="checkbox" value="production" checked> 生产规划</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="analysis-content">
            <!-- DEEPSEEK-R1 分析结果 -->
            <div id="deepseek-results" class="analysis-results">
                <div class="loading-indicator" id="analysis-loading" style="display: none;">
                    <div class="spinner"></div>
                    <p>DEEPSEEK-R1 正在分析中，请稍候...</p>
                </div>
                
                <div class="results-grid" id="analysis-results-grid" style="display: none;">
                    <!-- AI分析报告 -->
                    <div class="result-card full-width">
                        <div class="card-header">
                            <h4><i class="fas fa-file-alt"></i> AI分析报告</h4>
                            <span class="analysis-timestamp" id="analysis-timestamp"></span>
                        </div>
                        <div class="card-body">
                            <div id="ai-report-content" class="ai-report">
                                <!-- AI报告内容将在这里显示 -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- 生产规划建议 -->
                    <div class="result-card">
                        <div class="card-header">
                            <h4><i class="fas fa-cogs"></i> 生产规划建议</h4>
                        </div>
                        <div class="card-body">
                            <div id="production-recommendations" class="recommendations-list">
                                <!-- 生产建议将在这里显示 -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- 企业行动建议 -->
                    <div class="result-card">
                        <div class="card-header">
                            <h4><i class="fas fa-lightbulb"></i> 企业行动建议</h4>
                        </div>
                        <div class="card-body">
                            <div id="business-recommendations" class="recommendations-list">
                                <!-- 企业行动建议将在这里显示 -->
                            </div>
                        </div>
                    </div>
                    

                    
                    <!-- 数据摘要 -->
                    <div class="result-card">
                        <div class="card-header">
                            <h4><i class="fas fa-chart-bar"></i> 数据摘要</h4>
                        </div>
                        <div class="card-body">
                            <div id="data-summary" class="data-summary">
                                <!-- 数据摘要将在这里显示 -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 原有的综合概览保留作为备用 -->
            <div id="overview-analysis" class="analysis-section" style="display: none;">
                <div class="overview-metrics">
                    <div class="metric-card">
                        <div class="metric-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="metric-content">
                            <h4>总营收</h4>
                            <span class="metric-value" id="total-revenue">¥0</span>
                            <span class="metric-change positive" id="revenue-change">+0%</span>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="metric-content">
                            <h4>销售增长</h4>
                            <span class="metric-value" id="sales-growth">0%</span>
                            <span class="metric-change" id="growth-trend">持平</span>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">
                            <i class="fas fa-warehouse"></i>
                        </div>
                        <div class="metric-content">
                            <h4>库存周转率</h4>
                            <span class="metric-value" id="inventory-turnover">0</span>
                            <span class="metric-change" id="turnover-trend">次/月</span>
                        </div>
                    </div>
                    
                    <div class="metric-card">
                        <div class="metric-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="metric-content">
                            <h4>生产效率</h4>
                            <span class="metric-value" id="production-efficiency">0%</span>
                            <span class="metric-change" id="efficiency-trend">标准</span>
                        </div>
                    </div>
                </div>
                
                <div class="overview-charts" style="display: flex; gap: 20px; margin-top: 20px;">
                    <div class="chart-section" style="flex: 1; max-width: 300px;">
                        <h4>业务趋势</h4>
                        <div style="height: 200px; width: 100%;">
                            <canvas id="business-trend-chart" style="max-height: 200px !important; width: 100% !important; height: 200px !important;"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-section" style="flex: 1; max-width: 300px;">
                        <h4>业务分布</h4>
                        <div style="height: 200px; width: 100%;">
                            <canvas id="business-distribution-chart" style="max-height: 200px !important; width: 100% !important; height: 200px !important;"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 销售分析 -->
            <div id="sales-analysis" class="analysis-section">
                <div class="sales-metrics">
                    <div class="metric-row">
                        <div class="metric-item">
                            <label>销售总额</label>
                            <span id="sales-total">¥0</span>
                        </div>
                        <div class="metric-item">
                            <label>订单数量</label>
                            <span id="order-count">0</span>
                        </div>
                        <div class="metric-item">
                            <label>平均订单价值</label>
                            <span id="avg-order-value">¥0</span>
                        </div>
                        <div class="metric-item">
                            <label>客户数量</label>
                            <span id="customer-count">0</span>
                        </div>
                    </div>
                </div>
                
                <div class="sales-charts">
                    <div class="chart-container">
                        <h4>销售趋势</h4>
                        <canvas id="sales-trend-chart" width="600" height="300"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <h4>产品销售排行</h4>
                        <canvas id="product-ranking-chart" width="600" height="300"></canvas>
                    </div>
                </div>
                
                <div class="sales-insights">
                    <h4>销售洞察</h4>
                    <div class="insights-list" id="sales-insights-list">
                        <!-- 洞察内容将通过JavaScript生成 -->
                    </div>
                </div>
            </div>
            
            <!-- 库存分析 -->
            <div id="inventory-analysis" class="analysis-section">
                <div class="inventory-metrics">
                    <div class="metric-row">
                        <div class="metric-item">
                            <label>总库存价值</label>
                            <span id="inventory-value">¥0</span>
                        </div>
                        <div class="metric-item">
                            <label>库存商品数</label>
                            <span id="inventory-items">0</span>
                        </div>
                        <div class="metric-item">
                            <label>缺货商品</label>
                            <span id="out-of-stock">0</span>
                        </div>
                        <div class="metric-item">
                            <label>滞销商品</label>
                            <span id="slow-moving">0</span>
                        </div>
                    </div>
                </div>
                
                <div class="inventory-charts">
                    <div class="chart-container">
                        <h4>库存分布</h4>
                        <canvas id="inventory-distribution-chart" width="600" height="300"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <h4>库存周转分析</h4>
                        <canvas id="inventory-turnover-chart" width="600" height="300"></canvas>
                    </div>
                </div>
                
                <div class="inventory-alerts">
                    <h4>库存预警</h4>
                    <div class="alerts-list" id="inventory-alerts-list">
                        <!-- 预警内容将通过JavaScript生成 -->
                    </div>
                </div>
            </div>
            
            <!-- 生产分析 -->
            <div id="production-analysis" class="analysis-section">
                <div class="production-metrics">
                    <div class="metric-row">
                        <div class="metric-item">
                            <label>生产计划数</label>
                            <span id="production-plans">0</span>
                        </div>
                        <div class="metric-item">
                            <label>完成率</label>
                            <span id="completion-rate">0%</span>
                        </div>
                        <div class="metric-item">
                            <label>平均周期</label>
                            <span id="avg-cycle-time">0天</span>
                        </div>
                        <div class="metric-item">
                            <label>设备利用率</label>
                            <span id="equipment-utilization">0%</span>
                        </div>
                    </div>
                </div>
                
                <div class="production-charts">
                    <div class="chart-container">
                        <h4>生产效率趋势</h4>
                        <canvas id="production-efficiency-chart" width="600" height="300"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <h4>产能利用分析</h4>
                        <canvas id="capacity-utilization-chart" width="600" height="300"></canvas>
                    </div>
                </div>
                
                <div class="production-recommendations">
                    <h4>生产建议</h4>
                    <div class="recommendations-list" id="production-recommendations-list">
                        <!-- 建议内容将通过JavaScript生成 -->
                    </div>
                </div>
            </div>
            
            <!-- 物流分析 -->
            <div id="logistics-analysis" class="analysis-section">
                <div class="logistics-metrics">
                    <div class="metric-row">
                        <div class="metric-item">
                            <label>任务总数</label>
                            <span id="logistics-tasks">0</span>
                        </div>
                        <div class="metric-item">
                            <label>完成率</label>
                            <span id="logistics-completion">0%</span>
                        </div>
                        <div class="metric-item">
                            <label>平均时长</label>
                            <span id="avg-task-duration">0分钟</span>
                        </div>
                        <div class="metric-item">
                            <label>机器人利用率</label>
                            <span id="robot-utilization">0%</span>
                        </div>
                    </div>
                </div>
                
                <div class="logistics-charts">
                    <div class="chart-container">
                        <h4>物流效率趋势</h4>
                        <canvas id="logistics-efficiency-chart" width="600" height="300"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <h4>任务类型分布</h4>
                        <canvas id="task-type-distribution-chart" width="600" height="300"></canvas>
                    </div>
                </div>
                
                <div class="logistics-optimization">
                    <h4>优化建议</h4>
                    <div class="optimization-list" id="logistics-optimization-list">
                        <!-- 优化建议将通过JavaScript生成 -->
                    </div>
                </div>
            </div>
            
            <!-- AI洞察 -->
            <div id="ai-insights-analysis" class="analysis-section">
                <div class="ai-summary">
                    <h4><i class="fas fa-robot"></i> AI智能分析报告</h4>
                    <div class="ai-report" id="ai-report">
                        <div class="loading-ai">
                            <i class="fas fa-spinner fa-spin"></i>
                            <span>AI正在分析数据...</span>
                        </div>
                    </div>
                </div>
                
                <div class="ai-recommendations">
                    <h4><i class="fas fa-lightbulb"></i> 智能建议</h4>
                    <div class="recommendations-grid" id="ai-recommendations-grid">
                        <!-- AI建议将通过JavaScript生成 -->
                    </div>
                </div>
                
                <div class="ai-predictions">
                    <h4><i class="fas fa-crystal-ball"></i> 预测分析</h4>
                    <div class="predictions-container">
                        <div class="prediction-item">
                            <h5>销售预测</h5>
                            <canvas id="sales-prediction-chart" width="400" height="200"></canvas>
                        </div>
                        
                        <div class="prediction-item">
                            <h5>库存预测</h5>
                            <canvas id="inventory-prediction-chart" width="400" height="200"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加样式
    addAnalysisStyles();
    
    // 加载DEEPSEEK分析数据
    loadDefaultDeepSeekAnalysis();
    
    // 设置事件监听器
    setupAnalysisEventListeners();
}

function addAnalysisStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .analysis-config {
            background: white;
            border-radius: var(--border-radius);
            padding: 20px;
            margin-bottom: 25px;
            box-shadow: var(--shadow);
        }
        
        .config-panel h4 {
            margin: 0 0 15px 0;
            color: var(--primary-color);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .config-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .config-item label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: var(--text-color);
        }
        
        .config-item select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            background: white;
        }
        
        .checkbox-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .checkbox-group label {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 0;
            cursor: pointer;
        }
        
        .checkbox-group input[type="checkbox"] {
            margin: 0;
        }
        
        .analysis-results {
            min-height: 400px;
        }
        
        .loading-indicator {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 15px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .results-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
        }
        
        .result-card {
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            overflow: hidden;
        }
        
        .result-card.full-width {
            grid-column: 1 / -1;
        }
        
        .result-card .card-header {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .result-card .card-header h4 {
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .analysis-timestamp {
            font-size: 0.85em;
            opacity: 0.9;
        }
        
        .result-card .card-body {
            padding: 20px;
        }
        
        .ai-report {
            line-height: 1.6;
            color: var(--text-color);
        }
        
        .ai-report p {
            margin-bottom: 15px;
        }
        
        .ai-report strong {
            color: var(--primary-color);
        }
        
        .recommendations-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .recommendation-item {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 12px;
            background: var(--light-color);
            border-radius: var(--border-radius);
            border-left: 4px solid var(--primary-color);
        }
        
        .recommendation-item i {
            color: var(--primary-color);
            margin-top: 2px;
        }
        
        .insights-content {
            line-height: 1.6;
            color: var(--text-color);
        }
        
        .insights-text {
            padding: 15px;
            background: var(--light-color);
            border-radius: var(--border-radius);
            border-left: 4px solid var(--secondary-color);
        }
        
        .data-summary {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .summary-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            background: var(--light-color);
            border-radius: var(--border-radius);
        }
        
        .summary-label {
            font-weight: 500;
            color: var(--text-color);
        }
        
        .summary-value {
            font-weight: 600;
            color: var(--primary-color);
        }
        
        .summary-text {
            padding: 15px;
            background: var(--light-color);
            border-radius: var(--border-radius);
            line-height: 1.6;
        }
        
        /* 增强的AI报告样式 */
        .formatted-analysis-content {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            border: 1px solid #dee2e6;
        }
        
        .analysis-report-title {
            color: #2c3e50;
            font-size: 1.8rem;
            font-weight: 700;
            margin-bottom: 20px;
            text-align: center;
            border-bottom: 3px solid var(--primary-color);
            padding-bottom: 10px;
        }
        
        .analysis-main-title {
            color: #34495e;
            font-size: 1.4rem;
            font-weight: 600;
            margin: 25px 0 15px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .analysis-main-title i {
            color: var(--primary-color);
        }
        
        .analysis-section-title {
            color: #495057;
            font-size: 1.2rem;
            font-weight: 500;
            margin: 20px 0 10px 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .analysis-section-title i {
            color: var(--info-color);
        }
        
        .analysis-paragraph {
            margin-bottom: 15px;
            line-height: 1.7;
            color: #495057;
        }
        
        .highlight-keyword {
            background: linear-gradient(120deg, #a8e6cf 0%, #dcedc8 100%);
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            color: #2e7d32;
        }
        
        .highlight-action {
            background: linear-gradient(120deg, #ffcdd2 0%, #f8bbd9 100%);
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            color: #c62828;
        }
        
        .highlight-percentage {
            background: linear-gradient(120deg, #fff3e0 0%, #ffe0b2 100%);
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 700;
            color: #ef6c00;
        }
        
        .highlight-money {
            background: linear-gradient(120deg, #e8f5e8 0%, #c8e6c9 100%);
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 700;
            color: #2e7d32;
        }
        
        .highlight-number {
            background: linear-gradient(120deg, #e3f2fd 0%, #bbdefb 100%);
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 600;
            color: #1565c0;
        }
        
        .analysis-list-item {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin: 8px 0;
            padding: 10px 15px;
            background: rgba(255,255,255,0.7);
            border-radius: 8px;
            border-left: 3px solid var(--info-color);
        }
        
        .analysis-list-item i {
            color: var(--info-color);
            margin-top: 2px;
            font-size: 0.9rem;
        }
        
        .analysis-numbered-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin: 10px 0;
            padding: 12px 18px;
            background: rgba(255,255,255,0.8);
            border-radius: 8px;
            border-left: 4px solid var(--primary-color);
        }
        
        .item-number {
            background: var(--primary-color);
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9rem;
            font-weight: 600;
            flex-shrink: 0;
        }
        
        .analysis-warning {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .analysis-warning i {
            color: #856404;
            font-size: 1.2rem;
        }
        
        .analysis-suggestion {
            background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .analysis-suggestion i {
            color: #0c5460;
            font-size: 1.2rem;
        }
        
        .analysis-bold {
            color: var(--primary-color);
            font-weight: 700;
        }
        
        .analysis-italic {
            color: var(--secondary-color);
            font-style: italic;
        }
        
        .no-analysis {
            text-align: center;
            padding: 40px 20px;
            color: var(--secondary-color);
            background: #f8f9fa;
            border-radius: 8px;
            border: 2px dashed #dee2e6;
        }
        
        .no-analysis i {
            font-size: 2rem;
            margin-bottom: 10px;
            display: block;
        }
        
        /* 增强的建议样式 */
        .recommendations-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin: 20px 0;
        }
        
        .recommendation-item.enhanced {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 18px;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            border-radius: 12px;
            border: 1px solid #e9ecef;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        
        .recommendation-item.enhanced::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 4px;
            background: var(--primary-color);
            transition: width 0.3s ease;
        }
        
        .recommendation-item.enhanced:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.12);
        }
        
        .recommendation-item.enhanced:hover::before {
            width: 8px;
        }
        
        .recommendation-item.priority-3::before {
            background: #dc3545;
        }
        
        .recommendation-item.priority-2::before {
            background: #fd7e14;
        }
        
        .recommendation-item.priority-1::before {
            background: #20c997;
        }
        
        .rec-icon {
            flex-shrink: 0;
            width: 45px;
            height: 45px;
            background: linear-gradient(135deg, var(--primary-color) 0%, #4c6ef5 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2rem;
        }
        
        .rec-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .rec-text {
            font-size: 1rem;
            line-height: 1.5;
            color: #495057;
            font-weight: 500;
        }
        
        .rec-meta {
            display: flex;
            gap: 15px;
            font-size: 0.85rem;
        }
        
        .rec-type {
            background: #e9ecef;
            color: #495057;
            padding: 4px 8px;
            border-radius: 6px;
            font-weight: 500;
        }
        
        .rec-priority {
            color: var(--secondary-color);
            font-weight: 500;
        }
        
        .rec-action {
            flex-shrink: 0;
            color: var(--secondary-color);
            font-size: 1.1rem;
            transition: all 0.3s ease;
        }
        
        .recommendation-item.enhanced:hover .rec-action {
            color: var(--primary-color);
            transform: translateX(3px);
        }
        
        .keyword-action {
            background: linear-gradient(120deg, #ffebee 0%, #f3e5f5 100%);
            padding: 1px 4px;
            border-radius: 3px;
            font-weight: 600;
            color: #ad1457;
        }
        
        .keyword-number {
            background: linear-gradient(120deg, #e8f5e8 0%, #f1f8e9 100%);
            padding: 1px 4px;
            border-radius: 3px;
            font-weight: 700;
            color: #2e7d32;
        }
        
        .keyword-domain {
            background: linear-gradient(120deg, #e3f2fd 0%, #e8eaf6 100%);
            padding: 1px 4px;
            border-radius: 3px;
            font-weight: 600;
            color: #1565c0;
        }
        
        .no-recommendations {
            text-align: center;
            padding: 30px 20px;
            color: var(--secondary-color);
            background: #f8f9fa;
            border-radius: 8px;
            border: 2px dashed #dee2e6;
        }
        
        .no-recommendations i {
            font-size: 1.5rem;
            margin-bottom: 8px;
            display: block;
        }
        
        .analysis-tabs {
            display: flex;
            gap: 5px;
            margin-bottom: 25px;
            border-bottom: 2px solid var(--border-color);
        }
        
        .tab-btn {
            padding: 12px 20px;
            border: none;
            background: transparent;
            color: var(--secondary-color);
            cursor: pointer;
            border-radius: var(--border-radius) var(--border-radius) 0 0;
            transition: var(--transition);
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
        }
        
        .tab-btn:hover {
            background: var(--light-color);
            color: var(--primary-color);
        }
        
        .tab-btn.active {
            background: var(--primary-color);
            color: white;
        }
        
        .analysis-section {
            display: none;
        }
        
        .analysis-section.active {
            display: block;
        }
        
        .overview-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
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
        
        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }
        
        .metric-icon {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
        }
        
        .metric-content h4 {
            font-size: 0.9rem;
            color: var(--secondary-color);
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .metric-value {
            font-size: 2rem;
            font-weight: 700;
            color: var(--dark-color);
            display: block;
            margin-bottom: 5px;
        }
        
        .metric-change {
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .metric-change.positive {
            color: var(--success-color);
        }
        
        .metric-change.negative {
            color: var(--danger-color);
        }
        
        .overview-charts {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
        }
        
        .chart-section,
        .chart-container {
            background: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
        }
        
        .chart-section h4,
        .chart-container h4 {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--dark-color);
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .metric-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
            padding: 20px;
            background: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
        }
        
        .metric-item {
            text-align: center;
            padding: 15px;
            border-radius: var(--border-radius);
            background: var(--light-color);
        }
        
        .metric-item label {
            display: block;
            font-size: 0.9rem;
            color: var(--secondary-color);
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .metric-item span {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary-color);
        }
        
        .sales-charts,
        .inventory-charts,
        .production-charts,
        .logistics-charts {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
            margin-bottom: 25px;
        }
        
        .insights-list,
        .alerts-list,
        .recommendations-list,
        .optimization-list {
            background: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
        }
        
        .insight-item,
        .alert-item,
        .recommendation-item,
        .optimization-item {
            padding: 15px;
            border-left: 4px solid var(--primary-color);
            background: var(--light-color);
            margin-bottom: 15px;
            border-radius: 0 var(--border-radius) var(--border-radius) 0;
        }
        
        .alert-item {
            border-left-color: var(--warning-color);
        }
        
        .recommendation-item {
            border-left-color: var(--success-color);
        }
        
        .optimization-item {
            border-left-color: var(--info-color);
        }
        
        .insight-item h5,
        .alert-item h5,
        .recommendation-item h5,
        .optimization-item h5 {
            font-size: 1rem;
            font-weight: 600;
            color: var(--dark-color);
            margin-bottom: 8px;
        }
        
        .insight-item p,
        .alert-item p,
        .recommendation-item p,
        .optimization-item p {
            font-size: 0.9rem;
            color: var(--secondary-color);
            margin: 0;
            line-height: 1.5;
        }
        
        .ai-summary {
            background: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
            margin-bottom: 25px;
        }
        
        .ai-summary h4 {
            font-size: 1.3rem;
            font-weight: 600;
            color: var(--dark-color);
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .ai-report {
            background: var(--light-color);
            border-radius: var(--border-radius);
            padding: 20px;
            min-height: 200px;
            font-size: 0.95rem;
            line-height: 1.6;
            color: var(--dark-color);
        }
        
        .loading-ai {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            color: var(--primary-color);
            font-weight: 500;
        }
        
        .ai-recommendations {
            background: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
            margin-bottom: 25px;
        }
        
        .ai-recommendations h4 {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--dark-color);
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .recommendations-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .recommendation-card {
            background: var(--light-color);
            border-radius: var(--border-radius);
            padding: 20px;
            border: 1px solid var(--border-color);
            transition: var(--transition);
        }
        
        .recommendation-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow);
        }
        
        .recommendation-card h5 {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--primary-color);
            margin-bottom: 10px;
        }
        
        .recommendation-card p {
            font-size: 0.9rem;
            color: var(--secondary-color);
            margin: 0;
            line-height: 1.5;
        }
        
        .ai-predictions {
            background: white;
            border-radius: var(--border-radius);
            padding: 25px;
            box-shadow: var(--shadow);
        }
        
        .ai-predictions h4 {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--dark-color);
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .predictions-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
        }
        
        .prediction-item {
            background: var(--light-color);
            border-radius: var(--border-radius);
            padding: 20px;
        }
        
        .prediction-item h5 {
            font-size: 1rem;
            font-weight: 600;
            color: var(--dark-color);
            margin-bottom: 15px;
            text-align: center;
        }
        
        @media (max-width: 768px) {
            .overview-charts,
            .sales-charts,
            .inventory-charts,
            .production-charts,
            .logistics-charts,
            .predictions-container {
                grid-template-columns: 1fr;
            }
            
            .analysis-tabs {
                flex-wrap: wrap;
            }
            
            .tab-btn {
                flex: 1;
                min-width: 120px;
            }
        }
    `;
    document.head.appendChild(style);
}

function setupAnalysisEventListeners() {
    // 这里可以添加其他事件监听器
}

function loadAnalysisData() {
    app.showLoading();
    
    // 加载综合分析数据
    app.apiRequest('/api/analysis/overview', { method: 'GET' })
        .then(data => {
            if (data.success) {
                analysisData.overview = data.data;
                updateOverviewMetrics();
                renderOverviewCharts();
            }
        })
        .catch(error => {
            console.error('加载概览数据错误:', error);
        });
    
    // 加载AI分析
    loadAIAnalysis();
    
    // 根据当前选中的标签加载对应数据
    loadCurrentAnalysisData();
    
    app.hideLoading();
    app.playVoice('智能分析数据已更新');
}

function loadCurrentAnalysisData() {
    switch(currentAnalysisType) {
        case 'sales':
            loadSalesAnalysis();
            break;
        case 'inventory':
            loadInventoryAnalysis();
            break;
        case 'production':
            loadProductionAnalysis();
            break;
        case 'logistics':
            loadLogisticsAnalysis();
            break;
    }
}

function updateOverviewMetrics() {
    if (!analysisData.overview) return;
    
    const data = analysisData.overview;
    
    document.getElementById('total-revenue').textContent = `¥${data.total_revenue || 0}`;
    document.getElementById('sales-growth').textContent = `${data.sales_growth || 0}%`;
    document.getElementById('inventory-turnover').textContent = data.inventory_turnover || 0;
    document.getElementById('production-efficiency').textContent = `${data.production_efficiency || 0}%`;
    
    // 更新变化趋势
    const revenueChange = document.getElementById('revenue-change');
    if (revenueChange) {
        const change = data.revenue_change || 0;
        revenueChange.textContent = `${change > 0 ? '+' : ''}${change}%`;
        revenueChange.className = `metric-change ${change >= 0 ? 'positive' : 'negative'}`;
    }
    
    const growthTrend = document.getElementById('growth-trend');
    if (growthTrend) {
        const growth = data.sales_growth || 0;
        growthTrend.textContent = growth > 5 ? '上升' : growth < -5 ? '下降' : '持平';
    }
    
    const turnoverTrend = document.getElementById('turnover-trend');
    if (turnoverTrend) {
        turnoverTrend.textContent = '次/月';
    }
    
    const efficiencyTrend = document.getElementById('efficiency-trend');
    if (efficiencyTrend) {
        const efficiency = data.production_efficiency || 0;
        efficiencyTrend.textContent = efficiency > 80 ? '优秀' : efficiency > 60 ? '良好' : '需改进';
    }
}

function renderOverviewCharts() {
    renderBusinessTrendChart();
    renderBusinessDistributionChart();
}

function renderBusinessTrendChart() {
    const canvas = document.getElementById('business-trend-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 销毁现有图表
    if (analysisChartInstances.businessTrend) {
        analysisChartInstances.businessTrend.destroy();
    }
    
    const trendData = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [
            {
                label: '销售额',
                data: [120000, 135000, 128000, 145000, 152000, 168000],
                borderColor: 'rgb(37, 99, 235)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: '利润',
                data: [24000, 27000, 25600, 29000, 30400, 33600],
                borderColor: 'rgb(5, 150, 105)',
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };
    
    analysisChartInstances.businessTrend = new Chart(ctx, {
        type: 'line',
        data: trendData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '金额 (¥)'
                    }
                }
            }
        }
    });
}

function renderBusinessDistributionChart() {
    const canvas = document.getElementById('business-distribution-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 销毁现有图表
    if (analysisChartInstances.businessDistribution) {
        analysisChartInstances.businessDistribution.destroy();
    }
    
    const distributionData = {
        labels: ['产品A', '产品B', '产品C', '产品D', '其他'],
        datasets: [{
            data: [35, 25, 20, 15, 5],
            backgroundColor: [
                'rgba(37, 99, 235, 0.8)',
                'rgba(5, 150, 105, 0.8)',
                'rgba(217, 119, 6, 0.8)',
                'rgba(220, 38, 38, 0.8)',
                'rgba(139, 92, 246, 0.8)'
            ],
            borderWidth: 0
        }]
    };
    
    analysisChartInstances.businessDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: distributionData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function loadSalesAnalysis() {
    app.apiRequest('/api/analysis/sales', { method: 'GET' })
        .then(data => {
            if (data.success) {
                analysisData.sales = data.data;
                updateSalesMetrics();
                renderSalesCharts();
                renderSalesInsights();
            }
        })
        .catch(error => {
            console.error('加载销售分析错误:', error);
        });
}

function updateSalesMetrics() {
    if (!analysisData.sales) return;
    
    const data = analysisData.sales;
    
    document.getElementById('sales-total').textContent = `¥${data.total || 0}`;
    document.getElementById('order-count').textContent = data.orders || 0;
    document.getElementById('avg-order-value').textContent = `¥${data.avg_value || 0}`;
    document.getElementById('customer-count').textContent = data.customers || 0;
}

function renderSalesCharts() {
    // 销售趋势图
    const trendCanvas = document.getElementById('sales-trend-chart');
    if (trendCanvas) {
        const ctx = trendCanvas.getContext('2d');
        
        if (analysisChartInstances.salesTrend) {
        analysisChartInstances.salesTrend.destroy();
    }
    
    analysisChartInstances.salesTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                datasets: [{
                    label: '销售额',
                    data: [120000, 135000, 128000, 145000, 152000, 168000],
                    borderColor: 'rgb(37, 99, 235)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // 产品排行图
    const rankingCanvas = document.getElementById('product-ranking-chart');
    if (rankingCanvas) {
        const ctx = rankingCanvas.getContext('2d');
        
        if (analysisChartInstances.productRanking) {
        analysisChartInstances.productRanking.destroy();
    }
    
    analysisChartInstances.productRanking = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['产品A', '产品B', '产品C', '产品D', '产品E'],
                datasets: [{
                    label: '销售额',
                    data: [58000, 45000, 38000, 32000, 25000],
                    backgroundColor: 'rgba(37, 99, 235, 0.8)',
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function renderSalesInsights() {
    const insightsList = document.getElementById('sales-insights-list');
    if (!insightsList) return;
    
    const insights = [
        {
            title: '销售增长趋势',
            content: '本月销售额较上月增长12.5%，主要由产品A和产品B的销量提升驱动。'
        },
        {
            title: '客户行为分析',
            content: '新客户占比35%，老客户复购率达到68%，客户忠诚度较高。'
        },
        {
            title: '季节性特征',
            content: '产品销售呈现明显的季节性特征，建议提前备货应对旺季需求。'
        }
    ];
    
    insightsList.innerHTML = insights.map(insight => `
        <div class="insight-item">
            <h5>${insight.title}</h5>
            <p>${insight.content}</p>
        </div>
    `).join('');
}

function loadInventoryAnalysis() {
    app.apiRequest('/api/analysis/inventory', { method: 'GET' })
        .then(data => {
            if (data.success) {
                analysisData.inventory = data.data;
                updateInventoryMetrics();
                renderInventoryCharts();
                renderInventoryAlerts();
            }
        })
        .catch(error => {
            console.error('加载库存分析错误:', error);
        });
}

function updateInventoryMetrics() {
    if (!analysisData.inventory) return;
    
    const data = analysisData.inventory;
    
    // 使用正确的数据结构获取库存价值
    const inventoryValue = data.value_analysis?.total_inventory_value || data.inventory_summary?.total_value || data.value || 0;
    const inventoryItems = data.inventory_summary?.total_products || data.items || 0;
    const outOfStock = data.inventory_summary?.out_of_stock_items || data.alert_statistics?.alert_types?.find(alert => alert.type === '零库存')?.count || data.out_of_stock || 0;
    const slowMoving = data.inventory_summary?.overstock_items || data.slow_moving || 0;
    
    document.getElementById('inventory-value').textContent = `¥${inventoryValue.toLocaleString()}`;
    document.getElementById('inventory-items').textContent = inventoryItems;
    document.getElementById('out-of-stock').textContent = outOfStock;
    document.getElementById('slow-moving').textContent = slowMoving;
}

function renderInventoryCharts() {
    // 库存分布图
    const distributionCanvas = document.getElementById('inventory-distribution-chart');
    if (distributionCanvas) {
        const ctx = distributionCanvas.getContext('2d');
        
        if (analysisChartInstances.inventoryDistribution) {
        analysisChartInstances.inventoryDistribution.destroy();
    }
    
    analysisChartInstances.inventoryDistribution = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['原材料', '半成品', '成品', '包装材料'],
                datasets: [{
                    data: [40, 25, 30, 5],
                    backgroundColor: [
                        'rgba(37, 99, 235, 0.8)',
                        'rgba(5, 150, 105, 0.8)',
                        'rgba(217, 119, 6, 0.8)',
                        'rgba(220, 38, 38, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // 库存周转图
    const turnoverCanvas = document.getElementById('inventory-turnover-chart');
    if (turnoverCanvas) {
        const ctx = turnoverCanvas.getContext('2d');
        
        if (analysisChartInstances.inventoryTurnover) {
        analysisChartInstances.inventoryTurnover.destroy();
    }
    
    analysisChartInstances.inventoryTurnover = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['产品A', '产品B', '产品C', '产品D', '产品E'],
                datasets: [{
                    label: '周转率',
                    data: [8.5, 6.2, 4.8, 3.1, 2.3],
                    backgroundColor: 'rgba(5, 150, 105, 0.8)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '周转率 (次/月)'
                        }
                    }
                }
            }
        });
    }
}

function renderInventoryAlerts() {
    const alertsList = document.getElementById('inventory-alerts-list');
    if (!alertsList) return;
    
    const alerts = [
        {
            title: '库存不足预警',
            content: '产品A库存仅剩15件，建议及时补货以避免缺货。'
        },
        {
            title: '滞销商品提醒',
            content: '产品E已连续30天无销售记录，建议考虑促销或调整策略。'
        },
        {
            title: '库存过剩警告',
            content: '产品C库存量超过安全库存上限，占用资金较多。'
        }
    ];
    
    alertsList.innerHTML = alerts.map(alert => `
        <div class="alert-item">
            <h5>${alert.title}</h5>
            <p>${alert.content}</p>
        </div>
    `).join('');
}

function loadProductionAnalysis() {
    app.apiRequest('/api/analysis/production', { method: 'GET' })
        .then(data => {
            if (data.success) {
                analysisData.production = data.data;
                updateProductionMetrics();
                renderProductionCharts();
                renderProductionRecommendations();
            }
        })
        .catch(error => {
            console.error('加载生产分析错误:', error);
        });
}

function updateProductionMetrics() {
    if (!analysisData.production) return;
    
    const data = analysisData.production;
    
    document.getElementById('production-plans').textContent = data.plans || 0;
    document.getElementById('completion-rate').textContent = `${data.completion_rate || 0}%`;
    document.getElementById('avg-cycle-time').textContent = `${data.avg_cycle_time || 0}天`;
    document.getElementById('equipment-utilization').textContent = `${data.equipment_utilization || 0}%`;
}

function renderProductionCharts() {
    // 生产效率趋势图
    const efficiencyCanvas = document.getElementById('production-efficiency-chart');
    if (efficiencyCanvas) {
        const ctx = efficiencyCanvas.getContext('2d');
        
        if (analysisChartInstances.productionEfficiency) {
        analysisChartInstances.productionEfficiency.destroy();
    }
    
    analysisChartInstances.productionEfficiency = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                datasets: [{
                    label: '生产效率 (%)',
                    data: [85, 92, 88, 95, 90, 87, 93],
                    borderColor: 'rgb(217, 119, 6)',
                    backgroundColor: 'rgba(217, 119, 6, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    // 产能利用分析图
    const capacityCanvas = document.getElementById('capacity-utilization-chart');
    if (capacityCanvas) {
        const ctx = capacityCanvas.getContext('2d');
        
        if (analysisChartInstances.capacityUtilization) {
        analysisChartInstances.capacityUtilization.destroy();
    }
    
    analysisChartInstances.capacityUtilization = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['已使用', '空闲'],
                datasets: [{
                    data: [75, 25],
                    backgroundColor: [
                        'rgba(217, 119, 6, 0.8)',
                        'rgba(229, 231, 235, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

function renderProductionRecommendations() {
    const recommendationsList = document.getElementById('production-recommendations-list');
    if (!recommendationsList) return;
    
    const recommendations = [
        {
            title: '设备维护建议',
            content: '设备A已连续运行180小时，建议安排预防性维护以确保生产稳定。'
        },
        {
            title: '生产计划优化',
            content: '建议调整生产排程，将高优先级订单安排在效率最高的时段。'
        },
        {
            title: '人员配置建议',
            content: '夜班人员配置不足，建议增加1-2名操作员以提高夜班生产效率。'
        }
    ];
    
    recommendationsList.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item">
            <h5>${rec.title}</h5>
            <p>${rec.content}</p>
        </div>
    `).join('');
}

function loadLogisticsAnalysis() {
    app.apiRequest('/api/analysis/logistics', { method: 'GET' })
        .then(data => {
            if (data.success) {
                analysisData.logistics = data.data;
                updateLogisticsMetrics();
                renderLogisticsCharts();
                renderLogisticsOptimization();
            }
        })
        .catch(error => {
            console.error('加载物流分析错误:', error);
        });
}

function updateLogisticsMetrics() {
    if (!analysisData.logistics) return;
    
    const data = analysisData.logistics;
    
    document.getElementById('logistics-tasks').textContent = data.tasks || 0;
    document.getElementById('logistics-completion').textContent = `${data.completion_rate || 0}%`;
    document.getElementById('avg-task-duration').textContent = `${data.avg_duration || 0}分钟`;
    document.getElementById('robot-utilization').textContent = `${data.robot_utilization || 0}%`;
}

function renderLogisticsCharts() {
    // 物流效率趋势图
    const efficiencyCanvas = document.getElementById('logistics-efficiency-chart');
    if (efficiencyCanvas) {
        const ctx = efficiencyCanvas.getContext('2d');
        
        if (analysisChartInstances.logisticsEfficiency) {
        analysisChartInstances.logisticsEfficiency.destroy();
    }
    
    analysisChartInstances.logisticsEfficiency = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                datasets: [{
                    label: '任务完成率 (%)',
                    data: [95, 88, 92, 96, 89, 94, 91],
                    borderColor: 'rgb(8, 145, 178)',
                    backgroundColor: 'rgba(8, 145, 178, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    // 任务类型分布图
    const typeCanvas = document.getElementById('task-type-distribution-chart');
    if (typeCanvas) {
        const ctx = typeCanvas.getContext('2d');
        
        if (analysisChartInstances.taskTypeDistribution) {
        analysisChartInstances.taskTypeDistribution.destroy();
    }
    
    analysisChartInstances.taskTypeDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['取货', '送货', '盘点', '维护'],
                datasets: [{
                    data: [40, 35, 15, 10],
                    backgroundColor: [
                        'rgba(37, 99, 235, 0.8)',
                        'rgba(5, 150, 105, 0.8)',
                        'rgba(217, 119, 6, 0.8)',
                        'rgba(220, 38, 38, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

function renderLogisticsOptimization() {
    const optimizationList = document.getElementById('logistics-optimization-list');
    if (!optimizationList) return;
    
    const optimizations = [
        {
            title: '路径优化建议',
            content: '通过优化取货路径，预计可减少15%的运输时间和能耗。'
        },
        {
            title: '任务调度优化',
            content: '建议在高峰期增加并行任务处理，提高机器人利用率。'
        },
        {
            title: '充电策略优化',
            content: '建议在低峰期进行充电，避免影响高峰期的任务执行。'
        }
    ];
    
    optimizationList.innerHTML = optimizations.map(opt => `
        <div class="optimization-item">
            <h5>${opt.title}</h5>
            <p>${opt.content}</p>
        </div>
    `).join('');
}

// DEEPSEEK-R1 分析相关函数
function triggerDeepSeekAnalysis() {
    const analysisType = document.getElementById('analysis-type').value;
    const timeRange = document.getElementById('time-range').value;
    const focusAreas = Array.from(document.querySelectorAll('.checkbox-group input:checked')).map(cb => cb.value);
    
    if (focusAreas.length === 0) {
        app.showNotification('请至少选择一个关注领域', 'warning');
        return;
    }
    
    // 显示加载状态
    document.getElementById('analysis-loading').style.display = 'block';
    document.getElementById('analysis-results-grid').style.display = 'none';
    
    const requestData = {
        analysis_type: analysisType,
        time_range: parseInt(timeRange),
        focus_areas: focusAreas
    };
    
    app.apiRequest('/api/analysis/deepseek-analysis', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(data => {
        if (data.success) {
            // 检查是否是备用响应
            if (data.fallback) {
                app.showNotification('DEEPSEEK分析服务暂时不可用，已显示备用信息', 'warning');
                app.playVoice('DEEPSEEK分析服务暂时不可用');
            } else {
                app.showNotification('DEEPSEEK-R1 分析完成', 'success');
                app.playVoice('AI分析已完成');
            }
            displayDeepSeekResults(data.data);
        } else {
            throw new Error(data.message || '分析失败');
        }
    })
    .catch(error => {
        console.error('DEEPSEEK分析错误:', error);
        app.showNotification('网络连接失败，请检查服务器状态', 'error');
        app.playVoice('请求超时');
        document.getElementById('analysis-loading').style.display = 'none';
    });
}

function refreshDeepSeekAnalysis() {
    // 自动加载默认分析
    loadDefaultDeepSeekAnalysis();
}

function loadDefaultDeepSeekAnalysis() {
    // 显示加载状态
    const loadingElement = document.getElementById('analysis-loading');
    const resultsElement = document.getElementById('analysis-results-grid');
    
    if (loadingElement) loadingElement.style.display = 'block';
    if (resultsElement) resultsElement.style.display = 'none';
    
    app.apiRequest('/api/analysis/ai-insights', { method: 'GET' })
        .then(data => {
            if (data && data.success) {
                // 检查是否是备用响应
                if (data.fallback) {
                    app.showNotification('AI分析服务暂时不可用，已显示备用信息', 'warning');
                    app.playVoice('AI分析服务暂时不可用');
                }
                displayDeepSeekResults(data.data);
            } else {
                throw new Error(data ? data.message || '加载失败' : '响应数据为空');
            }
        })
        .catch(error => {
            console.error('加载AI分析错误:', error);
            app.showNotification('AI分析加载失败，请稍后重试', 'error');
            app.playVoice('加载分析数据失败');
            if (loadingElement) loadingElement.style.display = 'none';
        });
}

function displayDeepSeekResults(data) {
    // 隐藏加载状态
    const loadingElement = document.getElementById('analysis-loading');
    const resultsElement = document.getElementById('analysis-results-grid');
    
    if (loadingElement) loadingElement.style.display = 'none';
    if (resultsElement) resultsElement.style.display = 'block';
    
    // 检查数据是否存在
    if (!data) {
        console.error('显示结果失败：数据为空');
        return;
    }
    
    // 更新时间戳
    const timestamp = document.getElementById('analysis-timestamp');
    if (timestamp) {
        timestamp.textContent = `生成时间: ${new Date().toLocaleString('zh-CN')}`;
    }
    
    // 显示AI报告
    const reportContent = document.getElementById('ai-report-content');
    if (reportContent && data.analysis_result) {
        reportContent.innerHTML = formatAIReport(data.analysis_result);
    }
    
    // 显示生产规划建议
    const productionRec = document.getElementById('production-recommendations');
    if (productionRec && data.analysis_result) {
        productionRec.innerHTML = extractRecommendations(data.analysis_result, '生产规划');
    }
    
    // 显示企业行动建议
    const businessRec = document.getElementById('business-recommendations');
    if (businessRec && data.analysis_result) {
        businessRec.innerHTML = extractRecommendations(data.analysis_result, '企业行动');
    }
    

    
    // 显示数据摘要
    const dataSummary = document.getElementById('data-summary');
    if (dataSummary && data.data_summary) {
        dataSummary.innerHTML = formatDataSummary(data.data_summary);
    }
}

function formatAIReport(analysisResult) {
    // 处理不同类型的输入数据
    let textContent = '';
    
    if (typeof analysisResult === 'string') {
        textContent = analysisResult;
    } else if (typeof analysisResult === 'object' && analysisResult !== null) {
        // 如果是对象，尝试提取文本内容，避免显示元数据
        textContent = analysisResult.analysis_result || 
                     analysisResult.content || 
                     analysisResult.analysis || 
                     analysisResult.text ||
                     analysisResult.report;
        
        // 如果提取到的内容仍然是对象，尝试进一步提取
        if (typeof textContent === 'object' && textContent !== null) {
            textContent = textContent.analysis_result || 
                         textContent.content || 
                         textContent.text ||
                         textContent.report;
        }
        
        // 如果还是没有找到合适的文本内容，返回提示信息
        if (!textContent || typeof textContent !== 'string') {
            console.warn('无法提取有效的分析文本内容:', analysisResult);
            return '<div class="no-analysis"><i class="fas fa-info-circle"></i> 分析结果格式错误</div>';
        }
    } else {
        console.warn('无法处理的分析结果类型:', typeof analysisResult, analysisResult);
        return '<div class="no-analysis"><i class="fas fa-info-circle"></i> 分析结果格式错误</div>';
    }
    
    if (textContent && typeof textContent === 'string') {
        // 首先处理转义的换行符
        textContent = textContent.replace(/\\n/g, '\n');
        
        // 清理不必要的元数据和格式标记
        textContent = textContent
            // 移除常见的元数据字段显示
            .replace(/['"]?raw_content['"]?\s*[:：]\s*/gi, '')
            .replace(/['"]?analysis_result['"]?\s*[:：]\s*/gi, '')
            .replace(/['"]?content['"]?\s*[:：]\s*/gi, '')
            .replace(/['"]?data_summary['"]?\s*[:：]\s*/gi, '')
            .replace(/['"]?summary['"]?\s*[:：]\s*/gi, '')
            .replace(/['"]?report['"]?\s*[:：]\s*/gi, '')
            .replace(/['"]?text['"]?\s*[:：]\s*/gi, '')
            // 移除JSON字段名
            .replace(/['"]?key_findings['"]?\s*[:：]\s*/gi, '')
            .replace(/['"]?risk_alerts['"]?\s*[:：]\s*/gi, '')
            .replace(/['"]?opportunities['"]?\s*[:：]\s*/gi, '')
            .replace(/['"]?production_recommendations['"]?\s*[:：]\s*/gi, '')
            .replace(/['"]?business_actions['"]?\s*[:：]\s*/gi, '')
            .replace(/['"]?predictions['"]?\s*[:：]\s*/gi, '')
            .replace(/['"]?generated_at['"]?\s*[:：]\s*/gi, '')
            .replace(/['"]?analysis['"]?\s*[:：]\s*/gi, '')
            .replace(/['"]?recommendations['"]?\s*[:：]\s*/gi, '')
            .replace(/['"]?overall_summary['"]?\s*[:：]\s*/gi, '')
            // 移除JSON格式的花括号和引号
            .replace(/^\s*[{\["']|[}\]"']\s*$/gm, '')
            // 移除开头的单引号
            .replace(/^\s*'/gm, '')
            // 移除多余的星号和特殊符号
            .replace(/^\s*\*+\s*/gm, '')
            .replace(/\*{2,}/g, '')
            // 强化移除Markdown格式标记（包括开头的###）
            .replace(/^\s*#{1,6}\s+/gm, '')
            .replace(/^\s*#{1,6}/gm, '')
            .replace(/#{1,6}\s*/g, '')
            // 移除多余的冒号和分隔符
            .replace(/^\s*[:：]\s*/gm, '')
            .replace(/\s*[:：]\s*$/gm, '')
            // 清理多余的空行
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .trim();
        
        // 增强的文本格式化处理
        let formatted = textContent
            // 检测可能的标题行（基于内容而非格式标记）
            .replace(/^(数据概览|分析报告|智能分析|生产建议|库存分析|销售分析|风险评估|优化建议)\s*$/gm, '<h3 class="analysis-section-title"><i class="fas fa-chart-line"></i> $1</h3>')
            .replace(/^(综合分析报告|DEEPSEEK分析|AI智能分析)\s*$/gm, '<h2 class="analysis-main-title"><i class="fas fa-brain"></i> $1</h2>')
            
            // 处理列表项（在处理换行之前）
            .replace(/^\s*[-•]\s+(.+)$/gm, '<div class="analysis-list-item"><i class="fas fa-chevron-right"></i> $1</div>')
            .replace(/^\s*(\d+)\s*[.、]\s+(.+)$/gm, '<div class="analysis-numbered-item"><span class="item-number">$1</span> $2</div>')
            
            // 处理重要信息框
            .replace(/^\s*(?:注意|重要|警告)[:：]\s*(.+)$/gm, '<div class="analysis-warning"><i class="fas fa-exclamation-triangle"></i> $1</div>')
            .replace(/^\s*(?:建议|推荐)[:：]\s*(.+)$/gm, '<div class="analysis-suggestion"><i class="fas fa-lightbulb"></i> $1</div>')
            
            // 处理粗体和斜体
            .replace(/\*\*(.*?)\*\*/g, '<strong class="analysis-bold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="analysis-italic">$1</em>');
            
        // 按段落分割处理
        const paragraphs = formatted.split(/\n\s*\n/);
        const processedParagraphs = paragraphs.map(paragraph => {
            if (!paragraph.trim()) return '';
            
            // 如果已经是HTML标签，直接返回
            if (paragraph.includes('<h1') || paragraph.includes('<h2') || paragraph.includes('<h3') || 
                paragraph.includes('<div class="analysis-')) {
                return paragraph;
            }
            
            // 处理普通段落
            let processedParagraph = paragraph
                // 处理关键词高亮
                .replace(/(库存健康|销售聚焦|低关注产品|市场需求|热销产品|产品线优化)/g, '<span class="highlight-keyword">$1</span>')
                .replace(/(风险预警|机会识别|建议|推荐|优化|提升)/g, '<span class="highlight-action">$1</span>')
                
                // 处理数字和百分比
                .replace(/(\d+(?:\.\d+)?%)/g, '<span class="highlight-percentage">$1</span>')
                .replace(/¥([\d,]+(?:\.\d+)?)/g, '<span class="highlight-money">¥$1</span>')
                .replace(/(\d+(?:,\d{3})*(?:\.\d+)?(?=\s*(?:件|个|台|批|次)))/g, '<span class="highlight-number">$1</span>')
                
                // 处理单个换行为<br>
                .replace(/\n/g, '<br>');
            
            return `<p class="analysis-paragraph">${processedParagraph}</p>`;
        }).filter(p => p.trim());
        
        formatted = processedParagraphs.join('');
        
        return `<div class="formatted-analysis-content">${formatted}</div>`;
    }
    return '<div class="no-analysis"><i class="fas fa-info-circle"></i> 暂无分析报告</div>';
}

function extractRecommendations(analysisResult, type) {
    if (!analysisResult) return '<div class="no-recommendations"><i class="fas fa-info-circle"></i> 暂无建议</div>';
    
    // 处理不同类型的输入数据
    let textContent = '';
    
    if (typeof analysisResult === 'string') {
        textContent = analysisResult;
    } else if (typeof analysisResult === 'object' && analysisResult !== null) {
        // 如果是对象，尝试提取文本内容，避免显示元数据
        textContent = analysisResult.analysis_result || 
                     analysisResult.content || 
                     analysisResult.analysis || 
                     analysisResult.text ||
                     analysisResult.report;
        
        // 如果提取到的内容仍然是对象，尝试进一步提取
        if (typeof textContent === 'object' && textContent !== null) {
            textContent = textContent.analysis_result || 
                         textContent.content || 
                         textContent.text ||
                         textContent.report;
        }
        
        // 如果还是没有找到合适的文本内容，返回提示信息
        if (!textContent || typeof textContent !== 'string') {
            console.warn('无法提取有效的建议文本内容:', analysisResult);
            return '<div class="no-recommendations"><i class="fas fa-info-circle"></i> 暂无建议</div>';
        }
    } else {
        console.warn('无法处理的分析结果类型:', typeof analysisResult, analysisResult);
        return '<div class="no-recommendations"><i class="fas fa-info-circle"></i> 暂无建议</div>';
    }
    
    if (!textContent || typeof textContent !== 'string') {
        return '<div class="no-recommendations"><i class="fas fa-info-circle"></i> 暂无建议</div>';
    }
    
    // 处理转义的换行符
    textContent = textContent.replace(/\\n/g, '\n');
    
    // 清理不必要的元数据和格式标记
    textContent = textContent
        // 移除常见的元数据字段显示
        .replace(/['"]?raw_content['"]?\s*[:：]\s*/gi, '')
        .replace(/['"]?analysis_result['"]?\s*[:：]\s*/gi, '')
        .replace(/['"]?content['"]?\s*[:：]\s*/gi, '')
        .replace(/['"]?data_summary['"]?\s*[:：]\s*/gi, '')
        .replace(/['"]?summary['"]?\s*[:：]\s*/gi, '')
        .replace(/['"]?report['"]?\s*[:：]\s*/gi, '')
        .replace(/['"]?text['"]?\s*[:：]\s*/gi, '')
        // 移除JSON字段名
        .replace(/['"]?key_findings['"]?\s*[:：]\s*/gi, '')
        .replace(/['"]?risk_alerts['"]?\s*[:：]\s*/gi, '')
        .replace(/['"]?opportunities['"]?\s*[:：]\s*/gi, '')
        .replace(/['"]?production_recommendations['"]?\s*[:：]\s*/gi, '')
        .replace(/['"]?business_actions['"]?\s*[:：]\s*/gi, '')
        .replace(/['"]?predictions['"]?\s*[:：]\s*/gi, '')
        .replace(/['"]?generated_at['"]?\s*[:：]\s*/gi, '')
        .replace(/['"]?analysis['"]?\s*[:：]\s*/gi, '')
        .replace(/['"]?recommendations['"]?\s*[:：]\s*/gi, '')
        .replace(/['"]?overall_summary['"]?\s*[:：]\s*/gi, '')
        // 移除JSON格式的花括号和引号
        .replace(/^\s*[{\["']|[}\]"']\s*$/gm, '')
        // 移除开头的单引号
        .replace(/^\s*'/gm, '')
        // 移除多余的星号和特殊符号
        .replace(/^\s*\*+\s*/gm, '')
        .replace(/\*{2,}/g, '')
        // 强化移除Markdown格式标记（包括开头的###）
        .replace(/^\s*#{1,6}\s+/gm, '')
        .replace(/^\s*#{1,6}/gm, '')
        .replace(/#{1,6}\s*/g, '')
        // 移除多余的冒号和分隔符
        .replace(/^\s*[:：]\s*/gm, '')
        .replace(/\s*[:：]\s*$/gm, '')
        // 清理多余的空行
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
    
    // 增强的文本解析，提取相关建议
    const lines = textContent.split('\n');
    const recommendations = [];
    let inRecommendationSection = false;
    let sectionDepth = 0;
    
    for (let line of lines) {
        const trimmedLine = line.trim();
        
        // 检测是否进入相关建议区域
        if (trimmedLine.includes(type) || 
            trimmedLine.includes('建议') || 
            trimmedLine.includes('推荐') ||
            trimmedLine.includes('优化') ||
            trimmedLine.includes('改进')) {
            inRecommendationSection = true;
            sectionDepth = 0;
            continue;
        }
        
        // 检测是否离开当前区域（遇到新的主要标题）
        if (inRecommendationSection && (trimmedLine.startsWith('##') || trimmedLine.startsWith('#'))) {
            if (!trimmedLine.includes(type) && !trimmedLine.includes('建议') && !trimmedLine.includes('推荐')) {
                break;
            }
        }
        
        if (inRecommendationSection && trimmedLine) {
            // 提取列表项
            if (trimmedLine.match(/^[-•*]\s+/) || trimmedLine.match(/^\d+[.、]\s+/)) {
                const cleanRec = trimmedLine.replace(/^[-•*\d.、\s]+/, '').trim();
                if (cleanRec.length > 5) {
                    recommendations.push({
                        text: cleanRec,
                        type: 'list',
                        priority: getPriority(cleanRec)
                    });
                }
            }
            // 提取普通段落（如果足够长且有意义）
            else if (trimmedLine.length > 15 && 
                     !trimmedLine.startsWith('#') && 
                     (trimmedLine.includes('建议') || 
                      trimmedLine.includes('推荐') || 
                      trimmedLine.includes('应该') || 
                      trimmedLine.includes('可以') ||
                      trimmedLine.includes('需要'))) {
                recommendations.push({
                    text: trimmedLine,
                    type: 'paragraph',
                    priority: getPriority(trimmedLine)
                });
            }
            
            if (recommendations.length >= 8) break; // 增加限制数量
        }
    }
    
    if (recommendations.length === 0) {
        return '<div class="no-recommendations"><i class="fas fa-info-circle"></i> 暂无相关建议</div>';
    }
    
    // 按优先级排序
    recommendations.sort((a, b) => b.priority - a.priority);
    
    return `<div class="recommendations-container">
        ${recommendations.slice(0, 6).map((rec, index) => `
            <div class="recommendation-item enhanced priority-${rec.priority}" data-index="${index}">
                <div class="rec-icon">
                    ${getRecommendationIcon(rec.text, type)}
                </div>
                <div class="rec-content">
                    <span class="rec-text">${highlightKeywords(rec.text)}</span>
                    <div class="rec-meta">
                        <span class="rec-type">${getRecommendationType(rec.text)}</span>
                        <span class="rec-priority">优先级: ${getPriorityText(rec.priority)}</span>
                    </div>
                </div>
                <div class="rec-action">
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        `).join('')}
    </div>`;
}

// 获取建议优先级
function getPriority(text) {
    if (text.includes('紧急') || text.includes('立即') || text.includes('马上')) return 3;
    if (text.includes('重要') || text.includes('关键') || text.includes('必须')) return 2;
    if (text.includes('建议') || text.includes('推荐') || text.includes('可以')) return 1;
    return 0;
}

// 获取优先级文本
function getPriorityText(priority) {
    switch(priority) {
        case 3: return '高';
        case 2: return '中';
        case 1: return '低';
        default: return '一般';
    }
}

// 获取建议图标
function getRecommendationIcon(text, type) {
    if (type.includes('生产')) {
        if (text.includes('效率') || text.includes('优化')) return '<i class="fas fa-cogs"></i>';
        if (text.includes('计划') || text.includes('安排')) return '<i class="fas fa-calendar-alt"></i>';
        return '<i class="fas fa-industry"></i>';
    }
    if (type.includes('企业') || type.includes('行动')) {
        if (text.includes('销售') || text.includes('营销')) return '<i class="fas fa-chart-line"></i>';
        if (text.includes('库存') || text.includes('仓储')) return '<i class="fas fa-warehouse"></i>';
        if (text.includes('成本') || text.includes('价格')) return '<i class="fas fa-dollar-sign"></i>';
        return '<i class="fas fa-lightbulb"></i>';
    }
    return '<i class="fas fa-star"></i>';
}

// 获取建议类型
function getRecommendationType(text) {
    if (text.includes('库存')) return '库存管理';
    if (text.includes('销售')) return '销售策略';
    if (text.includes('生产')) return '生产优化';
    if (text.includes('成本')) return '成本控制';
    if (text.includes('效率')) return '效率提升';
    if (text.includes('质量')) return '质量改进';
    return '综合建议';
}

// 高亮关键词
function highlightKeywords(text) {
    return text
        .replace(/(提升|优化|改进|增加|减少|降低)/g, '<span class="keyword-action">$1</span>')
        .replace(/(\d+%|\d+(?:,\d{3})*)/g, '<span class="keyword-number">$1</span>')
        .replace(/(库存|销售|生产|效率|成本|质量)/g, '<span class="keyword-domain">$1</span>');
}



function formatDataSummary(summary) {
    if (typeof summary === 'object') {
        return Object.entries(summary).map(([key, value]) => `
            <div class="summary-item">
                <span class="summary-label">${key}:</span>
                <span class="summary-value">${value}</span>
            </div>
        `).join('');
    } else if (typeof summary === 'string') {
        return `<div class="summary-text">${summary}</div>`;
    }
    return '<p>暂无数据摘要</p>';
}

function exportAnalysisReport() {
    const reportContent = document.getElementById('ai-report-content');
    const productionRec = document.getElementById('production-recommendations');
    const businessRec = document.getElementById('business-recommendations');
    
    if (!reportContent || !reportContent.textContent.trim()) {
        app.showNotification('请先进行AI分析', 'warning');
        return;
    }
    
    const exportData = {
        title: 'DEEPSEEK-R1 智能分析报告',
        timestamp: new Date().toLocaleString('zh-CN'),
        report: reportContent.textContent,
        production_recommendations: productionRec ? productionRec.textContent : '',
        business_recommendations: businessRec ? businessRec.textContent : ''
    };
    
    downloadDeepSeekReport(exportData);
    app.showNotification('报告导出完成', 'success');
}

function downloadDeepSeekReport(data) {
    const reportContent = `
# ${data.title}

**生成时间：** ${data.timestamp}

## AI分析报告

${data.report}

## 生产规划建议

${data.production_recommendations}

## 企业行动建议

${data.business_recommendations}

---
*本报告由DEEPSEEK-R1模型生成*
    `;
    
    const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DEEPSEEK-R1分析报告_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function renderAIReport() {
    const aiReport = document.getElementById('ai-report');
    if (!aiReport) return;
    
    const report = analysisData.ai?.report || '<p>AI分析报告暂不可用，请配置相关服务。</p>';
    
    setTimeout(() => {
        aiReport.innerHTML = `<div class="ai-content">${report}</div>`;
    }, 2000); // 模拟AI分析时间
}

function renderAIRecommendations() {
    const recommendationsGrid = document.getElementById('ai-recommendations-grid');
    if (!recommendationsGrid) return;
    
    const recommendations = analysisData.ai?.recommendations || [
        {
            title: '库存优化',
            content: '基于销售预测，建议调整产品A的安全库存量至150件，可减少20%的库存成本。'
        },
        {
            title: '生产计划',
            content: '预测下月产品B需求将增长30%，建议提前安排生产计划并准备原材料。'
        },
        {
            title: '销售策略',
            content: '数据显示客户对产品C的价格敏感度较高，建议考虑适当的促销策略。'
        },
        {
            title: '设备维护',
            content: '设备运行数据显示异常波动，建议在下周安排预防性维护检查。'
        }
    ];
    
    recommendationsGrid.innerHTML = recommendations.map(rec => `
        <div class="recommendation-card">
            <h5>${rec.title}</h5>
            <p>${rec.content}</p>
        </div>
    `).join('');
}

function renderAIPredictions() {
    // 销售预测图
    const salesPredictionCanvas = document.getElementById('sales-prediction-chart');
    if (salesPredictionCanvas) {
        const ctx = salesPredictionCanvas.getContext('2d');
        
        if (analysisChartInstances.salesPrediction) {
        analysisChartInstances.salesPrediction.destroy();
    }
    
    analysisChartInstances.salesPrediction = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['7月', '8月', '9月', '10月', '11月', '12月'],
                datasets: [
                    {
                        label: '历史数据',
                        data: [168000, 175000, 162000, 180000, 185000, 192000],
                        borderColor: 'rgb(37, 99, 235)',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)'
                    },
                    {
                        label: '预测数据',
                        data: [null, null, null, null, 195000, 205000],
                        borderColor: 'rgb(220, 38, 38)',
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // 库存预测图
    const inventoryPredictionCanvas = document.getElementById('inventory-prediction-chart');
    if (inventoryPredictionCanvas) {
        const ctx = inventoryPredictionCanvas.getContext('2d');
        
        if (analysisChartInstances.inventoryPrediction) {
        analysisChartInstances.inventoryPrediction.destroy();
    }
    
    analysisChartInstances.inventoryPrediction = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['产品A', '产品B', '产品C', '产品D'],
                datasets: [
                    {
                        label: '当前库存',
                        data: [120, 85, 200, 150],
                        backgroundColor: 'rgba(37, 99, 235, 0.8)'
                    },
                    {
                        label: '建议库存',
                        data: [150, 110, 180, 130],
                        backgroundColor: 'rgba(5, 150, 105, 0.8)'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// 模拟AI分析函数已移除

// 模拟AI报告生成函数已移除

function switchAnalysisTab(tabType) {
    // 更新标签状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 更新内容区域
    document.querySelectorAll('.analysis-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${tabType}-analysis`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    currentAnalysisType = tabType;
    
    // 加载对应数据
    if (tabType !== 'overview' && tabType !== 'ai-insights') {
        loadCurrentAnalysisData();
    }
    
    app.playVoice(`已切换到${getTabName(tabType)}`);
}

function getTabName(tabType) {
    const names = {
        'overview': '综合概览',
        'sales': '销售分析',
        'inventory': '库存分析',
        'production': '生产分析',
        'logistics': '物流分析',
        'ai-insights': 'AI洞察'
    };
    return names[tabType] || '未知';
}

function refreshAnalysis() {
    app.showLoading();
    loadAnalysisData();
    app.showNotification('分析数据已刷新', 'success');
}

function generateReport() {
    app.showLoading();
    
    // 模拟生成报告
    setTimeout(() => {
        const reportData = {
            title: 'QuantumFlow 量子流仓储平台分析报告',
            date: new Date().toLocaleDateString('zh-CN'),
            sections: [
                {
                    title: '执行摘要',
                    content: '本报告基于QuantumFlow量子流仓储平台的运营数据，对企业的销售、库存、生产和物流等关键业务指标进行了全面分析。'
                },
                {
                    title: '销售分析',
                    content: `总销售额：¥${analysisData.overview?.total_revenue || 0}，同比增长${analysisData.overview?.sales_growth || 0}%。`
                },
                {
                    title: '库存状况',
                    content: `当前库存价值：¥${analysisData.inventory?.value || 0}，库存周转率：${analysisData.overview?.inventory_turnover || 0}次/月。`
                },
                {
                    title: '生产效率',
                    content: `生产效率：${analysisData.overview?.production_efficiency || 0}%，设备利用率良好。`
                },
                {
                    title: '建议措施',
                    content: '建议继续优化库存管理，提高生产效率，加强设备维护。'
                }
            ]
        };
        
        downloadReport(reportData);
        app.hideLoading();
        app.showNotification('报告生成完成', 'success');
        app.playVoice('分析报告已生成');
    }, 2000);
}

function downloadReport(reportData) {
    const reportContent = `
# ${reportData.title}

**生成日期：** ${reportData.date}

${reportData.sections.map(section => `
## ${section.title}

${section.content}
`).join('')}

---
*本报告由QuantumFlow量子流仓储平台自动生成*
    `;
    
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `智能仓储分析报告_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportAnalysis() {
    app.showLoading();
    
    // 准备导出数据
    const exportData = {
        overview: analysisData.overview || {},
        sales: analysisData.sales || {},
        inventory: analysisData.inventory || {},
        production: analysisData.production || {},
        logistics: analysisData.logistics || {},
        ai_insights: analysisData.ai || {},
        export_time: new Date().toISOString(),
        export_user: 'system'
    };
    
    // 创建CSV格式的数据
    const csvContent = convertToCSV(exportData);
    
    // 下载文件
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `智能分析数据_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    app.hideLoading();
    app.showNotification('数据导出完成', 'success');
    app.playVoice('分析数据已导出');
}

function convertToCSV(data) {
    const headers = ['指标类型', '指标名称', '指标值', '单位', '备注'];
    const rows = [headers.join(',')];
    
    // 概览数据
    if (data.overview) {
        rows.push(`概览,总营收,${data.overview.total_revenue || 0},元,`);
        rows.push(`概览,销售增长,${data.overview.sales_growth || 0},%,`);
        rows.push(`概览,库存周转率,${data.overview.inventory_turnover || 0},次/月,`);
        rows.push(`概览,生产效率,${data.overview.production_efficiency || 0},%,`);
    }
    
    // 销售数据
    if (data.sales) {
        rows.push(`销售,销售总额,${data.sales.total || 0},元,`);
        rows.push(`销售,订单数量,${data.sales.orders || 0},个,`);
        rows.push(`销售,平均订单价值,${data.sales.avg_value || 0},元,`);
        rows.push(`销售,客户数量,${data.sales.customers || 0},个,`);
    }
    
    // 库存数据
    if (data.inventory) {
        rows.push(`库存,库存价值,${data.inventory.value || 0},元,`);
        rows.push(`库存,库存商品数,${data.inventory.items || 0},个,`);
        rows.push(`库存,缺货商品,${data.inventory.out_of_stock || 0},个,`);
        rows.push(`库存,滞销商品,${data.inventory.slow_moving || 0},个,`);
    }
    
    // 生产数据
    if (data.production) {
        rows.push(`生产,生产计划数,${data.production.plans || 0},个,`);
        rows.push(`生产,完成率,${data.production.completion_rate || 0},%,`);
        rows.push(`生产,平均周期,${data.production.avg_cycle_time || 0},天,`);
        rows.push(`生产,设备利用率,${data.production.equipment_utilization || 0},%,`);
    }
    
    // 物流数据
    if (data.logistics) {
        rows.push(`物流,任务总数,${data.logistics.tasks || 0},个,`);
        rows.push(`物流,完成率,${data.logistics.completion_rate || 0},%,`);
        rows.push(`物流,平均时长,${data.logistics.avg_duration || 0},分钟,`);
        rows.push(`物流,机器人利用率,${data.logistics.robot_utilization || 0},%,`);
    }
    
    return rows.join('\n');
}

// 导出模块函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadAnalysisModule,
        switchAnalysisTab,
        refreshAnalysis,
        generateReport,
        exportAnalysis
    };
}