---
slug: prompt-design-boundaries
title: Prompt 设计：给模型清晰任务，不承诺不存在的能力
contentType: note
module: transformer-prompt
order: 8
summary: 用角色、目标、输入和验收条件组织提示，并识别提示无法解决的问题。
tags: ["Prompt", "提示工程", "上下文", "约束"]
updatedAt: 2026-08-15
reviewedAt: null
reviewStatus: null
prerequisites: ["transformer-attention", "inference-decoding"]
related: ["prompt-rag-finetune"]
sources: [{"id":"openai-prompt-engineering","slug":"prompt-design-boundaries","title":"Prompt engineering","module":"transformer-prompt","excerpt":"官方指南强调明确指令、结构化输入和迭代评估对提示质量的重要性。","url":"https://platform.openai.com/docs/guides/prompt-engineering","kind":"official-doc","locator":"Prompt engineering guide"}]
evidence: []
---

## 一条提示应当包含什么

好的提示先消除任务歧义，而不是堆砌修辞。可从四部分开始：说明目标，提供必要上下文，定义输出格式，给出验收限制。例如，要求“根据给定资料列出三条要点，并为每条附来源编号”，比只说“总结一下”更便于检查。

当输入来自用户或外部文件时，要把它标记为数据而非系统指令。这样可以降低文本中夹带命令、改变任务目标的风险。

## 把约束写成可验证的条件

“简洁”“专业”这类词可以保留，但应再补充可观察条件：最大条目数、JSON 字段、必须引用的材料、未知时的固定回复。结构化输出可减少后处理歧义，不过仍应在程序中校验类型和字段，而不是直接信任模型生成的 JSON。

提示版本也需要和代码一样被记录。只有知道某个结果使用了哪个模板、哪些输入和哪组评估题，团队才能判断改动是否真的带来改善。

## 提示解决不了什么

提示不能补齐缺失知识，不能让没有权限的模型访问私有数据，也不能保证事实正确。对于知识库问答，最重要的约束不是“回答得像专家”，而是“只依据提供的可映射来源”。检索不到证据时，固定返回 `知识库中未找到` 比编造一个貌似合理的解释更可靠。

## 示例

为提取任务给出字段、拒绝条件和一个反例，而不是只写“请认真回答”。

## 常见误区

用更长提示替代数据、检索或评估缺口。

## 决策清单

- 把输出格式写成可验证约束。
- 记录提示变更对应的测试样本。

## 原始来源

- [Prompt engineering](https://platform.openai.com/docs/guides/prompt-engineering) — 官方指南概述了清晰指令、结构化上下文和持续评估的提示设计原则。
