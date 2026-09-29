/**
 * Single-intervention trajectory simulator
 * Models concentration vs. time for a single intervention using 1-compartment pharmacokinetics
 * with first-order absorption and elimination.
 */

export type TrajectoryPoint = {
  time: number; // hours
  concentration: number; // normalized 0-1
  relativeToBaseline: number; // percentage change from baseline
};

export type SingleInterventionTrajectory = {
  interventionName: string;
  peakConcentration: number;
  timeToPharmacologicalEffect: number; // hours until 20% above baseline
  timeToMinimumEffectiveConcentration: number; // hours to 50% baseline
  effectDuration: number; // hours until returns to baseline
  halfLife: number; // elimination half-life in hours
  absorptionRate: number; // absorption rate constant
  trajectoryPoints: TrajectoryPoint[];
  averageConcentration: number;
  timeAboveThreshold: number; // hours spent > 50% baseline
};

function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

/**
 * Simulate concentration trajectory using 1-compartment model
 * C(t) = (Dose * Ka / (Ka - Ke)) * (exp(-Ke*t) - exp(-Ka*t))
 * Simplified with normalized dose = 1
 */
export function simulateSingleInterventionTrajectory(
  interventionName: string,
  isPharmacological: boolean,
  studyMethodology: string,
  sampleSize: number,
  hoursToSimulate: number = 72,
): SingleInterventionTrajectory {
  // Seed randomness from intervention characteristics
  const seed = Array.from(interventionName).reduce((a, b) => a + b.charCodeAt(0), 0) + sampleSize;

  // Absorption rate constant (Ka) varies by route
  // Oral: 0.8-1.2 h⁻¹, IV: immediate, Topical: 0.2-0.4 h⁻¹
  let kaBase = 0.9;
  if (isPharmacological) {
    if (interventionName.toLowerCase().includes("iv") || interventionName.toLowerCase().includes("injectable")) {
      kaBase = 5.0; // immediate/rapid absorption
    } else if (interventionName.toLowerCase().includes("topical")) {
      kaBase = 0.3;
    }
  }
  const Ka = kaBase * (0.8 + seededRandom(seed, 1) * 0.4);

  // Elimination rate constant (Ke) varies by substance
  // Typical: 0.1-0.5 h⁻¹ for pharmacological, slower for lifestyle
  const keBase = isPharmacological ? 0.25 : 0.08;
  const Ke = keBase * (0.7 + seededRandom(seed, 2) * 0.6);

  // Half-life: t1/2 = ln(2) / Ke
  const halfLife = Math.log(2) / Ke;

  // Dose normalization constant
  const A = (Ka * 1.0) / (Ka - Ke);

  // Sample points: every 30 minutes for first 12h, every 2h thereafter
  const trajectoryPoints: TrajectoryPoint[] = [];

  let timeAboveThreshold = 0;
  let peakConcentration = 0;
  let timeToPharmEffect = -1;
  let timeToMEC = -1;
  let effectDuration = -1;

  const dt = 0.5;
  const maxSteps = Math.ceil(hoursToSimulate / dt);

  for (let step = 0; step <= maxSteps; step++) {
    const t = step * dt;

    // 1-compartment model concentration at time t
    const c = A * (Math.exp(-Ke * t) - Math.exp(-Ka * t));
    const normalized = Math.max(0, Math.min(1, c)); // clamp to [0,1]

    const relativeToBaseline = (normalized - 0.1) * 100 + 100; // Baseline = 0.1 normalized

    if (normalized > peakConcentration) {
      peakConcentration = normalized;
    }

    // Track time to pharmacological effect (20% above baseline)
    if (relativeToBaseline > 120 && timeToPharmEffect < 0) {
      timeToPharmEffect = t;
    }

    // Track time to minimum effective concentration (50% baseline)
    if (normalized > 0.5 && timeToMEC < 0) {
      timeToMEC = t;
    }

    // Track time above threshold
    if (normalized > 0.5) {
      timeAboveThreshold += dt;
    }

    // Track effect duration (when drops back to baseline ±5%)
    if (normalized > 0.095 && normalized < 0.105) {
      if (effectDuration < 0 && t > 0.1) {
        // Only mark if we've seen peak first
        if (normalized < peakConcentration * 0.3) {
          effectDuration = t;
        }
      }
    }

    // Sample points: every 0.5h first 12h, every 2h after
    if (step % 1 === 0 || (t > 12 && step % 4 === 0)) {
      trajectoryPoints.push({
        time: t,
        concentration: normalized,
        relativeToBaseline,
      });
    }
  }

  // Fallbacks
  if (timeToPharmEffect < 0) timeToPharmEffect = halfLife * 0.5;
  if (timeToMEC < 0) timeToMEC = halfLife * 0.25;
  if (effectDuration < 0) effectDuration = halfLife * 3;

  // Calculate average concentration during therapeutic window
  const avgConc = trajectoryPoints
    .filter((p) => p.concentration > 0.1)
    .reduce((sum, p) => sum + p.concentration, 0) / Math.max(1, trajectoryPoints.filter((p) => p.concentration > 0.1).length);

  return {
    interventionName,
    peakConcentration,
    timeToPharmacologicalEffect: timeToPharmEffect,
    timeToMinimumEffectiveConcentration: timeToMEC,
    effectDuration,
    halfLife,
    absorptionRate: Ka,
    trajectoryPoints,
    averageConcentration: avgConc,
    timeAboveThreshold,
  };
}
