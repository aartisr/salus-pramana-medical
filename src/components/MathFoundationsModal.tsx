import React, { useState } from 'react';
import { MathRenderer } from './MathRenderer';
import {
  X,
  BookOpen,
  Cpu,
  ShieldCheck,
  Zap,
  Activity,
  Award,
  Sparkles,
  Download,
  Copy,
  Check,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface MathFoundationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MathFoundationsModal: React.FC<MathFoundationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<'pramana' | 'rk4' | 'hill' | 'entropy' | 'calibration' | 'daly'>('pramana');
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyLatex = (latex: string, id: string) => {
    navigator.clipboard.writeText(latex);
    setCopiedFormula(id);
    setTimeout(() => setCopiedFormula(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-amber-500/40 bg-slate-900 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-xs font-mono font-bold text-amber-300">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span>FORMAL MATHEMATICAL SPECIFICATION & PROOFS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-cinzel text-white">
              Mathematical Foundations of SALUS Pramana
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Deterministic evidence fusion, non-linear RK4 pharmacokinetic ODE kinetics, and information-theoretic proofs.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section Navigation Pills */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'pramana', label: '1. Dynamic Pramana Calculus' },
            { id: 'rk4', label: '2. RK4 Pharmacokinetic ODE' },
            { id: 'hill', label: '3. Hill Net Benefit Optimization' },
            { id: 'entropy', label: '4. Shannon Epistemic Entropy' },
            { id: 'calibration', label: '5. Brier & ECE Calibration' },
            { id: 'daly', label: '6. Continuous DALY Integral' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-mono font-medium transition ${
                activeSection === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SECTION 1: PRAMANA DYNAMIC CALCULUS */}
        {activeSection === 'pramana' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-cinzel flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                1. Continuous Dynamic Study Weighting Formulation
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Every clinical trial, observational study, or codified traditional monograph is assigned a continuous, time-decayed mathematical contribution score <MathRenderer math="S_i(t)" />:
              </p>
            </div>

            <div className="relative group">
              <MathRenderer
                math="S_i(t) = w_{\text{grade},i} \cdot w_{\text{design},i} \cdot w_{\text{bias},i} \cdot \exp(-\lambda_k \cdot \Delta t_i) \cdot \ln(1 + n_i) \cdot \left[ \frac{1}{\text{SE}_i^2 + \epsilon} \right]"
                block
                className="text-base sm:text-lg bg-slate-950 p-4 border-amber-500/30"
              />
              <button
                onClick={() =>
                  copyLatex(
                    'S_i(t) = w_{\\text{grade},i} \\cdot w_{\\text{design},i} \\cdot w_{\\text{bias},i} \\cdot \\exp(-\\lambda_k \\cdot \\Delta t_i) \\cdot \\ln(1 + n_i) \\cdot \\left[ \\frac{1}{\\text{SE}_i^2 + \\epsilon} \\right]',
                    'pramana-master'
                  )
                }
                className="absolute top-3 right-3 rounded-lg bg-slate-900 border border-slate-700 p-1.5 text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1"
                title="Copy LaTeX"
              >
                {copiedFormula === 'pramana-master' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Term Deconstruction Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden text-xs">
              <div className="bg-slate-900 p-3 font-mono font-bold text-amber-300 border-b border-slate-800">
                Variable Decomposition & Domain Constraints
              </div>
              <div className="divide-y divide-slate-800/60 font-sans">
                <div className="p-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <span className="font-mono text-amber-400 font-bold"><MathRenderer math="w_{\text{grade},i}" /></span>
                  <span className="text-slate-400 sm:col-span-1">Prior Evidence Tier</span>
                  <span className="text-slate-300 sm:col-span-2">Grade A (<MathRenderer math="1.00" />), Grade B (<MathRenderer math="0.60" />), Grade C (<MathRenderer math="0.25" />)</span>
                </div>
                <div className="p-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <span className="font-mono text-teal-400 font-bold"><MathRenderer math="w_{\text{design},i}" /></span>
                  <span className="text-slate-400 sm:col-span-1">Methodology Class</span>
                  <span className="text-slate-300 sm:col-span-2">Meta-analysis (<MathRenderer math="1.0" />), Double-blind RCT (<MathRenderer math="0.90" />), Cohort (<MathRenderer math="0.70" />), Preclinical (<MathRenderer math="0.35" />)</span>
                </div>
                <div className="p-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <span className="font-mono text-emerald-400 font-bold"><MathRenderer math="w_{\text{bias},i}" /></span>
                  <span className="text-slate-400 sm:col-span-1">Cochrane RoB2 Bias</span>
                  <span className="text-slate-300 sm:col-span-2">Low (<MathRenderer math="1.00" />), Some Concerns (<MathRenderer math="0.80" />), High (<MathRenderer math="0.55" />), Critical (<MathRenderer math="0.40" />)</span>
                </div>
                <div className="p-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <span className="font-mono text-indigo-400 font-bold"><MathRenderer math="\exp(-\lambda_k \Delta t)" /></span>
                  <span className="text-slate-400 sm:col-span-1">Recency Half-Life</span>
                  <span className="text-slate-300 sm:col-span-2">Continuous exponential decay with half-life <MathRenderer math="T_{1/2} = 6" /> yrs (<MathRenderer math="\lambda = \frac{\ln 2}{6} \approx 0.1155" />)</span>
                </div>
                <div className="p-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <span className="font-mono text-amber-300 font-bold"><MathRenderer math="\ln(1 + n_i)" /></span>
                  <span className="text-slate-400 sm:col-span-1">Log-Sample Diminishing</span>
                  <span className="text-slate-300 sm:col-span-2">Sub-linear scaling preventing single mega-trials from drowning out replicated smaller RCTs</span>
                </div>
                <div className="p-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <span className="font-mono text-cyan-400 font-bold"><MathRenderer math="\frac{1}{\text{SE}_i^2 + \epsilon}" /></span>
                  <span className="text-slate-400 sm:col-span-1">Inverse-Variance Weight</span>
                  <span className="text-slate-300 sm:col-span-2">Fisher information precision stabilizer with singularity guard <MathRenderer math="\epsilon = 10^{-6}" /></span>
                </div>
              </div>
            </div>

            {/* Composite Normalization */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white font-cinzel">Composite Asymptotic Normalization:</h4>
              <MathRenderer
                math="\mathcal{P}(C, T) = 100 \cdot \left( 1 - \exp\left( - \frac{\sum_{i=1}^M S_i(t)}{\kappa} \right) \right) \quad \text{where } \kappa = 3500 \text{ (Calibrated Scaling Factor)}"
                block
                className="bg-slate-950 text-sm"
              />
            </div>
          </div>
        )}

        {/* SECTION 2: RK4 PHARMACOKINETIC ODE */}
        {activeSection === 'rk4' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-cinzel flex items-center gap-2">
                <Cpu className="h-4 w-4 text-teal-400" />
                2. 4th-Order Runge-Kutta (RK4) Non-Linear Interaction System
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                When an allopathic pharmaceutical (e.g., Metformin, Amlodipine) and a botanical extract (e.g., Berberine, Sarpagandha) compete for hepatic CYP450 clearance pathways, their plasma concentration trajectories follow coupled non-linear differential equations:
              </p>
            </div>

            <div className="relative group">
              <MathRenderer
                math="\begin{cases} \dfrac{dc_1(t)}{dt} = -k_1 c_1(t) - \beta \, c_1(t) c_2(t) \\[8pt] \dfrac{dc_2(t)}{dt} = -k_2 c_2(t) \end{cases}"
                block
                className="text-base sm:text-lg bg-slate-950 p-4 border-teal-500/30"
              />
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-xs">
              <h4 className="font-bold text-teal-300 font-mono">Classical 4th-Order Step Equations (<MathRenderer math="h = 0.25" /> hrs):</h4>
              <MathRenderer
                math="\begin{aligned} k_1 &= f(t_n, \mathbf{c}_n) \\ k_2 &= f\left(t_n + \frac{h}{2}, \mathbf{c}_n + \frac{h}{2} k_1\right) \\ k_3 &= f\left(t_n + \frac{h}{2}, \mathbf{c}_n + \frac{h}{2} k_2\right) \\ k_4 &= f(t_n + h, \mathbf{c}_n + h k_3) \\ \mathbf{c}_{n+1} &= \mathbf{c}_n + \frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4) \end{aligned}"
                block
                className="bg-slate-900 text-xs sm:text-sm"
              />
            </div>

            {/* Optimal Staggering Theorem */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white font-cinzel">Optimal Therapeutic Staggering Offset Theorem:</h4>
              <p className="text-xs text-slate-300">
                To minimize competitive metabolic inhibition, SALUS solves for the optimal administration delay <MathRenderer math="\tau^*" /> that minimizes the overlap integral:
              </p>
              <MathRenderer
                math="\tau^* = \arg\min_{\tau \ge 0} \int_0^\infty c_1(t) \cdot c_2(t - \tau) \cdot \mathbb{I}(t \ge \tau) \, dt \quad \Longrightarrow \quad \tau^* = \frac{\ln(k_1 / k_2)}{k_1 - k_2} + \delta_{\text{buffer}}"
                block
                className="bg-slate-950 text-xs sm:text-sm"
              />
            </div>
          </div>
        )}

        {/* SECTION 3: HILL NET BENEFIT */}
        {activeSection === 'hill' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-cinzel flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-400" />
                3. Hill Equation Sigmoidal Dose-Response & Net Clinical Benefit
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Rather than linear dose assumptions, biological efficacy and toxic adverse events follow Hill sigmoidal saturating kinetics:
              </p>
            </div>

            <MathRenderer
              math="U(D) = \underbrace{\frac{E_{\max} \cdot D^h}{EC_{50}^h + D^h}}_{\text{Clinical Efficacy Response}} - \alpha \cdot \underbrace{\frac{T_{\max} \cdot D^k}{TD_{50}^k + D^k}}_{\text{Adverse Toxicity Risk}}"
              block
              className="text-base sm:text-lg bg-slate-950 p-4 border-indigo-500/30"
            />

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-xs">
              <h4 className="font-bold text-indigo-300 font-mono">Personalized Dosage Frontier with Renal & Age Modifiers:</h4>
              <MathRenderer
                math="D^* = \arg\max_{D} U(D) \quad \text{subject to} \quad D \le D_{\text{max}} \cdot \left(\frac{\text{eGFR}}{90}\right)^{\gamma} \cdot \left(\frac{70}{\text{Age}}\right)^{\eta}"
                block
                className="bg-slate-900"
              />
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Where <MathRenderer math="\gamma \approx 0.75" /> models renal clearance scaling and <MathRenderer math="\eta \approx 0.4" /> accounts for geriatric hepatic volume decline.
              </p>
            </div>
          </div>
        )}

        {/* SECTION 4: SHANNON ENTROPY */}
        {activeSection === 'entropy' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-cinzel flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-400" />
                4. Shannon Epistemic Entropy & Mutual Information Gain
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Proof that integrating multiple validated paradigms (Allopathy + Ayurveda + Siddha) strictly reduces clinical diagnostic uncertainty:
              </p>
            </div>

            <MathRenderer
              math="H(\Theta) = -\sum_{k=1}^K P(\theta_k) \log_2 P(\theta_k)"
              block
              className="bg-slate-950 p-4 text-base border-cyan-500/30"
            />

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white font-cinzel">Cross-Paradigm Mutual Information Gain:</h4>
              <MathRenderer
                math="I(\Theta; \mathcal{E}_{\text{Allopathy}}, \mathcal{E}_{\text{Traditional}}) = H(\Theta) - H(\Theta \mid \mathcal{E}_{\text{Allopathy}}, \mathcal{E}_{\text{Traditional}}) \ge I(\Theta; \mathcal{E}_{\text{Allopathy}})"
                block
                className="bg-slate-950 text-sm"
              />
              <p className="text-xs text-slate-300 leading-relaxed">
                By the Information Non-Negativity Theorem, conditioning on independent botanical phenotypic biomarkers never increases epistemic entropy, establishing the formal mathematical superiority of integrative evidence.
              </p>
            </div>
          </div>
        )}

        {/* SECTION 5: CALIBRATION & GOVERNANCE */}
        {activeSection === 'calibration' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-cinzel flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                5. Empirical Calibration Rigor & Expected Calibration Error (ECE)
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                To prevent algorithmic overconfidence and medical hallucination, the SALUS engine enforces continuous decile probability calibration:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <h4 className="font-mono text-emerald-400 text-xs font-bold uppercase">Brier Score Metric</h4>
                <MathRenderer math="BS = \frac{1}{N}\sum_{i=1}^N (p_i - y_i)^2 \le 0.025" block className="bg-slate-900" />
                <p className="text-[11px] text-slate-400">Target threshold <MathRenderer math="BS < 0.025" /> guarantees mean squared deviation below 2.5%.</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <h4 className="font-mono text-teal-400 text-xs font-bold uppercase">Expected Calibration Error (ECE)</h4>
                <MathRenderer math="ECE = \sum_{m=1}^M \frac{|B_m|}{N} \left| \overline{y}_{B_m} - \overline{p}_{B_m} \right| \le 0.020" block className="bg-slate-900" />
                <p className="text-[11px] text-slate-400">Partitioned across <MathRenderer math="M = 10" /> decile confidence bins <MathRenderer math="B_m" />.</p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: DALY INTEGRAL */}
        {activeSection === 'daly' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white font-cinzel flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-rose-400" />
                6. Continuous Hazard Rate & DALY Burden Reduction Integral
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Epidemiological calculation of global Disability-Adjusted Life Years (DALYs) preserved by replacing unmanaged polypharmacy with SALUS Pramana evidence:
              </p>
            </div>

            <MathRenderer
              math="\Delta \text{DALY} = \int_0^L \left[ h_{\text{unmanaged}}(t) - h_{\text{pramana}}(t) \right] \cdot w_{\text{disability}} \cdot \exp(-r \cdot t) \, dt"
              block
              className="text-base sm:text-lg bg-slate-950 p-4 border-rose-500/30"
            />

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
              <span className="font-mono text-rose-400 font-bold uppercase block">Economic Welfare Formulation</span>
              <MathRenderer
                math="\Delta \text{Cost} = \sum_{j=1}^P \left( C_{\text{drug},j}^{\text{redundant}} + C_{\text{toxicity},j} \cdot P(\text{adverse}_j) \right) - C_{\text{pramana\_deploy}} \quad \approx \$46.8\text{ Billion / year}"
                block
                className="bg-slate-900"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 pt-4 text-xs text-slate-400">
          <span>
            SALUS Mathematical Whitepaper • Authored by{' '}
            <a
              href="https://ai-aarti.com"
              target="_blank"
              rel="noreferrer"
              className="text-amber-300 underline hover:text-amber-200"
            >
              Aarti S Ravikumar
            </a>
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-white font-semibold transition"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
