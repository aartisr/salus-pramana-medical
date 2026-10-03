export interface TrajectoryPoint { time: number; concentration: number; relativeToBaseline: number }
export interface SingleInterventionTrajectory { interventionName: string; peakConcentration: number; timeToPharmacologicalEffect: number; timeToMinimumEffectiveConcentration: number; effectDuration: number; halfLife: number; absorptionRate: number; trajectoryPoints: TrajectoryPoint[]; averageConcentration: number; timeAboveThreshold: number }

const seededRandom = (seed: number, offset: number) => { const value = Math.sin(seed + offset) * 10000; return value - Math.floor(value); };

export function simulateSingleInterventionTrajectory(interventionName: string, isPharmacological: boolean, studyMethodology: string, sampleSize: number, hoursToSimulate = 72): SingleInterventionTrajectory {
  if (!interventionName.trim() || !studyMethodology.trim() || sampleSize < 0 || hoursToSimulate < 0) throw new RangeError("Invalid trajectory inputs");
  const seed = [...interventionName].reduce((sum, character) => sum + character.charCodeAt(0), 0) + sampleSize;
  const lowerName = interventionName.toLowerCase();
  const absorptionBase = isPharmacological ? (lowerName.includes("iv") || lowerName.includes("injectable") ? 5 : lowerName.includes("topical") ? 0.3 : 0.9) : 0.9;
  const absorptionRate = absorptionBase * (0.8 + seededRandom(seed, 1) * 0.4);
  const eliminationRate = (isPharmacological ? 0.25 : 0.08) * (0.7 + seededRandom(seed, 2) * 0.6);
  const halfLife = Math.log(2) / eliminationRate;
  const coefficient = absorptionRate / (absorptionRate - eliminationRate);
  const trajectoryPoints: TrajectoryPoint[] = [];
  let peakConcentration = 0, timeToPharmacologicalEffect = -1, timeToMinimumEffectiveConcentration = -1, effectDuration = -1, timeAboveThreshold = 0;
  for (let time = 0; time <= hoursToSimulate; time += 0.5) {
    const concentration = Math.max(0, Math.min(1, coefficient * (Math.exp(-eliminationRate * time) - Math.exp(-absorptionRate * time))));
    const relativeToBaseline = (concentration - 0.1) * 100 + 100;
    peakConcentration = Math.max(peakConcentration, concentration);
    if (relativeToBaseline > 120 && timeToPharmacologicalEffect < 0) timeToPharmacologicalEffect = time;
    if (concentration > 0.5 && timeToMinimumEffectiveConcentration < 0) timeToMinimumEffectiveConcentration = time;
    if (concentration > 0.5) timeAboveThreshold += 0.5;
    if (effectDuration < 0 && time > 0.1 && concentration > 0.095 && concentration < 0.105 && concentration < peakConcentration * 0.3) effectDuration = time;
    trajectoryPoints.push({ time, concentration, relativeToBaseline });
  }
  const effectivePoints = trajectoryPoints.filter((point) => point.concentration > 0.1);
  return { interventionName, peakConcentration, timeToPharmacologicalEffect: timeToPharmacologicalEffect < 0 ? halfLife * 0.5 : timeToPharmacologicalEffect, timeToMinimumEffectiveConcentration: timeToMinimumEffectiveConcentration < 0 ? halfLife * 0.25 : timeToMinimumEffectiveConcentration, effectDuration: effectDuration < 0 ? halfLife * 3 : effectDuration, halfLife, absorptionRate, trajectoryPoints, averageConcentration: effectivePoints.reduce((sum, point) => sum + point.concentration, 0) / Math.max(1, effectivePoints.length), timeAboveThreshold };
}