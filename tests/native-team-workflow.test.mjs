import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  DISPATCH_STATES,
  MAX_PARALLEL_SPECIALISTS,
  MAX_REPAIR_ROUNDS,
  ROLE_PROFILES,
  assertExclusiveOwnership,
  isAffirmativeTeamTrigger,
  mayStartRepair,
  roleMayWrite,
  selectSpecialists,
  validateTaskCard,
} from "../.agents/skills/p007-team-commander/scripts/dispatch-policy.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFile(resolve(root, path), "utf8");

test("只有肯定式编队执行指令触发团队", () => {
  assert.equal(isAffirmativeTeamTrigger("编队执行"), true);
  assert.equal(isAffirmativeTeamTrigger("现在编队执行，按上面的计划来"), true);
  assert.equal(isAffirmativeTeamTrigger("不要编队执行"), false);
  assert.equal(isAffirmativeTeamTrigger("等我说编队执行的时候再开始"), false);
  assert.equal(isAffirmativeTeamTrigger("请解释“编队执行”是什么意思"), false);
  assert.equal(isAffirmativeTeamTrigger(`以下计划要求只有我说编队执行才启动：${"x".repeat(100)}`), false);
});

test("角色选择、模型和并发策略固定", () => {
  assert.deepEqual(selectSpecialists({ experience: true, frontend: true, backend: false }), ["design", "frontend", "qa"]);
  assert.deepEqual(selectSpecialists({ backend: true }), ["backend", "qa"]);
  assert.equal(MAX_PARALLEL_SPECIALISTS, 3);
  assert.deepEqual(ROLE_PROFILES.frontend, { model: "gpt-5.6-terra", reasoningEffort: "high" });
  assert.deepEqual(ROLE_PROFILES.qa, { model: "gpt-5.6-sol", reasoningEffort: "high" });
  assert.deepEqual(DISPATCH_STATES, ["queued", "running", "waiting_human", "blocked", "passed", "failed"]);
});

test("设计门禁和两轮返修上限不可绕过", () => {
  assert.equal(roleMayWrite({ role: "design", designRequired: true, designApproved: false }), true);
  assert.equal(roleMayWrite({ role: "frontend", designRequired: true, designApproved: false }), false);
  assert.equal(roleMayWrite({ role: "backend", designRequired: true, designApproved: false }), false);
  assert.equal(roleMayWrite({ role: "frontend", designRequired: true, designApproved: true }), true);
  assert.equal(roleMayWrite({ role: "qa" }), false);
  assert.equal(MAX_REPAIR_ROUNDS, 2);
  assert.equal(mayStartRepair(0), true);
  assert.equal(mayStartRepair(1), true);
  assert.equal(mayStartRepair(2), false);
});

test("任务卡路径必须独占且模板字段完整", async () => {
  assert.equal(assertExclusiveOwnership([
    { role: "frontend", ownedPaths: ["hrms/src"] },
    { role: "backend", ownedPaths: ["hrms/mock-server"] },
  ]), true);
  assert.throws(() => assertExclusiveOwnership([
    { role: "frontend", ownedPaths: ["hrms/src"] },
    { role: "backend", ownedPaths: ["hrms/src/api"] },
  ]), /owned path overlap/);

  const template = await read(".agents/skills/p007-team-commander/assets/task-card-template.md");
  assert.deepEqual(validateTaskCard(template), []);
});

test("五个技能显式调用且普通 CI 保留 verify", async () => {
  const skills = [
    "p007-team-commander",
    "p007-product-designer",
    "p007-frontend-engineer",
    "p007-backend-engineer",
    "p007-qa-engineer",
  ];
  for (const skill of skills) {
    const metadata = await read(`.agents/skills/${skill}/agents/openai.yaml`);
    assert.match(metadata, /allow_implicit_invocation: false/);
    await access(resolve(root, `.agents/skills/${skill}/SKILL.md`));
  }

  const workflow = await read(".github/workflows/project-verify.yml");
  assert.match(workflow, /^name: Project verify$/m);
  assert.match(workflow, /^  verify:$/m);
  assert.match(workflow, /run: npm test/);
  assert.match(workflow, /run: npm run lint/);
  assert.doesNotMatch(workflow, /Symphony/i);

  await assert.rejects(access(resolve(root, "WORKFLOW.md")));
  await assert.rejects(access(resolve(root, "scripts/validate-symphony-workflow.mjs")));
});
