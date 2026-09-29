import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getDoseResponseOptimization,
  getSingleInterventionTrajectory,
  toErrorMessage,
} from "../lib/api";

type Props = {
  evidenceId?: string;
};

export function InterventionIntelligencePanel({ evidenceId }: Props) {
  const trajectoryQuery = useQuery({
    queryKey: ["trajectory-intelligence", evidenceId],
    queryFn: () => getSingleInterventionTrajectory(evidenceId ?? ""),
    enabled: Boolean(evidenceId),
    staleTime: 120_000,
  });

  const doseQuery = useQuery({
    queryKey: ["dose-optimizer", evidenceId],
    queryFn: () => getDoseResponseOptimization(evidenceId ?? ""),
    enabled: Boolean(evidenceId),
    staleTime: 120_000,
  });

  if (!evidenceId) {
    return (
      <section className="panel intervention-panel" aria-label="Intervention simulator panel">
        <h3>Intervention Simulator</h3>
        <p className="muted">Select an intervention to view trajectory simulation and dose-response optimization.</p>
      </section>
    );
  }

  if (trajectoryQuery.isLoading || doseQuery.isLoading) {
    return (
      <section className="panel intervention-panel" aria-label="Intervention simulator panel">
        <h3>Intervention Simulator</h3>
        <p className="muted">Running single-intervention trajectory and dose optimization...</p>
      </section>
    );
  }

  if (trajectoryQuery.isError || doseQuery.isError || !trajectoryQuery.data || !doseQuery.data) {
    return (
      <section className="panel intervention-panel" aria-label="Intervention simulator panel">
        <h3>Intervention Simulator</h3>
        <p className="error">
          {toErrorMessage(trajectoryQuery.error ?? doseQuery.error, "Unable to compute intervention simulations right now.")}
        </p>
        <button
          type="button"
          className="advanced-toggle"
          onClick={() => {
            void trajectoryQuery.refetch();
            void doseQuery.refetch();
          }}
        >
          Retry
        </button>
      </section>
    );
  }

  const trajectory = trajectoryQuery.data.trajectory;
  const optimization = doseQuery.data;
  const bestDose = optimization.recommendations[optimization.optimizedDoseIndex];

  const chartWidth = 460;
  const chartHeight = 180;
  const maxTime = Math.max(1, trajectory.trajectoryPoints[trajectory.trajectoryPoints.length - 1]?.time ?? 72);

  return (
    <section className="panel intervention-panel" aria-label="Intervention simulator panel">
      <div className="intervention-header">
        <div>
          <h3>Intervention Simulator</h3>
          <p className="muted">Single-intervention PK trajectory and dose-response recommendation for the selected evidence row.</p>
        </div>
      </div>

      <div className="intervention-kpi-grid">
        <div>
          <span>Peak Concentration</span>
          <strong>{trajectory.peakConcentration.toFixed(2)}</strong>
        </div>
        <div>
          <span>Time to Effect</span>
          <strong>{trajectory.timeToPharmacologicalEffect.toFixed(1)}h</strong>
        </div>
        <div>
          <span>Half-Life</span>
          <strong>{trajectory.halfLife.toFixed(1)}h</strong>
        </div>
        <div>
          <span>Optimal Net Benefit</span>
          <strong>{bestDose.netBenefit}</strong>
        </div>
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="trajectory-chart" role="img" aria-label="Single intervention concentration trajectory">
        <rect x="32" y="12" width={chartWidth - 44} height={chartHeight - 36} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="32" y1={chartHeight - 24} x2={chartWidth - 12} y2={chartHeight - 24} stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="32" y1="20" x2="32" y2={chartHeight - 24} stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="32" y1={chartHeight - 90} x2={chartWidth - 12} y2={chartHeight - 90} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />

        <polyline
          points={trajectory.trajectoryPoints
            .map((point) => {
              const x = 32 + (point.time / maxTime) * (chartWidth - 44);
              const y = chartHeight - 24 - point.concentration * (chartHeight - 44);
              return `${x},${y}`;
            })
            .join(" ")}
          fill="none"
          stroke="#0f766e"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="dose-summary-grid">
        <article>
          <h4>Recommended Dose Window</h4>
          <p>
            {Math.round(bestDose.recommendedDoseRange.min)} - {Math.round(bestDose.recommendedDoseRange.max)}
          </p>
          <p className="muted">Frequency: {bestDose.recommendedFrequency}</p>
        </article>
        <article>
          <h4>Efficacy vs Risk</h4>
          <p>
            {bestDose.estimatedEfficacy}% efficacy / {bestDose.estimatedAdverseEventRisk}% AE risk
          </p>
          <p className={`muted safety-${bestDose.safetyMargin}`}>Safety margin: {bestDose.safetyMargin}</p>
        </article>
      </div>

      <p className="muted value-note">{bestDose.rationale}</p>
      <ul className="dose-monitoring-list">
        {bestDose.monitoringRecommendations.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
