import { cp, copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "cloudbase-dist");

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
await cp(resolve(root, "ai-learning", "dist"), resolve(output, "ai-learning"), {
  recursive: true,
  filter: withoutDesktopMetadata,
});
