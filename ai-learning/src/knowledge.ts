import type { KnowledgeIndex, KnowledgeNote, SearchHit } from "./types";

const indexUrl = new URL("../generated/knowledge-index.json", import.meta.url).href;

export async function loadKnowledge(): Promise<KnowledgeIndex> {
  const response = await fetch(indexUrl);
  if (!response.ok) throw new Error("index_unavailable");
  const value: unknown = await response.json();
  if (!isIndex(value)) throw new Error("index_invalid");
  return value;
}

function isIndex(value: unknown): value is KnowledgeIndex {
  return typeof value === "object" && value !== null && "schemaVersion" in value && (value as { schemaVersion: unknown }).schemaVersion === 1 && "notes" in value && Array.isArray((value as { notes: unknown }).notes);
}

const normalized = (value: string) => value.toLocaleLowerCase("zh-CN").replace(/\s+/g, " ").trim();
const snippet = (text: string, query: string) => {
  const at = normalized(text).indexOf(query);
  if (at < 0) return text.slice(0, 150);
  return `${at > 32 ? "…" : ""}${text.slice(Math.max(0, at - 32), at + query.length + 86)}${at + query.length + 86 < text.length ? "…" : ""}`;
};

export function searchNotes(notes: KnowledgeNote[], rawQuery: string): SearchHit[] {
  const query = normalized(rawQuery);
  if (!query) return notes.map((note) => ({ note, fields: [], excerpt: note.summary }));
  return notes.map((note) => {
    const fields: Array<[string, string, number]> = [["标题", note.title, 8], ["摘要", note.summary, 5], ["标签", note.tags.join(" "), 4], ["小标题", note.headings.map((h) => h.text).join(" "), 3], ["正文", note.body, 1]];
    const matches = fields.filter(([, value]) => normalized(value).includes(query));
    return { note, fields: matches.map(([name]) => name), score: matches.reduce((total, [, , weight]) => total + weight, 0), excerpt: snippet(matches[0]?.[1] ?? note.summary, query) };
  }).filter((hit) => hit.score > 0).sort((a, b) => b.score - a.score || a.note.order - b.note.order).map(({ note, fields, excerpt }) => ({ note, fields, excerpt }));
}

export const moduleMeta: Record<KnowledgeNote["module"], { number: string; name: string; purpose: string }> = {
  "ai-foundations": { number: "01", name: "AI 基础", purpose: "先建立模型、数据、任务与能力边界的共同语言。" },
  "training-inference": { number: "02", name: "训练 / 推理", purpose: "理解模型如何学习，以及部署后如何生成结果。" },
  "token-embedding": { number: "03", name: "Token / Embedding", purpose: "看见文本进入模型前的表示方式。" },
  "transformer-prompt": { number: "04", name: "Transformer / Prompt", purpose: "拆解注意力结构与提示设计的作用边界。" },
  "rag-agent": { number: "05", name: "RAG / Agent", purpose: "理解检索增强与工具调用如何连接外部知识。" },
  "evaluation-practice": { number: "06", name: "评估 / 实践", purpose: "用可复现的方法判断系统是否真的有效。" },
};
