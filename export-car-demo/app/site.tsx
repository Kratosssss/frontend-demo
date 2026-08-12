"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  Globe2,
  Menu,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Body,
  Draft,
  Filters,
  Locale,
  Vehicle,
  getVehicle,
  locales,
  price,
  translations,
  vehicleFacts,
  vehicles,
} from "./site-data";

const initialFilters: Filters = {
  body: "all",
  condition: "all",
  budget: "all",
};
const initialDraft: Draft = {
  name: "",
  email: "",
  country: "",
  quantity: "1",
  note: "",
};

const filterInventory = (filters: Filters) =>
  vehicles.filter(
    (vehicle) =>
      (filters.body === "all" || vehicle.body === filters.body) &&
      (filters.condition === "all" ||
        vehicle.condition === filters.condition) &&
      (filters.budget === "all" ||
        (filters.budget === "under-18000" && vehicle.price < 18000) ||
        (filters.budget === "under-26000" && vehicle.price < 26000) ||
        (filters.budget === "over-26000" && vehicle.price >= 26000)),
  );

function useLocale() {
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem("exportcar-locale");
      if (locales.includes(saved as Locale)) setLocale(saved as Locale);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    localStorage.setItem("exportcar-locale", locale);
  }, [locale]);
  return { locale, setLocale, copy: translations[locale] };
}

function Header({ locale, setLocale, copy }: ReturnType<typeof useLocale>) {
  const [open, setOpen] = useState(false);
  const hrefs = ["#inventory", "#readiness", "#movement", "#buyer-notes"];
  return (
    <>
      <header className="trade-header">
        <Link className="wordmark" href="/">
          <span>EXPORT</span>
          <b>CAR</b>
        </Link>
        <nav className={open ? "trade-nav visible" : "trade-nav"}>
          {copy.nav.map((item, index) => (
            <a key={item} href={hrefs[index]} onClick={() => setOpen(false)}>
              {item}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <label className="locale">
            <Globe2 size={14} />
            <span className="sr">Language</span>
            <select
              aria-label="Language"
              value={locale}
              onChange={(event) => setLocale(event.target.value as Locale)}
            >
              {locales.map((item) => (
                <option key={item} value={item}>
                  {item.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <a className="brief-action" href="#buyer-notes">
            {copy.action}
            <ArrowUpRight size={14} />
          </a>
          <button
            className="menu-button"
            aria-label={copy.menu}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <div className="status-strip">{copy.status}</div>
    </>
  );
}

function InquiryForm({ copy }: Pick<ReturnType<typeof useLocale>, "copy">) {
  const [draft, setDraft] = useState(initialDraft);
  const [state, setState] = useState<"idle" | "error" | "success">("idle");
  const update = (key: keyof Draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setState("idle");
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState(draft.name && draft.email && draft.country ? "success" : "error");
  };
  return (
    <form className="inquiry-form" noValidate onSubmit={submit}>
      <div className="form-grid">
        <label>
          {copy.form.name}
          <input
            required
            value={draft.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </label>
        <label>
          {copy.form.email}
          <input
            required
            type="email"
            value={draft.email}
            onChange={(event) => update("email", event.target.value)}
          />
        </label>
        <label>
          {copy.form.country}
          <input
            required
            value={draft.country}
            onChange={(event) => update("country", event.target.value)}
          />
        </label>
        <label>
          {copy.form.quantity}
          <input
            min="1"
            type="number"
            value={draft.quantity}
            onChange={(event) => update("quantity", event.target.value)}
          />
        </label>
      </div>
      <label>
        {copy.form.note}
        <textarea
          rows={4}
          value={draft.note}
          onChange={(event) => update("note", event.target.value)}
        />
      </label>
      {state === "error" && (
        <p className="form-error" role="alert">
          {copy.form.required}
        </p>
      )}
      {state === "success" && (
        <p className="form-success" role="status">
          <Check size={16} />
          {copy.form.success}
        </p>
      )}
      <button className="form-submit" type="submit">
        {copy.form.submit}
        <ArrowUpRight size={16} />
      </button>
    </form>
  );
}

function ManifestFilters({
  copy,
  onApply,
}: {
  copy: ReturnType<typeof useLocale>["copy"];
  onApply: (filters: Filters) => void;
}) {
  const [draft, setDraft] = useState(initialFilters);
  const choose = (key: keyof Filters, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }) as Filters);
  return (
    <div className="manifest-filter">
      <div className="manifest-title">
        <span>{copy.filterTitle}</span>
      </div>
      <label>
        {copy.body}
        <select
          value={draft.body}
          onChange={(event) => choose("body", event.target.value)}
        >
          <option value="all">{copy.all}</option>
          {(["SUV", "Sedan", "Pickup", "MPV", "Hatchback"] as Body[]).map(
            (item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ),
          )}
        </select>
      </label>
      <label>
        {copy.condition}
        <select
          value={draft.condition}
          onChange={(event) => choose("condition", event.target.value)}
        >
          <option value="all">{copy.all}</option>
          <option value="new">{copy.new}</option>
          <option value="used">{copy.used}</option>
        </select>
      </label>
      <label>
        {copy.budget}
        <select
          value={draft.budget}
          onChange={(event) => choose("budget", event.target.value)}
        >
          <option value="all">{copy.all}</option>
          <option value="under-18000">&lt; $18k</option>
          <option value="under-26000">&lt; $26k</option>
          <option value="over-26000">$26k+</option>
        </select>
      </label>
      <button
        className="filter-submit"
        type="button"
        onClick={() => onApply(draft)}
      >
        <SlidersHorizontal size={15} />
        {copy.apply}
      </button>
      <button
        className="filter-reset"
        type="button"
        onClick={() => {
          setDraft(initialFilters);
          onApply(initialFilters);
        }}
      >
        {copy.reset}
      </button>
    </div>
  );
}

function VehicleRecord({
  vehicle,
  locale,
  copy,
  index,
}: {
  vehicle: Vehicle;
  locale: Locale;
  copy: ReturnType<typeof useLocale>["copy"];
  index: number;
}) {
  const facts = vehicleFacts(vehicle, locale);
  return (
    <article className={`vehicle-record vehicle-record-${index % 2}`}>
      <div className="record-index">
        <span>{copy.sequence}</span>
        <b>{String(index + 1).padStart(2, "0")}</b>
      </div>
      <div className="record-image">
        <Image
          src={vehicle.image}
          alt={`${vehicle.name} concept vehicle`}
          fill
          sizes="(max-width: 720px) 100vw, 46vw"
        />
        <span>{copy.detail.imageNote}</span>
      </div>
      <div className="record-main">
        <div className="record-name">
          <p>
            {facts.body} · {vehicle.year} ·{" "}
            {vehicle.condition === "new" ? copy.new : copy.used}
          </p>
          <h3>{vehicle.name}</h3>
        </div>
        <div className="record-price">
          <span>{copy.guidePrice}</span>
          <strong>{price(vehicle.price, locale)}</strong>
        </div>
        <dl className="record-facts">
          <div>
            <dt>{copy.power}</dt>
            <dd>{facts.power}</dd>
          </div>
          <div>
            <dt>{copy.range}</dt>
            <dd>{facts.range}</dd>
          </div>
          <div>
            <dt>{copy.year}</dt>
            <dd>{vehicle.year}</dd>
          </div>
          <div>
            <dt>{copy.detail.facts}</dt>
            <dd>
              {vehicle.seats} seats · {facts.drive}
            </dd>
          </div>
        </dl>
        <Link className="record-link" href={`/car/?model=${vehicle.slug}`}>
          {copy.view}
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="record-prep">
        <p>{copy.availability}</p>
        <strong>{copy.demoReady}</strong>
        <dl>
          <div>
            <dt>{copy.inspection}</dt>
            <dd>{facts.inspection}</dd>
          </div>
          <div>
            <dt>{copy.documents}</dt>
            <dd>{facts.documents}</dd>
          </div>
          <div>
            <dt>{copy.loading}</dt>
            <dd>{facts.loading}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

function InventoryResults({
  copy,
  locale,
  results,
}: {
  copy: ReturnType<typeof useLocale>["copy"];
  locale: Locale;
  results: Vehicle[];
}) {
  return (
    <section className="inventory-results" id="inventory">
      <div className="inventory-heading">
        <div>
          <p className="section-mark">{copy.inventoryTag}</p>
          <h2>{copy.inventoryTitle}</h2>
        </div>
        <p>{copy.inventoryText}</p>
      </div>
      {results.length ? (
        <div className="record-list">
          {results.map((vehicle, index) => (
            <VehicleRecord
              key={vehicle.slug}
              vehicle={vehicle}
              locale={locale}
              copy={copy}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="empty-record">
          <ClipboardCheck size={29} />
          <p>{copy.empty}</p>
          <span>{copy.reset}</span>
        </div>
      )}
    </section>
  );
}

function HomeContent({ state }: { state: ReturnType<typeof useLocale> }) {
  const [filters, setFilters] = useState(initialFilters);
  const results = useMemo(() => filterInventory(filters), [filters]);
  return (
    <main>
      <section className="manifest-hero">
        <Image
          src="/export-car-demo/images/hero.jpg"
          alt="Vehicles at an illustrative export yard"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-shutter" />
        <div className="hero-dossier">
          <p>{state.copy.heroTag}</p>
          <h1>{state.copy.heroTitle}</h1>
          <span>{state.copy.heroText}</span>
          <a href="#inventory">
            {state.copy.heroPrimary}
            <ArrowUpRight size={17} />
          </a>
        </div>
        <div className="manifest-count">
          <b>{String(results.length).padStart(2, "0")}</b>
          <span>{state.copy.filterCount}</span>
        </div>
        <ManifestFilters copy={state.copy} onApply={setFilters} />
      </section>
      <InventoryResults
        copy={state.copy}
        locale={state.locale}
        results={results}
      />
      <section className="workspace">
        <aside className="desk-rail">
          <span>EXPORTCAR</span>
          <span>CONCEPT FILES</span>
          <span>2026</span>
        </aside>
        <div className="desk-content">
          <Readiness copy={state.copy} />
          <DocumentMatrix copy={state.copy} />
          <MovementLog copy={state.copy} />
          <BuyerDossier copy={state.copy} />
        </div>
      </section>
    </main>
  );
}

function Readiness({ copy }: { copy: ReturnType<typeof useLocale>["copy"] }) {
  return (
    <section className="readiness-board" id="readiness">
      <div className="board-intro">
        <p className="section-mark">{copy.readinessTag}</p>
        <h2>{copy.readinessTitle}</h2>
        <p>{copy.readinessText}</p>
      </div>
      <div className="board-lines">
        {copy.readiness.map(([title, text, status]) => (
          <article key={title}>
            <FileCheck2 size={19} />
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
            <span>{status}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
function DocumentMatrix({
  copy,
}: {
  copy: ReturnType<typeof useLocale>["copy"];
}) {
  return (
    <section className="document-matrix">
      <div className="matrix-photo">
        <Image
          src="/export-car-demo/images/northline-e5.jpg"
          alt="Illustrative vehicle preparation view"
          fill
          sizes="(max-width:720px) 100vw, 42vw"
        />
      </div>
      <div className="matrix-content">
        <p className="section-mark">{copy.documentsTag}</p>
        <h2>{copy.documentsTitle}</h2>
        <p>{copy.documentsText}</p>
        <div className="document-lines">
          {copy.documentRows.map(([item, status]) => (
            <div key={item}>
              <Check size={15} />
              <span>{item}</span>
              <b>{status}</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function MovementLog({ copy }: { copy: ReturnType<typeof useLocale>["copy"] }) {
  return (
    <section className="movement-log" id="movement">
      <div>
        <p className="section-mark">{copy.movementTag}</p>
        <h2>{copy.movementTitle}</h2>
        <p>{copy.movementText}</p>
      </div>
      <ol>
        {copy.movement.map(([title, text], index) => (
          <li key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
            <ArrowUpRight size={17} />
          </li>
        ))}
      </ol>
    </section>
  );
}
function BuyerDossier({
  copy,
}: {
  copy: ReturnType<typeof useLocale>["copy"];
}) {
  return (
    <section className="buyer-dossier" id="buyer-notes">
      <div className="buyer-notes">
        <p className="section-mark">{copy.faqTag}</p>
        <h2>{copy.faqTitle}</h2>
        {copy.faqs.map(([question, answer]) => (
          <details key={question}>
            <summary>
              {question}
              <ChevronDown size={17} />
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
      <div className="inquiry-dossier">
        <p className="section-mark">{copy.inquiryTag}</p>
        <h2>{copy.inquiryTitle}</h2>
        <p>{copy.inquiryText}</p>
        <InquiryForm copy={copy} />
      </div>
    </section>
  );
}

export function HomeExperience() {
  const state = useLocale();
  return (
    <div className={`shell ${state.locale === "ar" ? "arabic" : ""}`}>
      <Header {...state} />
      <HomeContent state={state} />
      <footer>{state.copy.footer}</footer>
    </div>
  );
}

export function CarExperience() {
  const state = useLocale();
  const [vehicle, setVehicle] = useState(vehicles[0]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVehicle(
        getVehicle(new URLSearchParams(window.location.search).get("model")),
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const facts = vehicleFacts(vehicle, state.locale);
  const copy = state.copy;
  return (
    <div className={`shell ${state.locale === "ar" ? "arabic" : ""}`}>
      <Header {...state} />
      <main className="car-dossier">
        <Link className="dossier-back" href="/">
          <ArrowLeft size={16} />
          {copy.detail.back}
        </Link>
        <section className="dossier-masthead">
          <div className="masthead-file">
            <span>{copy.detail.dossier}</span>
            <b>{vehicle.name}</b>
            <p>
              {facts.body} · {vehicle.year} ·{" "}
              {vehicle.condition === "new" ? copy.new : copy.used}
            </p>
          </div>
          <div className="masthead-meta">
            <div>
              <span>{copy.detail.guidePrice}</span>
              <strong>{price(vehicle.price, state.locale)}</strong>
            </div>
            <div>
              <span>{copy.detail.status}</span>
              <strong>{copy.demoReady}</strong>
            </div>
          </div>
        </section>
        <section className="dossier-image">
          <Image
            src={vehicle.image}
            alt={`${vehicle.name} illustrative vehicle`}
            fill
            priority
            sizes="100vw"
          />
          <span>{copy.detail.imageNote}</span>
        </section>
        <section className="dossier-ledger">
          <div>
            <p className="section-mark">{copy.detail.facts}</p>
            <h2>{vehicle.name}</h2>
            <dl>
              {[
                [copy.power, facts.power],
                [copy.range, facts.range],
                [copy.year, vehicle.year],
                [copy.detail.facts, `${vehicle.seats} · ${facts.drive}`],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="preparation-matrix">
            <p className="section-mark">{copy.detail.preparation}</p>
            <div>
              <span>{copy.inspection}</span>
              <strong>{facts.inspection}</strong>
            </div>
            <div>
              <span>{copy.documents}</span>
              <strong>{facts.documents}</strong>
            </div>
            <div>
              <span>{copy.loading}</span>
              <strong>{facts.loading}</strong>
            </div>
          </div>
        </section>
        <section className="detail-bottom">
          <div className="destination-check">
            <p className="section-mark">{copy.detail.checklist}</p>
            <h2>{copy.detail.destination}</h2>
            {copy.detail.items.map(([item, status]) => (
              <div key={item}>
                <Check size={15} />
                <span>{item}</span>
                <b>{status}</b>
              </div>
            ))}
          </div>
          <div className="inquiry-dossier">
            <p className="section-mark">{copy.inquiryTag}</p>
            <h2>{copy.inquiryTitle}</h2>
            <p>{copy.inquiryText}</p>
            <InquiryForm copy={copy} />
          </div>
        </section>
      </main>
      <footer>{copy.footer}</footer>
    </div>
  );
}
