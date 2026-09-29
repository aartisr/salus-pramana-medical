import { InteractionDynamics } from '../types/salus';

type ODEState = {
  c1: number; // Concentration 1
  c2: number; // Concentration 2
};

function rk4Step(state: ODEState, dt: number, k1: number, k2: number, beta: number): ODEState {
  const k_c1_1 = -k1 * state.c1 - beta * state.c1 * state.c2;
  const k_c2_1 = -k2 * state.c2;

  const c1_temp = state.c1 + 0.5 * dt * k_c1_1;
  const c2_temp = state.c2 + 0.5 * dt * k_c2_1;
  const k_c1_2 = -k1 * c1_temp - beta * c1_temp * c2_temp;
  const k_c2_2 = -k2 * c2_temp;

  const c1_temp2 = state.c1 + 0.5 * dt * k_c1_2;
  const c2_temp2 = state.c2 + 0.5 * dt * k_c2_2;
  const k_c1_3 = -k1 * c1_temp2 - beta * c1_temp2 * c2_temp2;
  const k_c2_3 = -k2 * c2_temp2;

  const c1_temp3 = state.c1 + dt * k_c1_3;
  const c2_temp3 = state.c2 + dt * k_c2_3;
  const k_c1_4 = -k1 * c1_temp3 - beta * c1_temp3 * c2_temp3;
  const k_c2_4 = -k2 * c2_temp3;

  const c1_new = state.c1 + (dt / 6) * (k_c1_1 + 2 * k_c1_2 + 2 * k_c1_3 + k_c1_4);
  const c2_new = state.c2 + (dt / 6) * (k_c2_1 + 2 * k_c2_2 + 2 * k_c2_3 + k_c2_4);

  return {
    c1: Math.max(0, c1_new),
    c2: Math.max(0, c2_new),
  };
}

function riskScoreFromConcentrations(c1: number, c2: number, interactionStrength: number): number {
  const synergisticRisk = c1 * c2 * interactionStrength * 100;
  const baselineRisk = (Math.abs(c1 - 0.5) * 20 + Math.abs(c2 - 0.5) * 20) * 0.5;
  return Math.min(100, synergisticRisk + baselineRisk);
}

function classifyRiskSeverity(peakRisk: number): 'none' | 'mild' | 'moderate' | 'severe' {
  if (peakRisk < 20) return 'none';
  if (peakRisk < 45) return 'mild';
  if (peakRisk < 75) return 'moderate';
  return 'severe';
}

export function simulateInteractionDynamics(
  interventionA: string,
  interventionB: string,
  options: {
    hoursToSimulate?: number;
    interactionStrength?: number; // beta (0 - 1.0)
    eliminationRateA?: number; // k1 (0.01 - 0.5)
    eliminationRateB?: number; // k2 (0.01 - 0.5)
    staggerOffsetHours?: number; // time delay in drug B intake
    hasKnownInteraction?: boolean;
    customMechanism?: string;
  } = {}
): InteractionDynamics {
  const hoursToSimulate = options.hoursToSimulate ?? 48;
  const beta = options.interactionStrength ?? 0.42;
  const k1 = options.eliminationRateA ?? 0.065;
  const k2 = options.eliminationRateB ?? 0.055;
  const staggerHours = options.staggerOffsetHours ?? 0;
  const hasKnown = options.hasKnownInteraction ?? true;

  if (!hasKnown) {
    const timePoints = Array.from({ length: 25 }, (_, i) => Math.round(((i / 24) * hoursToSimulate) * 10) / 10);
    return {
      timePoints,
      concentrations1: timePoints.map((t) => Math.round(Math.exp(-k1 * t) * 100) / 100),
      concentrations2: timePoints.map((t) => Math.round(Math.exp(-k2 * t) * 100) / 100),
      riskScores: timePoints.map(() => 5),
      peakRiskTime: 0,
      peakRiskScore: 5,
      severityClass: 'none',
      timeToMildRisk: null,
      timeToSevereRisk: null,
      interactionMechanism: 'No significant pharmacokinetic or metabolic interaction identified between these agents.',
      clinicalActionProtocol: 'Concurrent administration permissible under standard dosing guidelines.',
    };
  }

  const dt = 0.25; // 15-minute intervals
  const totalSteps = Math.round((hoursToSimulate * 60) / (dt * 60));
  
  let state: ODEState = { c1: 1.0, c2: staggerHours === 0 ? 0.9 : 0.0 };

  const timePoints: number[] = [];
  const concentrations1: number[] = [];
  const concentrations2: number[] = [];
  const riskScores: number[] = [];

  const sampleInterval = Math.max(1, Math.floor(totalSteps / 24));
  let peakRiskScore = 0;
  let peakRiskTime = 0;
  let timeToMildRisk: number | null = null;
  let timeToSevereRisk: number | null = null;

  for (let step = 0; step <= totalSteps; step++) {
    const time = (step * (dt * 60)) / 60; // in hours

    // If staggered, administer B when time >= staggerHours
    if (staggerHours > 0 && time >= staggerHours && state.c2 === 0) {
      state.c2 = 0.9;
    }

    const currentRisk = riskScoreFromConcentrations(state.c1, state.c2, beta);

    if (currentRisk > peakRiskScore) {
      peakRiskScore = currentRisk;
      peakRiskTime = time;
    }

    if (timeToMildRisk === null && currentRisk >= 20) {
      timeToMildRisk = time;
    }
    if (timeToSevereRisk === null && currentRisk >= 75) {
      timeToSevereRisk = time;
    }

    if (step % sampleInterval === 0 || step === totalSteps) {
      timePoints.push(Math.round(time * 10) / 10);
      concentrations1.push(Math.round(state.c1 * 100) / 100);
      concentrations2.push(Math.round(state.c2 * 100) / 100);
      riskScores.push(Math.round(currentRisk));
    }

    state = rk4Step(state, dt, k1, k2, beta);
  }

  const severity = classifyRiskSeverity(peakRiskScore);
  
  let mechanism = options.customMechanism;
  if (!mechanism) {
    if (interventionA.includes('Metformin') || interventionB.includes('Berberine')) {
      mechanism = 'Competitive organic cation transporter (OCT1/OCT2) saturation and additive AMPK-mediated glycemic drop with elevated lactic acid clearance load.';
    } else if (interventionA.includes('Escitalopram') || interventionB.includes('Ashwagandha')) {
      mechanism = 'GABAergic-Serotonergic synergistic central nervous system modulation; moderate sedation and potential serotonin receptor upregulation.';
    } else if (interventionA.includes('Amlodipine') || interventionB.includes('Sarpagandha')) {
      mechanism = 'Additive calcium-channel and central monoamine depletion inducing steep hypotensive curve; risk of orthostatic dizziness and bradycardia.';
    } else {
      mechanism = 'Coupled CYP3A4/CYP2C9 metabolic competition and shared hepatic clearance pathway dynamics.';
    }
  }

  let protocol = 'Standard co-monitoring of vitals and therapeutic response.';
  if (severity === 'severe') {
    protocol = 'MANDATORY ACTION: Stagger administration by minimum 3–4 hours or titrate downward by 30–50%. Monitor renal and liver panels.';
  } else if (severity === 'moderate') {
    protocol = 'RECOMMENDED PROTOCOL: Stagger dosing by 2 hours; alert patient to monitor blood pressure/glucose; repeat labs at 14 days.';
  } else if (severity === 'mild') {
    protocol = 'ROUTINE OBSERVATION: Minor theoretical interaction. Advise taking with meals.';
  }

  return {
    timePoints,
    concentrations1,
    concentrations2,
    riskScores,
    peakRiskTime: Math.round(peakRiskTime * 10) / 10,
    peakRiskScore: Math.round(peakRiskScore),
    severityClass: severity,
    timeToMildRisk: timeToMildRisk ? Math.round(timeToMildRisk * 10) / 10 : null,
    timeToSevereRisk: timeToSevereRisk ? Math.round(timeToSevereRisk * 10) / 10 : null,
    interactionMechanism: mechanism,
    clinicalActionProtocol: protocol,
  };
}
