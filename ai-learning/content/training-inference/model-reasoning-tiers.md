---
slug: model-reasoning-tiers
title: 模型 / 推理档位：按任务风险选择，不按热度选择
contentType: decision-card
module: training-inference
order: 23
summary: 对低风险批量任务优先使用可控预算；高风险判断保留更强推理与人工复核。
tags: ["模型选择", "推理", "复核", "预算"]
updatedAt: 2026-08-15
reviewedAt: 2026-08-15
reviewStatus: current
prerequisites: ["model-inference-budget"]
related: ["cost-production-observability"]
sources: [{"id":"tiers-helm","slug":"model-reasoning-tiers","title":"HELM","module":"training-inference","excerpt":"模型评估应覆盖多个场景和指标。","url":"https://arxiv.org/abs/2211.09110","kind":"paper"},{"id":"tiers-frugalgpt","slug":"model-reasoning-tiers","title":"FrugalGPT","module":"training-inference","excerpt":"可测模型路由能比较成本与质量。","url":"https://arxiv.org/abs/2305.05176","kind":"paper"},{"id":"tiers-nist-rmf","slug":"model-reasoning-tiers","title":"NIST AI RMF","module":"training-inference","excerpt":"风险管理需要明确治理与度量。","url":"https://www.nist.gov/itl/ai-risk-management-framework","kind":"official-doc"}]
evidence: []
---

## 判断条件

比较任务错误代价、允许延迟、输出可验证性与人工复核能力。

## 适用场景

有明确输入、可测输出和预算上限的内容提取、分类或摘要。

## 不适用场景

无法定义错误后果、需要实时事实保证或必须由人承担判断责任的任务。

## 选择依据

当前判断：先按风险分层，再在固定样本上比较质量、延迟与成本；不是永久推荐。

### 比较对象矩阵

这里的模型能力是固定保留集上的质量；解码是温度、输出长度等生成配置；推理时间是端到端耗时，三者分别测量。低档位用于格式明确、可抽样复核的批量任务；中档位用于有引用或规则可验证的判断；高档位只用于错误后果更高、需要交叉检查且仍由人工签收的候选理由。三档都比较固定样本质量、P95 延迟、单位成本和人工复核率，而不是比较厂商热度。

在同一批 30 条脱敏样本上，可先设低档位“结构通过且抽检”、中档位“引用可回证”、高档位“人工逐条签收”的不同门槛。任何一档都不能替代业务责任人；数据分布变化时，此卡的当前结论须重新复核。

### 升级与降级触发

当保留样本中的关键错误、格式失败或人工否决超出任务预设门槛，升级复核或转人工；当输入完整、输出稳定且成本压力持续时，才在同一评估集上尝试降级。复核日期只说明本卡当日检查过来源，不是实时保证。

## 原始来源

- [HELM](https://arxiv.org/abs/2211.09110)
- [FrugalGPT](https://arxiv.org/abs/2305.05176)
- [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework)
