// 库存管理模块

let inventoryData = [];
let currentPage = 1;
const itemsPerPage = 10;
let autoRefreshInterval = null;
let isAutoRefreshEnabled = true; // 固定启用自动刷新

// 加载库存管理模块
function loadInventoryModule() {
    console.log('加载库存管理模块');
    
    const moduleContent = document.getElementById('inventory-module');
    if (!moduleContent) return;
    
    // 渲染模块界面
    moduleContent.innerHTML = `
        <div class="module-header">
            <h3><i class="fas fa-boxes"></i> 库存管理</h3>
            <div class="module-actions">
                <button class="btn btn-primary" onclick="showAddProductModal()">
                    <i class="fas fa-plus"></i> 添加产品
                </button>
                <button class="btn btn-secondary" onclick="refreshInventory()">
                    <i class="fas fa-sync-alt"></i> 刷新
                </button>
                <button class="btn btn-warning" onclick="checkLowStock()">
                    <i class="fas fa-exclamation-triangle"></i> 库存预警
                </button>
                <span class="auto-refresh-status">
                    <i class="fas fa-sync-alt fa-spin"></i> 自动刷新中
                </span>
            </div>
        </div>
        
        <div class="inventory-controls">
            <div class="search-bar">
                <input type="text" id="inventory-search" class="form-input" placeholder="搜索产品名称或编号...">
                <button class="btn btn-primary" onclick="searchInventory()">
                    <i class="fas fa-search"></i> 搜索
                </button>
            </div>
            
            <div class="filter-controls">
                <select id="category-filter" class="form-select">
                    <option value="">所有类别</option>
                    <option value="原材料">原材料</option>
                    <option value="半成品">半成品</option>
                    <option value="成品">成品</option>
                </select>
                
                <select id="location-filter" class="form-select">
                    <option value="">所有位置</option>
                    <option value="A区">A区</option>
                    <option value="B区">B区</option>
                    <option value="C区">C区</option>
                    <option value="未分配">未分配</option>
                </select>
                
                <select id="status-filter" class="form-select">
                    <option value="">所有状态</option>
                    <option value="正常">正常</option>
                    <option value="低库存">低库存</option>
                    <option value="缺货">缺货</option>
                </select>
            </div>
        </div>
        
        <div class="inventory-stats">
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-box"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-value" id="total-products-count">0</span>
                    <span class="stat-label">产品种类</span>
                </div>
            </div>
            
            <div class="stat-card warning">
                <div class="stat-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-value" id="low-stock-products">0</span>
                    <span class="stat-label">低库存产品</span>
                </div>
            </div>
            
            <div class="stat-card danger">
                <div class="stat-icon">
                    <i class="fas fa-times-circle"></i>
                </div>
                <div class="stat-info">
                    <span class="stat-value" id="out-of-stock-products">0</span>
                    <span class="stat-label">缺货产品</span>
                </div>
            </div>
        </div>
        
        <div class="table-container">
            <table class="table" id="inventory-table">
                <thead>
                    <tr>
                        <th>产品编号</th>
                        <th>产品名称</th>
                        <th>类别</th>
                        <th>仓库位置</th>
                        <th>当前库存</th>
                        <th>安全库存</th>
                        <th>状态</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="inventory-tbody">
                    <!-- 数据将通过JavaScript填充 -->
                </tbody>
            </table>
        </div>
        
        <div class="pagination" id="inventory-pagination">
            <!-- 分页控件将通过JavaScript生成 -->
        </div>
    `;
    
    // 添加样式
    addInventoryStyles();
    
    // 加载库存数据
    loadInventoryData();
    
    // 设置事件监听器
    setupInventoryEventListeners();
    
    // 启动自动刷新
    startAutoRefresh();
}

function addInventoryStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .module-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .module-actions {
            display: flex;
            gap: 10px;
        }
        
        .inventory-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            gap: 20px;
        }
        
        .search-bar {
            display: flex;
            gap: 10px;
            flex: 1;
            max-width: 400px;
        }
        
        .filter-controls {
            display: flex;
            gap: 15px;
        }
        
        .inventory-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }
        
        .stat-card {
            background: white;
            border-radius: var(--border-radius);
            padding: 20px;
            box-shadow: var(--shadow);
            border: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            gap: 15px;
            transition: var(--transition);
        }
        
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }
        
        .auto-refresh-status {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--success-color);
            font-size: 14px;
            font-weight: 500;
            padding: 8px 12px;
            background: rgba(40, 167, 69, 0.1);
            border-radius: var(--border-radius);
            border: 1px solid rgba(40, 167, 69, 0.2);
        }
        
        .auto-refresh-status i {
            color: var(--success-color);
        }
        
        .location-badge {
            display: inline-block;
            padding: 4px 8px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            text-align: center;
            min-width: 60px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .location-badge:empty:before {
            content: '未分配';
            background: #6c757d;
        }
        
        .stat-card.warning {
            border-left: 4px solid var(--warning-color);
        }
        
        .stat-card.danger {
            border-left: 4px solid var(--danger-color);
        }
        
        .stat-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--light-color);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: var(--primary-color);
        }
        
        .stat-card.warning .stat-icon {
            background: rgba(217, 119, 6, 0.1);
            color: var(--warning-color);
        }
        
        .stat-card.danger .stat-icon {
            background: rgba(220, 38, 38, 0.1);
            color: var(--danger-color);
        }
        
        .stat-info {
            flex: 1;
        }
        
        .stat-value {
            display: block;
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--dark-color);
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: var(--secondary-color);
            font-weight: 500;
        }
        
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
            text-align: center;
        }
        
        .status-normal {
            background: #d1fae5;
            color: #065f46;
        }
        
        .status-low {
            background: #fef3c7;
            color: #92400e;
        }
        
        .status-out {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .action-buttons {
            display: flex;
            gap: 5px;
        }
        
        .btn-sm {
            padding: 6px 12px;
            font-size: 0.8rem;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            margin-top: 25px;
        }
        
        .pagination button {
            padding: 8px 12px;
            border: 1px solid var(--border-color);
            background: white;
            border-radius: var(--border-radius);
            cursor: pointer;
            transition: var(--transition);
        }
        
        .pagination button:hover {
            background: var(--light-color);
        }
        
        .pagination button.active {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }
        
        .pagination button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
            .inventory-controls {
                flex-direction: column;
                align-items: stretch;
            }
            
            .search-bar {
                max-width: none;
            }
            
            .filter-controls {
                justify-content: space-between;
            }
            
            .module-header {
                flex-direction: column;
                gap: 15px;
                align-items: stretch;
            }
            
            .module-actions {
                justify-content: center;
            }
        }
        
        .inventory-config-section {
            margin-top: 20px;
            padding: 15px;
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-radius: 8px;
            border: 1px solid #dee2e6;
        }
        
        .inventory-config-section h4 {
            margin: 0 0 15px 0;
            color: #495057;
            font-size: 16px;
            font-weight: 600;
        }
        
        .inventory-config-section h4 i {
            margin-right: 8px;
            color: #007bff;
        }
    `;
    document.head.appendChild(style);
}

function setupInventoryEventListeners() {
    // 搜索框回车事件
    const searchInput = document.getElementById('inventory-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchInventory();
            }
        });
    }
    
    // 筛选器变化事件
    const categoryFilter = document.getElementById('category-filter');
    const locationFilter = document.getElementById('location-filter');
    const statusFilter = document.getElementById('status-filter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterInventory);
    }
    
    if (locationFilter) {
        locationFilter.addEventListener('change', filterInventory);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterInventory);
    }
}

function loadInventoryData() {
    console.log('开始加载库存数据...');
    // 直接使用备用方案，因为fetch似乎有问题
    loadInventoryDataFallback();
}

// 备用数据加载方案
function loadInventoryDataFallback() {
    console.log('使用备用方案加载库存数据...');
    app.showLoading();
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/inventory', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            console.log('XHR备用方案状态:', xhr.status, xhr.statusText);
            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    console.log('备用方案API响应数据:', data);
                    if (data && data.success) {
                        inventoryData = data.data || [];
                        console.log('备用方案库存数据已设置:', inventoryData);
                        updateInventoryStats();
                        renderInventoryTable();
                        app.playVoice('库存数据已更新');
                        app.showNotification('数据加载成功', 'success');
                    } else {
                        console.error('备用方案API返回失败:', data);
                        app.showNotification('加载库存数据失败', 'error');
                    }
                } catch (e) {
                    console.error('备用方案JSON解析错误:', e);
                    app.showNotification('数据解析错误', 'error');
                }
            } else {
                console.error('备用方案请求失败:', xhr.status, xhr.statusText);
                app.showNotification('网络连接错误', 'error');
            }
            app.hideLoading();
        }
    };
    
    xhr.onerror = function() {
        console.error('备用方案网络错误');
        app.showNotification('网络连接失败', 'error');
        app.hideLoading();
    };
    
    xhr.send();
}

function updateInventoryStats() {
    const totalProducts = inventoryData.length;
    const lowStockProducts = inventoryData.filter(item => item.inventory.current_stock <= item.inventory.safety_stock).length;
    const outOfStockProducts = inventoryData.filter(item => item.inventory.current_stock === 0).length;
    
    // 安全更新统计数据，检查元素是否存在
    const totalProductsEl = document.getElementById('total-products-count');
    if (totalProductsEl) totalProductsEl.textContent = totalProducts;
    
    const lowStockEl = document.getElementById('low-stock-products');
    if (lowStockEl) lowStockEl.textContent = lowStockProducts;
    
    const outOfStockEl = document.getElementById('out-of-stock-products');
    if (outOfStockEl) outOfStockEl.textContent = outOfStockProducts;
}

function renderInventoryTable() {
    console.log('开始渲染库存表格...');
    const tbody = document.getElementById('inventory-tbody');
    if (!tbody) {
        console.error('找不到表格tbody元素');
        return;
    }
    
    console.log('当前库存数据:', inventoryData);
    console.log('数据长度:', inventoryData.length);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = inventoryData.slice(startIndex, endIndex);
    console.log('当前页数据:', pageData);
    
    tbody.innerHTML = pageData.map(item => {
        const status = getStockStatus(item.inventory);
        const statusClass = getStatusClass(status);
        
        return `
            <tr>
                <td>${item.product.model || 'N/A'}</td>
                <td>${item.product.name}</td>
                <td>${item.product.category}</td>
                <td><span class="location-badge">${item.inventory.location || '未分配'}</span></td>
                <td>${item.inventory.current_stock}</td>
                <td>${item.inventory.safety_stock}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-sm" onclick="editProduct(${item.product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-success btn-sm" onclick="adjustStock(${item.product.id})">
                            <i class="fas fa-plus-minus"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${item.product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    renderPagination();
}

function getStockStatus(inventory) {
    if (inventory.current_stock === 0) {
        return '缺货';
    } else if (inventory.current_stock <= inventory.safety_stock) {
        return '低库存';
    } else {
        return '正常';
    }
}

function getStatusClass(status) {
    switch(status) {
        case '正常': return 'status-normal';
        case '低库存': return 'status-low';
        case '缺货': return 'status-out';
        default: return 'status-normal';
    }
}

function renderPagination() {
    const pagination = document.getElementById('inventory-pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(inventoryData.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="active">${i}</button>`;
        } else {
            paginationHTML += `<button onclick="changePage(${i})">${i}</button>`;
        }
    }
    
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    const totalPages = Math.ceil(inventoryData.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderInventoryTable();
}

function searchInventory() {
    const searchTerm = document.getElementById('inventory-search').value.toLowerCase();
    
    if (searchTerm.trim() === '') {
        loadInventoryData();
        return;
    }
    
    const filteredData = inventoryData.filter(item => 
        item.product.name.toLowerCase().includes(searchTerm) ||
        (item.product.model && item.product.model.toLowerCase().includes(searchTerm))
    );
    
    inventoryData = filteredData;
    currentPage = 1;
    renderInventoryTable();
    updateInventoryStats();
    
    app.playVoice(`找到${filteredData.length}个匹配的产品`);
}

function filterInventory() {
    const categoryFilter = document.getElementById('category-filter').value;
    const locationFilter = document.getElementById('location-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    loadInventoryData(); // 重新加载原始数据
    
    setTimeout(() => {
        let filteredData = [...inventoryData];
        
        if (categoryFilter) {
            filteredData = filteredData.filter(item => item.product.category === categoryFilter);
        }
        
        if (locationFilter) {
            if (locationFilter === '未分配') {
                filteredData = filteredData.filter(item => !item.inventory.location || item.inventory.location.trim() === '');
            } else {
                filteredData = filteredData.filter(item => item.inventory.location && item.inventory.location.includes(locationFilter));
            }
        }
        
        if (statusFilter) {
            filteredData = filteredData.filter(item => getStockStatus(item.inventory) === statusFilter);
        }
        
        inventoryData = filteredData;
        currentPage = 1;
        renderInventoryTable();
        updateInventoryStats();
    }, 100);
}

function refreshInventory() {
    currentPage = 1;
    document.getElementById('inventory-search').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('location-filter').value = '';
    document.getElementById('status-filter').value = '';
    loadInventoryData();
    app.playVoice('库存数据已刷新');
}

// 启动自动刷新（固定功能）
function startAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    autoRefreshInterval = setInterval(() => {
        // 检查库存模块是否仍然活跃
        const inventoryModule = document.getElementById('inventory-module');
        if (inventoryModule && inventoryModule.style.display !== 'none') {
            refreshInventoryQuick();
        }
    }, 30000); // 每30秒刷新一次
    
    console.log('库存自动刷新已启动（每30秒）');
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        isAutoRefreshEnabled = false;
        const btn = document.getElementById('auto-refresh-btn');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-play"></i> 自动刷新';
            btn.className = 'btn btn-info';
        }
    }
}

// 快速刷新库存数据（优化版本）
function refreshInventoryQuick() {
    // 检查库存模块是否存在
    const inventoryModule = document.getElementById('inventory-module');
    if (!inventoryModule) {
        console.log('库存模块未找到，跳过自动刷新');
        return;
    }
    
    // 显示加载状态
    const tableBody = document.getElementById('inventory-tbody');
    if (tableBody) {
        tableBody.style.opacity = '0.6';
    }
    
    // 异步加载数据
    fetch('/api/inventory')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                inventoryData = data.data;
                // 快速更新表格
                renderInventoryTable();
                updateInventoryStats();
                
                // 恢复透明度
                if (tableBody) {
                    tableBody.style.opacity = '1';
                }
            }
        })
        .catch(error => {
            console.error('快速刷新失败:', error);
            // 恢复透明度
            if (tableBody) {
                tableBody.style.opacity = '1';
            }
            // 如果快速刷新失败且模块仍存在，使用完整加载
            if (document.getElementById('inventory-module')) {
                loadInventoryData();
            }
        });
}

function checkLowStock() {
    const lowStockItems = inventoryData.filter(item => item.inventory.current_stock <= item.inventory.safety_stock);
    
    if (lowStockItems.length === 0) {
        app.showNotification('当前没有低库存产品', 'success');
        app.playVoice('当前没有低库存产品');
    } else {
        const message = `发现${lowStockItems.length}个低库存产品`;
        app.showNotification(message, 'warning');
        app.playVoice(message, 'urgent');
        
        // 筛选显示低库存产品
        document.getElementById('status-filter').value = '低库存';
        filterInventory();
    }
}

function showAddProductModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-plus"></i> 添加新产品</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="add-product-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="product-name">产品名称 *</label>
                            <input type="text" id="product-name" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label for="product-model">产品型号 *</label>
                            <input type="text" id="product-model" class="form-input" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="product-category">产品类别 *</label>
                            <select id="product-category" class="form-select" required>
                                <option value="">请选择类别</option>
                                <option value="轴承">轴承</option>
                                <option value="齿轮">齿轮</option>
                                <option value="紧固件">紧固件</option>
                                <option value="密封件">密封件</option>
                                <option value="弹性件">弹性件</option>
                                <option value="其他">其他</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="product-unit">计量单位</label>
                            <input type="text" id="product-unit" class="form-input" value="个">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="product-description">产品描述</label>
                        <textarea id="product-description" class="form-textarea" rows="3"></textarea>
                    </div>
                    <div class="form-section">
                        <h4>库存设置</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="initial-stock">初始库存</label>
                                <input type="number" id="initial-stock" class="form-input" value="0" min="0">
                            </div>
                            <div class="form-group">
                                <label for="safety-stock">安全库存</label>
                                <input type="number" id="safety-stock" class="form-input" value="10" min="0">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="max-stock">最大库存</label>
                                <input type="number" id="max-stock" class="form-input" value="1000" min="1">
                            </div>
                            <div class="form-group">
                                <label for="product-location">存放位置</label>
                                <select id="product-location" class="form-select">
                                    <option value="">未分配</option>
                                    <option value="A区">A区</option>
                                    <option value="B区">B区</option>
                                    <option value="C区">C区</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button type="button" class="btn btn-primary" onclick="submitAddProduct()">添加产品</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加模态框样式
    if (!document.getElementById('modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            
            .modal-content {
                background: white;
                border-radius: 8px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #eee;
            }
            
            .modal-header h3 {
                margin: 0;
                color: var(--dark-color);
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.2rem;
                color: #666;
                cursor: pointer;
                padding: 5px;
            }
            
            .modal-body {
                padding: 20px;
            }
            
            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding: 20px;
                border-top: 1px solid #eee;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                color: var(--dark-color);
            }
            
            .form-input, .form-select, .form-textarea {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                box-sizing: border-box;
            }
            
            .form-input:focus, .form-select:focus, .form-textarea:focus {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
            }
            
            .form-section {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #eee;
            }
            
            .form-section h4 {
                margin: 0 0 15px 0;
                color: var(--dark-color);
                font-size: 1.1rem;
            }
        `;
        document.head.appendChild(style);
    }
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function submitAddProduct() {
    const form = document.getElementById('add-product-form');
    const formData = new FormData(form);
    
    // 获取表单数据
    const productData = {
        name: document.getElementById('product-name').value.trim(),
        model: document.getElementById('product-model').value.trim(),
        category: document.getElementById('product-category').value,
        unit: document.getElementById('product-unit').value.trim() || '个',
        description: document.getElementById('product-description').value.trim(),
        initial_stock: parseInt(document.getElementById('initial-stock').value) || 0,
        safety_stock: parseInt(document.getElementById('safety-stock').value) || 10,
        max_stock: parseInt(document.getElementById('max-stock').value) || 1000,
        location: document.getElementById('product-location').value.trim()
    };
    
    // 验证必需字段
    if (!productData.name || !productData.model || !productData.category) {
        app.showNotification('请填写所有必需字段', 'error');
        return;
    }
    
    // 显示加载状态
    app.showLoading();
    
    // 发送添加请求
    app.apiRequest('/api/products', {
        method: 'POST',
        body: JSON.stringify(productData)
    })
    .then(data => {
        if (data.success) {
            app.showNotification('产品添加成功', 'success');
            app.playVoice('产品添加成功');
            closeModal();
            // 快速刷新库存数据
            refreshInventoryQuick(); // 重新加载库存数据
        } else {
            app.showNotification(data.message || '添加产品失败', 'error');
        }
    })
    .catch(error => {
        console.error('添加产品错误:', error);
        app.showNotification('网络连接错误', 'error');
    })
    .finally(() => {
        app.hideLoading();
    });
}

function editProduct(productId) {
    // 获取产品信息
    app.showLoading();
    
    app.apiRequest(`/api/products/${productId}`, { method: 'GET' })
    .then(data => {
        if (data.success) {
            showEditProductModal(data.data);
        } else {
            app.showNotification('获取产品信息失败', 'error');
        }
    })
    .catch(error => {
        console.error('获取产品信息错误:', error);
        app.showNotification('网络连接错误', 'error');
    })
    .finally(() => {
        app.hideLoading();
    });
}

function showEditProductModal(product) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> 编辑产品</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="edit-product-form">
                    <input type="hidden" id="edit-product-id" value="${product.id}">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-product-name">产品名称 *</label>
                            <input type="text" id="edit-product-name" class="form-input" value="${product.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-product-model">产品型号 *</label>
                            <input type="text" id="edit-product-model" class="form-input" value="${product.model}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-product-category">产品类别 *</label>
                            <select id="edit-product-category" class="form-select" required>
                                <option value="轴承" ${product.category === '轴承' ? 'selected' : ''}>轴承</option>
                                <option value="齿轮" ${product.category === '齿轮' ? 'selected' : ''}>齿轮</option>
                                <option value="紧固件" ${product.category === '紧固件' ? 'selected' : ''}>紧固件</option>
                                <option value="密封件" ${product.category === '密封件' ? 'selected' : ''}>密封件</option>
                                <option value="弹性件" ${product.category === '弹性件' ? 'selected' : ''}>弹性件</option>
                                <option value="其他" ${product.category === '其他' ? 'selected' : ''}>其他</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-product-unit">计量单位</label>
                            <input type="text" id="edit-product-unit" class="form-input" value="${product.unit}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="edit-product-description">产品描述</label>
                        <textarea id="edit-product-description" class="form-textarea" rows="3">${product.description || ''}</textarea>
                    </div>
                    
                    <div class="inventory-config-section">
                        <h4><i class="fas fa-warehouse"></i> 库存配置</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-safety-stock">安全库存</label>
                                <input type="number" id="edit-safety-stock" class="form-input" value="${product.inventory?.safety_stock || 10}" min="0">
                            </div>
                            <div class="form-group">
                                <label for="edit-max-stock">最大库存</label>
                                <input type="number" id="edit-max-stock" class="form-input" value="${product.inventory?.max_stock || 1000}" min="0">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="edit-location">存放位置</label>
                            <select id="edit-location" class="form-select">
                                <option value="" ${!product.inventory?.location ? 'selected' : ''}>未分配</option>
                                <option value="A区" ${product.inventory?.location === 'A区' ? 'selected' : ''}>A区</option>
                                <option value="B区" ${product.inventory?.location === 'B区' ? 'selected' : ''}>B区</option>
                                <option value="C区" ${product.inventory?.location === 'C区' ? 'selected' : ''}>C区</option>
                            </select>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger" onclick="confirmDeleteProduct(${product.id})">删除产品</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button type="button" class="btn btn-primary" onclick="submitEditProduct()">保存更改</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function submitEditProduct() {
    const productId = document.getElementById('edit-product-id').value;
    
    // 获取产品表单数据
    const productData = {
        name: document.getElementById('edit-product-name').value.trim(),
        model: document.getElementById('edit-product-model').value.trim(),
        category: document.getElementById('edit-product-category').value,
        unit: document.getElementById('edit-product-unit').value.trim() || '个',
        description: document.getElementById('edit-product-description').value.trim()
    };
    
    // 获取库存配置数据
    const inventoryData = {
        safety_stock: parseInt(document.getElementById('edit-safety-stock').value) || 10,
        max_stock: parseInt(document.getElementById('edit-max-stock').value) || 1000,
        location: document.getElementById('edit-location').value
    };
    
    // 验证必需字段
    if (!productData.name || !productData.model || !productData.category) {
        app.showNotification('请填写所有必需字段', 'error');
        return;
    }
    
    // 显示加载状态
    app.showLoading();
    
    // 先更新产品信息
    app.apiRequest(`/api/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
    })
    .then(data => {
        if (data.success) {
            // 产品更新成功后，更新库存配置
            return app.apiRequest(`/api/inventory/${productId}/edit`, {
                method: 'PUT',
                body: JSON.stringify(inventoryData)
            });
        } else {
            throw new Error(data.message || '更新产品失败');
        }
    })
    .then(data => {
        if (data.success) {
            app.showNotification('产品和库存信息更新成功', 'success');
            app.playVoice('产品和库存信息更新成功');
            closeModal();
            // 快速刷新库存数据
            refreshInventoryQuick();
        } else {
            app.showNotification(data.message || '更新库存配置失败', 'error');
        }
    })
    .catch(error => {
        console.error('更新产品错误:', error);
        app.showNotification(error.message || '网络连接错误', 'error');
    })
    .finally(() => {
        app.hideLoading();
    });
}

function confirmDeleteProduct(productId) {
    app.confirmAction(
        '确认删除',
        '确定要删除这个产品吗？删除后将无法恢复，且会同时删除相关的库存记录。',
        () => deleteProduct(productId)
    );
}

function deleteProduct(productId) {
    app.showLoading();
    
    app.apiRequest(`/api/products/${productId}`, {
        method: 'DELETE'
    })
    .then(data => {
        if (data.success) {
                    app.showNotification('产品删除成功', 'success');
                    app.playVoice('产品删除成功');
                    // 快速刷新库存数据
                    refreshInventoryQuick(); // 重新加载库存数据
        } else {
            app.showNotification(data.message || '删除产品失败', 'error');
        }
    })
    .catch(error => {
        console.error('删除产品错误:', error);
        app.showNotification('网络连接错误', 'error');
    })
    .finally(() => {
        app.hideLoading();
    });
}

function adjustStock(productId) {
    // 获取产品信息用于库存调整
    const product = inventoryData.find(item => item.product.id === productId);
    if (!product) {
        app.showNotification('产品信息未找到', 'error');
        return;
    }
    
    showAdjustStockModal(product);
}

function showAdjustStockModal(product) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-plus-minus"></i> 库存调整 - ${product.product.name}</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="current-stock-info">
                    <div class="info-card">
                        <h4>当前库存信息</h4>
                        <div class="stock-details">
                            <div class="detail-item">
                                <span class="label">当前库存:</span>
                                <span class="value">${product.inventory.current_stock}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">安全库存:</span>
                                <span class="value">${product.inventory.safety_stock}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">存放位置:</span>
                                <span class="value">${product.inventory.location || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <form id="adjust-stock-form">
                    <input type="hidden" id="adjust-product-id" value="${product.product.id}">
                    
                    <div class="form-group">
                        <label for="operation-type">操作类型 *</label>
                        <select id="operation-type" class="form-select" required onchange="toggleOperationFields()">
                            <option value="">请选择操作类型</option>
                            <option value="manual">手动调整</option>
                            <option value="sale">销售出库</option>
                            <option value="production">生产入库</option>
                        </select>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="quantity-change">数量变化 *</label>
                            <input type="number" id="quantity-change" class="form-input" placeholder="正数=入库，负数=出库" required>
                            <small class="form-hint">正数表示入库，负数表示出库</small>
                        </div>
                        <div class="form-group">
                            <label for="unit-price">单价</label>
                            <input type="number" id="unit-price" class="form-input" step="0.01" placeholder="0.00">
                        </div>
                    </div>
                    
                    <div id="sale-fields" class="sale-fields" style="display: none;">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="customer-name">客户名称</label>
                                <input type="text" id="customer-name" class="form-input" placeholder="客户名称">
                            </div>
                            <div class="form-group">
                                <label for="order-number">订单号</label>
                                <input type="text" id="order-number" class="form-input" placeholder="订单号">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="adjustment-reason">调整原因</label>
                        <textarea id="adjustment-reason" class="form-textarea" rows="3" placeholder="请说明调整原因..."></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button type="button" class="btn btn-primary" onclick="submitStockAdjustment()">确认调整</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function toggleOperationFields() {
    const operationType = document.getElementById('operation-type').value;
    const saleFields = document.getElementById('sale-fields');
    const quantityInput = document.getElementById('quantity-change');
    
    if (operationType === 'sale') {
        saleFields.style.display = 'block';
        quantityInput.placeholder = '出库数量（正数）';
    } else {
        saleFields.style.display = 'none';
        quantityInput.placeholder = '正数=入库，负数=出库';
    }
}

function submitStockAdjustment() {
    const productId = document.getElementById('adjust-product-id').value;
    const operationType = document.getElementById('operation-type').value;
    let quantityChange = parseInt(document.getElementById('quantity-change').value);
    const unitPrice = parseFloat(document.getElementById('unit-price').value) || 0;
    const reason = document.getElementById('adjustment-reason').value.trim();
    
    // 验证必需字段
    if (!operationType || isNaN(quantityChange)) {
        app.showNotification('请填写所有必需字段', 'error');
        return;
    }
    
    // 销售操作时，数量应为负数
    if (operationType === 'sale' && quantityChange > 0) {
        quantityChange = -quantityChange;
    }
    
    // 构建请求数据
    const adjustmentData = {
        product_id: parseInt(productId),
        quantity_change: quantityChange,
        operation_type: operationType,
        unit_price: unitPrice,
        reason: reason
    };
    
    // 如果是销售操作，添加销售相关信息
    if (operationType === 'sale') {
        adjustmentData.customer = document.getElementById('customer-name').value.trim();
        adjustmentData.order_number = document.getElementById('order-number').value.trim();
        adjustmentData.total_amount = Math.abs(quantityChange) * unitPrice;
    }
    
    // 显示加载状态
    app.showLoading();
    
    // 发送库存调整请求
    app.apiRequest('/api/inventory/update', {
        method: 'POST',
        body: JSON.stringify(adjustmentData)
    })
    .then(data => {
        if (data.success) {
            app.showNotification('库存调整成功', 'success');
            app.playVoice('库存调整成功');
            closeModal();
            // 快速刷新库存数据
            refreshInventoryQuick();
        } else {
            app.showNotification(data.message || '库存调整失败', 'error');
        }
    })
    .catch(error => {
        console.error('库存调整错误:', error);
        app.showNotification('网络连接错误', 'error');
    })
    .finally(() => {
        app.hideLoading();
    });
}

// 导出函数供全局使用
window.loadInventoryModule = loadInventoryModule;
window.refreshInventory = refreshInventory;
window.searchInventory = searchInventory;
window.checkLowStock = checkLowStock;
window.showAddProductModal = showAddProductModal;
window.editProduct = editProduct;
window.adjustStock = adjustStock;
window.deleteProduct = deleteProduct;
window.changePage = changePage;
window.startAutoRefresh = startAutoRefresh;
window.stopAutoRefresh = stopAutoRefresh;

console.log('库存管理模块已加载');