import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildKnowledgeIndex, writeKnowledgeIndex } from "./content-lib.mjs";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const defaultContentDirectory = resolve(scriptDirectory, "..", "content");
const defaultOutputPath = resolve(scriptDirectory, "..", "generated", "knowledge-index.json");

function parseArguments(argumentsList) {
  const result = { contentDirectory: defaultContentDirectory, outputPath: defaultOutputPath, generatedAt: undefined };
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    const value = argumentsList[index + 1];
    if (argument === "--content" && value) result.contentDirectory = resolve(value);
    else if (argument === "--output" && value) result.outputPath = resolve(value);
    else if (argument === "--generated-at" && value) result.generatedAt = value;
    else throw new Error(`未知或不完整参数：${argument}`);
    index += 1;
  }
  return result;
}

const options = parseArguments(process.argv.slice(2));
const index = await buildKnowledgeIndex(options.contentDirectory, { generatedAt: options.generatedAt });
await writeKnowledgeIndex(index, options.outputPath);
console.log(`已生成 ${index.notes.length} 篇笔记的确定性索引：${options.outputPath}`);
