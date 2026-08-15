import type { ContentType, KnowledgeIndex, KnowledgeItem, ModuleId, SearchHit } from "./types";

const indexUrl = new URL("../generated/knowledge-index.json", import.meta.url).href;

export async function loadKnowledge(): Promise<KnowledgeIndex> {
  const response = await fetch(indexUrl);
  if (!response.ok) throw new Error("index_unavailable");
  const value: unknown = await response.json();
  if (!isKnowledgeIndex(value)) throw new Error("index_invalid");
  return value;
}

const contentTypes = new Set<ContentType>(["note", "guide", "decision-card", "case-study"]);
const modules = new Set<ModuleId>(["ai-foundations", "training-inference", "token-embedding", "transformer-prompt", "rag-agent", "evaluation-practice"]);
const reviewStatuses = new Set(["current", "review-needed"]);
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((entry) => typeof entry === "string");

export function isKnowledgeIndex(value: unknown): value is KnowledgeIndex {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<KnowledgeIndex>;
  if (candidate.schemaVersion !== 2 || !Array.isArray(candidate.items) || candidate.items.length !== 27 || !candidate.items.every(isItem) || candidate.counts?.total !== 27 || candidate.counts.note !== 12 || candidate.counts.guide !== 10 || candidate.counts.decisionCard !== 4 || candidate.counts.caseStudy !== 1) return false;
  const slugs = new Set(candidate.items.map((item) => item.slug)); const orders = new Set(candidate.items.map((item) => item.order));
  const counts = candidate.items.reduce((total, item) => ({ ...total, [item.contentType]: total[item.contentType] + 1 }), { note: 0, guide: 0, "decision-card": 0, "case-study": 0 });
  return slugs.size === 27 && orders.size === 27 && counts.note === 12 && counts.guide === 10 && counts["decision-card"] === 4 && counts["case-study"] === 1 && candidate.items.every((item) => item.canonicalPath === (item.contentType === "note" ? `/notes/${item.slug}` : item.contentType === "guide" ? `/guides/${item.slug}` : item.contentType === "decision-card" ? `/decisions/${item.slug}` : `/cases/${item.slug}`));
}

function isItem(value: unknown): value is KnowledgeItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<KnowledgeItem>;
  const decision = item.contentType === "decision-card";
  return typeof item.slug === "string" && typeof item.title === "string" && contentTypes.has(item.contentType as ContentType) && modules.has(item.module as ModuleId) && Number.isInteger(item.order) && item.order! >= 1 && item.order! <= 27 && typeof item.summary === "string" && typeof item.updatedAt === "string" && typeof item.body === "string" && typeof item.contentHash === "string" && typeof item.canonicalPath === "string" && isStringArray(item.tags) && isStringArray(item.prerequisites) && isStringArray(item.related) && Array.isArray(item.headings) && item.headings.every((heading) => typeof heading?.text === "string" && (heading.level === 2 || heading.level === 3) && typeof heading.anchor === "string") && Array.isArray(item.sources) && item.sources.every((source) => typeof source?.id === "string" && typeof source.url === "string" && typeof source.title === "string") && Array.isArray(item.evidence) && item.evidence.every((evidence) => typeof evidence?.id === "string" && typeof evidence.path === "string" && typeof evidence.supports === "string") && (decision ? typeof item.reviewedAt === "string" && reviewStatuses.has(item.reviewStatus as string) : item.reviewedAt === null && item.reviewStatus === null);
}

const normalized = (value: string) => value.normalize("NFC").toLocaleLowerCase("zh-CN").replace(/\s+/g, " ").trim();
const snippet = (text: string, query: string) => {
  const at = normalized(text).indexOf(query);
  if (at < 0) return text.slice(0, 150);
  return `${at > 32 ? "…" : ""}${text.slice(Math.max(0, at - 32), at + query.length + 86)}${at + query.length + 86 < text.length ? "…" : ""}`;
};

export function searchItems(items: KnowledgeItem[], rawQuery: string): SearchHit[] {
  const query = normalized(rawQuery);
  if (!query) return [...items].sort((a, b) => a.order - b.order).map((item) => ({ item, fields: [], excerpt: item.summary }));
  return items.map((item) => {
    const fields: Array<[string, string, number]> = [["标题", item.title, 8], ["摘要", item.summary, 5], ["标签", item.tags.join(" "), 4], ["小标题", item.headings.map((heading) => heading.text).join(" "), 3], ["正文", item.body, 1]];
    const matches = fields.filter(([, value]) => normalized(value).includes(query));
    return { item, fields: matches.map(([name]) => name), score: matches.reduce((total, [, , weight]) => total + weight, 0), excerpt: snippet(matches[0]?.[1] ?? item.summary, query) };
  }).filter((hit) => hit.score > 0).sort((a, b) => b.score - a.score || a.item.order - b.item.order).map(({ item, fields, excerpt }) => ({ item, fields, excerpt }));
}

export const moduleMeta: Record<ModuleId, { number: string; name: string; purpose: string }> = {
  "ai-foundations": { number: "01", name: "AI 基础", purpose: "把问题、数据与能力边界说清楚。" },
  "training-inference": { number: "02", name: "训练 / 推理", purpose: "理解训练代价与推理行为。" },
  "token-embedding": { number: "03", name: "Token / Embedding", purpose: "识别表示、上下文与检索边界。" },
  "transformer-prompt": { number: "04", name: "Transformer / Prompt", purpose: "把结构与指令变成可检验假设。" },
  "rag-agent": { number: "05", name: "RAG / Agent", purpose: "把外部知识与行动纳入受控流程。" },
  "evaluation-practice": { number: "06", name: "评估 / 实践", purpose: "以评估、监控和人工验收收束工程。" },
};

export const typeMeta: Record<ContentType, string> = { note: "基础笔记", guide: "工程指南", "decision-card": "动态决策卡", "case-study": "旗舰案例" };
