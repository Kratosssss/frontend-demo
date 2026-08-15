# Frontend Portfolio Demos

可独立访问的前端作品：

- `industry-mainpage/`：MATRILINK 虚构工业官网，含中英文体验、产品筛选、详情与资料下载。
- `hrms/`：企业人力资源管理系统，含登录、权限、员工、考勤与请假业务流。
- `freight-quotes/`：海运空运报价系统，含报价目录、完整编辑、FOB/EXW 默认模板、本地保存与邮件表格导出。
- `testcar/`：TestCar 虚构汽车出口官网，含五语切换、车型筛选、详情页与本地模拟询盘。
- `export-car-demo/`：EXPORTCAR 虚构国际车辆出口展示，含五语体验、库存筛选、出口准备信息与本地模拟询盘。
- `adpulse/`：AdPulse 营销投放分析中台，React SPA，含仪表盘、活动管理、详情下钻及本地 Mock 数据流。
- `motion-demo/`：Motion Signal Lab 网页动效作品，展示入场编排、滚动叙事、指针响应、模式切换、暂停与减少动态效果支持。
- `retail-mall/`：MORU 消费数码独立站 Demo，覆盖发现、比较、购物袋、模拟支付、订单与售后完整交易生命周期。
- `ai-learning/`：AI 工程知识库，含 27 项中文 Markdown 内容、动态决策卡、可选学习路线、中文全文搜索与 P007 七角色旗舰案例。

CloudBase 是本仓库唯一发布目标。根入口提供作品卡片，也可以直接访问各自的子路径；本地构建只生成待发布产物，不会自动部署。

## 在线访问

- [作品集入口](https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com/)
- [工业官网](https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com/industry-mainpage/)
- [HRMS 人力资源系统](https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com/hrms/)
- [海运空运报价系统](https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com/freight-quotes/)
- [TestCar 汽车出口展示](https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com/testcar/)
- [Export Car Demo](https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com/export-car-demo/)
- [AdPulse 营销投放分析中台](https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com/adpulse/)
- [MORU 数码独立站](https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com/qiwu-mall/)

`/ai-learning/` 仅在本地任务分支完成并合并到干净 `main` 后才能正式发布；当前不提供尚未发布的线上链接。本版是纯静态知识库，不接登录、在线问答、模型 API 或业务数据库。

## 本地验证

```bash
npm --prefix industry-mainpage ci
npm --prefix industry-mainpage test
npm --prefix hrms ci
npm --prefix hrms test
npm --prefix testcar ci
npm --prefix testcar test
npm --prefix export-car-demo ci
npm --prefix export-car-demo test
npm --prefix adpulse ci
npm --prefix adpulse test
npm --prefix retail-mall ci
npm --prefix retail-mall test
npm --prefix retail-mall run typecheck
npm --prefix retail-mall run build:h5
npm --prefix retail-mall run build:mp-weixin
npm --prefix retail-mall run build:mp-alipay
npm --prefix ai-learning test
npm test
npm run build:release
npm run build:cloudbase
```

使用 Node.js 22 或更高版本。

正式发布默认使用增量流程：`npm run build:release` 会以上次成功汇总时记录在 `.local/cloudbase-build-state.json` 的提交为 Git 基线，只安装和构建发生变化或缺少产物的子项目，然后完整汇总 `cloudbase-dist`。首次运行或新 worktree 没有本地状态时回退到 `HEAD^`；发布包含多个提交且本地状态不可用时，应显式传入上次已发布提交：

```bash
CLOUDBASE_BUILD_BASE=<last-deployed-commit> npm run build:release
# 或
npm run build:changed -- --base <last-deployed-commit>
npm run assemble:cloudbase
```

根 `package.json` 或增量构建脚本发生变化、基线无效、或使用 `--force` 时会安全回退到全量子项目构建。`npm run build:cloudbase` 始终保留为全量兜底。

只预览动效作品时，无需构建子项目：

```bash
python3 -m http.server 4176
# 打开 http://127.0.0.1:4176/motion-demo/
```

AI 学习知识库直接从仓库内 Markdown 生成静态页面与搜索索引，不需要账号、密钥或云端数据同步。
