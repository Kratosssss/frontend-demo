# MATRILINK Industrial Website Demo

虚构工业连接品牌“矩联电气 MATRILINK”的前端候选人演示项目。项目以工业编辑设计语言呈现首页、产品目录与产品详情，并演示中英文切换、产品筛选、快速详情、资料下载、表单校验和移动端适配。

## 本地运行

需要 Node.js 22.13 或更高版本。

```bash
npm ci
npm run dev
```

访问 `http://localhost:3000`。

## 验证

```bash
npm test
npm run lint
```

`npm test` 会先完成生产构建，再检查三个公开路由和关键交互边界。

## 说明

- 所有品牌、型号、参数与新闻均为虚构演示内容。
- 联系表单不会发起外部请求。
- 下载文件带有 DEMO 标识，不可用于生产。
- 站点设置为 `noindex`，以避免概念品牌进入搜索结果。
