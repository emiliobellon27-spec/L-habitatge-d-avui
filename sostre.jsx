import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";
import {
  Home, BookOpen, BarChart3, Newspaper, Info, Plus, X, ExternalLink,
  ArrowRight, Menu, Trash2, Calendar
} from "lucide-react";

/* ---------------------------------------------------------------
   SOSTRE — revista digital sobre la crisi de l'habitatge a Espanya
   Token system:
   - Paper #F1EFE7 / Ink #17181A
   - Signal blue #1E4FD6 (accent primary — "cartell de lloguer")
   - Signal red #C4362A (accent alert — pujades de preu)
   - Ochre #C79A1E (accent highlight)
   - Display: Fraunces / Body: Inter / Data: IBM Plex Mono
------------------------------------------------------------------*/

const FONT_LINK_ID = "sostre-fonts";
function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);
}

const TICKER_ITEMS = [
  { label: "Preu mitjà del pis", value: "2.186 €/m²", delta: "+12,7%", up: true },
  { label: "Lloguer mensual", value: "13,29 €/m²", delta: "+14%", up: true },
  { label: "Sou jove destinat a llogar un pis mitjà", value: "83,7%", delta: "", up: true },
  { label: "Llars amb dificultats d'habitatge", value: "1 de cada 4", delta: "", up: true },
  { label: "Edat mitjana d'emancipació a Espanya", value: "30,4 anys", delta: "+4 anys vs. UE", up: true },
  { label: "Habitatges turístics registrats", value: "329.764", delta: "2025", up: true },
];

const PRICE_2007_2025 = [
  { any: "2007", preu: 2070 },
  { any: "2014", preu: 1383 - 220 }, // visual low point marker only used loosely below; replaced by real series
];

const PRICE_SERIES = [
  { any: "2007", preu: 2070 },
  { any: "2020", preu: 1650 },
  { any: "2025", preu: 2186 },
];

const RENT_SERIES = [
  { any: "2014", preu: 6.91 },
  { any: "2018", preu: 8.30 },
  { any: "2021", preu: 10.27 },
  { any: "2024", preu: 13.29 },
];

const TENURE_DATA = [
  { pais: "Romania", propietat: 95.3 },
  { pais: "Espanya", propietat: 73.7 },
  { pais: "UE (mitjana)", propietat: 68.4 },
  { pais: "Alemanya", propietat: 47.2 },
];

const EMANCIPATION_DATA = [
  { pais: "Suècia", edat: 21.4 },
  { pais: "Finlàndia", edat: 21.9 },
  { pais: "Mitjana UE", edat: 26.4 },
  { pais: "Espanya", edat: 30.4 },
];

const REVISTA_SECTIONS = [
  {
    id: "intro",
    num: "01",
    title: "Introducció",
    excerpt:
      "Per què costa tant, avui, tenir un lloc propi on viure — i per què això afecta especialment els joves.",
    body:
      "Aquesta revista neix com la part pràctica d'un Treball de Recerca sobre la crisi de l'habitatge a Espanya. L'objectiu és traduir les dades i l'anàlisi del treball en consells concrets i útils per a joves que, com jo, es plantegen com i quan podran emancipar-se.",
  },
  {
    id: "comprar-llogar",
    num: "02",
    title: "Comprar o llogar?",
    excerpt:
      "Els avantatges i inconvenients reals de cada opció, sense idealitzar cap de les dues.",
    body:
      "Comprar dona estabilitat a llarg termini però exigeix un estalvi inicial cada cop més difícil d'assolir. Llogar dona flexibilitat però, amb els preus actuals, pot suposar destinar-hi una part molt gran del sou. La decisió depèn de la teva situació laboral, del temps que et vulguis quedar a un lloc i de quant pots estalviar cada mes.",
  },
  {
    id: "buscar",
    num: "03",
    title: "Com buscar un habitatge de manera fàcil i segura",
    excerpt:
      "Portals fiables, senyals d'alerta d'estafes i documentació que has de tenir a punt.",
    body:
      "Fes servir portals coneguts, desconfia de preus massa baixos per a la zona, no facis mai un pagament sense haver vist el pis en persona (o per videotrucada verificada) i porta sempre nòmina, contracte i darreres declaracions a punt per agilitzar el procés.",
  },
  {
    id: "dificil",
    num: "04",
    title: "Per què és difícil accedir a un habitatge?",
    excerpt:
      "Un resum, en llenguatge planer, dels factors analitzats al treball: preus, salaris, turisme i especulació.",
    body:
      "En resum: els preus han pujat molt més ràpid que els sous, una part important del parc d'habitatges es destina a lloguer turístic o segona residència, i la manca d'oferta d'habitatge protegit agreuja el problema. Tot això ho trobaràs desenvolupat amb dades a la secció «Dades».",
  },
  {
    id: "ajuts",
    num: "05",
    title: "Ajuts i subvencions disponibles",
    excerpt: "Bo Jove de Lloguer, avals ICO i altres ajudes que potser no coneixes.",
    body:
      "Existeixen ajudes com el Bo Jove de Lloguer (fins a 250 €/mes per a menors de 35 anys), avals públics per a l'entrada d'una hipoteca en determinades condicions, i programes autonòmics específics. Val la pena revisar-los abans de descartar una opció per manca de diners.",
  },
  {
    id: "entrevistes",
    num: "06",
    title: "Entrevistes i opinions",
    excerpt:
      "Veus del sector: notaria, banca, immobiliàries i propietaris d'Airbnb, cara a cara amb el problema.",
    body:
      "Per a aquesta secció s'han entrevistat, entre d'altres, un director financer d'INCASÒL, un director d'oficina bancària, un director financer d'una immobiliària, un propietari de pisos turístics a Cadaqués i un notari, per contrastar diferents mirades professionals sobre el mercat.",
  },
  {
    id: "conclusions",
    num: "07",
    title: "Conclusions",
    excerpt: "Què hem après i què pot fer, realment, algú que té 18 anys avui.",
    body:
      "L'accés a l'habitatge no depèn només de l'esforç individual: és un problema estructural. Tot i això, entendre com funciona el mercat, conèixer els ajuts disponibles i planificar l'estalvi amb temps són les eines que sí que estan a l'abast de cada jove.",
  },
];

/* ---------------- small building blocks ---------------- */

function Ticker() {
  return (
    <div className="ticker-wrap">
      <div className="ticker-track">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span className="ticker-item" key={i}>
            <span className="ticker-label">{item.label}</span>
            <span className="ticker-value">{item.value}</span>
            {item.delta && <span className="ticker-delta">{item.delta}</span>}
            <span className="ticker-dot">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Masthead({ page, setPage, mobileOpen, setMobileOpen }) {
  const NAV = [
    { id: "portada", label: "Portada", icon: Home },
    { id: "revista", label: "La Revista", icon: BookOpen },
    { id: "dades", label: "Dades", icon: BarChart3 },
    { id: "noticies", label: "Notícies", icon: Newspaper },
    { id: "sobre", label: "Sobre", icon: Info },
  ];
  return (
    <header className="masthead">
      <div className="masthead-top">
        <div className="masthead-date">
          {new Date().toLocaleDateString("ca-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
        <div className="masthead-tag">Un projecte de recerca sobre l'habitatge a Espanya</div>
      </div>
      <div className="masthead-main">
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Obrir menú"
        >
          <Menu size={22} />
        </button>
        <button className="wordmark" onClick={() => setPage("portada")}>
          SOSTRE
        </button>
        <div className="masthead-spacer" />
      </div>
      <nav className={`nav ${mobileOpen ? "nav-open" : ""}`}>
        {NAV.map((n) => (
          <button
            key={n.id}
            className={`nav-item ${page === n.id ? "nav-item-active" : ""}`}
            onClick={() => {
              setPage(n.id);
              setMobileOpen(false);
            }}
          >
            <n.icon size={15} strokeWidth={2} />
            {n.label}
          </button>
        ))}
      </nav>
      <Ticker />
    </header>
  );
}

function StatCard({ value, label, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

/* ---------------- pages ---------------- */

function Portada({ setPage }) {
  return (
    <div className="page fade-in">
      <section className="hero">
        <div className="hero-eyebrow">Treball de Recerca · Batxillerat</div>
        <h1 className="hero-title">
          Cada vegada costa més
          <br />
          tenir un sostre propi.
        </h1>
        <p className="hero-sub">
          Una investigació sobre la crisi de l'habitatge a Espanya — preus, lloguers,
          especulació i emancipació juvenil — convertida en revista, dades i notícies
          perquè qualsevol jove pugui entendre-hi alguna cosa més.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => setPage("revista")}>
            Llegeix la revista <ArrowRight size={16} />
          </button>
          <button className="btn btn-ghost" onClick={() => setPage("dades")}>
            Mira les dades
          </button>
        </div>
      </section>

      <section className="stat-grid">
        <StatCard value="2.186 €/m²" label="Preu mitjà del pis (2025)" sub="rècord històric, per sobre del 2007" />
        <StatCard value="+80%" label="Pujada del lloguer en 10 anys" sub="de 7 €/m² a 13,29 €/m² al mes" />
        <StatCard value="30,4 anys" label="Edat mitjana d'emancipació" sub="4 anys per sobre de la mitjana UE" />
        <StatCard value="1 de 4" label="Llars amb dificultats d'habitatge" sub="9 de cada 10 en exclusió severa" />
      </section>

      <section className="teaser-grid">
        <button className="teaser-card" onClick={() => setPage("revista")}>
          <span className="teaser-num">01</span>
          <h3>Consells per a joves</h3>
          <p>Comprar o llogar, com buscar pis sense caure en estafes, i quins ajuts existeixen.</p>
          <span className="teaser-link">Llegir la revista <ArrowRight size={14} /></span>
        </button>
        <button className="teaser-card" onClick={() => setPage("dades")}>
          <span className="teaser-num">02</span>
          <h3>El mercat, en xifres</h3>
          <p>Evolució del preu de compra i lloguer, comparativa europea de propietat i emancipació.</p>
          <span className="teaser-link">Veure els gràfics <ArrowRight size={14} /></span>
        </button>
        <button className="teaser-card" onClick={() => setPage("noticies")}>
          <span className="teaser-num">03</span>
          <h3>Actualitat</h3>
          <p>Notícies i actualitzacions sobre l'habitatge que vaig afegint a mesura que passen.</p>
          <span className="teaser-link">Veure notícies <ArrowRight size={14} /></span>
        </button>
      </section>
    </div>
  );
}

function Revista() {
  const [open, setOpen] = useState("intro");
  return (
    <div className="page fade-in">
      <div className="page-head">
        <span className="page-eyebrow">La revista</span>
        <h1 className="page-title">Consells per a joves</h1>
        <p className="page-sub">
          La part pràctica del treball: set apartats per entendre i afrontar l'accés a
          l'habitatge amb la informació que a mi m'hauria agradat tenir abans.
        </p>
      </div>
      <div className="accordion">
        {REVISTA_SECTIONS.map((s) => {
          const isOpen = open === s.id;
          return (
            <div className={`acc-item ${isOpen ? "acc-open" : ""}`} key={s.id}>
              <button className="acc-head" onClick={() => setOpen(isOpen ? null : s.id)}>
                <span className="acc-num">{s.num}</span>
                <span className="acc-title-wrap">
                  <span className="acc-title">{s.title}</span>
                  <span className="acc-excerpt">{s.excerpt}</span>
                </span>
                <span className={`acc-caret ${isOpen ? "acc-caret-open" : ""}`}>+</span>
              </button>
              {isOpen && (
                <div className="acc-body">
                  <p>{s.body}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChartCard({ eyebrow, title, caption, children }) {
  return (
    <div className="chart-card">
      <span className="chart-eyebrow">{eyebrow}</span>
      <h3 className="chart-title">{title}</h3>
      <div className="chart-body">{children}</div>
      <p className="chart-caption">{caption}</p>
    </div>
  );
}

function Dades() {
  return (
    <div className="page fade-in">
      <div className="page-head">
        <span className="page-eyebrow">Dades</span>
        <h1 className="page-title">El mercat, en xifres</h1>
        <p className="page-sub">
          Els mateixos gràfics del treball de recerca, en versió interactiva.
        </p>
      </div>

      <div className="chart-grid">
        <ChartCard
          eyebrow="Compra"
          title="Preu mitjà de l'habitatge (€/m²)"
          caption="Font: Consejo General del Notariado / Sociedad de Tasación. 2007, 2020, 2025."
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={PRICE_SERIES} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#DEDACD" />
              <XAxis dataKey="any" tick={{ fill: "#5B584E", fontFamily: "IBM Plex Mono", fontSize: 12 }} axisLine={{ stroke: "#DEDACD" }} tickLine={false} />
              <YAxis tick={{ fill: "#5B584E", fontFamily: "IBM Plex Mono", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(30,79,214,0.06)" }}
                contentStyle={{ fontFamily: "Inter", borderRadius: 4, border: "1px solid #DEDACD" }}
                formatter={(v) => [`${v} €/m²`, "Preu"]}
              />
              <Bar dataKey="preu" radius={[3, 3, 0, 0]} maxBarSize={72}>
                {PRICE_SERIES.map((entry, i) => (
                  <Cell key={i} fill={entry.any === "2025" ? "#C4362A" : "#1E4FD6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          eyebrow="Lloguer"
          title="Preu mitjà del lloguer (€/m² al mes)"
          caption="Font: Índex Immobiliari Fotocasa. 2014–2024."
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={RENT_SERIES} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#DEDACD" />
              <XAxis dataKey="any" tick={{ fill: "#5B584E", fontFamily: "IBM Plex Mono", fontSize: 12 }} axisLine={{ stroke: "#DEDACD" }} tickLine={false} />
              <YAxis tick={{ fill: "#5B584E", fontFamily: "IBM Plex Mono", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontFamily: "Inter", borderRadius: 4, border: "1px solid #DEDACD" }}
                formatter={(v) => [`${v} €/m²`, "Lloguer"]}
              />
              <Line type="monotone" dataKey="preu" stroke="#C4362A" strokeWidth={2.5} dot={{ r: 4, fill: "#C4362A" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          eyebrow="Europa"
          title="Percentatge de propietaris"
          caption="Font: Eurostat, Distribution of population by tenure status (ilc_lvho02), 2024."
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={TENURE_DATA} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
              <CartesianGrid horizontal={false} stroke="#DEDACD" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#5B584E", fontFamily: "IBM Plex Mono", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="pais" type="category" width={95} tick={{ fill: "#17181A", fontFamily: "Inter", fontSize: 12.5 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontFamily: "Inter", borderRadius: 4, border: "1px solid #DEDACD" }}
                formatter={(v) => [`${v}%`, "En propietat"]}
              />
              <Bar dataKey="propietat" radius={[0, 3, 3, 0]} maxBarSize={22}>
                {TENURE_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.pais === "Espanya" ? "#C4362A" : "#1E4FD6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          eyebrow="Emancipació"
          title="Edat mitjana d'emancipació"
          caption="Font: Eurostat / Observatori d'Emancipació, Consell de la Joventut d'Espanya."
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={EMANCIPATION_DATA} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#DEDACD" />
              <XAxis dataKey="pais" tick={{ fill: "#5B584E", fontFamily: "Inter", fontSize: 11.5 }} axisLine={{ stroke: "#DEDACD" }} tickLine={false} />
              <YAxis domain={[0, 32]} tick={{ fill: "#5B584E", fontFamily: "IBM Plex Mono", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontFamily: "Inter", borderRadius: 4, border: "1px solid #DEDACD" }}
                formatter={(v) => [`${v} anys`, "Edat"]}
              />
              <Bar dataKey="edat" radius={[3, 3, 0, 0]} maxBarSize={56}>
                {EMANCIPATION_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.pais === "Espanya" ? "#C4362A" : "#C79A1E"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function timeAgo(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("ca-ES", { day: "numeric", month: "short", year: "numeric" });
}

function Noticies() {
  const [articles, setArticles] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", summary: "", url: "", source: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await window.storage.get("sostre:articles", true);
      const list = res ? JSON.parse(res.value) : [];
      setArticles(list);
    } catch {
      setArticles([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addArticle(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setErr("Cal un titular.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const newItem = {
        id: `${Date.now()}`,
        title: form.title.trim(),
        summary: form.summary.trim(),
        url: form.url.trim(),
        source: form.source.trim(),
        date: new Date().toISOString(),
      };
      const current = articles || [];
      const updated = [newItem, ...current];
      await window.storage.set("sostre:articles", JSON.stringify(updated), true);
      setArticles(updated);
      setForm({ title: "", summary: "", url: "", source: "" });
      setShowForm(false);
    } catch {
      setErr("No s'ha pogut desar. Torna-ho a provar.");
    } finally {
      setSaving(false);
    }
  }

  async function removeArticle(id) {
    const updated = (articles || []).filter((a) => a.id !== id);
    setArticles(updated);
    try {
      await window.storage.set("sostre:articles", JSON.stringify(updated), true);
    } catch {}
  }

  return (
    <div className="page fade-in">
      <div className="page-head">
        <span className="page-eyebrow">Actualitat</span>
        <h1 className="page-title">Notícies</h1>
        <p className="page-sub">
          Anirè afegint aquí notícies i novetats relacionades amb l'habitatge a mesura que
          vagin sortint.
        </p>
        <button className="btn btn-primary btn-small" onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? "Tancar" : "Afegir notícia"}
        </button>
        <p className="storage-note">
          Nota: les notícies que afegeixis es guarden per a tothom qui visiti aquesta pàgina.
        </p>
      </div>

      {showForm && (
        <form className="news-form" onSubmit={addArticle}>
          <div className="field">
            <label>Titular *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: El govern amplia el Bo Jove de Lloguer"
            />
          </div>
          <div className="field">
            <label>Resum</label>
            <textarea
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Dues o tres frases sobre la notícia"
              rows={3}
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Font</label>
              <input
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="Ex: El País"
              />
            </div>
            <div className="field">
              <label>Enllaç</label>
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://…"
              />
            </div>
          </div>
          {err && <p className="form-err">{err}</p>}
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Desant…" : "Publicar notícia"}
          </button>
        </form>
      )}

      <div className="news-list">
        {articles === null && <p className="news-empty">Carregant…</p>}
        {articles && articles.length === 0 && (
          <div className="news-empty-card">
            <Newspaper size={22} strokeWidth={1.5} />
            <p>Encara no hi ha cap notícia. Afegeix la primera amb el botó de dalt.</p>
          </div>
        )}
        {articles &&
          articles.map((a) => (
            <article className="news-item" key={a.id}>
              <div className="news-meta">
                <Calendar size={12} /> {timeAgo(a.date)}
                {a.source && <span className="news-source">· {a.source}</span>}
              </div>
              <h3 className="news-title">{a.title}</h3>
              {a.summary && <p className="news-summary">{a.summary}</p>}
              <div className="news-actions">
                {a.url && (
                  <a className="news-link" href={a.url} target="_blank" rel="noreferrer">
                    Llegir més <ExternalLink size={13} />
                  </a>
                )}
                <button className="news-remove" onClick={() => removeArticle(a.id)} aria-label="Eliminar">
                  <Trash2 size={13} />
                </button>
              </div>
            </article>
          ))}
      </div>
    </div>
  );
}

function Sobre() {
  return (
    <div className="page fade-in">
      <div className="page-head">
        <span className="page-eyebrow">Sobre el projecte</span>
        <h1 className="page-title">Per què SOSTRE</h1>
      </div>
      <div className="prose">
        <p>
          SOSTRE és la part pràctica d'un Treball de Recerca de Batxillerat sobre la crisi
          de l'habitatge a Espanya: preus de compra i lloguer, especulació, turistificació
          i les seves conseqüències sobre l'emancipació dels joves.
        </p>
        <p>
          L'objectiu d'aquesta web és doble: d'una banda, reunir en un sol lloc la revista
          «Consells per a joves» i les dades del treball perquè siguin fàcils de consultar;
          de l'altra, mantenir un espai viu on anar afegint notícies i novetats sobre
          l'habitatge, més enllà de la data d'entrega del treball.
        </p>
        <p className="prose-signature">— Un projecte en construcció, actualitzat sovint.</p>
      </div>
    </div>
  );
}

/* ---------------- app shell ---------------- */

export default function App() {
  useFonts();
  const [page, setPage] = useState("portada");
  const [mobileOpen, setMobileOpen] = useState(false);
  const topRef = useRef(null);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page]);

  return (
    <div className="sostre-root" ref={topRef}>
      <style>{CSS}</style>
      <Masthead page={page} setPage={setPage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="main">
        {page === "portada" && <Portada setPage={setPage} />}
        {page === "revista" && <Revista />}
        {page === "dades" && <Dades />}
        {page === "noticies" && <Noticies />}
        {page === "sobre" && <Sobre />}
      </main>
      <footer className="footer">
        <span className="wordmark-small">SOSTRE</span>
        <span>Treball de Recerca — la crisi de l'habitatge a Espanya</span>
      </footer>
    </div>
  );
}

/* ---------------- styles ---------------- */

const CSS = `
:root {
  --paper: #F1EFE7;
  --paper-raised: #FBFAF5;
  --ink: #17181A;
  --ink-soft: #5B584E;
  --line: #DEDACD;
  --blue: #1E4FD6;
  --blue-dim: #E7ECFB;
  --red: #C4362A;
  --red-dim: #F6E4E1;
  --ochre: #C79A1E;
}
.sostre-root {
  background: var(--paper);
  color: var(--ink);
  font-family: 'Inter', sans-serif;
  min-height: 100%;
  width: 100%;
}
.sostre-root * { box-sizing: border-box; }
.sostre-root button { font-family: inherit; cursor: pointer; background: none; border: none; }
.sostre-root input, .sostre-root textarea { font-family: inherit; }

/* ---- masthead ---- */
.masthead {
  position: sticky;
  top: 0;
  z-index: 30;
  background: var(--paper);
  border-bottom: 1px solid var(--line);
}
.masthead-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 24px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10.5px;
  letter-spacing: 0.03em;
  color: var(--ink-soft);
  text-transform: capitalize;
  border-bottom: 1px solid var(--line);
}
.masthead-main {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 18px 24px 12px;
}
.wordmark {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 34px;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.wordmark-small {
  font-family: 'Fraunces', serif;
  font-weight: 700;
  font-size: 18px;
  color: var(--ink);
}
.mobile-toggle { display: none; position: absolute; left: 20px; color: var(--ink); }
.masthead-spacer { width: 22px; }
.nav {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 0 24px 12px;
  flex-wrap: wrap;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-soft);
  border-radius: 999px;
  transition: background 0.15s, color 0.15s;
}
.nav-item:hover { background: var(--blue-dim); color: var(--blue); }
.nav-item-active { background: var(--ink); color: var(--paper); }
.nav-item-active:hover { background: var(--ink); color: var(--paper); }

/* ---- ticker ---- */
.ticker-wrap {
  overflow: hidden;
  background: var(--ink);
  padding: 7px 0;
}
.ticker-track {
  display: flex;
  width: max-content;
  animation: scroll-ticker 32s linear infinite;
}
@keyframes scroll-ticker {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.ticker-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 0 18px;
  white-space: nowrap;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  color: #C9C6BA;
}
.ticker-label { color: #8B8878; }
.ticker-value { color: var(--paper); font-weight: 500; }
.ticker-delta { color: #E38F7E; }
.ticker-dot { color: #4A4838; margin-left: 8px; }

/* ---- layout ---- */
.main { max-width: 1040px; margin: 0 auto; padding: 0 24px 80px; }
.page { padding-top: 48px; }
.fade-in { animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

.page-head { max-width: 640px; margin-bottom: 40px; }
.page-eyebrow {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--blue);
  font-weight: 500;
}
.page-title {
  font-family: 'Fraunces', serif;
  font-size: 42px;
  font-weight: 600;
  line-height: 1.08;
  margin: 10px 0 12px;
}
.page-sub { font-size: 16px; line-height: 1.55; color: var(--ink-soft); }

/* ---- hero ---- */
.hero { max-width: 720px; margin: 0 auto 56px; text-align: center; }
.hero-eyebrow {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--red);
  font-weight: 500;
  display: block;
  margin-bottom: 18px;
}
.hero-title {
  font-family: 'Fraunces', serif;
  font-optical-sizing: auto;
  font-weight: 600;
  font-size: 56px;
  line-height: 1.04;
  letter-spacing: -0.015em;
  margin: 0 0 20px;
}
.hero-sub {
  font-size: 17px;
  line-height: 1.6;
  color: var(--ink-soft);
  max-width: 560px;
  margin: 0 auto 30px;
}
.hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 4px;
  font-size: 14.5px;
  font-weight: 600;
  transition: transform 0.12s ease, background 0.15s;
}
.btn:active { transform: scale(0.97); }
.btn-primary { background: var(--ink); color: var(--paper); }
.btn-primary:hover { background: var(--blue); }
.btn-ghost { color: var(--ink); border: 1px solid var(--line); }
.btn-ghost:hover { border-color: var(--ink); }
.btn-small { padding: 9px 16px; font-size: 13px; margin-bottom: 8px; }

/* ---- stat grid ---- */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--line);
  border: 1px solid var(--line);
  margin-bottom: 64px;
}
.stat-card { background: var(--paper-raised); padding: 24px 20px; }
.stat-value {
  font-family: 'Fraunces', serif;
  font-size: 28px;
  font-weight: 600;
  color: var(--red);
}
.stat-label { font-size: 13px; font-weight: 600; margin-top: 6px; }
.stat-sub { font-size: 12px; color: var(--ink-soft); margin-top: 3px; }

/* ---- teaser cards ---- */
.teaser-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.teaser-card {
  text-align: left;
  background: var(--paper-raised);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: border-color 0.15s, transform 0.15s;
}
.teaser-card:hover { border-color: var(--blue); transform: translateY(-2px); }
.teaser-num {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: var(--blue);
  font-weight: 500;
}
.teaser-card h3 { font-family: 'Fraunces', serif; font-size: 19px; margin: 10px 0 8px; font-weight: 600; }
.teaser-card p { font-size: 13.5px; color: var(--ink-soft); line-height: 1.5; margin: 0 0 16px; flex-grow: 1; }
.teaser-link { font-size: 13px; font-weight: 600; color: var(--ink); display: inline-flex; align-items: center; gap: 5px; }

/* ---- accordion (revista) ---- */
.accordion { border-top: 1px solid var(--line); }
.acc-item { border-bottom: 1px solid var(--line); }
.acc-head {
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 22px 4px;
  text-align: left;
}
.acc-num { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: var(--blue); padding-top: 4px; min-width: 22px; }
.acc-title-wrap { flex-grow: 1; }
.acc-title { font-family: 'Fraunces', serif; font-size: 21px; font-weight: 600; display: block; }
.acc-excerpt { font-size: 13.5px; color: var(--ink-soft); display: block; margin-top: 5px; line-height: 1.5; }
.acc-caret { font-size: 22px; color: var(--ink-soft); transition: transform 0.2s; padding-top: 2px; }
.acc-caret-open { transform: rotate(45deg); color: var(--red); }
.acc-open .acc-head { background: var(--paper-raised); }
.acc-body { padding: 0 4px 26px 62px; font-size: 15px; line-height: 1.65; color: var(--ink); max-width: 620px; }

/* ---- charts ---- */
.chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.chart-card { background: var(--paper-raised); border: 1px solid var(--line); border-radius: 6px; padding: 22px 20px 16px; }
.chart-eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--blue); font-weight: 500; }
.chart-title { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 600; margin: 6px 0 12px; }
.chart-caption { font-size: 11.5px; color: var(--ink-soft); margin-top: 10px; line-height: 1.4; }

/* ---- news ---- */
.storage-note { font-size: 12px; color: var(--ink-soft); margin-top: 4px; }
.news-form {
  background: var(--paper-raised);
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 22px;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 560px;
}
.field { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.field-row { display: flex; gap: 14px; }
.field label { font-size: 12px; font-weight: 600; color: var(--ink-soft); }
.field input, .field textarea {
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 9px 11px;
  font-size: 14px;
  background: var(--paper);
  color: var(--ink);
  resize: vertical;
}
.field input:focus, .field textarea:focus { outline: 2px solid var(--blue); outline-offset: 1px; }
.form-err { color: var(--red); font-size: 12.5px; }

.news-list { display: flex; flex-direction: column; gap: 0; border-top: 1px solid var(--line); }
.news-item { padding: 22px 4px; border-bottom: 1px solid var(--line); }
.news-meta { display: flex; align-items: center; gap: 6px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--ink-soft); margin-bottom: 8px; }
.news-source { color: var(--blue); }
.news-title { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 600; margin: 0 0 8px; }
.news-summary { font-size: 14px; color: var(--ink-soft); line-height: 1.55; margin: 0 0 12px; }
.news-actions { display: flex; align-items: center; gap: 16px; }
.news-link { font-size: 13px; font-weight: 600; color: var(--blue); display: inline-flex; align-items: center; gap: 5px; }
.news-remove { color: var(--ink-soft); }
.news-remove:hover { color: var(--red); }
.news-empty, .news-empty-card { color: var(--ink-soft); font-size: 14px; padding: 32px 4px; text-align: center; }
.news-empty-card { display: flex; flex-direction: column; align-items: center; gap: 10px; }

/* ---- sobre ---- */
.prose { max-width: 620px; font-size: 16px; line-height: 1.7; }
.prose p { margin: 0 0 18px; }
.prose-signature { font-family: 'Fraunces', serif; font-style: italic; color: var(--ink-soft); }

/* ---- footer ---- */
.footer {
  border-top: 1px solid var(--line);
  padding: 28px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12.5px;
  color: var(--ink-soft);
  max-width: 1040px;
  margin: 0 auto;
}

/* ---- responsive ---- */
@media (max-width: 760px) {
  .mobile-toggle { display: block; }
  .wordmark { font-size: 26px; }
  .nav { display: none; flex-direction: column; align-items: stretch; gap: 2px; }
  .nav-open { display: flex; }
  .nav-item { justify-content: flex-start; }
  .hero-title { font-size: 36px; }
  .page-title { font-size: 30px; }
  .stat-grid { grid-template-columns: 1fr 1fr; }
  .teaser-grid { grid-template-columns: 1fr; }
  .chart-grid { grid-template-columns: 1fr; }
  .field-row { flex-direction: column; }
  .acc-body { padding-left: 4px; }
}
@media (prefers-reduced-motion: reduce) {
  .ticker-track { animation: none; }
  .fade-in { animation: none; }
}
`;
