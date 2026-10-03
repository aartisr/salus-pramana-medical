import type { TreatmentEvidence } from "../contracts";
import type { ConditionIntelligence } from "./types";

export type GateStatus = "pass" | "warn" | "fail" | "insufficient-data";
export interface MetricGate { status: GateStatus; value: number; target: string; note: string }
export interface ConditionValidationGates {
  conditionId: string;
  generatedAt: string;
  modelVersion: string;
  evidenceCount: number;
  goNoGo: boolean;
  gates: Record<"calibrationSlope" | "calibrationIntercept" | "intervalReliability95" | "citationCoverage" | "recencyCoverage", MetricGate>;
  summary: string;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function gateFromRange(value: number, min: number, max: number, label: string): MetricGate {
  if (Number.isNaN(value)) return { status: "insufficient-data", value: 0, target: `${min} to ${max}`, note: `${label}: insufficient data for reliable estimation` };
  const inRange = value >= min && value <= max;
  const nearRange = value >= min - (max - min) * 0.5 && value <= max + (max - min) * 0.5;
  return { status: inRange ? "pass" : nearRange ? "warn" : "fail", value: Number(value.toFixed(4)), target: `${min} to ${max}`, note: `${label}: ${inRange ? "within" : nearRange ? "near" : "outside"} target bounds` };
}

function regression(xs: number[], ys: number[]) {
  if (xs.length < 2 || xs.length !== ys.length) return { slope: Number.NaN, intercept: Number.NaN };
  const meanX = xs.reduce((sum, value) => sum + value, 0) / xs.length;
  const meanY = ys.reduce((sum, value) => sum + value, 0) / ys.length;
  const denominator = xs.reduce((sum, value) => sum + (value - meanX) ** 2, 0);
  if (denominator <= 0) return { slope: Number.NaN, intercept: Number.NaN };
  const slope = xs.reduce((sum, value, index) => sum + (value - meanX) * (ys[index] - meanY), 0) / denominator;
  return { slope, intercept: meanY - slope * meanX };
}

export function computeConditionValidationGates(conditionId: string, rows: TreatmentEvidence[], intelligence: ConditionIntelligence, asOf = new Date()): ConditionValidationGates {
  const evidence = rows.filter((row) => row.conditionId === conditionId);
  const predicted = intelligence.contributions.map((item) => item.pramanaScore / 100);
  const observed = intelligence.contributions.map((item) => clamp(item.gradeWeight * item.designWeight * item.biasWeight * item.recencyWeight, 0, 1));
  const calibration = regression(predicted, observed);
  const intervalCount = intelligence.contributions.filter((item) => item.pramanaScore >= intelligence.confidenceInterval95.lower && item.pramanaScore <= intelligence.confidenceInterval95.upper).length;
  const intervalCoverage = intelligence.contributions.length ? intervalCount / intelligence.contributions.length : Number.NaN;
  const citationCoverage = evidence.length ? evidence.filter((row) => /^(PMID|DOI|CTRI|ICTRP|AYUSH|DHARA|NCT)-?/i.test(row.registryIdentifier) && /^https:\/\//i.test(row.sourceUrl)).length / evidence.length : Number.NaN;
  const recencyCoverage = evidence.length ? evidence.filter((row) => row.lastVerifiedDate && !Number.isNaN(new Date(row.lastVerifiedDate).getTime()) && (asOf.getTime() - new Date(row.lastVerifiedDate).getTime()) / 31_557_600_000 <= 5).length / evidence.length : Number.NaN;
  const gates = {
    calibrationSlope: gateFromRange(calibration.slope, 0.9, 1.1, "Calibration slope"),
    calibrationIntercept: gateFromRange(calibration.intercept, -0.05, 0.05, "Calibration intercept"),
    intervalReliability95: gateFromRange(intervalCoverage, 0.92, 0.98, "95% interval reliability"),
    citationCoverage: gateFromRange(citationCoverage, 0.95, 1, "Citation coverage"),
    recencyCoverage: gateFromRange(recencyCoverage, 0.6, 1, "Recency coverage"),
  };
  if (evidence.length < 3) {
    for (const key of ["calibrationSlope", "calibrationIntercept", "intervalReliability95"] as const) {
      gates[key] = { ...gates[key], status: "insufficient-data", note: `${gates[key].note.split(":")[0]}: at least 3 studies recommended for stable estimate` };
    }
  }
  const goNoGo = !Object.values(gates).some((gate) => gate.status === "fail" || gate.status === "insufficient-data");
  return { conditionId, generatedAt: asOf.toISOString(), modelVersion: intelligence.modelVersion, evidenceCount: evidence.length, goNoGo, gates, summary: goNoGo ? "Validation gates passed. Model output is eligible for high-confidence operational use." : "Validation gates not fully satisfied. Keep output in conservative mode and continue evidence accumulation." };
}