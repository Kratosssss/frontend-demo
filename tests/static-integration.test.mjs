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

test("作品集入口包含全部八个项目", async () => {
  const portal = await read("portal/index.html");
  assert.match(portal, /<h1>前端作品集<\/h1>/);
  assert.doesNotMatch(portal, /[两三2-9]个(?:完整的)?前端作品/);
  assert.match(portal, /href="\/freight-quotes\/"/);
  assert.match(portal, /href="\/testcar\/"/);
  assert.match(portal, /href="\/export-car-demo\/"/);
  assert.match(portal, /href="\/adpulse\/"/);
  assert.match(portal, /href="\/qiwu-mall\/"/);
  assert.match(portal, /href="\/ai-learning\/"/);
  assert.match(portal, /repeat\(auto-fit,/);
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

test("海运空运默认备注覆盖市场波动、额外费用和货物保险", async () => {
  const html = await read("freight-quotes/index.html");
  const app = await read("freight-quotes/app.js");
  assert.match(html, /app\.js\?v=20260814-remarks/);
  assert.match(app, /const DEFAULTS_VERSION = 2/);
  assert.match(app, /international shipping and freight markets/);
  assert.match(app, /Demurrage, detention, truck waiting time, storage/);
  assert.match(app, /international air freight market/);
  assert.match(app, /Truck waiting time, palletization, storage/);
  assert.match(app, /Cargo insurance is not included in this quotation/);
  assert.doesNotMatch(app, /Truck waiting time, palletization, storage, security screening/);
  assert.doesNotMatch(app, /Truck waiting time, palletization, storage, terminal handling/);
  assert.match(app, /migrateSeaDefaultTemplate/);
});

test("CloudBase 产物包含恢复的子项目且不包含旧模板", async () => {
  const assemble = await read("scripts/assemble-cloudbase.mjs");
  assert.match(assemble, /resolve\(root, "freight-quotes"\)/);
  assert.match(assemble, /resolve\(root, "testcar", "out"\)/);
  assert.match(assemble, /resolve\(root, "export-car-demo", "out"\)/);
  assert.match(assemble, /resolve\(root, "adpulse", "dist"\)/);
  assert.match(assemble, /resolve\(root, "ai-learning", "dist"\)/);

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
  await readFile(resolve(root, "cloudbase-dist", "ai-learning", "index.html"), "utf8");
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

test("AI 学习知识库以纯静态地图、笔记和搜索接入", async () => {
  const portal = await read("portal/index.html");
  const packageJson = await read("ai-learning/package.json");
  const sourceFiles = await listFiles(resolve(root, "ai-learning", "src"));
  const source = (await Promise.all(sourceFiles.map((path) => readFile(path, "utf8")))).join("\n");

  assert.match(portal, /六阶段学习地图、12 篇原创长文笔记与中文全文搜索/);
  assert.doesNotMatch(portal, /RAG 问答|登录后提问/);
  assert.doesNotMatch(packageJson, /@cloudbase\/js-sdk/);
  assert.doesNotMatch(source, /VITE_CLOUDBASE_|p007\.ai-learning\.chat|\/ask|\/login|AI 问答|DeepSeek|sendMessage|ai\.bot/);
});

test("CloudBase 中每个 Web 页面都尊重系统减少动态效果偏好", async () => {
  const builtRoot = resolve(root, "cloudbase-dist");
  const surfaces = [
    ["作品集入口", resolve(builtRoot, "index.html")],
    ["工业官网", resolve(builtRoot, "industry-mainpage")],
    ["HRMS", resolve(builtRoot, "hrms")],
    ["海运空运报价", resolve(builtRoot, "freight-quotes")],
    ["TestCar", resolve(builtRoot, "testcar")],
    ["Export Car Demo", resolve(builtRoot, "export-car-demo")],
    ["AdPulse", resolve(builtRoot, "adpulse")],
    ["AI 学习知识库", resolve(builtRoot, "ai-learning")],
  ];

  for (const [name, target] of surfaces) {
    const files = target.endsWith(".html") ? [target] : await listFiles(target);
    const textAssets = files.filter((path) => /\.(?:css|html)$/.test(path));
    const content = (await Promise.all(textAssets.map((path) => readFile(path, "utf8")))).join("\n");

    assert.match(content, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, `${name} 缺少 reduced-motion 媒体查询`);
    assert.match(content, /scroll-behavior:\s*auto\s*!important/, `${name} 未关闭平滑滚动`);
    assert.match(content, /animation-duration:\s*(?:0|0?\.0?1ms)\s*!important/, `${name} 未缩短动画`);
    assert.match(content, /transition-duration:\s*(?:0|0?\.0?1ms)\s*!important/, `${name} 未缩短过渡`);
  }
});
