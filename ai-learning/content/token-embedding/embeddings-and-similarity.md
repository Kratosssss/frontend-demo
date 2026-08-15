---
slug: embeddings-and-similarity
title: Embedding：把语义线索表示为向量
contentType: note
module: token-embedding
order: 6
summary: 理解向量表示、相似度与检索结果为何需要回到原文核验。
tags: ["Embedding", "向量", "相似度", "检索"]
updatedAt: 2026-08-15
reviewedAt: null
reviewStatus: null
prerequisites: ["tokens-and-tokenization"]
related: ["rag-content-engineering"]
sources: [{"id":"word2vec","slug":"embeddings-and-similarity","title":"Efficient Estimation of Word Representations in Vector Space","module":"token-embedding","excerpt":"论文展示了用较低计算成本学习词向量表示的经典方法。","url":"https://arxiv.org/abs/1301.3781","kind":"paper","locator":"Abstract"}]
evidence: []
---

## 向量是可计算的表示，不是解释

Embedding 把文本、图像或其他对象编码为一串数值，使系统能用距离或角度比较它们。语义相近的内容在某些向量空间中往往距离更近，因此可以用它做相似内容推荐、聚类和检索。

但“近”只表示模型在训练目标下认为相似，并不自动说明两个句子事实一致。查询“产品能否退款”和“退款政策例外”可能很近，却需要不同的原文回答。

## 相似度如何参与检索

常见做法是先把文档分成片段，为每段计算向量；用户提问时也计算一个向量，再取最相近的若干片段。余弦相似度经常用于比较方向，而不是比较向量绝对长度。实际系统还会结合关键词、过滤条件和重排序，避免单一相似度主导结果。

切块大小、重叠范围和元数据会改变检索质量。块太大可能混入无关内容，太小又会丢掉关键上下文。应在真实问题集上观察“找到的片段能否支持答案”。

## 证据仍然是原文

向量检索的角色是缩小阅读范围，不是生成事实。一个可靠的 RAG 流程会把检索到的原文片段和稳定的来源 ID 一起传给回答环节，并将最终引用映射回用户可打开的笔记。没有可映射来源时，应明确说知识库中未找到，而不是根据向量相近性猜测。

## 示例

对检索结果回看原文段落，而不是只相信向量距离。

## 常见误区

把相似度分数误读成事实正确率。

## 决策清单

- 检查分块与查询的语义一致性。
- 保留回到原始证据的链接。

## 原始来源

- [Efficient Estimation of Word Representations in Vector Space](https://arxiv.org/abs/1301.3781) — word2vec 论文是学习分布式词向量表示的经典参考。
