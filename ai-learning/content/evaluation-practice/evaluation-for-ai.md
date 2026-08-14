---
slug: evaluation-for-ai
title: 评估 AI 系统：从好看示例到可复现证据
module: evaluation-practice
order: 11
summary: 用任务集、指标与失败分类评估模型系统，而不只展示少量成功案例。
tags: ["评估", "基准", "指标", "失败分析"]
updatedAt: 2026-08-15
prerequisites: ["rag-pipeline", "agents-and-tools"]
sources: [{"id":"helm-holistic-evaluation","slug":"evaluation-for-ai","title":"Holistic Evaluation of Language Models","module":"evaluation-practice","excerpt":"HELM 提出从准确性、鲁棒性、公平性、效率等多个维度系统评估语言模型。","url":"https://arxiv.org/abs/2211.09110","kind":"paper","locator":"Abstract"}]
---

## 示例能启发，不能代替评估

一个令人满意的演示只能说明系统在某个输入上成功过。评估需要先定义代表性任务集：常见问题、边界问题、容易混淆的表述、无依据问题，以及不同长度和格式的输入。任务集应在方案比较前固定，避免只挑选对当前版本有利的题目。

对于知识问答，答案正确性之外还要检查来源是否真的支持结论、引用是否可打开、无答案时是否准确拒答。

## 指标要连接使用后果

准确率、召回率、延迟和成本各自回答不同问题。若检索系统漏掉关键文档，生成模型可能只能猜测；若引用正确但响应太慢，用户仍无法使用。把指标按用户旅程组织，会比追求一个单一总分更有帮助。

定量指标需要配合定性复核。将失败分为检索失败、上下文组装失败、生成越界、引用映射失败和界面错误，团队才知道下一轮该改哪里。

## 保留可复现实验记录

每次比较至少记录内容索引版本、提示版本、模型或模拟器版本、任务集、参数、运行时间和结果。当前知识库只交付静态内容与本地搜索；课程中涉及的 Agent 评估方法应在未来接入独立服务时另行验证，不能从静态站点的测试中推断模型质量。

## 原始来源

- [Holistic Evaluation of Language Models](https://arxiv.org/abs/2211.09110) — HELM 论文说明了从多个维度评估语言模型系统的必要性。
