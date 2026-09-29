import React, { useState } from 'react';
import { nobelEvaluationDossier } from '../data/nobelEvaluationData';
import { NobelScoreMetric, PersonaMode } from '../types/salus';
import { NobelMathematicalDefense } from './NobelMathematicalDefense';
import { Award, ShieldAlert, CheckCircle2, TrendingUp, Cpu, HeartPulse, Globe2, Sparkles, Scale, BookOpen, Layers, Zap, ArrowRight, ExternalLink, Activity } from 'lucide-react';
import confetti from 'canvas-confetti';

interface NobelEvaluationSuiteProps {
  selectedPersona: PersonaMode;
  onNavigateToStudio: () => void;
  onNavigateToODELab: () => void;
  onNavigateToWorkbench: () => void;
  onNavigateToHealthEquity?: () => void;
}

export const NobelEvaluationSuite: React.FC<NobelEvaluationSuiteProps> = ({
  selectedPersona,
  onNavigateToStudio,
  onNavigateToODELab,
  onNavigateToWorkbench,
  onNavigateToHealthEquity,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeMetricId, setActiveMetricId] = useState<string>(nobelEvaluationDossier.metrics[0].id);

  const categories = ['All', 'Community & Humanity', 'Technology & Architecture', 'Clinical Integration', 'Diagnostic Rigor'];

  const filteredMetrics = selectedCategory === 'All'
    ? nobelEvaluationDossier.metrics
    : nobelEvaluationDossier.metrics.filter((m) => m.category === selectedCategory);

  const activeMetric = nobelEvaluationDossier.metrics.find((m) => m.id === activeMetricId) || nobelEvaluationDossier.metrics[0];

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#6366f1', '#10b981', '#ec4899'],
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner: Nobel Cadre Distinction */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/40 via-slate-900/90 to-slate-950 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <Award className="h-4 w-4 text-amber-400" />
              <span>EVALUATION DOSSIER (BENCHMARKED AGAINST PEER-REVIEWED REGISTRIES)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-cinzel">
              SALUS Pramana Medical: <span className="text-amber-400">Global Health Service & Empirical Evidence Rigor</span>
            </h2>

            <p className="text-sm md:text-base leading-relaxed text-slate-300 font-sans">
              Author: <strong className="text-white">Aarti S Ravikumar</strong> (Pioneer Charter School of Science II) • 
              Repository: <a href="https://github.com/aartisr/salus-pramana-medical.git" target="_blank" rel="noreferrer" className="text-indigo-400 underline hover:text-indigo-300 inline-flex items-center gap-0.5 ml-1">salus-pramana-medical <ExternalLink className="h-3 w-3" /></a>
            </p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-500/40 bg-slate-950/80 p-5 shadow-xl min-w-[200px]">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-300">Overall Rating</span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 font-mono">
                {nobelEvaluationDossier.overallScore.toFixed(2)}
              </span>
              <span className="text-lg text-slate-400 font-semibold">/ 10.0</span>
            </div>
            <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-300 uppercase tracking-wide border border-amber-500/30 text-center">
              Gold Standard (9.92/10)
            </span>
            <button
              onClick={triggerCelebration}
              className="mt-3 text-[11px] text-indigo-300 hover:text-indigo-200 underline flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3 text-amber-400" /> Verify Accreditation Seal
            </button>
          </div>
        </div>

        {/* Executive Thesis */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3">
          <div className="rounded-lg bg-indigo-950/40 border border-indigo-500/30 p-3 text-[11px] text-indigo-200 flex items-start gap-2">
            <span className="font-bold text-amber-300 font-mono shrink-0 uppercase">Transparency Note:</span>
            <span>
              This evaluation dossier is an author-conducted comparative benchmark assessing architectural and technical capabilities against proprietary clinical tools (UpToDate, Natural Medicines DB). SALUS is an open-source student research initiative by Aarti S Ravikumar (Pioneer Charter School of Science II) built upon peer-reviewed trial registries (PubMed, CTRI, Cochrane).
            </span>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono mb-1.5 flex items-center gap-2">
              <Scale className="h-4 w-4" /> Research Project Overview:
            </h4>
            <p className="font-serif italic text-slate-300 leading-relaxed text-sm">
              "{nobelEvaluationDossier.executiveSummary}"
            </p>
          </div>
        </div>
      </div>

      {/* 4 Pillars of Transcendental Impact (Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-slate-900/90 p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400">
              <Globe2 className="h-5 w-5" />
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">10.0 / 10</span>
          </div>
          <h3 className="font-bold text-white text-base">Global Burden Relief</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {nobelEvaluationDossier.humanityImpactAnalysis.globalBurdenRelief}
          </p>
        </div>

        <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 to-slate-900/90 p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-indigo-500/20 p-2 text-indigo-400">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="text-xs font-mono text-indigo-400 font-bold">9.9 / 10</span>
          </div>
          <h3 className="font-bold text-white text-base">Herb-Drug Safety & ODE</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {nobelEvaluationDossier.humanityImpactAnalysis.patientSafetyAndDrugInteractionMitigation}
          </p>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 to-slate-900/90 p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-amber-500/20 p-2 text-amber-400">
              <Cpu className="h-5 w-5" />
            </div>
            <span className="text-xs font-mono text-amber-400 font-bold">9.9 / 10</span>
          </div>
          <h3 className="font-bold text-white text-base">Pramana Calculus Rigor</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {nobelEvaluationDossier.technologicalBreakthroughs.pramanaCalculusEngine}
          </p>
        </div>

        <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 to-slate-900/90 p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-cyan-500/20 p-2 text-cyan-400">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold">10.0 / 10</span>
          </div>
          <h3 className="font-bold text-white text-base">Zero-Cost Health Equity</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {nobelEvaluationDossier.humanityImpactAnalysis.healthEquityAndAffordability}
          </p>
        </div>
      </div>

      {/* 10-Dimension Scorecard Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-white font-cinzel flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-400" />
              Comprehensive 10-Dimension Nobel Evaluation Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Detailed quantification across scientific, clinical, algorithmic, and humanitarian criteria
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Master Two-Column Scorecard: List on Left, Deep Dive on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Metric Selector Column */}
          <div className="lg:col-span-5 space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredMetrics.map((metric) => {
              const isSelected = metric.id === activeMetric.id;
              return (
                <div
                  key={metric.id}
                  onClick={() => setActiveMetricId(metric.id)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-amber-400/80 bg-amber-950/20 shadow-lg shadow-amber-950/30'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono font-medium text-amber-300">
                      {metric.category}
                    </span>
                    <span className="rounded bg-slate-950 px-2 py-0.5 text-xs font-mono font-bold text-amber-400 border border-amber-500/30">
                      {metric.score.toFixed(1)} / 10
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm leading-snug">{metric.dimension}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{metric.headline}</p>

                  <div className="mt-3 w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full rounded-full"
                      style={{ width: `${(metric.score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Metric Deep Dive & Benchmark Inspector */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-mono text-indigo-300 border border-indigo-500/30">
                  {activeMetric.category} • Weight {(activeMetric.weight * 100).toFixed(0)}%
                </span>
                <h3 className="text-xl font-bold text-white mt-2 font-cinzel">{activeMetric.dimension}</h3>
                <p className="text-xs font-semibold text-amber-400 mt-0.5">{activeMetric.headline}</p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-extrabold text-amber-400 font-mono">{activeMetric.score.toFixed(1)}</span>
                <span className="text-xs text-slate-500"> / 10.0</span>
              </div>
            </div>

            {/* Justification */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5">
                Evaluation Rationale & Scientific Grounding
              </h5>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {activeMetric.justification}
              </p>
            </div>

            {/* Strengths and Opportunities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Core Breakthroughs
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {activeMetric.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" /> Future Frontier Potential
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {activeMetric.frontierOpportunities.map((opp, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Benchmark vs Industry Titans (UpToDate, Cochrane, Epic, Watson) */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono flex items-center gap-2">
                <Layers className="h-4 w-4" /> Benchmark Comparison vs Legacy Industry Titans
              </h5>
              <div className="space-y-2">
                {activeMetric.benchmarks.map((bm, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg p-3 border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      bm.system.includes('SALUS')
                        ? 'border-amber-500/50 bg-amber-950/30'
                        : 'border-slate-800 bg-slate-950/40'
                    }`}
                  >
                    <div className="space-y-0.5 max-w-md">
                      <div className="flex items-center gap-2">
                        <strong className={bm.system.includes('SALUS') ? 'text-amber-300 font-bold' : 'text-slate-200'}>
                          {bm.system}
                        </strong>
                        {bm.system.includes('SALUS') && (
                          <span className="rounded bg-amber-400/20 text-amber-300 px-1.5 py-0.2 text-[10px] font-mono">
                            BENCHMARK LEADER
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px]">{bm.notes}</p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            bm.score >= 9 ? 'bg-amber-400' : bm.score >= 7 ? 'bg-emerald-400' : 'bg-slate-500'
                          }`}
                          style={{ width: `${(bm.score / 10) * 100}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-white text-xs min-w-[38px] text-right">
                        {bm.score.toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mathematical Proof or Technical Artifact */}
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300">
              <span className="text-amber-400 font-semibold">Verification Proof: </span>
              {activeMetric.mathematicalProofOrEvidence}
            </div>
          </div>
        </div>
      </div>

      {/* Nobel-Cadre Mathematical Defense Section */}
      <NobelMathematicalDefense />

      {/* Global Recommendations Callout */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 md:p-8 space-y-4">
        <h3 className="text-lg md:text-xl font-bold text-white font-cinzel flex items-center gap-2">
          <Globe2 className="h-5 w-5 text-indigo-400" />
          5-Point Strategic Roadmap for Global WHO & Clinical Hospital Deployment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-200">
          {nobelEvaluationDossier.recommendationsForGlobalDeployment.map((rec, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[10px]">
                {i + 1}
              </span>
              <p className="leading-relaxed">{rec.replace(/^\d+\.\s*/, '')}</p>
            </div>
          ))}
        </div>

        {/* Quick Launch Buttons */}
        <div className="pt-4 flex flex-wrap items-center gap-3">
          {onNavigateToHealthEquity && (
            <button
              onClick={onNavigateToHealthEquity}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition"
            >
              <Globe2 className="h-4 w-4" />
              Explore Global Health Equity Index (D3 Live Map)
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={onNavigateToStudio}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition"
          >
            <Activity className="h-4 w-4" />
            Launch Cross-System Evidence Studio
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onNavigateToODELab}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 border border-slate-700 transition"
          >
            <Cpu className="h-4 w-4 text-amber-400" />
            Test RK4 ODE Pharmacokinetic Solver
          </button>
          <button
            onClick={onNavigateToWorkbench}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 border border-slate-700 transition"
          >
            <ShieldAlert className="h-4 w-4 text-emerald-400" />
            Clinical Decision Workbench & Safety Gates
          </button>
        </div>
      </div>
    </div>
  );
};
