import { DoseOptimizationCandidate } from '../types/salus';

/**
 * Hill Equation / Sigmoidal Emax Dose-Response Optimizer
 * E(D) = (Emax * D^γ) / (ED50^γ + D^γ)
 * Tox(D) = (ToxMax * D^γ_tox) / (TD50^γ_tox + D^γ_tox)
 * NetBenefit = E(D) - (RiskWeight * Tox(D))
 */
export function calculateDoseCandidates(
  interventionName: string,
  baseUnit: string = 'mg/day',
  minDose: number = 100,
  maxDose: number = 2000,
  steps: number = 10,
  options: {
    ed50?: number;
    td50?: number;
    hillEfficacy?: number;
    hillToxicity?: number;
    riskWeight?: number;
  } = {}
): DoseOptimizationCandidate[] {
  const ed50 = options.ed50 ?? (minDose + (maxDose - minDose) * 0.35);
  const td50 = options.td50 ?? (minDose + (maxDose - minDose) * 0.75);
  const gammaE = options.hillEfficacy ?? 1.8;
  const gammaT = options.hillToxicity ?? 2.4;
  const riskWeight = options.riskWeight ?? 0.85;

  const stepSize = (maxDose - minDose) / (steps - 1);
  const candidates: DoseOptimizationCandidate[] = [];

  let highestNetBenefit = -Infinity;
  let optimalIndex = -1;

  for (let i = 0; i < steps; i++) {
    const dose = Math.round(minDose + i * stepSize);

    // Efficacy sigmoidal response
    const dPowE = Math.pow(dose, gammaE);
    const ed50Pow = Math.pow(ed50, gammaE);
    const efficacy = (100 * dPowE) / (ed50Pow + dPowE);

    // Toxicity sigmoidal response
    const dPowT = Math.pow(dose, gammaT);
    const td50Pow = Math.pow(td50, gammaT);
    const toxicity = (100 * dPowT) / (td50Pow + dPowT);

    // Net therapeutic benefit
    const netBenefit = Math.max(0, efficacy - riskWeight * toxicity);
    const ti = td50 / ed50;

    candidates.push({
      dose,
      unit: baseUnit,
      predictedEfficacy: Math.round(efficacy * 10) / 10,
      predictedToxicityRisk: Math.round(toxicity * 10) / 10,
      netBenefitScore: Math.round(netBenefit * 10) / 10,
      therapeuticIndex: Math.round(ti * 100) / 100,
      isOptimal: false,
    });

    if (netBenefit > highestNetBenefit) {
      highestNetBenefit = netBenefit;
      optimalIndex = i;
    }
  }

  if (optimalIndex >= 0 && candidates[optimalIndex]) {
    candidates[optimalIndex].isOptimal = true;
  }

  return candidates;
}
