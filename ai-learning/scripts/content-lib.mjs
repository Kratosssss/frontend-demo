import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join } from "node:path";

export const MODULE_IDS = [
  "ai-foundations",
  "training-inference",
  "token-embedding",
  "transformer-prompt",
  "rag-agent",
  "evaluation-practice",
];

const FRONTMATTER_FIELDS = new Set([
  "slug",
  "title",
  "module",
  "order",
  "summary",
  "tags",
  "updatedAt",
  "prerequisites",
  "sources",
]);
const SOURCE_FIELDS = new Set(["id", "slug", "title", "module", "excerpt", "url", "kind", "locator"]);
const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class ContentValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ContentValidationError";
  }
}

function fail(context, message) {
  throw new ContentValidationError(`${context}: ${message}`);
}

function parseString(value, context) {
  if (value.startsWith('"')) {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== "string") fail(context, "必须是字符串");
      return parsed;
    } catch (error) {
      if (error instanceof ContentValidationError) throw error;
      fail(context, "字符串 JSON 格式无效");
    }
  }
  return value.trim();
}

function parseJson(value, context) {
  try {
    return JSON.parse(value);
  } catch {
    fail(context, "必须使用 JSON 行内数组格式");
  }
}

function assertNonEmptyString(value, context) {
  if (typeof value !== "string" || value.trim() === "") fail(context, "不能为空");
  return value.trim();
}

function parseFrontmatter(source, file) {
  const matched = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!matched) fail(file, "缺少 YAML frontmatter 分隔符");

  const raw = {};
  for (const [lineNumber, line] of matched[1].split(/\r?\n/).entries()) {
    if (line.trim() === "") continue;
    const field = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);
    if (!field) fail(`${file}:${lineNumber + 2}`, "frontmatter 每项必须为单行 key: value");
    const [, key, value] = field;
    if (!FRONTMATTER_FIELDS.has(key)) fail(file, `不允许的 frontmatter 字段 ${key}`);
    if (Object.hasOwn(raw, key)) fail(file, `frontmatter 字段 ${key} 重复`);
    raw[key] = value;
  }

  for (const key of FRONTMATTER_FIELDS) {
    if (!Object.hasOwn(raw, key)) fail(file, `缺少 frontmatter 字段 ${key}`);
  }

  const note = {
    slug: parseString(raw.slug, `${file}:slug`),
    title: parseString(raw.title, `${file}:title`),
    module: parseString(raw.module, `${file}:module`),
    order: Number(raw.order),
    summary: parseString(raw.summary, `${file}:summary`),
    tags: parseJson(raw.tags, `${file}:tags`),
    updatedAt: parseString(raw.updatedAt, `${file}:updatedAt`),
    prerequisites: parseJson(raw.prerequisites, `${file}:prerequisites`),
    sources: parseJson(raw.sources, `${file}:sources`),
    body: matched[2].trim(),
  };
  return note;
}

function anchorFor(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[【】`*_~()[\]{}<>]/g, "")
    .replace(/[^\p{L}\p{N}\u4E00-\u9FFF]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function parseHeadings(body, file) {
  const headings = [];
  const anchors = new Set();
  for (const line of body.split(/\r?\n/)) {
    const matched = line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (!matched) continue;
    const level = matched[1].length;
    const text = matched[2].trim();
    const anchor = anchorFor(text);
    if (!anchor) fail(file, `标题“${text}”无法生成锚点`);
    if (anchors.has(anchor)) fail(file, `标题锚点 ${anchor} 重复`);
    anchors.add(anchor);
    headings.push({ level, text, anchor });
  }
  return headings;
}

function assertDate(value, context) {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
    fail(context, "必须是有效 YYYY-MM-DD 日期");
  }
}

function validateSource(source, note, file, sourceIds) {
  if (!source || typeof source !== "object" || Array.isArray(source)) fail(file, "sources 项必须是对象");
  for (const key of Object.keys(source)) {
    if (!SOURCE_FIELDS.has(key)) fail(file, `来源 ${source.id ?? "(未知)"} 包含不允许字段 ${key}`);
  }
  for (const key of ["id", "slug", "title", "module", "excerpt", "url", "kind"]) {
    if (!Object.hasOwn(source, key)) fail(file, `来源缺少字段 ${key}`);
  }
  const id = assertNonEmptyString(source.id, `${file}:source.id`);
  if (!KEBAB_CASE.test(id)) fail(file, `来源 id ${id} 不是 kebab-case`);
  if (sourceIds.has(id)) fail(file, `来源 id ${id} 不在全库唯一`);
  sourceIds.add(id);
  if (source.slug !== note.slug) fail(file, `来源 ${id} 的 slug 必须等于笔记 slug`);
  if (source.module !== note.module) fail(file, `来源 ${id} 的 module 必须等于笔记 module`);
  assertNonEmptyString(source.title, `${file}:source.title`);
  assertNonEmptyString(source.excerpt, `${file}:source.excerpt`);
  if (source.excerpt.length > 300) fail(file, `来源 ${id} 的 excerpt 不得超过 300 字符`);
  if (typeof source.url !== "string" || !/^https:\/\//.test(source.url)) fail(file, `来源 ${id} 必须使用 HTTPS URL`);
  if (!new Set(["paper", "official-doc"]).has(source.kind)) fail(file, `来源 ${id} 的 kind 无效`);
  if (Object.hasOwn(source, "locator") && typeof source.locator !== "string") fail(file, `来源 ${id} 的 locator 必须是字符串`);
  return {
    id,
    slug: source.slug,
    title: source.title.trim(),
    module: source.module,
    excerpt: source.excerpt.trim(),
    url: source.url,
    kind: source.kind,
    ...(source.locator ? { locator: source.locator.trim() } : {}),
  };
}

function validateNote(note, source, file, sourceIds) {
  if (!KEBAB_CASE.test(note.slug)) fail(file, "slug 必须为小写 kebab-case");
  if (basename(file, extname(file)) !== note.slug) fail(file, "文件名必须与 slug 完全一致");
  assertNonEmptyString(note.title, `${file}:title`);
  if (!MODULE_IDS.includes(note.module)) fail(file, `module ${note.module} 不在共享契约范围内`);
  if (!Number.isInteger(note.order) || note.order < 1 || note.order > 12) fail(file, "order 必须是 1..12 的整数");
  assertNonEmptyString(note.summary, `${file}:summary`);
  if (!Array.isArray(note.tags) || note.tags.length === 0) fail(file, "tags 必须是非空数组");
  if (new Set(note.tags).size !== note.tags.length) fail(file, "tags 不得重复");
  for (const tag of note.tags) assertNonEmptyString(tag, `${file}:tags`);
  assertDate(note.updatedAt, `${file}:updatedAt`);
  if (!Array.isArray(note.prerequisites)) fail(file, "prerequisites 必须是数组");
  if (new Set(note.prerequisites).size !== note.prerequisites.length) fail(file, "prerequisites 不得重复");
  for (const prerequisite of note.prerequisites) {
    if (typeof prerequisite !== "string" || !KEBAB_CASE.test(prerequisite)) fail(file, "prerequisites 必须为 slug 数组");
  }
  if (!Array.isArray(note.sources) || note.sources.length === 0) fail(file, "每篇笔记至少需要一个来源");
  if (!note.body) fail(file, "正文不能为空");
  const sourceHeading = /^##\s+原始来源\s*$/m.exec(note.body);
  if (!sourceHeading) fail(file, "正文必须包含“## 原始来源”章节");
  const sources = note.sources.map((item) => validateSource(item, note, file, sourceIds));
  for (const citation of sources) {
    const urlIndex = note.body.indexOf(citation.url);
    if (urlIndex < sourceHeading.index) fail(file, `来源 ${citation.id} 必须在“原始来源”章节中列出 URL`);
  }
  return {
    slug: note.slug,
    title: note.title,
    module: note.module,
    order: note.order,
    summary: note.summary,
    tags: note.tags,
    updatedAt: note.updatedAt,
    prerequisites: note.prerequisites,
    body: note.body,
    headings: parseHeadings(note.body, file),
    sources,
    contentHash: createHash("sha256").update(source).digest("hex"),
  };
}

async function listMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const children = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listMarkdownFiles(path);
    return entry.isFile() && extname(entry.name) === ".md" ? [path] : [];
  }));
  return children.flat().sort();
}

function validateLibraryInvariants(notes) {
  if (notes.length !== 12) throw new ContentValidationError(`知识库必须正好包含 12 篇笔记，当前为 ${notes.length} 篇`);
  const slugs = new Map();
  const orders = new Map();
  const moduleCounts = new Map(MODULE_IDS.map((module) => [module, 0]));
  for (const note of notes) {
    if (slugs.has(note.slug)) throw new ContentValidationError(`slug ${note.slug} 不唯一`);
    if (orders.has(note.order)) throw new ContentValidationError(`order ${note.order} 不唯一`);
    slugs.set(note.slug, note);
    orders.set(note.order, note);
    moduleCounts.set(note.module, moduleCounts.get(note.module) + 1);
  }
  for (let order = 1; order <= 12; order += 1) {
    if (!orders.has(order)) throw new ContentValidationError(`缺少全局 order ${order}`);
    const expectedModule = MODULE_IDS[Math.floor((order - 1) / 2)];
    if (orders.get(order).module !== expectedModule) {
      throw new ContentValidationError(`order ${order} 必须属于模块 ${expectedModule}`);
    }
  }
  for (const [module, count] of moduleCounts) {
    if (count !== 2) throw new ContentValidationError(`模块 ${module} 必须正好两篇，当前为 ${count} 篇`);
  }
  for (const note of notes) {
    for (const prerequisite of note.prerequisites) {
      const target = slugs.get(prerequisite);
      if (!target) throw new ContentValidationError(`笔记 ${note.slug} 引用了不存在的前置知识 ${prerequisite}`);
      if (target.order >= note.order) throw new ContentValidationError(`笔记 ${note.slug} 的前置知识 ${prerequisite} 必须有更小 order`);
    }
  }
}

export async function buildKnowledgeIndex(contentDirectory, { generatedAt } = {}) {
  const files = await listMarkdownFiles(contentDirectory);
  const sourceIds = new Set();
  const notes = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    notes.push(validateNote(parseFrontmatter(source, file), source, file, sourceIds));
  }
  notes.sort((left, right) => left.order - right.order);
  validateLibraryInvariants(notes);
  const stableGeneratedAt = generatedAt ?? `${notes.map((note) => note.updatedAt).sort().at(-1)}T00:00:00.000Z`;
  if (Number.isNaN(Date.parse(stableGeneratedAt))) throw new ContentValidationError("generatedAt 必须是有效 ISO 时间");
  return { schemaVersion: 1, generatedAt: stableGeneratedAt, notes };
}

export async function writeKnowledgeIndex(index, outputPath) {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
}

function countOccurrences(haystack, needle) {
  if (!needle) return 0;
  let count = 0;
  let position = haystack.indexOf(needle);
  while (position !== -1) {
    count += 1;
    position = haystack.indexOf(needle, position + needle.length);
  }
  return count;
}

function normalizeSearchText(value) {
  return value.normalize("NFC").toLocaleLowerCase("zh-CN").replace(/\s+/g, " ").trim();
}

export function searchKnowledge(index, query) {
  const normalizedQuery = normalizeSearchText(query ?? "");
  if (!normalizedQuery) return index.notes.map((note) => ({ note, score: 0, matchedFields: [] }));
  const fields = [
    ["title", 8, (note) => note.title],
    ["summary", 5, (note) => note.summary],
    ["tags", 4, (note) => note.tags.join(" ")],
    ["headings", 3, (note) => note.headings.map((heading) => heading.text).join(" ")],
    ["body", 1, (note) => note.body],
  ];
  return index.notes
    .map((note) => {
      const matchedFields = [];
      let score = 0;
      for (const [name, weight, getValue] of fields) {
        const matches = countOccurrences(normalizeSearchText(getValue(note)), normalizedQuery);
        if (matches > 0) {
          matchedFields.push(name);
          score += weight * matches;
        }
      }
      return { note, score, matchedFields };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.note.order - right.note.order);
}
