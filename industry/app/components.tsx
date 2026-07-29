"use client";

import Link from "next/link";
import {
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  applicationLabels,
  categoryLabels,
  type Product,
  text,
} from "../lib/site-data";
import { useLocale } from "./site-context";

const headerCopy = {
  zh: {
    products: "产品中心",
    solutions: "解决方案",
    resources: "技术资源",
    quality: "品质保障",
    contact: "联系我们",
    inquiry: "项目询价",
    menu: "打开导航",
    closeMenu: "关闭导航",
    language: "切换为英文",
  },
  en: {
    products: "Products",
    solutions: "Solutions",
    resources: "Resources",
    quality: "Quality",
    contact: "Contact",
    inquiry: "Start a project",
    menu: "Open navigation",
    closeMenu: "Close navigation",
    language: "Switch to Chinese",
  },
} as const;

export function SiteHeader() {
  const { locale, toggleLocale } = useLocale();
  const copy = headerCopy[locale];
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="MATRILINK 首页">
        <span className="brand-mark" aria-hidden="true">
          M
        </span>
        <span className="brand-type">
          <strong>矩联电气 MATRILINK</strong>
          <small>INDUSTRIAL CONNECTION SYSTEMS</small>
        </span>
      </Link>
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
        aria-label={menuOpen ? copy.closeMenu : copy.menu}
        onClick={() => setMenuOpen((value) => !value)}
      >
        <span aria-hidden="true">{menuOpen ? "×" : "≡"}</span>
      </button>
      <nav
        className={`site-nav ${menuOpen ? "is-open" : ""}`}
        id="main-navigation"
        aria-label={locale === "zh" ? "主导航" : "Primary navigation"}
      >
        <Link href="/products" onClick={() => setMenuOpen(false)}>
          {copy.products}
        </Link>
        <Link href="/#solutions" onClick={() => setMenuOpen(false)}>
          {copy.solutions}
        </Link>
        <Link href="/#resources" onClick={() => setMenuOpen(false)}>
          {copy.resources}
        </Link>
        <Link href="/#quality" onClick={() => setMenuOpen(false)}>
          {copy.quality}
        </Link>
        <Link href="/#contact" onClick={() => setMenuOpen(false)}>
          {copy.contact}
        </Link>
      </nav>
      <div className="header-tools">
        <button
          className="language-toggle mono"
          type="button"
          onClick={toggleLocale}
          aria-label={copy.language}
        >
          {locale === "zh" ? "中 / EN" : "EN / 中"}
        </button>
        <Link className="header-inquiry" href="/#contact">
          {copy.inquiry} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { locale } = useLocale();
  return (
    <footer className="site-footer">
      <span>© 2026 MATRILINK · 矩联电气</span>
      <span>
        {locale === "zh"
          ? "Frontend Candidate Demo · 非商业概念作品"
          : "Frontend Candidate Demo · Non-commercial concept"}
      </span>
    </footer>
  );
}

export function SectionLabel({
  index,
  children,
}: {
  index: string;
  children: React.ReactNode;
}) {
  return (
    <p className="section-label mono">
      {index} / {children}
    </p>
  );
}

export function ProductVisual({
  variant = 1,
  compact = false,
  label,
}: {
  variant?: number;
  compact?: boolean;
  label: string;
}) {
  return (
    <div
      className={`product-visual visual-${variant} ${compact ? "is-compact" : ""}`}
      role="img"
      aria-label={label}
    >
      <span className="visual-rail rail-one" />
      <span className="visual-rail rail-two" />
      <span className="visual-core">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="visual-port port-one" />
      <span className="visual-port port-two" />
    </div>
  );
}

export function ProductCard({
  product,
  onQuickView,
}: {
  product: Product;
  onQuickView: (product: Product) => void;
}) {
  const { locale } = useLocale();
  return (
    <article className="product-card" data-category={product.category}>
      <div className="product-card-top mono">
        <span>{product.id}</span>
        <span>{product.series}</span>
      </div>
      <ProductVisual
        variant={product.variant}
        compact
        label={`${product.series} ${text(product.name, locale)}`}
      />
      <div className="product-card-body">
        <p className="product-category">
          {text(categoryLabels[product.category], locale)}
        </p>
        <h2>{text(product.name, locale)}</h2>
        <p>{text(product.summary, locale)}</p>
        <div className="spec-chips mono" aria-label="关键规格">
          <span>{product.current} A</span>
          <span>{product.voltage}</span>
          <span>{product.protection}</span>
        </div>
      </div>
      <div className="product-card-actions">
        <button type="button" onClick={() => onQuickView(product)}>
          {locale === "zh" ? "快速查看" : "Quick view"} <span>↗</span>
        </button>
        {product.slug === "mx-c120" ? (
          <Link href="/products/mx-c120">
            {locale === "zh" ? "完整详情" : "Full details"} <span>→</span>
          </Link>
        ) : (
          <span className="demo-note mono">
            {locale === "zh" ? "DEMO SERIES" : "DEMO SERIES"}
          </span>
        )}
      </div>
    </article>
  );
}

export function QuickViewDrawer({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { locale } = useLocale();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!product) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div className="drawer-layer" role="presentation" onMouseDown={onClose}>
      <aside
        className="quick-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-view-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="drawer-head">
          <span className="mono">{product.series} / QUICK VIEW</span>
          <button
            ref={closeRef}
            className="drawer-close"
            type="button"
            onClick={onClose}
            aria-label={locale === "zh" ? "关闭产品详情" : "Close product details"}
          >
            ×
          </button>
        </div>
        <ProductVisual
          variant={product.variant}
          label={`${product.series} ${text(product.name, locale)}`}
        />
        <div className="drawer-copy">
          <p className="product-category">
            {text(categoryLabels[product.category], locale)}
          </p>
          <h2 id="quick-view-title">{text(product.name, locale)}</h2>
          <p>{text(product.summary, locale)}</p>
          <dl className="quick-specs">
            {product.specs.map((spec) => (
              <div key={spec.value}>
                <dt>{text(spec.label, locale)}</dt>
                <dd className="mono">{spec.value}</dd>
              </div>
            ))}
          </dl>
          <div className="application-row">
            {product.applications.map((application) => (
              <span key={application}>
                {text(applicationLabels[application], locale)}
              </span>
            ))}
          </div>
          {product.slug === "mx-c120" ? (
            <Link className="primary-link" href="/products/mx-c120">
              {locale === "zh" ? "查看完整产品样板" : "View full product sample"}{" "}
              <span>→</span>
            </Link>
          ) : (
            <p className="drawer-demo-note">
              {locale === "zh"
                ? "本演示仅扩展 MX-C120 完整详情页。"
                : "This demo expands the MX-C120 into a full detail page."}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const { locale } = useLocale();
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const formId = useId();

  const copy =
    locale === "zh"
      ? {
          name: "姓名",
          company: "公司 / 项目",
          email: "邮箱",
          message: "应用场景与参数需求",
          send: "提交演示询盘",
          note: "演示交互，不会发送或保存真实信息。",
          success: "演示提交成功。没有信息被发送。",
          required: "请填写此项",
          invalidEmail: "请输入有效邮箱",
        }
      : {
          name: "Name",
          company: "Company / project",
          email: "Email",
          message: "Application and parameter needs",
          send: "Submit demo inquiry",
          note: "Demo interaction only. No information is sent or stored.",
          success: "Demo submitted. No information was sent.",
          required: "This field is required",
          invalidEmail: "Enter a valid email",
        };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const nextErrors: FormErrors = {};
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!name) nextErrors.name = copy.required;
    if (!email) nextErrors.email = copy.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = copy.invalidEmail;
    }
    if (!message) nextErrors.message = copy.required;
    setErrors(nextErrors);
    setSubmitted(false);
    if (Object.keys(nextErrors).length === 0) {
      form.reset();
      setSubmitted(true);
    }
  };

  return (
    <form
      className={`contact-form ${compact ? "is-compact" : ""}`}
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="field-grid">
        <label>
          <span>{copy.name}</span>
          <input
            name="name"
            aria-describedby={errors.name ? `${formId}-name-error` : undefined}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <small id={`${formId}-name-error`} className="field-error">
              {errors.name}
            </small>
          )}
        </label>
        <label>
          <span>{copy.company}</span>
          <input name="company" />
        </label>
        <label>
          <span>{copy.email}</span>
          <input
            name="email"
            type="email"
            aria-describedby={errors.email ? `${formId}-email-error` : undefined}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && (
            <small id={`${formId}-email-error`} className="field-error">
              {errors.email}
            </small>
          )}
        </label>
      </div>
      <label className="message-field">
        <span>{copy.message}</span>
        <textarea
          name="message"
          rows={compact ? 3 : 4}
          aria-describedby={
            errors.message ? `${formId}-message-error` : undefined
          }
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message && (
          <small id={`${formId}-message-error`} className="field-error">
            {errors.message}
          </small>
        )}
      </label>
      <div className="form-footer">
        <button type="submit">{copy.send} →</button>
        <p>{copy.note}</p>
      </div>
      <p className="form-status" aria-live="polite">
        {submitted ? copy.success : ""}
      </p>
    </form>
  );
}
