# Visual concept task card

## 目标

<single bounded visual concept exploration objective>

## 输入

- <approved plan, released product specification when required, current surface, real content, and constraints>

## 拥有路径

- `.planning/dispatch/<goal-id>/artifacts/concept-briefs/`
- `.planning/dispatch/<goal-id>/artifacts/figma-first-drafts/`
- `.planning/dispatch/<goal-id>/reports/concept.md`

## 只读路径

- `<current application, released product specification, and existing design-system paths>`

## 技能

- `$p007-visual-concept-explorer`

## 接口契约

<commander-owned contract or none>

## 概念范围与输入

- 产品规格基线路径与释放证据：<path/evidence or not required>
- 核心用户、场景、任务和真实内容：<...>
- 已有设计语言与本次不得改变的产品约束：<...>

## 十二个概念 Brief

- 输出恰好 12 个结构化 Brief，分为恰好 4 个明显不同的方向族，每族 3 个。
- 每个 Brief 包含 ID、名称、目标感受、构图、视觉母题、关键色彩或字体、标志性动作、Figma AI 提示、风险与淘汰信号。
- 四族必须在信息层级与构图上有本质差异，不得只是换色、换字体或换图片。

## 四个 Figma First Draft

- 本次 dispatch 新建独立 Figma Design 文件；不得复用其他任务的概念文件。
- 使用原生 Figma Agent/First Draft 将四个方向族各生成一个可编辑画面，共 4 个。
- 记录 Figma 文件 URL、4 个节点 ID、4 张截图与所用提示包。
- 若 Figma AI 权限或额度不可用，进入 `waiting_human` 并记录原因；不得静默改由 Sol 手工生成方向。

## 模型与回退记录

- 请求模型：`gpt-5.6-luna`，`none`。
- 当前接口不支持该精确组合时，仅允许显式回退 `gpt-5.6-terra`，`low`。
- 记录 requested/effective 模型、思考档位、是否回退及具体原因。

## 第一次人工选择

- 只有 12 个 Brief 与 4 个实际 First Draft 节点/截图全部齐全后才能请求选择。
- 记录用户批准原文、选中 Brief ID，以及构图、视觉母题、关键色彩或字体三项锁定特征。
- 概念师不得自行批准，也不得放行设计精修或实现。

## 交付物

- 12 个结构化 Brief、Figma AI 提示包、4 个 First Draft 节点/截图和临时概念报告。

## 验收标准

- 数量、方向族、Figma 证据、实际路由、回退原因与用户选择证据完整。
- 所有交付物保持临时属性，不触碰正式设计规范、最终 Figma 或业务代码。

## 验证命令

- `<safe count, metadata, and path-boundary validation command>`

## 禁止事项

- 不修改业务代码、共享契约、`docs/specs/` 或最终 Figma 设计。
- 不提交、推送、创建 PR、合并、部署或触碰生产数据。
- 不自行批准方向，不把普通确认当作选择证据，不静默进行模型或 Figma 能力降级。

## 阻塞关系

- <Product baseline card id or none>
