---
slug: structured-output-tools
title: 结构化输出与工具：把接口边界写成可验证约束
contentType: guide
module: transformer-prompt
order: 15
summary: 用模式校验、最小权限和失败处理连接模型输出与真实工具。
tags: ["结构化输出", "工具调用", "JSON", "校验"]
updatedAt: 2026-08-15
reviewedAt: null
reviewStatus: null
prerequisites: ["prompt-design-boundaries"]
related: ["function-mcp-app-browser"]
sources: [{"id":"tools-jsonschema-core","slug":"structured-output-tools","title":"JSON Schema Core 2020-12","module":"transformer-prompt","excerpt":"模式定义 JSON 实例的结构约束。","url":"https://json-schema.org/draft/2020-12/json-schema-core","kind":"official-doc"},{"id":"tools-owasp-output","slug":"structured-output-tools","title":"OWASP LLM06","module":"transformer-prompt","excerpt":"过度代理会把模型输出转成未受控动作。","url":"https://genai.owasp.org/llmrisk/llm062025-excessive-agency/","kind":"official-doc"},{"id":"tools-owasp-improper-output","slug":"structured-output-tools","title":"OWASP LLM05","module":"transformer-prompt","excerpt":"不当输出处理会扩大下游风险。","url":"https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/","kind":"official-doc"}]
evidence: []
---

## 适用问题

模型输出需要调用工具、写入受控流程或被下游程序读取。

## 关键取舍

越严格的模式越容易失败得早，但能避免含糊文本直接越过接口边界。

## 失败与恢复

校验失败时返回可解释错误、有限重试或人工处理，不执行未经校验的动作。

## 决策清单

- 为每个字段定义类型和必填条件。
- 将权限与输入校验置于模型外。

### 可执行步骤

先为工具输入写 JSON 模式、枚举值和拒绝条件，再在模型外执行解析、校验和授权。比如“创建工单”只能接受已知优先级、可验证标题和最小字段；反例是把自然语言直接传给写入接口。对每个工具准备格式错误、缺字段和越权三类测试样本。

### 三道闸门

结构闸门检查 JSON 是否能解析、字段类型是否匹配模式；业务闸门检查“合法但不可接受”的内容，例如 `{"priority":"high","title":"删除全部客户数据"}` 即使符合字符串和枚举，也必须违反业务规则而被拒绝；权限闸门由服务端根据当前身份、资源范围和审批状态决定，不能由模型声称“已授权”来放行。每一闸失败都返回机器可读原因，不调用真实工具。

### 测试样本

准备一条结构无效样本（例如 `priority` 为数组）、一条结构有效但业务不接受的样本，以及一条业务有效但无权限的样本。只有三条都被拒绝、且成功样本使用幂等键后，才允许接入写操作。模型负责提出候选参数，不承担解析、业务决策或授权。

### 失败信号与恢复动作

出现解析失败、字段漂移或权限不匹配时，不执行动作也不偷偷修正内容；返回可解释校验错误，允许有限重试，随后转人工。恢复后检查幂等键，避免重复提交。

## 原始来源

- [JSON Schema Core 2020-12](https://json-schema.org/draft/2020-12/json-schema-core)
- [OWASP LLM05](https://genai.owasp.org/llmrisk/llm052025-improper-output-handling/)
- [OWASP LLM06](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)
