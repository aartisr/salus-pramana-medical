import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { EvidenceTable } from "./evidence-table";
import { InteractionTimelinePanel } from "./interaction-timeline";
import { PramanaIntelligencePanel } from "./intelligence-panel";
import { InterventionIntelligencePanel } from "./intervention-intelligence";
import { GovernanceGatesPanel } from "./governance-gates-panel";
import { evidenceCsvExportUrl, listConditions, listEvidence, toErrorMessage } from "../lib/api";
import {
  ACCENT_CLASS_BY_SYSTEM,
  GOALS,
  PERSONAS,
  PERSONA_DETAILS,
  buildRankedEvidence,
  buildSummaryText,
  escapeHtml,
  type PersonaMode,
} from "./compare-dashboard/model";
import {
  BenefitRiskQuadrant,
  ClinicalValueDecomposition,
  ConfidenceLadder,
  ConfidenceSparkline,
  DashboardSkeleton,
  EmptyStatePanel,
  EvidenceTimeline,
  SafetyPanel,
} from "./compare-dashboard/sections";

export function CompareDashboard() {
  const [conditionId, setConditionId] = React.useState("");
  const [goal, setGoal] = React.useState<string>(GOALS[0]);
  const [persona, setPersona] = React.useState<PersonaMode>("Patient");
  const [selectedEvidenceId, setSelectedEvidenceId] = React.useState("");
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [allowPersonaParallax, setAllowPersonaParallax] = React.useState(false);
  const personaGridRef = React.useRef<HTMLDivElement | null>(null);
  const personaRailRef = React.useRef<HTMLDivElement | null>(null);
  const personaCardRefs = React.useRef<Record<PersonaMode, HTMLButtonElement | null>>({
    Patient: null,
    Clinician: null,
    Researcher: null,
  });

  const conditionsQuery = useQuery({
    queryKey: ["conditions"],
    queryFn: listConditions,
    staleTime: 300_000,
  });

  React.useEffect(() => {
    if (!conditionId && conditionsQuery.data && conditionsQuery.data.length > 0) {
      setConditionId(conditionsQuery.data[0].conditionId);
    }
  }, [conditionId, conditionsQuery.data]);

  const evidenceQuery = useQuery({
    queryKey: ["evidence", conditionId],
    queryFn: () => listEvidence(conditionId),
    enabled: Boolean(conditionId),
    staleTime: 30_000,
  });

  const ranked = React.useMemo(() => buildRankedEvidence(evidenceQuery.data ?? []), [evidenceQuery.data]);

  React.useEffect(() => {
    if (!selectedEvidenceId && ranked.length > 0) {
      setSelectedEvidenceId(ranked[0].evidence.evidenceId);
    }
  }, [selectedEvidenceId, ranked]);

  const selectedRow = ranked.find((entry) => entry.evidence.evidenceId === selectedEvidenceId) ?? ranked[0];
  const summaryText = buildSummaryText(ranked[0], goal, persona);
  const accentClass = selectedRow ? ACCENT_CLASS_BY_SYSTEM[selectedRow.evidence.medicalSystem] : "accent-allopathy";
  const freshCount = ranked.filter((row) => row.freshness === "Fresh").length;
  const avgConfidence = ranked.length
    ? Math.round(ranked.reduce((total, row) => total + row.confidence, 0) / ranked.length)
    : 0;
  const highRiskCount = ranked.filter((row) => row.risk >= 55).length;
  const csvExportHref = evidenceCsvExportUrl({ conditionId });

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const query = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const sync = () => setAllowPersonaParallax(query.matches);

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const updatePersonaRail = React.useCallback(() => {
    const grid = personaGridRef.current;
    const activeCard = personaCardRefs.current[persona];
    const rail = personaRailRef.current;

    if (!grid || !activeCard || !rail) {
      return;
    }

    const left = activeCard.offsetLeft - grid.scrollLeft;
    rail.style.setProperty("--rail-opacity", "1");
    rail.style.setProperty("--rail-width", `${activeCard.offsetWidth}px`);
    rail.style.setProperty("--rail-x", `${left}px`);
  }, [persona]);

  React.useEffect(() => {
    updatePersonaRail();

    const grid = personaGridRef.current;
    if (!grid) {
      return;
    }

    const onScroll = () => updatePersonaRail();
    const onResize = () => updatePersonaRail();

    grid.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      grid.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [updatePersonaRail]);

  React.useEffect(() => {
    const activeCard = personaCardRefs.current[persona];
    if (!activeCard) {
      return;
    }

    activeCard.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [persona]);

  const printSummary = () => {
    window.print();
  };

  const handlePersonaKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, current: PersonaMode) => {
    const currentIndex = PERSONAS.indexOf(current);
    if (currentIndex < 0) {
      return;
    }

    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % PERSONAS.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + PERSONAS.length) % PERSONAS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = PERSONAS.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    setPersona(PERSONAS[nextIndex]);
  };

  const handlePersonaPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!allowPersonaParallax) {
      return;
    }

    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    const tiltY = (px - 0.5) * 8;
    const tiltX = (0.5 - py) * 8;

    card.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
    card.style.setProperty("--glow-x", `${(px * 100).toFixed(2)}%`);
    card.style.setProperty("--glow-y", `${(py * 100).toFixed(2)}%`);
    card.style.setProperty("--glow-opacity", "1");
  };

  const handlePersonaPointerLeave = (event: React.PointerEvent<HTMLButtonElement>) => {
    const card = event.currentTarget;
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
    card.style.setProperty("--glow-opacity", "0");
  };

  const exportSummaryPdf = () => {
    if (!selectedRow) {
      return;
    }

    const related = ranked.filter((row) => row.evidence.interventionName === selectedRow.evidence.interventionName);

    const citations = related
      .slice(0, 12)
      .map((row, index) => {
        const ev = row.evidence;
        const label = `${index + 1}. ${ev.registryIdentifier} | ${ev.studyMethodology} | Grade ${ev.evidenceGrade} | Confidence ${row.confidence}`;
        return `<li><strong>${escapeHtml(label)}</strong><br/><a href="${escapeHtml(ev.sourceUrl)}">${escapeHtml(ev.sourceUrl)}</a></li>`;
      })
      .join("");

    const contraindications = selectedRow.evidence.contraindications.length
      ? selectedRow.evidence.contraindications.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
      : "<li>None listed in current records.</li>";

    const interactions = selectedRow.evidence.interactionWarnings.length
      ? selectedRow.evidence.interactionWarnings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")
      : "<li>None listed in current records.</li>";

    const today = new Date().toISOString().slice(0, 10);

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>SALUS Clinical Summary - ${escapeHtml(selectedRow.evidence.interventionName)}</title>
  <style>
    :root {
      --ink: #0f172a;
      --muted: #475569;
      --line: #cbd5e1;
      --brand: #0f766e;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 26px;
      color: var(--ink);
      font-family: "Avenir Next", "Segoe UI", sans-serif;
      background: #ffffff;
    }
    header {
      border: 1px solid var(--line);
      border-left: 6px solid var(--brand);
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 14px;
    }
    h1, h2, h3 { margin: 0; }
    h1 { font-size: 1.45rem; }
    .subtitle {
      margin-top: 6px;
      color: var(--muted);
      font-size: 0.94rem;
    }
    .meta {
      margin-top: 10px;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }
    .meta div {
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 8px;
      background: #f8fafc;
    }
    .label {
      color: var(--muted);
      font-size: 0.76rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .value {
      margin-top: 4px;
      font-weight: 700;
      font-size: 0.92rem;
    }
    section {
      margin-top: 14px;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 12px;
    }
    p { line-height: 1.45; }
    ul { margin: 8px 0 0; padding-left: 20px; }
    li { margin-bottom: 6px; }
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .citation-list li {
      margin-bottom: 10px;
    }
    footer {
      margin-top: 14px;
      color: var(--muted);
      font-size: 0.8rem;
    }
    @media print {
      body { padding: 14mm; }
      a { color: #0f766e; text-decoration: underline; }
    }
  </style>
</head>
<body>
  <header>
    <h1>SALUS Clinical Summary</h1>
    <p class="subtitle">Transparent evidence guidance across systems with explicit confidence, safety context, and source traceability.</p>
    <div class="meta">
      <div><div class="label">Condition</div><div class="value">${escapeHtml(conditionId || "Not selected")}</div></div>
      <div><div class="label">Generated</div><div class="value">${escapeHtml(today)}</div></div>
      <div><div class="label">Persona</div><div class="value">${escapeHtml(persona)}</div></div>
    </div>
  </header>

  <section>
    <h2>${escapeHtml(selectedRow.evidence.interventionName)}</h2>
    <p>${escapeHtml(selectedRow.evidence.medicalSystem)} | Grade ${escapeHtml(selectedRow.evidence.evidenceGrade)} | Confidence ${selectedRow.confidence}/100</p>
    <p>${escapeHtml(selectedRow.evidence.clinicalOutcomeSummary)}</p>
    <div class="meta">
      <div><div class="label">Methodology</div><div class="value">${escapeHtml(selectedRow.evidence.studyMethodology)}</div></div>
      <div><div class="label">Registry ID</div><div class="value">${escapeHtml(selectedRow.evidence.registryIdentifier)}</div></div>
      <div><div class="label">Last Verified</div><div class="value">${escapeHtml(selectedRow.evidence.lastVerifiedDate ?? "Not provided")}</div></div>
    </div>
  </section>

  <section class="two-col">
    <div>
      <h3>Contraindications</h3>
      <ul>${contraindications}</ul>
    </div>
    <div>
      <h3>Interaction Warnings</h3>
      <ul>${interactions}</ul>
    </div>
  </section>

  <section>
    <h3>Citation Appendix</h3>
    <ul class="citation-list">${citations || "<li>No related citations available.</li>"}</ul>
  </section>

  <footer>
    SALUS is an evidence organization platform and does not replace clinical judgment.
  </footer>

  <script>
    window.addEventListener('load', () => {
      window.print();
      setTimeout(() => window.close(), 250);
    });
  </script>
</body>
</html>`;

    const exportWindow = window.open("", "_blank", "noopener,noreferrer,width=1000,height=900");
    if (!exportWindow) {
      return;
    }

    exportWindow.document.open();
    exportWindow.document.write(html);
    exportWindow.document.close();
  };

  return (
    <section className={`dashboard-grid ${accentClass}`}>
      <div className="hero-shell">
        <div className="intent-card">
          <span className="eyebrow">Intelligent Care Navigation</span>
          <h2>Compare Evidence with Confidence</h2>
          <p className="muted">Choose condition and goal. Then select a persona lens below to adapt framing depth without adding cognitive overload.</p>
          <div className="control-grid">
            <label>
              Condition
              <select
                value={conditionId}
                onChange={(event) => {
                  setConditionId(event.target.value);
                  setSelectedEvidenceId("");
                }}
                disabled={conditionsQuery.isLoading || conditionsQuery.isError}
              >
                {(conditionsQuery.data ?? []).map((condition) => (
                  <option key={condition.conditionId} value={condition.conditionId}>
                    {condition.standardName}
                  </option>
                ))}
              </select>
            </label>
            <label className="goal-control">
              Goal
              <select value={goal} onChange={(event) => setGoal(event.target.value)}>
                {GOALS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <aside className="signal-card" aria-label="Evidence signal summary">
          <h3>At-a-Glance Metrics</h3>
          <div className="signal-grid">
            <div>
              <span>Avg confidence</span>
              <strong>{avgConfidence}</strong>
            </div>
            <small>/100</small>
            <div>
              <span>Fresh records</span>
              <strong>{freshCount}</strong>
            </div>
            <small>verified in 2 years</small>
            <div>
              <span>High-risk flags</span>
              <strong>{highRiskCount}</strong>
            </div>
            <small>requiring extra caution</small>
          </div>
        </aside>
      </div>

      <section className="persona-lens-strip panel" aria-label="Persona lens selector">
        <div className="persona-lens-header">
          <h3>Choose Your Persona Lens</h3>
          <p className="muted">This changes how recommendations are explained, not what evidence exists.</p>
        </div>
        <div className="persona-lens-grid" role="tablist" aria-label="Persona mode" ref={personaGridRef}>
          <div className="persona-lens-active-rail" ref={personaRailRef} aria-hidden="true" />
          {PERSONAS.map((item, index) => {
            const meta = PERSONA_DETAILS[item];
            const isActive = item === persona;

            return (
              <button
                key={item}
                type="button"
                role="tab"
                className={`persona-lens-card reveal-item reveal-delay-${Math.min(index, 5)} ${isActive ? "active" : ""}`}
                onClick={() => setPersona(item)}
                onKeyDown={(event) => handlePersonaKeyDown(event, item)}
                onPointerMove={handlePersonaPointerMove}
                onPointerLeave={handlePersonaPointerLeave}
                ref={(element) => {
                  personaCardRefs.current[item] = element;
                }}
              >
                <span className="persona-lens-badge" aria-hidden="true">{meta.badge}</span>
                <strong>{item}</strong>
                <span>{meta.subtitle}</span>
                <small>{meta.hint}</small>
              </button>
            );
          })}
        </div>
      </section>

      <div className="answer-strip">
        <h3>Best Next Action</h3>
        <p>{summaryText}</p>
        <p className="no-equivalency-banner">
          Evidence grades are not interchangeable across systems. Grade A and Grade B options for the same condition must not be treated as causally equivalent.
        </p>
        <div className="quick-insights" role="list" aria-label="Quick evidence indicators">
          <div role="listitem" className="insight-pill">
            <span>Top Recommendation</span>
            <strong>{ranked[0]?.evidence.interventionName ?? "Pending"}</strong>
          </div>
          <div role="listitem" className="insight-pill">
            <span>Most represented system</span>
            <strong>{ranked[0]?.evidence.medicalSystem ?? "Pending"}</strong>
          </div>
          <div role="listitem" className="insight-pill">
            <span>Selected persona</span>
            <strong>{persona}</strong>
          </div>
        </div>
        <div className="answer-actions">
          {conditionId ? (
            <Link to="/compare/$conditionId" params={{ conditionId }} className="compare-link">
              Open Side-by-Side Systems Comparison
            </Link>
          ) : null}
          <a href={csvExportHref} className="compare-link" download>
            Export Evidence CSV
          </a>
        </div>
      </div>

      <div className="trust-strip" role="region" aria-label="Evidence trust principles">
        <div className="trust-pill">
          <strong>Source-first</strong>
          <span>Every recommendation links back to a verifiable registry ID and source URL.</span>
        </div>
        <div className="trust-pill">
          <strong>Uncertainty shown</strong>
          <span>Confidence is visible and updates as evidence ages, replicates, or improves.</span>
        </div>
        <div className="trust-pill">
          <strong>Safety visible</strong>
          <span>Contraindications and interactions are always surfaced, never buried.</span>
        </div>
      </div>

      {evidenceQuery.isLoading ? <p className="muted">Loading evidence...</p> : null}
      {evidenceQuery.isError ? (
        <p className="error">{toErrorMessage(evidenceQuery.error, "Failed to load evidence records for the selected condition.")}</p>
      ) : null}
      {evidenceQuery.isLoading ? <DashboardSkeleton /> : null}
      {!evidenceQuery.isLoading && ranked.length === 0 ? <EmptyStatePanel /> : null}

      <div className="cards-grid" aria-label="Top interventions">
        {ranked.slice(0, 3).map((row, index) => {
          const selected = selectedRow?.evidence.evidenceId === row.evidence.evidenceId;
          return (
            <article
              key={row.evidence.evidenceId}
              className={`evidence-card reveal-item reveal-delay-${Math.min(index, 5)} ${selected ? "active" : ""}`}
            >
              <button type="button" className="card-select" onClick={() => setSelectedEvidenceId(row.evidence.evidenceId)}>
                <span className="rank-badge">#{index + 1}</span>
                <h4>{row.evidence.interventionName}</h4>
              </button>
              <p className="muted">{row.evidence.medicalSystem}</p>
              <div className="metric-row">
                <div>
                  <span className="metric-label">Confidence</span>
                  <strong>{row.confidence}/100</strong>
                </div>
                <div>
                  <span className="metric-label">Grade</span>
                  <strong>{row.evidence.evidenceGrade}</strong>
                </div>
                <div>
                  <span className="metric-label">Freshness</span>
                  <strong>{row.freshness}</strong>
                </div>
              </div>
              <div className="trend-row" aria-label="Confidence trend">
                <span className="metric-label">Confidence trend</span>
                <ConfidenceSparkline rows={ranked} interventionName={row.evidence.interventionName} />
              </div>
              <details>
                <summary>Why this rank</summary>
                <p>{row.rankReason}</p>
              </details>
            </article>
          );
        })}
      </div>

      <div className="chart-grid">
        <ConfidenceLadder rows={ranked} />
        <BenefitRiskQuadrant rows={ranked} />
      </div>

      <ClinicalValueDecomposition rows={ranked} persona={persona} />

      <PramanaIntelligencePanel conditionId={conditionId} persona={persona} />

      <GovernanceGatesPanel conditionId={conditionId} persona={persona} />

      <InterventionIntelligencePanel evidenceId={selectedRow?.evidence.evidenceId} />

      <InteractionTimelinePanel ranked={ranked} conditionId={conditionId} />

      <EvidenceTimeline rows={ranked} />
      <SafetyPanel row={selectedRow} />

      <details className="panel trust-charter" aria-label="Trust charter and governance">
        <summary className="deep-dive-summary">Open trust charter and governance checks</summary>
        <h3>Trust Charter</h3>
        <p className="muted">SALUS is designed for honest interpretation, not overclaiming.</p>
        <div className="charter-grid">
          <article>
            <h4>What we always do</h4>
            <ul>
              <li>Show confidence level and evidence grade side by side.</li>
              <li>Separate benefit signal from safety burden.</li>
              <li>Preserve source traceability for every displayed record.</li>
            </ul>
          </article>
          <article>
            <h4>What we never do</h4>
            <ul>
              <li>Hide risks behind advanced sections.</li>
              <li>Present Grade C evidence as definitive clinical proof.</li>
              <li>Suggest treatment certainty where evidence is incomplete.</li>
            </ul>
          </article>
        </div>
      </details>

      <section className="panel print-summary-panel" aria-label="Printable clinical summary">
        <div className="print-summary-header">
          <div>
            <h3>Shareable Clinical Snapshot</h3>
            <p className="muted">Designed for quick clinician handoff, second opinion review, and consultation printouts.</p>
          </div>
          <div className="print-actions">
            <button type="button" className="advanced-toggle" onClick={printSummary}>
              Print Summary
            </button>
            <button type="button" className="advanced-toggle" onClick={exportSummaryPdf}>
              Export PDF Summary
            </button>
          </div>
        </div>

        {selectedRow ? (
          <article className="print-summary-sheet" aria-label="Selected intervention summary">
            <h4>{selectedRow.evidence.interventionName}</h4>
            <p>
              {selectedRow.evidence.medicalSystem} | Grade {selectedRow.evidence.evidenceGrade} | Confidence {selectedRow.confidence}/100
            </p>
            <p>{selectedRow.evidence.clinicalOutcomeSummary}</p>
            <div className="print-meta-grid">
              <div>
                <span className="metric-label">Methodology</span>
                <strong>{selectedRow.evidence.studyMethodology}</strong>
              </div>
              <div>
                <span className="metric-label">Registry ID</span>
                <strong>{selectedRow.evidence.registryIdentifier}</strong>
              </div>
              <div>
                <span className="metric-label">Last Verified</span>
                <strong>{selectedRow.evidence.lastVerifiedDate ?? "Not provided"}</strong>
              </div>
            </div>
          </article>
        ) : (
          <p className="muted">Select an intervention to prepare a print-ready summary.</p>
        )}
      </section>

      <div className="panel advanced-table-panel">
        <h3>Evidence Table (Advanced)</h3>
        <p className="muted value-note">Use this when you need row-level verification and safety details beyond the ranked summary view.</p>
        <button type="button" className="advanced-toggle" onClick={() => setShowAdvanced((prev) => !prev)}>
          {showAdvanced ? "Hide" : "Show"} advanced evidence table
        </button>
        {showAdvanced ? <EvidenceTable conditionId={conditionId} /> : <p className="muted">Advanced table is collapsed by default to keep focus.</p>}
      </div>
    </section>
  );
}
