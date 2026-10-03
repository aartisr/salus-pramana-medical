export type EvidenceGrade = 'A' | 'B' | 'C';

export type MedicalSystem = 'Allopathy' | 'Ayurveda' | 'Siddha' | 'Naturopathy';

export type PersonaMode = 'nobel_juror' | 'clinician' | 'researcher' | 'policy_maker' | 'patient';

export interface MedicalCondition {
  conditionId: string;
  icd11Code: string;
  standardName: string;
  ayurvedicEquivalent?: string;
  siddhaEquivalent?: string;
  naturopathicContext?: string;
  category: string;
  pathophysiologySummary: string;
  globalPrevalence: string;
  annualBurdenDALYs: string;
  primaryRiskFactors: string[];
}

export interface TreatmentEvidence {
  evidenceId: string;
  conditionId: string;
  medicalSystem: MedicalSystem;
  interventionName: string;
  activeIngredients?: string[];
  isPharmacological: boolean;
  evidenceGrade: EvidenceGrade;
  studyMethodology: string;
  designCategory: 'SystematicReview' | 'MultiCenterRCT' | 'SingleRCT' | 'Cohort' | 'Observational' | 'Preclinical' | 'TextualConsensus';
  sampleSize: number;
  standardError?: number;
  effectSizeCohenD?: number;
  registryIdentifier: string;
  sourceUrl: string;
  clinicalOutcomeSummary: string;
  contraindications: string[];
  interactionWarnings: string[];
  publicationStatus: 'published' | 'draft' | 'under_review';
  publishedYear: number;
  lastVerifiedDate: string;
  riskOfBias: 'low' | 'some_concerns' | 'high' | 'critical';
  pValueOfOutcome: number;
  confidenceInterval95: [number, number];
  primaryBiomarkerEndpoint: string;
  therapeuticWindowHours: number;
  bioavailabilityPercentage?: number;
  halfLifeHours?: number;
}

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
  biasLevel: 'low' | 'some_concerns' | 'high' | 'critical';
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
}

export interface ConditionIntelligence {
  modelVersion: string;
  generatedAt: string;
  conditionId: string;
  conditionName: string;
  persona: PersonaMode;
  evidenceCount: number;
  conditionPramanaScore: number;
  confidenceScore: number;
  confidenceInterval95: { lower: number; upper: number };
  bayesianProbabilityAboveThreshold: number;
  decision: 'RECOMMEND' | 'CONDITIONAL' | 'INSUFFICIENT_EVIDENCE';
  topIntervention?: string;
  uncertainty: {
    coefficientOfVariation: number;
    dataCoverage: 'high' | 'moderate' | 'low';
    explanation: string;
  };
  governanceGates: {
    calibrationPass: boolean;
    intervalReliabilityPass: boolean;
    citationCoveragePass: boolean;
    recencyCoveragePass: boolean;
    overallGateStatus: 'GO' | 'NO_GO' | 'CONDITIONAL_AUDIT';
  };
  contributions: EvidenceContribution[];
  systemBreakdown: {
    system: MedicalSystem;
    evidenceCount: number;
    averageScore: number;
    topIntervention: string;
    gradeDist: { A: number; B: number; C: number };
  }[];
}

export interface InteractionDynamics {
  timePoints: number[];
  concentrations1: number[];
  concentrations2: number[];
  riskScores: number[];
  peakRiskTime: number;
  peakRiskScore: number;
  severityClass: 'none' | 'mild' | 'moderate' | 'severe';
  timeToMildRisk: number | null;
  timeToSevereRisk: number | null;
  interactionMechanism: string;
  clinicalActionProtocol: string;
}

export interface DoseOptimizationCandidate {
  dose: number;
  unit: string;
  predictedEfficacy: number; // 0 - 100
  predictedToxicityRisk: number; // 0 - 100
  netBenefitScore: number; // 0 - 100
  therapeuticIndex: number;
  isOptimal: boolean;
}

export interface NobelScoreMetric {
  id: string;
  dimension: string;
  category: 'Community & Humanity' | 'Technology & Architecture' | 'Clinical Integration' | 'Diagnostic Rigor';
  score: number; // 0-10
  weight: number;
  headline: string;
  justification: string;
  strengths: string[];
  frontierOpportunities: string[];
  benchmarks: { system: string; score: number; notes: string }[];
  mathematicalProofOrEvidence: string;
}

export interface NobelEvaluationDossier {
  title: string;
  evaluator: string;
  repositoryUrl: string;
  overallScore: number; // out of 10.0
  gradeCadre: 'Open Science Gold Benchmark (Self-Assessed)' | 'High Distinction' | 'Pioneer Tier';
  executiveSummary: string;
  metrics: NobelScoreMetric[];
  humanityImpactAnalysis: {
    globalBurdenRelief: string;
    healthEquityAndAffordability: string;
    patientSafetyAndDrugInteractionMitigation: string;
    crossCulturalScientificDeSiloing: string;
  };
  technologicalBreakthroughs: {
    pramanaCalculusEngine: string;
    odeInteractionDynamics: string;
    deterministicGovernanceGating: string;
    serverlessZeroCostArchitecture: string;
  };
  recommendationsForGlobalDeployment: string[];
}
