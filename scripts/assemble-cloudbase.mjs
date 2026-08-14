import { access, cp, copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "cloudbase-dist");
const localStateDirectory = resolve(root, ".local");
const execFileAsync = promisify(execFile);

const requiredInputs = [
  ["作品集入口", resolve(root, "portal", "index.html")],
  ["工业官网构建产物", resolve(root, "industry-mainpage", "out", "index.html")],
  ["HRMS 构建产物", resolve(root, "hrms", "dist", "index.html")],
  ["海运空运报价", resolve(root, "freight-quotes", "index.html")],
  ["TestCar 构建产物", resolve(root, "testcar", "out", "index.html")],
  ["Export Car 构建产物", resolve(root, "export-car-demo", "out", "index.html")],
  ["AdPulse 构建产物", resolve(root, "adpulse", "dist", "index.html")],
  ["Motion Signal Lab", resolve(root, "motion-demo", "index.html")],
];

const missingInputs = [];
for (const [name, path] of requiredInputs) {
  try {
    await access(path);
  } catch {
    missingInputs.push(`${name}: ${path}`);
  }
}

if (missingInputs.length > 0) {
  throw new Error(`CloudBase 汇总前缺少必需产物：\n${missingInputs.join("\n")}\n请先运行 npm run build:changed 或 npm run build:cloudbase。`);
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await copyFile(resolve(root, "portal", "index.html"), resolve(output, "index.html"));
const withoutDesktopMetadata = (source) => !source.endsWith(".DS_Store");

await cp(resolve(root, "industry-mainpage", "out"), resolve(output, "industry-mainpage"), {
  recursive: true,
  filter: withoutDesktopMetadata,
});
await cp(resolve(root, "hrms", "dist"), resolve(output, "hrms"), {
  recursive: true,
  filter: withoutDesktopMetadata,
});
await cp(resolve(root, "freight-quotes"), resolve(output, "freight-quotes"), {
  recursive: true,
  filter: withoutDesktopMetadata,
});
await cp(resolve(root, "testcar", "out"), resolve(output, "testcar"), {
  recursive: true,
  filter: withoutDesktopMetadata,
});
await cp(resolve(root, "export-car-demo", "out"), resolve(output, "export-car-demo"), {
  recursive: true,
  filter: withoutDesktopMetadata,
});
await cp(resolve(root, "adpulse", "dist"), resolve(output, "adpulse"), {
  recursive: true,
  filter: withoutDesktopMetadata,
});
await cp(resolve(root, "motion-demo"), resolve(output, "motion-demo"), {
  recursive: true,
  filter: withoutDesktopMetadata,
});

const { stdout: commit } = await execFileAsync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" });
await mkdir(localStateDirectory, { recursive: true });
await writeFile(
  resolve(localStateDirectory, "cloudbase-build-state.json"),
  `${JSON.stringify({ commit: commit.trim() }, null, 2)}\n`,
  "utf8",
);
