"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ProductCard,
  QuickViewDrawer,
  SectionLabel,
  SiteFooter,
  SiteHeader,
} from "../components";
import {
  applicationLabels,
  categoryLabels,
  type Product,
  type ProductApplication,
  type ProductCategory,
  products,
  text,
} from "../../lib/site-data";
import { useLocale } from "../site-context";

type CategoryFilter = "all" | ProductCategory;
type ApplicationFilter = "all" | ProductApplication;

export function ProductsPage() {
  const { locale } = useLocale();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [application, setApplication] =
    useState<ApplicationFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickProduct, setQuickProduct] = useState<Product | null>(null);
  const filterCloseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") ?? "");
      const categoryParam = params.get("category");
      if (
        categoryParam === "terminal" ||
        categoryParam === "connector" ||
        categoryParam === "io" ||
        categoryParam === "energy"
      ) {
        setCategory(categoryParam);
      }
      const applicationParam = params.get("application");
      if (
        applicationParam === "automation" ||
        applicationParam === "energy" ||
        applicationParam === "rail" ||
        applicationParam === "building"
      ) {
        setApplication(applicationParam);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!filtersOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    filterCloseRef.current?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", close);
    };
  }, [filtersOpen]);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery =
        !normalized ||
        [
          product.series,
          product.name.zh,
          product.name.en,
          product.summary.zh,
          product.summary.en,
          product.protection,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      const matchesCategory =
        category === "all" || product.category === category;
      const matchesApplication =
        application === "all" || product.applications.includes(application);
      return matchesQuery && matchesCategory && matchesApplication;
    });
  }, [application, category, query]);

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setApplication("all");
  };

  const closeQuickView = useCallback(() => setQuickProduct(null), []);

  const copy =
    locale === "zh"
      ? {
          label: "产品目录",
          title: "从参数与场景出发，找到清晰的连接路径。",
          intro:
            "8 个虚构产品用于演示制造业目录站的搜索、筛选、快速查看与详情路径。",
          search: "搜索型号、名称或参数",
          category: "产品系列",
          application: "应用场景",
          all: "全部",
          filter: "筛选产品",
          close: "关闭筛选",
          clear: "清除条件",
          result: "项产品",
          empty: "没有匹配的产品，请调整筛选条件。",
        }
      : {
          label: "Product catalog",
          title: "Start with parameters and context. Find a clearer connection path.",
          intro:
            "Eight fictional products demonstrate search, filtering, quick views and detail journeys for an industrial catalog.",
          search: "Search model, name or parameter",
          category: "Product family",
          application: "Application",
          all: "All",
          filter: "Filter products",
          close: "Close filters",
          clear: "Clear filters",
          result: "products",
          empty: "No products match. Adjust the filters and try again.",
        };

  const filterFields = (
    <div className="filter-fields">
      <label>
        <span>{copy.search}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="MX-C120 / IP67"
        />
      </label>
      <label>
        <span>{copy.category}</span>
        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as CategoryFilter)
          }
        >
          <option value="all">{copy.all}</option>
          {(Object.keys(categoryLabels) as ProductCategory[]).map((item) => (
            <option key={item} value={item}>
              {text(categoryLabels[item], locale)}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{copy.application}</span>
        <select
          value={application}
          onChange={(event) =>
            setApplication(event.target.value as ApplicationFilter)
          }
        >
          <option value="all">{copy.all}</option>
          {(Object.keys(applicationLabels) as ProductApplication[]).map(
            (item) => (
              <option key={item} value={item}>
                {text(applicationLabels[item], locale)}
              </option>
            ),
          )}
        </select>
      </label>
      <button type="button" onClick={clearFilters}>
        {copy.clear}
      </button>
    </div>
  );

  return (
    <div className="site-frame">
      <SiteHeader />
      <main id="main-content">
        <section className="catalog-hero">
          <SectionLabel index="01">{copy.label}</SectionLabel>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
        </section>

        <section className="catalog-workspace" aria-labelledby="catalog-results">
          <aside className="desktop-filters" aria-label={copy.filter}>
            <div className="filter-heading mono">FILTER / 01</div>
            {filterFields}
          </aside>
          <div className="catalog-results">
            <div className="catalog-toolbar">
              <p id="catalog-results" aria-live="polite">
                <strong className="mono">{filteredProducts.length}</strong>{" "}
                {copy.result}
              </p>
              <button
                className="mobile-filter-button"
                type="button"
                onClick={() => setFiltersOpen(true)}
              >
                {copy.filter} <span aria-hidden="true">＋</span>
              </button>
            </div>
            {filteredProducts.length > 0 ? (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    product={product}
                    key={product.slug}
                    onQuickView={setQuickProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-products">
                <span className="mono">NO MATCH / 00</span>
                <p>{copy.empty}</p>
                <button type="button" onClick={clearFilters}>
                  {copy.clear}
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />

      {filtersOpen && (
        <div
          className="mobile-filter-layer"
          role="presentation"
          onMouseDown={() => setFiltersOpen(false)}
        >
          <aside
            className="mobile-filter-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="drawer-head">
              <h2 id="mobile-filter-title">{copy.filter}</h2>
              <button
                ref={filterCloseRef}
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label={copy.close}
              >
                ×
              </button>
            </div>
            {filterFields}
            <button
              className="apply-filter"
              type="button"
              onClick={() => setFiltersOpen(false)}
            >
              {locale === "zh"
                ? `查看 ${filteredProducts.length} 项产品`
                : `View ${filteredProducts.length} products`}
            </button>
          </aside>
        </div>
      )}

      <QuickViewDrawer product={quickProduct} onClose={closeQuickView} />
    </div>
  );
}
