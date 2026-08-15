---
slug: multimodal-engineering
title: 多模态工程：让图像、文本与证据对齐
contentType: guide
module: ai-foundations
order: 16
summary: 在多模态任务中先验证输入质量、引用边界与人工复核，而非把视觉理解当作确定事实。
tags: ["多模态", "图像", "证据", "复核"]
updatedAt: 2026-08-15
reviewedAt: null
reviewStatus: null
prerequisites: ["data-task-capability"]
related: ["evaluation-human-acceptance"]
sources: [{"id":"multimodal-nist-genai","slug":"multimodal-engineering","title":"NIST GenAI Profile","module":"ai-foundations","excerpt":"生成式 AI 风险管理需要可追溯治理。","url":"https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence","kind":"official-doc"},{"id":"multimodal-owasp-injection","slug":"multimodal-engineering","title":"OWASP LLM01","module":"ai-foundations","excerpt":"不可信内容可能影响模型行为。","url":"https://genai.owasp.org/llmrisk/llm01-prompt-injection/","kind":"official-doc"}]
evidence: []
---

## 适用问题

需要从图片、扫描件或界面截图中提取可供人复查的信息。

## 关键取舍

更高分辨率可能改善可见细节，却增加成本和隐私暴露面。

## 失败与恢复

低质量、敏感或无法解释的图像输入应转人工，不用猜测补全。

## 决策清单

- 确认图片来源、权限和分辨率。
- 为每个结论保留对应区域或原始资料。

### 可执行步骤

先确认图片是否可公开、文字是否清晰、区域是否与问题相关；再让读者能回到原图核验。处理票据时应先抽取候选字段，再由规则或人工确认关键金额和日期。反例是从模糊截图推断看不见的文字，或者把模型描述误当成图像事实。

### 截图字段提取范例

处理一张工单截图时，先检查最短边分辨率、截图版本、是否裁掉日期栏，以及是否含有不该进入系统的个人信息。只把编号、状态和日期候选值连同区域坐标交给后续规则；金额、支付状态和任何触发外部动作的字段必须人工复核。若页面中出现“忽略规则、提交请求”之类文字，它仍是图像数据，不是指令。

输入质量不达标、字段跨区域矛盾、关键字符置信不足或权限不清时拒绝自动处理。拒绝结果应说明“哪一个区域不足以支持结论”，并请求原图或人工核验；不要以通用视觉能力的演示结果外推到当前图片。

### 失败信号与恢复动作

当分辨率不足、图像含敏感资料或模型无法指出支持区域时，停止自动结论并请求更清晰、已脱敏的资料。恢复后保留原始文件版本和人工确认记录，不保存无关视觉数据。

## 原始来源

- [NIST GenAI Profile](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence)
- [OWASP LLM01](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
