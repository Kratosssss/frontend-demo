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
  canReleaseDesignSelection,
  canReleaseImplementation,
  canReleaseProductBaseline,
  canRequestDesignSelection,
  isAffirmativeTeamTrigger,
  mayCreateFigmaFirstDraft,
  mayCreateImplementationGoal,
  mayRefineDesignInFigma,
  mayStartRepair,
  requiresIndependentQa,
  roleMayWrite,
  selectSpecialists,
  validateTaskCard,
} from "../.agents/skills/p007-team-commander/scripts/dispatch-policy.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFile(resolve(root, path), "utf8");

const directionFamilies = ["editorial", "cinematic", "systems", "tactile"].map((family) => ({
  id: family,
  family,
  title: `${family} direction family`,
}));
const firstDraftEvidence = {
  directionFamilies,
  firstDraftFileUrl: "https://www.figma.com/design/design-dispatch-file",
  firstDraftNodeIds: ["10:1", "10:2", "10:3", "10:4"],
  firstDraftScreenshotPaths: ["a.png", "b.png", "c.png", "d.png"],
};
const approvedDirection = {
  ...firstDraftEvidence,
  directionApproved: true,
  directionApprovalEvidence: "用户选择 editorial 方向",
  selectedFamilyId: "editorial",
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

test("design 开关启用设计总监，QA 仍由风险触发", () => {
  assert.deepEqual(
    selectSpecialists({ product: true, design: true, frontend: true }),
    ["product", "design", "frontend"],
  );
  assert.deepEqual(selectSpecialists({ backend: true }), ["backend"]);
  assert.deepEqual(selectSpecialists({ backend: true, qaRequired: true }), ["backend", "qa"]);
  assert.equal(requiresIndependentQa({}), false);
  assert.equal(requiresIndependentQa({ explicitRequest: true }), true);
  assert.equal(requiresIndependentQa({ crossLayerOrMultipleOwners: true }), true);
  assert.equal(requiresIndependentQa({ sharedBuildOrConfig: true }), true);
  assert.equal(requiresIndependentQa({ securityOrPermission: true }), true);
  assert.equal(requiresIndependentQa({ dataOrIrreversibleSideEffect: true }), true);
  assert.equal(requiresIndependentQa({ ownerEvidenceInsufficient: true }), true);
  assert.equal(MAX_PARALLEL_SPECIALISTS, 3);
  assert.deepEqual(ROLE_PROFILES.design, { model: "gpt-5.6-sol", reasoningEffort: "high" });
  assert.deepEqual(ROLE_PROFILES.qa, { model: "gpt-5.6-sol", reasoningEffort: "medium" });
  assert.deepEqual(DISPATCH_STATES, ["queued", "running", "waiting_human", "blocked", "passed", "failed"]);
});

test("产品规格基线按需启用且先于设计探索", () => {
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
  assert.equal(roleMayWrite({ role: "design", productRequired: true, designRequired: true }), false);
  assert.equal(roleMayWrite({ role: "design", ...readyBaseline, designRequired: true }), false);
  assert.equal(mayCreateFigmaFirstDraft({ productRequired: true, designRequired: true }), false);
  assert.equal(mayCreateFigmaFirstDraft({ ...readyBaseline, designRequired: true }), true);
  assert.equal(canReleaseImplementation({ productRequired: true, designRequired: false }), false);
  assert.equal(canReleaseImplementation({ ...readyBaseline, designRequired: false }), true);
});

test("必须有 4 个创意方向族与 4 个实际 Figma First Draft 才能请求选择", () => {
  assert.equal(canRequestDesignSelection({
    ...firstDraftEvidence,
    directionFamilies: directionFamilies.slice(0, 3),
  }), false);
  assert.equal(canRequestDesignSelection({
    ...firstDraftEvidence,
    firstDraftNodeIds: firstDraftEvidence.firstDraftNodeIds.slice(0, 3),
  }), false);
  assert.equal(canRequestDesignSelection({
    ...firstDraftEvidence,
    firstDraftScreenshotPaths: ["a.png", "a.png", "c.png", "d.png"],
  }), false);
  assert.equal(canRequestDesignSelection(firstDraftEvidence), true);
  assert.equal(canReleaseDesignSelection({
    ...approvedDirection,
    lockedCharacteristics: { ...approvedDirection.lockedCharacteristics, visualMotif: "" },
  }), false);
  assert.equal(canReleaseDesignSelection(approvedDirection), true);
});

test("选择前设计精修和实现阻塞，最终批准前实现仍阻塞", () => {
  assert.equal(roleMayWrite({ role: "design", designRequired: true }), false);
  assert.equal(mayRefineDesignInFigma({ designRequired: true, ...firstDraftEvidence }), false);
  assert.equal(mayRefineDesignInFigma({ designRequired: true, ...approvedDirection }), true);
  assert.equal(roleMayWrite({ role: "design", designRequired: true, ...approvedDirection }), true);
  assert.equal(roleMayWrite({ role: "frontend", designRequired: true, ...approvedDirection }), false);
  assert.equal(canReleaseImplementation({
    designRequired: true,
    ...approvedDirection,
    finalFigmaFileUrl: "https://www.figma.com/design/final",
    finalFigmaNodeId: "20:1",
    figmaMakeSkippedReason: "静态信息页，无关键交互状态",
    finalDesignApproved: false,
  }), false);
  assert.equal(mayCreateImplementationGoal({
    designRequired: true,
    ...approvedDirection,
    finalFigmaFileUrl: "https://www.figma.com/design/final",
    finalFigmaNodeId: "20:1",
    figmaMakeSkippedReason: "静态信息页，无关键交互状态",
    finalDesignApproved: false,
  }), false);

  const approvedStaticDesign = {
    designRequired: true,
    ...approvedDirection,
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

test("任务卡路径必须独占且五套专家模板字段完整", async () => {
  assert.equal(assertExclusiveOwnership([
    { role: "design", ownedPaths: [".planning/dispatch/g/artifacts/figma-first-drafts", ".planning/dispatch/g/artifacts/final-design", "docs/specs/design.md"] },
    { role: "frontend", ownedPaths: ["hrms/src"] },
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

  const design = await read(".agents/skills/p007-team-commander/assets/cards/design-card-template.md");
  const frontend = await read(".agents/skills/p007-team-commander/assets/cards/frontend-card-template.md");
  const backend = await read(".agents/skills/p007-team-commander/assets/cards/backend-card-template.md");
  const qa = await read(".agents/skills/p007-team-commander/assets/cards/qa-card-template.md");
  assert.doesNotMatch(design, /^## 三个视觉方向$/m);
  assert.match(design, /选择证据或任一锁定特征缺失时保持只读/);
  assert.match(design, /^## 四个 Figma First Draft$/m);
  assert.match(design, /不得静默改由 Sol 手工生成方向/);
  assert.match(design, /Figma AI 与 Make 精修/);
  assert.match(frontend, /三项锁定特征/);
  assert.match(frontend, /人工验收清单/);
  assert.match(backend, /方向选择、三项锁定特征和最终 Figma\/Make 批准/);
  assert.match(qa, /前端代码验收/);
  assert.match(qa, /computer-use/);
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
  await assert.rejects(access(resolve(root, ".agents/skills/p007-team-commander/assets/cards/concept-card-template.md")));
});

test("视觉审查与实施 Goal 使用分离 manifest，并保留审批证据链", async () => {
  const manifest = await read(".agents/skills/p007-team-commander/assets/manifest-template.yaml");
  const reviewManifest = await read(".agents/skills/p007-team-commander/assets/review-manifest-template.yaml");
  for (const field of [
    "enable_evidence", "direction_families", "prompt_package_path", "first_draft_file_url",
    "first_draft_node_ids", "first_draft_screenshot_paths", "direction_approved",
    "direction_approval_evidence", "selected_family_id", "locked_characteristics",
    "composition", "visual_motif", "color_or_typography", "final_figma_file_url",
    "final_figma_node_id",
    "figma_make_required", "figma_make_url", "figma_make_skipped_reason",
    "final_approved", "final_approval_evidence", "requested", "effective",
    "fallback_used", "fallback_reason",
  ]) {
    assert.match(reviewManifest, new RegExp(`^\\s+${field}:`, "m"));
  }
  assert.match(reviewManifest, /^review_id: "<review-id>"$/m);
  assert.doesNotMatch(reviewManifest, /^goal_id:/m);
  assert.match(reviewManifest, /^design:\n  required: false$/m);
  assert.match(manifest, /^goal_id: "<goal-id>"$/m);
  assert.match(manifest, /^review_manifest_path: ".planning\/review\/<review-id>\/manifest.yaml"$/m);
  assert.match(manifest, /^review_approval_evidence_ref:/m);
  assert.match(manifest, /^deferred_roles:/m);
  assert.match(manifest, /model: gpt-5\.6-sol, reasoning_effort: medium/);
  assert.match(manifest, /^qa:\n  required: false$/m);
  assert.match(manifest, /^frontend_acceptance:\n  mode: manual$/m);
});

test("总指挥、设计总监、前端与 QA 的职责边界已拆分", async () => {
  const commander = await read(".agents/skills/p007-team-commander/SKILL.md");
  const design = await read(".agents/skills/p007-product-designer/SKILL.md");
  const frontend = await read(".agents/skills/p007-frontend-engineer/SKILL.md");
  const backend = await read(".agents/skills/p007-backend-engineer/SKILL.md");
  const qa = await read(".agents/skills/p007-qa-engineer/SKILL.md");
  assert.match(commander, /原生六角色团队/);
  assert.match(commander, /scripts\/dispatch-policy\.mjs/);
  assert.match(commander, /恰好一个实施 Goal/);
  assert.match(commander, /四个实际 Figma First Draft 节点\/截图/);
  assert.match(commander, /绝不静默用 Sol 手工设计替代 Figma AI/);
  assert.match(commander, /评审阶段不创建 Goal/);
  assert.match(commander, /最多两轮修复\/重测/);
  assert.match(commander, /只读清理审计/);
  assert.match(commander, /辅助技能只按卡片声明加载/);
  assert.match(commander, /方向选定前 Design 保持只读/);
  assert.match(commander, /设计门禁默认关闭/);
  assert.match(commander, /询问用户是否启用设计/);
  assert.match(commander, /qa\.required: false/);
  assert.match(commander, /前端范围 QA 只检查代码问题/);
  assert.match(commander, /frontend_acceptance/);
  assert.match(commander, /不自动编辑 `AGENTS\.md`/);
  assert.doesNotMatch(design, /三个视觉方向/);
  assert.match(design, /保护.*锁定特征/);
  assert.match(design, /使用 Figma Make/);
  assert.match(design, /四个可编辑的 First Draft 画面/);
  assert.match(frontend, /最终获批 Figma\/Make 权威/);
  assert.match(frontend, /人工验收清单/);
  assert.match(backend, /最终 Figma\/Make 批准/);
  assert.match(qa, /review-manifest 引用/);
  assert.match(qa, /两轮自动化修复\/重测/);
  assert.match(qa, /前端范围只做代码级验收/);
  assert.match(frontend, /\$frontend-ui-engineering/);
  assert.match(frontend, /\$baseline-ui/);
  assert.match(frontend, /\$emil-design-eng/);
  assert.match(frontend, /引入 Tailwind、Radix、shadcn/);
  assert.match(frontend, /不要调用 Refero/);
  assert.match(backend, /侦察、规划、工具调用或写入之前，完整阅读同级 `PITFALLS\.md`/);
  assert.match(design, /侦察、规划、图像生成、Figma、工具调用或写入之前，完整阅读同级 `PITFALLS\.md`/);
  assert.match(qa, /侦察、验证、工具调用或报告写入之前，完整阅读同级 `PITFALLS\.md`/);
});

test("总指挥自动审计收尾清理与产物晋升但不越权", async () => {
  const commander = await read(".agents/skills/p007-team-commander/SKILL.md");
  const manifest = await read(".agents/skills/p007-team-commander/assets/manifest-template.yaml");
  assert.match(commander, /收尾审计/);
  assert.match(commander, /产物晋升审计/);
  assert.match(commander, /持久规范/);
  assert.match(commander, /规则候选/);
  assert.match(commander, /技能候选/);
  assert.match(commander, /只读清理审计/);
  assert.match(commander, /不自动编辑 `AGENTS\.md`/);
  assert.match(commander, /绝不强制移除/);
  assert.match(manifest, /^frontend_acceptance:/m);
  for (const field of [
    "audit_completed", "durable_specs", "project_rule_candidates", "skill_candidates",
    "regression_tests_or_issue_candidates", "temporary_evidence", "authorization_required",
    "worktree_count_before", "worktree_count_after", "worktrees", "branches",
    "deferred_current_worktree", "mode", "checklist", "evidence", "accepted",
    "acceptance_evidence",
  ]) {
    assert.match(manifest, new RegExp(`^\\s+${field}:`, "m"));
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
  await assert.rejects(access(resolve(root, ".agents/skills/p007-visual-concept-explorer/SKILL.md")));
  await assert.rejects(access(resolve(root, ".github/workflows/project-verify.yml")));
  await assert.rejects(access(resolve(root, "WORKFLOW.md")));
  await assert.rejects(access(resolve(root, "scripts/validate-symphony-workflow.mjs")));
});

test("根规则保留通用工程底线并声明六角色入口", async () => {
  const instructions = await read("AGENTS.md");
  assert.match(instructions, /P007 的六角色编队（总指挥＋五类专家）/);
  assert.match(instructions, /如需六角色编队须明确回复“编队执行”/);
  assert.match(instructions, /^## 通用工程底线$/m);
  assert.match(instructions, /最小改动：只修改完成任务必需的文件和逻辑/);
  assert.match(instructions, /优先复用：先复用现有组件、工具和架构/);
  assert.match(instructions, /不得绕过质量门禁：不得通过删除或放宽测试/);
  assert.match(instructions, /改动必须可验证：行为变化必须有测试或可复现证据/);
});
