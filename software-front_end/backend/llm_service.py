#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
大语言模型服务模块
提供智能策略分析功能
"""

import openai
import json
import logging
from datetime import datetime
import os

logger = logging.getLogger(__name__)

class LLMService:
    """大语言模型服务类"""
    
    def __init__(self):
        # 设置OpenAI API密钥（需要用户自己配置）
        self.api_key = os.getenv('OPENAI_API_KEY', '')
        if self.api_key:
            openai.api_key = self.api_key
        else:
            logger.warning("未设置OPENAI_API_KEY环境变量，将使用模拟分析")
    
    def analyze_business_situation(self, analysis_data):
        """分析企业经营状况并提供策略建议"""
        try:
            if not self.api_key:
                return {'error': 'LLM服务不可用，请配置OPENAI_API_KEY'}
            
            # 构建分析提示词
            prompt = self._build_analysis_prompt(analysis_data)
            
            # 调用OpenAI API
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "你是一位经验丰富的制造业生产顾问，专门为中小型金属加工件企业提供专业的生产和销售策略建议。请基于提供的数据进行深入分析，并给出具体可行的建议。"
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            analysis_result = response.choices[0].message.content
            
            return {
                'analysis_date': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
                'data_source': analysis_data,
                'analysis_result': analysis_result,
                'recommendations': self._extract_recommendations(analysis_result),
                'source': 'OpenAI GPT-3.5'
            }
            
        except Exception as e:
            logger.error(f"LLM分析失败: {e}")
            return {'error': 'LLM服务不可用，请配置OPENAI_API_KEY'}
    
    def _build_analysis_prompt(self, data):
        """构建分析提示词"""
        prompt = f"""
请基于以下数据分析当前企业的生产和销售状况，并给出3-5条具体的策略建议：

**企业数据概况：**
- 分析日期：{data.get('analysis_date', '未知')}
- 高消耗产品Top 5：{', '.join(data.get('high_consumption_products', []))}
- 低库存产品：{', '.join(data.get('low_stock_products', []))}
- 近30天销售增长率：{data.get('sales_growth_rate', 0)}%
- 当月销售量：{data.get('current_month_sales', 0)}件
- 上月销售量：{data.get('last_month_sales', 0)}件

**分析要求：**
1. 分析当前库存和销售的匹配情况
2. 评估销售增长趋势的可持续性
3. 识别潜在的供应链风险
4. 提供具体的生产计划建议
5. 给出库存优化策略

请用中文回答，结构清晰，建议具体可操作。
"""
        return prompt
    
    def _extract_recommendations(self, analysis_text):
        """从分析结果中提取建议"""
        try:
            # 简单的建议提取逻辑
            recommendations = []
            lines = analysis_text.split('\n')
            
            for line in lines:
                line = line.strip()
                # 查找包含建议关键词的行
                if any(keyword in line for keyword in ['建议', '应该', '需要', '可以', '推荐']):
                    if len(line) > 10:  # 过滤太短的行
                        recommendations.append(line)
            
            return recommendations[:5]  # 最多返回5条建议
            
        except Exception as e:
            logger.error(f"提取建议失败: {e}")
            return []
    
    # 模拟分析生成函数已移除
    
    def analyze_production_optimization(self, production_data):
        """分析生产优化建议"""
        try:
            if not self.api_key:
                return {'error': 'LLM服务不可用，请配置OPENAI_API_KEY'}
            
            prompt = f"""
作为生产管理专家，请分析以下生产数据并提供优化建议：

**生产数据：**
{json.dumps(production_data, ensure_ascii=False, indent=2)}

请从以下角度分析：
1. 生产计划的合理性
2. 资源配置的优化空间
3. 生产效率提升建议
4. 质量控制要点
5. 成本控制措施

请用中文回答，提供具体可操作的建议。
"""
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "你是一位专业的生产管理顾问。"},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=800,
                temperature=0.7
            )
            
            return {
                'analysis_type': 'production_optimization',
                'analysis_date': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
                'result': response.choices[0].message.content,
                'source': 'OpenAI GPT-3.5'
            }
            
        except Exception as e:
            logger.error(f"生产优化分析失败: {e}")
            return {'error': 'LLM服务不可用，请配置OPENAI_API_KEY'}
    
    # 模拟生产分析生成函数已移除
    
    def analyze_inventory_optimization(self, inventory_data):
        """分析库存优化建议"""
        try:
            if not self.api_key:
                return {'error': 'LLM服务不可用，请配置OPENAI_API_KEY'}
            
            prompt = f"""
作为库存管理专家，请分析以下库存数据并提供优化建议：

**库存数据：**
{json.dumps(inventory_data, ensure_ascii=False, indent=2)}

请从以下角度分析：
1. 库存结构的合理性
2. 安全库存水平设置
3. 库存周转率优化
4. 呆滞库存处理
5. 库存成本控制

请用中文回答，提供具体的优化方案。
"""
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "你是一位专业的库存管理顾问。"},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=800,
                temperature=0.7
            )
            
            return {
                'analysis_type': 'inventory_optimization',
                'analysis_date': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
                'result': response.choices[0].message.content,
                'source': 'OpenAI GPT-3.5'
            }
            
        except Exception as e:
            logger.error(f"库存优化分析失败: {e}")
            return {'error': 'LLM服务不可用，请配置OPENAI_API_KEY'}
    
    # 模拟库存分析生成函数已移除