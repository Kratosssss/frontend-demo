---
slug: rag-pipeline
title: RAG 流程：检索、证据与受限回答
contentType: note
module: rag-agent
order: 9
summary: 拆解 RAG 的索引、检索、组装与引用步骤，理解每一步的责任边界。
tags: ["RAG", "检索增强", "引用", "知识库"]
updatedAt: 2026-08-15
reviewedAt: null
reviewStatus: null
prerequisites: ["embeddings-and-similarity", "prompt-design-boundaries"]
related: ["rag-content-engineering"]
sources: [{"id":"retrieval-augmented-generation","slug":"rag-pipeline","title":"Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks","module":"rag-agent","excerpt":"论文将参数化生成与外部检索结合，用于需要知识支持的自然语言生成任务。","url":"https://arxiv.org/abs/2005.11401","kind":"paper","locator":"Abstract"}]
evidence: []
---

## RAG 不是把文档贴进提示词

检索增强生成通常包含四步：准备内容、建立索引、针对问题检索、带证据生成回答。准备阶段决定文档如何分块并附上标题、slug、更新时间等元数据；索引阶段让这些片段能被查找；检索阶段选择候选；生成阶段只使用被选中的证据作答。

每一步都可能出错。没有正确分块，检索不到关键句；检索结果不相关，生成再流畅也不可靠；来源 ID 不稳定，则用户无法核验答案。

## 同一内容源减少漂移

本知识库把 Markdown 作为页面与搜索索引的唯一来源。校验脚本生成的 `contentHash` 能识别内容是否变化；稳定的 `slug` 和来源 ID 能让页面路由、搜索结果与将来的引用处理指向同一篇笔记。这样修改笔记后，不需要手工维护多份互相可能矛盾的数据。

## 受限回答是 RAG 的核心行为

在任何带回答器的 RAG 系统中，应收到至少一个可映射引用，并在完成事件明确表明回答有依据，才向用户显示模型正文。否则最终只显示 `知识库中未找到`。这不是降低体验，而是把“模型猜测”与“资料支持”分开，给用户一个可预测的核验边界。

## 示例

让回答同时返回支持它的原文链接，并在无证据时拒绝断言。

## 常见误区

检索到相似段落就默认可以回答具体事实。

## 决策清单

- 分开测量检索与生成质量。
- 让引用可直接复查。

## 原始来源

- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401) — RAG 论文讨论了将检索到的外部文档与生成模型结合的方式。
