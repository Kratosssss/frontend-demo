import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import test from "node:test";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildKnowledgeIndex, searchKnowledge, writeKnowledgeIndex } from "../../scripts/content-lib.mjs";

const directory = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(directory, "..", "..");
const content = resolve(appRoot, "content");
const publicDirectory = resolve(appRoot, "public");

async function copiedLibrary() {
  const root = await mkdtemp(resolve(tmpdir(), "p007-v2-content-"));
  await cp(content, resolve(root, "content"), { recursive: true });
  await cp(publicDirectory, resolve(root, "public"), { recursive: true });
  return { root, content: resolve(root, "content"), public: resolve(root, "public") };
}

test("27 项 Markdown 严格符合 V2 内容盘点、稳定 slug 与公开证据约束，并可确定性写入", async () => {
  const first = await buildKnowledgeIndex(content, { generatedAt: "2026-08-15T08:00:00.000Z", publicDirectory });
  const second = await buildKnowledgeIndex(content, { generatedAt: "2026-08-15T08:00:00.000Z", publicDirectory });
  assert.equal(first.schemaVersion, 2);
  assert.deepEqual(first.counts, { total: 27, note: 12, guide: 10, decisionCard: 4, caseStudy: 1 });
  assert.deepEqual(first.items.map((item) => item.order), Array.from({ length: 27 }, (_, index) => index + 1));
  assert.equal(first.items.find((item) => item.slug === "ai-what-is-model").canonicalPath, "/notes/ai-what-is-model");
  assert(first.items.find((item) => item.contentType === "case-study").evidence.length > 0);
  assert.deepEqual(first, second);
  const root = await mkdtemp(resolve(tmpdir(), "p007-v2-index-"));
  const output = resolve(root, "knowledge-index.json");
  await writeKnowledgeIndex(first, output);
  assert.deepEqual(JSON.parse(await readFile(output, "utf8")), first);
  await rm(root, { recursive: true, force: true });
});

test("搜索保留标题、摘要、标签、小标题、正文的契约权重", async () => {
  const index = await buildKnowledgeIndex(content, { publicDirectory });
  const base = index.items[0];
  const items = [
    { ...base, order: 1, title: "检索词标题", summary: "", tags: ["普通"], headings: [], body: "" },
    { ...base, order: 2, title: "普通", summary: "检索词摘要", tags: ["普通"], headings: [], body: "" },
    { ...base, order: 3, title: "普通", summary: "", tags: ["检索词标签"], headings: [], body: "" },
    { ...base, order: 4, title: "普通", summary: "", tags: ["普通"], headings: [{ level: 2, text: "检索词小标题", anchor: "x" }], body: "" },
    { ...base, order: 5, title: "普通", summary: "", tags: ["普通"], headings: [], body: "检索词正文" },
  ];
  const result = searchKnowledge({ ...index, items }, "检索词");
  assert.deepEqual(result.map((entry) => entry.item.order), [1, 2, 3, 4, 5]);
  assert.deepEqual(result.map((entry) => entry.score), [8, 5, 4, 3, 1]);
  assert.deepEqual(searchKnowledge(index, "").map((entry) => entry.item.order), Array.from({ length: 27 }, (_, index) => index + 1));
  assert.equal(searchKnowledge(index, "不存在的检索词").length, 0);
});

test("拒绝未声明或重复 frontmatter 字段、未映射来源、错误数量、断链和前置环", async () => {
  const fixture = await copiedLibrary();
  const note = resolve(fixture.content, "ai-foundations", "ai-what-is-model.md");
  const original = await readFile(note, "utf8");
  await writeFile(note, original.replace("slug: ai-what-is-model", "unknown: forbidden\nslug: ai-what-is-model"));
  await assert.rejects(() => buildKnowledgeIndex(fixture.content, { publicDirectory: fixture.public }), /frontmatter 字段 unknown/);
  await writeFile(note, original.replace("title: 什么是 AI 模型：任务、数据与函数近似", "title: 重复\ntitle: 什么是 AI 模型：任务、数据与函数近似"));
  await assert.rejects(() => buildKnowledgeIndex(fixture.content, { publicDirectory: fixture.public }), /title 无效或重复/);
  const sourceUrl = "https://doi.org/10.1093/mind/LIX.236.433";
  const last = original.lastIndexOf(sourceUrl);
  await writeFile(note, `${original.slice(0, last)}https://example.invalid/not-listed${original.slice(last + sourceUrl.length)}`);
  await assert.rejects(() => buildKnowledgeIndex(fixture.content, { publicDirectory: fixture.public }), /来源必须在原始来源章节列出/);
  await writeFile(note, original.replace('related: ["data-task-capability"]', 'related: ["missing-target"]'));
  await assert.rejects(() => buildKnowledgeIndex(fixture.content, { publicDirectory: fixture.public }), /指向不存在内容/);
  const second = resolve(fixture.content, "ai-foundations", "data-task-capability.md");
  await writeFile(note, original.replace("prerequisites: []", 'prerequisites: ["data-task-capability"]'));
  const secondOriginal = await readFile(second, "utf8");
  await writeFile(second, secondOriginal.replace('prerequisites: ["ai-what-is-model"]', 'prerequisites: ["ai-what-is-model"]'));
  await assert.rejects(() => buildKnowledgeIndex(fixture.content, { publicDirectory: fixture.public }), /prerequisites 存在循环/);
  await writeFile(note, original);
  await rm(resolve(fixture.content, "transformer-prompt", "structured-output-tools.md"));
  await assert.rejects(() => buildKnowledgeIndex(fixture.content, { publicDirectory: fixture.public }), /必须恰好包含/);
  await rm(fixture.root, { recursive: true, force: true });
});

test("拒绝危险或缺失的案例公开证据路径", async () => {
  const fixture = await copiedLibrary();
  const caseFile = resolve(fixture.content, "evaluation-practice", "p007-seven-role-case.md");
  const original = await readFile(caseFile, "utf8");
  await writeFile(caseFile, original.replace("/evidence/p007-role-map.svg", "../secret.svg"));
  await assert.rejects(() => buildKnowledgeIndex(fixture.content, { publicDirectory: fixture.public }), /证据类型或路径不安全/);
  await writeFile(caseFile, original.replaceAll("/evidence/p007-role-map.svg", "/evidence/missing.svg"));
  await assert.rejects(() => buildKnowledgeIndex(fixture.content, { publicDirectory: fixture.public }), /公开证据文件不存在/);
  await rm(fixture.root, { recursive: true, force: true });
});

test("已发布内容不包含 TODO、占位或未公开指标填充", async () => {
  const index = await buildKnowledgeIndex(content, { publicDirectory });
  for (const item of index.items) assert.doesNotMatch(item.body, /TODO|占位|未公开指标|假签名|\b\d+(?:\.\d+)?%\s*(?:→|→)/i, item.slug);
  for (const item of index.items.filter((entry) => entry.contentType === "guide")) {
    assert(item.body.length >= 400, `${item.slug} 应包含独立使用的场景、步骤和恢复材料`);
    for (const section of ["适用问题", "关键取舍", "失败与恢复", "决策清单", "可执行步骤", "失败信号与恢复动作"]) assert(item.headings.some((heading) => heading.text === section), `${item.slug} 缺少 ${section}`);
  }
  for (const item of index.items.filter((entry) => entry.contentType === "decision-card")) {
    assert(item.body.length >= 400, `${item.slug} 应交代比较和条件`);
    for (const section of ["判断条件", "适用场景", "不适用场景", "选择依据", "比较对象矩阵", "升级与降级触发"]) assert(item.headings.some((heading) => heading.text === section), `${item.slug} 缺少 ${section}`);
  }
  const caseStudy = index.items.find((item) => item.contentType === "case-study");
  assert(caseStudy.body.length >= 800, "旗舰案例应有可招聘评估的真实叙事");
  assert.equal(caseStudy.evidence.length >= 2, true, "旗舰案例应提供至少两项公开证据");
});
