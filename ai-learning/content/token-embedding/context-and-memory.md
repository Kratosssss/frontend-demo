---
slug: context-and-memory
title: 上下文与记忆：保留证据，不堆积历史
contentType: guide
module: token-embedding
order: 14
summary: 区分当前任务上下文、可检索资料和持久记忆，避免把无关历史塞入输入。
tags: ["上下文", "记忆", "Token", "检索"]
updatedAt: 2026-08-15
reviewedAt: null
reviewStatus: null
prerequisites: ["tokens-and-tokenization"]
related: ["rag-content-engineering"]
sources: [{"id":"memory-rag","slug":"context-and-memory","title":"Retrieval-Augmented Generation","module":"token-embedding","excerpt":"检索把外部证据带回生成过程。","url":"https://arxiv.org/abs/2005.11401","kind":"paper"},{"id":"memory-longcontext","slug":"context-and-memory","title":"Lost in the Middle","module":"token-embedding","excerpt":"长上下文中的信息位置会影响利用效果。","url":"https://arxiv.org/abs/2307.03172","kind":"paper"}]
evidence: []
---

## 适用问题

需要在长任务中保留约束、引用与决定，但不希望把所有对话历史重新发送。

## 关键取舍

压缩会节省预算，却可能丢失可追溯证据；检索应优先返回原始片段与来源。

## 失败与恢复

找不到足够证据时明确降级为“需要补充资料”，而不是用旧记忆补写。

## 决策清单

- 标出必须保留的任务约束。
- 给每段上下文保留来源和失效边界。

### 可执行步骤

把输入分成任务指令、当前证据和可选背景三层；先保留能支持结论的原文片段，再决定是否摘要。反例是把数十轮历史原样拼接，既挤掉当前约束，也让过期决定重新生效。每段压缩文本都应保留出处、适用任务和失效条件。

### 生命周期与回证

- **当前上下文**：保存任务目标、不可违背约束和已选证据；任务结束即失效；原样放入输入并标识来源。
- **可检索资料**：保存带版本和定位符的原文块；文档更新或权限变化即失效；先检索，再返回原文定位符。
- **持久记忆**：只保存经人工确认的偏好或决定；决定撤销或超过复核期即失效；只作候选线索，不能替代证据。

例如长任务遇到“沿用上周审批结论”，先用决定 ID 检索当时的原文、版本和有效期；未命中或已过期时回答“需要重新确认”，而不是把摘要当事实。每个最终结论都应能返回 `文档版本 / chunkId / 定位符`，以便读者回证。

### 失败信号与恢复动作

当回答无法指出支持它的上下文，或上下文预算被背景占满时，停止继续堆叠历史；改为检索原文、请求补充资料或交给人工。恢复后用同一问题检查引用是否仍可访问。

## 原始来源

- [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401)
- [Lost in the Middle](https://arxiv.org/abs/2307.03172)
