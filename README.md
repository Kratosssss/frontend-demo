# Frontend Portfolio Demos

两个可独立访问的前端作品：

- `industry-mainpage/`：MATRILINK 虚构工业官网，含中英文体验、产品筛选、详情与资料下载。
- `hrms/`：企业人力资源管理系统，含登录、权限、员工、考勤与请假业务流。

国内发布后，根入口提供两个项目卡片；也可以直接访问各自的子路径。

## 在线访问

- [作品集入口](https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com/)
- [工业官网](https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com/industry-mainpage/)
- [HRMS 人力资源系统](https://timoworkplace-d3gygu8b95232dc0a-1255934205.tcloudbaseapp.com/hrms/)

## 本地验证

```bash
npm --prefix industry-mainpage ci
npm --prefix industry-mainpage test
npm --prefix hrms ci
npm --prefix hrms test
```

使用 Node.js 22 或更高版本。
