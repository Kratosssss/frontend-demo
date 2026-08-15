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
  canReleaseConceptSelection,
  canReleaseImplementation,
  canReleaseProductBaseline,
  canRequestConceptApproval,
  isAffirmativeTeamTrigger,
  mayCreateFigmaFirstDraft,
  mayCreateImplementationGoal,
  mayRefineDesignInFigma,
  mayStartRepair,
  requiresIndependentQa,
  resolveRoleProfile,
  roleMayWrite,
  selectSpecialists,
  validateTaskCard,
} from "../.agents/skills/p007-team-commander/scripts/dispatch-policy.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFile(resolve(root, path), "utf8");

const conceptBriefs = ["editorial", "cinematic", "systems", "tactile"].flatMap((family) => (
  [1, 2, 3].map((index) => ({
    id: `${family}-${index}`,
    family,
    title: `${family} concept ${index}`,
  }))
));
const firstDraftEvidence = {
  conceptBriefs,
  firstDraftFileUrl: "https://www.figma.com/design/concept-dispatch-file",
  firstDraftNodeIds: ["10:1", "10:2", "10:3", "10:4"],
  firstDraftScreenshotPaths: ["a.png", "b.png", "c.png", "d.png"],
};
const approvedConcept = {
  ...firstDraftEvidence,
  conceptApproved: true,
  conceptApprovalEvidence: "用户选择 editorial-2",
  selectedConceptId: "editorial-2",
  lockedCharacteristics: {
    composition: "asymmetric editorial split",
    visualMotif: "evidence ribbon",
    colorOrTypography: "oxide red with condensed headings",
  },
};
const readyBaseline = {
  productRequired: true,
  productSpecPath: "docs/specs/feature-product-spec.md",
  productBaselineReady: true,
};

test("只有肯定式编队执行指令触发团队", () => {
  assert.equal(isAffirmativeTeamTrigger("编队执行"), true);
  assert.equal(isAffirmativeTeamTrigger("现在编队执行，按上面的计划来"), true);
  assert.equal(isAffirmativeTeamTrigger("不要编队执行"), false);
  assert.equal(isAffirmativeTeamTrigger("等我说编队执行的时候再开始"), false);
  assert.equal(isAffirmativeTeamTrigger("请解释“编队执行”是什么意思"), false);
  assert.equal(isAffirmativeTeamTrigger(`以下计划要求只有我说编队执行才启动：${"x".repeat(100)}`), false);
});

test("experience 同时启用概念师与设计总监，QA 仍由风险触发", () => {
  assert.deepEqual(
    selectSpecialists({ product: true, experience: true, frontend: true }),
    ["product", "concept", "design", "frontend"],
  );
  assert.deepEqual(selectSpecialists({ backend: true }), ["backend"]);
  assert.deepEqual(selectSpecialists({ backend: true, qaRequired: true }), ["backend", "qa"]);
  assert.equal(requiresIndependentQa({}), false);
  assert.equal(requiresIndependentQa({ explicitRequest: true }), true);
  assert.equal(requiresIndependentQa({ designGateDelivery: true }), true);
  assert.equal(requiresIndependentQa({ crossLayerOrMultipleOwners: true }), true);
  assert.equal(requiresIndependentQa({ sharedBuildOrConfig: true }), true);
  assert.equal(requiresIndependentQa({ securityOrPermission: true }), true);
  assert.equal(requiresIndependentQa({ dataOrIrreversibleSideEffect: true }), true);
  assert.equal(requiresIndependentQa({ ownerEvidenceInsufficient: true }), true);
  assert.equal(MAX_PARALLEL_SPECIALISTS, 3);
  assert.deepEqual(ROLE_PROFILES.concept, {
    model: "gpt-5.6-luna",
    reasoningEffort: "none",
    fallback: { model: "gpt-5.6-terra", reasoningEffort: "low" },
  });
  assert.deepEqual(ROLE_PROFILES.qa, { model: "gpt-5.6-sol", reasoningEffort: "medium" });
  assert.deepEqual(DISPATCH_STATES, ["queued", "running", "waiting_human", "blocked", "passed", "failed"]);
});

test("Luna None 不可用时显式记录 Terra Low 回退", () => {
  assert.deepEqual(resolveRoleProfile("concept", [
    { model: "gpt-5.6-luna", reasoningEffort: "none" },
  ]), {
    requestedModel: "gpt-5.6-luna",
    requestedReasoningEffort: "none",
    effectiveModel: "gpt-5.6-luna",
    effectiveReasoningEffort: "none",
    fallbackUsed: false,
    fallbackReason: "",
  });

  const fallback = resolveRoleProfile("concept", [
    { model: "gpt-5.6-luna", reasoningEffort: "low" },
    { model: "gpt-5.6-terra", reasoningEffort: "low" },
  ]);
  assert.equal(fallback.requestedModel, "gpt-5.6-luna");
  assert.equal(fallback.requestedReasoningEffort, "none");
  assert.equal(fallback.effectiveModel, "gpt-5.6-terra");
  assert.equal(fallback.effectiveReasoningEffort, "low");
  assert.equal(fallback.fallbackUsed, true);
  assert.match(fallback.fallbackReason, /gpt-5\.6-luna \+ none is unavailable/);
});

test("产品规格基线按需启用且先于概念探索", () => {
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
  assert.equal(roleMayWrite({ role: "concept", productRequired: true, conceptRequired: true }), false);
  assert.equal(roleMayWrite({ role: "concept", ...readyBaseline, conceptRequired: true }), true);
  assert.equal(mayCreateFigmaFirstDraft({ productRequired: true, conceptRequired: true }), false);
  assert.equal(mayCreateFigmaFirstDraft({ ...readyBaseline, conceptRequired: true }), true);
  assert.equal(canReleaseImplementation({ productRequired: true, designRequired: false }), false);
  assert.equal(canReleaseImplementation({ ...readyBaseline, designRequired: false }), true);
});

test("必须有 12 个 Brief 与 4 个实际 Figma 方向才能请求选择", () => {
  assert.equal(canRequestConceptApproval({
    ...firstDraftEvidence,
    conceptBriefs: conceptBriefs.slice(0, 11),
  }), false);
  assert.equal(canRequestConceptApproval({
    ...firstDraftEvidence,
    firstDraftNodeIds: firstDraftEvidence.firstDraftNodeIds.slice(0, 3),
  }), false);
  assert.equal(canRequestConceptApproval({
    ...firstDraftEvidence,
    firstDraftScreenshotPaths: ["a.png", "a.png", "c.png", "d.png"],
  }), false);
  assert.equal(canRequestConceptApproval(firstDraftEvidence), true);
  assert.equal(canReleaseConceptSelection({
    ...approvedConcept,
    lockedCharacteristics: { ...approvedConcept.lockedCharacteristics, visualMotif: "" },
  }), false);
  assert.equal(canReleaseConceptSelection(approvedConcept), true);
});

test("选择前设计精修和实现阻塞，最终批准前实现仍阻塞", () => {
  assert.equal(roleMayWrite({ role: "design", conceptRequired: true, designRequired: true }), false);
  assert.equal(mayRefineDesignInFigma({ designRequired: true, ...firstDraftEvidence }), false);
  assert.equal(mayRefineDesignInFigma({ designRequired: true, ...approvedConcept }), true);
  assert.equal(roleMayWrite({ role: "design", designRequired: true, ...approvedConcept }), true);
  assert.equal(roleMayWrite({ role: "frontend", designRequired: true, ...approvedConcept }), false);
  assert.equal(canReleaseImplementation({
    designRequired: true,
    ...approvedConcept,
    finalFigmaFileUrl: "https://www.figma.com/design/final",
    finalFigmaNodeId: "20:1",
    figmaMakeSkippedReason: "静态信息页，无关键交互状态",
    finalDesignApproved: false,
  }), false);
  assert.equal(mayCreateImplementationGoal({
    designRequired: true,
    ...approvedConcept,
    finalFigmaFileUrl: "https://www.figma.com/design/final",
    finalFigmaNodeId: "20:1",
    figmaMakeSkippedReason: "静态信息页，无关键交互状态",
    finalDesignApproved: false,
  }), false);

  const approvedStaticDesign = {
    designRequired: true,
    ...approvedConcept,
    finalFigmaFileUrl: "https://www.figma.com/design/final",
    finalFigmaNodeId: "20:1",
    figmaMakeSkippedReason: "静态信息页，无关键交互状态",
    finalDesignApproved: true,
    finalDesignApprovalEvidence: "用户批准最终 Figma，确认跳过 Make",
  };
  assert.equal(canReleaseImplementation(approvedStaticDesign), true);
  assert.equal(mayCreateImplementationGoal(approvedStaticDesign), true);
  assert.equal(roleMayWrite({ role: "frontend", ...approvedStaticDesign }), true);
  assert.equal(roleMayWrite({ role: "backend", ...approvedStaticDesign }), true);
  assert.equal(roleMayWrite({ role: "qa", ...approvedStaticDesign }), false);

  assert.equal(canReleaseImplementation({
    ...approvedStaticDesign,
    figmaMakeRequired: true,
    figmaMakeUrl: "",
  }), false);
  assert.equal(canReleaseImplementation({
    ...approvedStaticDesign,
    figmaMakeRequired: true,
    figmaMakeUrl: "https://www.figma.com/make/prototype",
  }), true);
  assert.equal(MAX_REPAIR_ROUNDS, 2);
  assert.equal(mayStartRepair(0), true);
  assert.equal(mayStartRepair(1), true);
  assert.equal(mayStartRepair(2), false);
});

test("任务卡路径必须独占且六套专家模板字段完整", async () => {
  assert.equal(assertExclusiveOwnership([
    { role: "concept", ownedPaths: [".planning/dispatch/g/artifacts/figma-first-drafts"] },
    { role: "design", ownedPaths: [".planning/dispatch/g/artifacts/final-design", "docs/specs/design.md"] },
    { role: "frontend", ownedPaths: ["hrms/src"] },
  ]), true);
  assert.throws(() => assertExclusiveOwnership([
    { role: "frontend", ownedPaths: ["hrms/src"] },
    { role: "backend", ownedPaths: ["hrms/src/api"] },
  ]), /owned path overlap/);

  assert.deepEqual(CARD_TEMPLATE_FILES, {
    product: "assets/cards/product-card-template.md",
    concept: "assets/cards/concept-card-template.md",
    design: "assets/cards/design-card-template.md",
    frontend: "assets/cards/frontend-card-template.md",
    backend: "assets/cards/backend-card-template.md",
    qa: "assets/cards/qa-card-template.md",
  });
  for (const [role, relativePath] of Object.entries(CARD_TEMPLATE_FILES)) {
    const template = await read(`.agents/skills/p007-team-commander/${relativePath}`);
    assert.deepEqual(validateTaskCard(template, role), [], `${role} card should be complete`);
  }

  const concept = await read(".agents/skills/p007-team-commander/assets/cards/concept-card-template.md");
  const design = await read(".agents/skills/p007-team-commander/assets/cards/design-card-template.md");
  const frontend = await read(".agents/skills/p007-team-commander/assets/cards/frontend-card-template.md");
  const backend = await read(".agents/skills/p007-team-commander/assets/cards/backend-card-template.md");
  const qa = await read(".agents/skills/p007-team-commander/assets/cards/qa-card-template.md");
  assert.match(concept, /恰好 12 个结构化 Brief/);
  assert.match(concept, /本次 dispatch 新建独立 Figma Design 文件/);
  assert.match(concept, /waiting_human/);
  assert.match(concept, /不得静默改由 Sol 手工生成方向/);
  assert.doesNotMatch(concept, /`docs\/specs\/<approved-design-spec>/);
  assert.doesNotMatch(design, /^## 三个视觉方向$/m);
  assert.match(design, /选择证据或任一锁定特征缺失时保持只读/);
  assert.match(design, /Figma AI 与 Make 精修/);
  assert.match(frontend, /三项锁定特征/);
  assert.match(backend, /概念选择、三项锁定特征和最终 Figma\/Make 批准/);
  assert.match(qa, /12 个 Brief、4 个 Figma First Draft 节点\/截图/);
  assert.match(qa, /最多 3 个最高价值的独立检查/);
  assert.match(qa, /不得重复运行责任角色已经通过的同一套命令/);
  assert.match(design, /\$refero-design/);
  assert.match(design, /^## Refero 研究与参考锁定$/m);
  assert.match(design, /^## Demo 资产政策$/m);
  assert.match(frontend, /\$frontend-ui-engineering/);
  assert.match(frontend, /\$baseline-ui/);
  assert.match(frontend, /\$emil-design-eng/);
  assert.match(frontend, /不得强制引入 Tailwind、Radix、shadcn/);
  assert.doesNotMatch(frontend, /\$refero-design/);
  assert.doesNotMatch(qa, /frontend-design-review/);
  await assert.rejects(access(resolve(root, ".agents/skills/p007-team-commander/assets/task-card-template.md")));
});

test("视觉审查与实施 Goal 使用分离 manifest，并保留审批证据链", async () => {
  const manifest = await read(".agents/skills/p007-team-commander/assets/manifest-template.yaml");
  const reviewManifest = await read(".agents/skills/p007-team-commander/assets/review-manifest-template.yaml");
  for (const field of [
    "briefs", "direction_families", "prompt_package_path", "first_draft_file_url",
    "first_draft_node_ids", "first_draft_screenshot_paths", "approval_evidence",
    "selected_concept_id", "locked_characteristics", "composition", "visual_motif",
    "color_or_typography", "final_figma_file_url", "final_figma_node_id",
    "figma_make_required", "figma_make_url", "figma_make_skipped_reason",
    "final_approved", "final_approval_evidence", "requested", "effective",
    "fallback_used", "fallback_reason",
  ]) {
    assert.match(reviewManifest, new RegExp(`^\\s+${field}:`, "m"));
  }
  assert.match(reviewManifest, /^review_id: "<review-id>"$/m);
  assert.doesNotMatch(reviewManifest, /^goal_id:/m);
  assert.match(reviewManifest, /model: gpt-5\.6-luna, reasoning_effort: none/);
  assert.match(reviewManifest, /fallback: \{ model: gpt-5\.6-terra, reasoning_effort: low \}/);
  assert.match(manifest, /^goal_id: "<goal-id>"$/m);
  assert.match(manifest, /^review_manifest_path: ".planning\/review\/<review-id>\/manifest.yaml"$/m);
  assert.match(manifest, /^review_approval_evidence_ref:/m);
  assert.match(manifest, /^deferred_roles:/m);
  assert.match(manifest, /model: gpt-5\.6-sol, reasoning_effort: medium/);
  assert.match(manifest, /^qa:\n  required: false$/m);
});

test("总指挥、概念师、设计总监与 QA 的职责边界已拆分", async () => {
  const commander = await read(".agents/skills/p007-team-commander/SKILL.md");
  const concept = await read(".agents/skills/p007-visual-concept-explorer/SKILL.md");
  const design = await read(".agents/skills/p007-product-designer/SKILL.md");
  const frontend = await read(".agents/skills/p007-frontend-engineer/SKILL.md");
  const backend = await read(".agents/skills/p007-backend-engineer/SKILL.md");
  const qa = await read(".agents/skills/p007-qa-engineer/SKILL.md");
  assert.match(commander, /native seven-role team/);
  assert.match(commander, /twelve structured briefs grouped into four materially different direction families/);
  assert.match(commander, /fresh Figma Design file for every dispatch/);
  assert.match(commander, /never silently replace Figma AI with manual Sol design/);
  assert.match(commander, /Start the design-review stage without creating a Goal/);
  assert.match(commander, /Create and verify exactly one implementation Goal only after the review gate is fully released/);
  assert.match(commander, /do not create implementation agents or cards/);
  assert.match(concept, /twelve structured concept briefs grouped into exactly four/);
  assert.match(concept, /Do not modify business code, shared contracts, `docs\/specs\/`, or the final Figma design/);
  assert.doesNotMatch(design, /Create exactly three materially different visual directions/);
  assert.match(design, /Protect the three locked characteristics/);
  assert.match(design, /Use Figma Make when the design contains a key interaction or state decision/);
  assert.match(frontend, /final approved Figma\/Make authority/);
  assert.match(backend, /final Figma\/Make approval/);
  assert.match(qa, /implementation Goal QA card's review-manifest reference/);
  assert.match(qa, /Permit at most two automated repair\/retest rounds/);
  assert.match(commander, /Own auxiliary-skill selection, card injection, scope, and validation as commander/);
  assert.match(frontend, /\$frontend-ui-engineering/);
  assert.match(frontend, /\$baseline-ui/);
  assert.match(frontend, /\$emil-design-eng/);
  assert.match(frontend, /Do not introduce Tailwind, Radix, shadcn/);
  assert.match(frontend, /Do not invoke Refero/);
  assert.match(backend, /Before reconnaissance, planning, tool calls, or writes, read the sibling `PITFALLS\.md` completely/);
  assert.match(design, /Before reconnaissance, planning, image generation, Figma, tool calls, or writes, read the sibling `PITFALLS\.md` completely/);
  assert.match(qa, /Before reconnaissance, validation, tool calls, or report writes, read the sibling `PITFALLS\.md` completely/);
});

test("总指挥自动审计收尾清理与产物晋升但不越权", async () => {
  const commander = await read(".agents/skills/p007-team-commander/SKILL.md");
  const manifest = await read(".agents/skills/p007-team-commander/assets/manifest-template.yaml");
  assert.match(commander, /^## Audit artifact promotion$/m);
  assert.match(commander, /durable specification/);
  assert.match(commander, /stable project-rule candidate/);
  assert.match(commander, /reusable-skill candidate/);
  assert.match(commander, /Do not automatically edit `AGENTS\.md`/);
  assert.match(commander, /^## Audit close-out cleanup$/m);
  assert.match(commander, /always run a read-only cleanup audit/);
  assert.match(commander, /deletion is not/);
  assert.match(commander, /Never force-remove/);
  assert.match(commander, /Do not remove the worktree that hosts the active commander turn/);
  for (const field of [
    "audit_completed", "durable_specs", "project_rule_candidates", "skill_candidates",
    "regression_tests_or_issue_candidates", "temporary_evidence", "authorization_required",
    "worktree_count_before", "worktree_count_after", "worktrees", "branches",
    "deferred_current_worktree",
  ]) {
    assert.match(manifest, new RegExp(`^\\s+${field}:`, "m"));
  }
});

test("七个技能显式调用且不保留仓库级 verify 工作流", async () => {
  const skills = [
    "p007-team-commander",
    "p007-product-manager",
    "p007-visual-concept-explorer",
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

test("根规则保留通用工程底线并声明七角色入口", async () => {
  const instructions = await read("AGENTS.md");
  assert.match(instructions, /P007 的七角色编队（总指挥＋六类专家）/);
  assert.match(instructions, /如需七角色编队须明确回复“编队执行”/);
  assert.match(instructions, /^## 通用工程底线$/m);
  assert.match(instructions, /最小改动：只修改完成任务必需的文件和逻辑/);
  assert.match(instructions, /优先复用：先复用现有组件、工具和架构/);
  assert.match(instructions, /不得绕过质量门禁：不得通过删除或放宽测试/);
  assert.match(instructions, /改动必须可验证：行为变化必须有测试或可复现证据/);
});
