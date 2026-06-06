import { useState } from "react";

const TOPICS = ["Toevoegingen", "Vijfstemmige liggingen"];

// ── TOEVOEGINGEN DATA ──────────────────────────────────────────────────────────

const chordAdditions = [
  { chord: "Δ (maj7)", adds: ["9", "#11", "13"], notes: "" },
  { chord: "6 (maj6)", adds: ["9", "#11"], notes: "" },
  {
    chord: "7 (dom7)",
    adds: ["b9", "9", "#9", "#11", "b13", "13"],
    notes:
      "Geen 9 of 13 op V→mineur I · 9 wél op (V).v.II in majeur en (V).v.IV in mineur · Geen 9 na ∅ in II–V · Geen b9/♯9/b13 op tvV naar mineur",
  },
  { chord: "7sus4", adds: ["b9", "9", "13"], notes: "" },
  {
    chord: "m7",
    adds: ["9", "11", "13"],
    notes: "Geen 13 op II in II–V verbinding",
  },
  { chord: "mΔ (mMaj7)", adds: ["9", "11", "13"], notes: "" },
  { chord: "m6", adds: ["9", "11"], notes: "" },
  { chord: "∅ (half-dim)", adds: ["9", "11", "b13"], notes: "9 voorzichtig gebruiken; liever 11 i.p.v. b5 bij II–V–I mineur" },
  { chord: "o (dim)", adds: ["9", "11", "b13"], notes: "" },
  { chord: "Δ#5 (aug maj7)", adds: ["9", "#11", "13"], notes: "" },
];

const viRules = [
  {
    title: "V→majeur I",
    content: "9 en 13 zijn standaard (laddereigen). b9, #9, b13 zijn mogelijk mits chromatisch opgelost. Kan eerst ongewijzigd, dan gealtereerd.",
    tag: "majeur",
  },
  {
    title: "V→mineur I",
    content: "b9, #9 en b13 zijn standaard. 9 en 13 vermijden — 13 klinkt slecht zelfs bij chromatische oplossing. Geen leidtoonwerking.",
    tag: "mineur",
  },
  {
    title: "II–V: 13 op II vermijden",
    content: "13 op m7 of ∅ = 3 op V → guide-tone line verstoord, alsof V te vroeg komt.",
    tag: "IIV",
  },
  {
    title: "II–V: 9 op V na ∅",
    content: "De b5 van ∅ wil naar beneden (→ kwint van I). 9 op V breekt die lijn. b5 blijft liggen, wordt vanzelf b9, lost op naar 5 van I.",
    tag: "IIV",
  },
  {
    title: "(V).v.II in majeur / (V).v.IV in mineur",
    content: "Gewone 9 is ook mogelijk, ondanks richting naar mineur akkoord — 9 zit in de hoofdtoonsoort.",
    tag: "tuss",
  },
  {
    title: "Kettingdominanten",
    content: "Bij 2 tussendominanten: toevoegingen uit hoofdtoonsoort. Bij meer: mixolydisch #11 per akkoord → toevoegingen 9, #11, 13.",
    tag: "tuss",
  },
  {
    title: "tvV / (tvV) → mineur",
    content: "Vervangt een gealtereerde V. Toevoegingen worden 9, #11, 13 (mixolydisch #11). Grondtoon van V = #11 van tvV.",
    tag: "tvV",
  },
  {
    title: "tvV / (tvV) → majeur (niet-gealtereerde V)",
    content: "Toevoegingen worden nu wél alteraties op de tvV. Gealtereerde ladder is de bijbehorende toonladder.",
    tag: "tvV",
  },
];

const avoidNotes = [
  { what: "11 op Δ-akkoord", why: "Halve toon boven de grote terts → te dissonant (avoidnote)" },
  { what: "b13 op akkoord met reine kwint", why: "Avoidnote; bij b13 op dom7: laat de kwint weg" },
  { what: "b9 algemeen", why: "Avoidnote behalve op dom7 (geaccepteerd voor spanning)" },
  { what: "#11 op m7", why: "Lijkt op verminderde kwint → verwarring met ∅" },
  { what: "b2 tussen twee bovenstemmen", why: "Klinkt hard in vijfstemmige ligging" },
  { what: "9 na ∅ in II–V", why: "Breekt de neerwaartse oplossing van de b5" },
];

const melodieRules = [
  "Geen b9/#9 als de (grote) 9 in de melodie zit, en vice versa",
  "Geen b13 als 13 in de melodie zit, en vice versa",
  "Geen #11 als 11 in de melodie zit, en vice versa",
  "Voorzichtig met toevoeging op kl. secunde / kl. none afstand van belangrijke melodietoon",
  "Geen 9 als kl. terts een belangrijke melodietoon is",
  "Geen 13 als kl. septiem een belangrijke melodietoon is",
  "Geen #11 of b13 als reine kwint een belangrijke melodietoon is",
  "Gunstig: toevoegingen op terts of sext van belangrijke melodietoon",
  "Uitzondering: toevoeging die gr. septiem vormt met melodietoon is acceptabel",
  "Uitzondering: doorgangstoon = geen bezwaar",
];

// ── VIJFSTEMMIGE LIGGINGEN DATA ───────────────────────────────────────────────

const liggingenTypes = [
  {
    name: "Nauwe Ligging (NL)",
    desc: "De bovenste vier stemmen sluiten op elkaar aan.",
    tag: "NL",
  },
  {
    name: "Wijde Ligging (WL)",
    desc: "Tussen twee aangrenzende stemmen wordt telkens een toon overgeslagen. Geldt alleen voor de bovenste vier stemmen.",
    tag: "WL",
  },
  {
    name: "Gemengde Ligging (GL)",
    desc: "Combinatie van NL en WL. Komt in de praktijk het meest voor.",
    tag: "GL",
  },
  {
    name: "Kwartenligging",
    desc: "Afstand tussen aangrenzende stemmen = reine kwart (soms tritonus, enkele terts mogelijk). Vaak basloos bij piano/gitaar.",
    tag: "KW",
  },
];

const liggingenRegels = [
  { rule: "Geen b2 tussen twee bovenstemmen", prio: "high" },
  { rule: "Geen b9 (behalve bij 7(b9) akkoord)", prio: "high" },
  { rule: "Secunden boven G4–A4 (net boven middel-C) liever vermijden", prio: "mid" },
  { rule: "Geen te lage intervallen (zie 'Low limits')", prio: "mid" },
  { rule: "Gaten tussen aangrenzende stemmen max. een octaaf", prio: "high" },
  { rule: "Uitzondering: de twee onderste stemmen mogen verder uiteen", prio: "low" },
  { rule: "Uitzondering: diepe kwinten zijn wel mogelijk", prio: "low" },
  { rule: "Pianist laat bastoon weg in combo (bassist speelt die)", prio: "low" },
];

const stemvoeringsTable = [
  { add: "9", resolves: ["5", "13", "b13"] },
  { add: "b9", resolves: ["5", "b13"] },
  { add: "#9", resolves: ["5 (via b9)", "13", "b13"] },
  { add: "11/#11", resolves: ["— (geen vast voorschrift)"] },
  { add: "13", resolves: ["9", "#9"] },
  { add: "b13", resolves: ["9", "#9", "b9"] },
];

const stemvoeringsExtra = [
  "Bij kwintrelatie tussen twee akkoorden: bovenstaande tabel van toepassing",
  "Geen dominantrelatie → stemvoering vrij; bovenstemmen zoveel mogelijk bij elkaar houden",
  "Melodische stemvoering: bovenstem volgt melodie, onderste stemmen harmonisch",
  "Halfverminderd: i.p.v. 9 liever 11 toevoegen, of b3 verdubbelen. Ook grondtoon verdubbeling is goed.",
];

const boekRegels = [
  "Drie understemmen bij voorkeur: 7/3/1 of 3/7/1",
  "De 9 kan ook laag voorkomen (vaak afgedekt door de terts)",
  "Elementaire akkoordtonen liever laag in het akkoord, toevoegingen hoog",
  "Boven F4–G4 (net boven middel-C): geen grote secunde tussen de twee bovenste stemmen",
  "Kleine secunden tussen twee bovenste stemmen vermijden (zeker als bovenstem ook melodiestem is)",
  "Beneden Bb3–D4: geen tertsen tussen de twee onderstemmen",
  "Beneden F3–Eb4: geen septiemen",
  "Vermijd zo mogelijk de 5 in dominant septiemakkoorden",
  "Interval b9 tussen twee bovenstemmen vermijden",
  "Max. afstand twee bovenstemmen: grote sext",
];

const lowLimits = [
  { interval: "kl. 2 (min 2nd)",  nl: "kleine secunde",  lowest: "E3"  },
  { interval: "gr. 2 (maj 2nd)",  nl: "grote secunde",   lowest: "Eb2" },
  { interval: "kl. 3 (min 3rd)",  nl: "kleine terts",    lowest: "C3"  },
  { interval: "gr. 3 (maj 3rd)",  nl: "grote terts",     lowest: "Bb2" },
  { interval: "r. 4 (perf 4th)",  nl: "reine kwart",     lowest: "Bb2" },
  { interval: "r. 5 (perf 5th)",  nl: "reine kwint",     lowest: "Bb1" },
  { interval: "kl. 6 (min 6th)",  nl: "kleine sext",     lowest: "G2"  },
  { interval: "gr. 6 (maj 6th)",  nl: "grote sext",      lowest: "F2"  },
  { interval: "kl. 7 (min 7th)",  nl: "kleine septiem",  lowest: "F2"  },
  { interval: "gr. 7 (maj 7th)",  nl: "grote septiem",   lowest: "F2"  },
];

// ── TAG BADGE ────────────────────────────────────────────────────────────────

const tagColors = {
  majeur: "#4ade80",
  mineur: "#f87171",
  IIV: "#60a5fa",
  tuss: "#fb923c",
  tvV: "#c084fc",
  NL: "#34d399",
  WL: "#fbbf24",
  GL: "#a78bfa",
  KW: "#f472b6",
  high: "#f87171",
  mid: "#fbbf24",
  low: "#6b7280",
};

function Tag({ label }) {
  const color = tagColors[label] || "#6b7280";
  return (
    <span
      style={{
        background: color + "22",
        color,
        border: `1px solid ${color}55`,
        borderRadius: 4,
        padding: "1px 7px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.5,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

// ── CHORD TABLE ───────────────────────────────────────────────────────────────

function AddBadge({ add }) {
  const altColor = add.startsWith("b") || add.startsWith("#") ? "#f59e0b" : "#38bdf8";
  return (
    <span
      style={{
        display: "inline-block",
        background: altColor + "22",
        color: altColor,
        border: `1px solid ${altColor}44`,
        borderRadius: 4,
        padding: "1px 6px",
        margin: "2px",
        fontSize: 13,
        fontFamily: "monospace",
        fontWeight: 700,
      }}
    >
      {add}
    </span>
  );
}

// ── COLLAPSIBLE SECTION ───────────────────────────────────────────────────────

function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%",
          background: open ? "#1e293b" : "#0f172a",
          border: "1px solid #334155",
          borderRadius: 8,
          padding: "10px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          color: "#e2e8f0",
          fontFamily: "'Crimson Pro', Georgia, serif",
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: 0.3,
          transition: "background 0.15s",
        }}
      >
        <span>{title}</span>
        <span style={{ color: "#64748b", fontSize: 18 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div
          style={{
            background: "#0f172acc",
            border: "1px solid #1e293b",
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            padding: "14px 16px",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ── TOEVOEGINGEN TAB ─────────────────────────────────────────────────────────

function ToevoegingenTab() {
  const [search, setSearch] = useState("");
  const filtered = chordAdditions.filter(c =>
    c.chord.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Quick lookup */}
      <Section title="📋 Toevoegingen per akkoordtype" defaultOpen>
        <input
          placeholder="Filter op akkoord…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%",
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 6,
            padding: "7px 12px",
            color: "#e2e8f0",
            fontSize: 13,
            marginBottom: 12,
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map(c => (
            <div
              key={c.chord}
              style={{
                background: "#1e293b",
                borderRadius: 8,
                padding: "10px 14px",
                borderLeft: "3px solid #38bdf8",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                <span
                  style={{
                    color: "#f1f5f9",
                    fontFamily: "monospace",
                    fontSize: 14,
                    fontWeight: 700,
                    minWidth: 140,
                  }}
                >
                  {c.chord}
                </span>
                <span>{c.adds.map(a => <AddBadge key={a} add={a} />)}</span>
              </div>
              {c.notes && (
                <div
                  style={{
                    marginTop: 5,
                    color: "#94a3b8",
                    fontSize: 12,
                    lineHeight: 1.5,
                    borderTop: "1px solid #334155",
                    paddingTop: 5,
                  }}
                >
                  ⚠️ {c.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* V–I rules */}
      <Section title="🎯 V–I en II–V regels">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {viRules.map(r => (
            <div
              key={r.title}
              style={{
                background: "#1e293b",
                borderRadius: 8,
                padding: "10px 14px",
                borderLeft: `3px solid ${tagColors[r.tag] || "#64748b"}`,
              }}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 13 }}>{r.title}</span>
                <Tag label={r.tag} />
              </div>
              <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6 }}>{r.content}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Avoid notes */}
      <Section title="🚫 Avoidnotes & vermijden">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {avoidNotes.map(a => (
            <div
              key={a.what}
              style={{
                background: "#1e293b",
                borderRadius: 8,
                padding: "9px 14px",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                borderLeft: "3px solid #f87171",
              }}
            >
              <span style={{ color: "#fca5a5", fontFamily: "monospace", fontSize: 13, fontWeight: 700, minWidth: 180 }}>
                {a.what}
              </span>
              <span style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>{a.why}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Melodie begeleiding */}
      <Section title="🎵 Toevoegingen bij melodiebegeleiding">
        <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 10 }}>
          Bij het begeleiden van een thema: kies toevoegingen die niet botsen.
        </div>
        <ul style={{ margin: 0, padding: "0 0 0 16px", color: "#94a3b8", fontSize: 13, lineHeight: 2 }}>
          {melodieRules.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

// ── VIJFSTEMMIGE TAB ─────────────────────────────────────────────────────────

function VijfstemmigTab() {
  return (
    <div>
      {/* Ligging types */}
      <Section title="📐 Liggingstypes" defaultOpen>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {liggingenTypes.map(l => (
            <div
              key={l.name}
              style={{
                background: "#1e293b",
                borderRadius: 8,
                padding: "10px 14px",
                borderLeft: `3px solid ${tagColors[l.tag]}`,
              }}
            >
              <div style={{ display: "flex", gap: 8, marginBottom: 5, alignItems: "center" }}>
                <Tag label={l.tag} />
                <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 13 }}>{l.name}</span>
              </div>
              <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5 }}>{l.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Algemene regels */}
      <Section title="📏 Algemene liggingsregels">
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {liggingenRegels.map(r => (
            <div
              key={r.rule}
              style={{
                background: "#1e293b",
                borderRadius: 7,
                padding: "8px 14px",
                display: "flex",
                gap: 10,
                alignItems: "center",
                borderLeft: `3px solid ${tagColors[r.prio]}`,
              }}
            >
              <Tag label={r.prio} />
              <span style={{ color: "#cbd5e1", fontSize: 13 }}>{r.rule}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Low limits */}
      <Section title="📉 Low limits — laagste toon per interval">
        <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 10, lineHeight: 1.6 }}>
          Elk interval klinkt te modderig als het te laag gespeeld wordt. Onderstaande grenswaarden geven de <strong style={{color:"#e2e8f0"}}>laagste noot</strong> van het interval aan waaronder het niet meer goed klinkt.
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: "#cbd5e1" }}>
            <thead>
              <tr style={{ background: "#1e293b" }}>
                <th style={{ padding: "8px 14px", textAlign: "left", borderBottom: "1px solid #334155", color: "#38bdf8" }}>Interval</th>
                <th style={{ padding: "8px 14px", textAlign: "left", borderBottom: "1px solid #334155", color: "#38bdf8" }}>Nederlands</th>
                <th style={{ padding: "8px 14px", textAlign: "center", borderBottom: "1px solid #334155", color: "#38bdf8" }}>Laagste toon</th>
              </tr>
            </thead>
            <tbody>
              {lowLimits.map((row, i) => (
                <tr key={row.interval} style={{ background: i % 2 === 0 ? "#0f172a" : "#1e293b" }}>
                  <td style={{ padding: "8px 14px", fontFamily: "monospace", fontWeight: 700, color: "#e2e8f0" }}>{row.interval}</td>
                  <td style={{ padding: "8px 14px", color: "#94a3b8" }}>{row.nl}</td>
                  <td style={{ padding: "8px 14px", textAlign: "center" }}>
                    <span style={{
                      background: "#0f4c2a",
                      color: "#4ade80",
                      border: "1px solid #166534",
                      borderRadius: 5,
                      padding: "2px 10px",
                      fontFamily: "monospace",
                      fontWeight: 700,
                      fontSize: 13,
                    }}>{row.lowest}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 10, color: "#64748b", fontSize: 11 }}>
          NB: diepe kwinten zijn een uitzondering — deze zijn wél toegestaan lager dan de grens.
        </div>
      </Section>

      {/* Boek-regels */}
      <Section title="📖 Aanvullende regels (harmonieleerboek)">
        <ul style={{ margin: 0, padding: "0 0 0 16px", color: "#94a3b8", fontSize: 13, lineHeight: 2 }}>
          {boekRegels.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </Section>

      {/* Stemvoering tabel */}
      <Section title="➡️ Stemvoering bij kwintrelatie">
        <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 10 }}>
          Waarnaar lost een toevoeging op bij kwintrelatie (V→I)?
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
              color: "#cbd5e1",
            }}
          >
            <thead>
              <tr style={{ background: "#1e293b" }}>
                <th style={{ padding: "8px 14px", textAlign: "left", borderBottom: "1px solid #334155", color: "#38bdf8" }}>
                  Toevoeging
                </th>
                <th style={{ padding: "8px 14px", textAlign: "left", borderBottom: "1px solid #334155", color: "#38bdf8" }}>
                  Wordt (in volgend akkoord)
                </th>
              </tr>
            </thead>
            <tbody>
              {stemvoeringsTable.map((row, i) => (
                <tr key={row.add} style={{ background: i % 2 === 0 ? "#0f172a" : "#1e293b" }}>
                  <td style={{ padding: "8px 14px", fontFamily: "monospace", fontWeight: 700 }}>
                    <AddBadge add={row.add} />
                  </td>
                  <td style={{ padding: "8px 14px", color: "#94a3b8" }}>
                    {row.resolves.join(" · ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 5 }}>
          {stemvoeringsExtra.map((s, i) => (
            <div key={i} style={{ color: "#64748b", fontSize: 12, paddingLeft: 8, borderLeft: "2px solid #334155" }}>
              {s}
            </div>
          ))}
        </div>
      </Section>

      {/* Omkeringen */}
      <Section title="🔄 Omkeringen (chord inversions) — spiekbriefje">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: "#cbd5e1" }}>
            <thead>
              <tr style={{ background: "#1e293b" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", borderBottom: "1px solid #334155", color: "#38bdf8" }}>Symbool</th>
                <th style={{ padding: "8px 12px", textAlign: "left", borderBottom: "1px solid #334155", color: "#38bdf8" }}>Romeins</th>
                <th style={{ padding: "8px 12px", textAlign: "left", borderBottom: "1px solid #334155", color: "#38bdf8" }}>Basnoot</th>
                <th style={{ padding: "8px 12px", textAlign: "left", borderBottom: "1px solid #334155", color: "#38bdf8" }}>Naam</th>
              </tr>
            </thead>
            <tbody>
              {[
                { sym: "C",    rom: "I",        bas: "C", naam: "Grondligging" },
                { sym: "C/E",  rom: "I⁶",       bas: "E", naam: "Eerste omkering" },
                { sym: "C/G",  rom: "I⁶₄",      bas: "G", naam: "Tweede omkering" },
                { sym: "G7",   rom: "V⁷",       bas: "G", naam: "Grondligging (met 7)" },
                { sym: "G7/B", rom: "V⁶₅",      bas: "B", naam: "Eerste omkering (met 7)" },
                { sym: "G7/D", rom: "V⁴₃",      bas: "D", naam: "Tweede omkering (met 7)" },
                { sym: "G7/F", rom: "V²",       bas: "F", naam: "Derde omkering (met 7)" },
              ].map((row, i) => (
                <tr key={row.sym} style={{ background: i % 2 === 0 ? "#0f172a" : "#1e293b" }}>
                  <td style={{ padding: "8px 12px", fontFamily: "monospace", fontWeight: 700, color: "#e2e8f0" }}>{row.sym}</td>
                  <td style={{ padding: "8px 12px", color: "#c084fc" }}>{row.rom}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <span style={{
                      background: "#1e3a5f",
                      color: "#7dd3fc",
                      border: "1px solid #1e4976",
                      borderRadius: 4,
                      padding: "1px 8px",
                      fontFamily: "monospace",
                      fontWeight: 700,
                    }}>{row.bas}</span>
                  </td>
                  <td style={{ padding: "8px 12px", color: "#94a3b8" }}>{row.naam}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 8, color: "#64748b", fontSize: 11 }}>
          Geheugensteuntje: het cijfer na de slash = de basnoot. V⁶₅ / V⁴₃ / V² = 1e / 2e / 3e omkering van de dominant septiemakkoord.
        </div>
      </Section>

      {/* Basismodellen */}
      <Section title="🏗️ Basismodellen (DΔ9 als voorbeeld)">
        <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.8 }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: "#e2e8f0", fontWeight: 700 }}>Model A (1–3 onder):</span> NL · GL · GL (variant) · WL
          </div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: "#e2e8f0", fontWeight: 700 }}>Model B (1–7 onder):</span> NL* · GL* · WL · NL
          </div>
          <div>
            <span style={{ color: "#e2e8f0", fontWeight: 700 }}>Model C (1–5 onder):</span> GL · GL (variant) · WL
          </div>
          <div style={{ marginTop: 8, color: "#64748b", fontSize: 11 }}>* = komt in de praktijk vaak voor</div>
        </div>
      </Section>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState(0);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#e2e8f0",
        fontFamily: "'Crimson Pro', Georgia, serif",
        padding: "20px 16px 40px",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#475569", textTransform: "uppercase", marginBottom: 4 }}>
          Jazztheorie · Eindtoets
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            margin: 0,
            background: "linear-gradient(135deg, #38bdf8, #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: -0.5,
          }}
        >
          Theorie Naslagwerk
        </h1>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          background: "#0f172a",
          border: "1px solid #1e293b",
          borderRadius: 10,
          padding: 4,
          marginBottom: 18,
          gap: 4,
        }}
      >
        {TOPICS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            style={{
              flex: 1,
              padding: "9px 12px",
              borderRadius: 7,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: 14,
              fontWeight: tab === i ? 700 : 400,
              background: tab === i ? "linear-gradient(135deg, #1e3a5f, #1e1b4b)" : "transparent",
              color: tab === i ? "#bfdbfe" : "#64748b",
              transition: "all 0.15s",
              letterSpacing: 0.2,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 0 ? <ToevoegingenTab /> : <VijfstemmigTab />}

      <div style={{ textAlign: "center", marginTop: 24, color: "#1e293b", fontSize: 11 }}>
        Gebaseerd op Jeroen Bohan — Jazztheorie
      </div>
    </div>
  );
}
