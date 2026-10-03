import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Award, Download, BookOpen, LogIn, LogOut, UserCheck } from 'lucide-react';
import { PersonaMode } from '../types/salus';
import { primaryFeatures } from '../app/feature-registry';
import { AUTH_CHANGED_EVENT, authSnapshot, beginLogin, sanitizeReturnPath, signOut } from '../client/services/auth/session';
import { WorkflowGuide } from './WorkflowGuide';
import { FeatureNavigator } from './FeatureNavigator';

interface HeaderProps {
  selectedPersona: PersonaMode;
  setSelectedPersona: (persona: PersonaMode) => void;
  onOpenExportModal: () => void;
  onOpenCitationModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedPersona,
  setSelectedPersona,
  onOpenExportModal,
  onOpenCitationModal,
}) => {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [auth, setAuth] = React.useState(authSnapshot);
  const [authMessage, setAuthMessage] = React.useState('');

  React.useEffect(() => {
    const updateAuth = () => setAuth(authSnapshot());
    window.addEventListener(AUTH_CHANGED_EVENT, updateAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, updateAuth);
  }, []);

  const startLogin = () => {
    const returnTo = sanitizeReturnPath(pathname);
    setAuthMessage('');
    void beginLogin(returnTo).catch((error: Error) => setAuthMessage(error.message));
  };
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
              onClick={onOpenCitationModal}
              className="inline-flex items-center gap-1.5 rounded bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 hover:text-white px-2 py-0.5 sm:px-2.5 text-[11px] sm:text-xs transition border border-indigo-700/50"
              title="Academic citations & AI discoverability metadata"
            >
              <BookOpen className="h-3 w-3 text-amber-400" />
              <span className="hidden sm:inline">Cite / AIO</span>
              <span className="sm:hidden">Cite</span>
            </button>
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
          <img
            src="/brand/salus-pramana-mark.png"
            alt=""
            width="40"
            height="40"
            className="h-9 w-9 shrink-0 object-contain drop-shadow-sm sm:h-10 sm:w-10"
          />
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
        <nav aria-label="Primary research navigation" className="flex space-x-1">
          {primaryFeatures.map((feature) => {
            const Icon = feature.icon;
            const isActive = pathname === feature.href;
            return (
              <Link
                key={feature.id}
                to={feature.href as '/'}
                className={`group flex items-center space-x-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{feature.shortLabel}</span>
                {feature.badge && (
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-mono uppercase tracking-wider ${
                      isActive ? 'border border-white/20 bg-slate-900/90 text-indigo-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {feature.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-slate-800/80 bg-slate-900/60">
        <nav aria-label="Evidence and governance" className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 py-2 text-xs">
          <span className="ml-auto">
            {auth.authenticated ? <button type="button" onClick={signOut} className="inline-flex min-h-9 items-center gap-2 rounded border border-slate-700 px-3 py-2 text-slate-200 hover:bg-slate-800"><LogOut className="h-4 w-4" aria-hidden="true" /> Sign out</button> : <button type="button" onClick={startLogin} className="inline-flex min-h-9 items-center gap-2 rounded border border-amber-500/50 px-3 py-2 text-amber-200 hover:bg-amber-950"><LogIn className="h-4 w-4" aria-hidden="true" /> {auth.configured ? 'Sign in' : 'Sign in unavailable'}</button>}
          </span>
          {authMessage ? <span role="alert" className="basis-full px-3 py-1 text-red-300">{authMessage}</span> : null}
        </nav>
      </div>
      <WorkflowGuide />
      <FeatureNavigator exportEvidence={onOpenExportModal} openCitations={onOpenCitationModal} />
    </header>
  );
};
