import { describe, expect, it } from "vitest";
import { searchNotes } from "./knowledge";
import type { KnowledgeNote } from "./types";
const note = (order: number, title: string, summary: string, tags: string[], headings: string[], body: string): KnowledgeNote => ({ slug: `note-${order}`, title, module: "ai-foundations", order, summary, tags, updatedAt: "2026-08-15", prerequisites: [], body, headings: headings.map((text) => ({ level: 2, text, anchor: text })), sources: [], contentHash: "a" });
describe("weighted Chinese search", () => { it("sorts contract fields by their specified weight", () => { const results = searchNotes([note(1, "检索词标题", "", [], [], ""), note(2, "普通", "检索词摘要", [], [], ""), note(3, "普通", "", ["检索词标签"], [], ""), note(4, "普通", "", [], ["检索词小标题"], ""), note(5, "普通", "", [], [], "检索词正文")], "检索词"); expect(results.map((item) => item.note.order)).toEqual([1, 2, 3, 4, 5]); }); });
