---
slug: model-inference-budget
title: 模型与推理预算：先写清质量、延迟与成本
contentType: guide
module: training-inference
order: 13
summary: 用任务分层和可测预算选择模型与推理档位，而不是只比较排行榜。
tags: ["模型选择", "推理", "延迟", "成本"]
updatedAt: 2026-08-15
reviewedAt: null
reviewStatus: null
prerequisites: ["inference-decoding"]
related: ["cost-production-observability"]
sources: [{"id":"budget-helm","slug":"model-inference-budget","title":"HELM","module":"training-inference","excerpt":"评估应覆盖多个场景与维度。","url":"https://arxiv.org/abs/2211.09110","kind":"paper"},{"id":"budget-frugalgpt","slug":"model-inference-budget","title":"FrugalGPT","module":"training-inference","excerpt":"模型路由可在成本与质量间做可测权衡。","url":"https://arxiv.org/abs/2305.05176","kind":"paper"},{"id":"budget-nist-rmf","slug":"model-inference-budget","title":"NIST AI RMF","module":"training-inference","excerpt":"风险管理需要明确度量与治理责任。","url":"https://www.nist.gov/itl/ai-risk-management-framework","kind":"official-doc"}]
evidence: []
---

## 适用问题

当同一产品既有高风险判断也有批量草稿时，先把可接受延迟、成本和人工复核写成预算。

## 关键取舍

更强的推理可能降低某类错误，却会增加延迟和单位成本；预算必须按任务而不是按模型名设定。

## 失败与恢复

预算超限时降级到保守输出或转人工，并保留请求上下文供复核。

## 决策清单

- 为每类任务定义质量、延迟和成本上限。
- 用固定样本比较候选方案。

### 可执行步骤

先把请求按错误后果分成可自动处理、需要抽样复核和必须人工决定三类。为每类记录输入长度、输出格式、目标延迟和单位预算，再用同一保留样本跑候选档位。反例是把招聘筛选、医疗建议等高后果判断塞进“便宜的批处理”；即使输出通顺，也不能据此降低人工门槛。

### 预算矩阵与超限回退

这里的“模型能力”指模型在固定任务集上的可测表现；“解码”指温度、最大输出长度等生成配置；“推理时间”指一次请求实际占用的端到端时间。三者不能互相替代。每个任务档位至少记录：固定样本质量、P95 延迟、单位完成成本和人工复核比例。例如，低风险标签提取可设为“格式通过且抽检正确后自动继续”；中风险摘要要求“引用可回到原文”；高风险建议只输出候选理由并强制人工签收。

超出任一预算时，不把请求静默转给更弱模型：先截断非必要上下文、返回可验证的保守结果或进入人工队列；若仍超限，记录为失败样本。下次调整预算必须重跑同一保留集，不能用不同输入掩盖质量变化。

### 失败信号与恢复动作

如果超时、格式失败或人工否决集中在某一类请求，停止扩大该档位的使用范围，回退到保守输出或人工队列。每次降级都记录触发条件和样本，不把一次偶然成功当成长期结论。

## 原始来源

- [HELM](https://arxiv.org/abs/2211.09110)
- [FrugalGPT](https://arxiv.org/abs/2305.05176)
- [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework)
