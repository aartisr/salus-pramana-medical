import type { TreatmentEvidence } from "../contracts";
import type { BiasLevel, ConditionIntelligence, DecisionMode, EvidenceContribution } from "./types";

export const PRAMANA_MODEL_VERSION = "pramana-v1.2.0-nobel-edition";
export const PRAMANA_EPSILON = 1e-6;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function quantile(values: number[], probability: number): number {
  if (values.length < 2) return values[0] ?? 0;
  const sorted = [...values].sort((left, right) => left - right);
  const index = (sorted.length - 1) * clamp(probability, 0, 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  return lower === upper ? sorted[lower] : sorted[lower] * (upper - index) + sorted[upper] * (index - lower);
}

function yearsSince(date: string | undefined, publishedYear: number | undefined, asOf: Date): number {
  const parsed = new Date(date ?? (publishedYear ? `${publishedYear}-01-01` : "invalid"));
  return Number.isNaN(parsed.getTime()) ? 4 : Math.max(0, (asOf.getTime() - parsed.getTime()) / 31_557_600_000);
}

export function inferGradeWeight(grade: TreatmentEvidence["evidenceGrade"]): number {
  return grade === "A" ? 1 : grade === "B" ? 0.6 : 0.25;
}

export function inferDesignWeight(methodology: string): number {
  const method = methodology.toLowerCase();
  if (method.includes("meta") || method.includes("systematic review")) return 1;
  if (method.includes("multi-center") || method.includes("multicenter")) return 0.9;
  if (method.includes("randomized") || method.includes("double blind") || method.includes("double-blind") || method.includes("rct")) return 0.85;
  if (method.includes("cohort") || method.includes("case-control")) return 0.7;
  if (method.includes("open-label") || method.includes("non-randomized") || method.includes("observational")) return 0.6;
  if (method.includes("preclinical") || method.includes("mechanistic") || method.includes("animal")) return 0.35;
  return 0.2;
}

function inferBiasLevel(row: TreatmentEvidence): BiasLevel {
  if (row.riskOfBias) return row.riskOfBias;
  if (/unassessed|critical/i.test(row.studyMethodology)) return "critical";
  return row.evidenceGrade === "A" ? "low" : row.evidenceGrade === "B" ? "some_concerns" : "high";
}

export function inferBiasWeight(level: BiasLevel): number {
  return level === "low" ? 1 : level === "some_concerns" ? 0.8 : level === "high" ? 0.55 : 0.4;
}

export function calculateRecencyDecay(years: number, domain: "pharma" | "lifestyle" | "mechanistic" = "pharma"): number {
  const halfLife = { pharma: 6, lifestyle: 10, mechanistic: 12 }[domain];
  return Math.exp(-(Math.log(2) / halfLife) * years);
}

function normalizeWinsorized(value: number, low: number, high: number): number {
  if (high <= low) return clamp(Math.round(100 * (1 - Math.exp(-Math.max(0, value) / 2500))), 0, 100);
  return Math.round(((clamp(value, low, high) - low) / (high - low)) * 100);
}

function standardNormalCdf(value: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(value));
  const density = 0.3989423 * Math.exp(-(value * value) / 2);
  const probability = density * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return value > 0 ? 1 - probability : probability;
}

export function computeConditionIntelligence(
  conditionId: string,
  rows: TreatmentEvidence[],
  mode: DecisionMode = "public",
  asOf = new Date(),
): ConditionIntelligence {
  const evidenceRows = rows.filter((row) => row.conditionId === conditionId);
  if (evidenceRows.length === 0) {
    return {
      modelVersion: PRAMANA_MODEL_VERSION,
      generatedAt: asOf.toISOString(),
      conditionId,
      mode,
      evidenceCount: 0,
      conditionPramanaScore: 0,
      confidenceScore: 0,
      confidenceInterval95: { lower: 0, upper: 0 },
      bayesianProbabilityAboveThreshold: 0,
      decision: "INSUFFICIENT_EVIDENCE",
      uncertainty: { coefficientOfVariation: 1, dataCoverage: "low", explanation: "No eligible evidence rows are available for scoring." },
      contributions: [],
    };
  }

  const metrics = evidenceRows.map((row) => {
    const recencyYears = yearsSince(row.lastVerifiedDate, row.publishedYear, asOf);
    const domain = /mechanistic|physiology/i.test(row.studyMethodology) ? "mechanistic" : row.isPharmacological ? "pharma" : "lifestyle";
    const recencyWeight = calculateRecencyDecay(recencyYears, domain);
    const gradeWeight = inferGradeWeight(row.evidenceGrade);
    const designWeight = inferDesignWeight(row.studyMethodology);
    const biasLevel = inferBiasLevel(row);
    const biasWeight = inferBiasWeight(biasLevel);
    const sampleSize = Math.max(0, row.sampleSize ?? 100);
    const sampleSizeWeight = Math.log(1 + sampleSize);
    const standardError = row.standardError ?? 1 / Math.sqrt(Math.max(1, sampleSize));
    const precisionWeight = 1 / (standardError * standardError + PRAMANA_EPSILON);
    return { row, recencyYears, recencyWeight, gradeWeight, designWeight, biasLevel, biasWeight, sampleSize, sampleSizeWeight, precisionWeight, rawContribution: gradeWeight * designWeight * biasWeight * recencyWeight * sampleSizeWeight * precisionWeight };
  });
  const rawValues = metrics.map((item) => item.rawContribution);
  const low = quantile(rawValues, 0.05);
  const high = quantile(rawValues, 0.95);
  const contributions: EvidenceContribution[] = metrics.map((item) => ({
    evidenceId: item.row.evidenceId,
    interventionName: item.row.interventionName,
    medicalSystem: item.row.medicalSystem,
    evidenceGrade: item.row.evidenceGrade,
    studyMethodology: item.row.studyMethodology,
    sampleSize: item.sampleSize,
    recencyYears: Number(item.recencyYears.toFixed(1)),
    recencyWeight: Number(item.recencyWeight.toFixed(3)),
    gradeWeight: item.gradeWeight,
    designWeight: item.designWeight,
    biasLevel: item.biasLevel,
    biasWeight: item.biasWeight,
    sampleSizeWeight: Number(item.sampleSizeWeight.toFixed(2)),
    precisionWeight: Number(item.precisionWeight.toFixed(1)),
    rawContribution: Number(item.rawContribution.toFixed(1)),
    pramanaScore: normalizeWinsorized(item.rawContribution, low, high),
    uncertaintyPenalty: Math.round((1 - item.biasWeight * item.recencyWeight) * 20),
    source: { registryIdentifier: item.row.registryIdentifier, sourceUrl: item.row.sourceUrl, lastVerifiedDate: item.row.lastVerifiedDate },
  })).sort((left, right) => right.pramanaScore - left.pramanaScore);

  const mean = contributions.reduce((sum, item) => sum + item.pramanaScore, 0) / contributions.length;
  const variance = contributions.reduce((sum, item) => sum + (item.pramanaScore - mean) ** 2, 0) / Math.max(1, contributions.length - 1);
  const deviation = Math.sqrt(variance);
  const standardError = deviation / Math.sqrt(contributions.length);
  const coefficientOfVariation = mean > 0 ? deviation / mean : 1;
  const margin = 1.96 * Math.max(2.5, standardError);
  const sampleSizeTotal = contributions.reduce((sum, item) => sum + item.sampleSize, 0);
  const confidenceScore = clamp(Math.round(mean * 0.7 + (1 - coefficientOfVariation) * 20 + Math.min(15, Math.log10(Math.max(10, sampleSizeTotal)) * 4)), 20, 99);
  const probability = clamp(Number(((1 - standardNormalCdf((60 - mean) / (deviation + 1e-4))) * 100).toFixed(1)), 5, 99.9);
  const recommendThreshold = mode === "clinician" ? 72 : 75;
  const decision = contributions.length < 2 || confidenceScore < 50
    ? "INSUFFICIENT_EVIDENCE"
    : confidenceScore < recommendThreshold || coefficientOfVariation > 0.45
      ? "CONDITIONAL"
      : "RECOMMEND";

  return {
    modelVersion: PRAMANA_MODEL_VERSION,
    generatedAt: asOf.toISOString(),
    conditionId,
    mode,
    evidenceCount: contributions.length,
    conditionPramanaScore: Math.round(mean),
    confidenceScore,
    confidenceInterval95: { lower: Math.max(0, Number((mean - margin).toFixed(1))), upper: Math.min(100, Number((mean + margin).toFixed(1))) },
    bayesianProbabilityAboveThreshold: probability,
    decision,
    topIntervention: contributions[0]?.interventionName,
    uncertainty: {
      coefficientOfVariation: Number(coefficientOfVariation.toFixed(2)),
      dataCoverage: sampleSizeTotal > 1000 ? "high" : sampleSizeTotal > 250 ? "moderate" : "low",
      explanation: `Calculated from ${contributions.length} studies encompassing N=${sampleSizeTotal} participants.`,
    },
    contributions,
  };
}