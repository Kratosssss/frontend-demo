import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("exports only the home and reusable vehicle-detail routes", async () => {
  const [home, detail] = await Promise.all([read("../out/index.html"), read("../out/car/index.html")]);
  assert.match(home, /TESTCAR/);
  assert.match(home, /Find the right starting point/);
  assert.match(home, /Atlas X5/);
  assert.match(detail, /Back to inventory/);
  assert.match(detail, /Export-ready vehicle/);
});

test("keeps local-only inquiry and multilingual behavior in the client bundle source", async () => {
  const [site, data, layout, robots, sitemap] = await Promise.all([read("../app/site.tsx"), read("../app/site-data.ts"), read("../app/layout.tsx"), read("../app/robots.ts"), read("../app/sitemap.ts")]);
  assert.match(site, /testcar-locale/);
  assert.match(site, /document\.documentElement\.dir/);
  assert.match(site, /IntersectionObserver/);
  assert.match(site, /is-arabic/);
  assert.match(site, /new URLSearchParams/);
  assert.match(data, /Demo request recorded locally/);
  assert.doesNotMatch(site, /\bfetch\s*\(/);
  assert.match(data, /"en", "ar", "fr", "ru", "es"/);
  assert.match(layout, /robots: \{ index: true, follow: true \}/);
  assert.match(robots, /sitemap/);
  assert.match(sitemap, /\/testcar\/car\//);
});
