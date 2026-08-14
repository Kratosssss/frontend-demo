import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import test from "node:test";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildKnowledgeIndex, searchKnowledge, writeKnowledgeIndex } from "../../scripts/content-lib.mjs";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const contentDirectory = resolve(testDirectory, "..", "..", "content");

test("12 篇 Markdown 严格符合共享契约并生成确定性索引", async () => {
  const timestamp = "2026-08-15T08:00:00.000Z";
  const first = await buildKnowledgeIndex(contentDirectory, { generatedAt: timestamp });
  const second = await buildKnowledgeIndex(contentDirectory, { generatedAt: timestamp });
  assert.equal(first.schemaVersion, 1);
  assert.equal(first.notes.length, 12);
  assert.deepEqual(first.notes.map((note) => note.order), Array.from({ length: 12 }, (_, index) => index + 1));
  assert.deepEqual(first.notes.map((note) => note.module), [
    "ai-foundations", "ai-foundations", "training-inference", "training-inference",
    "token-embedding", "token-embedding", "transformer-prompt", "transformer-prompt",
    "rag-agent", "rag-agent", "evaluation-practice", "evaluation-practice",
  ]);
  assert.deepEqual(first, second);
  assert(first.notes.every((note) => /^[a-f0-9]{64}$/.test(note.contentHash)));
  assert(first.notes.every((note) => note.sources.length >= 1 && note.headings.length >= 2));

  const tempDirectory = await mkdtemp(resolve(tmpdir(), "p007-index-"));
  const output = resolve(tempDirectory, "knowledge-index.json");
  await writeKnowledgeIndex(first, output);
  assert.deepEqual(JSON.parse(await readFile(output, "utf8")), first);
  await rm(tempDirectory, { recursive: true, force: true });
});

test("中文搜索按标题、摘要、标签、标题层级、正文的契约权重排序", () => {
  const makeNote = (order, title, summary, tags, headings, body) => ({ order, title, summary, tags, headings, body });
  const index = { notes: [
    makeNote(1, "检索词标题", "普通摘要", [], [], ""),
    makeNote(2, "普通标题", "检索词摘要", [], [], ""),
    makeNote(3, "普通标题", "普通摘要", ["检索词标签"], [], ""),
    makeNote(4, "普通标题", "普通摘要", [], [{ text: "检索词小标题" }], ""),
    makeNote(5, "普通标题", "普通摘要", [], [], "检索词正文"),
  ] };
  const result = searchKnowledge(index, "检索词");
  assert.deepEqual(result.map((item) => item.note.order), [1, 2, 3, 4, 5]);
  assert.deepEqual(result.map((item) => item.score), [8, 5, 4, 3, 1]);
  assert.equal(searchKnowledge(index, "不存在").length, 0);
  assert.deepEqual(searchKnowledge(index, "").map((item) => item.note.order), [1, 2, 3, 4, 5]);
});

test("内容校验拒绝未声明字段与无法映射到正文的来源", async () => {
  const tempDirectory = await mkdtemp(resolve(tmpdir(), "p007-invalid-content-"));
  const copiedContent = resolve(tempDirectory, "content");
  const target = resolve(copiedContent, "ai-foundations", "ai-what-is-model.md");
  await cp(contentDirectory, copiedContent, { recursive: true });
  const original = await readFile(target, "utf8");
  await writeFile(target, original.replace("slug: ai-what-is-model", "unknown: forbidden\nslug: ai-what-is-model"));
  await assert.rejects(() => buildKnowledgeIndex(copiedContent), /不允许的 frontmatter 字段 unknown/);

  await writeFile(target, original.replace("https://doi.org/10.1093/mind/LIX.236.433) —", "https://example.invalid/not-the-citation) —"));
  await assert.rejects(() => buildKnowledgeIndex(copiedContent), /必须在“原始来源”章节中列出 URL/);
  await rm(tempDirectory, { recursive: true, force: true });
});
