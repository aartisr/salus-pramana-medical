import React, { useState, useMemo } from 'react';
import { simulateInteractionDynamics } from '../services/odeInteractionSolver';
import { PersonaMode } from '../types/salus';
import { MathRenderer } from './MathRenderer';
import { Brain, Sliders, ShieldAlert, Clock, Zap, RefreshCw, AlertTriangle, CheckCircle2, Play } from 'lucide-react';

interface ODESimulationLabProps {
  selectedPersona: PersonaMode;
  initialInterventionA?: string;
  initialInterventionB?: string;
}

export const ODESimulationLab: React.FC<ODESimulationLabProps> = ({
  selectedPersona,
  initialInterventionA = 'Metformin Hydrochloride (1000 mg)',
  initialInterventionB = 'Daruharidra / Berberine Extract (500 mg)',
}) => {
  const [interventionA, setInterventionA] = useState<string>(initialInterventionA);
  const [interventionB, setInterventionB] = useState<string>(initialInterventionB);
  const [interactionStrength, setInteractionStrength] = useState<number>(0.45);
  const [eliminationRateA, setEliminationRateA] = useState<number>(0.065);
  const [eliminationRateB, setEliminationRateB] = useState<number>(0.055);
  const [staggerOffsetHours, setStaggerOffsetHours] = useState<number>(0);
  const [hoursToSimulate, setHoursToSimulate] = useState<number>(48);

  const presetInteractions = [
    {
      label: 'Metformin + Berberine (Competitive OCT1 & AMPK Synergism)',
      a: 'Metformin Hydrochloride (1000 mg)',
      b: 'Berberine HCl (500 mg)',
      beta: 0.52,
      k1: 0.07,
      k2: 0.06,
    },
    {
      label: 'Escitalopram + Ashwagandha (GABAergic / Serotonin Synergy)',
      a: 'Escitalopram (10 mg)',
      b: 'Ashwagandha KSM-66 (600 mg)',
      beta: 0.38,
      k1: 0.035,
      k2: 0.07,
    },
    {
      label: 'Amlodipine + Sarpagandha (Dual Vasodilatory & VMAT2 Hypotension)',
      a: 'Amlodipine Besylate (5 mg)',
      b: 'Sarpagandha Ghan Vati (250 mg)',
      beta: 0.65,
      k1: 0.025,
      k2: 0.03,
    },
    {
      label: 'Celecoxib + Curcumin/Boswellia (Anti-Inflammatory Synergism)',
      a: 'Celecoxib (100 mg)',
      b: 'Curcumin + Boswellia AKBA',
      beta: 0.28,
      k1: 0.06,
      k2: 0.08,
    },
  ];

  const loadPreset = (preset: typeof presetInteractions[0]) => {
    setInterventionA(preset.a);
    setInterventionB(preset.b);
    setInteractionStrength(preset.beta);
    setEliminationRateA(preset.k1);
    setEliminationRateB(preset.k2);
  };

  const simulationResult = useMemo(() => {
    return simulateInteractionDynamics(interventionA, interventionB, {
      hoursToSimulate,
      interactionStrength,
      eliminationRateA,
      eliminationRateB,
      staggerOffsetHours,
    });
  }, [interventionA, interventionB, hoursToSimulate, interactionStrength, eliminationRateA, eliminationRateB, staggerOffsetHours]);

  // Generate SVG path coordinates
  const svgWidth = 700;
  const svgHeight = 260;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };

  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  const pointsCount = simulationResult.timePoints.length;
  const maxTime = Math.max(1, simulationResult.timePoints[pointsCount - 1] || hoursToSimulate);

  const getX = (t: number) => padding.left + (t / maxTime) * plotWidth;
  const getY = (val: number, maxVal: number = 100) => padding.top + plotHeight - (val / maxVal) * plotHeight;

  // Paths
  const pathC1 = simulationResult.timePoints
    .map((t, idx) => {
      const x = getX(t);
      const y = getY(simulationResult.concentrations1[idx] * 100, 100);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const pathC2 = simulationResult.timePoints
    .map((t, idx) => {
      const x = getX(t);
      const y = getY(simulationResult.concentrations2[idx] * 100, 100);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  const pathRisk = simulationResult.timePoints
    .map((t, idx) => {
      const x = getX(t);
      const y = getY(simulationResult.riskScores[idx], 100);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/90 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
              <Brain className="h-4 w-4" />
              <span>4TH-ORDER RUNGE-KUTTA DYNAMICAL PHARMACOKINETICS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-cinzel mt-1">
              Cross-Paradigm ODE Interaction Simulation Lab
            </h2>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <span>Coupled Non-Linear RK4 System:</span>
              <MathRenderer math="\frac{dc_1}{dt} = -k_1 c_1 - \beta c_1 c_2" className="text-amber-300 font-mono text-xs" />
              <span className="text-slate-600">and</span>
              <MathRenderer math="\frac{dc_2}{dt} = -k_2 c_2" className="text-teal-300 font-mono text-xs" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
              simulationResult.severityClass === 'severe'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : simulationResult.severityClass === 'moderate'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : simulationResult.severityClass === 'mild'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              Peak Risk: {simulationResult.peakRiskScore}/100 ({simulationResult.severityClass})
            </span>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono">Quick Presets:</span>
          {presetInteractions.map((p, i) => (
            <button
              key={i}
              onClick={() => loadPreset(p)}
              className="rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 px-2.5 py-1 border border-slate-800 text-[11px] transition font-medium"
            >
              {p.label.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Simulation Workspace (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <Sliders className="h-4 w-4 text-amber-400" /> ODE Parameters
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-mono mb-1">Intervention A (Primary)</label>
              <input
                type="text"
                value={interventionA}
                onChange={(e) => setInterventionA(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 font-mono text-xs focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono mb-1">Intervention B (Secondary / Herbal)</label>
              <input
                type="text"
                value={interventionB}
                onChange={(e) => setInterventionB(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 font-mono text-xs focus:border-indigo-500"
              />
            </div>

            {/* Interaction Strength Beta */}
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-slate-300 font-mono">
                <span>Coupling Coeff (β):</span>
                <span className="text-amber-400 font-bold">{interactionStrength.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.02"
                value={interactionStrength}
                onChange={(e) => setInteractionStrength(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
              <span className="text-[10px] text-slate-500">Degree of competitive clearance or receptor saturation</span>
            </div>

            {/* Staggering Delay */}
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-slate-300 font-mono">
                <span>Staggering Delay (Hours):</span>
                <span className="text-teal-400 font-bold">{staggerOffsetHours}h delay</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="0.5"
                value={staggerOffsetHours}
                onChange={(e) => setStaggerOffsetHours(parseFloat(e.target.value))}
                className="w-full accent-teal-500"
              />
              <span className="text-[10px] text-slate-500">Separates intake times to avoid simultaneous C_max peaks</span>
            </div>

            {/* Elimination Rates */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <label className="text-[10px] text-slate-400 font-mono block">Elimination k₁</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="0.3"
                  value={eliminationRateA}
                  onChange={(e) => setEliminationRateA(parseFloat(e.target.value) || 0.05)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-slate-200 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-mono block">Elimination k₂</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="0.3"
                  value={eliminationRateB}
                  onChange={(e) => setEliminationRateB(parseFloat(e.target.value) || 0.05)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-slate-200 font-mono text-xs"
                />
              </div>
            </div>

            {/* Simulation Timeline */}
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-slate-300 font-mono">
                <span>Simulation Horizon:</span>
                <span className="text-indigo-400 font-bold">{hoursToSimulate} Hours</span>
              </div>
              <input
                type="range"
                min="12"
                max="72"
                step="6"
                value={hoursToSimulate}
                onChange={(e) => setHoursToSimulate(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Trajectory Graph & Pharmacokinetic Outcomes */}
        <div className="lg:col-span-8 space-y-4">
          {/* Chart Container */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                48-Hour Plasma Concentration & Synergistic Risk Curve
              </h4>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  <span className="text-slate-300">C₁(t) Concentration</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
                  <span className="text-slate-300">C₂(t) Concentration</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-300 font-bold">R(t) Interaction Risk</span>
                </div>
              </div>
            </div>

            {/* Responsive SVG Chart */}
            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
                {/* Background Grid Lines */}
                {[0, 25, 50, 75, 100].map((val) => {
                  const y = getY(val, 100);
                  return (
                    <g key={val}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={svgWidth - padding.right}
                        y2={y}
                        stroke="#1e293b"
                        strokeDasharray="4 4"
                      />
                      <text x={padding.left - 8} y={y + 3} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Time Axis Labels */}
                {[0, 6, 12, 18, 24, 30, 36, 42, 48].map((t) => {
                  if (t > maxTime) return null;
                  const x = getX(t);
                  return (
                    <g key={t}>
                      <line x1={x} y1={padding.top} x2={x} y2={padding.top + plotHeight} stroke="#1e293b" strokeDasharray="2 4" />
                      <text x={x} y={padding.top + plotHeight + 16} fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">
                        {t}h
                      </text>
                    </g>
                  );
                })}

                {/* Danger Threshold Zone (>65) */}
                <rect
                  x={padding.left}
                  y={getY(100, 100)}
                  width={plotWidth}
                  height={getY(65, 100) - getY(100, 100)}
                  fill="#f43f5e"
                  fillOpacity="0.06"
                />

                {/* Trajectory Paths */}
                <path d={pathC1} fill="none" stroke="#6366f1" strokeWidth="2.5" />
                <path d={pathC2} fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeDasharray="3 2" />
                <path d={pathRisk} fill="none" stroke="#f43f5e" strokeWidth="3" />

                {/* Peak Marker */}
                {simulationResult.peakRiskTime > 0 && (
                  <circle
                    cx={getX(simulationResult.peakRiskTime)}
                    cy={getY(simulationResult.peakRiskScore, 100)}
                    r="5"
                    fill="#f43f5e"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                )}
              </svg>
            </div>
          </div>

          {/* Pharmacokinetic Outcome Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block">Peak Risk & Timing</span>
              <div className="text-base font-bold text-rose-400 font-mono">
                {simulationResult.peakRiskScore}/100 <span className="text-slate-300 text-xs">@ {simulationResult.peakRiskTime}h</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block">Onset of Mild Risk</span>
              <div className="text-base font-bold text-amber-300 font-mono">
                {simulationResult.timeToMildRisk !== null ? `${simulationResult.timeToMildRisk}h` : 'None detected'}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block">Severe Risk Window</span>
              <div className="text-base font-bold text-teal-300 font-mono">
                {simulationResult.timeToSevereRisk !== null ? `From ${simulationResult.timeToSevereRisk}h` : 'Zero severe events'}
              </div>
            </div>
          </div>

          {/* Clinical Action Protocol Box */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" /> Real-Time Clinical Action Protocol
            </h5>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {simulationResult.clinicalActionProtocol}
            </p>
            <div className="pt-1 text-[11px] text-slate-400 border-t border-amber-500/20">
              <span className="text-amber-300 font-semibold">Mechanism: </span>
              {simulationResult.interactionMechanism}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
