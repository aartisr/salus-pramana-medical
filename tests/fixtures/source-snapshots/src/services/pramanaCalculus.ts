import { MedicalCondition, TreatmentEvidence, ConditionIntelligence, EvidenceContribution, PersonaMode, EvidenceGrade, MedicalSystem } from '../types/salus';

const MODEL_VERSION = 'pramana-v1.2.0-nobel-edition';
const EPSILON = 1e-6;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function quantile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * clamp(p, 0, 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

function normalizeWinsorized(value: number, low: number, high: number): number {
  if (high <= low) {
    const scaled = 100 * (1 - Math.exp(-Math.max(0, value) / 2500));
    return clamp(Math.round(scaled), 0, 100);
  }
  const clipped = clamp(value, low, high);
  return Math.round(((clipped - low) / (high - low)) * 100);
}

function yearsSince(isoDate: string | undefined, asOf: Date): number {
  if (!isoDate) return 4;
  const published = new Date(isoDate);
  if (Number.isNaN(published.getTime())) return 4;
  const deltaMs = asOf.getTime() - published.getTime();
  return Math.max(0, deltaMs / (365.25 * 24 * 60 * 60 * 1000));
}

export function inferGradeWeight(grade: EvidenceGrade): number {
  if (grade === 'A') return 1.0;
  if (grade === 'B') return 0.6;
  return 0.25;
}

export function inferDesignWeight(methodology: string): number {
  const method = methodology.toLowerCase();
  if (method.includes('meta') || method.includes('systematic review')) return 1.0;
  if (method.includes('multi-center') || method.includes('multicenter')) return 0.9;
  if (method.includes('randomized') || method.includes('double blind') || method.includes('double-blind') || method.includes('rct')) return 0.85;
  if (method.includes('cohort') || method.includes('case-control')) return 0.70;
  if (method.includes('open-label') || method.includes('non-randomized') || method.includes('observational')) return 0.60;
  if (method.includes('preclinical') || method.includes('mechanistic') || method.includes('animal')) return 0.35;
  return 0.20;
}

export function inferBiasWeight(bias: 'low' | 'some_concerns' | 'high' | 'critical'): number {
  if (bias === 'low') return 1.0;
  if (bias === 'some_concerns') return 0.80;
  if (bias === 'high') return 0.55;
  return 0.40;
}

export function calculateRecencyDecay(years: number, domain: 'pharma' | 'lifestyle' | 'mechanistic' = 'pharma'): number {
  const halfLives = { pharma: 6, lifestyle: 10, mechanistic: 12 };
  const halfLife = halfLives[domain] || 8;
  const lambda = Math.log(2) / halfLife;
  return Math.exp(-lambda * years);
}

export function computeEvidenceContribution(evidence: TreatmentEvidence, asOf: Date = new Date()): {
  rawContribution: number;
  recencyYears: number;
  recencyWeight: number;
  gradeWeight: number;
  designWeight: number;
  biasWeight: number;
  sampleSizeWeight: number;
  precisionWeight: number;
} {
  const recencyYears = yearsSince(evidence.lastVerifiedDate || `${evidence.publishedYear}-01-01`, asOf);
  const domain = evidence.isPharmacological ? 'pharma' : 'lifestyle';
  const recencyWeight = calculateRecencyDecay(recencyYears, domain);
  const gradeWeight = inferGradeWeight(evidence.evidenceGrade);
  const designWeight = inferDesignWeight(evidence.studyMethodology);
  const biasWeight = inferBiasWeight(evidence.riskOfBias);
  const sampleSizeWeight = Math.log(1 + Math.max(0, evidence.sampleSize));
  
  const se = evidence.standardError ?? 0.08;
  const precisionWeight = 1 / (se * se + EPSILON);

  const rawContribution = gradeWeight * designWeight * biasWeight * recencyWeight * sampleSizeWeight * precisionWeight;

  return {
    rawContribution,
    recencyYears: Math.round(recencyYears * 10) / 10,
    recencyWeight: Math.round(recencyWeight * 1000) / 1000,
    gradeWeight,
    designWeight,
    biasWeight,
    sampleSizeWeight: Math.round(sampleSizeWeight * 100) / 100,
    precisionWeight: Math.round(precisionWeight * 10) / 10,
  };
}

export function computeConditionIntelligence(
  condition: MedicalCondition,
  evidenceList: TreatmentEvidence[],
  persona: PersonaMode = 'nobel_juror',
  asOf: Date = new Date()
): ConditionIntelligence {
  const matchingEvidence = evidenceList.filter((e) => e.conditionId === condition.conditionId);

  if (matchingEvidence.length === 0) {
    return {
      modelVersion: MODEL_VERSION,
      generatedAt: asOf.toISOString(),
      conditionId: condition.conditionId,
      conditionName: condition.standardName,
      persona,
      evidenceCount: 0,
      conditionPramanaScore: 0,
      confidenceScore: 0,
      confidenceInterval95: { lower: 0, upper: 0 },
      bayesianProbabilityAboveThreshold: 0,
      decision: 'INSUFFICIENT_EVIDENCE',
      uncertainty: {
        coefficientOfVariation: 1.0,
        dataCoverage: 'low',
        explanation: 'Zero verifiable evidence records in repository matching criteria.',
      },
      governanceGates: {
        calibrationPass: false,
        intervalReliabilityPass: false,
        citationCoveragePass: false,
        recencyCoveragePass: false,
        overallGateStatus: 'NO_GO',
      },
      contributions: [],
      systemBreakdown: [],
    };
  }

  const rawMetrics = matchingEvidence.map((e) => ({
    evidence: e,
    ...computeEvidenceContribution(e, asOf),
  }));

  const rawValues = rawMetrics.map((m) => m.rawContribution);
  const lowThreshold = quantile(rawValues, 0.05);
  const highThreshold = quantile(rawValues, 0.95);

  const contributions: EvidenceContribution[] = rawMetrics.map((item) => {
    const pramanaScore = normalizeWinsorized(item.rawContribution, lowThreshold, highThreshold);
    const uncertaintyPenalty = Math.round((1 - item.biasWeight * item.recencyWeight) * 20);
    return {
      evidenceId: item.evidence.evidenceId,
      interventionName: item.evidence.interventionName,
      medicalSystem: item.evidence.medicalSystem,
      evidenceGrade: item.evidence.evidenceGrade,
      studyMethodology: item.evidence.studyMethodology,
      sampleSize: item.evidence.sampleSize,
      recencyYears: item.recencyYears,
      recencyWeight: item.recencyWeight,
      gradeWeight: item.gradeWeight,
      designWeight: item.designWeight,
      biasLevel: item.evidence.riskOfBias,
      biasWeight: item.biasWeight,
      sampleSizeWeight: item.sampleSizeWeight,
      precisionWeight: item.precisionWeight,
      rawContribution: Math.round(item.rawContribution * 10) / 10,
      pramanaScore,
      uncertaintyPenalty,
      source: {
        registryIdentifier: item.evidence.registryIdentifier,
        sourceUrl: item.evidence.sourceUrl,
        lastVerifiedDate: item.evidence.lastVerifiedDate,
      },
    };
  });

  // Aggregate condition Pramana Score
  const scores = contributions.map((c) => c.pramanaScore);
  const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - meanScore, 2), 0) / Math.max(1, scores.length - 1);
  const stdDev = Math.sqrt(variance);
  const stdError = stdDev / Math.sqrt(scores.length);
  const cv = meanScore > 0 ? stdDev / meanScore : 1.0;

  // 95% Confidence interval
  const margin = 1.96 * Math.max(2.5, stdError);
  const ciLower = Math.max(0, Math.round((meanScore - margin) * 10) / 10);
  const ciUpper = Math.min(100, Math.round((meanScore + margin) * 10) / 10);

  // Bayesian probability of exceeding efficacy threshold (score > 60)
  const zScore = (60 - meanScore) / (stdDev + 1e-4);
  const bayesianProb = clamp(Math.round((1 - standardNormalCDF(zScore)) * 1000) / 10, 5, 99.9);

  // Confidence score adjusted for data quantity and bias
  const sampleSizeSum = contributions.reduce((sum, c) => sum + c.sampleSize, 0);
  const sampleBonus = Math.min(15, Math.log10(Math.max(10, sampleSizeSum)) * 4);
  const confidenceScore = clamp(Math.round(meanScore * 0.7 + (1 - cv) * 20 + sampleBonus), 20, 99);

  // Decision logic
  let decision: 'RECOMMEND' | 'CONDITIONAL' | 'INSUFFICIENT_EVIDENCE' = 'RECOMMEND';
  if (confidenceScore < 50 || contributions.length < 2) {
    decision = 'INSUFFICIENT_EVIDENCE';
  } else if (confidenceScore < 72 || cv > 0.45) {
    decision = 'CONDITIONAL';
  }

  // Governance Gates Check
  const citationCoveragePass = contributions.every((c) => /^(PMID|DOI|CTRI|ICTRP|AYUSH|DHARA|NCT)-?/i.test(c.source.registryIdentifier));
  const intervalReliabilityPass = (ciUpper - ciLower) < 40;
  const recencyCoveragePass = contributions.every((c) => c.recencyYears < 15);
  const calibrationPass = confidenceScore > 40 && bayesianProb > 20;

  const allGatesPass = citationCoveragePass && intervalReliabilityPass && recencyCoveragePass && calibrationPass;

  // Sort top intervention
  const sortedContributions = [...contributions].sort((a, b) => b.pramanaScore - a.pramanaScore);
  const topIntervention = sortedContributions[0]?.interventionName;

  // System Breakdown
  const systems: MedicalSystem[] = ['Allopathy', 'Ayurveda', 'Siddha', 'Naturopathy'];
  const systemBreakdown = systems.map((sys) => {
    const sysItems = contributions.filter((c) => c.medicalSystem === sys);
    const avg = sysItems.length > 0 ? Math.round(sysItems.reduce((s, i) => s + i.pramanaScore, 0) / sysItems.length) : 0;
    const top = [...sysItems].sort((a, b) => b.pramanaScore - a.pramanaScore)[0]?.interventionName || 'N/A';
    const gradeDist = {
      A: sysItems.filter((i) => i.evidenceGrade === 'A').length,
      B: sysItems.filter((i) => i.evidenceGrade === 'B').length,
      C: sysItems.filter((i) => i.evidenceGrade === 'C').length,
    };
    return {
      system: sys,
      evidenceCount: sysItems.length,
      averageScore: avg,
      topIntervention: top,
      gradeDist,
    };
  });

  return {
    modelVersion: MODEL_VERSION,
    generatedAt: asOf.toISOString(),
    conditionId: condition.conditionId,
    conditionName: condition.standardName,
    persona,
    evidenceCount: contributions.length,
    conditionPramanaScore: Math.round(meanScore),
    confidenceScore,
    confidenceInterval95: { lower: ciLower, upper: ciUpper },
    bayesianProbabilityAboveThreshold: bayesianProb,
    decision,
    topIntervention,
    uncertainty: {
      coefficientOfVariation: Math.round(cv * 100) / 100,
      dataCoverage: sampleSizeSum > 1000 ? 'high' : sampleSizeSum > 250 ? 'moderate' : 'low',
      explanation: `Calculated from ${contributions.length} multi-system trials encompassing N=${sampleSizeSum.toLocaleString()} participants. Std error = ${stdError.toFixed(2)}.`,
    },
    governanceGates: {
      calibrationPass,
      intervalReliabilityPass,
      citationCoveragePass,
      recencyCoveragePass,
      overallGateStatus: allGatesPass ? 'GO' : (citationCoveragePass ? 'CONDITIONAL_AUDIT' : 'NO_GO'),
    },
    contributions: sortedContributions,
    systemBreakdown,
  };
}

function standardNormalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}
