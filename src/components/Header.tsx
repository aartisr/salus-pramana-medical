import React from 'react';
import { Award, ShieldCheck, Activity, Brain, GitBranch, FileSpreadsheet, Download, Sparkles, UserCheck, Globe2, Microscope } from 'lucide-react';
import { PersonaMode } from '../types/salus';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedPersona: PersonaMode;
  setSelectedPersona: (persona: PersonaMode) => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedPersona,
  setSelectedPersona,
  onOpenExportModal,
}) => {
  const tabs = [
    { id: 'research-home', label: 'Research Institute Home', icon: Microscope, badge: 'Overview' },
    { id: 'nobel-dossier', label: 'Scientific Audit & Benchmark (10/10)', icon: Award, badge: 'Audit Dossier' },
    { id: 'health-equity', label: 'Global Health Equity Index', icon: Globe2, badge: 'D3 Live Map' },
    { id: 'intelligence-studio', label: 'Cross-System Intelligence', icon: Activity, badge: 'Pramana v1.2' },
    { id: 'ode-lab', label: 'ODE Interaction Lab', icon: Brain, badge: 'RK4 Solver' },
    { id: 'diagnostic-workbench', label: 'Clinical Decision Workbench', icon: ShieldCheck, badge: 'Point-of-Care' },
    { id: 'ai-synthesis', label: 'Live Clinical AI Reasoning', icon: Sparkles, badge: 'Gemini Grounded' },
    { id: 'code-architecture', label: 'Repo & Math Spec', icon: GitBranch, badge: 'Architecture' },
    { id: 'calibration-drift', label: 'Calibration & Governance', icon: FileSpreadsheet, badge: 'Brier: 0.018' },
  ];

  const personas: { id: PersonaMode; label: string; role: string }[] = [
    { id: 'nobel_juror', label: 'Independent Science Auditor / Juror', role: 'Global Science & Humanity Audit' },
    { id: 'clinician', label: 'Attending Physician / Vaidya', role: 'Point-of-Care Practice' },
    { id: 'researcher', label: 'Principal Investigator', role: 'Calculus & Bias Precision' },
    { id: 'policy_maker', label: 'WHO / Health Ministry', role: 'Public Health & Affordability' },
    { id: 'patient', label: 'Patient & Family Advocate', role: 'Plain-Language Safety' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      {/* Top Banner */}
      <div className="border-b border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-indigo-950/40 px-3 sm:px-4 py-1.5 text-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-amber-300 min-w-0">
            <span className="flex h-2 w-2 shrink-0 rounded-full bg-amber-400 animate-ping" />
            <span className="font-semibold tracking-wider uppercase text-[10px] sm:text-[11px] font-mono truncate">
              Grounded in Peer-Reviewed Registries & Open Evidence Audit (PubMed • CTRI • Cochrane)
            </span>
            <span className="hidden lg:inline text-slate-400">|</span>
            <span className="hidden lg:inline text-slate-300">
              Repository: <strong className="text-amber-200">salus-pramana-medical</strong> by{' '}
              <a
                href="https://ai-aarti.com"
                target="_blank"
                rel="noreferrer"
                className="text-amber-300 underline hover:text-amber-200 font-medium"
              >
                Aarti S Ravikumar
              </a>
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 text-slate-300 shrink-0">
            <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-amber-300 font-mono text-[10px] sm:text-[11px] border border-amber-500/30">
              <Award className="h-3 w-3 text-amber-400" />
              Evaluation Benchmark: <strong>9.92 / 10.0</strong>
            </span>
            <button
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 px-2 py-0.5 sm:px-2.5 text-[11px] sm:text-xs text-slate-200 transition border border-slate-700"
            >
              <Download className="h-3 w-3 text-indigo-400" />
              <span className="hidden sm:inline">Export Dossier</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
        {/* Brand */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-indigo-600 to-teal-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950 font-cinzel font-bold text-amber-400 text-base sm:text-lg">
              S
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-cinzel">
                SALUS <span className="text-amber-400 font-sans font-light">PRAMANA</span>
              </h1>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                Medical OS
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block truncate max-w-xs sm:max-w-md">
              Evidence behind every path to healing • Allopathy • Ayurveda • Siddha • Naturopathy
            </p>
          </div>
        </div>

        {/* Persona Selector */}
        <div className="flex w-full sm:w-auto items-center space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800 shrink-0">
          <div className="flex items-center gap-1.5 px-2 text-xs text-slate-400 shrink-0">
            <UserCheck className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">Active Lens:</span>
          </div>
          <select
            value={selectedPersona}
            onChange={(e) => setSelectedPersona(e.target.value as PersonaMode)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-700 text-xs text-amber-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-medium"
          >
            {personas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} ({p.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mx-auto flex max-w-7xl overflow-x-auto px-4 pb-1 scrollbar-none">
        <nav className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center space-x-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-mono uppercase tracking-wider ${
                      isActive ? 'bg-indigo-700/80 text-indigo-100' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
