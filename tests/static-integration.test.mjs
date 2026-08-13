import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const read = (path) => readFile(resolve(root, path), "utf8");

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  }));
  return nested.flat();
}

test("作品集入口包含全部六个项目", async () => {
  const portal = await read("portal/index.html");
  assert.match(portal, /<h1>前端作品集<\/h1>/);
  assert.doesNotMatch(portal, /[两三2-9]个(?:完整的)?前端作品/);
  assert.match(portal, /href="\/freight-quotes\/"/);
  assert.match(portal, /href="\/testcar\/"/);
  assert.match(portal, /href="\/export-car-demo\/"/);
  assert.match(portal, /href="\/adpulse\/"/);
  assert.match(portal, /repeat\(auto-fit,/);
  assert.match(portal, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?a \{ transition: none; \}/);
  assert.match(portal, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?a:hover, a:focus-visible \{ transform: none; \}/);
});

test("报价工具使用独立存储并保留一次性示例初始化门禁", async () => {
  const html = await read("freight-quotes/index.html");
  const app = await read("freight-quotes/app.js");
  assert.match(html, /数据保存在当前浏览器/);
  assert.match(app, /freight-quote-library:v1/);
  assert.match(app, /freight-quote-defaults:v1/);
  assert.match(app, /initialized:\s*true/);
  assert.match(app, /quotes:\s*\[createExampleQuote\(\)\]/);
  assert.match(app, /if \(parsed && Array\.isArray\(parsed\.quotes\)\)/);
  assert.doesNotMatch(html + app, /LEGACY_TEMPLATES|hiddenLegacyIds|legacyList|restoreLegacy|旧模板备份/);
});

test("CloudBase 产物包含恢复的子项目且不包含旧模板", async () => {
  const assemble = await read("scripts/assemble-cloudbase.mjs");
  assert.match(assemble, /resolve\(root, "freight-quotes"\)/);
  assert.match(assemble, /resolve\(root, "testcar", "out"\)/);
  assert.match(assemble, /resolve\(root, "export-car-demo", "out"\)/);
  assert.match(assemble, /resolve\(root, "adpulse", "dist"\)/);

  const builtRoot = resolve(root, "cloudbase-dist", "freight-quotes");
  const files = await listFiles(builtRoot);
  assert(files.some((path) => path.endsWith("/freight-quotes/index.html")));
  assert(files.some((path) => path.endsWith("/freight-quotes/app.js")));
  assert(files.every((path) => !/旧模板|legacy/i.test(path)));

  const builtText = await Promise.all(files.filter((path) => /\.(?:html|js|css)$/.test(path)).map((path) => readFile(path, "utf8")));
  assert.doesNotMatch(builtText.join("\n"), /LEGACY_TEMPLATES|hiddenLegacyIds|legacyList|restoreLegacy|旧模板备份/);
  await readFile(resolve(root, "cloudbase-dist", "testcar", "index.html"), "utf8");
  await readFile(resolve(root, "cloudbase-dist", "export-car-demo", "index.html"), "utf8");
  await readFile(resolve(root, "cloudbase-dist", "adpulse", "index.html"), "utf8");
});

test("AdPulse 作品接入入口与 CloudBase 汇总产物", async () => {
  const portal = await read("portal/index.html");
  const assemble = await read("scripts/assemble-cloudbase.mjs");
  const app = await read("adpulse/src/App.tsx");
  assert.match(portal, /href="\/adpulse\/"/);
  assert.match(assemble, /resolve\(root, "adpulse", "dist"\)/);
  assert.match(app, /HashRouter/);
  assert.match(app, /数据总览/);
  assert.match(app, /活动管理/);
  assert.match(app, /新建投放活动/);
  assert.match(app, /CampaignDetail/);
});
