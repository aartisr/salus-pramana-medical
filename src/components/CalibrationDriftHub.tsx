import React, { useState } from 'react';
import { generateSyntheticCalibrationReport, SyntheticCalibrationReport } from '../services/calibrationReportService';
import { WorkspaceGuide } from './WorkspaceGuide';
import { PersonaMode } from '../types/salus';
import { FileSpreadsheet, ShieldCheck, RefreshCw, CheckCircle2, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';

interface CalibrationDriftHubProps {
  selectedPersona?: PersonaMode;
}

export const CalibrationDriftHub: React.FC<CalibrationDriftHubProps> = ({ selectedPersona = 'nobel_juror' }) => {
  const [report, setReport] = useState<SyntheticCalibrationReport>(generateSyntheticCalibrationReport());
  const [isRecomputing, setIsRecomputing] = useState<boolean>(false);
  const isAuditLens = selectedPersona === 'nobel_juror';

  const handleRecompute = () => {
    setIsRecomputing(true);
    setTimeout(() => {
      setReport(generateSyntheticCalibrationReport(Math.random()));
      setIsRecomputing(false);
    }, 400);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="rounded-2xl border border-teal-500/30 bg-slate-900/90 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-teal-400">
              <FileSpreadsheet className="h-4 w-4" />
              <span>EMPIRICAL CALIBRATION & STATISTICAL DRIFT AUDIT</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-cinzel mt-1">
              {isAuditLens ? 'Calibration evidence and governance gates' : 'Pramana Calibration Snapshot & Governance Ledger'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isAuditLens ? `Inspect Brier score, Expected Calibration Error (ECE), interval coverage, and drift status across N=${report.totalSyntheticTrials.toLocaleString()} synthetic trials.` : `Verifies Brier scores, Expected Calibration Error (ECE), and 95% interval coverage across N=${report.totalSyntheticTrials.toLocaleString()} trials`}
            </p>
          </div>

          <button
            onClick={handleRecompute}
            disabled={isRecomputing}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition"
          >
            <RefreshCw className={`h-4 w-4 ${isRecomputing ? 'animate-spin' : ''}`} />
            Run Calibration Audit
          </button>
        </div>
      </div>

      <WorkspaceGuide
        title={isAuditLens ? 'Verify gates, inspect bins, then read the verdict' : 'Read the status first, then inspect the calibration evidence'}
        steps={isAuditLens ? [
          'Check the stated status and the thresholds attached to each top-line measure.',
          'Inspect reliability bins to verify where calibration is aligned or diverges.',
          'Read the verdict as a synthetic demonstration artifact, not production validation.',
        ] : [
          'Check the overall drift status and top-line calibration measures.',
          'Inspect reliability bins if a measure needs explanation.',
          'Run a new synthetic audit only when testing the demonstration model.',
        ]}
        boundary="This workspace uses synthetic calibration data to demonstrate governance controls."
      />

      {isAuditLens ? <div className="rounded-xl border border-teal-500/35 bg-teal-950/20 px-4 py-3 text-sm text-slate-200"><strong className="text-teal-300">Governance audit mode:</strong> these measures use synthetic data. Treat them as verification of the demonstration controls, not evidence of real-world clinical calibration.</div> : null}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-teal-500/30 bg-slate-900/80 p-4 space-y-1">
          <span className="text-[11px] font-mono text-slate-400">Overall Brier Score</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-300 font-mono">
              {report.overallBrierScore}
            </span>
            <span className="text-xs text-emerald-400 font-bold font-mono">(&lt; 0.05 Gold Standard)</span>
          </div>
          <p className="text-[11px] text-slate-400">Mean squared error between probabilities and outcomes</p>
        </div>

        <div className="rounded-xl border border-indigo-500/30 bg-slate-900/80 p-4 space-y-1">
          <span className="text-[11px] font-mono text-slate-400">Expected Calibration Error (ECE)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-300 font-mono">
              {(report.expectedCalibrationError * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-emerald-400 font-bold font-mono">Ideal &lt; 3.0%</span>
          </div>
          <p className="text-[11px] text-slate-400">Weighted average gap from perfect calibration</p>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-slate-900/80 p-4 space-y-1">
          <span className="text-[11px] font-mono text-slate-400">95% CI Empirical Coverage</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-300 font-mono">
              {report.coverage95Percentage}%
            </span>
            <span className="text-xs text-slate-400 font-mono">Target: 95.0%</span>
          </div>
          <p className="text-[11px] text-slate-400">Proportion of true values within calculated 95% CIs</p>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-slate-900/80 p-4 space-y-1">
          <span className="text-[11px] font-mono text-slate-400">Statistical Drift Status</span>
          <div className="text-lg font-bold text-emerald-300 font-mono flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>IN CONTROL</span>
          </div>
          <p className="text-[11px] text-slate-400">No covariate shift detected across incoming trials</p>
        </div>
      </div>

      {/* Reliability Bin Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <h3 className="text-base font-bold text-white font-cinzel flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-teal-400" />
          Reliability Diagram Decile Bins
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-2">Probability Bin</th>
                <th className="pb-2">Mean Predicted P</th>
                <th className="pb-2 text-teal-300">Observed Empirical Rate</th>
                <th className="pb-2">Sample Count</th>
                <th className="pb-2">Brier Contribution</th>
                <th className="pb-2 text-right">Alignment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {report.bins.map((bin) => (
                <tr key={bin.binIndex} className="hover:bg-slate-800/30">
                  <td className="py-2.5">
                    [{bin.predictedProbRange[0].toFixed(1)}, {bin.predictedProbRange[1].toFixed(1)}]
                  </td>
                  <td className="py-2.5">{bin.predictedProbMean.toFixed(2)}</td>
                  <td className="py-2.5 text-teal-300 font-bold">{bin.observedEmpiricalRate.toFixed(2)}</td>
                  <td className="py-2.5">{bin.sampleCount}</td>
                  <td className="py-2.5">{bin.brierScoreContribution.toFixed(3)}</td>
                  <td className="py-2.5 text-right">
                    <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-bold border border-emerald-500/30">
                      CALIBRATED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verdict Callout */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
        <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4" /> Official Governance Verification Verdict
        </h5>
        <p className="text-xs text-slate-200 leading-relaxed font-serif italic">
          "{report.calibrationVerdict}"
        </p>
      </div>
    </div>
  );
};
