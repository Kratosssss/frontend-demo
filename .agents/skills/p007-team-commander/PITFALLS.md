# Team Commander pitfalls

Read this file completely before every commander run. Apply only cases whose trigger matches the current task.

## Role title was silently downgraded to a single-agent flow

- Trigger: The user addresses Codex as “总指挥” or “总策划” and starts substantive P007 work without yet saying `编队执行`.
- Failure: Continue into ordinary branch/worktree or single-agent planning without explaining the activation gate.
- Required response: State that the title is not team authorization, give the exact `编队执行` trigger, and create no Goal, cards, or specialists until it is affirmatively provided.

## Worktree handoff lost process state

- Trigger: Continue the dispatch in a new Codex thread or worktree.
- Failure: Assume the Goal and ignored `.planning/` state transferred because tracked repository files are visible.
- Required response: Before continuing, verify `git status`, `git worktree list`, current Goal, manifest, cards, reports, artifacts, and approval evidence. Recreate or deliberately transfer missing process state in the current worktree without overwriting unrelated changes.

## Worktree cleanup would discard approval artifacts

- Trigger: A worktree contains user-visible direction images, reports, manifests, or other still-needed approval evidence under ignored `.planning/` paths.
- Failure: Remove, replace, or abandon the worktree because tracked code is safe, while the ignored approval artifacts have not been transferred or superseded.
- Required response: Mark the worktree as retained and do not clean it up until every still-needed ignored artifact is transferred to the active worktree or replaced by durable approved output. Recheck exact artifact paths and approval dependencies immediately before any cleanup decision.

## Updated artifact was not actually shown to the user

- Trigger: Replace a user-visible image or other preview after feedback.
- Failure: Reuse the same path, verify only the disk file, and claim the update was shown while Codex still renders a cached older artifact.
- Required response: Require a new versioned filename for every user-visible revision, update manifest/report references, verify the new path, size and hash, render that exact new path in the conversation, and only then request approval. Treat disk freshness and user-visible delivery as separate checks.

## Selection images were hidden in collapsible process output

- Trigger: Ask the user to choose between visual directions, mockups, or other image-based options.
- Failure: Render the images only in commentary/tool progress, then send a text-only final answer. Once progress is collapsed, the user receives labels and paths but no usable visual choices.
- Required response: Deliver every option as a separately labeled persistent image attachment in the same turn, verify all attachments are visibly returned, and make the final answer map each visible label to one choice. Never open an image-selection gate on filesystem paths or text descriptions alone.

## Implementation evidence was fresh by time but false by state

- Trigger: A role reports a complete screenshot matrix after implementation or repair.
- Failure: Verify only count, dimensions, filenames, and modification times. A “filled” page may actually be empty, and several named states may be byte-identical.
- Required response: Before releasing QA, inspect representative pixels, compare hashes for states that must differ, verify required state-specific text/controls, and exercise at least one live end-to-end route. Fresh files prove chronology, not semantic truth.

## Evidence filenames concealed the real media format

- Trigger: Preflight a screenshot or image evidence matrix before releasing QA.
- Failure: Approve count, dimensions, hashes, mtimes, pixels, and semantic state without checking file signature/MIME. Files named `.png` may actually contain JPEG/JFIF bytes, so all visible checks can pass while the contractual artifact format fails.
- Required response: Add media-format verification to the commander preflight for every evidence file: extension, decoder-reported type, and magic bytes must agree. Reject the batch before QA when any mismatch exists; require a new versioned path and refreshed index/hash after real conversion or recapture. Treat media authenticity as independent from image appearance and state authenticity. After any correction, audit the whole report rather than only the appended erratum: every earlier claim about the failed version must be corrected or explicitly marked superseded, and a full-text contradiction search must pass before QA is resumed.
