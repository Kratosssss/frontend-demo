---
slug: script-workflow-agent
title: 脚本 / 工作流 / Agent / 多 Agent：按副作用与协作复杂度选型
contentType: decision-card
module: rag-agent
order: 25
summary: 可预测任务优先脚本或工作流；只有状态、不确定性和角色边界成立时才引入 Agent。
tags: ["脚本", "工作流", "Agent", "多 Agent"]
updatedAt: 2026-08-15
reviewedAt: 2026-08-15
reviewStatus: current
prerequisites: ["agents-and-tools"]
related: ["multi-agent-collaboration"]
sources: [{"id":"control-react","slug":"script-workflow-agent","title":"ReAct","module":"rag-agent","excerpt":"推理与行动需要受控环境反馈。","url":"https://arxiv.org/abs/2210.03629","kind":"paper"},{"id":"control-durable","slug":"script-workflow-agent","title":"Durable Functions overview","module":"rag-agent","excerpt":"工作流可记录检查点与恢复。","url":"https://learn.microsoft.com/en-us/azure/durable-task/durable-functions/durable-functions-overview","kind":"official-doc"},{"id":"control-autogen","slug":"script-workflow-agent","title":"AutoGen","module":"rag-agent","excerpt":"多代理协作需要清晰通信边界。","url":"https://arxiv.org/abs/2308.08155","kind":"paper"},{"id":"control-owasp","slug":"script-workflow-agent","title":"OWASP LLM06","module":"rag-agent","excerpt":"过度代理应以最小能力降低风险。","url":"https://genai.owasp.org/llmrisk/llm062025-excessive-agency/","kind":"official-doc"}]
evidence: []
---

## 判断条件

评估任务是否可预测、是否有副作用、是否需要恢复和是否存在独立角色判断。

## 适用场景

有明确检查点、权限模型和人工门禁的多步骤工程流程。

## 不适用场景

简单、固定且可以直接由脚本表达的任务。

## 选择依据

当前判断：从最简单可验证的控制结构开始，复杂度只随已证明的需要增加。

### 比较对象矩阵

按六个维度比较：确定性、分支、状态、工具副作用、恢复要求和角色独立性。脚本适合固定输入输出、无分支、无副作用或可直接幂等的步骤；工作流适合已知分支、审批和明确检查点；Agent 只在需要根据受限环境反馈选择下一步、且工具权限最小化时引入；多 Agent 还要求不同角色的判断可独立验收。

反例是用复杂协作包装一个本可由脚本验证的转换，反而增加状态和交接风险。工具产生写入、转账或外部通知时，先把它放入可恢复工作流，再讨论是否需要 Agent；角色不能独立验收时立即回到单一负责人。

### 升级与降级触发

如果分支和恢复逻辑开始重复，升级到工作流；如果需要受控的环境反馈，再评估 Agent；如果角色边界或证据无法独立验证，立即降级回单一负责人和人工门禁。复核时检查副作用、权限和停止条件，不以自动化程度判断先进性。

## 原始来源

- [ReAct](https://arxiv.org/abs/2210.03629)
- [Durable Functions overview](https://learn.microsoft.com/en-us/azure/durable-task/durable-functions/durable-functions-overview)
- [AutoGen](https://arxiv.org/abs/2308.08155)
- [OWASP LLM06](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)
