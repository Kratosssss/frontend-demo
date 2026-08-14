---
slug: tokens-and-tokenization
title: Token 是什么：文本进入模型前的切分
module: token-embedding
order: 5
summary: 了解 token、词表与子词切分如何影响长度、成本和边界。
tags: ["Token", "分词", "子词", "词表"]
updatedAt: 2026-08-15
prerequisites: ["training-optimization"]
sources: [{"id":"bpe-subword-nmt","slug":"tokens-and-tokenization","title":"Neural Machine Translation of Rare Words with Subword Units","module":"token-embedding","excerpt":"论文将字节对编码用于子词单元，以在固定词表与罕见词表示之间折中。","url":"https://aclanthology.org/P16-1162/","kind":"paper","locator":"Abstract"}]
---

## Token 不是自然语言里的“一个词”

模型通常不直接读取字符或词语，而是读取 token ID 序列。一个 token 可能是汉字、标点、常见片段、英文词的一部分，甚至是空格组合。具体如何切分取决于词表和分词器，所以同一句话在不同模型中可能有不同长度。

这件事影响很实际：上下文窗口按 token 计，输入输出费用也常按 token 计。设计提示词或文档切块时，不能只以可见字数估算。

## 子词切分的折中

若词表只收录完整词，遇到新词会难以处理；若把文本切得过细，序列又会变长。子词方法尝试在二者之间取得平衡：常见片段成为独立单元，罕见词可以由更小片段组合。BPE 是常见方法之一，它通过反复合并频繁相邻符号构建词表。

中文没有天然空格分词边界，token 的粒度尤其需要通过真实分词器观察。不要把“一个汉字等于一个 token”当作通用规则。

## 为系统预留长度预算

在检索增强系统中，用户问题、系统指令、检索片段、工具结果和模型输出共享同一上下文预算。应先规定各部分最大长度，并在接近上限时采用可解释的截断策略，例如优先保留来源标题和最相关段落。盲目拼接全部内容，反而可能稀释关键证据。

## 原始来源

- [Neural Machine Translation of Rare Words with Subword Units](https://aclanthology.org/P16-1162/) — 论文说明了使用子词单元处理开放词表和罕见词的思路。
