import React, { useState, useMemo } from 'react';
import { medicalConditions, treatmentEvidenceList } from '../data/salusRepositoryData';
import { calculateDoseCandidates } from '../services/doseResponseOptimizer';
import { WorkspaceGuide } from './WorkspaceGuide';
import { PersonaMode } from '../types/salus';
import { ShieldCheck, UserCheck, AlertOctagon, Sparkles, Sliders, CheckCircle2, AlertTriangle, ArrowRight, HeartHandshake } from 'lucide-react';

interface DiagnosticDecisionWorkbenchProps {
  selectedPersona: PersonaMode;
}

export const DiagnosticDecisionWorkbench: React.FC<DiagnosticDecisionWorkbenchProps> = ({
  selectedPersona,
}) => {
  const isPatientLens = selectedPersona === 'patient';
  const isClinicianLens = selectedPersona === 'clinician';
  const [selectedConditionId, setSelectedConditionId] = useState<string>(medicalConditions[0].conditionId);
  const [patientAge, setPatientAge] = useState<number>(54);
  const [patientEGFR, setPatientEGFR] = useState<number>(68);
  const [isPregnant, setIsPregnant] = useState<boolean>(false);
  const [selectedInterventionIds, setSelectedInterventionIds] = useState<string[]>([
    'ev-metformin-1',
    'ev-berberine-1',
  ]);

  const activeCondition = useMemo(() => {
    return medicalConditions.find((c) => c.conditionId === selectedConditionId) || medicalConditions[0];
  }, [selectedConditionId]);

  const conditionEvidence = useMemo(() => {
    return treatmentEvidenceList.filter((e) => e.conditionId === activeCondition.conditionId);
  }, [activeCondition]);

  const toggleIntervention = (id: string) => {
    setSelectedInterventionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectedTreatments = useMemo(() => {
    return treatmentEvidenceList.filter((e) => selectedInterventionIds.includes(e.evidenceId));
  }, [selectedInterventionIds]);

  // Real-time Contraindication & Safety Engine
  const safetyAudit = useMemo(() => {
    const alerts: { level: 'critical' | 'warning' | 'advisory'; text: string; source: string }[] = [];

    // Renal check
    if (patientEGFR < 30) {
      if (selectedInterventionIds.includes('ev-metformin-1')) {
        alerts.push({
          level: 'critical',
          text: 'CRITICAL RENAL CONTRAINDICATION: Metformin contraindicated at eGFR < 30 mL/min due to elevated lactic acidosis mortality.',
          source: 'FDA Boxed Warning & UKPDS 34',
        });
      }
      if (selectedInterventionIds.includes('ev-dash-diet-1')) {
        alerts.push({
          level: 'critical',
          text: 'HIGH POTASSIUM RISK: DASH high-potassium feeding restricted in advanced renal failure (risk of fatal hyperkalemia).',
          source: 'Nephrology Clinical Guidelines',
        });
      }
    } else if (patientEGFR < 45) {
      if (selectedInterventionIds.includes('ev-metformin-1')) {
        alerts.push({
          level: 'warning',
          text: 'RENAL DOSE TITRATION: eGFR 30–45 mL/min requires max metformin dosage ceiling of 1000 mg/day.',
          source: 'Clinical Pharmacology Advisory',
        });
      }
    }

    // Pregnancy check
    if (isPregnant) {
      if (selectedInterventionIds.includes('ev-berberine-1')) {
        alerts.push({
          level: 'critical',
          text: 'PREGNANCY CONTRAINDICATION: Berberine displaces bilirubin from albumin, posing risk of neonatal kernicterus.',
          source: 'Ayurvedic Pharmacopoeia & Reproductive Toxicology',
        });
      }
    }

    // Herb-Drug Synergistic Interaction check
    if (selectedInterventionIds.includes('ev-metformin-1') && selectedInterventionIds.includes('ev-berberine-1')) {
      alerts.push({
        level: 'warning',
        text: 'DUAL AMPK & OCT-1 INHIBITION: Metformin + Berberine co-administration causes additive hypoglycemic drop and competitive organic cation transporter saturation. Stagger by 2.5 hours.',
        source: 'SALUS Pramana ODE Solver Engine',
      });
    }

    if (selectedInterventionIds.includes('ev-escitalopram-1') && selectedInterventionIds.includes('ev-ashwagandha-ksm66-1')) {
      alerts.push({
        level: 'advisory',
        text: 'GABAERGIC POTENTIATION: Ashwagandha enhances central calming; monitor for mild daytime somnolence during initial 7 days.',
        source: 'Neuropsychiatric Integrative Ledger',
      });
    }

    return alerts;
  }, [patientEGFR, isPregnant, selectedInterventionIds]);

  // Dose Optimization for Primary Selected Drug
  const leadTreatment = selectedTreatments[0] || conditionEvidence[0];
  const doseCandidates = useMemo(() => {
    if (!leadTreatment) return [];
    return calculateDoseCandidates(
      leadTreatment.interventionName,
      leadTreatment.isPharmacological ? 'mg/day' : 'mins/day',
      leadTreatment.isPharmacological ? 200 : 15,
      leadTreatment.isPharmacological ? 2000 : 90,
      8
    );
  }, [leadTreatment]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>POINT-OF-CARE CLINICAL DECISION SUPPORT</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-cinzel mt-1">
              {isPatientLens ? 'Review treatment safety questions' : isClinicianLens ? 'Build a clinical safety review' : 'Assess a simulated regimen, step by step'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isPatientLens ? 'Choose the treatments you want to discuss, then review possible warnings to bring to a qualified clinician or pharmacist.' : isClinicianLens ? 'Review patient factors, selected interventions, contraindications, and modelled dose-response boundaries in one auditable workspace.' : 'Set simulated patient factors, choose interventions, and review the safety scan before exploring dose-response scenarios.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-mono text-slate-300 border border-slate-800">
              Active Patient: <strong className="text-emerald-400">Profile #482-B</strong>
            </span>
          </div>
        </div>
      </div>

      <WorkspaceGuide
        title={isClinicianLens ? 'Review patient factors, safety signals, and provenance' : 'Build a profile, select a regimen, then check safety'}
        steps={isClinicianLens ? [
          'Confirm the simulated renal, age, and pregnancy context before interpreting any alert.',
          'Select only the interventions under review, then inspect every contraindication and source.',
          'Use dose-response output as a model boundary—not a prescription—and document clinical judgment separately.',
        ] : [
          'Set the simulated patient factors and clinical indication.',
          'Choose only the interventions you intend to evaluate together.',
          'Review the safety scan before considering dose-response scenarios.',
        ]}
        boundary="The patient profile is simulated. Do not use this workspace to make a real treatment decision."
      />

      {isClinicianLens ? <div className="rounded-xl border border-indigo-500/35 bg-indigo-950/20 px-4 py-3 text-sm text-slate-200"><strong className="text-indigo-300">Clinical review mode:</strong> safety signals and source-level uncertainty inform review; they do not replace local protocols, medication reconciliation, or clinical judgment.</div> : null}

      {/* Main Grid: Patient Profile & Regimen Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patient Profile & Condition Selector */}
        <div className="lg:col-span-4 space-y-4">
          {/* Patient Biomarker Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-400" /> Patient Biomarkers
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Clinical Indication</label>
                <select
                  value={selectedConditionId}
                  onChange={(e) => {
                    setSelectedConditionId(e.target.value);
                    setSelectedInterventionIds([]);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 font-medium"
                >
                  {medicalConditions.map((c) => (
                    <option key={c.conditionId} value={c.conditionId}>
                      {c.standardName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Age Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-slate-300">
                  <span>Age:</span>
                  <span className="text-amber-400 font-bold">{patientAge} Years</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="90"
                  value={patientAge}
                  onChange={(e) => setPatientAge(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* eGFR Renal Clearance */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-slate-300">
                  <span>eGFR (Renal Clearance):</span>
                  <span className={`font-bold ${patientEGFR < 30 ? 'text-rose-400' : patientEGFR < 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {patientEGFR} mL/min
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="120"
                  value={patientEGFR}
                  onChange={(e) => setPatientEGFR(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <span className="text-[10px] text-slate-500">
                  {patientEGFR < 30 ? 'Stage 4/5 CKD (Severe)' : patientEGFR < 60 ? 'Moderate CKD' : 'Normal Renal Function'}
                </span>
              </div>

              {/* Pregnancy Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-300 font-mono">Pregnancy / Lactation:</span>
                <button
                  type="button"
                  onClick={() => setIsPregnant(!isPregnant)}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition ${
                    isPregnant ? 'bg-rose-500 text-white' : 'bg-slate-950 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isPregnant ? 'YES (Active)' : 'NO'}
                </button>
              </div>
            </div>
          </div>

          {/* Intervention Checklist for Condition */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Assemble Regimen Candidates
            </h3>
            <p className="text-xs text-slate-400">Select multi-tradition interventions to evaluate safety profile</p>

            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {conditionEvidence.map((ev) => {
                const isChecked = selectedInterventionIds.includes(ev.evidenceId);
                return (
                  <div
                    key={ev.evidenceId}
                    onClick={() => toggleIntervention(ev.evidenceId)}
                    className={`cursor-pointer rounded-xl border p-3 text-xs transition ${
                      isChecked
                        ? 'border-indigo-500/80 bg-indigo-950/30 text-white'
                        : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-indigo-300">{ev.medicalSystem}</span>
                      <span className="font-mono text-[10px] text-amber-400">Grade {ev.evidenceGrade}</span>
                    </div>
                    <div className="font-semibold">{ev.interventionName}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Safety Alerts & Dose-Response Optimization */}
        <div className="lg:col-span-8 space-y-5">
          {/* Real-time Safety Alerts Panel */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-amber-400" />
              Real-Time Safety & Contraindication Scan
            </h3>

            {safetyAudit.length === 0 ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex items-center gap-3 text-emerald-300 text-xs">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                <span>Zero clinical contraindications or high-risk pharmacokinetic collisions detected for this profile.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {safetyAudit.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border p-3.5 text-xs space-y-1 ${
                      alert.level === 'critical'
                        ? 'border-rose-500/50 bg-rose-950/30 text-rose-200'
                        : alert.level === 'warning'
                        ? 'border-amber-500/50 bg-amber-950/30 text-amber-200'
                        : 'border-blue-500/50 bg-blue-950/30 text-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className="uppercase">{alert.level} ALERT</span>
                      <span className="text-[10px] opacity-80">{alert.source}</span>
                    </div>
                    <p className="leading-relaxed">{alert.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hill Equation Sigmoidal Dose-Response Optimizer */}
          {isPatientLens ? (
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 text-sm text-slate-200">
              <h3 className="font-cinzel font-bold text-white">Dose decisions stay with your clinical team</h3>
              <p className="mt-2 leading-relaxed">This view intentionally does not present dose recommendations. Use the safety scan above to prepare questions for a clinician or pharmacist.</p>
            </div>
          ) : leadTreatment && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-indigo-400">Sigmoidal Emax Model</span>
                  <h3 className="text-base font-bold text-white font-cinzel">
                    Dose-Response & Net Benefit Frontier: {leadTreatment.interventionName}
                  </h3>
                </div>
                <span className="rounded bg-indigo-500/20 text-indigo-300 px-2.5 py-1 text-xs font-mono border border-indigo-500/30">
                  Hill Efficacy (γ=1.8)
                </span>
              </div>

              {/* Candidate Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                      <th className="pb-2">Dose Candidate</th>
                      <th className="pb-2 text-emerald-400">Efficacy %</th>
                      <th className="pb-2 text-rose-400">Toxicity Risk %</th>
                      <th className="pb-2 text-amber-400">Net Benefit</th>
                      <th className="pb-2">Therapeutic Index</th>
                      <th className="pb-2 text-right">Optimization Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {doseCandidates.map((c, i) => (
                      <tr
                        key={i}
                        className={`transition ${c.isOptimal ? 'bg-amber-500/10 text-white font-bold' : 'text-slate-300'}`}
                      >
                        <td className="py-2.5">
                          {c.dose} {c.unit}
                        </td>
                        <td className="py-2.5 text-emerald-400">{c.predictedEfficacy}%</td>
                        <td className="py-2.5 text-rose-400">{c.predictedToxicityRisk}%</td>
                        <td className="py-2.5 text-amber-400 font-bold">{c.netBenefitScore}</td>
                        <td className="py-2.5 text-slate-400">{c.therapeuticIndex}</td>
                        <td className="py-2.5 text-right">
                          {c.isOptimal ? (
                            <span className="rounded-full bg-amber-400 text-slate-950 px-2 py-0.5 text-[10px] font-bold">
                              OPTIMAL FRONTIER
                            </span>
                          ) : (
                            <span className="text-slate-600 text-[10px]">Sub-optimal</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
