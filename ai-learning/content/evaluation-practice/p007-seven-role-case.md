---
slug: p007-seven-role-case
title: P007 七角色编队：用门禁与证据收束一次公开交付
contentType: case-study
module: evaluation-practice
order: 27
summary: 一个脱敏公开案例：产品、概念、设计、前端与 QA 在共享契约和人工门禁下协作。
tags: ["P007", "案例", "协作", "人工验收"]
updatedAt: 2026-08-15
reviewedAt: null
reviewStatus: null
prerequisites: ["multi-agent-collaboration", "evaluation-human-acceptance"]
related: ["multi-agent-collaboration"]
sources: [{"id":"case-autogen","slug":"p007-seven-role-case","title":"AutoGen","module":"evaluation-practice","excerpt":"多代理协作需要明确沟通与控制边界。","url":"https://arxiv.org/abs/2308.08155","kind":"paper"}]
evidence: [{"id":"p007-role-map","label":"P007 七角色公开协作图","kind":"document","path":"/evidence/p007-role-map.svg","supports":"只支持七角色模板，以及本次 Active 和 Backend Skip 的边界。"},{"id":"p007-l3-reference","label":"L3 获选视觉方向参考图","kind":"screenshot","path":"/evidence/p007-l3-reference.png","supports":"只支持获选的暖白纸底、红色路径、蓝色批注与横向档案窗这一视觉意图。","alt":"L3 证据时间轴的获选概念参考图。"},{"id":"p007-v2-homepage","label":"P007 V2 首页实现截图","kind":"screenshot","path":"/evidence/p007-v2-homepage.png","supports":"只支持在 1440 像素桌面视口中可见的首页实现。","alt":"1440 像素桌面视口下的 AI 工程知识库首页，显示红色四段证据路径、P007 横向档案窗和暖白背景。"},{"id":"p007-v2-validation","label":"P007 V2 公开验证记录","kind":"document","path":"/evidence/p007-v2-validation.json","supports":"只支持所列命令在 2026-08-15 于公开 ai-learning V2 范围内以零退出状态完成。"}]
---

## 问题与约束

目标是公开静态知识库；不接登录、远端写入、模型 API 或不可公开的项目资料。

## 脱敏决策

采用共享内容契约、设计批准后再实现、前端只修改拥有路径的协作边界。

## 角色协作

七角色编队模板包含总指挥、Product、Concept、Design、Frontend、Backend 与 QA。本次实际 Active 的是 Product、Concept、Design、Frontend、QA；Backend 明确跳过，因为交付是本地 Markdown、静态索引和浏览器 UI，不包含登录、模型 API、数据库或远端写入。总指挥维护共享契约、任务边界和门禁。

Concept 先提供获选视觉方向与三项锁定特征；Design 在此基础上输出实现规格并等待最终人工批准。Frontend 不在批准前改业务界面，获批后仅修改 `ai-learning/` 拥有路径；QA 使用内容、路由、状态、截图和构建证据独立复核。该顺序是本次真实采用的门禁关系，而非对所有项目的普适流程。

## 人工验收

本次人工批准确认了获选 L3 证据时间轴画面、暖白纸底、红色四段路径、蓝色批注与横向档案窗；返修阶段又要求恢复来源渲染边界、负向内容校验和七角色图的真实角色区分。自动校验覆盖内容索引、确定性写入、负向数据、搜索权重、组件测试、lint、类型和构建；人工走查判断是否出现伪造指标、未公开结论或视觉退化。

公开证据只支持本次可见的协作结构、获选视觉意图和实现边界。没有公开的效率数字、个人信息、内部聊天或不可公开产物不进入案例；缺失时保留不展示结论的边界，而不是用装饰数据填补。旧的实现摘要仅记录范围，不作为测试执行的证明。

## 公开证据

- [P007 七角色公开协作图](/evidence/p007-role-map.svg)：支持“门禁式分工”的公开说明。
- [L3 获选视觉方向参考图](/evidence/p007-l3-reference.png)：只支持获选的视觉方向，不证明实现已经完成。
- [P007 V2 首页实现截图](/evidence/p007-v2-homepage.png)：只支持可见的首页实现；测试命令的实际运行由独立验证记录说明。
- [P007 V2 公开验证记录](/evidence/p007-v2-validation.json)：只支持所列命令及其范围与日期。

## 原始来源

- [AutoGen](https://arxiv.org/abs/2308.08155)
