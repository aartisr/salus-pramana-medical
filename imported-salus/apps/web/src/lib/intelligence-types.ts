import type { TreatmentEvidence } from "@evidence-platform/domain";

export type IntelligenceDecision = "RECOMMEND" | "CONDITIONAL" | "INSUFFICIENT_EVIDENCE";

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
  biasLevel: "low" | "some_concerns" | "high" | "critical";
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
  mode: "clinician" | "public";
  evidenceCount: number;
  conditionPramanaScore: number;
  confidenceScore: number;
  confidenceInterval95: { lower: number; upper: number };
  bayesianProbabilityAboveThreshold: number;
  decision: IntelligenceDecision;
  topIntervention?: string;
  uncertainty: {
    coefficientOfVariation: number;
    dataCoverage: "high" | "moderate" | "low";
    explanation: string;
  };
  contributions: EvidenceContribution[];
};

export type InteractionTimeline = {
  timePoints: number[];
  concentrations1: number[];
  concentrations2: number[];
  riskScores: number[];
  peakRiskTime: number;
  peakRiskScore: number;
  severityClass: "none" | "mild" | "moderate" | "severe";
  timeToMildRisk: number | null;
  timeToSevereRisk: number | null;
};

export type InteractionIntelligence = {
  conditionId: string;
  interventionA: string;
  interventionB: string;
  timeline: InteractionTimeline;
  generatedAt: string;
};

export type TrajectoryPoint = {
  time: number;
  concentration: number;
  relativeToBaseline: number;
};

export type SingleInterventionTrajectory = {
  interventionName: string;
  peakConcentration: number;
  timeToPharmacologicalEffect: number;
  timeToMinimumEffectiveConcentration: number;
  effectDuration: number;
  halfLife: number;
  absorptionRate: number;
  trajectoryPoints: TrajectoryPoint[];
  averageConcentration: number;
  timeAboveThreshold: number;
};

export type TrajectoryIntelligence = {
  evidenceId: string;
  trajectory: SingleInterventionTrajectory;
  generatedAt: string;
};

export type DoseRecommendation = {
  interventionName: string;
  recommendedDoseRange: { min: number; max: number };
  recommendedFrequency: string;
  estimatedEfficacy: number;
  estimatedAdverseEventRisk: number;
  netBenefit: number;
  timeToMaximalEffect: number;
  clearanceTime: number;
  rationale: string;
  safetyMargin: "wide" | "moderate" | "narrow" | "critical";
  monitoringRecommendations: string[];
};

export type DoseResponseOptimization = {
  conditionId: string;
  interventionName: string;
  recommendations: DoseRecommendation[];
  optimizedDoseIndex: number;
  generatedAt: string;
};

export type ValidationGateStatus = "pass" | "warn" | "fail" | "insufficient-data";

export type ValidationMetricGate = {
  status: ValidationGateStatus;
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
    calibrationSlope: ValidationMetricGate;
    calibrationIntercept: ValidationMetricGate;
    intervalReliability95: ValidationMetricGate;
    citationCoverage: ValidationMetricGate;
    recencyCoverage: ValidationMetricGate;
  };
  summary: string;
};
