import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getConditionValidationGates, toErrorMessage } from "../lib/api";

type PersonaMode = "Patient" | "Clinician" | "Researcher";

type Props = {
  conditionId: string;
  persona: PersonaMode;
};

function gateBadgeClass(status: "pass" | "warn" | "fail" | "insufficient-data") {
  if (status === "pass") return "gate-badge-pass";
  if (status === "warn") return "gate-badge-warn";
  if (status === "fail") return "gate-badge-fail";
  return "gate-badge-insufficient";
}

export function GovernanceGatesPanel({ conditionId, persona }: Props) {
  const mode = persona === "Patient" ? "public" : "clinician";

  const gatesQuery = useQuery({
    queryKey: ["condition-validation-gates", conditionId, mode],
    queryFn: () => getConditionValidationGates(conditionId, mode),
    enabled: Boolean(conditionId),
    staleTime: 120_000,
  });

  if (gatesQuery.isLoading) {
    return (
      <section className="panel governance-panel" aria-label="Model governance gates">
        <h3>Model Governance Gates</h3>
        <p className="muted">Evaluating calibration, interval reliability, citation quality, and recency coverage...</p>
      </section>
    );
  }

  if (gatesQuery.isError || !gatesQuery.data) {
    return (
      <section className="panel governance-panel" aria-label="Model governance gates">
        <h3>Model Governance Gates</h3>
        <p className="error">{toErrorMessage(gatesQuery.error, "Unable to load governance gates right now.")}</p>
      </section>
    );
  }

  const report = gatesQuery.data;
  const gateRows = [
    ["Calibration slope", report.gates.calibrationSlope],
    ["Calibration intercept", report.gates.calibrationIntercept],
    ["95% interval reliability", report.gates.intervalReliability95],
    ["Citation coverage", report.gates.citationCoverage],
    ["Recency coverage", report.gates.recencyCoverage],
  ] as const;

  return (
    <section className="panel governance-panel" aria-label="Model governance gates">
      <div className="governance-header">
        <div>
          <h3>Model Governance Gates</h3>
          <p className="muted">Go/No-Go validation for quality, calibration proxies, and source integrity.</p>
        </div>
        <span className={`governance-status ${report.goNoGo ? "go" : "no-go"}`}>{report.goNoGo ? "GO" : "NO-GO"}</span>
      </div>

      <div className="governance-gate-grid">
        {gateRows.map(([label, gate]) => (
          <article key={label} className="governance-gate-item">
            <div className="governance-gate-title">
              <strong>{label}</strong>
              <span className={`gate-badge ${gateBadgeClass(gate.status)}`}>{gate.status.replaceAll("-", " ")}</span>
            </div>
            <p className="muted">
              Value: {gate.value} | Target: {gate.target}
            </p>
            <p className="muted">{gate.note}</p>
          </article>
        ))}
      </div>

      <p className="muted value-note">{report.summary}</p>
    </section>
  );
}
