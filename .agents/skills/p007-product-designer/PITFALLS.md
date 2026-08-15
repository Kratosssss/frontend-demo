# Product Designer pitfalls

Read this file completely before every Design run. Apply only cases whose trigger matches the current task.

## Directions changed layout but shared the same visual DNA

- Trigger: Produce three direction images for a product that already has related demos in the repository.
- Failure: Change module placement while reusing the same palette, typography, density, information hierarchy, comparison-first structure, or industrial/editorial motif; the set appears like one template with variations and may resemble an existing project.
- Required response: Inspect the real existing visual DNA first. Define explicit banned similarities and separate the three directions across background value, color strategy, type personality, imagery, density, composition, discovery logic, and signature motion. Compare all three with each other and the existing project before handoff.

## Complete lifecycle was crammed into the homepage

- Trigger: The product specification includes account, address, discounts, payment, orders, cancellation, and after-sales flows.
- Failure: Expose every lifecycle state in the first viewport to prove scope, turning a consumer DTC storefront into a dashboard or ledger.
- Required response: Keep the homepage focused on desire, trust, discovery, and purchase intent. Prove the wider lifecycle through clear but restrained navigation and dedicated screens unless the approved product/design specifically requires expansion.

## Replaced images reused cached filenames

- Trigger: Regenerate or substantially revise a direction image already shown to the user.
- Failure: Overwrite the old path and report success; Codex may keep rendering the cached previous image, so the user sees no update.
- Required response: Save each user-visible revision under a new versioned filename such as `r1-<direction>.png`; never overwrite a previously displayed path. Report the new absolute paths, size and hash to the commander, keep exactly the required active images, and let the commander verify rendering before requesting approval.
