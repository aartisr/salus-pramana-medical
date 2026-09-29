import React from "react";
import { Link } from "@tanstack/react-router";
import type { TreatmentEvidence } from "@evidence-platform/domain";
import type { RankedEvidence } from "./model";
import type { PersonaMode } from "./model";

export function ConfidenceLadder({ rows }: { rows: RankedEvidence[] }) {
  if (rows.length === 0) {
    return <p className="muted">No data yet for this condition.</p>;
  }

  return (
    <div className="panel">
      <h3>Best Options by Confidence</h3>
      <p className="muted">See the strongest evidence-backed options first.</p>
      <ul className="ladder-list">
        {rows.slice(0, 6).map((row, index) => (
          <li key={row.evidence.evidenceId} className={`reveal-item reveal-delay-${Math.min(index, 5)}`}>
            <div className="ladder-label-row">
              <span>{row.evidence.interventionName}</span>
              <strong>{row.confidence}</strong>
            </div>
            <div className="ladder-track" aria-hidden="true">
              <progress className="ladder-bar-progress" value={row.confidence} max={100} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ConfidenceSparkline({ rows, interventionName }: { rows: RankedEvidence[]; interventionName: string }) {
  const series = rows
    .filter((row) => row.evidence.interventionName === interventionName)
    .sort((a, b) => {
      const yearA = Number.parseInt((a.evidence.lastVerifiedDate ?? "2020-01-01").slice(0, 4), 10) || 2020;
      const yearB = Number.parseInt((b.evidence.lastVerifiedDate ?? "2020-01-01").slice(0, 4), 10) || 2020;
      return yearA - yearB;
    })
    .map((row) => row.confidence)
    .slice(-6);

  if (series.length <= 1) {
    return <span className="sparkline-muted">Trend pending</span>;
  }

  const width = 120;
  const height = 34;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const spread = Math.max(1, max - min);

  const points = series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * (width - 4) + 2;
      const y = height - 2 - ((value - min) / spread) * (height - 8);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="confidence-sparkline" role="img" aria-label="Confidence trend sparkline">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function useCompactViewport(maxWidth: number) {
  const [isCompact, setIsCompact] = React.useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(`(max-width: ${maxWidth}px)`).matches;
  });

  React.useEffect(() => {
    const query = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const onChange = () => setIsCompact(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [maxWidth]);

  return isCompact;
}

export function BenefitRiskQuadrant({ rows }: { rows: RankedEvidence[] }) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const isCompact = useCompactViewport(720);
  const [visibleGrades, setVisibleGrades] = React.useState<Record<TreatmentEvidence["evidenceGrade"], boolean>>({
    A: true,
    B: true,
    C: true,
  });
  const width = isCompact ? 320 : 380;
  const height = isCompact ? 230 : 260;
  const inset = isCompact ? 24 : 28;
  const plotWidth = width - inset * 2;
  const plotHeight = height - inset * 2;

  const positionX = (value: number) => inset + (value / 100) * plotWidth;
  const positionY = (value: number) => inset + plotHeight - (value / 100) * plotHeight;
  const visibleRows = rows.filter((row) => visibleGrades[row.evidence.evidenceGrade]);
  const activeRow = rows.find((row) => row.evidence.evidenceId === activeId) ?? null;

  const pointColor = (grade: TreatmentEvidence["evidenceGrade"], isActive: boolean) => {
    if (isActive) {
      return "#0f766e";
    }
    if (grade === "A") return "#16a34a";
    if (grade === "B") return "#f59e0b";
    return "#64748b";
  };

  return (
    <div className="panel">
      <h3>Benefit vs Risk Map</h3>
      <p className="muted">Use this map to quickly spot options with higher likely benefit and lower safety burden.</p>
      <div className="legend-row" role="group" aria-label="Toggle evidence grades">
        {(["A", "B", "C"] as const).map((grade) => (
          <button
            key={grade}
            type="button"
            className={`legend-chip ${visibleGrades[grade] ? "active" : ""}`}
            onClick={() => setVisibleGrades((prev) => ({ ...prev, [grade]: !prev[grade] }))}
          >
            Grade {grade}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="quadrant-chart" role="img" aria-label="Benefit and risk quadrant">
        <rect x={inset} y={inset} width={plotWidth} height={plotHeight} fill="#f8fafc" />
        <line x1={inset} y1={positionY(50)} x2={width - inset} y2={positionY(50)} stroke="#cbd5e1" strokeDasharray="5 4" />
        <line x1={positionX(50)} y1={inset} x2={positionX(50)} y2={height - inset} stroke="#cbd5e1" strokeDasharray="5 4" />
        <text x={inset} y={16} fill="#0f172a" fontSize={isCompact ? "10" : "12"}>Lower Risk</text>
        <text x={width - inset - (isCompact ? 82 : 70)} y={16} fill="#0f172a" fontSize={isCompact ? "10" : "12"}>Higher Benefit</text>

        {visibleRows.slice(0, 8).map((row) => {
          const x = positionX(row.benefit);
          const y = positionY(100 - row.risk);
          const isActive = activeId === row.evidence.evidenceId;
          return (
            <g key={row.evidence.evidenceId}>
              <circle
                cx={x}
                cy={y}
                r={isActive ? 7.5 : 6}
                fill={pointColor(row.evidence.evidenceGrade, isActive)}
                opacity="0.95"
                className="chart-point"
                tabIndex={0}
                role="button"
                aria-label={`${row.evidence.interventionName}: benefit ${row.benefit}, risk ${row.risk}, confidence ${row.confidence}`}
                onMouseEnter={() => setActiveId(row.evidence.evidenceId)}
                onFocus={() => setActiveId(row.evidence.evidenceId)}
                onMouseLeave={() => setActiveId((current) => (current === row.evidence.evidenceId ? null : current))}
                onBlur={() => setActiveId((current) => (current === row.evidence.evidenceId ? null : current))}
              />
              {!isCompact ? (
                <text x={x + 8} y={y - 8} fontSize="10" fill="#1e293b">
                  {row.evidence.interventionName.slice(0, 18)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {isCompact ? (
        <div className="compact-chart-list" aria-label="Top compact chart entries">
          {visibleRows.slice(0, 4).map((row) => (
            <p key={row.evidence.evidenceId}>
              <strong>{row.evidence.interventionName}</strong>
              <span>Benefit {row.benefit} • Risk {row.risk}</span>
            </p>
          ))}
        </div>
      ) : null}
      {visibleRows.length === 0 ? <p className="muted chart-hint">Enable at least one grade in the legend to view plot points.</p> : null}
      {activeRow ? (
        <div className="chart-tooltip" role="status" aria-live="polite">
          <strong>{activeRow.evidence.interventionName}</strong>
          <span>Benefit {activeRow.benefit} | Risk {activeRow.risk} | Confidence {activeRow.confidence}</span>
        </div>
      ) : (
        <p className="muted chart-hint">Hover or focus a point for precise evidence context.</p>
      )}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <section className="skeleton-grid" aria-hidden="true">
      <div className="skeleton-block skeleton-hero" />
      <div className="skeleton-row">
        <div className="skeleton-block" />
        <div className="skeleton-block" />
        <div className="skeleton-block" />
      </div>
      <div className="skeleton-row">
        <div className="skeleton-block skeleton-chart" />
        <div className="skeleton-block skeleton-chart" />
      </div>
    </section>
  );
}

export function EmptyStatePanel() {
  return (
    <section className="panel empty-state-panel" role="status">
      <svg viewBox="0 0 320 150" className="empty-illustration" aria-hidden="true">
        <defs>
          <linearGradient id="emptyGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#99f6e4" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
        </defs>
        <rect x="24" y="24" width="272" height="100" rx="18" fill="url(#emptyGlow)" opacity="0.6" />
        <circle cx="82" cy="74" r="20" fill="#0f766e" opacity="0.16" />
        <circle cx="134" cy="68" r="14" fill="#0ea5e9" opacity="0.2" />
        <path d="M176 85 Q208 52 248 70" fill="none" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
      </svg>
      <h3>No evidence records for this condition yet</h3>
      <p className="muted">Start with one verifiable source and the dashboard will automatically build confidence, risk, and timeline insights.</p>
      <Link to="/new" className="primary-button empty-cta">
        Submit First Evidence Record
      </Link>
    </section>
  );
}

export function EvidenceTimeline({ rows }: { rows: RankedEvidence[] }) {
  const series = rows.reduce<Record<number, { A: number; B: number; C: number }>>((acc, row) => {
    const year = Number.parseInt((row.evidence.lastVerifiedDate ?? "2021-01-01").slice(0, 4), 10) || 2021;
    if (!acc[year]) {
      acc[year] = { A: 0, B: 0, C: 0 };
    }
    acc[year][row.evidence.evidenceGrade] += 1;
    return acc;
  }, {});

  const years = Object.keys(series)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="panel timeline-panel">
      <h3>Evidence Freshness Timeline</h3>
      <p className="muted">Check how recent the supporting evidence is before trusting a recommendation.</p>
      {years.length === 0 ? (
        <p className="muted">No verification timeline available.</p>
      ) : (
        <div className="timeline-grid">
          {years.map((year) => {
            const block = series[year];
            const total = block.A + block.B + block.C;
            const aPct = total ? (block.A / total) * 100 : 0;
            const bPct = total ? (block.B / total) * 100 : 0;
            const cPct = total ? (block.C / total) * 100 : 0;

            return (
              <div key={year} className="timeline-row">
                <span>{year}</span>
                <svg viewBox="0 0 100 12" className="stacked-bar" role="img" aria-label={`Evidence grades for ${year}`} preserveAspectRatio="none">
                  <rect x="0" y="0" width={aPct} height="12" className="bar-grade-a" />
                  <rect x={aPct} y="0" width={bPct} height="12" className="bar-grade-b" />
                  <rect x={aPct + bPct} y="0" width={cPct} height="12" className="bar-grade-c" />
                </svg>
                <span>{total} studies</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function SafetyPanel({ row }: { row?: RankedEvidence }) {
  if (!row) {
    return (
      <div className="panel safety-overview-panel">
        <h3>Safety First Overview</h3>
        <p className="muted">Select an intervention card to review contraindications and interactions.</p>
      </div>
    );
  }

  const hasWarnings = row.evidence.interactionWarnings.length > 0;

  return (
    <div className="panel safety-overview-panel">
      <h3>Safety First Overview</h3>
      <p className="muted">{row.evidence.interventionName}</p>
      <div className={`safety-pill ${hasWarnings ? "risk-high" : "risk-low"}`}>
        {hasWarnings ? "Elevated interaction risk" : "No major interaction signals in current record"}
      </div>
      <p className="muted value-note">
        Value add: this section highlights what can go wrong first, so decisions are safer before comparing effectiveness.
      </p>

      <div className="safety-grid">
        <div>
          <h4>Contraindications</h4>
          {row.evidence.contraindications.length === 0 ? (
            <p className="muted">None listed</p>
          ) : (
            <ul>
              {row.evidence.contraindications.map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h4>Interaction Warnings</h4>
          {row.evidence.interactionWarnings.length === 0 ? (
            <p className="muted">None listed</p>
          ) : (
            <ul>
              {row.evidence.interactionWarnings.map((item: string) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="next-step-box" role="note" aria-label="Recommended next step">
        <strong>Recommended next step</strong>
        <p>
          {hasWarnings
            ? "Review interaction warnings with a clinician/pharmacist before combining this with current medications."
            : "Proceed to compare confidence trend and methodology details, then validate fit for patient context."}
        </p>
      </div>
    </div>
  );
}

function personaRiskWeight(persona: PersonaMode) {
  if (persona === "Patient") return 0.65;
  if (persona === "Clinician") return 0.8;
  return 0.55;
}

function freshnessBonus(freshness: RankedEvidence["freshness"]) {
  if (freshness === "Fresh") return 10;
  if (freshness === "Recent") return 4;
  return 0;
}

type DecompositionRow = {
  evidenceId: string;
  interventionName: string;
  confidenceBase: number;
  freshnessAdj: number;
  riskPenalty: number;
  finalScore: number;
};

type SensitivityProfile = "persona-default" | "risk-conservative" | "risk-neutral" | "risk-tolerant";

const SENSITIVITY_PROFILES: Record<
  SensitivityProfile,
  { label: string; multiplier: number; hint: string }
> = {
  "persona-default": {
    label: "Persona default",
    multiplier: 1,
    hint: "Uses the persona-specific risk posture.",
  },
  "risk-conservative": {
    label: "Risk conservative",
    multiplier: 1.2,
    hint: "Penalizes risk more strongly.",
  },
  "risk-neutral": {
    label: "Risk neutral",
    multiplier: 1,
    hint: "Balances confidence and risk evenly.",
  },
  "risk-tolerant": {
    label: "Risk tolerant",
    multiplier: 0.8,
    hint: "Penalizes risk less for exploratory decisions.",
  },
};

function buildDecomposition(rows: RankedEvidence[], persona: PersonaMode, multiplier: number): DecompositionRow[] {
  const riskWeight = personaRiskWeight(persona) * multiplier;

  return rows
    .slice(0, 5)
    .map((row) => {
      const confidenceBase = row.confidence;
      const freshnessAdj = freshnessBonus(row.freshness);
      const riskPenalty = Math.round(row.risk * riskWeight);
      const finalScore = Math.max(0, Math.min(100, Math.round(confidenceBase + freshnessAdj - riskPenalty)));

      return {
        evidenceId: row.evidence.evidenceId,
        interventionName: row.evidence.interventionName,
        confidenceBase,
        freshnessAdj,
        riskPenalty,
        finalScore,
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore);
}

export function ClinicalValueDecomposition({ rows, persona }: { rows: RankedEvidence[]; persona: PersonaMode }) {
  const [profile, setProfile] = React.useState<SensitivityProfile>("persona-default");

  const topRows = React.useMemo(
    () => buildDecomposition(rows, persona, SENSITIVITY_PROFILES[profile].multiplier),
    [rows, persona, profile],
  );
  const baselineRows = React.useMemo(() => buildDecomposition(rows, persona, 1), [rows, persona]);
  const baselineRankById = React.useMemo(() => {
    return baselineRows.reduce<Record<string, number>>((acc, row, index) => {
      acc[row.evidenceId] = index + 1;
      return acc;
    }, {});
  }, [baselineRows]);

  if (topRows.length === 0) {
    return null;
  }

  return (
    <section className="panel clinical-value-panel" aria-label="Top 5 clinical value decomposition">
      <h3>Top 5 Clinical Value Decomposition</h3>
      <p className="muted">
        This chart decomposes each top option into confidence baseline, recency bonus, and persona-adjusted risk penalty,
        so the final ordering is interpretable instead of opaque.
      </p>
      <div className="clinical-sensitivity-controls" role="group" aria-label="Clinical value sensitivity profile">
        {Object.entries(SENSITIVITY_PROFILES).map(([key, config]) => (
          <button
            key={key}
            type="button"
            className={`clinical-sensitivity-chip ${profile === key ? "active" : ""}`}
            onClick={() => setProfile(key as SensitivityProfile)}
            title={config.hint}
          >
            {config.label}
          </button>
        ))}
      </div>
      <div className="clinical-value-legend" role="list" aria-label="Clinical value legend">
        <span role="listitem"><i className="legend-swatch legend-confidence" aria-hidden="true" /> Confidence base</span>
        <span role="listitem"><i className="legend-swatch legend-freshness" aria-hidden="true" /> Freshness bonus</span>
        <span role="listitem"><i className="legend-swatch legend-risk" aria-hidden="true" /> Risk penalty</span>
      </div>
      <div className="clinical-value-list">
        {topRows.map((row, index) => {
          const currentRank = index + 1;
          const baselineRank = baselineRankById[row.evidenceId] ?? currentRank;
          const shift = baselineRank - currentRank;
          const confidenceWidth = Math.min(row.confidenceBase, 100);
          const freshnessWidth = Math.min(row.freshnessAdj, 100 - confidenceWidth);
          const riskWidth = Math.min(row.riskPenalty, 100);

          return (
          <article key={row.evidenceId} className="clinical-value-row">
            <div className="clinical-value-row-head">
              <strong>#{currentRank} {row.interventionName}</strong>
              <span>
                Final {row.finalScore}/100
                <em className={`rank-shift ${shift > 0 ? "up" : shift < 0 ? "down" : "steady"}`}>
                  {shift > 0 ? ` ↑${shift}` : shift < 0 ? ` ↓${Math.abs(shift)}` : " -"}
                </em>
              </span>
            </div>
            <div className="clinical-value-track" role="img" aria-label={`${row.interventionName} decomposition`}>
              <svg viewBox="0 0 100 12" className="clinical-value-track-svg" preserveAspectRatio="none" aria-hidden="true">
                <rect x="0" y="0" width={confidenceWidth} height="12" className="clinical-value-segment confidence" />
                <rect x={confidenceWidth} y="0" width={freshnessWidth} height="12" className="clinical-value-segment freshness" />
                <rect x={100 - riskWidth} y="0" width={riskWidth} height="12" className="clinical-value-segment risk" />
              </svg>
            </div>
            <p className="muted clinical-value-math">
              {row.confidenceBase} + {row.freshnessAdj} - {row.riskPenalty} = {row.finalScore}
            </p>
          </article>
          );
        })}
      </div>
    </section>
  );
}
