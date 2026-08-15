# Design director task card

## 目标

<single bounded final-design objective>

## 输入

- <approved plan, released product specification, twelve briefs, four First Draft frames, selected concept, locked characteristics, current surface, and constraints>

## 拥有路径

- `.planning/review/<review-id>/artifacts/final-design/`
- `.planning/review/<review-id>/reports/design.md`
- `docs/specs/<approved-design-spec>.md`

## 只读路径

- `.planning/review/<review-id>/artifacts/concept-briefs/`
- `.planning/review/<review-id>/artifacts/figma-first-drafts/`
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

- 深入检查真实界面、内容、行业视觉文化、已有设计语言和跨行业参考。
- 提炼可复用的设计原理，不复制外观，不把概念阶段的快速证据冒充研究结论。
- 记录本行业常见俗套、选中方向的风险与可执行的差异化机会。

## 反公式化清单

- <task-specific banned generic patterns>
- 不得默认使用渐变 Hero、等宽卡片阵列、玻璃拟态或固定 SaaS 落地页顺序。
- 任何被保留的常见模式必须说明业务作用。

## 获选概念与锁定特征

- 用户选择证据与 Brief ID：<...>
- 锁定构图：<...>
- 锁定视觉母题：<...>
- 锁定关键色彩或字体：<...>
- 选择证据或任一锁定特征缺失时保持只读，不得开始精修。

## Figma AI 与 Make 精修

- 用 Figma AI 提示和直接精修完成高保真页面、组件、响应式、关键状态、交互、文案、无障碍与 reduced-motion。
- 不得静默改变三项锁定特征；确有冲突时退回总指挥请求限定决策。
- 有关键交互或状态决策时用 Figma Make 制作可体验原型并记录 URL；静态页面记录具体跳过理由。
- 记录最终 Figma 文件 URL、节点 ID、Make URL 或跳过理由，以及最终画面证据。

## 最终人工批准

- 将最终 Figma 与适用的 Make 原型一起展示给用户。
- 记录用户批准原文；设计角色不得自行批准，也不得在证据齐全前放行实现。

## 交付物

- 最终 Figma 文件/节点、适用的 Figma Make 原型或跳过理由、设计报告与 `docs/specs/` 正式规范。

## 验收标准

- 最终设计忠于获选概念和三项锁定特征。
- 覆盖桌面、移动、关键状态、无障碍、reduced-motion 与实现所需规范。

## 验证命令

- `<safe artifact and specification validation command>`

## 禁止事项

- 不生成新一批概念方向，不改写用户已锁定的核心特征。
- 不提交、推送、创建 PR、合并或部署。
- 不修改业务代码、共享契约或其他角色拥有的路径。
- 最终批准前不授权实现；不静默改变产品范围、业务规则或验收标准。

## 阻塞关系

- Concept selection and <card id or none>
