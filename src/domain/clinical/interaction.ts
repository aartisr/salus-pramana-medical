import type { InteractionDynamics } from "./types";

export const INTERACTION_STEP_HOURS = 0.25;
export const RISK_MILD_THRESHOLD = 20;
export const RISK_MODERATE_THRESHOLD = 45;
export const RISK_SEVERE_THRESHOLD = 75;

function rk4(c1: number, c2: number, eliminationA: number, eliminationB: number, coupling: number) {
  const derivative = (left: number, right: number) => [-eliminationA * left - coupling * left * right, -eliminationB * right] as const;
  const first = derivative(c1, c2);
  const second = derivative(c1 + INTERACTION_STEP_HOURS * first[0] / 2, c2 + INTERACTION_STEP_HOURS * first[1] / 2);
  const third = derivative(c1 + INTERACTION_STEP_HOURS * second[0] / 2, c2 + INTERACTION_STEP_HOURS * second[1] / 2);
  const fourth = derivative(c1 + INTERACTION_STEP_HOURS * third[0], c2 + INTERACTION_STEP_HOURS * third[1]);
  return [Math.max(0, c1 + INTERACTION_STEP_HOURS * (first[0] + 2 * second[0] + 2 * third[0] + fourth[0]) / 6), Math.max(0, c2 + INTERACTION_STEP_HOURS * (first[1] + 2 * second[1] + 2 * third[1] + fourth[1]) / 6)] as const;
}

export function classifyRiskSeverity(risk: number): InteractionDynamics["severityClass"] {
  return risk < RISK_MILD_THRESHOLD ? "none" : risk < RISK_MODERATE_THRESHOLD ? "mild" : risk < RISK_SEVERE_THRESHOLD ? "moderate" : "severe";
}

export function simulateInteractionDynamics(interventionA: string, interventionB: string, options: { hoursToSimulate?: number; interactionStrength?: number; eliminationRateA?: number; eliminationRateB?: number; staggerOffsetHours?: number; hasKnownInteraction?: boolean; customMechanism?: string } = {}): InteractionDynamics {
  const hours = options.hoursToSimulate ?? 48;
  const coupling = options.interactionStrength ?? 0.42;
  const eliminationA = options.eliminationRateA ?? 0.065;
  const eliminationB = options.eliminationRateB ?? 0.055;
  const stagger = options.staggerOffsetHours ?? 0;
  if (hours < 0 || coupling < 0 || eliminationA < 0 || eliminationB < 0 || stagger < 0) throw new RangeError("Interaction inputs must be nonnegative");
  if (options.hasKnownInteraction === false) {
    const timePoints = Array.from({ length: 25 }, (_, index) => Number((index * hours / 24).toFixed(1)));
    return { timePoints, concentrations1: timePoints.map((time) => Number(Math.exp(-eliminationA * time).toFixed(2))), concentrations2: timePoints.map((time) => Number(Math.exp(-eliminationB * time).toFixed(2))), riskScores: timePoints.map(() => 5), peakRiskTime: 0, peakRiskScore: 5, severityClass: "none", timeToMildRisk: null, timeToSevereRisk: null, interactionMechanism: "No significant pharmacokinetic or metabolic interaction identified between these agents.", clinicalActionProtocol: "Concurrent administration permissible under standard dosing guidelines." };
  }
  const steps = Math.round(hours / INTERACTION_STEP_HOURS);
  const sampleInterval = Math.max(1, Math.floor(steps / 24));
  let c1 = 1;
  let c2 = stagger === 0 ? 0.9 : 0;
  let administeredB = stagger === 0;
  let peakRiskScore = 0;
  let peakRiskTime = 0;
  let timeToMildRisk: number | null = null;
  let timeToSevereRisk: number | null = null;
  const timePoints: number[] = [], concentrations1: number[] = [], concentrations2: number[] = [], riskScores: number[] = [];
  for (let step = 0; step <= steps; step += 1) {
    const time = step * INTERACTION_STEP_HOURS;
    if (!administeredB && time >= stagger) { c2 = 0.9; administeredB = true; }
    const risk = Math.min(100, c1 * c2 * coupling * 100 + (Math.abs(c1 - 0.5) + Math.abs(c2 - 0.5)) * 10);
    if (risk > peakRiskScore) { peakRiskScore = risk; peakRiskTime = time; }
    if (timeToMildRisk === null && risk >= RISK_MILD_THRESHOLD) timeToMildRisk = time;
    if (timeToSevereRisk === null && risk >= RISK_SEVERE_THRESHOLD) timeToSevereRisk = time;
    if (step % sampleInterval === 0 || step === steps) { timePoints.push(Number(time.toFixed(1))); concentrations1.push(Number(c1.toFixed(2))); concentrations2.push(Number(c2.toFixed(2))); riskScores.push(Math.round(risk)); }
    [c1, c2] = rk4(c1, c2, eliminationA, eliminationB, coupling);
  }
  const severityClass = classifyRiskSeverity(peakRiskScore);
  const pair = `${interventionA} ${interventionB}`;
  const interactionMechanism = options.customMechanism ?? (/Metformin|Berberine/.test(pair) ? "Competitive organic cation transporter saturation and additive AMPK-mediated glycemic reduction." : "Coupled metabolic competition and shared clearance pathway dynamics.");
  const clinicalActionProtocol = severityClass === "severe" ? "MANDATORY ACTION: Stagger administration by minimum 3-4 hours or titrate downward by 30-50%." : severityClass === "moderate" ? "RECOMMENDED PROTOCOL: Stagger dosing by 2 hours and monitor clinical response." : severityClass === "mild" ? "ROUTINE OBSERVATION: Minor theoretical interaction." : "Standard co-monitoring of vitals and therapeutic response.";
  return { timePoints, concentrations1, concentrations2, riskScores, peakRiskTime: Number(peakRiskTime.toFixed(1)), peakRiskScore: Math.round(peakRiskScore), severityClass, timeToMildRisk: timeToMildRisk === null ? null : Number(timeToMildRisk.toFixed(1)), timeToSevereRisk: timeToSevereRisk === null ? null : Number(timeToSevereRisk.toFixed(1)), interactionMechanism, clinicalActionProtocol };
}