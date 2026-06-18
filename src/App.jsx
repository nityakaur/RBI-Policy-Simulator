import { useState, useEffect } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from "recharts";

// ── Real data from Nitya's research paper ──────────────────────────────────
const FED_RBI_DATA = [
  { date: "Mar 2022", fed: 0.375, rbi: 4.00, label: "Fed starts hiking" },
  { date: "May 2022", fed: 0.875, rbi: 4.40, label: "RBI surprise hike" },
  { date: "Jun 2022", fed: 1.625, rbi: 4.90 },
  { date: "Sep 2022", fed: 3.125, rbi: 5.90 },
  { date: "Feb 2023", fed: 4.625, rbi: 6.50, label: "RBI pauses" },
  { date: "Jul 2023", fed: 5.375, rbi: 6.50, label: "Fed final hike" },
  { date: "Sep 2024", fed: 4.875, rbi: 6.50, label: "Fed starts cutting" },
  { date: "Dec 2025", fed: 3.625, rbi: 5.25, label: "RBI first cut" },
];

const GDP_DATA = [
  { year: "FY21-22", gdp: 9.1, pfce: 7.3, gfcf: 11.5, govt: 2.6 },
  { year: "FY22-23", gdp: 7.0, pfce: 7.3, gfcf: 9.0, govt: 0.1 },
  { year: "FY23-24", gdp: 9.2, pfce: 4.0, gfcf: 9.0, govt: 2.5 },
  { year: "FY24-25", gdp: 6.5, pfce: 7.3, gfcf: 7.1, govt: 4.4 },
  { year: "FY25-26E", gdp: 7.4, pfce: 7.0, gfcf: 7.8, govt: 5.1 },
];

const RUPEE_FPI_DATA = [
  { date: "Jan 2022", usdinr: 74.0, fpi: 8200 },
  { date: "Apr 2022", usdinr: 76.2, fpi: -16800 },
  { date: "Jul 2022", usdinr: 79.8, fpi: -9600 },
  { date: "Oct 2022", usdinr: 83.0, fpi: -7400 },
  { date: "Jan 2023", usdinr: 81.8, fpi: 11200 },
  { date: "Apr 2023", usdinr: 82.2, fpi: 6800 },
  { date: "Jul 2023", usdinr: 82.8, fpi: 14200 },
  { date: "Jan 2024", usdinr: 83.1, fpi: 19400 },
  { date: "Jun 2024", usdinr: 83.5, fpi: 16100, label: "JPM Index inclusion" },
  { date: "Jan 2025", usdinr: 84.4, fpi: -9200 },
  { date: "Jun 2025", usdinr: 84.0, fpi: 12100 },
  { date: "Dec 2025", usdinr: 84.7, fpi: 6700 },
];

const TRANSMISSION_DATA = [
  { channel: "Credit Channel", inflation_impact: 0.20, output_impact: 0.48 },
  { channel: "Interest Rate Channel", inflation_impact: 0.15, output_impact: 0.30 },
  { channel: "Exchange Rate Channel", inflation_impact: 0.10, output_impact: 0.15 },
];

// ── Simulation logic (UIP-based, from paper) ───────────────────────────────
function simulate(fedHike, rbiResponse) {
  const spread = fedHike - rbiResponse;
  const rupeeDepreciation = spread > 0 ? (spread * 0.42).toFixed(2) : 0;
  const fpiOutflow = spread > 0 ? (spread * 9800).toFixed(0) : (-spread * 4200).toFixed(0);
  const gdpImpact = (-rbiResponse * 0.078 + (spread > 0 ? -0.3 : 0.1)).toFixed(2);
  const inflationImpact = (-rbiResponse * 0.035).toFixed(2);
  return { rupeeDepreciation, fpiOutflow, gdpImpact, inflationImpact, spread };
}

// ── Color tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#0B1120",
  surface: "#111827",
  card: "#1A2332",
  border: "#1F3050",
  accent: "#3B9EFF",
  accentGlow: "#3B9EFF22",
  gold: "#F5C542",
  green: "#34D399",
  red: "#F87171",
  muted: "#6B8099",
  text: "#E2EAF4",
  textDim: "#94A3B8",
};

const TAB_STYLE = (active) => ({
  padding: "8px 18px",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
  fontFamily: "'Inter', sans-serif",
  background: active ? C.accent : "transparent",
  color: active ? "#fff" : C.textDim,
  transition: "all 0.2s",
});

const CARD = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: "20px 24px",
};

const TOOLTIP_STYLE = {
  backgroundColor: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  color: C.text,
  fontSize: 12,
  fontFamily: "'Inter', sans-serif",
};

export default function IndiaMacroPulse() {
  const [tab, setTab] = useState("rates");
  const [fedHike, setFedHike] = useState(1.0);
  const [rbiResponse, setRbiResponse] = useState(0.5);
  const [simResult, setSimResult] = useState(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100);
  }, []);

  useEffect(() => {
    setSimResult(simulate(fedHike, rbiResponse));
  }, [fedHike, rbiResponse]);

  const tabs = [
    { id: "rates", label: "Rate Cycles" },
    { id: "gdp", label: "GDP Impact" },
    { id: "flows", label: "Rupee & FPI" },
    { id: "channels", label: "Transmission" },
    { id: "sim", label: "⚡ Simulator" },
  ];

  return (
    <div style={{
      background: C.bg,
      minHeight: "100vh",
      fontFamily: "'Inter', sans-serif",
      color: C.text,
      padding: "0 0 60px",
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, #0B1120 0%, #0D1F3C 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "28px 32px 20px",
        opacity: animated ? 1 : 0,
        transform: animated ? "translateY(0)" : "translateY(-12px)",
        transition: "all 0.5s ease",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: C.green,
                boxShadow: `0 0 8px ${C.green}`,
                animation: "pulse 2s infinite",
              }} />
              <span style={{ fontSize: 11, color: C.green, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
                Live Research Dashboard
              </span>
            </div>
            <h1 style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: -0.5,
            }}>
              India Macro Pulse
            </h1>
            <p style={{ margin: "6px 0 0", color: C.textDim, fontSize: 13 }}>
              Monetary Policy Transmission Tracker · 2022–2026 · by Nitya Kaur
            </p>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "Repo Rate", value: "5.25%", color: C.accent },
              { label: "Fed Rate", value: "3.625%", color: C.gold },
              { label: "USD/INR", value: "84.7", color: C.green },
              { label: "GDP Est.", value: "7.4%", color: "#A78BFA" },
            ].map(kpi => (
              <div key={kpi.label} style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "10px 16px",
                textAlign: "center",
                minWidth: 80,
              }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
                <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{kpi.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginTop: 20, flexWrap: "wrap" }}>
          {tabs.map(t => (
            <button key={t.id} style={TAB_STYLE(tab === t.id)} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "28px 24px",
        opacity: animated ? 1 : 0,
        transition: "opacity 0.6s ease 0.2s",
      }}>

        {/* ── TAB: RATE CYCLES ─────────────────────────────────── */}
        {tab === "rates" && (
          <div>
            <SectionHeader
              title="Fed vs RBI Rate Decisions (2022–2026)"
              subtitle="India's 'partial decoupling' — RBI paused 3 months before the Fed's final hike"
            />
            <div style={CARD}>
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={FED_RBI_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 11 }} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} tickFormatter={v => `${v}%`} domain={[0, 6.5]} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(val, name) => [`${val}%`, name]}
                  />
                  <Legend wrapperStyle={{ color: C.textDim, fontSize: 12 }} />
                  <Line dataKey="fed" name="US Fed Rate" stroke={C.gold} strokeWidth={2.5} dot={{ fill: C.gold, r: 4 }} />
                  <Line dataKey="rbi" name="RBI Repo Rate" stroke={C.accent} strokeWidth={2.5} dot={{ fill: C.accent, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginTop: 16 }}>
              {[
                { label: "Fed Total Hike", value: "+525 bps", sub: "Mar 2022 → Jul 2023", color: C.gold },
                { label: "RBI Total Hike", value: "+250 bps", sub: "May 2022 → Feb 2023", color: C.accent },
                { label: "RBI Paused Early", value: "3 months", sub: "Before Fed's last hike", color: C.green },
                { label: "First RBI Cut", value: "Dec 2025", sub: "−25 bps to 5.25%", color: "#A78BFA" },
              ].map(s => <StatCard key={s.label} {...s} />)}
            </div>
          </div>
        )}

        {/* ── TAB: GDP ──────────────────────────────────────────── */}
        {tab === "gdp" && (
          <div>
            <SectionHeader
              title="India's GDP Growth vs Components"
              subtitle="Despite peak 6.5% repo rate, GDP grew 9.2% in FY23-24 — driven by govt capex crowding-in private investment"
            />
            <div style={CARD}>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={GDP_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 11 }} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, n) => [`${v}%`, n]} />
                  <Legend wrapperStyle={{ color: C.textDim, fontSize: 12 }} />
                  <Bar dataKey="gdp" name="Real GDP Growth" fill={C.accent} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pfce" name="Consumption (PFCE)" fill={C.green} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gfcf" name="Investment (GFCF)" fill={C.gold} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="govt" name="Govt Spending" fill="#A78BFA" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{
              ...CARD,
              marginTop: 14,
              background: `linear-gradient(135deg, #0D1F3C, #111827)`,
              borderColor: C.accent + "55",
            }}>
              <p style={{ margin: 0, color: C.textDim, fontSize: 13, lineHeight: 1.7 }}>
                <span style={{ color: C.accent, fontWeight: 700 }}>Key finding from paper: </span>
                When repo rate peaked at 6.50%, construction grew 10.4% and manufacturing 12.3%.
                Government capex above ₹11 lakh crore acted as a <span style={{ color: C.gold }}>growth buffer</span>,
                substituting for private investment dampened by high borrowing costs.
                India's "Goldilocks" period arrived in late 2025: 8.2% growth + 0.3% CPI inflation simultaneously.
              </p>
            </div>
          </div>
        )}

        {/* ── TAB: RUPEE & FPI ─────────────────────────────────── */}
        {tab === "flows" && (
          <div>
            <SectionHeader
              title="USD/INR Exchange Rate & FPI Flows"
              subtitle="Rupee fell ~12% (₹74→₹83) after Fed hikes began. JPMorgan index inclusion (Jun 2024) created structural floor."
            />
            <div style={CARD}>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={RUPEE_FPI_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 10 }} interval={2} />
                  <YAxis tick={{ fill: C.muted, fontSize: 11 }} domain={[72, 86]} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`₹${v}`, "USD/INR"]} />
                  <ReferenceLine x="Jun 2024" stroke={C.gold} strokeDasharray="4 4" label={{ value: "JPM Index", fill: C.gold, fontSize: 10 }} />
                  <Area dataKey="usdinr" name="USD/INR" stroke={C.red} fill={C.red + "22"} strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ ...CARD, marginTop: 14 }}>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                FPI Net Flows (₹ Crore) — Equity
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={RUPEE_FPI_DATA} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                  <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 10 }} interval={2} />
                  <YAxis tick={{ fill: C.muted, fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`₹${v.toLocaleString()} Cr`, "FPI Flow"]} />
                  <ReferenceLine y={0} stroke={C.border} />
                  <Bar dataKey="fpi" name="FPI Flow" radius={[3, 3, 0, 0]}
                    fill={C.green}
                    // color bars by sign
                    label={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── TAB: TRANSMISSION ────────────────────────────────── */}
        {tab === "channels" && (
          <div>
            <SectionHeader
              title="Monetary Policy Transmission Channels"
              subtitle="Credit channel is most powerful in India — not the interest rate channel (Joseph & Dash, 2025)"
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
              {[
                {
                  name: "Credit Channel",
                  strength: "Strongest",
                  color: C.accent,
                  inflation: "−0.20%",
                  output: "−0.48%",
                  desc: "RBI hike → banks restrict credit → less investment & consumption. Most powerful in India due to bank-dominated finance.",
                },
                {
                  name: "Interest Rate Channel",
                  strength: "Moderate",
                  color: C.gold,
                  inflation: "−0.15%",
                  output: "−0.30%",
                  desc: "Higher repo rate → higher EMIs → reduced household & firm spending. EBLR reform (2019) improved speed of pass-through.",
                },
                {
                  name: "Exchange Rate Channel",
                  strength: "Significant",
                  color: "#A78BFA",
                  inflation: "−0.10%",
                  output: "−0.15%",
                  desc: "Rate differential → capital outflows → Rupee depreciates → imported inflation. Crude oil makes India especially vulnerable.",
                },
              ].map(ch => (
                <div key={ch.name} style={{
                  ...CARD,
                  borderColor: ch.color + "44",
                  borderLeft: `3px solid ${ch.color}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{ch.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: ch.color, background: ch.color + "22", padding: "3px 8px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {ch.strength}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 14px", fontSize: 12, color: C.textDim, lineHeight: 1.6 }}>{ch.desc}</p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ flex: 1, background: C.bg, borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: C.red }}>{ch.inflation}</div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Inflation / 100bps</div>
                    </div>
                    <div style={{ flex: 1, background: C.bg, borderRadius: 8, padding: "8px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: C.red }}>{ch.output}</div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Output / 100bps</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ ...CARD, marginTop: 14 }}>
              <p style={{ margin: 0, fontSize: 12, color: C.textDim }}>
                <span style={{ color: C.gold, fontWeight: 700 }}>Impossible Trinity: </span>
                India cannot have free capital, fixed exchange rate, and independent monetary policy simultaneously (Mundell-Fleming).
                The RBI uses a <span style={{ color: C.accent }}>managed float</span> + selective capital flow tools + independent rate decisions
                — navigating all three goals simultaneously rather than choosing one corner.
              </p>
            </div>
          </div>
        )}

        {/* ── TAB: SIMULATOR ───────────────────────────────────── */}
        {tab === "sim" && (
          <div>
            <SectionHeader
              title="Policy Scenario Simulator"
              subtitle="Adjust Fed & RBI rate changes to see predicted impact on Rupee, FPI flows, GDP & inflation (UIP-based model)"
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Controls */}
              <div style={CARD}>
                <p style={{ margin: "0 0 20px", fontWeight: 700, color: C.text, fontSize: 14 }}>
                  Set Scenario Parameters
                </p>
                <SliderControl
                  label="Fed Rate Hike"
                  value={fedHike}
                  min={0} max={3} step={0.25}
                  onChange={setFedHike}
                  color={C.gold}
                  format={v => `+${v}%`}
                />
                <SliderControl
                  label="RBI Response"
                  value={rbiResponse}
                  min={0} max={2} step={0.25}
                  onChange={setRbiResponse}
                  color={C.accent}
                  format={v => `+${v}%`}
                />
                <div style={{
                  marginTop: 20,
                  padding: "12px 16px",
                  background: C.bg,
                  borderRadius: 8,
                  fontSize: 12,
                  color: C.textDim,
                  lineHeight: 1.7,
                }}>
                  <strong style={{ color: C.text }}>How this works:</strong><br />
                  Based on UIP (Uncovered Interest Rate Parity) and VAR estimates from Joseph & Dash (2025).
                  Rate spread drives Rupee depreciation (~0.42% per 100bps differential).
                  Credit channel dominates domestic output impact.
                </div>
              </div>

              {/* Results */}
              {simResult && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <SimResult
                    label="Rupee Depreciation"
                    value={`−${simResult.rupeeDepreciation}%`}
                    sub={simResult.spread > 0 ? "Capital flows to US assets (UIP)" : "No depreciation pressure"}
                    color={simResult.spread > 0 ? C.red : C.green}
                  />
                  <SimResult
                    label="FPI Equity Flow"
                    value={`${simResult.spread > 0 ? "−" : "+"}₹${Math.abs(simResult.fpiOutflow).toLocaleString()} Cr`}
                    sub={simResult.spread > 0 ? "Estimated outflow" : "Estimated inflow"}
                    color={simResult.spread > 0 ? C.red : C.green}
                  />
                  <SimResult
                    label="GDP Impact"
                    value={`${simResult.gdpImpact}%`}
                    sub="Via credit + interest rate channels"
                    color={parseFloat(simResult.gdpImpact) < 0 ? C.red : C.green}
                  />
                  <SimResult
                    label="Inflation Impact"
                    value={`${simResult.inflationImpact}%`}
                    sub="CPI change via domestic tightening"
                    color={C.accent}
                  />
                </div>
              )}
            </div>

            {/* Scenario presets */}
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>Quick scenarios from the paper:</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { label: "2022 Shock", fed: 2.0, rbi: 0.9 },
                  { label: "RBI Partial Decouple", fed: 0.5, rbi: 0 },
                  { label: "Goldilocks 2025", fed: -0.5, rbi: -0.25 },
                  { label: "Full Pass-Through", fed: 1.0, rbi: 1.0 },
                ].map(s => (
                  <button
                    key={s.label}
                    onClick={() => { setFedHike(Math.max(0, s.fed)); setRbiResponse(Math.max(0, s.rbi)); }}
                    style={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      padding: "8px 14px",
                      color: C.textDim,
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      transition: "all 0.15s",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center",
        color: C.muted,
        fontSize: 11,
        marginTop: 20,
        paddingTop: 20,
        borderTop: `1px solid ${C.border}`,
      }}>
        Data sources: RBI DBIE · MoSPI · NSDL · US Federal Reserve · BIS · Joseph & Dash (2025) · Salisu (2024)
        <br />
        <span style={{ color: C.accent }}>Research Paper: </span>
        "Impact of Global Interest Rate Hikes on India's GDP Growth" — Nitya Kaur (2026)
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>{title}</h2>
      <p style={{ margin: "5px 0 0", fontSize: 13, color: "#6B8099", lineHeight: 1.5 }}>{subtitle}</p>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: "#1A2332",
      border: "1px solid #1F3050",
      borderRadius: 10,
      padding: "14px 18px",
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#E2EAF4", marginTop: 3 }}>{label}</div>
      <div style={{ fontSize: 11, color: "#6B8099", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function SliderControl({ label, value, min, max, step, onChange, color, format }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 800, color }}>{format(value)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: color, cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "#6B8099" }}>{format(min)}</span>
        <span style={{ fontSize: 10, color: "#6B8099" }}>{format(max)}</span>
      </div>
    </div>
  );
}

function SimResult({ label, value, sub, color }) {
  return (
    <div style={{
      background: "#1A2332",
      border: `1px solid ${color}33`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 10,
      padding: "14px 18px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}>
      <div>
        <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 11, color: "#6B8099", marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}