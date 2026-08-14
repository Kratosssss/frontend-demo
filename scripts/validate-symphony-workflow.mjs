import { readFile } from "node:fs/promises";

const workflowUrl = new URL("../WORKFLOW.md", import.meta.url);
const workflow = await readFile(workflowUrl, "utf8");

const requiredPatterns = [
  [/project_slug:\s*"[^"\n]+"/, "a concrete Linear project slug"],
  [/required_labels:\s*\n\s*- symphony/, "the symphony dispatch label"],
  [/active_states:[\s\S]*?- Todo[\s\S]*?- In Progress[\s\S]*?- Rework/, "the approved active states"],
  [/max_concurrent_agents:\s*1/, "a per-instance worker limit of one"],
  [/global_lock_path:\s*\/Users\/yaotao\/Codex Workplace\/02-scratch\/S002-codex-symphony-runtime\/global-agent\.lock/, "the host-wide worker lease"],
  [/app-server --disable multi_agent --disable multi_agent_v2/, "disabled Codex subagents"],
  [/Never merge a PR, enable auto-merge, call `gh pr merge`, push directly to main, deploy, publish, or touch production data\./, "the no-merge/no-deploy guardrail"],
];

const forbiddenPatterns = [
  [/__LINEAR_PROJECT_SLUG__/, "an unresolved Linear project placeholder"],
  [/\bgh\s+pr\s+merge\b(?!`)/, "an executable merge instruction"],
  [/\b(auto[- ]?merge|deploy|publish)\s*:\s*true\b/i, "an enabled merge/deploy/publish switch"],
];

const failures = [];

for (const [pattern, description] of requiredPatterns) {
  if (!pattern.test(workflow)) failures.push(`missing ${description}`);
}

for (const [pattern, description] of forbiddenPatterns) {
  if (pattern.test(workflow)) failures.push(`found ${description}`);
}

const activeStates = workflow.match(/\n\s*active_states:\s*\n((?:\s+- [^\n]+\n)+)/)?.[1] ?? "";
if (/^\s*- Merging\s*$/m.test(activeStates)) {
  failures.push("found Merging in the active-state policy");
}

if (failures.length > 0) {
  console.error(`WORKFLOW.md policy validation failed:\n- ${failures.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log("WORKFLOW.md policy validation passed");
}
