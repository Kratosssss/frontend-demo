// @vitest-environment node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appRoot = process.cwd();

describe("local font assets", () => {
  it("imports locked IBM Plex packages without remote font URLs", async () => {
    const [entry, styles, sans, mono] = await Promise.all([
      readFile(resolve(appRoot, "src/main.tsx"), "utf8"),
      readFile(resolve(appRoot, "src/styles.css"), "utf8"),
      readFile(resolve(appRoot, "node_modules/@fontsource/ibm-plex-sans/400.css"), "utf8"),
      readFile(resolve(appRoot, "node_modules/@fontsource/ibm-plex-mono/400.css"), "utf8"),
    ]);
    expect(entry).toContain("@fontsource/ibm-plex-sans/400.css");
    expect(entry).toContain("@fontsource/ibm-plex-mono/400.css");
    expect(styles).not.toMatch(/https?:\/\//i);
    expect(sans).toMatch(/\.woff2/);
    expect(mono).toMatch(/\.woff2/);
    expect(sans).not.toMatch(/https?:\/\//i);
    expect(mono).not.toMatch(/https?:\/\//i);
  });
});
