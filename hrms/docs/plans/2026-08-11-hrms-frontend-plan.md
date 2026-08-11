# HRMS 前端项目整体方案

## 1. 项目概述

- 项目名称：企业人力资源管理系统（HRMS）
- 项目定位：用于 Vue 前端开发工程师面试展示的企业内部管理后台
- 项目路径：`/Users/yaotao/Codex Workplace/01-projects/P009-hrms-vue3`
- 当前阶段：方案已确认，尚未创建 Vue 工程或业务代码
- 核心目标：用适中的代码量完整展示 Vue 3 工程能力、后台 CRUD、登录鉴权、页面和按钮权限、业务状态流及基础数据可视化

### 设计原则

1. 企业后台优先：清晰、克制、信息密度适中，不做炫技动画。
2. 业务闭环优先：九个核心模块均可操作，不以静态页面冒充完成。
3. 面试可讲解：关键实现显式、结构清楚，避免过度抽象和黑盒插件。
4. 前后端可替换：页面统一通过 Axios API 层访问数据，未来接真实后端时不重写视图。
5. 演示可恢复：数据本地持久化，并支持一键恢复初始演示数据。

## 2. 范围与非目标

### 本期范围

| 模块 | 页面与主要能力 | 操作闭环 |
| --- | --- | --- |
| 登录 | 用户名/密码、表单校验、记住登录、演示账号提示、退出登录 | 登录、恢复会话、退出 |
| Dashboard | 核心指标、员工趋势、部门人数、考勤概览、待审批、近期入职 | 查询、刷新、跳转待办 |
| 员工管理 | 搜索、筛选、分页、员工表单、详情、状态标签 | 新增、查看、编辑、删除/停用 |
| 部门管理 | 部门树表、负责人、上级部门、排序、状态 | 新增、查看、编辑、删除/停用 |
| 考勤管理 | 日期范围、部门、状态筛选，上下班时间与异常说明 | 新增、查看、编辑、删除 |
| 请假审批 | 我的申请/审批列表、请假表单、审批意见、状态记录 | 提交、查看、编辑待审批申请、批准、驳回、撤销、删除可删除记录 |
| 用户管理 | 账号、关联员工、角色、状态、密码操作 | 新增、查看、编辑、删除、启停、重置密码 |
| 角色管理 | 角色信息、成员数量、权限树 | 新增、查看、编辑、删除、启停、分配权限 |
| 权限管理 | 菜单/按钮权限树、权限编码、排序、状态 | 新增、查看、编辑、删除自定义权限、启停 |

### 明确不做

- 真实后端、数据库、文件上传与服务端安全认证
- 薪酬、招聘、绩效、培训、排班、补卡等扩展模块
- 多级审批、流程设计器、可配置数据权限引擎
- 国际化、暗色主题、多租户、微前端
- 为复用而提前建立复杂低代码表单、通用 CRUD 框架或领域层

## 3. 页面与布局结构

### 3.1 登录页

- 左侧为克制的品牌说明和系统能力摘要，右侧为登录卡片。
- 提供三个演示身份：超级管理员、HR 专员、普通员工。
- 密码只用于本地 Mock 演示；登录响应不返回密码字段。
- 登录成功后跳转原访问地址或 Dashboard。

### 3.2 后台主框架

```text
┌──────────────┬──────────────────────────────────────────┐
│ Logo / HRMS  │ 顶栏：折叠按钮 / 面包屑 / 用户菜单       │
├──────────────┼──────────────────────────────────────────┤
│              │                                          │
│ 左侧权限菜单 │ 主内容区                                 │
│              │ 页面标题 + 操作区 + 查询区 + 数据内容     │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

- 左侧菜单：Dashboard、人力资源、考勤与审批、系统管理。
- 顶栏：侧栏折叠、面包屑、当前用户和角色、重置演示数据、退出登录。
- 主内容：统一页面间距和卡片样式；列表页采用“标题/操作—筛选—表格—分页”。
- 不增加多页签缓存系统，避免路由状态和缓存复杂度干扰核心展示。

### 3.3 响应式策略

- 桌面端为主，宽屏显示完整侧栏。
- 中等宽度自动折叠侧栏，只显示图标。
- 小屏使用抽屉菜单；表格允许横向滚动，表单改为单列。
- 不追求移动端专用交互，保证查看与基础操作不破版即可。

## 4. 目录结构

```text
P009-hrms-vue3/
├── docs/
│   └── plans/
├── public/
├── src/
│   ├── api/
│   │   ├── modules/          # 按业务模块组织的 Axios 请求
│   │   ├── http.ts           # Axios 实例、拦截器、统一错误处理
│   │   └── types.ts          # API 响应与分页类型
│   ├── assets/               # 图片与静态资源
│   ├── components/
│   │   └── common/           # 少量跨页面组件，如 PageHeader、StatusTag
│   ├── constants/            # 状态选项、权限编码等稳定常量
│   ├── directives/
│   │   └── permission.ts     # v-permission 按钮权限指令
│   ├── layouts/
│   │   └── AppLayout.vue     # 侧栏、顶栏、主内容框架
│   ├── mock/
│   │   ├── database.ts       # localStorage 数据库读写与版本初始化
│   │   ├── seed.ts           # 初始演示数据
│   │   ├── auth.ts           # Mock 令牌和权限校验
│   │   ├── handlers/         # 各模块 Axios Mock 路由
│   │   └── index.ts          # Mock 启动入口
│   ├── router/
│   │   ├── routes.ts         # 静态路由和 meta 配置
│   │   └── index.ts          # 路由实例与全局守卫
│   ├── stores/
│   │   ├── auth.ts           # 会话、当前用户、角色和权限
│   │   └── app.ts            # 侧栏等全局 UI 状态
│   ├── styles/
│   │   ├── variables.css     # 设计变量
│   │   └── index.css         # 全局基础样式
│   ├── types/                # 业务模型类型
│   ├── utils/                # 日期、校验、树转换等小型纯函数
│   ├── views/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── employees/
│   │   ├── departments/
│   │   ├── attendance/
│   │   ├── leave/
│   │   ├── system/users/
│   │   ├── system/roles/
│   │   ├── system/permissions/
│   │   └── error/
│   ├── App.vue
│   └── main.ts
├── .editorconfig
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

目录只分到能表达职责的层级。不会额外增加 repository、domain、use-case 或通用 CRUD 配置层。

## 5. 核心数据模型

所有实体使用字符串 ID，并包含 `createdAt`、`updatedAt`。时间统一保存为 ISO 字符串，页面按本地时区展示。

### 5.1 Employee 员工

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 主键 |
| employeeNo | string | 唯一工号 |
| name | string | 姓名 |
| gender | `male \| female \| other` | 性别 |
| mobile / email | string | 联系方式 |
| departmentId | string | 所属部门 |
| position | string | 岗位 |
| hireDate | string | 入职日期 |
| status | `active \| inactive` | 在职/停用 |

### 5.2 Department 部门

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id / code / name | string | 主键、唯一编码、名称 |
| parentId | string \| null | 上级部门，支持树形展示 |
| managerEmployeeId | string \| null | 部门负责人 |
| sort | number | 排序 |
| status | `enabled \| disabled` | 状态 |

### 5.3 AttendanceRecord 考勤记录

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id / employeeId | string | 主键、员工 |
| date | string | 考勤日期，同一员工同一天唯一 |
| checkIn / checkOut | string \| null | 上下班时间 |
| status | `normal \| late \| early_leave \| absent \| leave` | 考勤状态 |
| remark | string | 异常说明 |

### 5.4 LeaveRequest 请假申请

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id / applicantEmployeeId | string | 主键、申请员工 |
| type | `annual \| sick \| personal \| other` | 请假类型 |
| startTime / endTime | string | 起止时间 |
| duration | number | 请假时长（天） |
| reason | string | 原因 |
| status | `pending \| approved \| rejected \| withdrawn` | 状态 |
| approverUserId | string \| null | 审批人 |
| approvalComment | string | 审批意见 |
| submittedAt / approvedAt | string \| null | 流程时间 |

### 5.5 User 用户

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id / username / displayName | string | 主键、登录名、显示名 |
| employeeId | string \| null | 可选关联员工 |
| roleIds | string[] | 角色列表 |
| status | `enabled \| disabled` | 状态 |
| password | string | 只存在 Mock 数据内部，不进入页面响应和 Pinia |

### 5.6 Role 角色

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id / code / name | string | 主键、唯一编码、名称 |
| description | string | 说明 |
| permissionCodes | string[] | 权限编码集合 |
| status | `enabled \| disabled` | 状态 |
| builtin | boolean | 内置角色保护标识 |

### 5.7 Permission 权限

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id / code / name | string | 主键、唯一编码、名称 |
| parentId | string \| null | 权限树父节点 |
| type | `menu \| action` | 页面菜单或按钮动作 |
| routePath | string \| null | 菜单权限对应路由 |
| sort | number | 排序 |
| status | `enabled \| disabled` | 状态 |
| builtin | boolean | 内置权限保护标识 |

## 6. 路由结构

| 路径 | 页面 | 权限 | 备注 |
| --- | --- | --- | --- |
| `/login` | 登录 | 公开 | 已登录访问时跳转 Dashboard |
| `/dashboard` | Dashboard | `dashboard:view` | 默认首页 |
| `/employees` | 员工管理 | `employee:view` | 人力资源菜单 |
| `/departments` | 部门管理 | `department:view` | 人力资源菜单 |
| `/attendance` | 考勤管理 | `attendance:view` | 考勤与审批菜单 |
| `/leave` | 请假审批 | `leave:view` | 根据角色展示“我的申请/待我审批” |
| `/system/users` | 用户管理 | `user:view` | 系统管理菜单 |
| `/system/roles` | 角色管理 | `role:view` | 系统管理菜单 |
| `/system/permissions` | 权限管理 | `permission:view` | 系统管理菜单 |
| `/403` | 无权限 | 已登录 | 明确提示并返回可访问页面 |
| `/:pathMatch(.*)*` | 404 | 公开 | 未知路由兜底 |

路由采用固定配置，并由 `meta.permission` 过滤菜单和拦截访问；不使用运行期动态 `addRoute`，降低刷新、404 和路由重复注册问题。

## 7. 登录与权限模型

### 7.1 权限编码

采用 `资源:动作`：

- 页面：`employee:view`、`department:view`、`attendance:view`
- 动作：`employee:create`、`employee:update`、`employee:delete`
- 审批：`leave:create`、`leave:update`、`leave:approve`、`leave:withdraw`
- 系统：`user:*`、`role:*`、`permission:*` 对应具体动作编码，不依赖模糊字符串判断

### 7.2 三层校验

1. 菜单层：根据页面权限生成可见菜单。
2. 路由层：全局守卫检查登录状态和 `meta.permission`，无权限进入 `/403`。
3. 操作层：`v-permission` 或 `usePermission()` 控制按钮；Mock API 对敏感写操作再次校验，避免只隐藏按钮却能直接调用接口。

### 7.3 预置角色

| 角色 | 主要权限 |
| --- | --- |
| 超级管理员 | 全部模块、全部动作、系统设置；内置账号和角色不可删除 |
| HR 专员 | Dashboard、员工、部门、考勤、请假审批；不进入用户/角色/权限管理 |
| 普通员工 | Dashboard、查看本人考勤、提交/查看/撤销本人请假 |

本期不实现通用“本人/本部门/全部”数据权限配置器。普通员工只能读取自己的考勤和申请，这是 Mock API 的固定隐私规则，而不是可配置数据范围功能。

### 7.4 会话流程

- 登录成功生成本地 Mock token；勾选“记住登录”保存到 `localStorage`，否则保存到 `sessionStorage`。
- Pinia 只保留 token、当前用户和权限集合，不保留密码。
- 刷新页面时通过 `/auth/me` 恢复用户和权限。
- 用户停用、角色停用或演示数据重置后，失效会话回到登录页。

## 8. Mock API 与本地数据设计

### 8.1 实现方式

- 使用统一 Axios 实例调用 `/api/*`。
- 开发阶段用 `axios-mock-adapter` 拦截该实例，不修改页面调用方式。
- 数据库存于带版本号的 `localStorage` 键，例如 `hrms_demo_db_v1`。
- 初次访问或版本变化时载入 `seed.ts`；重置按钮需二次确认，重置后清除当前会话并返回登录页。
- 接口模拟适度延迟、分页、搜索、业务错误和 HTTP 状态，不刻意模拟复杂网络故障。

### 8.2 统一响应

```text
ApiResponse<T> = { code, message, data }
PageResult<T> = { list, total, page, pageSize }
```

Axios 响应拦截器统一处理登录过期、权限不足和业务错误；页面只处理成功数据及确需就地展示的表单错误。

### 8.3 关键接口组

- `/auth/login`、`/auth/me`、`/auth/logout`
- `/dashboard/summary`
- `/employees`、`/departments`、`/attendance`
- `/leave-requests` 及 `approve`、`reject`、`withdraw` 动作
- `/users`、`/roles`、`/permissions`
- `/mock/reset`

### 8.4 数据一致性规则

- 工号、部门编码、用户名、角色编码、权限编码保持唯一。
- 部门存在子部门或员工时禁止删除。
- 员工绑定用户或存在考勤/请假历史时禁止删除，允许停用。
- 角色已绑定用户、权限已绑定角色时禁止删除；内置记录不可删除。
- 当前登录用户不能删除或停用自己。
- 请假结束时间必须晚于开始时间；只有待审批申请可编辑、批准或驳回，申请人可撤销待审批申请。
- 同一员工同一天只能存在一条考勤记录。

## 9. Pinia 状态划分

- `authStore`：token、当前用户、权限集合、登录、恢复会话、退出、`hasPermission()`。
- `appStore`：侧栏折叠和移动端抽屉状态。
- 员工、部门、考勤等服务端数据不长期复制进 Pinia，由页面调用 API 获取，避免双数据源和刷新同步问题。

## 10. 开发顺序

1. **工程初始化**：Vite Vue TS、依赖、ESLint、基础样式、Git 忽略文件和 README。
2. **类型与 Mock 基座**：业务类型、种子数据、localStorage 数据库、Axios 实例、统一响应和错误处理。
3. **登录与权限主链路**：登录页、authStore、路由守卫、权限指令、三类账号。
4. **后台布局**：侧栏、顶栏、面包屑、响应式菜单、403/404。
5. **系统权限基础**：用户、角色、权限 API 和页面，先打通角色—权限—菜单/按钮变化。
6. **组织主数据**：部门管理后实现员工管理，建立负责人和部门关联。
7. **考勤管理**：筛选、分页、增删改查、异常状态和唯一性校验。
8. **请假审批**：申请、编辑、审批、驳回、撤销及角色差异。
9. **Dashboard**：基于现有业务数据聚合指标和 ECharts 图表，避免先写死统计。
10. **演示恢复与打磨**：重置数据、空状态、加载态、错误提示、确认弹窗和表单体验。
11. **验证与文档**：Lint、类型检查、构建、关键单元测试、三角色人工验收、README 演示说明。

顺序先保证鉴权和数据关系，再建设业务页面；Dashboard 最后接真实 Mock 聚合数据，不维护第二套假统计。

## 11. 技术选型及原因

| 技术 | 用途 | 选择原因 |
| --- | --- | --- |
| Vue 3 | UI 框架 | Composition API 和响应式系统适合表单、列表及权限状态组织，也是目标岗位核心能力 |
| Vite | 构建工具 | Vue 3 官方主流工具链，启动和构建快，配置量小 |
| TypeScript | 类型系统 | 约束业务实体、表单、API 响应和权限编码，减少 CRUD 字段错配 |
| Element Plus | UI 组件库 | 企业后台常见，表格、表单、对话框、树、分页组件完整，可把精力放在业务闭环 |
| Vue Router | 页面路由 | 官方路由，支持嵌套路由、路由元信息与全局鉴权守卫 |
| Pinia | 客户端状态 | 官方状态方案，只管理认证和布局等真正跨页面状态，API 数据留在页面 |
| Axios | HTTP 客户端 | 拦截器和实例配置适合统一 token、错误与未来真实后端切换 |
| axios-mock-adapter | 本地 API | 直接拦截 Axios 实例，配置轻、无需起 Mock 服务，保留真实 API 调用形态 |
| localStorage | 演示数据 | 刷新后保留 CRUD 结果，部署纯静态站点也可连续演示；配套一键重置控制污染 |
| ECharts | Dashboard | 企业后台图表成熟；只使用人数趋势、部门分布、考勤概览三类必要图表 |
| ESLint | 静态检查 | 统一 Vue、TypeScript 代码规则，在面试仓库中体现基本工程质量 |
| Vitest | 关键逻辑测试 | 与 Vite 集成直接，用少量测试覆盖权限判断、状态流和 Mock 数据规则，不追求高覆盖率数字 |
| npm | 包管理 | 候选人和面试官环境普遍可用，降低安装与运行门槛 |

不引入自动导入、低代码 CRUD、状态持久化插件、CSS 预处理器或大型工具库；普通 CSS 变量和少量纯函数足够完成本项目。

## 12. UI 规范

- 浅色企业后台，主色采用克制蓝色，成功/警告/危险色沿用 Element Plus 语义。
- 内容背景浅灰，卡片白色，统一圆角、间距和轻边框，不使用大面积渐变和玻璃拟态。
- 表单标签和按钮文案使用真实业务语言；危险操作必须二次确认。
- 列表具备加载、空数据、错误、无权限和禁用状态；状态统一用标签表达。
- Dashboard 图表不超过三张，关键数字优先，避免装饰性图表。

## 13. 验证与验收标准

### 自动验证

- `npm run lint`
- `npm run type-check`
- `npm run test`
- `npm run build`

### 关键测试

- 权限集合与按钮判断正确。
- 路由守卫能区分未登录、无权限和可访问。
- 员工、部门、角色、权限的关联删除保护正确。
- 请假状态只能按允许路径变化。
- 考勤同员工同日期唯一。
- 重置演示数据能恢复种子并使旧会话失效。

### 人工验收

1. 超级管理员能访问九个模块并完成受允许的 CRUD。
2. HR 专员看不到系统管理菜单，但能维护人事、考勤并审批请假。
3. 普通员工只能查看本人考勤及维护本人请假，不能通过直接 URL 越权。
4. 修改角色权限后重新登录，菜单、路由和按钮同步变化。
5. 刷新后数据保留；重置后恢复初始演示数据。
6. 桌面端主要分辨率布局稳定，小屏菜单可用且表格不破版。
7. 浏览器控制台无未处理错误，构建产物可作为静态站点运行。

## 14. 实施边界与风险

- 前端 Mock 权限只能证明交互和架构思路，不能替代真实后端安全校验；README 必须明确这一点。
- `localStorage` 不保存生产敏感信息；演示密码只存在种子数据，且不进入响应和状态仓库。
- 权限和角色修改可能让当前账号失去访问能力，内置超级管理员保留兜底权限。
- ECharts 实例需在组件卸载时销毁，并响应容器尺寸变化，避免内存和布局问题。
- 当前不追求抽象率和测试覆盖率数字，验收以九模块闭环、三角色权限和稳定构建为准。

## 15. 执行启动信息

- Git 快照：目标仓库在方案阶段新建，为空仓库；无历史提交、无未提交业务代码、无现有 worktree。
- 已选执行环境：任务分支。初始化提交后从 `main` 创建单独任务分支；不使用 worktree。
- 未提交改动处置：当前只有本方案文件，作为初始规划资产保留；编码前重新检查 Git 状态。
- 状态变化暂停条件：若编码前出现来源不明的文件、提交或并行工作，先确认归属，不覆盖或带入任务分支。
- 复盘方式：由主 agent 在完成实现和验证后按需求覆盖、权限边界、复杂度和演示体验清单复盘，不启用 subagent。
- Goal：本轮只做方案，不创建 Goal；获得明确“开始实现”授权、复核 Git 状态并建立任务分支后再创建和核验 Goal。
- 数据与破坏性边界：仅使用本地 Mock 数据；不连接真实后端、不调用外部业务系统、不删除现有 P008 项目。
- 计划模型门禁：当前会话无法核验 `gpt-5.6-sol + Ultra`，用户于 2026-08-11 明确要求按当前状态继续输出方案。

## 16. 方案自检记录

### 第一轮：完整性与边界

- 覆盖用户要求的九个模块、页面结构、目录、数据模型、路由、权限、开发顺序和技术选型。
- 明确了精简范围、非目标、数据持久化、删除约束、重置机制和三角色权限。
- 结论：无未解决的范围缺口。

### 第二轮：可执行性与验收

- 模块实施顺序与数据依赖一致；部门先于员工，权限主链路先于业务页面，Dashboard 最后聚合真实 Mock 数据。
- 验证覆盖 Lint、类型、测试、构建和三角色人工验收，可证明主要结果。
- 执行环境、Git 状态、暂停条件、数据边界和 Goal 入口均已记录。
- 结论：方案可执行；正式编码前只需复核 Git 状态并获得明确实施授权。
