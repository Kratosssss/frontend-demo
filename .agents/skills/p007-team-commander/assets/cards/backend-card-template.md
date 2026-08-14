# Backend task card

## 目标

<single bounded backend objective>

## 输入

- <approved plan, released product specification when required, final design specification, and interface contract>

## 拥有路径

- `<exclusive backend writable path>`
- `.planning/dispatch/<goal-id>/reports/backend.md`

## 只读路径

- `<frontend, shared contract, and design paths>`

## 技能

- `$p007-backend-engineer`

## 接口契约

<commander-owned contract>

## 设计门禁期间

- 产品规格基线未释放时仅可只读侦察、列出数据假设和澄清问题。
- 方向批准和最终 Figma 批准完成前仅做只读侦察、数据流梳理、风险分析和接口草案。
- 最终 Figma 批准证据缺失时不得修改业务代码、数据模型或服务行为。

## 数据与副作用边界

- <input validation, compatibility, failure behavior, data boundary, and side effects>

## 交付物

- 后端实现、接口或层级测试和角色报告。

## 验收标准

- 实现符合共享契约，覆盖输入、失败行为、兼容性和数据风险。

## 验证命令

- `<backend tests and safe validation commands>`

## 禁止事项

- 不提交、推送、创建 PR、合并或部署。
- 不修改共享契约、前端路径或其他角色拥有的路径。
- 不触碰生产数据，不在最终 Figma 批准前写业务代码。

## 阻塞关系

- Product baseline release, Design final Figma approval, and <card id or none>
