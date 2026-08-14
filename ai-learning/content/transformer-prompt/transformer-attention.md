---
slug: transformer-attention
title: Transformer 与注意力：序列关系如何被建模
module: transformer-prompt
order: 7
summary: 从自注意力、位置与层叠结构理解 Transformer 的基本工作方式。
tags: ["Transformer", "注意力", "自注意力", "序列"]
updatedAt: 2026-08-15
prerequisites: ["embeddings-and-similarity"]
sources: [{"id":"attention-is-all-you-need","slug":"transformer-attention","title":"Attention Is All You Need","module":"transformer-prompt","excerpt":"论文提出以注意力机制为核心的 Transformer 架构，用于序列到序列建模。","url":"https://arxiv.org/abs/1706.03762","kind":"paper","locator":"Abstract"}]
---

## 自注意力在比较哪些关系

处理一句话时，一个词的含义往往取决于其他位置。自注意力让每个位置根据当前任务，计算自己应从哪些位置读取多少信息。可以把它理解为动态加权：同一个词在不同句子里会关注不同的上下文，而不是只依赖固定邻近窗口。

注意力权重不是人类可读的完整解释。它只是模型内部的一种计算系数，不能单独证明某个结论为何正确。

## 位置不能被省略

纯注意力计算本身不天然知道 token 的先后顺序。Transformer 因此需要位置编码或位置表示，让“先出现”和“后出现”成为模型可利用的信息。不同位置方案影响长文本处理方式，但都不能消除有限上下文窗口这一约束。

在工程中，长文档通常仍需要分段、检索或摘要，而不是期待一次把所有历史都放进上下文。

## 层叠带来更丰富的表示

典型 Transformer 会交替使用多头注意力和前馈网络，并通过残差连接和归一化稳定训练。多头机制让模型能够在不同子空间中学习关系；多层结构则让后续层在先前表示上继续组合特征。

理解这些组件的目的不是手算每个矩阵，而是知道模型为什么依赖输入顺序、上下文长度与训练分布。提示词能影响当前推理路径，却不能替代训练数据中从未形成的能力。

## 原始来源

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762) — Transformer 原始论文介绍了以自注意力为核心的序列建模架构。
