import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CARD_TEMPLATE_FILES,
  DISPATCH_STATES,
  MAX_PARALLEL_SPECIALISTS,
  MAX_REPAIR_ROUNDS,
  ROLE_PROFILES,
  assertExclusiveOwnership,
  canAdvanceToFigma,
  canReleaseProductBaseline,
  canReleaseImplementation,
  canRequestDirectionApproval,
  isAffirmativeTeamTrigger,
  mayUseFigma,
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
  assert.deepEqual(selectSpecialists({ product: true, experience: true, frontend: true, backend: false }), ["product", "design", "frontend", "qa"]);
  assert.deepEqual(selectSpecialists({ backend: true }), ["backend", "qa"]);
  assert.equal(MAX_PARALLEL_SPECIALISTS, 3);
  assert.deepEqual(ROLE_PROFILES.product, { model: "gpt-5.6-sol", reasoningEffort: "high" });
  assert.deepEqual(ROLE_PROFILES.frontend, { model: "gpt-5.6-terra", reasoningEffort: "high" });
  assert.deepEqual(ROLE_PROFILES.qa, { model: "gpt-5.6-sol", reasoningEffort: "high" });
  assert.deepEqual(DISPATCH_STATES, ["queued", "running", "waiting_human", "blocked", "passed", "failed"]);
});

test("产品规格基线按需启用且重大产品决策必须由用户批准", () => {
  const readyBaseline = {
    productRequired: true,
    productSpecPath: "docs/specs/feature-product-spec.md",
    productBaselineReady: true,
  };

  assert.equal(canReleaseProductBaseline({ productRequired: false }), true);
  assert.equal(canReleaseProductBaseline({ productRequired: true }), false);
  assert.equal(canReleaseProductBaseline(readyBaseline), true);
  assert.equal(canReleaseProductBaseline({
    ...readyBaseline,
    productDecisionRequired: true,
  }), false);
  assert.equal(canReleaseProductBaseline({
    ...readyBaseline,
    productDecisionRequired: true,
    productDecisionApproved: true,
    productDecisionApprovalEvidence: "用户选择方案 A",
  }), true);

  assert.equal(roleMayWrite({ role: "product", productRequired: true }), true);
  assert.equal(roleMayWrite({ role: "design", productRequired: true }), false);
  assert.equal(roleMayWrite({ role: "frontend", ...readyBaseline }), true);
  assert.equal(roleMayWrite({
    role: "backend",
    ...readyBaseline,
    productDecisionRequired: true,
    productDecisionApproved: true,
  }), false);
  assert.equal(mayUseFigma({
    productRequired: true,
    designRequired: true,
    directionApproved: true,
  }), false);
  assert.equal(mayUseFigma({
    ...readyBaseline,
    designRequired: true,
    directionApproved: true,
  }), true);
  assert.equal(canReleaseImplementation({ productRequired: true, designRequired: false }), false);
  assert.equal(canReleaseImplementation({ ...readyBaseline, designRequired: false }), true);
});

test("设计门禁和两轮返修上限不可绕过", () => {
  const directionImages = ["direction-a.png", "direction-b.png", "direction-c.png"];
  const approvedDirection = {
    directionImages,
    directionApproved: true,
    directionApprovalEvidence: "用户批准方向 B",
    selectedDirection: "direction-b",
  };

  assert.equal(roleMayWrite({ role: "design", designRequired: true }), true);
  assert.equal(roleMayWrite({ role: "frontend", designRequired: true }), false);
  assert.equal(roleMayWrite({ role: "backend", designRequired: true, directionApproved: true }), false);
  assert.equal(roleMayWrite({ role: "frontend", designRequired: true, directionApproved: true, figmaApproved: true }), true);
  assert.equal(roleMayWrite({ role: "qa" }), false);
  assert.equal(mayUseFigma({ designRequired: true, directionApproved: false }), false);
  assert.equal(mayUseFigma({ designRequired: true, directionApproved: true }), true);

  assert.equal(canRequestDirectionApproval({ directionImages: directionImages.slice(0, 2) }), false);
  assert.equal(canRequestDirectionApproval({ directionImages }), true);
  assert.equal(canAdvanceToFigma({ ...approvedDirection, directionApprovalEvidence: "" }), false);
  assert.equal(canAdvanceToFigma(approvedDirection), true);
  assert.equal(canReleaseImplementation({ designRequired: false }), true);
  assert.equal(canReleaseImplementation({ designRequired: true, ...approvedDirection, figmaApproved: true }), false);
  assert.equal(canReleaseImplementation({
    designRequired: true,
    ...approvedDirection,
    figmaFileUrl: "https://www.figma.com/design/example",
    figmaNodeId: "12:34",
    figmaApproved: true,
    figmaApprovalEvidence: "用户批准最终 Figma",
  }), true);

  assert.equal(MAX_REPAIR_ROUNDS, 2);
  assert.equal(mayStartRepair(0), true);
  assert.equal(mayStartRepair(1), true);
  assert.equal(mayStartRepair(2), false);
});

test("任务卡路径必须独占且五套模板字段完整", async () => {
  assert.equal(assertExclusiveOwnership([
    { role: "frontend", ownedPaths: ["hrms/src"] },
    { role: "backend", ownedPaths: ["hrms/mock-server"] },
  ]), true);
  assert.throws(() => assertExclusiveOwnership([
    { role: "frontend", ownedPaths: ["hrms/src"] },
    { role: "backend", ownedPaths: ["hrms/src/api"] },
  ]), /owned path overlap/);

  assert.deepEqual(CARD_TEMPLATE_FILES, {
    product: "assets/cards/product-card-template.md",
    design: "assets/cards/design-card-template.md",
    frontend: "assets/cards/frontend-card-template.md",
    backend: "assets/cards/backend-card-template.md",
    qa: "assets/cards/qa-card-template.md",
  });

  for (const [role, relativePath] of Object.entries(CARD_TEMPLATE_FILES)) {
    const template = await read(`.agents/skills/p007-team-commander/${relativePath}`);
    assert.deepEqual(validateTaskCard(template, role), [], `${role} card should be complete`);
  }

  const product = await read(".agents/skills/p007-team-commander/assets/cards/product-card-template.md");
  const design = await read(".agents/skills/p007-team-commander/assets/cards/design-card-template.md");
  const frontend = await read(".agents/skills/p007-team-commander/assets/cards/frontend-card-template.md");
  const backend = await read(".agents/skills/p007-team-commander/assets/cards/backend-card-template.md");
  const qa = await read(".agents/skills/p007-team-commander/assets/cards/qa-card-template.md");
  assert.match(product, /重大产品决策/);
  assert.match(product, /不创建视觉方向、不调用 Figma/);
  assert.doesNotMatch(product, /^## 三个视觉方向$/m);
  assert.match(design, /三个视觉方向/);
  assert.match(design, /方向批准前禁止调用 Figma/);
  assert.match(design, /\$refero-design/);
  assert.match(design, /^## Refero 研究与参考锁定$/m);
  assert.match(design, /^## Demo 资产政策$/m);
  assert.doesNotMatch(frontend, /^## 三个视觉方向$/m);
  assert.match(frontend, /最终 Figma 文件 URL/);
  assert.match(frontend, /\$frontend-ui-engineering/);
  assert.match(frontend, /\$baseline-ui/);
  assert.match(frontend, /\$emil-design-eng/);
  assert.match(frontend, /不得强制引入 Tailwind、Radix、shadcn/);
  assert.doesNotMatch(frontend, /\$refero-design/);
  assert.match(backend, /最终 Figma 批准证据缺失时不得修改业务代码/);
  assert.match(qa, /核验三张方向图/);
  assert.match(qa, /规格符合性验收/);
  assert.match(qa, /工程质量验收/);
  assert.doesNotMatch(qa, /frontend-design-review/);
  await assert.rejects(access(resolve(root, ".agents/skills/p007-team-commander/assets/task-card-template.md")));
});

test("manifest 和角色技能声明产品基线与双重设计门禁", async () => {
  const manifest = await read(".agents/skills/p007-team-commander/assets/manifest-template.yaml");
  for (const field of [
    "spec_path", "baseline_ready", "decision_required", "decision_options",
    "decision_approved", "decision_approval_evidence",
  ]) {
    assert.match(manifest, new RegExp(`^  ${field}:`, "m"));
  }
  for (const field of [
    "direction_images", "direction_approved", "direction_approval_evidence",
    "selected_direction", "figma_file_url", "figma_node_id",
    "figma_approved", "figma_approval_evidence",
  ]) {
    assert.match(manifest, new RegExp(`^  ${field}:`, "m"));
  }
  assert.match(manifest, /^design_review:\n  enabled: false\n  phase: disabled$/m);

  const commander = await read(".agents/skills/p007-team-commander/SKILL.md");
  const product = await read(".agents/skills/p007-product-manager/SKILL.md");
  const design = await read(".agents/skills/p007-product-designer/SKILL.md");
  const frontend = await read(".agents/skills/p007-frontend-engineer/SKILL.md");
  const backend = await read(".agents/skills/p007-backend-engineer/SKILL.md");
  const qa = await read(".agents/skills/p007-qa-engineer/SKILL.md");
  assert.match(commander, /project manager and delivery owner/);
  assert.match(commander, /Enforce the product baseline/);
  assert.match(product, /user problem, product scope/);
  assert.match(product, /do not choose on the user's behalf/);
  assert.match(commander, /exactly three materially different direction images/);
  assert.match(commander, /Forbid Figma during direction exploration/);
  assert.match(commander, /design_review\.enabled.*false/);
  assert.match(commander, /existing post-implementation QA flow remains unchanged/);
  assert.match(commander, /Own auxiliary-skill selection, card injection, scope, and validation as commander/);
  assert.match(design, /Create exactly three materially different visual directions/);
  assert.match(frontend, /final approved Figma file\/node/);
  assert.match(frontend, /\$frontend-ui-engineering/);
  assert.match(frontend, /\$baseline-ui/);
  assert.match(frontend, /\$emil-design-eng/);
  assert.match(frontend, /Do not introduce Tailwind, Radix, shadcn/);
  assert.match(frontend, /Do not invoke Refero/);
  assert.match(backend, /final Figma approval/);
  assert.match(qa, /three direction images/);
  assert.match(qa, /specification-compliance verdict/);
  assert.match(qa, /engineering-quality verdict/);
});

test("总指挥自动审计收尾清理但不越权删除", async () => {
  const commander = await read(".agents/skills/p007-team-commander/SKILL.md");
  const manifest = await read(".agents/skills/p007-team-commander/assets/manifest-template.yaml");

  assert.match(commander, /^## Audit close-out cleanup$/m);
  assert.match(commander, /always run a read-only cleanup audit/);
  assert.match(commander, /deletion is not/);
  assert.match(commander, /explicit cleanup authorization/);
  assert.match(commander, /Never force-remove/);
  assert.match(commander, /Do not remove the worktree that hosts the active commander turn/);
  assert.match(commander, /total worktree counts before and after cleanup/);
  assert.match(commander, /Do not automatically push, merge, deploy, delete worktrees, or delete branches merely because the task is complete/);

  for (const field of [
    "audit_completed", "authorization_evidence", "worktree_count_before",
    "worktree_count_after", "worktrees", "branches", "stopped_services",
    "deleted_worktrees", "deleted_local_branches", "deleted_remote_branches",
    "retained_items", "deferred_current_worktree",
  ]) {
    assert.match(manifest, new RegExp(`^  ${field}:`, "m"));
  }
});

test("六个技能显式调用且不保留仓库级 verify 工作流", async () => {
  const skills = [
    "p007-team-commander",
    "p007-product-manager",
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

  await assert.rejects(access(resolve(root, ".github/workflows/project-verify.yml")));
  await assert.rejects(access(resolve(root, "WORKFLOW.md")));
  await assert.rejects(access(resolve(root, "scripts/validate-symphony-workflow.mjs")));
});

test("根规则只定义跨目录通用的四条工程底线", async () => {
  const instructions = await read("AGENTS.md");
  assert.match(instructions, /^## 通用工程底线$/m);
  assert.match(instructions, /最小改动：只修改完成任务必需的文件和逻辑/);
  assert.match(instructions, /优先复用：先复用现有组件、工具和架构/);
  assert.match(instructions, /不得绕过质量门禁：不得通过删除或放宽测试/);
  assert.match(instructions, /改动必须可验证：行为变化必须有测试或可复现证据/);
  assert.match(instructions, /子项目专属规则应放在对应目录最近的 `AGENTS\.md`/);
});
