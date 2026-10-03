import type { DoseOptimizationCandidate } from "./types";

export const DEFAULT_HILL_EFFICACY = 1.8;
export const DEFAULT_HILL_TOXICITY = 2.4;
export const DEFAULT_RISK_WEIGHT = 0.85;

export function calculateDoseCandidates(interventionName: string, baseUnit = "mg/day", minDose = 100, maxDose = 2000, steps = 10, options: { ed50?: number; td50?: number; hillEfficacy?: number; hillToxicity?: number; riskWeight?: number } = {}): DoseOptimizationCandidate[] {
  if (!interventionName.trim() || !Number.isFinite(minDose) || !Number.isFinite(maxDose) || minDose < 0 || maxDose <= minDose || !Number.isInteger(steps) || steps < 2) throw new RangeError("Invalid dose candidate inputs");
  const ed50 = options.ed50 ?? minDose + (maxDose - minDose) * 0.35;
  const td50 = options.td50 ?? minDose + (maxDose - minDose) * 0.75;
  const efficacyHill = options.hillEfficacy ?? DEFAULT_HILL_EFFICACY;
  const toxicityHill = options.hillToxicity ?? DEFAULT_HILL_TOXICITY;
  const riskWeight = options.riskWeight ?? DEFAULT_RISK_WEIGHT;
  const candidates = Array.from({ length: steps }, (_, index) => {
    const dose = Math.round(minDose + index * ((maxDose - minDose) / (steps - 1)));
    const efficacy = (100 * dose ** efficacyHill) / (ed50 ** efficacyHill + dose ** efficacyHill);
    const toxicity = (100 * dose ** toxicityHill) / (td50 ** toxicityHill + dose ** toxicityHill);
    const netBenefitScore = Number(Math.max(0, efficacy - riskWeight * toxicity).toFixed(1));
    return { dose, unit: baseUnit, predictedEfficacy: Number(efficacy.toFixed(1)), predictedToxicityRisk: Number(toxicity.toFixed(1)), netBenefitScore, utilityScore: netBenefitScore, therapeuticIndex: Number((td50 / ed50).toFixed(2)), isOptimal: false };
  });
  const optimal = candidates.reduce((best, candidate, index) => candidate.netBenefitScore > candidates[best].netBenefitScore ? index : best, 0);
  candidates[optimal] = { ...candidates[optimal], isOptimal: true };
  return candidates;
}