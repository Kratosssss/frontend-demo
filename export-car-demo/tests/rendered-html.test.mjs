import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
test("exports trade-desk home and vehicle dossier routes", async () => {
  const [home, detail] = await Promise.all([
    read("../out/index.html"),
    read("../out/car/index.html"),
  ]);
  assert.match(home, /Inventory manifest/);
  assert.match(home, /Harbor S7/);
  assert.match(home, /READINESS BOARD/);
  assert.match(detail, /VEHICLE EXPORT DOSSIER/);
  assert.match(detail, /Return to manifest/);
});
test("keeps six model parameters, five complete dictionaries and local-only behavior", async () => {
  const [site, data, layout, robots, sitemap] = await Promise.all([
    read("../app/site.tsx"),
    read("../app/site-data.ts"),
    read("../app/layout.tsx"),
    read("../app/robots.ts"),
    read("../app/sitemap.ts"),
  ]);
  for (const slug of [
    "harbor-s7",
    "northline-e5",
    "civicline-4",
    "workland-p9",
    "transit-m8",
    "cityloop-c2",
  ])
    assert.match(data, new RegExp(slug));
  for (const locale of ["en", "ar", "fr", "ru", "es"])
    assert.match(data, new RegExp(`const ${locale}:`));
  assert.match(site, /exportcar-locale/);
  assert.match(site, /document\.documentElement\.dir/);
  assert.match(site, /getVehicle\(new URLSearchParams/);
  assert.match(site, /setDraft\(initialFilters\);\s*onApply\(initialFilters\)/);
  assert.match(data, /Local inquiry recorded\. No information was sent/);
  assert.doesNotMatch(site, /\bfetch\s*\(/);
  assert.doesNotMatch(site, /https?:\/\//);
  assert.doesNotMatch(data, /TestCar/i);
  assert.match(layout, /robots: \{ index: true, follow: true \}/);
  assert.match(robots, /sitemap/);
  assert.match(sitemap, /export-car-demo/);
});
test("locks the trade-desk anti-similarity structure and local font assets", async () => {
  const [css, site, attribution, license] = await Promise.all([
    read("../app/globals.css"),
    read("../app/site.tsx"),
    read("../public/images/ATTRIBUTION.md"),
    read("../public/fonts/OFL.txt"),
  ]);
  assert.doesNotMatch(css, /grid-template-columns:\s*44%\s+56%/);
  assert.doesNotMatch(css, /\.record-list[^}]*repeat\(3,\s*1fr\)/);
  assert.doesNotMatch(css, /margin:\s*-/);
  assert.doesNotMatch(site, /0\d\s*\//);
  assert.match(css, /IBMPlexSans-Regular\.woff2/);
  assert.match(css, /IBMPlexSansArabic-Regular\.woff2/);
  assert.match(license, /SIL OPEN FONT LICENSE/);
  assert.match(attribution, /OpenAI Terms of Use/);
  assert.doesNotMatch(css, /linear-gradient/);
});
