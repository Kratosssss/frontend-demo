---
slug: multi-agent-collaboration
title: 多 Agent 协作：把分工、交接和人工门禁显式化
contentType: guide
module: rag-agent
order: 19
summary: 多角色只有在任务边界、共享契约和人工验收明确时才值得增加。
tags: ["多 Agent", "协作", "交接", "验收"]
updatedAt: 2026-08-15
reviewedAt: null
reviewStatus: null
prerequisites: ["agent-state-recovery"]
related: ["p007-seven-role-case"]
sources: [{"id":"collab-autogen","slug":"multi-agent-collaboration","title":"AutoGen","module":"rag-agent","excerpt":"多代理框架讨论可编程协作模式。","url":"https://arxiv.org/abs/2308.08155","kind":"paper"},{"id":"collab-nist-rmf","slug":"multi-agent-collaboration","title":"NIST AI RMF","module":"rag-agent","excerpt":"治理需要明确责任、监控与沟通。","url":"https://www.nist.gov/itl/ai-risk-management-framework","kind":"official-doc"}]
evidence: []
---

## 适用问题

一个人或一个流程无法同时持有产品、设计、实现和验收的独立判断。

## 关键取舍

角色越多，交接成本越高；只有可验证的专长边界才值得并行。

## 失败与恢复

契约缺失、证据不足或角色冲突时暂停并回到负责人，不以更多代理掩盖问题。

## 决策清单

- 明确每个角色拥有和只读的路径。
- 为跨角色交付设定人工门禁。

### 可执行步骤

先定义谁拥有产品范围、谁提供设计证据、谁能改前端、谁只做核验；再把输入、交付物和停止条件写成可读任务卡。反例是让多个角色同时改共享契约或把设计未批准的想法直接实现。并行只用于边界明确且结果可独立验证的任务。

### 选择规则不是事实结论

“只有可验证的专长边界才增加角色”是本知识库的工程选择，不是关于多 Agent 必然更好的事实主张。单角色适合范围小、输入稳定、一个负责人能独立核验的任务；多角色适合产品判断、视觉证据和代码验证需要不同独立视角，且每一交付物都有唯一所有者。两者都应保留人工责任人。

- **契约与实现都很小**：单角色能减少交接；不必拆分多角色；负责人直接复核。
- **设计与代码可独立验收**：单角色可串行完成；多角色可并行审查；冲突时冻结共享输入、回到门禁。
- **结论互相矛盾**：不扩大执行，也不以投票解决；指定唯一决策者并记录理由。

### 失败信号与恢复动作

当角色结论冲突、交付缺少证据或拥有路径重叠时，暂停而不是继续扩展协作人数。回到总指挥确认契约和门禁，再由唯一负责人发起下一轮；恢复后仅重做受影响的检查。

## 原始来源

- [AutoGen](https://arxiv.org/abs/2308.08155)
- [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework)
