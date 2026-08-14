import { useEffect, useMemo, useRef, useState } from "react";
import { HashRouter, Link, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { AlertTriangle, ArrowLeft, ChevronDown, ChevronRight, FileText, Menu, PanelRightOpen, Search, X } from "lucide-react";
import { loadKnowledge, moduleMeta, searchNotes } from "./knowledge";
import type { KnowledgeIndex, KnowledgeNote } from "./types";

type AppData = { index: KnowledgeIndex | null; state: "loading" | "ready" | "error" };
type LayoutProps = { data: AppData };
const moduleIds = Object.keys(moduleMeta) as KnowledgeNote["module"][];

function App() {
  const [data, setData] = useState<AppData>({ index: null, state: "loading" });
  useEffect(() => { loadKnowledge().then((index) => setData({ index, state: "ready" })).catch(() => setData({ index: null, state: "error" })); }, []);
  return <HashRouter><Shell data={data} /></HashRouter>;
}

function Shell(props: LayoutProps) {
  const location = useLocation();
  return <ShellFrame key={location.pathname} {...props} />;
}

function ShellFrame(props: LayoutProps) {
  const [navOpen, setNavOpen] = useState(false); const [contextOpen, setContextOpen] = useState(false);
  const notes = props.data.index?.notes ?? [];
  return <div className="app-shell">
    <a className="skip-link" href="#main">跳到主要内容</a>
    <header className="topbar"><button className="icon-button mobile-only" aria-label="打开学习导航" onClick={() => setNavOpen(true)}><Menu /></button><span className="stamp">P007</span><a className="back-link" href="../"><ArrowLeft />返回作品集</a><span className="brand">AI LEARNING / KB-01</span><span className="global-status">12 NOTES · 6 MODULES</span><button className="icon-button context-toggle" aria-label="打开上下文工具" onClick={() => setContextOpen(true)}><PanelRightOpen /></button></header>
    <div className="workspace">
      <aside className={`left-rail ${navOpen ? "is-open" : ""}`} aria-label="学习导航"><button className="icon-button close-drawer mobile-only" aria-label="关闭学习导航" onClick={() => setNavOpen(false)}><X /></button><KnowledgeNav notes={notes} /></aside>
      {navOpen && <button className="scrim mobile-only" aria-label="关闭学习导航" onClick={() => setNavOpen(false)} />}
      <main id="main" className="content" tabIndex={-1}>{props.data.state === "loading" ? <LoadingState /> : props.data.state === "error" ? <IndexError /> : <PageRoutes {...props} />}</main>
      <aside className={`context-rail ${contextOpen ? "is-open" : ""}`} aria-label="上下文工具"><button className="icon-button close-drawer mobile-only" aria-label="关闭上下文工具" onClick={() => setContextOpen(false)}><X /></button><ContextPanel notes={notes} /></aside>
      {contextOpen && <button className="scrim context-scrim" aria-label="关闭上下文工具" onClick={() => setContextOpen(false)} />}
    </div>
  </div>;
}

function KnowledgeNav({ notes }: { notes: KnowledgeNote[] }) {
  const current = useLocation().pathname; const [open, setOpen] = useState<string | null>(null);
  return <nav><p className="rail-label">KNOWLEDGE MAP</p><h2>六阶段学习路径</h2>{moduleIds.map((id) => { const meta = moduleMeta[id]; const group = notes.filter((note) => note.module === id); const expanded = open === id || group.some((note) => current.includes(note.slug)); return <section className="module-nav" key={id}><button aria-expanded={expanded} onClick={() => setOpen(expanded ? null : id)}><span className="module-number">{meta.number}</span><span>{meta.name}</span><ChevronDown /></button>{expanded && <div className="note-links">{group.map((note) => <Link key={note.slug} aria-current={current.includes(note.slug) ? "page" : undefined} to={`/notes/${note.slug}`}>{note.title}</Link>)}</div>}</section>; })}<div className="rail-actions"><Link to="/search"><Search />全文搜索</Link></div></nav>;
}

function ContextPanel({ notes }: { notes: KnowledgeNote[] }) { const path = useLocation().pathname; if (path.startsWith("/notes/")) { const note = notes.find((item) => path.includes(item.slug)); const scroll = (anchor: string) => document.getElementById(anchor)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); return <><p className="rail-label">ARTICLE INDEX</p><h2>本文目录</h2>{note?.headings.map((heading) => <button key={heading.anchor} type="button" onClick={() => scroll(heading.anchor)} className={`heading-${heading.level}`}>{heading.text}</button>)}</>; } if (path.startsWith("/search")) return <><p className="rail-label">SEARCH SCOPE</p><h2>搜索范围</h2><p>标题 / 摘要 / 标签 / 小标题 / 正文</p><p className="muted">中文与英文子串匹配，标题权重最高。</p></>; return <><p className="rail-label">KNOWLEDGE BASE</p><h2>资料边界</h2><dl><dt>笔记</dt><dd>{notes.length} 篇</dd><dt>模块</dt><dd>6 个</dd></dl><p className="muted">全部内容公开阅读，数据来自仓库内经过校验的原创 Markdown 笔记。</p><Link className="primary-link" to="/search">搜索知识库</Link></>; }

function PageRoutes(props: LayoutProps) { return <Routes><Route path="/" element={<MapPage notes={props.data.index?.notes ?? []} />} /><Route path="/notes/:slug" element={<NotePage notes={props.data.index?.notes ?? []} />} /><Route path="/search" element={<SearchPage notes={props.data.index?.notes ?? []} />} /><Route path="*" element={<NotFound />} /></Routes>; }
function LoadingState() { return <section aria-busy="true"><p className="eyebrow">KB-01 / STARTUP</p><h1>正在启动知识库…</h1><div className="skeleton-lines"><i /><i /><i /><i /><i /><i /></div></section>; }
function IndexError() { return <section className="status-block"><AlertTriangle /><p className="eyebrow">INDEX ERROR</p><h1>知识库暂时无法读取</h1><p>内容索引未通过校验。</p><button onClick={() => location.reload()}>重新加载</button></section>; }

function MapPage({ notes }: { notes: KnowledgeNote[] }) { return <section className="map-page"><p className="eyebrow">学习地图 / KB-01</p><h1>AI 学习知识库</h1><p className="lede">从概念到可验证实践</p><p className="intro">沿六个阶段建立 AI 基础认知。阅读 12 篇原创中文笔记，随时搜索，并从来源回看每个结论。</p><div className="button-row"><Link className="button solid" to={notes[0] ? `/notes/${notes[0].slug}` : "/search"}>从第一阶段开始</Link><Link className="button" to="/search">搜索知识库</Link></div><div className="learning-track">{moduleIds.map((id) => { const meta = moduleMeta[id]; const group = notes.filter((note) => note.module === id); return <section className="module-row" key={id}><span className="module-number">{meta.number}</span><div><h2>{meta.name}</h2><p>{meta.purpose}</p>{group.map((note) => <Link className="note-row" to={`/notes/${note.slug}`} key={note.slug}><FileText /><span><strong>{note.title}</strong><small>{note.summary}</small></span><ChevronRight /></Link>)}</div></section>; })}</div><p className="footnote">建议按顺序阅读，但你可以从任何阶段开始。这里不记录学习进度。</p></section>; }

function NotePage({ notes }: { notes: KnowledgeNote[] }) { const { slug } = useParams(); const note = notes.find((item) => item.slug === slug); if (!note) return <section className="status-block"><p className="eyebrow">NOTE / 404</p><h1>未找到这篇笔记</h1><p>链接可能已变更，或内容尚未发布。</p><div className="button-row"><Link className="button" to="/">返回学习地图</Link><Link className="button" to="/search">搜索知识库</Link></div></section>; const meta = moduleMeta[note.module]; return <article className="note-page"><nav className="breadcrumb"><Link to="/">学习地图</Link> / {meta.name} / {note.title}</nav><p className="eyebrow">{meta.number} / {meta.name}</p><h1>{note.title}</h1><p className="lede">{note.summary}</p><div className="metadata"><span>更新于 {note.updatedAt}</span><span>预计阅读 {Math.max(1, Math.ceil(note.body.length / 480))} 分钟</span>{note.tags.map((tag) => <span key={tag}>#{tag}</span>)}<span>前置知识：{note.prerequisites.length ? note.prerequisites.join("、") : "无"}</span></div><Markdown body={note.body} headings={note.headings} /><section className="sources"><h2>原始来源</h2>{note.sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.title}<small>在新标签页打开</small></a>)}</section></article>; }

export function Markdown({ body, headings }: { body: string; headings: KnowledgeNote["headings"] }) { const sourceBoundary = body.search(/^##\s+原始来源\s*$/m); const safeBody = sourceBoundary >= 0 ? body.slice(0, sourceBoundary) : body; const anchors = new Map(headings.map((heading) => [heading.text, heading.anchor])); return <div className="markdown"><ReactMarkdown skipHtml components={{ h2: ({ children }) => <h2 id={anchors.get(String(children))}>{children}</h2>, h3: ({ children }) => <h3 id={anchors.get(String(children))}>{children}</h3> }}>{safeBody}</ReactMarkdown></div>; }

function SearchPage({ notes }: { notes: KnowledgeNote[] }) { const navigate = useNavigate(); const location = useLocation(); const initial = new URLSearchParams(location.search).get("q") ?? ""; const [query, setQuery] = useState(initial); const input = useRef<HTMLInputElement>(null); const normalized = query.trim(); const hits = useMemo(() => normalized.length >= 2 ? searchNotes(notes, normalized) : [], [notes, normalized]); useEffect(() => { const handler = (event: globalThis.KeyboardEvent) => { if (event.key === "/" && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) { event.preventDefault(); input.current?.focus(); } }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, []); useEffect(() => { const timer = window.setTimeout(() => navigate(normalized ? `/search?q=${encodeURIComponent(normalized)}` : "/search", { replace: true }), 250); return () => window.clearTimeout(timer); }, [navigate, normalized]); return <section className="search-page"><p className="eyebrow">SEARCH / KB-01</p><h1>全文搜索</h1><p className="lede">搜索 12 篇中文笔记</p><form className="search-form" onSubmit={(event) => { event.preventDefault(); navigate(`/search?q=${encodeURIComponent(query.trim())}`); }}><Search /><input ref={input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="输入概念、术语或问题，例如：Embedding 有什么用？" aria-label="搜索知识库" /><button type="submit">搜索</button>{query && <button className="text-button" type="button" aria-label="清空搜索词" onClick={() => setQuery("")}>清空</button>}</form><p className="shortcut">按 / 聚焦搜索</p>{!normalized ? <EmptySearch /> : normalized.length < 2 ? <Status title="再输入一个字符" detail="至少输入 2 个字符以获得稳定结果。" /> : hits.length === 0 ? <Status title={`没有找到“${normalized}”`} detail="换一个术语，或返回学习地图按阶段浏览。" action="查看学习地图" /> : <div aria-live="polite"><h2 className="result-count">找到 {hits.length} 篇相关笔记</h2>{hits.map((hit) => <Link className="result" to={`/notes/${hit.note.slug}`} key={hit.note.slug}><span className="module-number">{moduleMeta[hit.note.module].number}</span><div><h3>{hit.note.title}</h3><p>{hit.excerpt}</p><small>{hit.fields.join(" / ")} · {hit.note.updatedAt}</small></div><ChevronRight /></Link>)}</div>}</section>; }
function EmptySearch() { return <Status title="搜索整个知识库" detail="可按标题、摘要、标签、小标题和正文查找。" />; }
function Status({ title, detail, action }: { title: string; detail: string; action?: string }) { return <section className="status-block"><h2>{title}</h2><p>{detail}</p>{action && <Link className="button" to="/">{action}</Link>}</section>; }

function NotFound() { return <section className="status-block"><p className="eyebrow">ERROR / 404</p><h1>没有找到这个页面</h1><p>链接可能已变更。你可以返回学习地图，或搜索需要的概念。</p><div className="button-row"><Link className="button" to="/">返回学习地图</Link><Link className="button" to="/search">全文搜索</Link></div></section>; }

export default App;
