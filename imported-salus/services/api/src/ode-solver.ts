/**
 * ODE Solver for interaction dynamics modeling
 * Implements a simple Runge-Kutta method for two-compartment pharmacokinetic interactions
 */

export type InteractionDynamics = {
  timePoints: number[];
  concentrations1: number[];
  concentrations2: number[];
  riskScores: number[];
  peakRiskTime: number;
  peakRiskScore: number;
  severityClass: "none" | "mild" | "moderate" | "severe";
  timeToMildRisk: number | null;
  timeToSevereRisk: number | null;
};

type ODEState = {
  c1: number;
  c2: number;
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

function classifyRiskSeverity(peakRisk: number): "none" | "mild" | "moderate" | "severe" {
  if (peakRisk < 15) return "none";
  if (peakRisk < 35) return "mild";
  if (peakRisk < 65) return "moderate";
  return "severe";
}

export function simulateInteractionTimeline(
  interventionA: string,
  interventionB: string,
  hasInteractionWarning: boolean,
  sampleSizeA: number,
  sampleSizeB: number,
  hoursToSimulate: number = 48,
  interactionStrength: number = 0.35,
): InteractionDynamics {
  if (!hasInteractionWarning) {
    const timePoints = Array.from({ length: 13 }, (_, i) => (i / 12) * hoursToSimulate);
    return {
      timePoints,
      concentrations1: timePoints.map(() => 0),
      concentrations2: timePoints.map(() => 0),
      riskScores: timePoints.map(() => 0),
      peakRiskTime: 0,
      peakRiskScore: 0,
      severityClass: "none",
      timeToMildRisk: null,
      timeToSevereRisk: null,
    };
  }

  const dt = 0.5;
  const numSteps = Math.round((hoursToSimulate * 60) / dt);

  const k1 = 0.05 + 0.002 * Math.log(Math.max(1, sampleSizeA));
  const k2 = 0.04 + 0.002 * Math.log(Math.max(1, sampleSizeB));
  const beta = interactionStrength;

  const seed = Array.from(interventionA + interventionB).reduce((a, b) => a + b.charCodeAt(0), 0) + sampleSizeA + sampleSizeB;
  const seededRandom = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const c1Init = 0.8 + seededRandom(1) * 0.2;
  const c2Init = 0.7 + seededRandom(2) * 0.25;

  let state: ODEState = { c1: c1Init, c2: c2Init };

  const timePoints: number[] = [];
  const concentrations1: number[] = [];
  const concentrations2: number[] = [];
  const riskScores: number[] = [];

  const sampleInterval = Math.max(1, Math.floor(numSteps / 12));

  let peakRiskScore = 0;
  let peakRiskTime = 0;
  let timeToMildRisk: number | null = null;
  let timeToSevereRisk: number | null = null;

  for (let step = 0; step <= numSteps; step++) {
    const time = (step * dt) / 60;
    const risk = riskScoreFromConcentrations(state.c1, state.c2, beta);

    if (risk > peakRiskScore) {
      peakRiskScore = risk;
      peakRiskTime = time;
    }

    if (timeToMildRisk === null && risk >= 15) {
      timeToMildRisk = time;
    }

    if (timeToSevereRisk === null && risk >= 65) {
      timeToSevereRisk = time;
    }

    if (step % sampleInterval === 0) {
      timePoints.push(time);
      concentrations1.push(Math.round(state.c1 * 100) / 100);
      concentrations2.push(Math.round(state.c2 * 100) / 100);
      riskScores.push(Math.round(risk));
    }

    state = rk4Step(state, dt, k1, k2, beta);
  }

  return {
    timePoints,
    concentrations1,
    concentrations2,
    riskScores,
    peakRiskTime: Math.round(peakRiskTime * 10) / 10,
    peakRiskScore: Math.round(peakRiskScore),
    severityClass: classifyRiskSeverity(peakRiskScore),
    timeToMildRisk: timeToMildRisk ? Math.round(timeToMildRisk * 10) / 10 : null,
    timeToSevereRisk: timeToSevereRisk ? Math.round(timeToSevereRisk * 10) / 10 : null,
  };
}
