import React from "react";
import { useQuery } from "@tanstack/react-query";
import type { RankedEvidence } from "./compare-dashboard/model";
import { getInteractionTimeline } from "../lib/api";

export function InteractionTimelinePanel({ ranked, conditionId }: { ranked: RankedEvidence[]; conditionId: string }) {
  const [selectedPair, setSelectedPair] = React.useState<[string, string] | null>(null);

  const timelineQuery = useQuery({
    queryKey: ["interaction-timeline", conditionId, selectedPair],
    queryFn: () => {
      if (!selectedPair) {
        return null;
      }
      return getInteractionTimeline(conditionId, selectedPair[0], selectedPair[1], 48);
    },
    enabled: Boolean(conditionId && selectedPair),
    staleTime: 120_000,
  });

  const interactionPairs = ranked
    .flatMap((rowA) =>
      ranked
        .filter((rowB) => rowA.evidence.evidenceId !== rowB.evidence.evidenceId)
        .map((rowB) => ({
          a: rowA.evidence.interventionName,
          b: rowB.evidence.interventionName,
          hasWarning: rowA.evidence.interactionWarnings && rowA.evidence.interactionWarnings.length > 0
              || rowB.evidence.interactionWarnings && rowB.evidence.interactionWarnings.length > 0,
        })),
    )
    .filter((pair, index, arr) => arr.findIndex((p) => (p.a === pair.b && p.b === pair.a) || (p.a === pair.a && p.b === pair.b)) === index)
    .filter((pair) => pair.hasWarning)
    .slice(0, 6);

  if (interactionPairs.length === 0) {
    return (
      <section className="panel interaction-timeline-panel" aria-label="Interaction timeline">
        <h3>Co-Administration Interaction Timeline</h3>
        <p className="muted">No known interaction pairs currently in evidence base.</p>
      </section>
    );
  }

  const currentData = timelineQuery.data;

  return (
    <section className="panel interaction-timeline-panel" aria-label="Interaction timeline">
      <div className="interaction-header">
        <div>
          <h3>Co-Administration Interaction Timeline</h3>
          <p className="muted">ODE-based risk trajectory for selected intervention pair over 48-hour horizon.</p>
        </div>
      </div>

      <div className="interaction-pair-selector">
        {interactionPairs.map((pair) => (
          <button
            key={`${pair.a}|${pair.b}`}
            type="button"
            className={`interaction-pair-button ${selectedPair?.[0] === pair.a && selectedPair?.[1] === pair.b ? "active" : ""}`}
            onClick={() => setSelectedPair([pair.a, pair.b])}
          >
            {pair.a} + {pair.b}
          </button>
        ))}
      </div>

      {timelineQuery.isLoading ? (
        <p className="muted">Computing interaction dynamics...</p>
      ) : timelineQuery.isError || !currentData ? (
        <p className="error">Unable to compute interaction timeline.</p>
      ) : (
        <>
          <div className="interaction-risk-grid">
            <div>
              <span>Peak Risk Score</span>
              <strong>{currentData.timeline.peakRiskScore}/100</strong>
            </div>
            <div>
              <span>Time to Peak</span>
              <strong>{currentData.timeline.peakRiskTime.toFixed(1)}h</strong>
            </div>
            <div>
              <span>Severity</span>
              <strong className={`severity-${currentData.timeline.severityClass}`}>
                {currentData.timeline.severityClass.charAt(0).toUpperCase() + currentData.timeline.severityClass.slice(1)}
              </strong>
            </div>
            {currentData.timeline.timeToMildRisk !== null && (
              <div>
                <span>Onset (mild risk)</span>
                <strong>{currentData.timeline.timeToMildRisk.toFixed(1)}h</strong>
              </div>
            )}
          </div>

          <svg viewBox="0 0 480 240" className="interaction-timeline-chart" role="img" aria-label="Risk trajectory over time">
            <defs>
              <linearGradient id="riskGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#dc2626" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
              </linearGradient>
            </defs>

            <rect x="40" y="20" width="420" height="180" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />

            <line x1="40" y1="200" x2="460" y2="200" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="40" y1="110" x2="460" y2="110" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />

            <text x="12" y="205" fontSize="11" fill="#64748b">
              0h
            </text>
            <text x="420" y="205" fontSize="11" fill="#64748b">
              48h
            </text>
            <text x="8" y="115" fontSize="11" fill="#64748b">
              50
            </text>
            <text x="8" y="30" fontSize="11" fill="#64748b">
              100
            </text>

            {currentData.timeline.riskScores.length > 1 && (
              <>
                <polyline
                  points={currentData.timeline.timePoints
                    .map(
                      (t, i) =>
                        `${40 + (t / 48) * 420},${200 - (currentData.timeline.riskScores[i] / 100) * 180}`,
                    )
                    .join(" ")}
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <circle
                  cx={40 + (currentData.timeline.peakRiskTime / 48) * 420}
                  cy={200 - (currentData.timeline.peakRiskScore / 100) * 180}
                  r="4"
                  fill="#dc2626"
                />
              </>
            )}
          </svg>

          <p className="muted value-note">
            Concentrations modeled using 4th-order Runge-Kutta solver with synergistic interaction term. Risk reflects both concentration and time-dependent pharmacodynamics.
          </p>
        </>
      )}
    </section>
  );
}
