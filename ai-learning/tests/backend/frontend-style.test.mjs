import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const directory = dirname(fileURLToPath(import.meta.url));

test("搜索输入的可见焦点在输入 reset 之后以 annotation-blue 显示", async () => {
  const css = await readFile(resolve(directory, "../../src/layout-repair.css"), "utf8");
  assert.match(css, /\.search-line input:focus-visible\s*\{[^}]*outline:\s*2px solid #165cb8;[^}]*outline-offset:\s*2px;/);
});
