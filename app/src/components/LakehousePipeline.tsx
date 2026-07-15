// LakehousePipeline — three-zone architecture diagram, same visual grammar
// as BD-ODI-Demo's ThreeZonePipeline (dashed-border zones, HTML source
// cards, cylinder SVG layer stats, particle flow, engine/role chips)
// adapted for Healthfirst's actual pipeline shape: three sources -> Fivetran
// -> one AWS S3 Managed Data Lake (bronze/silver/gold Iceberg tables) ->
// multiple query engines. "One copy, many engines" instead of "one
// consolidated warehouse."

import { useEffect, useState, type CSSProperties } from 'react';

export interface SourceNode {
  id: string;
  label: string;
  logo: VendorLogo;
  today: string;
  fivetranSyncLabel: string;
  syncConfidence: 'confirmed' | 'inferred' | 'unverified';
}

export interface LayerStat {
  tables: number;
  rows: number;
}

export interface RoleCard {
  label: string;
  sub: string;
}

type VendorLogo = 'salesforce' | 'oracle' | 's3' | 'sharepoint' | 'fivetran' | 'dbt' | 'awslake';

interface Props {
  sources: SourceNode[];
  bronze: LayerStat;
  silver: LayerStat;
  gold: LayerStat;
  roles: RoleCard[];
  dbtProjectName: string;
  lakeAttribution: string;
}

const CONFIDENCE_LABEL: Record<SourceNode['syncConfidence'], string> = {
  confirmed: 'confirmed',
  inferred: 'inferred',
  unverified: 'not verified',
};

const CONFIDENCE_COLOR: Record<SourceNode['syncConfidence'], string> = {
  confirmed: '#15803d',
  inferred: '#b45309',
  unverified: '#b91c1c',
};

export function LakehousePipeline({ sources, bronze, silver, gold, roles, dbtProjectName, lakeAttribution }: Props) {
  const engines = ['Athena', 'Snowflake'];
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActiveIdx((i) => (i + 1) % engines.length), 1600);
    return () => clearInterval(id);
  }, [engines.length]);

  return (
    <div className="tzp">
      <style>{CSS}</style>
      <div className="tzp-grid">
        {/* ═══════════════ SOURCES ═══════════════ */}
        <section className="tzp-zone tzp-zone-sources">
          <header className="tzp-eyebrow">
            <span className="tzp-eyebrow-title">SOURCES</span>
            <span className="tzp-eyebrow-sub">Mutual Eval Plan use cases</span>
          </header>

          <div className="tzp-source-stack">
            {sources.map((s) => (
              <article key={s.id} className="tzp-source-card">
                <div className="tzp-source-logo">
                  <VendorMark kind={s.logo} size={28} />
                </div>
                <div className="tzp-source-body">
                  <div className="tzp-source-label">{s.label}</div>
                  <div className="tzp-source-today">
                    <span className="tzp-pill tzp-pill-today">TODAY</span>
                    <span>{s.today}</span>
                  </div>
                  <div className="tzp-source-after">
                    <span className="tzp-arrow">&rarr;</span>
                    <span>Fivetran: {s.fivetranSyncLabel}</span>
                    <span className="tzp-confidence" style={{ color: CONFIDENCE_COLOR[s.syncConfidence] }}>
                      {CONFIDENCE_LABEL[s.syncConfidence]}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <footer className="tzp-zone-footer">
            <VendorMark kind="fivetran" size={20} />
            <span>Log-based CDC (Oracle), REST/Bulk API (Salesforce), pattern sync (S3/SharePoint).</span>
          </footer>
        </section>

        {/* ═══════════════ AWS S3 MANAGED DATA LAKE ═══════════════ */}
        <section className="tzp-zone tzp-zone-warehouse">
          <header className="tzp-eyebrow">
            <span className="tzp-eyebrow-title">AWS S3 MANAGED DATA LAKE</span>
            <span className="tzp-eyebrow-sub">one copy, many engines</span>
          </header>

          <div className="tzp-hub">
            <VendorMark kind="awslake" size={20} />
            <div className="tzp-hub-stack">
              <span className="tzp-hub-primary">3 Fivetran connectors &rarr; one lake</span>
              <span className="tzp-hub-attr">{lakeAttribution}</span>
            </div>
            <span className="tzp-pulse-dot" />
          </div>

          <div className="tzp-col-row">
            <LayerColumn label="BRONZE" sub="raw, as-landed" tone="raw" stat={bronze} />
            <LayerColumn label="SILVER" sub="validated · GX Core" tone="staging" stat={silver} />
            <LayerColumn label="GOLD" sub="modeled · dbt Wizard" tone="marts" stat={gold} />
          </div>

          <FlowSVG />

          <footer className="tzp-warehouse-footer">
            <span className="tzp-dbt-chip">
              <VendorMark kind="dbt" size={14} />
              {dbtProjectName} — one project, Iceberg tables, Glue catalog auto-synced every run
            </span>
          </footer>
        </section>

        {/* ═══════════════ CONSUMERS ═══════════════ */}
        <section className="tzp-zone tzp-zone-consumers">
          <header className="tzp-eyebrow">
            <span className="tzp-eyebrow-title">CONSUMERS</span>
            <span className="tzp-eyebrow-sub">who reads it</span>
          </header>

          <div className="tzp-engines-block">
            <div className="tzp-block-label">Access</div>
            <div className="tzp-engine-chips">
              {engines.map((e, i) => (
                <div key={e} className={`tzp-engine-chip${activeIdx === i ? ' is-glow' : ''}`}>
                  <span>{e}</span>
                </div>
              ))}
            </div>
            <p className="tzp-engines-caption">Same Iceberg tables, no copies, no per-tool rebuild.</p>
          </div>

          <div className="tzp-divider" />

          <div className="tzp-governance-band">
            <span className="tzp-governance-title">Governed delivery</span>
            <span className="tzp-governance-detail">HIPAA BAA · HITRUST i1</span>
          </div>

          <div className="tzp-roles-block">
            <div className="tzp-block-label">Served to</div>
            <div className="tzp-role-grid">
              {roles.map((r) => (
                <div key={r.label} className="tzp-role-card">
                  <div className="tzp-role-label">{r.label}</div>
                  <div className="tzp-role-sub">{r.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function LayerColumn({ label, sub, tone, stat }: { label: string; sub: string; tone: 'raw' | 'staging' | 'marts'; stat: LayerStat }) {
  return (
    <div className={`tzp-col tzp-col-${tone}`}>
      <div className="tzp-col-head">
        <div className="tzp-col-label">{label}</div>
        <div className="tzp-col-sub">{sub}</div>
      </div>
      <div className="tzp-cyl-slot">
        <CylinderSVG tone={tone} tables={stat.tables} />
      </div>
      <div className="tzp-col-stats">
        <div className="tzp-col-rows">{formatNum(stat.rows)} rows</div>
      </div>
    </div>
  );
}

function CylinderSVG({ tone, tables }: { tone: 'raw' | 'staging' | 'marts'; tables: number }) {
  const TONES = {
    raw: { top: '#c9a165', mid: '#a67c3d', dark: '#7a5a2b', stroke: '#5c431f' },
    staging: { top: '#b9c2cc', mid: '#8b95a1', dark: '#657286', stroke: '#4d586b' },
    marts: { top: '#f7d97a', mid: '#f0c23f', dark: '#c99a0e', stroke: '#9c7a0a' },
  }[tone];

  const W = 140, H = 150;
  const cx = W / 2;
  const rx = 50;
  const ry = 14;
  const topY = 18;
  const bottomY = H - 16;
  const bodyH = bottomY - topY;

  const sidePath = [
    `M ${cx - rx} ${topY}`,
    `L ${cx - rx} ${bottomY}`,
    `A ${rx} ${ry} 0 0 0 ${cx + rx} ${bottomY}`,
    `L ${cx + rx} ${topY}`,
    'Z',
  ].join(' ');

  const gradId = `tzp-cyl-${tone}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={TONES.dark} />
          <stop offset="35%" stopColor={TONES.mid} />
          <stop offset="60%" stopColor={TONES.top} />
          <stop offset="100%" stopColor={TONES.dark} />
        </linearGradient>
      </defs>
      <path d={sidePath} fill={`url(#${gradId})`} stroke={TONES.stroke} strokeWidth="1.2" />
      <ellipse cx={cx} cy={topY + bodyH / 3} rx={rx} ry={ry} fill="none" stroke={TONES.stroke} strokeWidth="0.9" opacity="0.55" />
      <ellipse cx={cx} cy={topY + (bodyH * 2) / 3} rx={rx} ry={ry} fill="none" stroke={TONES.stroke} strokeWidth="0.9" opacity="0.55" />
      <ellipse cx={cx} cy={topY} rx={rx} ry={ry} fill={TONES.top} stroke={TONES.stroke} strokeWidth="1.2" />
      <ellipse cx={cx - rx * 0.3} cy={topY - ry * 0.2} rx={rx * 0.45} ry={ry * 0.35} fill="#ffffff" opacity="0.35" />
      <text x={cx} y={topY + bodyH / 2 + 6} textAnchor="middle" fontSize="32" fontWeight="800" fill="#0b1220" opacity="0.92" style={{ fontFamily: '"JetBrains Mono", monospace' }}>{tables}</text>
      <text x={cx} y={topY + bodyH / 2 + 22} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#0b1220" opacity="0.5" letterSpacing="1.6">TABLES</text>
    </svg>
  );
}

function FlowSVG() {
  const W = 600, H = 30;
  return (
    <svg className="tzp-flow-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="tzp-flow-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#8b95a1" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#c99a0e" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0ea894" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="url(#tzp-flow-grad)" strokeWidth="1.4" />
      {[0, 0.5, 1.0, 1.5].map((delay) => (
        <circle key={delay} r="3.2" fill="#0ea894" opacity="0">
          <animate attributeName="cx" values={`0;${W}`} dur="2.6s" begin={`${delay}s`} repeatCount="indefinite" />
          <animate attributeName="cy" values={`${H / 2};${H / 2}`} dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" dur="2.6s" begin={`${delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

function VendorMark({ kind, size = 20 }: { kind: VendorLogo; size?: number }) {
  const s: CSSProperties = { display: 'inline-block', overflow: 'visible', flexShrink: 0 };
  const common = { width: size, height: size, viewBox: '0 0 24 24', preserveAspectRatio: 'xMidYMid meet' as const, style: s, 'aria-hidden': true };
  switch (kind) {
    case 'salesforce':
      return <svg {...common}><rect width="24" height="24" rx="5" fill="#00A1E0" /><text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="900" fill="#ffffff" fontFamily="Helvetica, Arial, sans-serif">SF</text></svg>;
    case 'oracle':
      return <svg {...common}><rect width="24" height="24" rx="5" fill="#C74634" /><text x="12" y="16" textAnchor="middle" fontSize="8" fontWeight="900" fill="#ffffff" fontFamily="Helvetica, Arial, sans-serif">DB</text></svg>;
    case 's3':
      return <svg {...common}><rect width="24" height="24" rx="5" fill="#FF9900" /><text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="900" fill="#ffffff" fontFamily="Helvetica, Arial, sans-serif">S3</text></svg>;
    case 'sharepoint':
      return <svg {...common}><rect width="24" height="24" rx="5" fill="#038387" /><text x="12" y="16" textAnchor="middle" fontSize="8" fontWeight="900" fill="#ffffff" fontFamily="Helvetica, Arial, sans-serif">SP</text></svg>;
    case 'fivetran':
      return <svg {...common}><rect width="24" height="24" rx="5" fill="#0F4C9C" /><path d="M6 8h12M6 12h8M6 16h5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>;
    case 'dbt':
      return <svg {...common}><rect width="24" height="24" rx="5" fill="#FF694A" /><text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="900" fill="#ffffff">dbt</text></svg>;
    case 'awslake':
      return (
        <svg {...common}>
          <rect width="24" height="24" rx="5" fill="#FF9900" />
          <path d="M5 8c0-1 3-2 7-2s7 1 7 2v8c0 1-3 2-7 2s-7-1-7-2V8z" fill="none" stroke="#fff" strokeWidth="1.4" />
          <path d="M5 8c0 1 3 2 7 2s7-1 7-2" fill="none" stroke="#fff" strokeWidth="1.4" />
        </svg>
      );
  }
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const CSS = `
.tzp {
  --tzp-ink: #0b1220;
  --tzp-ink-2: #4b5563;
  --tzp-ink-3: #6b7280;
  --tzp-rule: #d7dbe3;
  --tzp-rule-2: #eceef2;
  --tzp-card: #ffffff;
  --tzp-navy: #0f4c9c;
  --tzp-accent: #0ea894;
  font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
  color: var(--tzp-ink);
}

.tzp-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr 1fr;
  gap: 24px;
  align-items: stretch;
}

@media (max-width: 1100px) {
  .tzp-grid { grid-template-columns: 1fr; }
}

.tzp-zone {
  position: relative;
  background: var(--tzp-card);
  border: 1.5px dashed var(--tzp-rule);
  border-radius: 8px;
  padding: 18px 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tzp-zone-warehouse {
  background: linear-gradient(180deg, #f7f9fc 0%, #fff 100%);
  border-style: solid;
  border-color: var(--tzp-rule);
}

.tzp-eyebrow {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--tzp-rule-2);
}
.tzp-eyebrow-title {
  font-family: "Crimson Pro", Georgia, serif;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1.4px;
  color: var(--tzp-ink);
}
.tzp-eyebrow-sub {
  font-size: 10.5px;
  letter-spacing: 0.06em;
  color: var(--tzp-ink-3);
  font-style: italic;
}

/* SOURCES */
.tzp-source-stack { display: flex; flex-direction: column; gap: 10px; flex: 1; }
.tzp-source-card {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 12px;
  padding: 10px 12px;
  background: #ffffff;
  border: 1px solid var(--tzp-rule-2);
  border-radius: 6px;
  align-items: start;
}
.tzp-source-logo { padding-top: 2px; }
.tzp-source-label { font-size: 13px; font-weight: 700; color: var(--tzp-ink); }
.tzp-source-today {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 4px;
  font-size: 10.5px;
  color: var(--tzp-ink-2);
  line-height: 1.4;
}
.tzp-source-after {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 5px;
  font-family: "JetBrains Mono", "SF Mono", monospace;
  font-size: 10px;
  color: var(--tzp-ink);
}
.tzp-arrow { color: var(--tzp-accent); font-weight: 700; }
.tzp-confidence {
  margin-left: auto;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tzp-pill {
  display: inline-block;
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: "JetBrains Mono", "SF Mono", monospace;
  flex-shrink: 0;
}
.tzp-pill-today { background: #7a3710; color: #fff; }

.tzp-zone-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 10px;
  margin-top: auto;
  border-top: 1px solid var(--tzp-rule-2);
  font-size: 10.5px;
  color: var(--tzp-ink-2);
}

/* LAKE */
.tzp-hub {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--tzp-navy);
  color: #eaf0fb;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 700;
}
.tzp-hub-stack { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.tzp-hub-primary {
  font-family: "Crimson Pro", Georgia, serif;
  font-size: 13px;
  font-weight: 700;
  color: #f4f8ff;
}
.tzp-hub-attr {
  font-family: "JetBrains Mono", "SF Mono", monospace;
  font-size: 9px;
  letter-spacing: 0.04em;
  color: #ffcf8a;
  opacity: 0.9;
}
.tzp-pulse-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--tzp-accent);
  box-shadow: 0 0 8px var(--tzp-accent);
  animation: tzp-pulse 1.8s ease-in-out infinite;
}

.tzp-col-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.tzp-col {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid var(--tzp-rule-2);
  border-top: 3px solid var(--tzp-ink-3);
  border-radius: 5px;
  padding: 10px 8px 12px;
  text-align: center;
  min-height: 210px;
}
.tzp-col-raw { border-top-color: #a67c3d; }
.tzp-col-staging { border-top-color: #8b95a1; }
.tzp-col-marts { border-top-color: #c99a0e; }

.tzp-col-head { margin-bottom: 4px; }
.tzp-col-label {
  font-family: "Crimson Pro", Georgia, serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2.2px;
}
.tzp-col-sub {
  font-size: 9.5px;
  color: var(--tzp-ink-3);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.tzp-cyl-slot {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 115px;
  padding: 4px 0;
}
.tzp-col-stats { margin-top: 4px; }
.tzp-col-rows {
  font-family: "JetBrains Mono", "SF Mono", monospace;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--tzp-ink);
}

.tzp-flow-svg { display: block; width: 100%; height: 24px; margin: -6px 0 0; }

.tzp-warehouse-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--tzp-rule-2);
  font-size: 10.5px;
  color: var(--tzp-ink-2);
}
.tzp-dbt-chip { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; color: var(--tzp-ink); }

/* CONSUMERS */
.tzp-engines-block { display: flex; flex-direction: column; gap: 8px; }
.tzp-block-label {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--tzp-ink-3);
  text-transform: uppercase;
}
.tzp-engine-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.tzp-engine-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  background: #ffffff;
  border: 1px solid var(--tzp-rule-2);
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--tzp-ink-2);
  transition: box-shadow 0.4s;
}
.tzp-engine-chip.is-glow { box-shadow: 0 0 0 2px rgba(14, 168, 148, 0.25); border-color: var(--tzp-accent); }
.tzp-engines-caption { font-size: 10.5px; line-height: 1.45; color: var(--tzp-ink-2); margin: 4px 0 0; }

.tzp-divider { height: 1px; background: var(--tzp-rule-2); margin: 6px 0; }

.tzp-governance-band {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 12px;
  background: #f6f7f9;
  border: 1px solid var(--tzp-rule);
  border-left: 3px solid var(--tzp-navy);
  border-radius: 4px;
  margin-bottom: 4px;
}
.tzp-governance-title {
  font-family: "Crimson Pro", Georgia, serif;
  font-size: 11.5px;
  font-weight: 700;
  color: var(--tzp-ink);
}
.tzp-governance-detail {
  font-family: "JetBrains Mono", "SF Mono", monospace;
  font-size: 9.5px;
  color: var(--tzp-ink-2);
}

.tzp-roles-block { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.tzp-role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.tzp-role-card {
  background: #ffffff;
  border: 1px solid var(--tzp-rule-2);
  border-left: 3px solid var(--tzp-accent);
  border-radius: 4px;
  padding: 8px 10px;
}
.tzp-role-label { font-size: 11.5px; font-weight: 700; color: var(--tzp-ink); }
.tzp-role-sub { font-size: 9.5px; color: var(--tzp-ink-3); margin-top: 2px; }

@keyframes tzp-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
`;
