export const TEAM_TRIGGER = "编队执行";
export const MAX_PARALLEL_SPECIALISTS = 3;
export const MAX_REPAIR_ROUNDS = 2;
export const DISPATCH_STATES = Object.freeze([
  "queued",
  "running",
  "waiting_human",
  "blocked",
  "passed",
  "failed",
]);

export const ROLE_PROFILES = Object.freeze({
  product: { model: "gpt-5.6-sol", reasoningEffort: "high" },
  design: { model: "gpt-5.6-sol", reasoningEffort: "high" },
  frontend: { model: "gpt-5.6-terra", reasoningEffort: "high" },
  backend: { model: "gpt-5.6-terra", reasoningEffort: "high" },
  qa: { model: "gpt-5.6-sol", reasoningEffort: "medium" },
});

export const CARD_TEMPLATE_FILES = Object.freeze({
  product: "assets/cards/product-card-template.md",
  design: "assets/cards/design-card-template.md",
  frontend: "assets/cards/frontend-card-template.md",
  backend: "assets/cards/backend-card-template.md",
  qa: "assets/cards/qa-card-template.md",
});

const quotedTrigger = /[“”"'`《》「」『』][^\n]{0,24}编队执行[^\n]{0,24}[“”"'`《》「」『』]/;
const nonDirectiveContext = /(不(?:要|用|能|会|是)?|别|无需|尚未|没说|如果|假如|等到|讨论|引用|解释|什么意思|为什么|只有.+才|的时候|再说|之前再|以后再)/;

const nonEmpty = (value) => typeof value === "string" && value.trim().length > 0;
const exactCapability = (capabilities, model, reasoningEffort) => capabilities.some((item) => (
  item?.model === model && item?.reasoningEffort === reasoningEffort
));

export function isAffirmativeTeamTrigger(input) {
  if (typeof input !== "string") return false;
  const text = input.trim();
  if (!text.includes(TEAM_TRIGGER) || text.length > 96) return false;
  if (quotedTrigger.test(text) || nonDirectiveContext.test(text)) return false;
  if (/[?？]/.test(text)) return false;
  return true;
}

export function requiresIndependentQa({
  explicitRequest = false,
  crossLayerOrMultipleOwners = false,
  sharedBuildOrConfig = false,
  securityOrPermission = false,
  dataOrIrreversibleSideEffect = false,
  ownerEvidenceInsufficient = false,
} = {}) {
  return [
    explicitRequest,
    crossLayerOrMultipleOwners,
    sharedBuildOrConfig,
    securityOrPermission,
    dataOrIrreversibleSideEffect,
    ownerEvidenceInsufficient,
  ].some(Boolean);
}

export function selectSpecialists({ product = false, design = false, frontend = false, backend = false, qaRequired = false } = {}) {
  const roles = [];
  if (product) roles.push("product");
  if (design) roles.push("design");
  if (frontend) roles.push("frontend");
  if (backend) roles.push("backend");
  if (qaRequired) roles.push("qa");
  return roles;
}

export function resolveRoleProfile(role, availableCapabilities) {
  const requested = ROLE_PROFILES[role];
  if (!requested) throw new Error(`unknown role profile: ${role}`);

  const base = {
    requestedModel: requested.model,
    requestedReasoningEffort: requested.reasoningEffort,
  };
  if (!Array.isArray(availableCapabilities) || availableCapabilities.length === 0
    || exactCapability(availableCapabilities, requested.model, requested.reasoningEffort)) {
    return {
      ...base,
      effectiveModel: requested.model,
      effectiveReasoningEffort: requested.reasoningEffort,
      fallbackUsed: false,
      fallbackReason: "",
    };
  }

  if (requested.fallback
    && exactCapability(availableCapabilities, requested.fallback.model, requested.fallback.reasoningEffort)) {
    return {
      ...base,
      effectiveModel: requested.fallback.model,
      effectiveReasoningEffort: requested.fallback.reasoningEffort,
      fallbackUsed: true,
      fallbackReason: `${requested.model} + ${requested.reasoningEffort} is unavailable in the current dispatch interface`,
    };
  }

  throw new Error(`no supported capability for role: ${role}`);
}

export function canReleaseProductBaseline({
  productRequired = false,
  productSpecPath = "",
  productBaselineReady = false,
  productDecisionRequired = false,
  productDecisionApproved = false,
  productDecisionApprovalEvidence = "",
} = {}) {
  if (!productRequired) return true;
  if (!nonEmpty(productSpecPath) || !productBaselineReady) return false;
  if (!productDecisionRequired) return true;
  return productDecisionApproved && nonEmpty(productDecisionApprovalEvidence);
}

export function canRequestDesignSelection({
  directionFamilies = [],
  firstDraftFileUrl = "",
  firstDraftNodeIds = [],
  firstDraftScreenshotPaths = [],
} = {}) {
  if (!Array.isArray(directionFamilies) || directionFamilies.length !== 4) return false;
  if (!directionFamilies.every((family) => (
    family && nonEmpty(family.id) && nonEmpty(family.family) && nonEmpty(family.title)
  ))) return false;
  const ids = new Set(directionFamilies.map((family) => family.id));
  if (ids.size !== 4) return false;
  return nonEmpty(firstDraftFileUrl)
    && Array.isArray(firstDraftNodeIds)
    && firstDraftNodeIds.length === 4
    && firstDraftNodeIds.every(nonEmpty)
    && new Set(firstDraftNodeIds).size === 4
    && Array.isArray(firstDraftScreenshotPaths)
    && firstDraftScreenshotPaths.length === 4
    && firstDraftScreenshotPaths.every(nonEmpty)
    && new Set(firstDraftScreenshotPaths).size === 4;
}

export function canReleaseDesignSelection({
  directionFamilies = [],
  firstDraftFileUrl = "",
  firstDraftNodeIds = [],
  firstDraftScreenshotPaths = [],
  directionApproved = false,
  directionApprovalEvidence = "",
  selectedFamilyId = "",
  lockedCharacteristics = {},
} = {}) {
  if (!canRequestDesignSelection({
    directionFamilies,
    firstDraftFileUrl,
    firstDraftNodeIds,
    firstDraftScreenshotPaths,
  })) return false;
  if (!directionApproved || !nonEmpty(directionApprovalEvidence) || !nonEmpty(selectedFamilyId)) return false;
  if (!directionFamilies.some((family) => family.id === selectedFamilyId)) return false;
  return nonEmpty(lockedCharacteristics.composition)
    && nonEmpty(lockedCharacteristics.visualMotif)
    && nonEmpty(lockedCharacteristics.colorOrTypography);
}

export function mayCreateFigmaFirstDraft(options = {}) {
  return canReleaseProductBaseline(options) && options.designRequired === true;
}

export function mayRefineDesignInFigma(options = {}) {
  return canReleaseProductBaseline(options)
    && options.designRequired === true
    && canReleaseDesignSelection(options);
}

export function canReleaseImplementation({
  productRequired = false,
  productSpecPath = "",
  productBaselineReady = false,
  productDecisionRequired = false,
  productDecisionApproved = false,
  productDecisionApprovalEvidence = "",
  designRequired = false,
  finalFigmaFileUrl = "",
  finalFigmaNodeId = "",
  figmaMakeRequired = false,
  figmaMakeUrl = "",
  figmaMakeSkippedReason = "",
  finalDesignApproved = false,
  finalDesignApprovalEvidence = "",
  ...designEvidence
} = {}) {
  if (!canReleaseProductBaseline({
    productRequired,
    productSpecPath,
    productBaselineReady,
    productDecisionRequired,
    productDecisionApproved,
    productDecisionApprovalEvidence,
  })) return false;
  if (!designRequired) return true;
  if (!canReleaseDesignSelection(designEvidence)) return false;
  const makeReady = figmaMakeRequired ? nonEmpty(figmaMakeUrl) : nonEmpty(figmaMakeSkippedReason);
  return nonEmpty(finalFigmaFileUrl)
    && nonEmpty(finalFigmaNodeId)
    && makeReady
    && finalDesignApproved
    && nonEmpty(finalDesignApprovalEvidence);
}

export function mayCreateImplementationGoal(options = {}) {
  return canReleaseImplementation(options);
}

export function roleMayWrite(options = {}) {
  const { role, designRequired = false } = options;
  if (role === "qa") return false;
  if (role === "product") return true;
  if (!canReleaseProductBaseline(options)) return false;
  if (role === "design") return designRequired && canReleaseDesignSelection(options);
  if (role === "frontend" || role === "backend") return canReleaseImplementation(options);
  return false;
}

export function mayStartRepair(completedRepairRounds) {
  return Number.isInteger(completedRepairRounds)
    && completedRepairRounds >= 0
    && completedRepairRounds < MAX_REPAIR_ROUNDS;
}

export function assertExclusiveOwnership(cards) {
  const owners = new Map();
  for (const card of cards) {
    for (const path of card.ownedPaths ?? []) {
      const normalized = String(path).replace(/\/$/, "");
      for (const [ownedPath, owner] of owners) {
        const overlaps = normalized === ownedPath
          || normalized.startsWith(`${ownedPath}/`)
          || ownedPath.startsWith(`${normalized}/`);
        if (overlaps) throw new Error(`owned path overlap: ${owner} and ${card.role}: ${ownedPath} <> ${normalized}`);
      }
      owners.set(normalized, card.role);
    }
  }
  return true;
}

export function validateTaskCard(markdown, role) {
  const commonRequired = [
    "目标", "输入", "拥有路径", "只读路径", "技能", "接口契约",
    "交付物", "验收标准", "验证命令", "禁止事项", "阻塞关系",
  ];
  const roleRequired = {
    product: ["用户问题与证据", "范围与非目标", "用户流程与产品规则", "边界情况", "重大产品决策", "产品规格基线", "创意方向族"],
    design: ["设计目标与项目人格", "视觉侦察", "Refero 研究与参考锁定", "Demo 资产政策", "反公式化清单", "获选方向与锁定特征", "四个 Figma First Draft", "Figma AI 与 Make 精修", "最终人工批准"],
    frontend: ["最终设计输入", "技能冲突优先级", "实现边界", "视觉还原证据", "人工验收清单"],
    backend: ["设计门禁期间", "数据与副作用边界"],
    qa: ["风险与范围", "批准证据核验", "前端代码验收", "独立验收边界", "规格符合性验收", "工程质量验收"],
  };
  const required = [...commonRequired, ...(roleRequired[role] ?? [])];
  return required.filter((heading) => !new RegExp(`^## ${heading}$`, "m").test(markdown));
}
