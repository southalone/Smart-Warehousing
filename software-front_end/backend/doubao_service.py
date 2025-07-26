#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
豆包-seed-1.6-flash AI分析服务

本模块负责与豆包-seed-1.6-flash大模型进行交互，提供智能分析功能：
1. 库存分析与优化建议
2. 销售趋势分析与预测
3. 生产规划建议
4. 企业行动建议
5. 结合行业信息的综合分析
"""

import requests
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import threading
import time

# 配置日志
logger = logging.getLogger(__name__)

class DoubaoService:
    """
    豆包-seed-1.6-flash AI分析服务类
    """
    
    def __init__(self, api_key: str):
        """
        初始化豆包服务
        
        Args:
            api_key: 豆包 API密钥
        """
        self.api_key = api_key
        self.base_url = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        # 创建会话以复用连接
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        # 请求缓存，避免重复调用
        self._cache = {}
        self._cache_timeout = 300  # 缓存5分钟
    
    def analyze_business_data(self, inventory_data: List[Dict], sales_data: List[Dict], 
                            analysis_type: str = "comprehensive") -> Dict[str, Any]:
        """
        使用豆包-seed-1.6-flash分析业务数据
        
        Args:
            inventory_data: 库存数据列表
            sales_data: 销售历史数据列表
            analysis_type: 分析类型 (comprehensive/inventory/sales/production)
            
        Returns:
            分析结果字典
        """
        try:
            # 构建分析提示词
            prompt = self._build_analysis_prompt(inventory_data, sales_data, analysis_type)
            
            # 调用豆包 API
            response = self._call_doubao_api(prompt)
            
            # 解析响应
            analysis_result = self._parse_analysis_response(response)
            
            return {
                "success": True,
                "data": analysis_result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"豆包分析失败: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def _build_analysis_prompt(self, inventory_data: List[Dict], sales_data: List[Dict], 
                              analysis_type: str) -> str:
        """
        构建分析提示词
        """
        # 基础系统提示
        system_prompt = """
你是一位资深的企业运营分析专家，擅长数据分析、库存管理、销售预测和生产规划。
请基于提供的库存数据和销售历史数据，结合当前行业趋势，提供专业的分析和建议。

分析要求：
1. 深入分析当前库存状况，识别风险和机会
2. 基于销售历史预测未来趋势
3. 提供具体的生产规划建议
4. 给出可执行的企业行动建议
5. 考虑行业发展趋势和市场变化

请以结构化的方式返回分析结果，包含以下部分：
- 数据概览
- 关键发现
- 风险预警
- 机会识别
- 生产规划建议
- 企业行动建议
- 预测分析
"""
        
        # 数据摘要
        inventory_summary = self._summarize_inventory_data(inventory_data)
        sales_summary = self._summarize_sales_data(sales_data)
        
        # 构建完整提示词
        prompt = f"""
{system_prompt}

## 当前库存数据概览：
{inventory_summary}

## 销售历史数据概览：
{sales_summary}

## 分析类型：{analysis_type}

请基于以上数据进行深入分析，并提供专业的建议。请确保建议具体可行，并考虑实际业务场景。
"""
        
        return prompt
    
    def _summarize_inventory_data(self, inventory_data: List[Dict]) -> str:
        """
        汇总库存数据
        """
        if not inventory_data:
            return "暂无库存数据"
        
        total_products = len(inventory_data)
        total_stock = sum(item.get('current_stock', 0) for item in inventory_data)
        low_stock_items = [item for item in inventory_data if item.get('current_stock', 0) <= item.get('safety_stock', 0)]
        
        summary = f"""
- 总产品数量: {total_products}
- 总库存数量: {total_stock:,}
- 低库存产品数: {len(low_stock_items)}

主要产品库存状况：
"""
        
        # 添加前10个产品的详细信息
        for i, item in enumerate(inventory_data[:10]):
            product_name = item.get('product_name', f'产品{i+1}')
            current_stock = item.get('current_stock', 0)
            safety_stock = item.get('safety_stock', 0)
            status = "⚠️ 低库存" if current_stock <= safety_stock else "✅ 正常"
            summary += f"- {product_name}: 当前库存{current_stock}, 安全库存{safety_stock} {status}\n"
        
        return summary
    
    def _summarize_sales_data(self, sales_data: List[Dict]) -> str:
        """
        汇总销售数据
        """
        if not sales_data:
            return "暂无销售数据"
        
        total_sales = sum(item.get('total_amount', 0) for item in sales_data)
        total_quantity = sum(item.get('quantity', 0) for item in sales_data)
        avg_price = total_sales / total_quantity if total_quantity > 0 else 0
        
        # 按产品统计销售
        product_sales = {}
        for item in sales_data:
            product_id = item.get('product_id')
            if product_id:
                if product_id not in product_sales:
                    product_sales[product_id] = {'quantity': 0, 'amount': 0}
                product_sales[product_id]['quantity'] += item.get('quantity', 0)
                product_sales[product_id]['amount'] += item.get('total_amount', 0)
        
        summary = f"""
- 总销售额: ¥{total_sales:,.2f}
- 总销售数量: {total_quantity}
- 平均单价: ¥{avg_price:.2f}
- 销售记录数: {len(sales_data)}

热销产品TOP5：
"""
        
        # 按销售额排序，显示前5名
        sorted_products = sorted(product_sales.items(), key=lambda x: x[1]['amount'], reverse=True)[:5]
        for i, (product_id, data) in enumerate(sorted_products):
            summary += f"- 产品{product_id}: 销售额¥{data['amount']:,.2f}, 数量{data['quantity']}\n"
        
        return summary
    
    def _call_doubao_api(self, prompt: str) -> Dict[str, Any]:
        """
        调用豆包 API，带缓存和优化的超时处理
        """
        # 生成缓存键
        cache_key = hash(prompt)
        current_time = time.time()
        
        # 检查缓存
        if cache_key in self._cache:
            cached_data, timestamp = self._cache[cache_key]
            if current_time - timestamp < self._cache_timeout:
                logger.info("使用缓存的豆包响应")
                return cached_data
        
        payload = {
            "model": "doubao-seed-1.6-flash-250615",
            "messages": [
                {
                    "role": "user",
                    "content": prompt[:2000]  # 限制prompt长度
                }
            ],
            "max_tokens": 2000,
            "temperature": 0.7,
            "stream": False
        }
        
        try:
            # 使用session和合理的超时
            response = self.session.post(
                self.base_url,
                json=payload,
                timeout=(10, 60)  # (连接超时10秒, 读取超时60秒)
            )
            
            if response.status_code != 200:
                raise Exception(f"豆包 API调用失败: {response.status_code} - {response.text}")
            
            result = response.json()
            
            # 缓存结果
            self._cache[cache_key] = (result, current_time)
            
            # 清理过期缓存
            self._cleanup_cache(current_time)
            
            return result
            
        except requests.exceptions.Timeout:
            logger.warning("豆包 API请求超时")
            raise Exception("API请求超时")
        except requests.exceptions.RequestException as e:
            logger.error(f"豆包 API网络错误: {e}")
            raise Exception(f"网络连接失败: {str(e)}")
    
    def _cleanup_cache(self, current_time: float):
        """
        清理过期的缓存条目
        """
        expired_keys = [
            key for key, (_, timestamp) in self._cache.items()
            if current_time - timestamp >= self._cache_timeout
        ]
        for key in expired_keys:
            del self._cache[key]
    
    def clear_cache(self):
        """
        清空所有缓存
        """
        self._cache.clear()
        logger.info("豆包服务缓存已清空")
    
    def close(self):
        """
        关闭session连接
        """
        if hasattr(self, 'session'):
            self.session.close()
            logger.info("豆包服务连接已关闭")
    
    def _parse_analysis_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """
        解析豆包 API响应
        """
        try:
            content = response['choices'][0]['message']['content']
            
            # 解析结构化内容
            analysis_result = {
                "raw_content": content,
                "summary": self._extract_section(content, "数据概览"),
                "key_findings": self._extract_section(content, "关键发现"),
                "risk_alerts": self._extract_section(content, "风险预警"),
                "opportunities": self._extract_section(content, "机会识别"),
                "production_recommendations": self._extract_section(content, "生产规划建议"),
                "business_actions": self._extract_section(content, "企业行动建议"),
                "predictions": self._extract_section(content, "预测分析"),
                "generated_at": datetime.now().isoformat()
            }
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"解析豆包响应失败: {e}")
            # 返回原始内容作为备选
            return {
                "raw_content": response.get('choices', [{}])[0].get('message', {}).get('content', ''),
                "error": f"解析失败: {str(e)}",
                "generated_at": datetime.now().isoformat()
            }
    
    def _extract_section(self, content: str, section_name: str) -> str:
        """
        从内容中提取特定章节
        """
        try:
            # 简单的章节提取逻辑
            lines = content.split('\n')
            section_content = []
            in_section = False
            
            for line in lines:
                if section_name in line:
                    in_section = True
                    continue
                elif in_section and line.strip().startswith('#'):
                    # 遇到下一个章节标题，停止提取
                    break
                elif in_section:
                    section_content.append(line)
            
            return '\n'.join(section_content).strip()
            
        except Exception:
            return ""
    
    def get_industry_insights(self, industry: str = "制造业") -> Dict[str, Any]:
        """
        获取行业洞察信息
        """
        try:
            prompt = f"""
请提供{industry}的最新行业趋势和发展动态，包括：
1. 市场趋势
2. 技术发展
3. 政策影响
4. 竞争格局
5. 未来机会

请提供具体、实用的信息，帮助企业制定战略决策。
"""
            
            response = self._call_doubao_api(prompt)
            content = response['choices'][0]['message']['content']
            
            return {
                "success": True,
                "industry": industry,
                "insights": content,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"获取行业洞察失败: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }