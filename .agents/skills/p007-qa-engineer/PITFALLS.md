# QA Engineer pitfalls

Read this file completely before every QA run. Apply only cases whose trigger matches the current task.

## Current record

## Direct-route screenshots hid a broken uni-app H5 runtime

- Trigger: A uni-app H5 delivery has green typecheck/build/tests and visually plausible screenshots captured by direct URL.
- Failure: Treat renderable routes as proof that the application works. A local `globalThis.uni` shim can leave every navigation/storage/toast click broken while static pages still render.
- Required response: In a standard H5 browser, click at least one cross-route API and one storage-writing API, verify the URL/state change, and inspect app-origin Console errors. Also compare hashes and visible content for every claimed multi-state screenshot; filenames alone are not evidence.
