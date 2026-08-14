---
slug: data-task-capability
title: 数据、任务与能力边界如何对齐
module: ai-foundations
order: 2
summary: 学会用数据卡和风险边界检查模型是否真的适合当前任务。
tags: ["数据集", "任务定义", "偏差", "风险"]
updatedAt: 2026-08-15
prerequisites: ["ai-what-is-model"]
sources: [{"id":"nist-ai-rmf","slug":"data-task-capability","title":"AI Risk Management Framework","module":"ai-foundations","excerpt":"NIST 将治理、映射、度量和管理作为识别与处理 AI 风险的连续活动。","url":"https://www.nist.gov/itl/ai-risk-management-framework","kind":"official-doc","locator":"AI RMF 1.0"}]
---

## 对齐是一份可检查的假设

“模型能不能做”不是单独的技术问题。它取决于任务定义、可用数据、使用场景和失败代价是否相互匹配。一个图像模型在清晰商品图上表现良好，不意味着它能安全处理夜间监控画面；两个场景的输入质量、目标和错误成本不同。

可以把对齐写成一张小表：谁使用输出、输出会触发什么行动、哪些输入必须拒绝、错误由谁复核。这样做会让后续的模型选择和评估有可追溯的理由。

## 数据卡的作用

数据卡不是行政文档，而是把数据来源和限制写给未来维护者看的说明。至少记录采集时间、覆盖对象、许可、清洗步骤、标注定义、已知空缺和不应使用的场景。它帮助团队发现“训练集里的标签”和“业务需要的判断”是否其实不是同一件事。

例如，投诉文本按部门归类的标签，不能直接当作“用户情绪”的标签。前者服务工单流转，后者需要不同的标注标准和隐私审查。

## 把能力边界变成产品行为

边界应体现在界面和流程里，而不只写在模型说明中。低置信度时给出人工复核入口；没有足够依据时返回未知；敏感输入先做最小化处理。这样，模型的输出只是决策链的一环，而不是不可解释的终点。

## 原始来源

- [AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) — NIST 的框架说明了在系统生命周期中持续识别和管理 AI 风险的方法。
