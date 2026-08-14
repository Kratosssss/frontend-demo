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
  design: { model: "gpt-5.6-sol", reasoningEffort: "high" },
  frontend: { model: "gpt-5.6-terra", reasoningEffort: "high" },
  backend: { model: "gpt-5.6-terra", reasoningEffort: "high" },
  qa: { model: "gpt-5.6-sol", reasoningEffort: "high" },
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

export function selectSpecialists({ experience = false, frontend = false, backend = false, delivery = true } = {}) {
  const roles = [];
  if (experience) roles.push("design");
  if (frontend) roles.push("frontend");
  if (backend) roles.push("backend");
  if (delivery) roles.push("qa");
  return roles;
}

export function roleMayWrite({ role, designRequired = false, designApproved = false } = {}) {
  if (role === "qa") return false;
  if (role === "design") return true;
  if (designRequired && !designApproved && (role === "frontend" || role === "backend")) return false;
  return role === "frontend" || role === "backend";
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

export function validateTaskCard(markdown) {
  const required = [
    "目标", "输入", "拥有路径", "只读路径", "技能", "接口契约",
    "交付物", "验收标准", "验证命令", "禁止事项", "阻塞关系",
  ];
  return required.filter((heading) => !new RegExp(`^## ${heading}$`, "m").test(markdown));
}
