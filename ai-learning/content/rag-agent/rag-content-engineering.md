---
slug: rag-content-engineering
title: RAG 内容工程：先治理资料，再优化召回
contentType: guide
module: rag-agent
order: 17
summary: 把文档版本、分块、元数据和引用链当成检索系统的工程输入。
tags: ["RAG", "内容工程", "分块", "引用"]
updatedAt: 2026-08-15
reviewedAt: null
reviewStatus: null
prerequisites: ["rag-pipeline"]
related: ["embeddings-and-similarity"]
sources: [{"id":"rag-content-paper","slug":"rag-content-engineering","title":"Retrieval-Augmented Generation","module":"rag-agent","excerpt":"检索增强生成把外部资料与生成过程结合。","url":"https://arxiv.org/abs/2005.11401","kind":"paper"},{"id":"rag-content-eval","slug":"rag-content-engineering","title":"RAGAS","module":"rag-agent","excerpt":"RAG 评估需要关注检索与回答质量。","url":"https://arxiv.org/abs/2309.15217","kind":"paper"}]
evidence: []
---

## 适用问题

资料频繁更新、需要引用原文或需要解释检索结果来自哪里。

## 关键取舍

更细分块有利于定位，却可能割裂上下文；版本元数据能减少过期资料混入。

## 失败与恢复

索引失效时停止展示部分检索结果，重建后再发布完整索引。

## 决策清单

- 记录资料版本、分块规则和来源。
- 对命中结果执行引用可达性检查。

### 可执行步骤

为每份资料分配版本、来源、主题和发布时间；按语义段落分块，并让每块带回原文链接。反例是把不同版本的制度文档混进一个索引，召回到旧段落后仍显示为当前资料。上线前用问题集同时检查命中文段、引用可达性和回答是否越过证据。

### 分块不是结论

把命中的块视为待验证假设，而不是答案。一个最小记录可包含 `documentVersion=2026-08`、`chunkId=benefits-014`、`locator=第 3.2 节`、`expiresAt=2026-09-01`；生成器只能据此引用原文，不能把相邻版本的段落拼成“当前政策”。若块过期、定位符不可访问或答案无法由块支撑，应返回证据不足。

### 更新与回归

资料更新后，先用版本差异生成待重建清单，再重建受影响分块，最后在固定问题集上比较：是否召回新版本、是否仍错误召回旧版本、引用能否打开、答案是否超出证据。把这些检索回归与生成回归分开记录，避免只看最终文案而漏掉过期索引。

### 失败信号与恢复动作

当资料更新无法追溯、检索结果断链或引用与答案无关时，冻结该索引版本并重新构建，而不是继续显示部分结果。恢复动作必须重新跑同一问题集，确认新旧文档没有串位。

## 原始来源

- [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401)
- [RAGAS](https://arxiv.org/abs/2309.15217)
