---
slug: agent-state-recovery
title: Agent 状态与恢复：把中断变成可检查事件
contentType: guide
module: rag-agent
order: 18
summary: 为长流程定义状态、幂等边界、暂停和恢复条件，避免把错误隐藏在对话里。
tags: ["Agent", "状态", "恢复", "幂等"]
updatedAt: 2026-08-15
reviewedAt: null
reviewStatus: null
prerequisites: ["agents-and-tools"]
related: ["script-workflow-agent"]
sources: [{"id":"state-http-idempotent","slug":"agent-state-recovery","title":"RFC 9110: Idempotent Methods","module":"rag-agent","excerpt":"幂等请求可在相同意图下重复而不产生额外效果。","url":"https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods","kind":"official-doc"},{"id":"state-durable","slug":"agent-state-recovery","title":"Durable Functions overview","module":"rag-agent","excerpt":"持久编排可通过检查点恢复长流程。","url":"https://learn.microsoft.com/en-us/azure/durable-task/durable-functions/durable-functions-overview","kind":"official-doc"}]
evidence: []
---

## 适用问题

工具调用可能超时、被拒绝或需要人工重新确认的多步任务。

## 关键取舍

保存更多状态有助恢复，却必须避免保存敏感输入和不可公开数据。

## 失败与恢复

每一步写明可重试、不可重试和需人工接管的条件；恢复从已验证检查点开始。

## 决策清单

- 为副作用操作设置幂等键。
- 记录恢复需要的最小公开状态。

### 可执行步骤

把流程拆成可观察检查点：读取输入、准备工具参数、等待外部结果、人工确认和提交结果。每个检查点都标明是否有副作用、是否可重试和恢复所需的最小状态。反例是把进度只写在模型对话里，进程中断后既不知道做到了哪里，也无法判断重试会不会重复写入。

### 状态机与恢复表

- **`draft`**：无副作用，可重试；检查点是输入版本和参数草案。
- **`authorized`**：无副作用，权限变化后重新授权；检查点是审批 ID 和授权范围。
- **`submitted`**：可能已有副作用，不直接重试；检查点是幂等键和外部请求 ID。
- **`unknown`**：执行结果不确定，禁止重试；必须查询外部系统或人工核对。
- **`completed`**：结果已确认，不再执行；保留结果版本和确认时间。

“超时”不等于“没执行”：写操作进入 `unknown` 后先按幂等键查询，再决定继续、补偿或人工接管。只读步骤可重试；外部副作用步骤必须可由检查点证明结果。状态记录只保留恢复所需的 ID、版本与时间，避免把完整敏感提示词写入日志。

### 失败信号与恢复动作

工具超时、授权失败或输入版本变化时，冻结在最近的已验证检查点，展示原因并等待重试或人工接管。恢复前重新校验权限和幂等键；无法证明安全的步骤宁可取消，也不猜测执行结果。

## 原始来源

- [RFC 9110: Idempotent Methods](https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods)
- [Durable Functions overview](https://learn.microsoft.com/en-us/azure/durable-task/durable-functions/durable-functions-overview)
