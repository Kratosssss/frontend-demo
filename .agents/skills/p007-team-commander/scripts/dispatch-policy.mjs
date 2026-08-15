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
  qa: { model: "gpt-5.6-sol", reasoningEffort: "high" },
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

export function isAffirmativeTeamTrigger(input) {
  if (typeof input !== "string") return false;
  const text = input.trim();
  if (!text.includes(TEAM_TRIGGER) || text.length > 96) return false;
  if (quotedTrigger.test(text) || nonDirectiveContext.test(text)) return false;
  if (/[?？]/.test(text)) return false;
  return true;
}

export function selectSpecialists({ product = false, experience = false, frontend = false, backend = false, delivery = true } = {}) {
  const roles = [];
  if (product) roles.push("product");
  if (experience) roles.push("design");
  if (frontend) roles.push("frontend");
  if (backend) roles.push("backend");
  if (delivery) roles.push("qa");
  return roles;
}

export function roleMayWrite({
  role,
  productRequired = false,
  productSpecPath = "",
  productBaselineReady = false,
  productDecisionRequired = false,
  productDecisionApproved = false,
  productDecisionApprovalEvidence = "",
  designRequired = false,
  directionApproved = false,
  figmaApproved = false,
} = {}) {
  if (role === "qa") return false;
  if (role === "product") return true;
  if (!canReleaseProductBaseline({
    productRequired,
    productSpecPath,
    productBaselineReady,
    productDecisionRequired,
    productDecisionApproved,
    productDecisionApprovalEvidence,
  })) return false;
  if (role === "design") return true;
  if (designRequired && (!directionApproved || !figmaApproved) && (role === "frontend" || role === "backend")) return false;
  return role === "frontend" || role === "backend";
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
  if (typeof productSpecPath !== "string" || productSpecPath.trim().length === 0 || !productBaselineReady) return false;
  if (!productDecisionRequired) return true;
  return productDecisionApproved
    && typeof productDecisionApprovalEvidence === "string"
    && productDecisionApprovalEvidence.trim().length > 0;
}

export function mayUseFigma(options = {}) {
  const { designRequired = false, directionApproved = false } = options;
  return canReleaseProductBaseline(options) && designRequired && directionApproved;
}

export function canRequestDirectionApproval({ directionImages = [] } = {}) {
  return Array.isArray(directionImages)
    && directionImages.length === 3
    && directionImages.every((path) => typeof path === "string" && path.trim().length > 0);
}

export function canAdvanceToFigma({
  directionImages = [],
  directionApproved = false,
  directionApprovalEvidence = "",
  selectedDirection = "",
} = {}) {
  return canRequestDirectionApproval({ directionImages })
    && directionApproved
    && typeof directionApprovalEvidence === "string"
    && directionApprovalEvidence.trim().length > 0
    && typeof selectedDirection === "string"
    && selectedDirection.trim().length > 0;
}

export function canReleaseImplementation({
  productRequired = false,
  productSpecPath = "",
  productBaselineReady = false,
  productDecisionRequired = false,
  productDecisionApproved = false,
  productDecisionApprovalEvidence = "",
  designRequired = false,
  directionImages = [],
  directionApproved = false,
  directionApprovalEvidence = "",
  selectedDirection = "",
  figmaFileUrl = "",
  figmaNodeId = "",
  figmaApproved = false,
  figmaApprovalEvidence = "",
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
  return canAdvanceToFigma({
    directionImages,
    directionApproved,
    directionApprovalEvidence,
    selectedDirection,
  })
    && typeof figmaFileUrl === "string"
    && figmaFileUrl.trim().length > 0
    && typeof figmaNodeId === "string"
    && figmaNodeId.trim().length > 0
    && figmaApproved
    && typeof figmaApprovalEvidence === "string"
    && figmaApprovalEvidence.trim().length > 0;
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
    product: ["用户问题与证据", "范围与非目标", "用户流程与产品规则", "边界情况", "重大产品决策", "产品规格基线"],
    design: ["设计目标与项目人格", "视觉侦察", "Refero 研究与参考锁定", "Demo 资产政策", "反公式化清单", "三个视觉方向", "方向图片证据", "Figma 完善", "两次人工批准"],
    frontend: ["最终设计输入", "技能冲突优先级", "实现边界", "视觉还原证据"],
    backend: ["设计门禁期间", "数据与副作用边界"],
    qa: ["批准证据核验", "视觉与反公式化验收", "独立验收边界", "规格符合性验收", "工程质量验收"],
  };
  const required = [...commonRequired, ...(roleRequired[role] ?? [])];
  return required.filter((heading) => !new RegExp(`^## ${heading}$`, "m").test(markdown));
}
