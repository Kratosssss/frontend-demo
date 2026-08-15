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

### 主流程

- `$p007-product-designer`：角色职责、设计门禁、文件边界和交付流程的权威来源。
- `$refero-design`：在绘制方向图或进入 Figma 前完成视觉研究、参考锁定和设计决策记录。

### 条件技能

- `$imagegen`：仅在方向图或必要视觉资产会实质改善结果时使用；不得为了“显得完成”而生成装饰图。

### 使用顺序

1. 先读取 `$p007-product-designer` 及其 `PITFALLS.md`，确认职责、门禁和当前阶段。
2. 再用 `$refero-design` 完成研究、综合和参考锁定，然后才绘制方向图或操作 Figma。
3. 仅在已明确资产用途、构图位置和审美约束后调用 `$imagegen`。

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

## Refero 研究与参考锁定

- 研究是设计前置条件：先查 styles 建立审美边界，再按任务需要查 screens 获取具体构图模式、查 flows 核对完整旅程。
- 每个视觉方向锁定一个主参考和少量有明确用途的辅参考；不得把互相冲突的参考平均混合成无辨识度方案。
- 在设计报告中记录“概念、参考锁、取舍理由、拒绝项”的决策账本，使方向图、Figma 和最终规范可追溯。
- Refero MCP 不可用时，使用 `$refero-design` 自带参考资料、用户提供的证据和经核验的公开参考继续工作，并在报告中标明研究限制；不得凭氛围记忆直接设计。

## Demo 资产政策

- 允许使用虚构品牌、虚构商品、占位内容和经过艺术指导的生成资产；Demo 的真实性来自体验一致性，不要求伪装成真实商业数据。
- 占位资产必须有明确用途、统一风格、合理裁切和可信内容层级；不得用重复几何块或随手占位破坏获批方向。
- 不得伪造真实销量、用户评价、媒体背书、支付标识、合作品牌或其他可能误导用户的商业证明。

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
- 设计报告包含每个方向及最终稿的参考锁与决策账本，关键视觉选择可追溯且没有未经说明的参考漂移。

## 验证命令

- `<safe artifact and specification validation command>`

## 禁止事项

- 不提交、推送、创建 PR、合并或部署。
- 不修改业务代码、共享契约或其他角色拥有的路径。
- 方向批准前不调用 Figma；最终 Figma 批准前不授权实现。
- 不静默改变已释放的产品范围、业务规则或验收标准；发现缺口时退回产品角色或总指挥澄清。

## 阻塞关系

- <card id or none>
