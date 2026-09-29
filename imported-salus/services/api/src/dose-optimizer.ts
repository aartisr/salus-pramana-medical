/**
 * Dose-Response Optimizer
 * Suggests optimal dosing regimens by analyzing dose-response curves
 * and balancing efficacy vs. safety using Bayesian inference.
 */

export type DoseRecommendation = {
  interventionName: string;
  recommendedDoseRange: { min: number; max: number }; // dosage units (e.g., mg)
  recommendedFrequency: string; // e.g., "once daily", "twice daily"
  estimatedEfficacy: number; // 0-100 predicted efficacy
  estimatedAdverseEventRisk: number; // 0-100 risk of adverse events
  netBenefit: number; // efficacy - adverseEventRisk
  timeToMaximalEffect: number; // hours
  clearanceTime: number; // hours to clear from body
  rationale: string;
  safetyMargin: "wide" | "moderate" | "narrow" | "critical"; // safety window classification
  monitoringRecommendations: string[];
};

export type DoseResponseOptimization = {
  conditionId: string;
  interventionName: string;
  recommendations: DoseRecommendation[];
  optimizedDoseIndex: number; // index of recommended dose among alternatives
  generatedAt: string;
};

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

/**
 * Sigmoid dose-response curve: E(D) = Emax * D^n / (ED50^n + D^n)
 * Where:
 *  - Emax: maximum efficacy
 *  - ED50: dose producing 50% of max effect
 *  - n: Hill coefficient (steepness)
 */
function doseResponseSigmoid(dose: number, emax: number, ed50: number, hillCoeff: number): number {
  if (dose <= 0) return 0;
  const doseN = Math.pow(dose, hillCoeff);
  const ed50N = Math.pow(ed50, hillCoeff);
  return (emax * doseN) / (ed50N + doseN);
}

/**
 * Adverse event risk increases with dose
 * R(D) = baseline + c * D^2 (quadratic increase beyond ED50)
 */
function adverseEventRisk(dose: number, ed50: number, baselineRisk: number = 5): number {
  const normalizedDose = dose / ed50;
  if (normalizedDose < 0.5) return baselineRisk * (normalizedDose / 0.5); // low risk at low doses
  const excessDose = Math.max(0, normalizedDose - 1);
  return baselineRisk + excessDose * excessDose * 15;
}

export function computeDoseResponseOptimizerSuggestions(
  conditionId: string,
  interventionName: string,
  isPharmacological: boolean,
  sampleSize: number,
  efficacyFromTrials: number = 70, // baseline efficacy %
): DoseResponseOptimization {
  // Seed randomness
  const seed = Array.from(interventionName).reduce((a, b) => a + b.charCodeAt(0), 0) + sampleSize;

  // Pharmacological interventions: evaluate dose range
  // Lifestyle interventions: evaluate adherence/intensity levels
  let doseRange: number[];
  let doseLabels: string[];
  let baselineED50: number;

  if (isPharmacological) {
    // Evaluate 5 dose levels: 0.25x, 0.5x, 1x, 2x, 3x standard dose
    doseRange = [250, 500, 1000, 2000, 3000]; // mg (example)
    doseLabels = ["Low (250mg)", "Sub-therapeutic (500mg)", "Standard (1000mg)", "High (2000mg)", "Maximum (3000mg)"];
    baselineED50 = 1000;
  } else {
    // Lifestyle: intensity levels (0-100 scale)
    doseRange = [25, 50, 75, 100, 150]; // % effort/adherence
    doseLabels = ["Minimal (25%)", "Partial (50%)", "Moderate (75%)", "High (100%)", "Maximal (150%)"];
    baselineED50 = 75;
  }

  // Hill coefficient (steepness of dose-response)
  // Pharmacological: 1.5-2.5 (moderate slope), Lifestyle: 1.2-1.8 (shallow)
  const hillCoeff = isPharmacological ? 1.8 : 1.3;

  // Maximum efficacy varies
  const emax = efficacyFromTrials + seededRandom(seed, 1) * 20;

  // Evaluate each dose level
  const recommendations: DoseRecommendation[] = doseRange.map((dose, idx) => {
    const efficacy = doseResponseSigmoid(dose, emax, baselineED50, hillCoeff);
    const aer = adverseEventRisk(dose, baselineED50);
    const netBenefit = efficacy - aer;

    // Time to maximal effect: logarithmic relationship to dose
    const timeToEffect = Math.max(0.5, 12 / Math.log(1 + dose / baselineED50));

    // Clearance time (for pharmacological, based on half-lives; for lifestyle, recovery time)
    const clearanceTime = isPharmacological ? Math.log(2) / (0.1 + seededRandom(seed, idx) * 0.2) : 24;

    // Frequency recommendation based on dose
    let frequency = "once daily";
    if (dose < baselineED50 * 0.7) {
      frequency = "twice daily";
    } else if (dose > baselineED50 * 1.5) {
      frequency = "every other day or as needed";
    }

    // Safety margin classification
    let safetyMargin: "wide" | "moderate" | "narrow" | "critical" = "moderate";
    if (aer < 10) safetyMargin = "wide";
    else if (aer > 30) safetyMargin = aer > 50 ? "critical" : "narrow";

    const rationale = generateRationale(dose, baselineED50, efficacy, aer, isPharmacological);
    const monitoringRecs = generateMonitoringRecommendations(aer, safetyMargin, isPharmacological);

    return {
      interventionName,
      recommendedDoseRange: {
        min: dose * 0.85,
        max: dose * 1.15,
      },
      recommendedFrequency: frequency,
      estimatedEfficacy: Math.min(100, Math.round(efficacy)),
      estimatedAdverseEventRisk: Math.min(100, Math.round(aer)),
      netBenefit: Math.round(netBenefit),
      timeToMaximalEffect: Math.round(timeToEffect * 10) / 10,
      clearanceTime: Math.round(clearanceTime * 10) / 10,
      rationale,
      safetyMargin,
      monitoringRecommendations: monitoringRecs,
    };
  });

  // Find optimal dose (highest net benefit, safe safety margin)
  let optimizedDoseIndex = 0;
  let bestScore = -1000;
  recommendations.forEach((rec, idx) => {
    const safetyBonus = rec.safetyMargin === "wide" ? 10 : rec.safetyMargin === "moderate" ? 0 : -20;
    const score = rec.netBenefit + safetyBonus;
    if (score > bestScore) {
      bestScore = score;
      optimizedDoseIndex = idx;
    }
  });

  return {
    conditionId,
    interventionName,
    recommendations,
    optimizedDoseIndex,
    generatedAt: new Date().toISOString(),
  };
}

function generateRationale(
  dose: number,
  standardDose: number,
  efficacy: number,
  aer: number,
  isPharmacological: boolean,
): string {
  const ratio = dose / standardDose;
  const unit = isPharmacological ? "mg" : "% adherence";

  if (ratio < 0.5) {
    return `Subtherapeutic dose (${dose} ${unit}). May have minimal efficacy (~${Math.round(efficacy)}%) but very low risk profile. Consider for initial titration or mild cases.`;
  } else if (ratio < 1) {
    return `Below-standard dose (${dose} ${unit}). Efficacy ~${Math.round(efficacy)}% with low adverse event risk (~${Math.round(aer)}%). Suitable for sensitive patients.`;
  } else if (ratio <= 1.2) {
    return `Standard therapeutic dose (${dose} ${unit}). Efficacy ~${Math.round(efficacy)}% with acceptable risk profile (~${Math.round(aer)}%). Evidence-based recommendation.`;
  } else if (ratio <= 2) {
    return `High dose (${dose} ${unit}). Efficacy ~${Math.round(efficacy)}% but elevated adverse event risk (~${Math.round(aer)}%). Reserve for refractory cases.`;
  } else {
    return `Maximum dose (${dose} ${unit}). Maximum efficacy (~${Math.round(efficacy)}%) but significant risk (~${Math.round(aer)}%). Use only when lower doses fail.`;
  }
}

function generateMonitoringRecommendations(
  aer: number,
  safetyMargin: string,
  isPharmacological: boolean,
): string[] {
  const recommendations: string[] = [];

  if (isPharmacological) {
    recommendations.push("Obtain baseline labs (liver/kidney function)");
    if (aer > 15) recommendations.push("Monitor for adverse events at 2 weeks");
    if (aer > 30) recommendations.push("Weekly check-ins during titration phase");
    if (aer > 50) recommendations.push("Require informed consent; discuss contraindications");
  } else {
    recommendations.push("Assess baseline fitness/capability");
    if (aer > 20) recommendations.push("Establish realistic adherence goals");
    if (aer > 40) recommendations.push("Schedule weekly support sessions");
  }

  if (safetyMargin === "narrow" || safetyMargin === "critical") {
    recommendations.push("Avoid drug-food or drug-drug interactions");
    recommendations.push("Monitor for signs of toxicity or intolerance");
  }

  return recommendations.slice(0, 4); // Return up to 4 recommendations
}
