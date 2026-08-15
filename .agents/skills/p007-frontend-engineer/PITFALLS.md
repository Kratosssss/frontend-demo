# Frontend Engineer pitfalls

Read this file completely before every Frontend run. Apply only cases whose trigger matches the current task.

## Current record

## uni-app H5 API was shadowed with `globalThis.uni`

- Trigger: A uni-app Vue page or component needs navigation, storage, toast, or other `uni` APIs in H5.
- Failure: Add a local `const uni = globalThis.uni` shim. Typecheck, build, service tests, and direct-route screenshots can still pass, while standard H5 clicks fail because `window.uni` is undefined.
- Required response: Use the uni-app-supported global/API reference without shadowing it. Before handoff, exercise at least one real navigation API and one real storage API in a standard H5 browser, check app-origin Console errors, and add a regression guard against reintroducing the shim.

## Screenshot filenames claimed states that the pixels did not contain

- Trigger: Capture multiple implementation states such as filled checkout or payment ready/processing/success/failed.
- Failure: Trust route names or output filenames; submit an empty checkout as “filled”, identical hashes for different states, or screenshots captured before the last code repair.
- Required response: Capture into a new versioned directory after final source changes; verify every image is newer than the source, check dimensions and hashes, visually inspect each state, require state-specific text/controls to differ, and prove the key states through a real browser path or documented deterministic fixture.

## A reused static tab produced a complete-looking but invalid screenshot batch

- Trigger: Capture a multi-page H5 evidence matrix from a production build, especially when routes depend on browser-local commerce state.
- Failure: Reuse a cached or interrupted tab, construct unverified deep links, or mutate storage without proving the UI consumed it. The batch can contain white pages, empty checkout under a `filled` filename, identical payment states, and identical filled/empty cart hashes even though the capture command reports success.
- Required response: Start from a fresh build tab, wait for a page-specific visible element, and establish dependent states through the real UI path unless a tested fixture is documented. Gate the batch on a small representative set first; visually open every gated image and compare hashes for states that must differ before producing the remainder. A partial evidence checkpoint is not a completed frontend handoff.

## DOM viewport dimensions were mistaken for screenshot file dimensions

- Trigger: A browser capability reports the requested responsive viewport and the output filename includes that size.
- Failure: Assume `window.innerWidth/innerHeight` proves the PNG dimensions. Some browser/tab paths can still return a 1280×720 or chrome-reduced 1440×618 bitmap, while a stateful page can also drift into a bound or disabled state during recapture.
- Required response: After every screenshot write, inspect the actual PNG width/height before moving on, then inspect its state-specific pixels. The viewport assertion, PNG dimensions, and semantic UI state are three independent gates; all three must pass. Never resize, pad, rename, or reuse a semantically stale image to satisfy the matrix.

## Screenshot suffix matched the request but not the encoded bytes

- Trigger: Save browser evidence under a requested image extension such as `.png`.
- Failure: Validate only filename, dimensions, hash, mtime, and visible pixels. A capture can remain JPEG/JFIF bytes even when the path ends in `.png`, making the evidence index materially false.
- Required response: Before handoff, verify every image with both a decoder/type probe and magic bytes. A PNG must begin with the PNG signature, not JFIF/JPEG. If encoding is wrong, create a new versioned evidence path, perform a real format conversion or recapture, recompute all hashes, update the index/report, and visually inspect the new files. Never fix this by renaming the same bytes. Re-read the entire report and every old-version reference after the correction; replace or explicitly supersede each stale format claim in place, then use a full-text search to prove the report no longer contradicts its appended erratum.
