import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Markdown } from "./App";

describe("note source rendering boundary", () => {
  it("leaves the structured source panel as the only source renderer", () => {
    render(<Markdown body={"## 概念\n正文\n## 原始来源\n- https://example.com"} headings={[{ level: 2, text: "概念", anchor: "concept" }]} />);
    expect(screen.getByRole("heading", { name: "概念" })).toBeInTheDocument();
    expect(screen.queryByText("原始来源")).not.toBeInTheDocument();
    expect(screen.queryByText("https://example.com")).not.toBeInTheDocument();
  });
});
