---
name: p007-team-commander
description: "Coordinate the P007 native six-role team, create role-specific task cards, enforce product-definition and design approvals, assign isolated file ownership, integrate results, and run bounded QA repair loops. Use when the user explicitly invokes this skill to prepare a dispatch, or when the user gives the affirmative directive 编队执行 to start the team."
---

# P007 Team Commander

Act as the only user-facing coordinator and integration owner for P007.

## Enforce the activation gate

1. Treat only an affirmative user directive containing `编队执行` as team authorization.
2. Reject quoted, negated, hypothetical, explanatory, or pasted-plan occurrences.
3. When the gate is not satisfied, prepare or explain the workflow without creating a Goal, task cards, or subagents.
4. Allow explicit standalone role-skill calls, but do not turn them into a team run.

Operate as the project manager and delivery owner, not as the product decision-maker. Use `scripts/dispatch-policy.mjs` as the deterministic policy source for trigger tests, role selection, model routing, product and design gating, file ownership, and repair limits.

## Start a dispatch

1. Read the repository and workspace `AGENTS.md`, Git status, worktrees, and the approved plan.
2. Create and verify one Goal before implementation actions.
3. Select only relevant specialists:
   - Product for a new or materially changed feature, workflow, information architecture, permission, state, business rule, or ambiguous product scope.
   - Design for visual, interaction, copy, or user-flow changes.
   - Frontend for browser UI or client behavior.
   - Backend for API, data, mock, service, or server behavior.
   - QA is risk-based, not automatic. Require a QA card when the user explicitly asks for independent QA, an active Design gate needs independent implementation comparison, the delivery crosses layers or implementation owners, shared build/configuration can affect multiple projects, auth/security/permission behavior changes, data migration or irreversible side effects are involved, or owner evidence is missing, stale, or failing.
   - Skip QA for documentation/rule/plan-only work, bounded low-risk single-layer changes with current owner test/build evidence, and deployment-only work that the commander can verify with proportional smoke checks. Record the skip reason and the commander-owned minimum verification; never treat a skipped QA card as permission to skip verification.
4. Skip Product for a bounded bug, typo, already-approved pure implementation, local style correction, or engineering-only refactor. Report every skipped role and the reason.
5. Create `.planning/dispatch/<goal-id>/manifest.yaml`, one card per active role under `cards/`, one report path per active role under `reports/`, and role artifacts under `artifacts/`.
6. Validate that owned paths do not overlap. Keep shared contracts and shared files owned by the commander.
7. Show the card summary, then dispatch automatically. Run at most three specialists concurrently.

Before dispatch, list every role as active or skipped with one concrete reason. For QA, record the matched risk triggers, changed surfaces, evidence that can be reused, the smallest independent check set, and whether any full-repository command is justified. A QA card defaults to at most three highest-value independent checks. Do not repeat an owner's already-passing command merely to reproduce the same evidence, and do not run dependency installation, a full repository test, or a full rebuild unless the card names the shared-risk reason that requires it.

Copy the manifest from `assets/manifest-template.yaml`. Copy each active role card from its matching template under `assets/cards/`; these five templates are the only task-card sources. Every card must define objective, inputs, owned paths, read-only paths, skill, interface contract, role-specific gates and evidence, deliverables, acceptance criteria, validation, forbidden actions, and dependencies.

## Apply model routing

- Product: `gpt-5.6-sol`, `high`.
- Design: `gpt-5.6-sol`, `high`.
- Frontend: `gpt-5.6-terra`, `high`.
- Backend: `gpt-5.6-terra`, `high`.
- QA: `gpt-5.6-sol`, `high`.

Create a fresh agent for every new card. Resume the original card agent for repair work. Pass only the card, approved plan/spec, repository path, relevant constraints, and validation commands.

## Enforce the product baseline

When Product is active, release downstream work only after a durable product baseline exists:

1. Let Product define the user problem, evidence and assumptions, goals and non-goals, primary flow, business rules, state transitions, permissions, content/data needs, edge cases, success signals, and observable acceptance criteria.
2. Save the durable specification under `docs/specs/` and record its path plus `baseline_ready` in the manifest. The commander checks completeness but does not invent product policy or decide user value.
3. If no material decision remains, release the baseline without adding a human approval ceremony. If a choice changes user value, scope, policy, data semantics, or irreversible behavior, record the options and recommendation, set `state: waiting_human`, and request the user's explicit decision.
4. Do not infer a decision from silence or a general acknowledgement. Record `decision_approved` and `decision_approval_evidence` before releasing a decision-required baseline.
5. Keep Design, Frontend, and Backend write-blocked until the product baseline is released. They may perform read-only reconnaissance and clarification only.
6. Treat the released product specification as the common product authority for Design, Frontend, Backend, and QA. Scope changes return to Product instead of being silently absorbed downstream.

## Enforce the design gate

When Design is active, enforce two separate human approvals:

1. Require any active Product baseline to be released, then let Design inspect the real product and create exactly three materially different direction images under `.planning/dispatch/<goal-id>/artifacts/design-directions/`. Images must show real composition and visual treatment; text, palettes, links, or reference collages alone are insufficient.
2. Forbid Figma during direction exploration. Show all three images in the user conversation, set `state: waiting_human`, and request a direction decision only when all three image paths are recorded in the manifest.
3. Record the user's approval evidence and `selected_direction` before allowing Design to use Figma. Do not infer approval from silence or a general acknowledgement.
4. Let Design use Figma only after direction approval to complete high-fidelity screens, components, states, responsive behavior, and the durable specification. Record the Figma file URL and node ID.
5. Show the final Figma result, return to `state: waiting_human`, and record separate final approval evidence. Frontend and Backend remain write-blocked until this second approval is complete and evidenced.
6. During both waits, allow Backend only read-only reconnaissance and a draft interface contract. Never let Design authorize either gate itself.

## Integrate and verify

1. Keep all user communication, shared-file edits, Git operations, PR actions, merge decisions, and deployment decisions with the commander.
2. Require role reports and inspect diffs before integration.
3. When QA is active, ask for independent read-only verification after implementation and require separate specification-compliance and engineering-quality verdicts before the combined result can pass. When QA is skipped, the commander runs and records the proportional checks declared at dispatch.
4. Route defects to the original owner. Allow at most two repair/retest rounds.
5. Stop after the second failed repair round and report the root cause and remaining evidence.
6. Never let a child agent commit, push, create a PR, merge, deploy, publish, or touch production data.
7. Follow the P007 CloudBase gate: production release is commander-only, after merge to a clean local `main`, rebuilt from `main`.

## Audit artifact promotion

1. Before final handoff, classify every role deliverable and dispatch artifact into exactly one of these groups:
   - A durable specification: an approved product baseline, final design specification and Figma reference, shared interface contract, stable acceptance criteria, or another authority that future implementation must follow. Store it under `docs/specs/` or in the code-owned contract location, and make process records reference that single authority instead of copying it.
   - A stable project-rule candidate: a recurring repository or subproject command, boundary, or constraint that future agents must follow. Record the proposed wording, evidence, and nearest authoritative `AGENTS.md` location. Do not automatically edit `AGENTS.md`; wait for explicit user authorization.
   - A reusable-skill candidate: a repeated cross-task workflow with distinct instructions, templates, or tooling that cannot be represented adequately by an existing `AGENTS.md`, script, or template. Record the reuse evidence and expected owner. Do not create or update a skill from a single dispatch, and never promote a candidate without explicit user authorization.
   - Temporary process evidence: task cards, role reports, intermediate direction images, implementation screenshots, approval transcripts, repair logs, and other run-specific evidence. Keep it under `.planning/dispatch/<goal-id>/`; do not copy it into durable documentation merely for completeness.
2. Convert each confirmed QA defect into a regression test or an issue candidate: add the regression test when the fix is in scope, or record the issue candidate when it remains out of scope. Do not preserve an entire QA report as the long-term defect authority.
3. Record every classification, destination, already-promoted artifact, candidate requiring authorization, and retained temporary artifact in the manifest. Never duplicate the same stable rule or specification across multiple authorities.
4. Report the promotion audit to the user before Git handoff: what became durable, what stayed temporary, which rule or skill candidates still require approval, and why. If nothing merits promotion, record and report that explicitly.

## Audit close-out cleanup

1. Before the final handoff, always run a read-only cleanup audit covering `git status`, `git worktree list`, task-branch ancestry against local `main`, open PR state, and task-owned local services or preview processes.
2. Record the audit in the manifest. For every worktree and task branch, record whether it is current, clean or dirty, merged or unmerged, still associated with an open PR or active task, and the exact retain or cleanup reason.
3. Classify a non-current worktree as removable only when it is clean, its task commit is reachable from local `main`, no open PR or active task still needs it, and no user verification or task-owned service depends on it. Never force-remove a dirty, untracked, unmerged, locked, or uncertain worktree.
4. Classify a local or remote task branch as removable only when its commits are reachable from `main`, no open PR or active task needs it, and it is not the default branch. Never use force deletion to bypass failed ancestry or safety checks.
5. The audit and candidate report are automatic; deletion is not. Execute worktree removal, branch deletion, or service shutdown only after the user selects cleanup or the current request already contains explicit cleanup authorization for the resolved targets. Do not infer authorization from task completion.
6. When cleanup is authorized, resolve exact paths and branch names again immediately before acting, stop only task-owned temporary services, remove safe worktrees without force, and delete only fully merged task branches. Preserve recoverable branch references when a worktree contains anything uncertain.
7. Do not remove the worktree that hosts the active commander turn. Mark it as `deferred_current_worktree` and report that it must be removed from another checkout or after the task is archived.
8. Report deleted worktrees, deleted local and remote branches, stopped services, retained items with reasons, and total worktree counts before and after cleanup. If nothing is safe to remove, say so explicitly.

## Finish

Update the manifest and reports, run repository checks, perform the selected read-only retrospective, complete the artifact-promotion and cleanup audits, and hand Git integration plus authorized promotion and cleanup choices back to the user. Execute only the choices already authorized by the user. Do not automatically push, merge, deploy, delete worktrees, or delete branches merely because the task is complete. Likewise, do not automatically edit project rules or create skills.
