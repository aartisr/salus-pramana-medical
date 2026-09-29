import type { TreatmentEvidence } from "@evidence-platform/domain";

const MODEL_VERSION = "pramana-v1.0.0";
const EPSILON = 1e-6;

type DecisionMode = "clinician" | "public";
type Decision = "RECOMMEND" | "CONDITIONAL" | "INSUFFICIENT_EVIDENCE";

type BiasLevel = "low" | "some_concerns" | "high" | "critical";

export type EvidenceContribution = {
  evidenceId: string;
  interventionName: string;
  medicalSystem: TreatmentEvidence["medicalSystem"];
  evidenceGrade: TreatmentEvidence["evidenceGrade"];
  studyMethodology: string;
  sampleSize: number;
  recencyYears: number;
  recencyWeight: number;
  gradeWeight: number;
  designWeight: number;
  biasLevel: BiasLevel;
  biasWeight: number;
  sampleSizeWeight: number;
  precisionWeight: number;
  rawContribution: number;
  pramanaScore: number;
  uncertaintyPenalty: number;
  source: {
    registryIdentifier: string;
    sourceUrl: string;
    lastVerifiedDate?: string;
  };
};

export type ConditionIntelligence = {
  modelVersion: string;
  generatedAt: string;
  conditionId: string;
  mode: DecisionMode;
  evidenceCount: number;
  conditionPramanaScore: number;
  confidenceScore: number;
  confidenceInterval95: { lower: number; upper: number };
  bayesianProbabilityAboveThreshold: number;
  decision: Decision;
  topIntervention?: string;
  uncertainty: {
    coefficientOfVariation: number;
    dataCoverage: "high" | "moderate" | "low";
    explanation: string;
  };
  contributions: EvidenceContribution[];
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function quantile(values: number[], p: number) {
  if (values.length === 0) {
    return 0;
  }

  if (values.length === 1) {
    return values[0];
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * clamp(p, 0, 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) {
    return sorted[lower];
  }

  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function normalizeWinsorized(value: number, low: number, high: number) {
  if (high <= low) {
    // Degenerate window (often single-study conditions): map raw contribution
    // to a bounded score instead of collapsing to a fixed neutral midpoint.
    const scaled = 100 * (1 - Math.exp(-Math.max(0, value) / 2500));
    return clamp(Math.round(scaled), 0, 100);
  }
  const clipped = clamp(value, low, high);
  return Math.round(((clipped - low) / (high - low)) * 100);
}

function yearsSince(isoDate: string | undefined, asOf: Date): number {
  if (!isoDate) {
    return 6;
  }

  const published = new Date(isoDate);
  if (Number.isNaN(published.getTime())) {
    return 6;
  }

  const deltaMs = asOf.getTime() - published.getTime();
  return Math.max(0, deltaMs / (365.25 * 24 * 60 * 60 * 1000));
}

function inferGradeWeight(grade: TreatmentEvidence["evidenceGrade"]) {
  if (grade === "A") return 1;
  if (grade === "B") return 0.6;
  return 0.25;
}

function inferDesignWeight(methodology: string): number {
  const method = methodology.toLowerCase();

  if (method.includes("meta") || method.includes("systematic review")) return 1;
  if (method.includes("multi-center") || method.includes("multicenter")) return 0.9;
  if (method.includes("randomized") || method.includes("double blind") || method.includes("double-blind")) return 0.85;
  if (method.includes("cohort") || method.includes("case-control")) return 0.7;
  if (method.includes("open-label") || method.includes("non-randomized") || method.includes("observational")) return 0.6;
  if (method.includes("preclinical") || method.includes("mechanistic") || method.includes("animal")) return 0.35;

  return 0.5;
}

function inferBiasLevel(grade: TreatmentEvidence["evidenceGrade"], methodology: string): BiasLevel {
  const method = methodology.toLowerCase();
  if (method.includes("unassessed") || method.includes("critical")) {
    return "critical";
  }

  if (grade === "A") return "low";
  if (grade === "B") return "some_concerns";
  return "high";
}

function inferBiasWeight(level: BiasLevel): number {
  if (level === "low") return 1;
  if (level === "some_concerns") return 0.8;
  if (level === "high") return 0.55;
  return 0.4;
}

function halfLifeYears(row: TreatmentEvidence) {
  const method = row.studyMethodology.toLowerCase();
  if (method.includes("mechanistic") || method.includes("physiology")) {
    return 12;
  }
  if (row.isPharmacological) {
    return 6;
  }
  return 10;
}

function recencyWeight(row: TreatmentEvidence, asOf: Date) {
  const years = yearsSince(row.lastVerifiedDate, asOf);
  const halfLife = halfLifeYears(row);
  const lambda = Math.log(2) / halfLife;
  return {
    years,
    weight: Math.exp(-lambda * years),
  };
}

function precisionWeight(sampleSize?: number) {
  const n = Math.max(1, sampleSize ?? 30);
  const standardError = 1 / Math.sqrt(n);
  return 1 / (standardError * standardError + EPSILON);
}

function toCoverage(count: number): "high" | "moderate" | "low" {
  if (count >= 6) return "high";
  if (count >= 3) return "moderate";
  return "low";
}

function logistic(value: number) {
  return 1 / (1 + Math.exp(-value));
}

function decisionFromProbability(probability: number, mode: DecisionMode): Decision {
  const recommendThreshold = mode === "clinician" ? 0.85 : 0.9;
  if (probability >= recommendThreshold) return "RECOMMEND";
  if (probability >= 0.65) return "CONDITIONAL";
  return "INSUFFICIENT_EVIDENCE";
}

function summarizeUncertainty(cv: number, count: number): string {
  const coverage = toCoverage(count);
  if (coverage === "low") {
    return "Low evidence coverage: add more independent studies before high-confidence recommendations.";
  }
  if (cv > 0.35) {
    return "Moderate-to-high dispersion across studies: confidence is reduced until signals converge.";
  }
  return "Signals are reasonably consistent for this condition under current evidence coverage.";
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
      modelVersion: MODEL_VERSION,
      generatedAt: asOf.toISOString(),
      conditionId,
      mode,
      evidenceCount: 0,
      conditionPramanaScore: 0,
      confidenceScore: 0,
      confidenceInterval95: { lower: 0, upper: 18 },
      bayesianProbabilityAboveThreshold: 0,
      decision: "INSUFFICIENT_EVIDENCE",
      uncertainty: {
        coefficientOfVariation: 1,
        dataCoverage: "low",
        explanation: "No eligible evidence rows are available for scoring.",
      },
      contributions: [],
    };
  }

  const contributions = evidenceRows.map((row) => {
    const gradeWeight = inferGradeWeight(row.evidenceGrade);
    const designWeight = inferDesignWeight(row.studyMethodology);
    const biasLevel = inferBiasLevel(row.evidenceGrade, row.studyMethodology);
    const biasWeight = inferBiasWeight(biasLevel);

    const recency = recencyWeight(row, asOf);
    const sampleSizeWeight = Math.log(1 + Math.max(1, row.sampleSize ?? 30));
    const precision = precisionWeight(row.sampleSize);

    const rawContribution = gradeWeight * designWeight * biasWeight * recency.weight * sampleSizeWeight * precision;

    return {
      row,
      gradeWeight,
      designWeight,
      biasLevel,
      biasWeight,
      recency,
      sampleSizeWeight,
      precision,
      rawContribution,
    };
  });

  const rawValues = contributions.map((item) => item.rawContribution);
  const q02 = quantile(rawValues, 0.02);
  const q98 = quantile(rawValues, 0.98);

  const enriched: EvidenceContribution[] = contributions
    .map((item) => {
      const pramanaScore = normalizeWinsorized(item.rawContribution, q02, q98);
      const uncertaintyPenalty = clamp(Math.round(item.recency.years * 1.2 + (item.biasWeight < 0.8 ? 9 : 2)), 0, 30);

      return {
        evidenceId: item.row.evidenceId,
        interventionName: item.row.interventionName,
        medicalSystem: item.row.medicalSystem,
        evidenceGrade: item.row.evidenceGrade,
        studyMethodology: item.row.studyMethodology,
        sampleSize: Math.max(0, item.row.sampleSize ?? 0),
        recencyYears: Number(item.recency.years.toFixed(2)),
        recencyWeight: Number(item.recency.weight.toFixed(4)),
        gradeWeight: item.gradeWeight,
        designWeight: item.designWeight,
        biasLevel: item.biasLevel,
        biasWeight: item.biasWeight,
        sampleSizeWeight: Number(item.sampleSizeWeight.toFixed(4)),
        precisionWeight: Number(item.precision.toFixed(4)),
        rawContribution: Number(item.rawContribution.toFixed(4)),
        pramanaScore,
        uncertaintyPenalty,
        source: {
          registryIdentifier: item.row.registryIdentifier,
          sourceUrl: item.row.sourceUrl,
          lastVerifiedDate: item.row.lastVerifiedDate,
        },
      };
    })
    .sort((a, b) => b.pramanaScore - a.pramanaScore);

  const scoreMean = enriched.reduce((sum, row) => sum + row.pramanaScore, 0) / enriched.length;
  const scoreVariance =
    enriched.reduce((sum, row) => {
      const delta = row.pramanaScore - scoreMean;
      return sum + delta * delta;
    }, 0) / enriched.length;

  const scoreStdDev = Math.sqrt(scoreVariance);
  const coefficientOfVariation = scoreMean > 0 ? scoreStdDev / scoreMean : 1;

  const uncertaintyHalfWidth = clamp(8 + coefficientOfVariation * 22 + (1 / Math.sqrt(enriched.length)) * 18, 6, 35);
  const conditionPramanaScore = Math.round(scoreMean);
  const confidenceScore = clamp(Math.round(conditionPramanaScore - uncertaintyHalfWidth / 2), 0, 100);

  const probability = logistic((conditionPramanaScore - 50) / 12 - coefficientOfVariation * 0.7);
  const bayesianProbabilityAboveThreshold = Number(probability.toFixed(4));
  const decision = decisionFromProbability(probability, mode);

  return {
    modelVersion: MODEL_VERSION,
    generatedAt: asOf.toISOString(),
    conditionId,
    mode,
    evidenceCount: enriched.length,
    conditionPramanaScore,
    confidenceScore,
    confidenceInterval95: {
      lower: clamp(Math.round(conditionPramanaScore - uncertaintyHalfWidth), 0, 100),
      upper: clamp(Math.round(conditionPramanaScore + uncertaintyHalfWidth), 0, 100),
    },
    bayesianProbabilityAboveThreshold,
    decision,
    topIntervention: enriched[0]?.interventionName,
    uncertainty: {
      coefficientOfVariation: Number(coefficientOfVariation.toFixed(4)),
      dataCoverage: toCoverage(enriched.length),
      explanation: summarizeUncertainty(coefficientOfVariation, enriched.length),
    },
    contributions: enriched,
  };
}

export function computeEvidenceIntelligence(evidenceId: string, rows: TreatmentEvidence[], mode: DecisionMode = "public", asOf = new Date()) {
  const evidence = rows.find((row) => row.evidenceId === evidenceId);
  if (!evidence) {
    return null;
  }

  const conditionIntelligence = computeConditionIntelligence(evidence.conditionId, rows, mode, asOf);
  const contribution = conditionIntelligence.contributions.find((item) => item.evidenceId === evidenceId);

  return {
    modelVersion: conditionIntelligence.modelVersion,
    generatedAt: conditionIntelligence.generatedAt,
    conditionId: conditionIntelligence.conditionId,
    mode: conditionIntelligence.mode,
    conditionDecision: conditionIntelligence.decision,
    conditionPramanaScore: conditionIntelligence.conditionPramanaScore,
    evidence: contribution ?? null,
  };
}
