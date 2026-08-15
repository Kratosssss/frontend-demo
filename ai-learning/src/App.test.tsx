import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Home, Markdown } from "./App";
import { publicEvidenceHref } from "./evidence";
import type { KnowledgeItem } from "./types";

const item = (contentType: KnowledgeItem["contentType"], slug: string): KnowledgeItem => ({ slug, title: slug, contentType, module: "evaluation-practice", order: 1, summary: "摘要", tags: [], updatedAt: "2026-08-15", reviewedAt: contentType === "decision-card" ? "2026-08-15" : null, reviewStatus: contentType === "decision-card" ? "current" : null, prerequisites: [], related: [], sources: [], evidence: contentType === "case-study" ? [{ id: "p007-role-map", label: "P007 七角色公开协作图", kind: "document", path: "/evidence/p007-role-map.svg", supports: "只支持协作结构。" }] : [], headings: [], body: "正文", contentHash: "test", canonicalPath: `/${contentType}s/${slug}` });

describe("note source rendering boundary", () => {
  it("leaves the structured source panel as the only source renderer", () => {
    render(<Markdown body={"## 概念\n正文\n## 原始来源\n- https://example.com"} headings={[{ level: 2, text: "概念", anchor: "concept" }]} />);
    expect(screen.getByRole("heading", { name: "概念" })).toBeInTheDocument();
    expect(screen.queryByText("原始来源")).not.toBeInTheDocument();
    expect(screen.queryByText("https://example.com")).not.toBeInTheDocument();
  });
});

describe("deployment-safe evidence and home entry points", () => {
  it("resolves public evidence under a Vite subpath", () => {
    expect(publicEvidenceHref("/evidence/proof.png", "/ai-learning/")).toBe("/ai-learning/evidence/proof.png");
    expect(publicEvidenceHref("/evidence/proof.png", "/", "/ai-learning/")).toBe("/ai-learning/evidence/proof.png");
    expect(publicEvidenceHref("https://example.com/proof.png", "/ai-learning/")).toBe("https://example.com/proof.png");
  });

  it("keeps the two explicit home entry points available", () => {
    render(<MemoryRouter><Home items={[item("guide", "guide"), item("decision-card", "decision"), item("case-study", "case")]} /></MemoryRouter>);
    expect(screen.getByRole("link", { name: /查看 P007 旗舰案例/ })).toHaveAttribute("href", "/cases/p007-seven-role-case");
    expect(screen.getByRole("link", { name: /从工程问题开始/ })).toHaveAttribute("href", "/learn");
    expect(screen.queryByText("人工验收")).not.toBeInTheDocument();
    expect(screen.getByText("公开证据 / 协作结构")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /查看协作图/ })).toHaveAttribute("href", "/evidence/p007-role-map.svg");
  });
});
