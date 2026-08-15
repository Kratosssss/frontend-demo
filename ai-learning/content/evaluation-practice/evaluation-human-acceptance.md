---
slug: evaluation-human-acceptance
title: 评估与人工验收：把“看起来对”变成可复查结论
contentType: guide
module: evaluation-practice
order: 20
summary: 用固定样本、失败分类和人工门禁验证工程改变，而不以单次演示代替验收。
tags: ["评估", "人工验收", "测试", "失败分析"]
updatedAt: 2026-08-15
reviewedAt: null
reviewStatus: null
prerequisites: ["evaluation-for-ai"]
related: ["p007-seven-role-case"]
sources: [{"id":"accept-helm","slug":"evaluation-human-acceptance","title":"HELM","module":"evaluation-practice","excerpt":"系统评估覆盖多场景和多指标。","url":"https://arxiv.org/abs/2211.09110","kind":"paper"},{"id":"accept-nist-rmf","slug":"evaluation-human-acceptance","title":"NIST AI RMF","module":"evaluation-practice","excerpt":"风险管理需要可沟通、可测量的证据。","url":"https://www.nist.gov/itl/ai-risk-management-framework","kind":"official-doc"},{"id":"accept-nist-genai","slug":"evaluation-human-acceptance","title":"NIST GenAI Profile","module":"evaluation-practice","excerpt":"生成式 AI 风险需结合人工监督。","url":"https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence","kind":"official-doc"}]
evidence: []
---

## 适用问题

需要判断内容、模型功能或界面变更是否满足发布前的可观察标准。

## 关键取舍

自动检查覆盖快，人工验收能判断语义和公开边界；两者不能互相替代。

## 失败与恢复

检查失败时保留复现输入与结果，修复后重跑受影响范围，不扩大到无关系统。

## 决策清单

- 把通过条件写成可观察行为。
- 区分自动验证与人工判断证据。

### 可执行步骤

把发布条件拆成内容盘点、稳定路由、异常恢复、键盘操作和视觉对照；每一项都有可复现命令或人工走查记录。反例是只在成功路径上演示一次，就把“可展示”称为“已验收”。人工验收负责判断语义、公开边界和视觉是否符合批准输入。

### 一个端到端验收记录

针对“新增一篇公开指南”，样本集至少包含：合法 frontmatter、缺少来源、错误路由和待复核决策四类输入。自动检查的指标是“索引项数与类型计数正确、缺来源输入被拒绝、稳定路由可打开”；人工 rubric 是“结论有来源、公开证据不夸大、移动端仍能找到搜索、视觉符合批准方向”。每条失败都记录样本 ID、实际结果、预期结果、责任人和复测日期。

修复缺来源问题后，先重跑该负向样本，再跑受影响的内容校验、组件测试与构建；不要仅截图成功页。自动通过不等于语义通过，人工批准也不替代可复现的自动门禁。

### 失败信号与恢复动作

当自动测试失败、截图与设计差异无法说明或公开证据缺失时，停止发布并记录最小复现。修复后只重跑相关校验，同时复查未受自动化覆盖的人类判断；不要通过删测或放宽门槛取得通过。

## 原始来源

- [HELM](https://arxiv.org/abs/2211.09110)
- [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework)
- [NIST GenAI Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence)
