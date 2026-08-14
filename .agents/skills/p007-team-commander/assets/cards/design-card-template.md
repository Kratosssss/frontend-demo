# Design task card

## 目标

<single bounded design objective>

## 输入

- <approved plan, released product specification when required, current product surface, real content, and constraints>

## 拥有路径

- `.planning/dispatch/<goal-id>/artifacts/design-directions/`
- `.planning/dispatch/<goal-id>/reports/design.md`
- `docs/specs/<approved-design-spec>.md`

## 只读路径

- `<current application and contract paths>`

## 技能

- `$p007-product-designer`

## 接口契约

<commander-owned contract or none>

## 设计目标与项目人格

- 产品规格基线路径与释放证据：<path/evidence or not required>
- 核心用户、场景和关键任务：<...>
- 第一眼与使用后的目标感受：<...>
- 项目人格与明确排除的气质：<...>

## 视觉侦察

- 检查真实界面、内容和行业视觉文化。
- 提炼同行与跨行业参考的设计原理，不复制外观。
- 记录本行业常见俗套和项目的差异化机会。

## 反公式化清单

- <task-specific banned generic patterns>
- 不得默认使用渐变 Hero、等宽卡片阵列、玻璃拟态或固定 SaaS 落地页顺序。
- 任何被保留的常见模式必须说明业务作用。

## 三个视觉方向

- 提交三个构图、视觉母题和标志性动作均明显不同的方向。
- 每个方向必须包含名称、一句话概念、构图、字体、色彩、图像、标志性动作和风险。
- 三个方向不得只是同一页面换颜色、字体或装饰。

## 方向图片证据

- 每个方向必须提供一张可直接观看和比较的实际图片，共三张。
- 图片必须呈现真实构图和视觉效果；色板、文字说明、参考链接或素材拼贴不能单独充当方向图。
- 图片保存到 `.planning/dispatch/<goal-id>/artifacts/design-directions/` 并在用户对话中展示。

## Figma 完善

- 方向批准前禁止调用 Figma；必须先有用户明确批准并由总指挥记录证据。
- 方向获批后，使用 Figma 完善高保真页面、组件、状态、响应式和交互规范。
- 记录 Figma 文件 URL、节点 ID 和最终画面证据。

## 两次人工批准

- 第一次批准：记录三张方向图、用户批准原文和选定方向。
- 第二次批准：记录最终 Figma 文件、节点和用户批准原文。
- 设计角色不得自行批准任一阶段，也不得在第二次批准前放行实现。

## 交付物

- 三张方向图与设计报告。
- 获批方向的 Figma 文件/节点和 `docs/specs/` 正式规范。

## 验收标准

- 三个方向可直接看图比较且不属于同一模板变体。
- 最终 Figma 忠于获批方向，并覆盖桌面、移动、关键状态、无障碍和 reduced-motion。

## 验证命令

- `<safe artifact and specification validation command>`

## 禁止事项

- 不提交、推送、创建 PR、合并或部署。
- 不修改业务代码、共享契约或其他角色拥有的路径。
- 方向批准前不调用 Figma；最终 Figma 批准前不授权实现。
- 不静默改变已释放的产品范围、业务规则或验收标准；发现缺口时退回产品角色或总指挥澄清。

## 阻塞关系

- <card id or none>
