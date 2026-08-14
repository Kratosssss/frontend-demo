# AI 学习知识库共享契约

## 版本与边界

- `schemaVersion`: `1`
- Markdown 是页面内容与本地搜索索引的唯一内容源。
- 本版为公开静态知识库，不包含登录、问答、模型 API、CloudBase SDK、云端同步或业务数据库。
- 课程中 `RAG / Agent` 是学习模块名称，不代表产品运行时接入了 RAG 或 Agent。

## 模块与顺序

`ModuleId` 固定为以下六项，顺序不可变：

1. `ai-foundations`
2. `training-inference`
3. `token-embedding`
4. `transformer-prompt`
5. `rag-agent`
6. `evaluation-practice`

每模块正好两篇，`order` 为全局唯一整数 `1..12`。`prerequisites` 只能引用更小 `order` 的现有 slug，禁止自引、未来引用与环。

## 内容类型

```ts
type KnowledgeNote = {
  slug: string;
  title: string;
  module: ModuleId;
  order: number;
  summary: string;
  tags: string[];
  updatedAt: string;
  prerequisites: string[];
  body: string;
  headings: { level: 2 | 3; text: string; anchor: string }[];
  sources: SourceCitation[];
  contentHash: string;
};

type SourceCitation = {
  id: string;
  slug: string;
  title: string;
  module: ModuleId;
  excerpt: string;
  url: string;
  kind: "paper" | "official-doc";
  locator?: string;
};
```

手写 frontmatter 只允许 `slug,title,module,order,summary,tags,updatedAt,prerequisites,sources`。`body`、`headings` 与 `contentHash` 由构建脚本生成。slug 使用小写 kebab-case，并与文件名一致。每篇至少一个来源，来源 ID 全库唯一，URL 必须为 HTTPS。

## 索引与搜索

`ai-learning/generated/knowledge-index.json` 是 gitignored 的确定性构建产物：

```ts
type KnowledgeIndex = {
  schemaVersion: 1;
  generatedAt: string;
  notes: KnowledgeNote[];
};
```

搜索使用规格化后的中文/英文子串匹配，权重为标题 8、摘要 5、标签 4、小标题 3、正文 1。同分按 `order` 升序；空查询返回全量顺序列表；无匹配返回空数组。

## 路由与公开能力

- `#/`：学习地图。
- `#/notes/:slug`：笔记阅读；未知 slug 显示404。
- `#/search`：全文搜索和结果列表。
- 其他路径：404并提供返回地图和搜索入口。

所有路由公开访问，不读取账号、密钥或远端状态。构建产物不得包含 `/ask`、`/login`、聊天存储键或 `VITE_CLOUDBASE_*` 配置引用。
