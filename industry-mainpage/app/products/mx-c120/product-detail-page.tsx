"use client";

import Link from "next/link";
import {
  ContactForm,
  ProductVisual,
  SectionLabel,
  SiteFooter,
  SiteHeader,
} from "../../components";
import {
  applicationLabels,
  products,
  text,
} from "../../../lib/site-data";
import { useLocale } from "../../site-context";

const product = products[0];

export function ProductDetailPage() {
  const { locale } = useLocale();

  const copy =
    locale === "zh"
      ? {
          back: "返回产品目录",
          eyebrow: "产品样板",
          title: "一个接口，组织电源、信号与数据。",
          description:
            "MX-C120 是为本演示项目设计的虚构模块化连接器。它展示制造业产品详情页如何组织关键参数、应用场景、验证信息和工程资料。",
          sample: "演示申请样品",
          overview: "产品概览",
          specs: "技术参数",
          quality: "品质验证",
          downloads: "资料下载",
          applications: "适用场景",
          qualityTitle: "从结构设计到环境验证的完整路径",
          qualityCopy:
            "演示数据覆盖机械锁止、温度循环、振动与插拔寿命，用来呈现可信而易读的品质信息结构。",
          downloadTitle: "工程资料清晰可达",
          downloadCopy:
            "所有文件均带 DEMO 标识，仅用于展示下载体验，不可用于真实工程设计。",
          contactTitle: "需要不同的电流、针位或安装方式？",
          contactCopy: "填写演示需求，查看表单校验与成功反馈。",
          sticky: "演示询盘",
        }
      : {
          back: "Back to products",
          eyebrow: "Product sample",
          title: "One interface for power, signal and data.",
          description:
            "MX-C120 is a fictional modular connector designed for this demo. It shows how an industrial product page can organize key parameters, applications, validation and engineering resources.",
          sample: "Request demo sample",
          overview: "Overview",
          specs: "Technical data",
          quality: "Quality validation",
          downloads: "Downloads",
          applications: "Applications",
          qualityTitle: "A complete path from structural design to environmental validation",
          qualityCopy:
            "Demo data covers mechanical locking, thermal cycling, vibration and mating life to present credible quality information clearly.",
          downloadTitle: "Engineering resources within reach",
          downloadCopy:
            "Every file is marked DEMO and is provided only to demonstrate downloads, never for real engineering work.",
          contactTitle: "Need a different current, pin count or mounting format?",
          contactCopy:
            "Submit a demo requirement to view validation and success feedback.",
          sticky: "Demo inquiry",
        };

  return (
    <div className="site-frame">
      <SiteHeader />
      <main id="main-content">
        <section className="detail-hero">
          <div className="detail-copy">
            <Link className="back-link" href="/products">
              ← {copy.back}
            </Link>
            <SectionLabel index="MX-C120">{copy.eyebrow}</SectionLabel>
            <h1>{copy.title}</h1>
            <p>{copy.description}</p>
            <div className="detail-hero-actions">
              <a href="#contact">
                {copy.sample} <span aria-hidden="true">→</span>
              </a>
              <a href="#downloads">
                {copy.downloads} <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <div className="detail-product-panel">
            <span className="detail-series mono">P—01 / {product.series}</span>
            <ProductVisual
              variant={product.variant}
              label={`${product.series} ${text(product.name, locale)}`}
            />
            <div className="detail-key-specs mono">
              <span>{product.current} A</span>
              <span>{product.voltage}</span>
              <span>{product.protection}</span>
            </div>
          </div>
        </section>

        <nav className="detail-anchor-nav" aria-label={copy.overview}>
          <a href="#overview">{copy.overview}</a>
          <a href="#specifications">{copy.specs}</a>
          <a href="#quality">{copy.quality}</a>
          <a href="#downloads">{copy.downloads}</a>
        </nav>

        <section className="detail-overview" id="overview">
          <div className="detail-section-intro">
            <SectionLabel index="02">{copy.overview}</SectionLabel>
            <h2>{text(product.name, locale)}</h2>
            <p>{text(product.summary, locale)}</p>
          </div>
          <div className="feature-list">
            {[
              locale === "zh" ? "模块化混合插芯" : "Modular hybrid inserts",
              locale === "zh" ? "可识别机械键位" : "Identifiable mechanical keying",
              locale === "zh" ? "现场防护结构" : "Field-ready protection",
              locale === "zh" ? "前端可维护设计" : "Front-serviceable design",
            ].map((feature, index) => (
              <div key={feature}>
                <span className="mono">F—0{index + 1}</span>
                <strong>{feature}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="spec-section" id="specifications">
          <div className="detail-section-intro">
            <SectionLabel index="03">{copy.specs}</SectionLabel>
            <h2>{locale === "zh" ? "关键规格一目了然" : "Key specifications at a glance"}</h2>
          </div>
          <div className="spec-table-wrap" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th>{locale === "zh" ? "参数" : "Parameter"}</th>
                  <th>{locale === "zh" ? "数值" : "Value"}</th>
                  <th>{locale === "zh" ? "演示说明" : "Demo note"}</th>
                </tr>
              </thead>
              <tbody>
                {product.specs.map((spec) => (
                  <tr key={spec.value}>
                    <th>{text(spec.label, locale)}</th>
                    <td className="mono">{spec.value}</td>
                    <td>
                      {locale === "zh"
                        ? "虚构参数，仅用于页面演示"
                        : "Fictional parameter for interface demonstration"}
                    </td>
                  </tr>
                ))}
                <tr>
                  <th>{locale === "zh" ? "接线范围" : "Wire range"}</th>
                  <td className="mono">0.5–35 mm²</td>
                  <td>
                    {locale === "zh"
                      ? "演示区间"
                      : "Demonstration range"}
                  </td>
                </tr>
                <tr>
                  <th>{locale === "zh" ? "机械寿命" : "Mating cycles"}</th>
                  <td className="mono">500</td>
                  <td>{locale === "zh" ? "演示值" : "Demo value"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="application-section">
          <div className="detail-section-intro">
            <SectionLabel index="04">{copy.applications}</SectionLabel>
            <h2>
              {locale === "zh"
                ? "围绕设备与现场的三种连接场景"
                : "Three connection contexts from equipment to field"}
            </h2>
          </div>
          <div className="application-cards">
            {product.applications.map((application, index) => (
              <article key={application}>
                <span className="mono">A—0{index + 1}</span>
                <h3>{text(applicationLabels[application], locale)}</h3>
                <p>
                  {locale === "zh"
                    ? "通过清晰的参数层级、资料入口和询盘动作，缩短从选型到沟通的路径。"
                    : "Clear parameter hierarchy, resources and inquiry actions shorten the path from selection to conversation."}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="quality-detail" id="quality">
          <div>
            <SectionLabel index="05">{copy.quality}</SectionLabel>
            <h2>{copy.qualityTitle}</h2>
            <p>{copy.qualityCopy}</p>
          </div>
          <ol>
            {[
              ["01", locale === "zh" ? "结构审查" : "Structure review", "CAD"],
              ["02", locale === "zh" ? "温度循环" : "Thermal cycling", "-40 / 125°C"],
              ["03", locale === "zh" ? "随机振动" : "Random vibration", "20–500 Hz"],
              ["04", locale === "zh" ? "插拔寿命" : "Mating lifecycle", "500 CYC"],
            ].map(([index, title, meta]) => (
              <li key={index}>
                <span className="mono">{index}</span>
                <strong>{title}</strong>
                <b className="mono">{meta}</b>
              </li>
            ))}
          </ol>
        </section>

        <section className="download-section" id="downloads">
          <div className="detail-section-intro">
            <SectionLabel index="06">{copy.downloads}</SectionLabel>
            <h2>{copy.downloadTitle}</h2>
            <p>{copy.downloadCopy}</p>
          </div>
          <div className="download-list">
            <a href="/industry-mainpage/downloads/mx-c120-demo-spec.pdf" download>
              <span className="download-type mono">PDF</span>
              <span>
                <strong>MX-C120 DEMO DATASHEET</strong>
                <small>{locale === "zh" ? "演示规格书" : "Demo datasheet"}</small>
              </span>
              <b aria-hidden="true">↓</b>
            </a>
            <a href="/industry-mainpage/downloads/mx-c120-demo-outline.dxf" download>
              <span className="download-type mono">DXF</span>
              <span>
                <strong>MX-C120 DEMO OUTLINE</strong>
                <small>{locale === "zh" ? "演示轮廓文件" : "Demo outline file"}</small>
              </span>
              <b aria-hidden="true">↓</b>
            </a>
            <a href="/industry-mainpage/downloads/mx-c120-demo-model.stp" download>
              <span className="download-type mono">STP</span>
              <span>
                <strong>MX-C120 DEMO MODEL</strong>
                <small>{locale === "zh" ? "演示模型占位" : "Demo model placeholder"}</small>
              </span>
              <b aria-hidden="true">↓</b>
            </a>
          </div>
        </section>

        <section className="detail-contact" id="contact">
          <div>
            <SectionLabel index="07">
              {locale === "zh" ? "联系我们" : "Contact"}
            </SectionLabel>
            <h2>{copy.contactTitle}</h2>
            <p>{copy.contactCopy}</p>
          </div>
          <ContactForm compact />
        </section>
      </main>
      <a className="mobile-sticky-cta" href="#contact">
        {copy.sticky} <span aria-hidden="true">→</span>
      </a>
      <SiteFooter />
    </div>
  );
}
