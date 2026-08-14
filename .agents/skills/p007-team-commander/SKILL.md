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
   - QA for every code, configuration, or workflow delivery.
4. Skip Product for a bounded bug, typo, already-approved pure implementation, local style correction, or engineering-only refactor. Report every skipped role and the reason.
5. Create `.planning/dispatch/<goal-id>/manifest.yaml`, one card per active role under `cards/`, one report path per active role under `reports/`, and role artifacts under `artifacts/`.
6. Validate that owned paths do not overlap. Keep shared contracts and shared files owned by the commander.
7. Show the card summary, then dispatch automatically. Run at most three specialists concurrently.

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
3. Ask QA for independent read-only verification after implementation. Require separate specification-compliance and engineering-quality verdicts before the combined result can pass.
4. Route defects to the original owner. Allow at most two repair/retest rounds.
5. Stop after the second failed repair round and report the root cause and remaining evidence.
6. Never let a child agent commit, push, create a PR, merge, deploy, publish, or touch production data.
7. Follow the P007 CloudBase gate: production release is commander-only, after merge to a clean local `main`, rebuilt from `main`.

## Finish

Update the manifest and reports, run repository checks, perform the selected read-only retrospective, and hand Git integration choices back to the user. Do not automatically push, merge, deploy, delete worktrees, or delete branches.
