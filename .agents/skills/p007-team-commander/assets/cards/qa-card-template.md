# QA task card

## 目标

<single bounded independent verification objective>

## 输入

- <approved plan/specification, all active cards, reports, diff, and design evidence>

## 拥有路径

- `<none; QA keeps business and shared files read-only>`

## 只读路径

- `<all in-scope implementation, test, design, and dispatch paths>`

## 技能

- `$p007-qa-engineer`

## 接口契约

<commander-owned contract>

## 批准证据核验

- 核验三张方向图、选定方向和第一次用户批准证据。
- 核验最终 Figma 文件 URL、节点 ID和第二次用户批准证据。
- 任一证据缺失时不得判定实现通过。

## 视觉与反公式化验收

- 对照最终 Figma 检查桌面端、移动端、关键状态、交互、无障碍和 reduced-motion。
- 检查实现是否退回已禁止的通用 Hero、等宽卡片阵列或其他 AI 套版。
- 使用实现截图记录可复现的视觉差异。

## 独立验收边界

- QA 只验证批准方向和实现一致性，不重新设计、不改变视觉方向。
- 缺陷退回原责任卡代理，最多两轮返修复验。

## 交付物

- 独立 QA 报告、验证证据、残余风险和暂停条件。

## 验收标准

- 所有需求、契约、批准证据、路径边界和验证命令均通过，或明确给出阻塞证据。

## 验证命令

- `<unit, integration, build, lint, regression, and visual validation commands>`

## 禁止事项

- 不修改业务代码、共享契约或其他角色拥有的路径。
- 不提交、推送、创建 PR、合并、部署或触碰生产数据。

## 阻塞关系

- Design, Frontend, Backend reports and <card id or none>
