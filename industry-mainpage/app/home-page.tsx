"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ContactForm,
  SectionLabel,
  SiteFooter,
  SiteHeader,
} from "./components";
import {
  categoryLabels,
  newsItems,
  products,
  solutions,
  text,
} from "../lib/site-data";
import { useLocale } from "./site-context";

const homeCopy = {
  zh: {
    issue: "系统期刊",
    issueNote: "以模块化连接架构，让能源、信号与数据在复杂工业现场稳定流动。",
    titleA: "连接复杂系统的",
    titleB: "每一次可靠传导",
    description:
      "面向智能制造、储能与轨道交通的工业连接系统。从端子、接口到模块化组件，让工程选型更清晰，让现场部署更可靠。",
    searchLabel: "型号 / 应用 / 参数",
    searchButton: "快速选型",
    productIndex: "产品索引",
    productTitle: "从连接点开始，构建完整系统",
    allProducts: "查看全部产品",
    solutions: "行业解决方案",
    solutionNote: "现场笔记",
    quality: "设计验证",
    qualityStatement: "可靠不是结果，而是贯穿设计与验证的过程。",
    lab: "品质实验室",
    labDesc: "环境、寿命与机械性能验证",
    docs: "技术资料",
    docsDesc: "规格书、CAD 与选型指南",
    news: "最新动态",
    newsTitle: "持续更新的产品与工程资源",
    contact: "开始一个项目",
    contactTitle: "让下一个连接点，更清晰。",
    contactDesc: "提交应用场景与参数需求，体验完整的前端询盘流程。",
  },
  en: {
    issue: "System journal",
    issueNote:
      "A modular connection architecture keeps energy, signal and data moving across complex industrial systems.",
    titleA: "Every reliable transfer",
    titleB: "starts with a clear connection",
    description:
      "Industrial connection systems for smart manufacturing, energy storage and rail. From terminals to modular interfaces, selection becomes clearer and deployment more reliable.",
    searchLabel: "Model / application / parameter",
    searchButton: "Find products",
    productIndex: "Product index",
    productTitle: "Build complete systems from every connection point",
    allProducts: "Explore all products",
    solutions: "Industry solutions",
    solutionNote: "Field notes",
    quality: "Verified by design",
    qualityStatement:
      "Reliability is not an outcome. It is the process from design through validation.",
    lab: "Quality laboratory",
    labDesc: "Environmental, lifecycle and mechanical validation",
    docs: "Technical resources",
    docsDesc: "Datasheets, CAD and selection guides",
    news: "Latest updates",
    newsTitle: "Product and engineering resources that keep evolving",
    contact: "Start a project",
    contactTitle: "Make the next connection point clearer.",
    contactDesc:
      "Share an application and parameter need to experience the complete frontend inquiry flow.",
  },
} as const;

const featuredCategories = [
  "terminal",
  "connector",
  "io",
  "energy",
] as const;

export function HomePage() {
  const { locale } = useLocale();
  const copy = homeCopy[locale];

  return (
    <div className="site-frame">
      <SiteHeader />
      <main id="main-content">
        <section className="home-hero" aria-labelledby="home-hero-title">
          <div className="hero-copy">
            <div className="issue-row">
              <SectionLabel index="ML">{copy.issue}</SectionLabel>
              <p>{copy.issueNote}</p>
            </div>
            <h1 id="home-hero-title">
              {copy.titleA}
              <br />
              {copy.titleB}
              <span className="accent-slash">／</span>
            </h1>
            <div className="hero-copy-bottom">
              <p>{copy.description}</p>
              <form className="hero-search" action="/products" method="get">
                <label className="mono" htmlFor="hero-product-search">
                  FIND
                </label>
                <input
                  id="hero-product-search"
                  name="q"
                  type="search"
                  placeholder={copy.searchLabel}
                />
                <button type="submit">
                  {copy.searchButton} <span aria-hidden="true">→</span>
                </button>
              </form>
            </div>
          </div>
          <div className="hero-image-panel">
            <div className="hero-index mono">
              01
              <span>ENGINEERED FOR CONTINUITY</span>
            </div>
            <Image
              src="/images/matrilink-hero.jpg"
              alt={
                locale === "zh"
                  ? "虚构的 MATRILINK 模块化工业连接器"
                  : "Fictional MATRILINK modular industrial connector"
              }
              width={1536}
              height={1024}
              priority
              unoptimized
            />
            <span className="hero-callout mono">MX-C120 / REV.B</span>
            <span className="hero-callout is-right mono">IP67 · 12–48V</span>
          </div>
        </section>

        <section className="home-catalog" aria-labelledby="home-products-title">
          <div className="catalog-intro">
            <div>
              <SectionLabel index="02">{copy.productIndex}</SectionLabel>
              <h2 id="home-products-title">{copy.productTitle}</h2>
            </div>
            <Link href="/products">
              {copy.allProducts} <span aria-hidden="true">→</span>
            </Link>
          </div>
          {featuredCategories.map((category, index) => {
            const product = products.find((item) => item.category === category)!;
            return (
              <Link
                className="catalog-item"
                href={`/products?category=${category}`}
                key={category}
              >
                <span className="catalog-item-top mono">
                  <span>P—0{index + 1}</span>
                  <span>{product.series}</span>
                </span>
                <div>
                  <h3>{text(categoryLabels[category], locale)}</h3>
                  <p>{text(product.summary, locale)}</p>
                </div>
              </Link>
            );
          })}
        </section>

        <section className="editorial-grid">
          <div className="solution-panel" id="solutions">
            <div className="editorial-head">
              <h2>
                03 / {copy.solutions}
              </h2>
              <span className="mono">{copy.solutionNote}</span>
            </div>
            <ol>
              {solutions.map((solution) => (
                <li key={solution.id}>
                  <Link href={`/products?application=${
                    solution.id === "01"
                      ? "automation"
                      : solution.id === "02"
                        ? "energy"
                        : "rail"
                  }`}>
                    <span className="mono">{solution.id}</span>
                    <strong>{text(solution.title, locale)}</strong>
                    <span>{text(solution.summary, locale)}</span>
                    <b aria-hidden="true">↗</b>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <div className="quality-panel" id="quality">
            <SectionLabel index="04">{copy.quality}</SectionLabel>
            <p className="quality-statement">{copy.qualityStatement}</p>
            <div className="quality-links" id="resources">
              <Link href="/products/mx-c120#quality">
                <strong className="mono">LAB 01</strong>
                <span>{copy.lab}</span>
                <small>{copy.labDesc}</small>
              </Link>
              <Link href="/products/mx-c120#downloads">
                <strong className="mono">DOC 02</strong>
                <span>{copy.docs}</span>
                <small>{copy.docsDesc}</small>
              </Link>
            </div>
          </div>

          <aside className="contact-teaser">
            <SectionLabel index="05">{copy.contact}</SectionLabel>
            <h2>{copy.contactTitle}</h2>
            <p>{copy.contactDesc}</p>
            <a href="#contact">
              {locale === "zh" ? "填写演示询盘" : "Open demo inquiry"}{" "}
              <span aria-hidden="true">↘</span>
            </a>
          </aside>
        </section>

        <section className="news-section" aria-labelledby="news-title">
          <div className="news-intro">
            <SectionLabel index="06">{copy.news}</SectionLabel>
            <h2 id="news-title">{copy.newsTitle}</h2>
          </div>
          <div className="news-list">
            {newsItems.map((item, index) => (
              <article key={item.date}>
                <span className="mono">N—0{index + 1}</span>
                <time>{item.date}</time>
                <h3>{locale === "zh" ? item.zh : item.en}</h3>
                <span aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-section-copy">
            <SectionLabel index="07">{copy.contact}</SectionLabel>
            <h2>{copy.contactTitle}</h2>
            <p>{copy.contactDesc}</p>
          </div>
          <ContactForm />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
