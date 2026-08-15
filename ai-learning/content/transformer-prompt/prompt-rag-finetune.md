---
slug: prompt-rag-finetune
title: Prompt / RAG / 微调：先定位缺口，再选干预层
contentType: decision-card
module: transformer-prompt
order: 24
summary: 指令不清先改 Prompt，资料缺失先建 RAG，稳定行为缺口再评估训练；此卡待复核。
tags: ["Prompt", "RAG", "微调", "决策"]
updatedAt: 2026-08-15
reviewedAt: 2026-08-15
reviewStatus: review-needed
prerequisites: ["prompt-design-boundaries", "rag-pipeline"]
related: ["rag-content-engineering"]
sources: [{"id":"choice-prompting","slug":"prompt-rag-finetune","title":"Prompting methods survey","module":"transformer-prompt","excerpt":"提示设计可改变任务表达与示例约束。","url":"https://arxiv.org/abs/2107.13586","kind":"paper"},{"id":"choice-rag","slug":"prompt-rag-finetune","title":"Retrieval-Augmented Generation","module":"transformer-prompt","excerpt":"检索增强生成使用外部资料支持输出。","url":"https://arxiv.org/abs/2005.11401","kind":"paper"},{"id":"choice-finetune","slug":"prompt-rag-finetune","title":"Finetuned Language Models Are Zero-Shot Learners","module":"transformer-prompt","excerpt":"训练策略需要基于任务与数据评估。","url":"https://arxiv.org/abs/2109.01652","kind":"paper"}]
evidence: []
---

## 判断条件

区分问题来自指令、知识时效、输出格式还是稳定行为模式。

## 适用场景

已有可验证样本，可分别测量三个干预层的收益和维护代价。

## 不适用场景

资料来源不明、没有评估集或无法承担训练数据治理时。

## 选择依据

历史判断，需自行复核：优先选择能最小化新风险和维护面的一层。

### 比较对象矩阵

Prompt 用于任务说明、示例和输出约束不清，改动快但不能补充可信的新资料；RAG 用于资料经常更新且回答必须回证原文，代价是内容治理和检索回归；微调用于稳定行为模式持续缺失、训练数据有合法来源且离线评估已建立，代价是数据治理、训练与复核。三者并不互斥，但每次只改变一层并在同一保留集上比较。

反例是遇到任何失败就直接训练：它可能把资料时效问题固化进参数，也失去引用链。待复核状态表示此选择顺序不是默认生产策略；使用者必须针对自己的数据来源、维护成本和评估结果重做判断。

### 升级与降级触发

当增加示例后格式仍不稳定，先检查模式校验；当答案缺少当前资料，升级到受治理的检索；当资料与提示都无法解释一致性缺口，才提出训练评估。若来源过期、评估集不足或复核状态为待复核，降级为人工判断。

## 原始来源

- [Prompting methods survey](https://arxiv.org/abs/2107.13586)
- [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401)
- [Finetuned Language Models Are Zero-Shot Learners](https://arxiv.org/abs/2109.01652)
