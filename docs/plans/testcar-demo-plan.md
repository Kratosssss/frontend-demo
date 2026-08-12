# TestCar 汽车出口 Demo 实施计划

## 目标

在 `/testcar/` 提供一套面向 Upwork 汽车出口官网项目的高保真样片：首页、统一车型详情页、五语本地文案切换、筛选和本地询盘反馈。Demo 不连接数据库、不发送信息，也不包含外部联系方式。

## 选型与范围

- Next.js 16、React 19、TypeScript、Tailwind CSS 4 与 Lucide 图标；静态导出并挂载到 `/testcar/`。
- 英、阿、法、俄、西五语通过浏览器状态切换；语言偏好保存在本地，阿拉伯语切换 `dir="rtl"`。
- 仅生成 `/testcar/` 与 `/testcar/car/?model=车型ID` 两个静态页面；六辆虚构车共用详情模板。
- 使用本地 WebP 图库素材与原创 TestCar 品牌，不复用 YUTAI 品牌、图片、联系方式或文案。
- 搜索引擎可收录默认英语页面；提供 canonical、Open Graph、robots、sitemap 与基础结构化数据，不实现独立多语言 SEO URL。

## 执行与验收

- 根项目接入构建、测试、CloudBase 产物装配、作品集入口和 README。
- 在 `3017` 启动本地预览，由用户人工验收后才允许发布；本轮不部署 CloudBase。
- 运行类型检查、lint、构建、渲染测试、根项目测试及浏览器验证五语、RTL、筛选、详情参数、表单和移动端。
- 执行环境：`codex/testcar-demo` 分支，`gpt-5.6-terra + Medium`；无子 agent，主 agent 自动验证后停下等待用户验收。
