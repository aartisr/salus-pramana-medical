import type { TreatmentEvidence } from "@evidence-platform/domain";
import type { ConditionIntelligence } from "./intelligence";

type GateStatus = "pass" | "warn" | "fail" | "insufficient-data";

type MetricGate = {
  status: GateStatus;
  value: number;
  target: string;
  note: string;
};

export type ConditionValidationGates = {
  conditionId: string;
  generatedAt: string;
  modelVersion: string;
  evidenceCount: number;
  goNoGo: boolean;
  gates: {
    calibrationSlope: MetricGate;
    calibrationIntercept: MetricGate;
    intervalReliability95: MetricGate;
    citationCoverage: MetricGate;
    recencyCoverage: MetricGate;
  };
  summary: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function gateFromRange(value: number, min: number, max: number, label: string): MetricGate {
  if (Number.isNaN(value)) {
    return {
      status: "insufficient-data",
      value: 0,
      target: `${min} to ${max}`,
      note: `${label}: insufficient data for reliable estimation`,
    };
  }

  const inRange = value >= min && value <= max;
  const nearRange = value >= min - (max - min) * 0.5 && value <= max + (max - min) * 0.5;

  return {
    status: inRange ? "pass" : nearRange ? "warn" : "fail",
    value: Number(value.toFixed(4)),
    target: `${min} to ${max}`,
    note: `${label}: ${inRange ? "within" : nearRange ? "near" : "outside"} target bounds`,
  };
}

function computeSimpleRegression(xs: number[], ys: number[]) {
  if (xs.length < 2 || ys.length < 2 || xs.length !== ys.length) {
    return { slope: Number.NaN, intercept: Number.NaN };
  }

  const n = xs.length;
  const meanX = xs.reduce((sum, x) => sum + x, 0) / n;
  const meanY = ys.reduce((sum, y) => sum + y, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i += 1) {
    const dx = xs[i] - meanX;
    numerator += dx * (ys[i] - meanY);
    denominator += dx * dx;
  }

  if (denominator <= 0) {
    return { slope: Number.NaN, intercept: Number.NaN };
  }

  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;
  return { slope, intercept };
}

function hasValidCitation(row: TreatmentEvidence) {
  const idOk = typeof row.registryIdentifier === "string" && row.registryIdentifier.trim().length > 0;
  const urlOk = typeof row.sourceUrl === "string" && /^https?:\/\//i.test(row.sourceUrl);
  return idOk && urlOk;
}

export function computeConditionValidationGates(
  conditionId: string,
  rows: TreatmentEvidence[],
  intelligence: ConditionIntelligence,
  asOf = new Date(),
): ConditionValidationGates {
  const evidenceRows = rows.filter((row) => row.conditionId === conditionId);
  const contributions = intelligence.contributions;

  const predicted = contributions.map((item) => item.pramanaScore / 100);
  const observed = contributions.map((item) =>
    clamp((item.gradeWeight * item.designWeight * item.biasWeight * item.recencyWeight) / 1.0, 0, 1),
  );

  const regression = computeSimpleRegression(predicted, observed);

  const ciLower = intelligence.confidenceInterval95.lower;
  const ciUpper = intelligence.confidenceInterval95.upper;
  const inIntervalCount = contributions.filter((item) => item.pramanaScore >= ciLower && item.pramanaScore <= ciUpper).length;
  const intervalCoverage = contributions.length > 0 ? inIntervalCount / contributions.length : Number.NaN;

  const citationCount = evidenceRows.filter(hasValidCitation).length;
  const citationCoverage = evidenceRows.length > 0 ? citationCount / evidenceRows.length : Number.NaN;

  const recentCount = evidenceRows.filter((row) => {
    if (!row.lastVerifiedDate) return false;
    const d = new Date(row.lastVerifiedDate);
    if (Number.isNaN(d.getTime())) return false;
    const years = (asOf.getTime() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return years <= 5;
  }).length;
  const recencyCoverage = evidenceRows.length > 0 ? recentCount / evidenceRows.length : Number.NaN;

  const calibrationSlope = gateFromRange(regression.slope, 0.9, 1.1, "Calibration slope");
  const calibrationIntercept = gateFromRange(regression.intercept, -0.05, 0.05, "Calibration intercept");
  const intervalReliability95 = gateFromRange(intervalCoverage, 0.92, 0.98, "95% interval reliability");
  const citationGate = gateFromRange(citationCoverage, 0.95, 1, "Citation coverage");
  const recencyGate = gateFromRange(recencyCoverage, 0.6, 1, "Recency coverage");

  if (evidenceRows.length < 3) {
    calibrationSlope.status = "insufficient-data";
    calibrationSlope.note = "Calibration slope: at least 3 studies recommended for stable estimate";
    calibrationIntercept.status = "insufficient-data";
    calibrationIntercept.note = "Calibration intercept: at least 3 studies recommended for stable estimate";
    intervalReliability95.status = "insufficient-data";
    intervalReliability95.note = "95% interval reliability: at least 3 studies recommended for stable estimate";
  }

  const gates = {
    calibrationSlope,
    calibrationIntercept,
    intervalReliability95,
    citationCoverage: citationGate,
    recencyCoverage: recencyGate,
  };

  const gateStatuses = Object.values(gates).map((gate) => gate.status);
  const hardFail = gateStatuses.includes("fail") || gateStatuses.includes("insufficient-data");
  const goNoGo = !hardFail;

  const summary = goNoGo
    ? "Validation gates passed. Model output is eligible for high-confidence operational use."
    : "Validation gates not fully satisfied. Keep output in conservative mode and continue evidence accumulation.";

  return {
    conditionId,
    generatedAt: asOf.toISOString(),
    modelVersion: intelligence.modelVersion,
    evidenceCount: evidenceRows.length,
    goNoGo,
    gates,
    summary,
  };
}
