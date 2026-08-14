# P007 AI 学习知识库实施计划

## 目标

在现有 P007 前端作品集中新增独立的 `/ai-learning/` 静态子应用，公开提供六阶段 AI 学习地图、12 篇原创中文入门笔记和中文全文搜索，并完成设计、实现、独立 QA、根仓库集成与 Git 收尾。禁止从任务 worktree 发布生产。

## 2026-08-15 范围调整

用户确认本版只交付知识库，不接知识库问答。以下内容全部延期，不作为本次交付或验收项：登录、注册、对话历史、DeepSeek 或其他模型 API、CloudBase AI+、配置型 Agent、RAG 运行时、知识库云端同步、模型价格与额度预检。课程中讲解 RAG/Agent 的笔记属于学习内容，继续保留。

## 本版范围

- React 19 + Vite + TypeScript + HashRouter 独立子应用。
- 浅色工业研究实验室视觉，IBM Plex Sans/Mono 本地字体，Lucide 图标。
- 六阶段学习地图：AI 基础；训练/推理；Token/Embedding；Transformer/Prompt；RAG/Agent；评估/实践。
- 12 篇原创 Markdown 笔记，每篇至少包含一个原始论文或官方来源。
- 中文全文搜索，按标题、摘要、标签、小标题和正文加权匹配。
- 桌面三栏阅读布局与 390px 移动端折叠布局。
- 内容校验和确定性 JSON 索引生成。
- 作品集入口、根构建和 CloudBase 静态汇总产物接入；只构建，不从 worktree 发布。

## 非目标

- 不做知识库问答、聊天、登录、账号或权限。
- 不接 DeepSeek、CloudBase AI+ 或其他模型服务。
- 不做云端知识库同步、业务数据库、学习进度、测验、多人协作或在线编辑。
- 不在任务 worktree 中发布、部署或修改生产数据。

## 执行环境与门禁

- worktree：`/Users/yaotao/.codex/worktrees/4aa0/P007-job-interview-demo`。
- 起点：本地 `main` 的 `c81584ef9dcd687d3cffeda4553f047f09971a24`。
- 分支：`codex/ai-learning-kb`。
- 未带入源工作区未跟踪的 `.local/`、`retail-mall/` 或旧计划。
- Design、Frontend、Backend、QA 按 P007 原生编队执行；设计稿已于 2026-08-15 获用户批准。
- 正式发布必须等用户选择合并后，从干净 `main` 重新构建并发布。

## 内容与共享契约

- `KnowledgeNote`：`slug,title,module,order,summary,tags,updatedAt,prerequisites,body,headings,sources,contentHash`。
- `SourceCitation`：`id,slug,title,module,excerpt,url,kind,locator`。
- Markdown 是页面内容和本地搜索索引的唯一内容源。
- `predev`、`prebuild`、`pretest` 校验 frontmatter、唯一 slug、模块顺序、前置引用和来源，并生成 gitignored JSON 索引。
- 搜索字段权重固定为标题 8、摘要 5、标签 4、小标题 3、正文 1；同分按学习顺序排列。

## 实现步骤

1. 固化已批准的浅色实施级设计规格和共享内容契约。
2. 完成12篇 Markdown、内容校验与索引生成。
3. 实现学习地图、笔记阅读、搜索、404、键盘和移动端体验。
4. 清除延期范围的问答、登录、CloudBase SDK、同步脚本与相关配置。
5. 接入根入口、根构建、静态集成测试和 README。
6. Frontend/Backend 自测后，由 QA 独立只读验证；缺陷回原 owner，最多两轮返修。
7. 总指挥检查完整 diff、运行全套验证并创建中文 commit，不自动 push、合并、部署或删除 worktree。

## 验收

- 12 篇笔记、六阶段各两篇，frontmatter、slug、顺序、前置引用、来源和索引均通过校验。
- 地图、笔记、搜索和404路由可直接访问、刷新恢复且无问答/登录入口。
- 中文搜索覆盖标题、摘要、标签、小标题、正文和无结果。
- 桌面与390px移动端完成浏览器验收，支持键盘、可访问性与 reduced motion。
- 子应用通过 typecheck、lint、test、build。
- 根仓库通过 `npm test`、`npm run lint`、`npm run build:cloudbase`。
- CloudBase 汇总仅验证静态构建产物；不执行生产发布。

## Git 与发布边界

固定顺序为：worktree 修改/验证/提交 → 用户选择合并 → 干净 `main` 重建 → 从 `main` 发布 → 线上验收。本任务结束只交回 merge / PR / keep / discard 选项，不自动执行后续动作。
