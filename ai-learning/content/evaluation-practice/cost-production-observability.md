---
slug: cost-production-observability
title: 成本与生产监控：让预算、延迟和失败可见
contentType: guide
module: evaluation-practice
order: 22
summary: 以请求级成本、延迟、失败分类和复核日期管理生产风险，而不承诺实时智能优化。
tags: ["成本", "监控", "生产", "可观测性"]
updatedAt: 2026-08-15
reviewedAt: null
reviewStatus: null
prerequisites: ["model-inference-budget"]
related: ["evaluation-human-acceptance"]
sources: [{"id":"obs-finops","slug":"cost-production-observability","title":"FinOps Framework","module":"evaluation-practice","excerpt":"FinOps 强调工程、财务与业务共同管理云成本。","url":"https://www.finops.org/framework/","kind":"official-doc"},{"id":"obs-otel-genai","slug":"cost-production-observability","title":"OpenTelemetry GenAI semantic conventions","module":"evaluation-practice","excerpt":"语义约定帮助统一生成式 AI 遥测字段。","url":"https://github.com/open-telemetry/semantic-conventions-genai","kind":"official-doc"},{"id":"obs-nist-genai","slug":"cost-production-observability","title":"NIST GenAI Profile","module":"evaluation-practice","excerpt":"治理需要记录风险与监控措施。","url":"https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence","kind":"official-doc"}]
evidence: []
---

## 适用问题

服务进入稳定运行，需要发现预算偏离、延迟上升和失败集中区间。

## 关键取舍

更细粒度记录利于定位，但应避免保存用户内容或未获授权的行为数据。

## 失败与恢复

阈值异常时降级、限流或转人工；在原因明确前不把临时数据当长期结论。

## 决策清单

- 记录成本、延迟和失败类别。
- 将监控结果连回可复查样本。

### 可执行步骤

按任务类型记录请求量、输入输出长度、延迟、失败类别和预算消耗，但不持久化用户正文。用固定时间窗口比较变更前后同一类任务，反例是把一次流量波动解释成模型变好了或变差了。告警应链接到可复查样本与部署版本，而不是只有一个总数。

### 指标字典与隐私边界

先定义语义：请求成本是该请求可归因的模型与工具费用，不是整个团队月度账单；P95 延迟是同一任务类型在固定窗口内的第 95 百分位端到端耗时；失败率按结构失败、权限拒绝、上游超时和人工否决分别计数。遥测只保存匿名请求 ID、模型/版本、令牌计数、耗时、状态与错误类别，绝不保存提示词正文、附件或访问令牌。

### SLO 与排查路径

为每一任务建立变更前基线，例如连续七日 P95 低于 4 秒、结构失败率低于 1%、日均单位成本不高于批准预算。超过阈值先按版本和任务类型分组，再检查输入长度、部署变更和上游状态；限流或转人工是临时止损，必须明确标注。告警解除前用同口径窗口与基线比较，避免把流量变化误判为优化。

### 失败信号与恢复动作

当预算、延迟或失败率持续越界时，先限制高成本路径、降级为保守输出或转人工；随后检查输入长度、上游资料版本和最近代码变更。恢复后验证告警解除的原因，不将临时降级伪装成长期优化。

## 原始来源

- [FinOps Framework](https://www.finops.org/framework/)
- [OpenTelemetry GenAI semantic conventions](https://github.com/open-telemetry/semantic-conventions-genai)
- [NIST GenAI Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence)
