export type ModuleId = "ai-foundations" | "training-inference" | "token-embedding" | "transformer-prompt" | "rag-agent" | "evaluation-practice";
export type NoteHeading = { level: 2 | 3; text: string; anchor: string };
export type SourceCitation = { id: string; slug: string; title: string; module: ModuleId; excerpt: string; url: string; kind: "paper" | "official-doc"; locator?: string };
export type KnowledgeNote = { slug: string; title: string; module: ModuleId; order: number; summary: string; tags: string[]; updatedAt: string; prerequisites: string[]; body: string; headings: NoteHeading[]; sources: SourceCitation[]; contentHash: string };
export type KnowledgeIndex = { schemaVersion: 1; generatedAt: string; notes: KnowledgeNote[] };
export type SearchHit = { note: KnowledgeNote; fields: string[]; excerpt: string };
