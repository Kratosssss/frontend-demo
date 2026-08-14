---
slug: agents-and-tools
title: Agent 与工具调用：把模型放进可控流程
module: rag-agent
order: 10
summary: 理解 Agent 的计划、工具与状态，并为每个副作用设置可检查门槛。
tags: ["Agent", "工具调用", "工作流", "权限"]
updatedAt: 2026-08-15
prerequisites: ["rag-pipeline"]
sources: [{"id":"react-agent-reasoning","slug":"agents-and-tools","title":"ReAct: Synergizing Reasoning and Acting in Language Models","module":"rag-agent","excerpt":"论文把推理轨迹与外部行动交替组织，用于需要工具和环境反馈的任务。","url":"https://arxiv.org/abs/2210.03629","kind":"paper","locator":"Abstract"}]
---

## Agent 是工作流，不是一种人格

当模型需要选择下一步、读取外部信息或调用工具时，通常会被放进 Agent 工作流。它至少包含当前目标、可用工具、观测结果、停止条件和状态记录。模型可以提出行动建议，但执行器仍应验证参数、权限和副作用。

把 Agent 看作“能自己做任何事”的助手会掩盖这些边界。真正可靠的系统会限定工具清单，并让每种调用有明确输入、输出与失败路径。

## 工具调用需要最小权限

读取知识库、发送邮件、修改数据的风险不同，不能共用一张无限权限的凭据。尤其是写操作，应提供 dry-run、差异清单和人工确认。工具返回的数据也应被视为不可信输入：模型不得把其中的文本当作新的系统指令。

在实际系统中，应先用可重复的模拟数据验证工具接口、错误状态与停止条件，再连接任意外部服务。课程中的 Agent 主题用于理解这种边界；当前知识库本身保持为纯静态阅读与搜索站点。

## 让停止条件可观察

Agent 需要预算：最多步骤数、最大重试次数、每个工具的超时和遇到不确定时的退出策略。日志应记录动作类型、稳定资源 ID 和结果状态，但绝不能记录密码、Token 或完整 Secret。这样故障排查能回答“做了什么”，而不会扩大敏感信息暴露面。

## 原始来源

- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629) — 论文讨论了让语言模型交替进行推理与行动的工作流形式。
