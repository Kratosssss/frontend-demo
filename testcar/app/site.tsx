"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowLeft, CheckCircle2, ChevronDown, CircleHelp, Globe2, Menu, MoveRight, ShipWheel, SlidersHorizontal, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { BodyStyle, Locale, QuoteDraft, Vehicle, VehicleFilters, formatPrice, getVehicle, locales, translations, vehicles } from "./site-data";

const initialFilters: VehicleFilters = { body: "all", kind: "all", budget: "all" };
const initialQuote: QuoteDraft = { name: "", email: "", country: "", quantity: "1", note: "" };

function useLocale() {
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => {
    const saved = window.localStorage.getItem("testcar-locale");
    const timer = window.setTimeout(() => {
      if (locales.includes(saved as Locale)) setLocale(saved as Locale);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("testcar-locale", locale);
  }, [locale]);
  return { locale, setLocale, copy: translations[locale] };
}

function Brand() { return <Link className="brand" href="/"><span className="brand-mark"><span /><span /></span><span>TEST<span>CAR</span></span></Link>; }

function Header({ copy, locale, setLocale }: ReturnType<typeof useLocale>) {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><Brand /><nav className={open ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">{copy.nav.map((item, index) => <a key={item} onClick={() => setOpen(false)} href={index === 0 ? "#inventory" : index === 1 ? "#why" : index === 2 ? "#process" : "#faq"}>{item}</a>)}</nav><div className="header-actions"><label className="locale-control"><Globe2 size={16} /><span className="sr-only">Language</span><select aria-label="Language" value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>{locales.map((value) => <option key={value} value={value}>{value.toUpperCase()}</option>)}</select><ChevronDown size={14} /></label><button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X /> : <Menu />}</button></div></header>;
}

function VehicleCard({ vehicle, locale, copy }: { vehicle: Vehicle; locale: Locale; copy: ReturnType<typeof useLocale>["copy"] }) {
  return <article className="vehicle-card"><div className="vehicle-visual" style={{ "--accent": vehicle.accent } as React.CSSProperties}><Image src={vehicle.image} alt={`${vehicle.name} concept vehicle`} fill sizes="(max-width: 720px) 100vw, 33vw" /><span>{vehicle.kind === "new" ? copy.new : copy.used}</span><b>{vehicle.year}</b></div><div className="vehicle-card-body"><p>{vehicle.body} / {vehicle.power}</p><h3>{vehicle.name}</h3><div><strong>{formatPrice(vehicle.price, locale)}</strong><span>{vehicle.seats} seats · {vehicle.drive}</span></div><Link href={`/car/?model=${vehicle.slug}`}>{copy.view} <ArrowDownRight size={17} /></Link></div></article>;
}

function QuoteForm({ copy }: { copy: ReturnType<typeof useLocale>["copy"] }) {
  const [draft, setDraft] = useState<QuoteDraft>(initialQuote);
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!draft.name || !draft.email || !draft.country) { setStatus("error"); return; } setStatus("success"); };
  const update = (key: keyof QuoteDraft, value: string) => { setDraft((current) => ({ ...current, [key]: value })); setStatus("idle"); };
  return <form className="quote-form" onSubmit={submit} noValidate><div className="form-grid"><label>{copy.form.name}<input value={draft.name} onChange={(event) => update("name", event.target.value)} required /></label><label>{copy.form.email}<input type="email" value={draft.email} onChange={(event) => update("email", event.target.value)} required /></label><label>{copy.form.country}<input value={draft.country} onChange={(event) => update("country", event.target.value)} required /></label><label>{copy.form.quantity}<input min="1" type="number" value={draft.quantity} onChange={(event) => update("quantity", event.target.value)} /></label></div><label>{copy.form.note}<textarea rows={3} value={draft.note} onChange={(event) => update("note", event.target.value)} /></label>{status === "error" && <p className="form-error" role="alert">{copy.form.required}</p>}{status === "success" && <p className="form-success" role="status"><CheckCircle2 size={17} /> {copy.form.success}</p>}<button className="red-button" type="submit">{copy.form.submit} <MoveRight size={18} /></button></form>;
}

export function HomeExperience() {
  const localeState = useLocale(); const { copy, locale } = localeState;
  const [filters, setFilters] = useState<VehicleFilters>(initialFilters); const [submitted, setSubmitted] = useState(initialFilters);
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    }, { threshold: 0.16 });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);
  const results = useMemo(() => vehicles.filter((vehicle) => (submitted.body === "all" || vehicle.body === submitted.body) && (submitted.kind === "all" || vehicle.kind === submitted.kind) && (submitted.budget === "all" || submitted.budget === "under-15000" && vehicle.price < 15000 || submitted.budget === "under-22000" && vehicle.price < 22000 || submitted.budget === "over-22000" && vehicle.price >= 22000)), [submitted]);
  const select = (key: keyof VehicleFilters, value: string) => setFilters((current) => ({ ...current, [key]: value } as VehicleFilters));
  return <div className={`site-shell${locale === "ar" ? " is-arabic" : ""}`}><Header {...localeState} /><main><section className="hero"><div className="hero-copy"><p className="eyebrow">{copy.heroKicker}</p><h1>{copy.heroTitle}</h1><p className="hero-text">{copy.heroCopy}</p><div className="hero-links"><a className="red-button" href="#inventory">{copy.heroPrimary} <ArrowDownRight size={18} /></a><a className="line-link" href="#process">{copy.heroSecondary} <MoveRight size={18} /></a></div></div><div className="hero-visual"><Image src="/testcar/images/hero-car.jpg" alt="TestCar export concept hero vehicle" fill priority sizes="100vw" /><span className="hero-stamp">TESTCAR<br />EXPORT</span><span className="hero-number">01 / 06</span></div></section>
  <section className="filter-panel" data-reveal aria-labelledby="filter-title"><div><p className="eyebrow">INVENTORY FINDER</p><h2 id="filter-title">{copy.filterTitle}</h2><p>{copy.filterCopy}</p></div><div className="filter-controls"><label>{copy.body}<select value={filters.body} onChange={(event) => select("body", event.target.value)}><option value="all">{copy.all}</option>{(["SUV", "Sedan", "MPV", "Pickup", "Hatchback"] as BodyStyle[]).map((item) => <option key={item}>{item}</option>)}</select></label><label>{copy.kind}<select value={filters.kind} onChange={(event) => select("kind", event.target.value)}><option value="all">{copy.all}</option><option value="new">{copy.new}</option><option value="used">{copy.used}</option></select></label><label>{copy.budget}<select value={filters.budget} onChange={(event) => select("budget", event.target.value)}><option value="all">{copy.all}</option><option value="under-15000">&lt; $15k</option><option value="under-22000">&lt; $22k</option><option value="over-22000">$22k+</option></select></label><button onClick={() => setSubmitted(filters)} className="filter-button"><SlidersHorizontal size={17} /> {copy.filter}</button><button onClick={() => { setFilters(initialFilters); setSubmitted(initialFilters); }} className="reset-button">{copy.reset}</button></div></section>
  <section className="inventory section-wrap" id="inventory"><div className="section-head" data-reveal><div><p className="eyebrow">01 / INVENTORY</p><h2>{copy.latest}</h2></div><p>{copy.latestCopy}</p></div>{results.length ? <div className="vehicle-grid">{results.map((vehicle) => <VehicleCard key={vehicle.slug} vehicle={vehicle} locale={locale} copy={copy} />)}</div> : <div className="empty-state"><CircleHelp size={26} /><p>{copy.empty}</p><button onClick={() => { setFilters(initialFilters); setSubmitted(initialFilters); }}>{copy.reset}</button></div>}</section>
  <section className="proof section-wrap" id="why"><div className="proof-intro"><p className="eyebrow">{copy.trustKicker}</p><h2>{copy.trustTitle}</h2><p>{copy.trustCopy}</p></div><div className="stats">{copy.stats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div><div className="service-list">{copy.services.map(([title, desc], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{desc}</p></article>)}</div></section>
  <section className="process" id="process"><div className="section-wrap"><div className="section-head"><div><p className="eyebrow">02 / EXPORT PATH</p><h2>{copy.processTitle}</h2></div><p>{copy.processCopy}</p></div><ol>{copy.steps.map((step, index) => <li key={step}><span>0{index + 1}</span><strong>{step}</strong><ShipWheel size={18} /></li>)}</ol></div></section>
  <section className="story section-wrap"><div><p className="eyebrow">TESTCAR / CONCEPT</p><h2>{copy.storyTitle}</h2></div><p>{copy.storyCopy}</p></section>
  <section className="faq section-wrap" id="faq"><div className="section-head"><div><p className="eyebrow">03 / FAQ</p><h2>{copy.faqTitle}</h2></div></div><div className="faq-list">{copy.faqs.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={18} /></summary><p>{answer}</p></details>)}</div></section>
  <section className="quote section-wrap" id="quote"><div><p className="eyebrow">04 / DEMO INQUIRY</p><h2>{copy.quoteTitle}</h2><p>{copy.quoteCopy}</p></div><QuoteForm copy={copy} /></section></main><footer>{copy.footer}</footer></div>;
}

export function CarExperience() {
  const localeState = useLocale(); const { copy, locale } = localeState;
  const [vehicle, setVehicle] = useState<Vehicle>(vehicles[0]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVehicle(getVehicle(new URLSearchParams(window.location.search).get("model")));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  return <div className="site-shell"><Header {...localeState} /><main className="detail-page"><Link className="back-link" href="/"><ArrowLeft size={17} /> {copy.detail.back}</Link><section className="detail-hero"><div><p className="eyebrow">{copy.detail.label}</p><h1>{vehicle.name}</h1><p>{copy.detail.copy}</p><a href="#detail-quote" className="red-button">{copy.detail.inquiry} <ArrowDownRight size={18} /></a></div><div className="detail-image"><Image src={vehicle.image} alt={`${vehicle.name} concept vehicle`} fill sizes="(max-width: 720px) 100vw, 50vw" /><span>{vehicle.kind === "new" ? copy.new : copy.used}</span></div></section><section className="detail-specs section-wrap"><div><p className="eyebrow">01 / {copy.detail.overview}</p><h2>{copy.detail.title}</h2><p>{copy.detail.demo}</p></div><dl><div><dt>{copy.detail.specs}</dt><dd>{vehicle.power}</dd></div><div><dt>Body</dt><dd>{vehicle.body}</dd></div><div><dt>Range</dt><dd>{vehicle.range}</dd></div><div><dt>Drive</dt><dd>{vehicle.drive}</dd></div><div><dt>Seats</dt><dd>{vehicle.seats}</dd></div><div><dt>Guide price</dt><dd>{formatPrice(vehicle.price, locale)}</dd></div></dl></section><section className="quote section-wrap" id="detail-quote"><div><p className="eyebrow">02 / DEMO INQUIRY</p><h2>{copy.quoteTitle}</h2><p>{copy.quoteCopy}</p></div><QuoteForm copy={copy} /></section></main><footer>{copy.footer}</footer></div>;
}
