import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const sourceRoot = new URL("../src/", import.meta.url);
const collect = async (directory: URL): Promise<URL[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const target = new URL(entry.name, `${directory.href}/`);
      return entry.isDirectory() ? collect(target) : Promise.resolve([target]);
    }),
  );
  return files.flat();
};

test("源码不重新引入 H5 global uni shadow shim", async () => {
  const files = (await collect(sourceRoot)).filter((file) =>
    /\.(ts|vue)$/.test(file.pathname),
  );
  const prohibitedGlobal = `globalThis${".uni"}`;
  for (const file of files) {
    const source = await readFile(file, "utf8");
    assert.equal(source.includes(prohibitedGlobal), false, file.pathname);
    assert.equal(
      /\b(?:const|let|var)\s+uni\s*=/.test(source),
      false,
      file.pathname,
    );
  }
});

test("静态 navigateTo 不得指向 pages.json 中任何 tabBar 页面", async () => {
  const pages = JSON.parse(
    await readFile(new URL("../src/pages.json", import.meta.url), "utf8"),
  ) as { tabBar?: { list?: Array<{ pagePath: string }> } };
  const tabTargets = new Set(
    (pages.tabBar?.list || []).map((item) => `/${item.pagePath}`),
  );
  assert.ok(tabTargets.size, "pages.json must declare tabBar targets");
  const files = (await collect(sourceRoot)).filter((file) =>
    /\.(ts|vue)$/.test(file.pathname),
  );
  const staticNavigateTo =
    /uni\.navigateTo\s*\(\s*\{\s*url\s*:\s*(["'`])([^"'`]+)\1/g;
  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(staticNavigateTo)) {
      assert.equal(
        tabTargets.has(match[2].split("?")[0]),
        false,
        `${file.pathname}: navigateTo -> ${match[2]}`,
      );
    }
  }
});

test("移动地址输入同时约束 uni input host 与原生 input 几何", async () => {
  const source = await readFile(
    new URL("../src/pages/address/index.vue", import.meta.url),
    "utf8",
  );
  assert.match(source, /\.field\s*>\s*input/);
  assert.match(source, /:deep\(\.uni-input-input\)/);
  assert.match(source, /min-height:\s*44px/);
  assert.match(source, /min-height:\s*48px/);
});
