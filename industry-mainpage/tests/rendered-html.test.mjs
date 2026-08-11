import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageFiles = {
  "/": "../out/index.html",
  "/products": "../out/products/index.html",
  "/products/mx-c120": "../out/products/mx-c120/index.html",
};

async function render(pathname = "/") {
  const html = await readFile(new URL(pageFiles[pathname], import.meta.url), "utf8");
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

test("server-renders all public routes with finished portfolio content", async () => {
  const cases = [
    ["/", /每一次可靠传导/],
    ["/products", /从参数与场景出发/],
    ["/products/mx-c120", /MX-C120/],
  ];

  for (const [pathname, content] of cases) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

    const html = await response.text();
    assert.match(html, /MATRILINK/);
    assert.match(html, content);
    assert.match(html, /name="robots" content="noindex, nofollow"/);
    assert.doesNotMatch(html, /loading skeleton|react-loading-skeleton/i);
  }
});

test("catalog and detail journeys expose the expected demo controls", async () => {
  const [catalogResponse, detailResponse] = await Promise.all([
    render("/products"),
    render("/products/mx-c120"),
  ]);
  const catalog = await catalogResponse.text();
  const detail = await detailResponse.text();

  assert.match(catalog, /搜索型号、名称或参数/);
  assert.match(catalog, /MX-C120/);
  assert.match(catalog, /快速查看/);
  assert.match(detail, /mx-c120-demo-spec\.pdf/);
  assert.match(detail, /mx-c120-demo-outline\.dxf/);
  assert.match(detail, /mx-c120-demo-model\.stp/);
  assert.match(detail, /DEMO/);
});

test("client behaviors remain local-only and accessible", async () => {
  const [context, products, components, layout, pdfGenerator] = await Promise.all([
    readFile(new URL("../app/site-context.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/products/products-page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../scripts/generate-demo-pdf.py", import.meta.url), "utf8"),
  ]);

  assert.match(context, /localStorage\.setItem\("matrilink-locale"/);
  assert.match(context, /document\.documentElement\.lang/);
  assert.match(products, /filteredProducts/);
  assert.match(products, /event\.key === "Escape"/);
  assert.match(components, /event\.preventDefault\(\)/);
  assert.match(components, /aria-modal="true"/);
  assert.doesNotMatch(components, /\bfetch\s*\(/);
  assert.match(layout, /index:\s*false/);
  assert.match(pdfGenerator, /\("Rated current", "120 A"\)/);
  assert.match(pdfGenerator, /\("Protection", "IP67"\)/);
  assert.match(pdfGenerator, /\("Connection pitch", "5\.08 mm"\)/);
  assert.doesNotMatch(pdfGenerator, /\("Rated current", "32 A"\)|\("Protection", "IP20"\)/);
});
