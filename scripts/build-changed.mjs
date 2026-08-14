import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const buildStatePath = resolve(root, ".local", "cloudbase-build-state.json");

const apps = [
  { name: "industry", directory: "industry-mainpage", output: "industry-mainpage/out/index.html" },
  { name: "hrms", directory: "hrms", output: "hrms/dist/index.html" },
  { name: "testcar", directory: "testcar", output: "testcar/out/index.html" },
  { name: "exportcar", directory: "export-car-demo", output: "export-car-demo/out/index.html" },
  { name: "adpulse", directory: "adpulse", output: "adpulse/dist/index.html" },
  { name: "qiwu", directory: "retail-mall", output: "retail-mall/dist/build/h5/index.html", script: "build:h5" },
  { name: "ai-learning", directory: "ai-learning", output: "ai-learning/dist/index.html" },
];

const args = process.argv.slice(2);
const readOption = (name) => {
  const inline = args.find((arg) => arg.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

function readSavedBase() {
  if (!existsSync(buildStatePath)) return undefined;
  try {
    const state = JSON.parse(readFileSync(buildStatePath, "utf8"));
    return typeof state.commit === "string" && state.commit ? state.commit : undefined;
  } catch {
    console.warn("[build:changed] 本地构建状态不可读，将使用 Git 默认基线。");
    return undefined;
  }
}

const base = readOption("--base") || process.env.CLOUDBASE_BUILD_BASE || readSavedBase() || "HEAD^";
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");

function gitLines(gitArgs, { allowFailure = false } = {}) {
  const result = spawnSync("git", gitArgs, { cwd: root, encoding: "utf8" });
  if (result.status !== 0) {
    if (allowFailure) return null;
    throw new Error(result.stderr.trim() || `git ${gitArgs.join(" ")} 执行失败`);
  }
  return result.stdout.split("\n").map((line) => line.trim()).filter(Boolean);
}

function collectChangedFiles() {
  const committed = gitLines(["diff", "--name-only", "--diff-filter=ACMR", `${base}...HEAD`], { allowFailure: true });
  if (committed === null) return { files: [], invalidBase: true };

  const working = gitLines(["diff", "--name-only", "--diff-filter=ACMR"]);
  const staged = gitLines(["diff", "--cached", "--name-only", "--diff-filter=ACMR"]);
  return { files: [...new Set([...committed, ...working, ...staged])], invalidBase: false };
}

const { files: changedFiles, invalidBase } = collectChangedFiles();
const globalBuildInputs = new Set(["package.json", "package-lock.json", "scripts/build-changed.mjs"]);
const rebuildAll = force || invalidBase || changedFiles.some((file) => globalBuildInputs.has(file));

const planned = apps.filter((app) => {
  const outputMissing = !existsSync(resolve(root, app.output));
  const appChanged = changedFiles.some((file) => file === app.directory || file.startsWith(`${app.directory}/`));
  return rebuildAll || outputMissing || appChanged;
});

if (invalidBase) {
  console.warn(`[build:changed] 无法解析基线 ${base}，为安全起见回退到全量构建。`);
} else {
  console.log(`[build:changed] Git 基线：${base}`);
}

if (planned.length === 0) {
  console.log("[build:changed] 没有需要重新构建的子项目；可直接汇总正式产物。");
  process.exit(0);
}

console.log(`[build:changed] 将构建：${planned.map((app) => app.name).join(", ")}`);
if (dryRun) process.exit(0);

function runNpm(npmArgs) {
  const result = spawnSync("npm", npmArgs, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

for (const app of planned) {
  console.log(`[build:changed] 安装 ${app.name} 的锁定依赖…`);
  runNpm(["ci", "--prefix", app.directory]);
  console.log(`[build:changed] 构建 ${app.name}…`);
  runNpm(["run", app.script ?? "build", "--prefix", app.directory]);
}
