import type { EvidenceGrade, MedicalSystem } from "../contracts";

export type DecisionMode = "public" | "clinician";
export type ClinicalDecision = "RECOMMEND" | "CONDITIONAL" | "INSUFFICIENT_EVIDENCE";
export type BiasLevel = "low" | "some_concerns" | "high" | "critical";

export interface EvidenceContribution {
  evidenceId: string;
  interventionName: string;
  medicalSystem: MedicalSystem;
  evidenceGrade: EvidenceGrade;
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
  source: { registryIdentifier: string; sourceUrl: string; lastVerifiedDate?: string };
}

export interface ConditionIntelligence {
  modelVersion: string;
  generatedAt: string;
  conditionId: string;
  mode: DecisionMode;
  evidenceCount: number;
  conditionPramanaScore: number;
  confidenceScore: number;
  confidenceInterval95: { lower: number; upper: number };
  bayesianProbabilityAboveThreshold: number;
  decision: ClinicalDecision;
  topIntervention?: string;
  uncertainty: {
    coefficientOfVariation: number;
    dataCoverage: "high" | "moderate" | "low";
    explanation: string;
  };
  contributions: EvidenceContribution[];
}

export interface InteractionDynamics {
  timePoints: number[];
  concentrations1: number[];
  concentrations2: number[];
  riskScores: number[];
  peakRiskTime: number;
  peakRiskScore: number;
  severityClass: "none" | "mild" | "moderate" | "severe";
  timeToMildRisk: number | null;
  timeToSevereRisk: number | null;
  interactionMechanism: string;
  clinicalActionProtocol: string;
}

export interface DoseOptimizationCandidate {
  dose: number;
  unit: string;
  predictedEfficacy: number;
  predictedToxicityRisk: number;
  netBenefitScore: number;
  utilityScore: number;
  therapeuticIndex: number;
  isOptimal: boolean;
}