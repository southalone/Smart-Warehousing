// QuantumFlow 量子流仓储平台 - 主应用程序
// 版本: 1.0.1 - 修复CORS问题
// 作者: RBCC团队
// 更新时间: 2025-07-25 22:28

// QuantumFlow 量子流仓储平台主应用JavaScript文件

// 全局变量
let currentModule = 'dashboard';
let voiceEnabled = true;
let systemData = {};
let refreshInterval = null;

// 性能优化相关变量
let dataCache = new Map(); // 数据缓存
let lastCacheTime = new Map(); // 缓存时间记录
const CACHE_DURATION = 10000; // 缓存有效期10秒
let pendingRequests = new Map(); // 防止重复请求
let isPageVisible = true; // 页面可见性状态

// 应用初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('QuantumFlow 量子流仓储平台初始化中...');
    
    // 初始化事件监听器
    setupEventListeners();
    
    // 初始化时间显示
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // 延迟加载初始数据，确保页面完全渲染
    setTimeout(() => {
        console.log('开始加载仪表板数据...');
        loadDashboardDataOptimized();
    }, 500);
    
    // 设置定时刷新
    startAutoRefresh();
    
    // 页面可见性监听
    setupVisibilityListener();
    
    // 播放欢迎语音
    if (voiceEnabled) {
        playVoice('welcome');
    }
    
    console.log('系统初始化完成');
}

function setupEventListeners() {
    // 语音控制按钮
    const voiceToggle = document.getElementById('voice-toggle');
    if (voiceToggle) {
        voiceToggle.addEventListener('click', toggleVoice);
    }
    
    // 键盘快捷键
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // 窗口失焦时暂停刷新，获得焦点时恢复
    window.addEventListener('blur', () => {
        isPageVisible = false;
        stopAutoRefresh();
    });
    window.addEventListener('focus', () => {
        isPageVisible = true;
        startAutoRefresh();
        // 页面重新获得焦点时刷新数据
        if (currentModule === 'dashboard') {
            loadDashboardDataOptimized();
        } else {
            loadModuleData(currentModule);
        }
    });
}

function handleKeyboardShortcuts(event) {
    // Ctrl + 数字键快速切换模块
    if (event.ctrlKey) {
        switch(event.key) {
            case '1':
                event.preventDefault();
                showModule('inventory');
                break;
            case '2':
                event.preventDefault();
                showModule('prediction');
                break;
            case '3':
                event.preventDefault();
                showModule('production');
                break;
            case '4':
                event.preventDefault();
                showModule('logistics');
                break;
            case '5':
                event.preventDefault();
                showModule('analysis');
                break;
            case '0':
                event.preventDefault();
                showModule('dashboard');
                break;
        }
    }
    
    // ESC键返回仪表板
    if (event.key === 'Escape') {
        showModule('dashboard');
    }
}

// 模块切换功能（优化版）
function showModule(moduleName) {
    if (currentModule === moduleName) {
        return; // 已经是当前模块，无需切换
    }
    
    console.log(`切换到模块: ${moduleName}`);
    
    // 显示加载提示
    showLoading();
    
    // 使用requestAnimationFrame优化动画性能
    requestAnimationFrame(() => {
        // 立即执行模块切换，提高响应速度
        performModuleSwitch(moduleName);
    });
}

// 执行模块切换的核心逻辑
function performModuleSwitch(moduleName) {
    // 批量DOM操作优化
    const allModules = document.querySelectorAll('.module-content');
    const targetModule = document.getElementById(`${moduleName}-module`);
    
    // 使用平滑过渡效果
    requestAnimationFrame(() => {
        // 先淡出当前模块
        allModules.forEach(module => {
            if (module !== targetModule && module.style.display !== 'none') {
                module.style.opacity = '0';
                module.style.transition = 'opacity 0.2s ease-out';
                setTimeout(() => {
                    module.style.display = 'none';
                    module.style.opacity = '';
                    module.style.transition = '';
                }, 200);
            }
        });
        
        // 延迟显示目标模块，确保平滑过渡
        setTimeout(() => {
            if (targetModule) {
                targetModule.style.opacity = '0';
                targetModule.style.display = 'block';
                targetModule.style.transition = 'opacity 0.3s ease-in';
                
                // 立即隐藏加载提示
                hideLoading();
                
                // 淡入新模块
                requestAnimationFrame(() => {
                    targetModule.style.opacity = '1';
                    setTimeout(() => {
                        targetModule.style.transition = '';
                        targetModule.classList.add('fade-in');
                    }, 300);
                });
            }
            
            // 更新当前模块
            currentModule = moduleName;
            
            // 加载模块数据
            loadModuleData(moduleName);
            
            // 播放语音提示（异步）
            if (voiceEnabled) {
                const moduleNames = {
                    'dashboard': '数据看板',
                    'inventory': '库存管理', 
                    'prediction': '销售预测',
                    'production': '生产管理',
                    'logistics': '物流调度',
                    'analysis': '智能分析'
                };
                setTimeout(() => playVoice(`已切换到${moduleNames[moduleName]}模块`), 100);
            }
        }, 100);
    });
}

// 优化的模块数据加载
function loadModuleDataOptimized(moduleName) {
    // 直接加载新数据
    loadModuleData(moduleName);
}

// 渲染模块数据
function renderModuleData(moduleName, data) {
    switch(moduleName) {
        case 'dashboard':
            if (data) updateDashboard(data);
            break;
        case 'inventory':
            if (typeof updateInventoryDisplay === 'function' && data) {
                updateInventoryDisplay(data);
            }
            break;
        case 'production':
            if (typeof updateProductionDisplay === 'function' && data) {
                updateProductionDisplay(data);
            }
            break;
        case 'logistics':
            if (typeof updateLogisticsDisplay === 'function' && data) {
                updateLogisticsDisplay(data);
            }
            break;
        case 'analysis':
            if (typeof updateAnalysisDisplay === 'function' && data) {
                updateAnalysisDisplay(data);
            }
            break;
    }
}

function loadModuleData(moduleName) {
    const cacheKey = `module_${moduleName}`;
    
    switch(moduleName) {
        case 'dashboard':
            loadDashboardDataOptimized(cacheKey);
            break;
        case 'inventory':
            if (typeof loadInventoryModule === 'function') {
                loadInventoryModule();
            }
            break;
        case 'prediction':
            if (typeof loadPredictionModule === 'function') {
                loadPredictionModule();
            }
            break;
        case 'production':
            if (typeof loadProductionModule === 'function') {
                loadProductionModule();
            }
            break;
        case 'logistics':
            if (typeof loadLogisticsModule === 'function') {
                loadLogisticsModule();
            }
            break;
        case 'analysis':
            if (typeof loadAnalysisModule === 'function') {
                loadAnalysisModule();
            }
            break;
    }
}

// 优化的仪表板数据加载
function loadDashboardDataOptimized() {
    console.log('开始加载仪表板数据...');
    
    // 创建一个全局测试函数，供手动调试使用
    window.manualTestAPI = function() {
        console.log('手动测试API开始...');
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/dashboard', true);
        xhr.onload = function() {
            console.log('手动测试 - 成功:', xhr.status, xhr.responseText);
        };
        xhr.onerror = function() {
            console.log('手动测试 - 失败:', xhr.status);
        };
        xhr.send();
    };
    
    // 延迟执行API请求，确保页面完全加载
    setTimeout(() => {
        console.log('延迟执行API请求...');
        
        // 直接使用XMLHttpRequest，不通过apiRequest函数
        const xhr = new XMLHttpRequest();
        const url = '/api/dashboard';
        console.log('请求URL:', url);
        
        xhr.onreadystatechange = function() {
            console.log('仪表板API - 状态变化:', xhr.readyState, xhr.status);
            
            if (xhr.readyState === 4) {
                console.log('仪表板API - 完成:', xhr.status, xhr.statusText);
                
                if (xhr.status === 200) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        console.log('仪表板数据加载成功:', data);
                        if (data && data.success) {
                            updateDashboard(data.data);
                            console.log('仪表板数据更新成功');
                        } else {
                            console.error('仪表板数据格式错误:', data);
                            showNotification('加载仪表板数据失败', 'error');
                        }
                    } catch (e) {
                        console.error('JSON解析错误:', e);
                        showNotification('数据格式错误', 'error');
                    }
                } else {
                    console.error('API请求失败:', xhr.status, xhr.statusText, xhr.responseText);
                    showNotification('数据加载失败: HTTP ' + xhr.status, 'error');
                }
            }
        };
        
        xhr.onerror = function() {
            console.error('网络错误');
            showNotification('网络连接失败', 'error');
        };
        
        xhr.ontimeout = function() {
            console.error('请求超时');
            showNotification('请求超时', 'error');
        };
        
        // 根据请求类型设置不同的超时时间
        if (url.includes('/api/analysis/ai-insights') || url.includes('/api/llm/analysis')) {
            xhr.timeout = 120000; // AI分析请求120秒超时
        } else {
            xhr.timeout = 8000; // 其他请求8秒超时
        }
        
        try {
            console.log('发送仪表板API请求...');
            xhr.open('GET', url, true);
            xhr.send();
        } catch (error) {
            console.error('发送请求失败:', error);
            showNotification('请求发送失败', 'error');
        }
    }, 1000); // 延迟1秒执行
}

// 静默刷新仪表板数据（不显示错误通知）
function loadDashboardDataSilent() {
    apiRequest('/api/dashboard', { method: 'GET' })
        .then(data => {
            if (data && data.success) {
                updateDashboardSilent(data.data);
            }
        })
        .catch(error => {
            console.error('静默刷新仪表板数据错误:', error);
            // 静默刷新失败时不显示通知，避免干扰用户
        });
}

// 静默刷新其他模块数据
function loadModuleDataSilent(moduleName) {
    switch(moduleName) {
        case 'dashboard':
            loadDashboardDataSilent();
            break;
        case 'inventory':
            if (typeof loadInventoryModuleSilent === 'function') {
                loadInventoryModuleSilent();
            } else if (typeof loadInventoryModule === 'function') {
                loadInventoryModule();
            }
            break;
        case 'prediction':
            if (typeof loadPredictionModuleSilent === 'function') {
                loadPredictionModuleSilent();
            } else if (typeof loadPredictionModule === 'function') {
                loadPredictionModule();
            }
            break;
        case 'production':
            if (typeof loadProductionModuleSilent === 'function') {
                loadProductionModuleSilent();
            } else if (typeof loadProductionModule === 'function') {
                loadProductionModule();
            }
            break;
        case 'logistics':
            if (typeof loadLogisticsModuleSilent === 'function') {
                loadLogisticsModuleSilent();
            } else if (typeof loadLogisticsModule === 'function') {
                loadLogisticsModule();
            }
            break;
        case 'analysis':
            if (typeof loadAnalysisModuleSilent === 'function') {
                loadAnalysisModuleSilent();
            } else if (typeof loadAnalysisModule === 'function') {
                loadAnalysisModule();
            }
            break;
    }
}



function updateDashboard(data) {
    // 批量更新DOM元素，减少重排
    requestAnimationFrame(() => {
        const updates = [
            ['total-products', data.total_products || 0],
            ['low-stock-count', data.low_stock_count || 0],
            ['today-sales', data.today_sales || 0],
            ['week-trend', `${(data.week_growth_rate || 0) > 0 ? '+' : ''}${(data.week_growth_rate || 0).toFixed(1)}%`],
            ['active-tasks', data.active_tasks || 0],
            ['robot-battery', `${data.robot_battery || 0}%`],
            ['pending-plans', data.pending_plans || 0],
            ['completion-rate', `${(data.completion_rate || 0).toFixed(1)}%`]
        ];
        
        // 批量更新文本内容
        updates.forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element && element.textContent !== String(value)) {
                element.textContent = value;
                element.classList.add('fade-in');
            }
        });
        
        // 更新状态指示器
        updateSystemStatus(data.system_status);
        updateRobotStatus(data.robot_status);
    });
}

// 静默更新仪表板（无动画效果，避免闪烁）
function updateDashboardSilent(data) {
    // 批量更新DOM元素，减少重排，但不添加动画
    requestAnimationFrame(() => {
        const updates = [
            ['total-products', data.total_products || 0],
            ['low-stock-count', data.low_stock_count || 0],
            ['today-sales', data.today_sales || 0],
            ['week-trend', `${(data.week_growth_rate || 0) > 0 ? '+' : ''}${(data.week_growth_rate || 0).toFixed(1)}%`],
            ['active-tasks', data.active_tasks || 0],
            ['robot-battery', `${data.robot_battery || 0}%`],
            ['pending-plans', data.pending_plans || 0],
            ['completion-rate', `${(data.completion_rate || 0).toFixed(1)}%`]
        ];
        
        // 静默更新文本内容，不添加动画效果
        updates.forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element && element.textContent !== String(value)) {
                element.textContent = value;
                // 不添加fade-in类，避免闪烁
            }
        });
        
        // 静默更新状态指示器
        updateSystemStatusSilent(data.system_status);
        updateRobotStatusSilent(data.robot_status);
    });
}

function updateElement(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
        element.classList.add('fade-in');
    }
}

function updateSystemStatus(status) {
    const statusElement = document.getElementById('system-status');
    const indicator = statusElement?.querySelector('.status-indicator');
    const text = statusElement?.querySelector('span');
    
    if (statusElement && indicator && text) {
        if (status === 'normal') {
            indicator.style.color = 'var(--success-color)';
            text.textContent = '系统正常';
        } else if (status === 'warning') {
            indicator.style.color = 'var(--warning-color)';
            text.textContent = '系统警告';
        } else {
            indicator.style.color = 'var(--danger-color)';
            text.textContent = '系统异常';
        }
    }
}

function updateRobotStatus(status) {
    const statusElement = document.getElementById('robot-status');
    const text = statusElement?.querySelector('span');
    
    if (text) {
        const statusMap = {
            'idle': '机器人空闲',
            'working': '机器人工作中',
            'charging': '机器人充电中',
            'error': '机器人故障'
        };
        text.textContent = statusMap[status] || '机器人状态未知';
    }
}

// 静默更新系统状态（无动画效果）
function updateSystemStatusSilent(status) {
    const statusElement = document.getElementById('system-status');
    const indicator = statusElement?.querySelector('.status-indicator');
    const text = statusElement?.querySelector('span');
    
    if (statusElement && indicator && text) {
        if (status === 'normal') {
            indicator.style.color = 'var(--success-color)';
            text.textContent = '系统正常';
        } else if (status === 'warning') {
            indicator.style.color = 'var(--warning-color)';
            text.textContent = '系统警告';
        } else {
            indicator.style.color = 'var(--danger-color)';
            text.textContent = '系统异常';
        }
    }
}

// 静默更新机器人状态（无动画效果）
function updateRobotStatusSilent(status) {
    const statusElement = document.getElementById('robot-status');
    const text = statusElement?.querySelector('span');
    
    if (text) {
        const statusMap = {
            'idle': '机器人空闲',
            'working': '机器人工作中',
            'charging': '机器人充电中',
            'error': '机器人故障'
        };
        text.textContent = statusMap[status] || '机器人状态未知';
    }
}

// 语音控制功能
function toggleVoice() {
    voiceEnabled = !voiceEnabled;
    const voiceBtn = document.getElementById('voice-toggle');
    const icon = voiceBtn?.querySelector('i');
    
    if (voiceBtn && icon) {
        if (voiceEnabled) {
            voiceBtn.classList.remove('muted');
            icon.className = 'fas fa-volume-up';
            playVoice('语音提示已开启');
        } else {
            voiceBtn.classList.add('muted');
            icon.className = 'fas fa-volume-mute';
        }
    }
}

function playVoice(text, priority = 'normal') {
    if (!voiceEnabled) return;
    
    fetch('/api/voice/speak', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: text,
            priority: priority
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            console.warn('语音播放失败:', data.message);
        }
    })
    .catch(error => {
        console.error('语音播放错误:', error);
    });
}

// 时间显示
function updateCurrentTime() {
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        const now = new Date();
        const timeString = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        timeElement.textContent = timeString;
    }
}

// 自动刷新功能
function startAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    // 只在页面可见时进行自动刷新
    refreshInterval = setInterval(() => {
        if (!isPageVisible) return;
        
        // 静默刷新，不显示加载提示
        if (currentModule === 'dashboard') {
            loadDashboardDataSilent();
        } else {
            loadModuleDataSilent(currentModule);
        }
    }, 15000); // 优化为15秒刷新一次，提高响应性
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// 加载提示
function showLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// 通知功能
function showNotification(message, type = 'info', duration = 5000) {
    const notificationsContainer = document.getElementById('notifications');
    if (!notificationsContainer) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = getNotificationIcon(type);
    notification.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    notificationsContainer.appendChild(notification);
    notification.classList.add('fade-in');
    
    // 自动移除通知
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
    
    // 播放语音通知
    if (voiceEnabled && (type === 'warning' || type === 'error')) {
        playVoice(message, 'urgent');
    }
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'fas fa-check-circle',
        'warning': 'fas fa-exclamation-triangle',
        'error': 'fas fa-times-circle',
        'info': 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
}

// 模态框功能
let modalCallback = null;

function showModal(title, message, callback = null) {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    
    if (modalOverlay && modalTitle && modalMessage) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalCallback = callback;
        modalOverlay.style.display = 'flex';
    }
}

function closeModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
        modalCallback = null;
    }
}

function confirmAction() {
    if (modalCallback && typeof modalCallback === 'function') {
        modalCallback();
    }
    closeModal();
}

// 页面可见性监听
function setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
        isPageVisible = !document.hidden;
        if (isPageVisible) {
            // 页面变为可见时，刷新当前模块数据
        if (currentModule === 'dashboard') {
            loadDashboardDataOptimized();
        } else {
            loadModuleData(currentModule);
        }
        }
    });
}

// 缓存管理函数
function getCachedData(key) {
    const now = Date.now();
    const cacheTime = lastCacheTime.get(key);
    
    if (cacheTime && (now - cacheTime) < CACHE_DURATION) {
        return dataCache.get(key);
    }
    return null;
}

function setCachedData(key, data) {
    dataCache.set(key, data);
    lastCacheTime.set(key, Date.now());
}

function clearCache() {
    dataCache.clear();
    lastCacheTime.clear();
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 简化的API请求封装
function apiRequest(url, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        cache: 'no-cache'
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    console.log('发送API请求:', url, finalOptions);
    
    // 使用fetch API
    return fetch(url, finalOptions)
        .then(response => {
            console.log('Fetch响应:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('API数据:', data);
            return data;
        })
        .catch(error => {
            console.error('API请求失败:', error);
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                showNotification('网络连接失败，请检查服务器状态', 'error');
            } else {
                showNotification('请求失败: ' + error.message, 'error');
            }
            throw error;
        });
}

// 工具函数
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY'
    }).format(amount);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('zh-CN');
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('zh-CN');
}

// 数据验证
function validateRequired(value, fieldName) {
    if (!value || value.toString().trim() === '') {
        showNotification(`${fieldName}不能为空`, 'warning');
        return false;
    }
    return true;
}

function validateNumber(value, fieldName, min = null, max = null) {
    const num = parseFloat(value);
    if (isNaN(num)) {
        showNotification(`${fieldName}必须是有效数字`, 'warning');
        return false;
    }
    if (min !== null && num < min) {
        showNotification(`${fieldName}不能小于${min}`, 'warning');
        return false;
    }
    if (max !== null && num > max) {
        showNotification(`${fieldName}不能大于${max}`, 'warning');
        return false;
    }
    return true;
}

// 导出全局函数供其他模块使用
window.app = {
    showModule,
    showLoading,
    hideLoading,
    showNotification,
    showModal,
    closeModal,
    playVoice,
    apiRequest,
    formatNumber,
    formatCurrency,
    formatDate,
    formatDateTime,
    validateRequired,
    validateNumber,
    
    // 确认对话框
    confirmAction: function(title, message, onConfirm, onCancel) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content confirm-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-exclamation-triangle"></i> ${title}</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeConfirmModal(false)">取消</button>
                    <button type="button" class="btn btn-danger" onclick="closeConfirmModal(true)">确认</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 添加确认对话框样式
        if (!document.getElementById('confirm-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'confirm-modal-styles';
            style.textContent = `
                .confirm-modal {
                    max-width: 400px;
                }
                
                .confirm-modal .modal-header {
                    background: #fff3cd;
                    border-bottom: 1px solid #ffeaa7;
                }
                
                .confirm-modal .modal-header h3 {
                    color: #856404;
                }
                
                .confirm-modal .modal-body p {
                    margin: 0;
                    line-height: 1.5;
                    color: var(--dark-color);
                }
            `;
            document.head.appendChild(style);
        }
        
        // 全局函数用于关闭确认对话框
        window.closeConfirmModal = function(confirmed) {
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                modal.remove();
            }
            
            if (confirmed && onConfirm) {
                onConfirm();
            } else if (!confirmed && onCancel) {
                onCancel();
            }
            
            // 清理全局函数
            delete window.closeConfirmModal;
        };
    }
};

// 错误处理
window.addEventListener('error', function(event) {
    console.error('全局错误:', event.error);
    showNotification('系统发生错误，请刷新页面重试', 'error');
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('未处理的Promise拒绝:', event.reason);
    showNotification('系统发生错误，请刷新页面重试', 'error');
});

console.log('QuantumFlow 量子流仓储平台前端应用已加载');