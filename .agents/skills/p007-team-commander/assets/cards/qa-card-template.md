# QA task card

## 目标

<single bounded independent verification objective>

## 输入

- <implementation Goal ID, review manifest reference, approved product/concept/design specifications, plan, active cards, reports, diff, and approval evidence>

## 拥有路径

- `<none; QA keeps business and shared files read-only>`

## 只读路径

- `<all in-scope implementation, test, design, and dispatch paths>`

## 技能

- `$p007-qa-engineer`

## 接口契约

<commander-owned contract>

## 风险与范围

- 本卡只能在最终视觉审批完成后、实施 Goal 已创建并记录 review manifest 引用时创建。
- QA 启用原因：<matched risk trigger(s)>
- 变更面与共享影响：<bounded paths, flows, contracts, or projects>
- 可复用证据：<current owner test/build/lint/screenshots and report paths>
- 独立检查：默认最多 3 个最高价值的独立检查；只有已记录风险无法被较小检查覆盖时才扩展。
- 全仓命令：<not required, or exact shared-risk justification>

## 批准证据核验

- 仅在 Product 启用时核验产品规格路径、baseline ready 状态和重大产品决策批准证据。
- Concept/Design 启用时核验 12 个 Brief、4 个 Figma First Draft 节点/截图、requested/effective 路由及回退原因、选中概念、三项锁定特征、最终 Figma/Make 链接或静态跳过理由和最终批准证据。
- 适用证据缺失时不得判定实现通过；未启用的门禁不得变成额外 QA 工作。

## 视觉与反公式化验收

- 仅在 Design 启用时，对照最终 Figma/Make 和三项锁定特征检查卡片范围内的桌面端、移动端、关键状态、交互、无障碍和 reduced-motion。
- 检查实现是否退回已禁止的通用 Hero、等宽卡片阵列或其他 AI 套版。
- 使用实现截图记录可复现的视觉差异。

## 独立验收边界

- QA 只验证批准方向和实现一致性，不重新设计、不改变视觉方向。
- 缺陷退回原责任卡代理，最多两轮返修复验。

## 规格符合性验收

- 独立核验用户问题、目标与非目标、产品规则、边界情况、验收标准、批准设计和接口契约。
- 发现未批准的范围扩大、产品规则变化或规格缺口时单独报告，不以代码能运行代替规格符合。

## 工程质量验收

- 复用责任角色当前且可信的测试、构建、lint 和截图证据，只对变更面、共享影响、关键回归和错误路径补独立检查。
- 不得重复运行责任角色已经通过的同一套命令；无明确共享风险时不得安装全部依赖、运行全仓测试或全量构建。
- 工程质量结论与规格符合性结论分开记录，两者均通过才能给出最终通过。

## 交付物

- 独立 QA 报告、证据索引、规格符合性结论、工程质量结论、综合通过/失败结论和剩余风险。

## 验收标准

- 所有需求、契约、批准证据、路径边界和验证命令均通过，或明确给出阻塞证据。

## 验证命令

- `<up to three focused independent commands/checks by default; expand only with recorded risk justification>`

## 禁止事项

- 不修改业务代码、共享契约或其他角色拥有的路径。
- 不提交、推送、创建 PR、合并、部署或触碰生产数据。

## 阻塞关系

- Product, Concept, Design, Frontend, Backend reports and <card id or none>
