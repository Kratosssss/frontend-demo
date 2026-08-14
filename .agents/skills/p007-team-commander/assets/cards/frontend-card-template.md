# Frontend task card

## 目标

<single bounded frontend objective>

## 输入

- <approved plan, released product specification when required, final design specification, Figma evidence, and interface contract>

## 拥有路径

- `<exclusive frontend writable path>`
- `.planning/dispatch/<goal-id>/artifacts/frontend/`
- `.planning/dispatch/<goal-id>/reports/frontend.md`

## 只读路径

- `<backend, shared contract, and approved design paths>`

## 技能

- `$p007-frontend-engineer`

## 接口契约

<commander-owned contract>

## 最终设计输入

- 选定方向：<direction id>
- 最终 Figma 文件 URL：<url>
- 最终 Figma 节点 ID：<node id>
- 最终批准证据：<manifest/report reference>

## 实现边界

- 产品规格基线未释放时只读侦察，不写业务代码，也不自行补造产品规则。
- 仅实现最终批准的 Figma 与设计规范，不自行改变视觉方向。
- 不得以通用组件套版、等宽卡片阵列或默认 Hero 替代获批构图。
- 设计输入缺失或未最终批准时拒绝写业务界面。

## 视觉还原证据

- 提交桌面端、移动端和关键状态实现截图。
- 对照最终 Figma 记录差异、理由和残余限制。

## 交付物

- 前端实现、层级测试、实现截图和角色报告。

## 验收标准

- 功能、构图、视觉层级、响应式、交互、无障碍和 reduced-motion 与批准设计一致。

## 验证命令

- `<frontend tests, build, lint, and screenshot validation commands>`

## 禁止事项

- 不提交、推送、创建 PR、合并或部署。
- 不修改共享契约、后端路径或其他角色拥有的路径。
- 不在最终 Figma 批准前写业务界面或自行重新设计。

## 阻塞关系

- Product baseline release, Design final Figma approval, and <backend card id or none>
