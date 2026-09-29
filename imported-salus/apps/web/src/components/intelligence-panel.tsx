import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getConditionIntelligence, toErrorMessage } from "../lib/api";

type PersonaMode = "Patient" | "Clinician" | "Researcher";

function DecisionBadge({ decision }: { decision: "RECOMMEND" | "CONDITIONAL" | "INSUFFICIENT_EVIDENCE" }) {
  const toneClass =
    decision === "RECOMMEND" ? "intelligence-badge-good" : decision === "CONDITIONAL" ? "intelligence-badge-warn" : "intelligence-badge-danger";

  return <span className={`intelligence-decision-badge ${toneClass}`}>{decision.replaceAll("_", " ")}</span>;
}

export function PramanaIntelligencePanel({
  conditionId,
  persona,
}: {
  conditionId: string;
  persona: PersonaMode;
}) {
  const mode = persona === "Patient" ? "public" : "clinician";

  const intelligenceQuery = useQuery({
    queryKey: ["condition-intelligence", conditionId, mode],
    queryFn: () => getConditionIntelligence(conditionId, mode),
    enabled: Boolean(conditionId),
    staleTime: 60_000,
  });

  if (intelligenceQuery.isLoading) {
    return (
      <section className="panel intelligence-panel" aria-label="Pramana intelligence panel">
        <h3>Calculus Intelligence Layer</h3>
        <p className="muted">Computing Pramana score and uncertainty bands...</p>
      </section>
    );
  }

  if (intelligenceQuery.isError || !intelligenceQuery.data) {
    return (
      <section className="panel intelligence-panel" aria-label="Pramana intelligence panel">
        <h3>Calculus Intelligence Layer</h3>
        <p className="error">
          {toErrorMessage(intelligenceQuery.error, "Unable to compute intelligence output for this condition right now.")}
        </p>
        <button type="button" className="advanced-toggle" onClick={() => void intelligenceQuery.refetch()}>
          Retry
        </button>
      </section>
    );
  }

  const intelligence = intelligenceQuery.data;

  return (
    <section className="panel intelligence-panel" aria-label="Pramana intelligence panel">
      <div className="intelligence-header">
        <div>
          <h3>Calculus Intelligence Layer</h3>
          <p className="muted">
            Deterministic Pramana scoring with uncertainty gates and transparent contribution math.
          </p>
        </div>
        <DecisionBadge decision={intelligence.decision} />
      </div>

      <div className="intelligence-metrics-grid">
        <div>
          <span>Pramana Score</span>
          <strong>{intelligence.conditionPramanaScore}/100</strong>
        </div>
        <div>
          <span>Confidence Score</span>
          <strong>{intelligence.confidenceScore}/100</strong>
        </div>
        <div>
          <span>Bayesian Probability</span>
          <strong>{Math.round(intelligence.bayesianProbabilityAboveThreshold * 100)}%</strong>
        </div>
        <div>
          <span>95% Interval</span>
          <strong>
            {intelligence.confidenceInterval95.lower}-{intelligence.confidenceInterval95.upper}
          </strong>
        </div>
      </div>

      <p className="muted value-note">{intelligence.uncertainty.explanation}</p>

      <div className="intelligence-meta-row">
        <span>Coverage: {intelligence.uncertainty.dataCoverage}</span>
        <span>Model: {intelligence.modelVersion}</span>
        <span>Evidence rows: {intelligence.evidenceCount}</span>
      </div>

      <div className="intelligence-contrib-list" aria-label="Top contribution rows">
        {intelligence.contributions.slice(0, 3).map((item) => (
          <article key={item.evidenceId} className="intelligence-contrib-item">
            <div className="intelligence-contrib-title-row">
              <strong>{item.interventionName}</strong>
              <span>{item.pramanaScore}/100</span>
            </div>
            <p className="muted">
              Grade {item.evidenceGrade} | {item.studyMethodology} | recency {item.recencyYears.toFixed(1)}y
            </p>
            <p className="muted">
              Contribution math: grade {item.gradeWeight} x design {item.designWeight} x bias {item.biasWeight} x recency {item.recencyWeight}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
