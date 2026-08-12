# Frontend Portfolio Demos

可独立访问的前端作品：

- `industry-mainpage/`：MATRILINK 虚构工业官网，含中英文体验、产品筛选、详情与资料下载。
- `hrms/`：企业人力资源管理系统，含登录、权限、员工、考勤与请假业务流。
- `freight-quotes/`：海运空运报价系统，含报价目录、完整编辑、FOB/EXW 默认模板、本地保存与邮件表格导出。
- `testcar/`：TestCar 虚构汽车出口官网，含五语切换、车型筛选、详情页与本地模拟询盘。
- `export-car-demo/`：EXPORTCAR 虚构国际车辆出口展示，含五语体验、库存筛选、出口准备信息与本地模拟询盘。
- `adpulse/`：AdPulse 营销投放分析中台，React SPA，含仪表盘、活动管理、详情下钻及本地 Mock 数据流。

CloudBase 是本仓库唯一发布目标。根入口提供作品卡片，也可以直接访问各自的子路径；本地构建只生成待发布产物，不会自动部署。

## 在线访问

- [作品集入口](https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com/)
- [工业官网](https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com/industry-mainpage/)
- [HRMS 人力资源系统](https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com/hrms/)
- [海运空运报价系统](https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com/freight-quotes/)
- [TestCar 汽车出口展示](https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com/testcar/)
- [Export Car Demo](https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com/export-car-demo/)
- [AdPulse 营销投放分析中台](https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com/adpulse/)

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
npm test
npm run build:cloudbase
```

使用 Node.js 22 或更高版本。
