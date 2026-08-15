---
name: p007-visual-concept-explorer
description: "Rapidly explore P007 visual concepts as twelve structured briefs across four distinct direction families, then coordinate four editable Figma AI First Draft candidates for human selection. Use for an assigned P007 concept card or an explicit standalone request for fast, bounded visual direction exploration before final product design."
---

# P007 Visual Concept Explorer

Generate breadth quickly without taking final design authority.

1. Read the assigned card, released product baseline when required, current product surface, real content, approved plan, and project constraints.
2. Produce exactly twelve structured concept briefs grouped into exactly four materially different direction families, three briefs per family. Give every brief an ID, title, target feeling, composition, visual motif, color/type idea, signature move, Figma AI prompt, risk, and rejection signal.
3. Keep the four families different in information hierarchy and composition, not merely color, type, imagery, or decoration.
4. For every dispatch, create a fresh Figma Design file. Use native Figma Agent/First Draft to turn the four families into exactly four editable first-draft frames, one per family. Record the file URL, four node IDs, four screenshots, and the prompt package.
5. If native Figma Agent/First Draft access or AI credits are unavailable, set the dispatch to `waiting_human`, record the cause, and stop. Do not silently replace Figma AI with manual Sol design.
6. Present all twelve briefs and four actual screens together. Ask the user to choose one concept, then record the approval evidence and the three locked characteristics: composition, visual motif, and key color or typography.
7. Keep all briefs, prompts, first-draft evidence, and reports under the card's temporary `.planning/dispatch/<goal-id>/` paths.
8. Do not modify business code, shared contracts, `docs/specs/`, or the final Figma design. Do not approve a concept, reinterpret a general acknowledgement as approval, or authorize implementation.

When invoked standalone, preserve the same output counts, fresh-file rule, Figma-access pause, evidence, and ownership boundaries. Do not create subagents, commit, push, merge, deploy, or touch production data.
