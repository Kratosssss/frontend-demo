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

test("作品集入口包含全部九个项目", async () => {
  const portal = await read("portal/index.html");
  assert.match(portal, /<h1>前端作品集<\/h1>/);
  assert.doesNotMatch(portal, /[两三2-9]个(?:完整的)?前端作品/);
  assert.match(portal, /href="\/freight-quotes\/"/);
  assert.match(portal, /href="\/testcar\/"/);
  assert.match(portal, /href="\/export-car-demo\/"/);
  assert.match(portal, /href="\/adpulse\/"/);
  assert.match(portal, /href="\/motion-demo\/"/);
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
  const buildChanged = await read("scripts/build-changed.mjs");
  const packageJson = JSON.parse(await read("package.json"));

  assert.equal(packageJson.scripts["build:changed"], "node scripts/build-changed.mjs");
  assert.equal(packageJson.scripts["assemble:cloudbase"], "node scripts/assemble-cloudbase.mjs");
  assert.match(packageJson.scripts["build:release"], /build:changed.*assemble:cloudbase/);
  assert.match(packageJson.scripts["build:cloudbase"], /install:apps.*assemble:cloudbase/);
  assert.match(buildChanged, /CLOUDBASE_BUILD_BASE/);
  assert.match(buildChanged, /cloudbase-build-state\.json/);
  assert.match(buildChanged, /readSavedBase/);
  assert.match(buildChanged, /--base/);
  assert.match(buildChanged, /outputMissing/);
  assert.match(buildChanged, /retail-mall\/dist\/build\/h5\/index\.html/);
  assert.match(buildChanged, /script:\s*"build:h5"/);
  assert.match(buildChanged, /ai-learning\/dist\/index\.html/);
  assert.match(buildChanged, /回退到全量构建/);
  assert.match(assemble, /requiredInputs/);
  assert.match(assemble, /汇总前缺少必需产物/);
  assert.match(assemble, /cloudbase-build-state\.json/);
  assert.match(assemble, /resolve\(root, "freight-quotes"\)/);
  assert.match(assemble, /resolve\(root, "testcar", "out"\)/);
  assert.match(assemble, /resolve\(root, "export-car-demo", "out"\)/);
  assert.match(assemble, /resolve\(root, "adpulse", "dist"\)/);
  assert.match(assemble, /resolve\(root, "motion-demo"\)/);
  assert.match(assemble, /resolve\(root, "retail-mall", "dist", "build", "h5"\)/);
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
  await readFile(resolve(root, "cloudbase-dist", "motion-demo", "index.html"), "utf8");
  await readFile(resolve(root, "cloudbase-dist", "motion-demo", "styles.css"), "utf8");
  await readFile(resolve(root, "cloudbase-dist", "motion-demo", "motion.js"), "utf8");
  await readFile(resolve(root, "cloudbase-dist", "qiwu-mall", "index.html"), "utf8");
  await readFile(resolve(root, "cloudbase-dist", "ai-learning", "index.html"), "utf8");
});

test("Motion Signal Lab 具备完整本地资源和动态治理", async () => {
  const html = await read("motion-demo/index.html");
  const css = await read("motion-demo/styles.css");
  const script = await read("motion-demo/motion.js");

  assert.match(html, /href="\.\/styles\.css"/);
  assert.match(html, /src="\.\/motion\.js"/);
  assert.match(html, /data-motion-toggle/);
  assert.match(html, /data-scroll-lab/);
  assert.match(html, /data-mode="orbit"/);
  assert.match(css, /@font-face/);
  assert.match(css, /IBMPlexSansCondensed-Regular\.woff2/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /html\[data-motion="reduced"\]\s+\.scroll-lab__sticky/);
  assert.match(css, /html\.motion-ready:not\(\[data-motion="reduced"\]\)\s+\.scene-copy/);
  assert.match(css, /top:\s*var\(--header-height\)/);
  assert.match(css, /\.mode-stage\.is-in-viewport\[data-mode="orbit"\]/);
  assert.match(css, /html\[data-motion="reduced"\].*animation:\s*none\s*!important/s);
  assert.match(script, /prefersReduced\.matches\s*\?\s*"reduced"\s*:\s*"running"/);
  assert.match(script, /querySelectorAll\("\.mode-button\[data-mode\]"\)/);
  assert.doesNotMatch(script, /querySelectorAll\("\[data-mode\]"\)/);
  assert.match(script, /IntersectionObserver[\s\S]*is-in-viewport/);
  assert.match(script, /motionToggle\.addEventListener\("click"/);
  assert.match(script, /requestAnimationFrame/);
  assert.match(script, /visibilitychange/);

  await readFile(resolve(root, "motion-demo/fonts/IBMPlexSansCondensed-Regular.woff2"));
  await readFile(resolve(root, "motion-demo/fonts/IBMPlexSansCondensed-SemiBold.woff2"));
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

test("AI 工程知识库以 27 项静态内容、动态卡、案例和搜索接入", async () => {
  const portal = await read("portal/index.html");
  const packageJson = await read("ai-learning/package.json");
  const sourceFiles = await listFiles(resolve(root, "ai-learning", "src"));
  const source = (await Promise.all(sourceFiles.map((path) => readFile(path, "utf8")))).join("\n");

  assert.match(portal, /证据时间轴首页、27 项中文 AI 工程内容、动态决策卡与 P007 七角色旗舰案例/);
  assert.match(portal, /AI 工程 · 知识库/);
  assert.doesNotMatch(portal, /AI Learning Lab/);
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
    ["Motion Signal Lab", resolve(builtRoot, "motion-demo")],
    ["MORU 数码独立站", resolve(builtRoot, "qiwu-mall")],
    ["AI 学习知识库", resolve(builtRoot, "ai-learning")],
  ];

  for (const [name, target] of surfaces) {
    const files = target.endsWith(".html") ? [target] : await listFiles(target);
    const textAssets = files.filter((path) => /\.(?:css|html)$/.test(path));
    const content = (await Promise.all(textAssets.map((path) => readFile(path, "utf8")))).join("\n");

    assert.match(content, /@media\s*\(prefers-reduced-motion:\s*reduce\)/, `${name} 缺少 reduced-motion 媒体查询`);
    assert.match(content, /scroll-behavior:\s*auto(?:\s*!important)?/, `${name} 未关闭平滑滚动`);
    assert.match(content, /(?:animation-duration:\s*(?:0|0?\.0?1ms)\s*!important|animation:\s*none\s*!important)/, `${name} 未停用或缩短动画`);
    assert.match(content, /(?:transition-duration:\s*(?:0|0?\.0?1ms)\s*!important|transition:\s*none\s*!important)/, `${name} 未停用或缩短过渡`);
  }
});
