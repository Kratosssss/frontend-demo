# Product task card

## 目标

<single bounded product-definition objective>

## 输入

- <approved plan, real product surface, existing specifications, representative content/data, and constraints>

## 拥有路径

- `.planning/dispatch/<goal-id>/reports/product.md`
- `docs/specs/<feature>-product-spec.md`

## 只读路径

- `<current application, design, data, contract, and research paths>`

## 技能

- `$p007-product-manager`

## 接口契约

<commander-owned contract or none>

## 用户问题与证据

- 目标用户与触发场景：<...>
- 用户问题、当前阻力与期望结果：<...>
- 已知证据、假设与待验证项：<...>

## 范围与非目标

- 本次目标与成功信号：<...>
- 明确范围：<...>
- 明确非目标：<...>

## 用户流程与产品规则

- 主流程、入口、状态变化与完成条件：<...>
- 权限、业务规则、失败恢复和不可逆操作：<...>
- 内容、真实数据字段与接口假设：<...>

## 边界情况

- <loading, empty, error, permission, long content, mobile, interruption, and recovery cases as relevant>

## 重大产品决策

- 是否需要用户决策：<true|false>
- 选项、取舍与推荐：<... or none>
- 用户决策证据：<manifest reference or pending>

## 产品规格基线

- 正式规格路径：`docs/specs/<feature>-product-spec.md`
- 规格完整且无重大未决项，或用户决策证据已记录后，才能标记 baseline ready。
- 产品规格只定义问题、范围、流程、规则和可观察结果，不规定高保真视觉方案。

## 交付物

- 正式产品规格与产品报告。
- 面向设计、前端、后端和 QA 的范围、规则、数据假设与验收依据。

## 验收标准

- 用户问题、目标、非目标、主流程、规则、边界和可观察验收标准完整且互不冲突。
- 假设与证据明确区分；重大产品取舍不得由产品角色或总指挥代替用户决定。

## 验证命令

- `<safe specification and artifact validation command>`

## 禁止事项

- 不提交、推送、创建 PR、合并或部署。
- 不修改业务代码、共享契约或其他角色拥有的路径。
- 不创建视觉方向、不调用 Figma、不批准设计门禁，也不静默扩大范围。

## 阻塞关系

- <card id or none>
