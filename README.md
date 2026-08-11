# HRMS 企业人力资源管理系统

一个面向 Vue 3 前端岗位展示的企业管理后台。项目使用纯前端 Mock API，但保留了真实项目常见的 Axios 请求层、登录会话、菜单/路由/按钮权限、业务状态流和关联数据约束。

## 技术栈

- Vue 3、TypeScript、Vite、Vue Router、Pinia
- Element Plus、Axios、axios-mock-adapter、ECharts
- ESLint、Vitest、vue-tsc

## 本地运行

```bash
npm install
npm run dev
```

质量验证：

```bash
npm run lint
npm run type-check
npm run test
npm run build
```

## 演示账号

| 身份 | 用户名 | 密码 | 能力范围 |
| --- | --- | --- | --- |
| 超级管理员 | `admin` | `admin123` | 九个模块与全部系统权限 |
| HR 专员 | `hr` | `hr123456` | 员工、部门、考勤和请假审批 |
| 普通员工 | `employee` | `employee123` | Dashboard、本人考勤和本人请假 |

登录页可一键填入上述账号。数据保存在浏览器 `localStorage`；右上角用户菜单可恢复初始演示数据，恢复后旧会话立即失效。

## 功能范围

- 登录、会话恢复、退出与三类演示身份
- Dashboard 指标、趋势、部门分布、考勤概览和待办
- 员工、部门、考勤、用户、角色、权限的查询及受权限控制的 CRUD
- 请假提交、编辑、批准、驳回、撤销和可删除状态控制
- 菜单过滤、路由守卫、`v-permission` 按钮控制和 Mock API 二次鉴权
- 工号/编码/用户名唯一、关联删除保护、考勤日唯一和请假状态约束
- 桌面侧栏、中屏折叠和小屏抽屉布局

## 目录说明

- `src/api/`：Axios 实例、统一响应类型和分模块请求
- `src/mock/`：种子数据、版本化本地数据库、会话与 API 路由
- `src/stores/`：认证和布局状态
- `src/router/`：固定路由、权限元信息与全局守卫
- `src/views/`：九个核心模块页面
- `src/components/common/`：页面标题和状态标签等小型公共组件

## 安全边界

这是纯前端演示项目。Mock API 的权限复核用于展示前端架构和越权防护思路，不能替代真实后端认证、授权和数据库约束。演示密码只存在本地种子数据，不进入登录响应或 Pinia；项目不连接真实后端，也不应存放生产敏感信息。

完整方案见 [`docs/plans/2026-08-11-hrms-frontend-plan.md`](docs/plans/2026-08-11-hrms-frontend-plan.md)。
