import React, { useState, useMemo } from 'react';
import { medicalConditions, treatmentEvidenceList } from '../data/salusRepositoryData';
import { computeConditionIntelligence } from '../services/pramanaCalculus';
import { MedicalCondition, TreatmentEvidence, PersonaMode, MedicalSystem } from '../types/salus';
import { Activity, ShieldCheck, Filter, Search, BookOpen, ChevronRight, CheckCircle2, AlertTriangle, Sparkles, Database, ExternalLink, Sliders } from 'lucide-react';

interface ClinicalIntelligenceStudioProps {
  selectedPersona: PersonaMode;
  onSelectInterventionForODE?: (intA: string, intB: string) => void;
}

export const ClinicalIntelligenceStudio: React.FC<ClinicalIntelligenceStudioProps> = ({
  selectedPersona,
  onSelectInterventionForODE,
}) => {
  const [selectedConditionId, setSelectedConditionId] = useState<string>(medicalConditions[0].conditionId);
  const [selectedSystemFilter, setSelectedSystemFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('All');
  const [activeEvidenceDetail, setActiveEvidenceDetail] = useState<TreatmentEvidence | null>(null);

  const activeCondition = useMemo(() => {
    return medicalConditions.find((c) => c.conditionId === selectedConditionId) || medicalConditions[0];
  }, [selectedConditionId]);

  const conditionIntelligence = useMemo(() => {
    return computeConditionIntelligence(activeCondition, treatmentEvidenceList, selectedPersona);
  }, [activeCondition, selectedPersona]);

  const filteredEvidence = useMemo(() => {
    return treatmentEvidenceList.filter((e) => {
      if (e.conditionId !== activeCondition.conditionId) return false;
      if (selectedSystemFilter !== 'All' && e.medicalSystem !== selectedSystemFilter) return false;
      if (selectedGradeFilter !== 'All' && e.evidenceGrade !== selectedGradeFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          e.interventionName.toLowerCase().includes(q) ||
          e.clinicalOutcomeSummary.toLowerCase().includes(q) ||
          e.registryIdentifier.toLowerCase().includes(q) ||
          (e.activeIngredients && e.activeIngredients.some((ing) => ing.toLowerCase().includes(q)))
        );
      }
      return true;
    });
  }, [activeCondition, selectedSystemFilter, selectedGradeFilter, searchQuery]);

  return (
    <div className="space-y-6 pb-16">
      {/* Condition Selector & Header Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
              <Activity className="h-4 w-4" />
              <span>SALUS PRAMANA CROSS-SYSTEM CLINICAL INTELLIGENCE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-cinzel mt-1">
              {activeCondition.standardName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400">
              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-indigo-300 font-mono font-semibold border border-indigo-500/30">
                ICD-11: {activeCondition.icd11Code}
              </span>
              <span>•</span>
              <span>Category: <strong className="text-slate-200">{activeCondition.category}</strong></span>
              <span>•</span>
              <span className="text-amber-300 font-mono">Global: {activeCondition.globalPrevalence}</span>
            </div>
          </div>

          {/* Condition Select Dropdown */}
          <div className="w-full lg:w-[280px]">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1">
              Select Clinical Indication
            </label>
            <select
              value={selectedConditionId}
              onChange={(e) => {
                setSelectedConditionId(e.target.value);
                setActiveEvidenceDetail(null);
              }}
              className="w-full bg-slate-950 border border-slate-700 text-sm text-white rounded-xl px-3.5 py-2 focus:outline-none focus:border-indigo-500 font-medium shadow-inner"
            >
              {medicalConditions.map((cond) => (
                <option key={cond.conditionId} value={cond.conditionId}>
                  {cond.standardName} [{cond.icd11Code}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Traditional Nosology & Cross-Tradition Mapping */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wide block">
              Ayurvedic Nosology
            </span>
            <p className="text-slate-200 font-medium mt-0.5">{activeCondition.ayurvedicEquivalent || 'N/A'}</p>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-mono text-teal-400 font-bold uppercase tracking-wide block">
              Siddha Nosology
            </span>
            <p className="text-slate-200 font-medium mt-0.5">{activeCondition.siddhaEquivalent || 'N/A'}</p>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800">
            <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wide block">
              Naturopathic / Mechanistic Vector
            </span>
            <p className="text-slate-200 font-medium mt-0.5">{activeCondition.naturopathicContext || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Aggregate Condition Intelligence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pramana Aggregate Score */}
        <div className="rounded-xl border border-amber-500/30 bg-slate-900/80 p-4 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Pramana Index</span>
            <span className="text-amber-400 font-bold">Bayesian Fusion</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">
              {conditionIntelligence.conditionPramanaScore}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              95% CI [{conditionIntelligence.confidenceInterval95.lower}, {conditionIntelligence.confidenceInterval95.upper}]
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Bayesian Superiority Prob: <strong className="text-amber-300 font-mono">{conditionIntelligence.bayesianProbabilityAboveThreshold}%</strong>
          </p>
        </div>

        {/* Clinical Recommendation Class */}
        <div className="rounded-xl border border-indigo-500/30 bg-slate-900/80 p-4 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Recommendation Class</span>
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            <span className={`px-2.5 py-1 rounded text-sm ${
              conditionIntelligence.decision === 'RECOMMEND'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : conditionIntelligence.decision === 'CONDITIONAL'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {conditionIntelligence.decision}
            </span>
          </div>
          <p className="text-xs text-slate-300 truncate">
            Top Ranked: <strong className="text-indigo-200">{conditionIntelligence.topIntervention}</strong>
          </p>
        </div>

        {/* Governance Gates Status */}
        <div className="rounded-xl border border-emerald-500/30 bg-slate-900/80 p-4 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Governance Gates</span>
            <span className="rounded bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 text-[10px] font-mono font-bold">
              {conditionIntelligence.governanceGates.overallGateStatus}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-300 pt-1">
            <div className="flex items-center gap-1">
              <span className={conditionIntelligence.governanceGates.calibrationPass ? 'text-emerald-400' : 'text-rose-400'}>✓</span>
              <span>Calibration</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={conditionIntelligence.governanceGates.citationCoveragePass ? 'text-emerald-400' : 'text-rose-400'}>✓</span>
              <span>Registry ID</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={conditionIntelligence.governanceGates.intervalReliabilityPass ? 'text-emerald-400' : 'text-rose-400'}>✓</span>
              <span>CI Margin</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={conditionIntelligence.governanceGates.recencyCoveragePass ? 'text-emerald-400' : 'text-rose-400'}>✓</span>
              <span>Recency</span>
            </div>
          </div>
        </div>

        {/* Total Synthesized Evidence */}
        <div className="rounded-xl border border-cyan-500/30 bg-slate-900/80 p-4 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Synthesized Trials</span>
            <Database className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-400 font-mono">
              {conditionIntelligence.evidenceCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">Studies Loaded</span>
          </div>
          <p className="text-xs text-slate-300">
            Across 4 healing paradigms with registry verification.
          </p>
        </div>
      </div>

      {/* Cross-System Parity Comparison Matrix */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
        <h3 className="text-lg font-bold text-white font-cinzel flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-400" />
          Side-by-Side Medical Tradition Comparison
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {conditionIntelligence.systemBreakdown.map((sys) => {
            const colors = {
              Allopathy: 'border-blue-500/30 bg-blue-950/20 text-blue-300',
              Ayurveda: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
              Siddha: 'border-teal-500/30 bg-teal-950/20 text-teal-300',
              Naturopathy: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300',
            }[sys.system];

            return (
              <div key={sys.system} className={`rounded-xl border p-4 space-y-3 ${colors}`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-white">{sys.system}</h4>
                  <span className="text-xs font-mono text-slate-200 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800">
                    {sys.evidenceCount} Trials
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-slate-400 block">Avg Pramana Score:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white font-mono">{sys.averageScore}</span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-[11px] font-mono text-slate-400 block">Top Lead Intervention:</span>
                  <p className="font-semibold text-slate-100 line-clamp-2">{sys.topIntervention}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 text-[10px] font-mono">
                  <span className="text-emerald-300">Gr-A: {sys.gradeDist.A}</span>
                  <span className="text-amber-300">Gr-B: {sys.gradeDist.B}</span>
                  <span className="text-indigo-300">Gr-C: {sys.gradeDist.C}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Evidence Explorer and Score Decomposition Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white font-cinzel">
              Auditable Evidence Ledger & Pramana Decomposition
            </h3>
            <p className="text-xs text-slate-400">
              Inspect step-by-step calculus, design weighting, continuous decay, and verified registry sources
            </p>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* System Filter */}
            <select
              value={selectedSystemFilter}
              onChange={(e) => setSelectedSystemFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Systems</option>
              <option value="Allopathy">Allopathy</option>
              <option value="Ayurveda">Ayurveda</option>
              <option value="Siddha">Siddha</option>
              <option value="Naturopathy">Naturopathy</option>
            </select>

            {/* Grade Filter */}
            <select
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Grades (A, B, C)</option>
              <option value="A">Grade A (RCT / Meta)</option>
              <option value="B">Grade B (Controlled)</option>
              <option value="C">Grade C (Traditional)</option>
            </select>

            {/* Search Box */}
            <div className="relative min-w-[200px]">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search intervention, PMID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Evidence List */}
        <div className="space-y-3">
          {filteredEvidence.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-xs text-slate-400">
              No evidence records found matching current criteria.
            </div>
          ) : (
            filteredEvidence.map((ev) => {
              const contribution = conditionIntelligence.contributions.find((c) => c.evidenceId === ev.evidenceId);
              const score = contribution?.pramanaScore ?? 75;

              return (
                <div
                  key={ev.evidenceId}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          ev.evidenceGrade === 'A'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : ev.evidenceGrade === 'B'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          Grade {ev.evidenceGrade}
                        </span>
                        <span className="rounded bg-slate-900 px-2 py-0.5 text-[11px] font-mono text-slate-300 border border-slate-800">
                          {ev.medicalSystem}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          N={ev.sampleSize.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          Year: {ev.publishedYear}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white pt-0.5">
                        {ev.interventionName}
                      </h4>
                    </div>

                    {/* Pramana Score Badge */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-amber-400 font-mono">
                          {score}
                        </span>
                        <span className="text-xs text-slate-500"> / 100</span>
                        <span className="block text-[10px] font-mono text-slate-400">Pramana Score</span>
                      </div>

                      {onSelectInterventionForODE && (
                        <button
                          onClick={() => onSelectInterventionForODE(ev.interventionName, 'Metformin Hydrochloride (1000–2000 mg/day)')}
                          className="rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 px-2.5 py-1.5 text-xs font-semibold transition"
                          title="Simulate pharmacokinetic interaction"
                        >
                          Simulate ODE
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Outcome Summary */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {ev.clinicalOutcomeSummary}
                  </p>

                  {/* Active Ingredients & Biomarker Targets */}
                  {ev.activeIngredients && ev.activeIngredients.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="text-slate-400 text-[11px] font-mono">Phytochemical / Molecular Target:</span>
                      {ev.activeIngredients.map((ing, i) => (
                        <span key={i} className="rounded bg-slate-900 px-2 py-0.5 text-[11px] font-mono text-slate-300 border border-slate-800">
                          {ing}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Contraindications and Warnings */}
                  {(ev.contraindications.length > 0 || ev.interactionWarnings.length > 0) && (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-2.5 space-y-1 text-xs">
                      {ev.contraindications.length > 0 && (
                        <div className="flex items-start gap-1.5 text-amber-300">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-400" />
                          <span><strong>Contraindications:</strong> {ev.contraindications.join('; ')}</span>
                        </div>
                      )}
                      {ev.interactionWarnings.length > 0 && (
                        <div className="flex items-start gap-1.5 text-amber-200">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-400" />
                          <span><strong>Interaction Warnings:</strong> {ev.interactionWarnings.join('; ')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Source Registry & Mathematical Breakdown Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-3">
                      <a
                        href={ev.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline font-bold"
                      >
                        {ev.registryIdentifier}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <span>Method: <strong className="text-slate-300">{ev.studyMethodology}</strong></span>
                      <span>p-value: <strong className="text-emerald-400">{ev.pValueOfOutcome}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Bias: <strong className="text-slate-300">{ev.riskOfBias}</strong></span>
                      <span>•</span>
                      <span className="text-slate-500">Decay: <strong className="text-slate-300">{contribution?.recencyWeight ?? 0.85}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
