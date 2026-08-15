---
slug: function-mcp-app-browser
title: Function / MCP / App / 浏览器操作：把能力放在最窄边界
contentType: decision-card
module: transformer-prompt
order: 26
summary: 以权限、数据形态和可验证操作选择集成表面；此卡待复核。
tags: ["Function", "MCP", "App", "浏览器"]
updatedAt: 2026-08-15
reviewedAt: 2026-08-15
reviewStatus: review-needed
prerequisites: ["structured-output-tools", "prompt-injection-safety"]
related: ["structured-output-tools"]
sources: [{"id":"surface-jsonschema","slug":"function-mcp-app-browser","title":"JSON Schema Core 2020-12","module":"transformer-prompt","excerpt":"模式可约束结构化输入输出。","url":"https://json-schema.org/draft/2020-12/json-schema-core","kind":"official-doc"},{"id":"surface-mcp","slug":"function-mcp-app-browser","title":"Model Context Protocol specification 2026-07-28","module":"transformer-prompt","excerpt":"MCP 定义客户端和服务器间的能力协商。","url":"https://modelcontextprotocol.io/specification/latest","kind":"official-doc"},{"id":"surface-mcp-apps","slug":"function-mcp-app-browser","title":"MCP Apps overview","module":"transformer-prompt","excerpt":"Apps 在 MCP 中提供可见交互界面。","url":"https://modelcontextprotocol.io/extensions/apps/overview","kind":"official-doc"},{"id":"surface-webdriver","slug":"function-mcp-app-browser","title":"WebDriver","module":"transformer-prompt","excerpt":"WebDriver 定义浏览器自动化接口。","url":"https://www.w3.org/TR/webdriver2/","kind":"official-doc"},{"id":"surface-owasp","slug":"function-mcp-app-browser","title":"OWASP LLM06","module":"transformer-prompt","excerpt":"过度代理会扩大工具副作用风险。","url":"https://genai.owasp.org/llmrisk/llm062025-excessive-agency/","kind":"official-doc"}]
evidence: []
---

## 判断条件

明确所需数据、权限、交互可见性和失败后是否可由人恢复。

## 适用场景

能力边界能够被结构化输入、最小权限和测试覆盖的集成。

## 不适用场景

需要绕过认证、读取私密状态或无法复核的浏览器自动化。

## 选择依据

历史判断，需自行复核：优先使用权限最窄、输入输出最可验证的表面。

### 比较对象矩阵

它们不是互斥层级。Function 是带 JSON 模式和最小权限的单一动作；MCP 是协商并暴露多项受控能力的协议表面；App 是让用户看见并确认状态的交互界面；浏览器操作是依赖真实可见页面状态的执行方式。比较时逐项检查数据形态、授权边界、用户可见性、副作用和复现能力。

例如“提交报销”可由 App 收集并展示确认，Function 校验结构化参数，MCP 提供受控工具目录；只有确实不存在 API、且用户能看见并复查页面时，才考虑浏览器操作。不得把它们写成四选一，也不得以自动化绕过认证、私密会话或批准步骤。

### 升级与降级触发

当输入输出可被模式校验时，优先降级到 Function；当多工具需要统一边界时再评估 MCP；当必须展示给用户确认时选择 App。出现认证、权限不明或页面行为无法验证时停止浏览器操作并转人工，本卡在待复核状态下不应被当成当前推荐。

## 原始来源

- [JSON Schema Core 2020-12](https://json-schema.org/draft/2020-12/json-schema-core)
- [Model Context Protocol specification 2026-07-28](https://modelcontextprotocol.io/specification/latest)
- [MCP Apps overview](https://modelcontextprotocol.io/extensions/apps/overview)
- [WebDriver](https://www.w3.org/TR/webdriver2/)
- [OWASP LLM06](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)
