import { createHash } from "node:crypto";
import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";

export const MODULE_IDS = ["ai-foundations", "training-inference", "token-embedding", "transformer-prompt", "rag-agent", "evaluation-practice"];
const CONTENT_TYPES = new Set(["note", "guide", "decision-card", "case-study"]);
const REVIEW_STATUSES = new Set(["current", "review-needed"]);
const V1_NOTE_SLUGS = new Set(["ai-what-is-model", "data-task-capability", "training-optimization", "inference-decoding", "tokens-and-tokenization", "embeddings-and-similarity", "transformer-attention", "prompt-design-boundaries", "rag-pipeline", "agents-and-tools", "evaluation-for-ai", "build-a-small-rag"]);
const FRONTMATTER_FIELDS = new Set(["slug", "title", "contentType", "module", "order", "summary", "tags", "updatedAt", "reviewedAt", "reviewStatus", "prerequisites", "related", "sources", "evidence"]);
const SOURCE_FIELDS = new Set(["id", "slug", "title", "module", "excerpt", "url", "kind", "locator"]);
const EVIDENCE_FIELDS = new Set(["id", "label", "kind", "path", "supports", "alt"]);
const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REQUIRED_HEADINGS = { note: ["示例", "常见误区", "决策清单", "原始来源"], guide: ["适用问题", "关键取舍", "失败与恢复", "决策清单", "原始来源"], "decision-card": ["判断条件", "适用场景", "不适用场景", "选择依据", "原始来源"], "case-study": ["问题与约束", "脱敏决策", "角色协作", "人工验收", "公开证据"] };

export class ContentValidationError extends Error { constructor(message) { super(message); this.name = "ContentValidationError"; } }
const fail = (context, message) => { throw new ContentValidationError(`${context}: ${message}`); };
const string = (value, context) => { if (typeof value !== "string" || value.trim() === "") fail(context, "不能为空"); return value.trim(); };
const parseJson = (value, context) => { try { return JSON.parse(value); } catch { fail(context, "必须使用 JSON 行内值"); } };
const parseValue = (value, context) => value === "null" ? null : /^[\[{\"]/.test(value) ? parseJson(value, context) : value.trim();

function parseFrontmatter(source, file) {
  const matched = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!matched) fail(file, "缺少 YAML frontmatter 分隔符");
  const raw = {};
  for (const [index, line] of matched[1].split(/\r?\n/).entries()) {
    const field = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);
    if (!field) fail(`${file}:${index + 2}`, "frontmatter 每项必须为单行 key: value");
    const [, key, value] = field;
    if (!FRONTMATTER_FIELDS.has(key) || Object.hasOwn(raw, key)) fail(file, `frontmatter 字段 ${key} 无效或重复`);
    raw[key] = value;
  }
  for (const key of FRONTMATTER_FIELDS) if (!Object.hasOwn(raw, key)) fail(file, `缺少 frontmatter 字段 ${key}`);
  return { ...Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, parseValue(value, `${file}:${key}`)])), body: matched[2].trim() };
}

function assertDate(value, context) { const parsed = new Date(`${value}T00:00:00.000Z`); if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) fail(context, "必须是有效 YYYY-MM-DD 日期"); }
function anchorFor(text) { return text.trim().toLowerCase().replace(/[【】`*_~()[\]{}<>]/g, "").replace(/[^\p{L}\p{N}\u4E00-\u9FFF]+/gu, "-").replace(/^-+|-+$/g, ""); }
function parseHeadings(body, file) { const seen = new Set(); return body.split(/\r?\n/).flatMap((line) => { const matched = line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/); if (!matched) return []; const text = matched[2].trim(); const anchor = anchorFor(text); if (!anchor || seen.has(anchor)) fail(file, `标题锚点 ${anchor || text} 无效或重复`); seen.add(anchor); return [{ level: matched[1].length, text, anchor }]; }); }
function canonicalPath(contentType, slug) { return contentType === "note" ? `/notes/${slug}` : contentType === "guide" ? `/guides/${slug}` : contentType === "decision-card" ? `/decisions/${slug}` : `/cases/${slug}`; }

function validateSource(source, item, file, sourceIds) {
  if (!source || typeof source !== "object" || Array.isArray(source)) fail(file, "sources 项必须是对象");
  for (const key of Object.keys(source)) if (!SOURCE_FIELDS.has(key)) fail(file, `来源包含不允许字段 ${key}`);
  for (const key of ["id", "slug", "title", "module", "excerpt", "url", "kind"]) if (!Object.hasOwn(source, key)) fail(file, `来源缺少字段 ${key}`);
  const id = string(source.id, `${file}:source.id`); if (!KEBAB_CASE.test(id) || sourceIds.has(id)) fail(file, `来源 ID ${id} 无效或不唯一`); sourceIds.add(id);
  if (source.slug !== item.slug || source.module !== item.module) fail(file, "来源 slug 或 module 必须等于所属内容");
  if (string(source.excerpt, file).length > 300 || !/^https:\/\//.test(source.url) || !new Set(["paper", "official-doc"]).has(source.kind)) fail(file, "来源摘录、URL 或类型无效");
  return { id, slug: item.slug, title: string(source.title, file), module: item.module, excerpt: source.excerpt.trim(), url: source.url, kind: source.kind, ...(source.locator ? { locator: string(source.locator, file) } : {}) };
}

async function validateEvidence(evidence, item, file, publicDirectory) {
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) fail(file, "evidence 项必须是对象");
  for (const key of Object.keys(evidence)) if (!EVIDENCE_FIELDS.has(key)) fail(file, `证据包含不允许字段 ${key}`);
  for (const key of ["id", "label", "kind", "path", "supports"]) if (!Object.hasOwn(evidence, key)) fail(file, `证据缺少字段 ${key}`);
  const id = string(evidence.id, file); if (!KEBAB_CASE.test(id)) fail(file, "证据 ID 必须为 kebab-case");
  if (!new Set(["screenshot", "document", "repository-artifact"]).has(evidence.kind) || !/^\/[^/]/.test(evidence.path) || evidence.path.includes("..") || /^(file:|data:|https?:)/.test(evidence.path)) fail(file, "证据类型或路径不安全");
  if (evidence.kind === "screenshot" && !string(evidence.alt, file)) fail(file, "截图证据必须提供 alt");
  if (!item.body.includes(evidence.path)) fail(file, `公开证据章节必须引用 ${evidence.path}`);
  try { await access(resolve(publicDirectory, `.${evidence.path}`)); } catch { fail(file, `公开证据文件不存在 ${evidence.path}`); }
  return { id, label: string(evidence.label, file), kind: evidence.kind, path: evidence.path, supports: string(evidence.supports, file), ...(evidence.alt ? { alt: string(evidence.alt, file) } : {}) };
}

async function validateItem(item, source, file, sourceIds, publicDirectory) {
  if (!KEBAB_CASE.test(item.slug) || basename(file, extname(file)) !== item.slug) fail(file, "slug 必须为 kebab-case 且与文件名一致");
  if (!CONTENT_TYPES.has(item.contentType) || !MODULE_IDS.includes(item.module) || !Number.isInteger(Number(item.order)) || Number(item.order) < 1 || Number(item.order) > 27) fail(file, "类型、模块或 order 无效");
  string(item.title, file); string(item.summary, file); assertDate(item.updatedAt, file);
  for (const field of ["tags", "prerequisites", "related", "sources", "evidence"]) if (!Array.isArray(item[field])) fail(file, `${field} 必须是数组`);
  if (!item.tags.length || !item.related.length || new Set(item.tags).size !== item.tags.length || new Set(item.related).size !== item.related.length || item.related.includes(item.slug)) fail(file, "标签或关联内容无效");
  for (const slug of [...item.prerequisites, ...item.related]) if (!KEBAB_CASE.test(slug)) fail(file, "关联 slug 无效");
  if (item.contentType === "note" ? !V1_NOTE_SLUGS.has(item.slug) : V1_NOTE_SLUGS.has(item.slug)) fail(file, "笔记 slug 兼容规则不满足");
  const isDecision = item.contentType === "decision-card";
  if (isDecision ? (!item.reviewedAt || !REVIEW_STATUSES.has(item.reviewStatus)) : item.reviewedAt !== null || item.reviewStatus !== null) fail(file, "复核字段与内容类型不匹配");
  if (isDecision) assertDate(item.reviewedAt, file);
  const headings = parseHeadings(item.body, file); for (const required of REQUIRED_HEADINGS[item.contentType]) if (!headings.some((heading) => heading.text === required)) fail(file, `缺少“${required}”章节`);
  const sources = item.sources.map((source) => validateSource(source, item, file, sourceIds));
  if (!sources.length || sources.some((source) => !item.body.slice(item.body.indexOf("## 原始来源")).includes(source.url))) fail(file, "来源必须在原始来源章节列出");
  if (item.contentType === "case-study" && !item.evidence.length) fail(file, "旗舰案例至少需要一个公开证据");
  const evidenceIds = new Set(); const evidence = [];
  for (const entry of item.evidence) { const value = await validateEvidence(entry, item, file, publicDirectory); if (evidenceIds.has(value.id)) fail(file, "案例证据 ID 不唯一"); evidenceIds.add(value.id); evidence.push(value); }
  return { ...item, order: Number(item.order), tags: item.tags.map((tag) => string(tag, file)), prerequisites: item.prerequisites, related: item.related, sources, evidence, headings, contentHash: createHash("sha256").update(source).digest("hex"), canonicalPath: canonicalPath(item.contentType, item.slug) };
}

async function listMarkdownFiles(directory) { const entries = await readdir(directory, { withFileTypes: true }); return (await Promise.all(entries.map((entry) => { const path = join(directory, entry.name); return entry.isDirectory() ? listMarkdownFiles(path) : entry.isFile() && extname(entry.name) === ".md" ? [path] : []; }))).flat().sort(); }
function validateLibrary(items) {
  const counts = { total: items.length, note: 0, guide: 0, decisionCard: 0, caseStudy: 0 }; const slugs = new Set(); const orders = new Set();
  for (const item of items) { if (slugs.has(item.slug) || orders.has(item.order)) fail("index", "slug 或 order 不唯一"); slugs.add(item.slug); orders.add(item.order); if (item.contentType === "note") counts.note += 1; else if (item.contentType === "guide") counts.guide += 1; else if (item.contentType === "decision-card") counts.decisionCard += 1; else counts.caseStudy += 1; }
  if (counts.total !== 27 || counts.note !== 12 || counts.guide !== 10 || counts.decisionCard !== 4 || counts.caseStudy !== 1) fail("index", "必须恰好包含 12 笔记、10 指南、4 决策卡和 1 案例");
  for (let order = 1; order <= 27; order += 1) if (!orders.has(order)) fail("index", `缺少 order ${order}`);
  const bySlug = new Map(items.map((item) => [item.slug, item]));
  for (const item of items) for (const slug of [...item.prerequisites, ...item.related]) if (!bySlug.has(slug)) fail("index", `${item.slug} 指向不存在内容 ${slug}`);
  const visiting = new Set(); const visited = new Set(); const visit = (slug) => { if (visiting.has(slug)) fail("index", "prerequisites 存在循环"); if (visited.has(slug)) return; visiting.add(slug); for (const target of bySlug.get(slug).prerequisites) visit(target); visiting.delete(slug); visited.add(slug); }; for (const slug of bySlug.keys()) visit(slug);
  return { total: 27, note: 12, guide: 10, decisionCard: 4, caseStudy: 1 };
}

export async function buildKnowledgeIndex(contentDirectory, { generatedAt, publicDirectory = resolve(contentDirectory, "..", "public") } = {}) { const sourceIds = new Set(); const items = []; for (const file of await listMarkdownFiles(contentDirectory)) { const source = await readFile(file, "utf8"); items.push(await validateItem(parseFrontmatter(source, file), source, file, sourceIds, publicDirectory)); } items.sort((a, b) => a.order - b.order); const counts = validateLibrary(items); const stableGeneratedAt = generatedAt ?? `${items.map((item) => item.updatedAt).sort().at(-1)}T00:00:00.000Z`; if (Number.isNaN(Date.parse(stableGeneratedAt))) fail("index", "generatedAt 无效"); return { schemaVersion: 2, generatedAt: stableGeneratedAt, items, counts }; }
export async function writeKnowledgeIndex(index, outputPath) { await mkdir(dirname(outputPath), { recursive: true }); await writeFile(outputPath, `${JSON.stringify(index, null, 2)}\n`, "utf8"); }
export function searchKnowledge(index, query) { const normalized = (query ?? "").normalize("NFC").toLocaleLowerCase("zh-CN").replace(/\s+/g, " ").trim(); if (!normalized) return index.items.map((item) => ({ item, score: 0, matchedFields: [] })); const fields = [["title", 8, (item) => item.title], ["summary", 5, (item) => item.summary], ["tags", 4, (item) => item.tags.join(" ")], ["headings", 3, (item) => item.headings.map((heading) => heading.text).join(" ")], ["body", 1, (item) => item.body]]; return index.items.map((item) => { const matchedFields = []; let score = 0; for (const [name, weight, getValue] of fields) if (getValue(item).normalize("NFC").toLocaleLowerCase("zh-CN").includes(normalized)) { matchedFields.push(name); score += weight; } return { item, score, matchedFields }; }).filter((result) => result.score).sort((a, b) => b.score - a.score || a.item.order - b.item.order); }
