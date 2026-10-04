import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { LogIn, LogOut, UserCheck } from 'lucide-react';
import { PersonaMode } from '../types/salus';
import { primaryFeatures } from '../app/feature-registry';
import { getPersonaLens } from '../app/persona-lenses';
import { AUTH_CHANGED_EVENT, authSnapshot, beginLogin, sanitizeReturnPath, signOut } from '../client/services/auth/session';
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
  const primaryNavRef = React.useRef<HTMLElement | null>(null);
  const activeLens = getPersonaLens(selectedPersona);

  React.useEffect(() => {
    const updateAuth = () => setAuth(authSnapshot());
    window.addEventListener(AUTH_CHANGED_EVENT, updateAuth);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, updateAuth);
  }, []);

  React.useEffect(() => {
    primaryNavRef.current
      ?.querySelector<HTMLElement>('[aria-current="page"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [pathname]);

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
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 shadow-sm backdrop-blur-xl">
      {/* A compact identity row keeps the site usable while leaving room for content. */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 sm:px-4 py-2">
        {/* Brand */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <img
            src="/brand/salus-pramana-mark.png"
            alt=""
            width="40"
            height="40"
            className="h-8 w-8 shrink-0 object-contain drop-shadow-sm sm:h-9 sm:w-9"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold tracking-tight text-white font-cinzel sm:text-lg">
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

        <div className="flex items-center gap-2 shrink-0">
          {/* Persona selector is useful context on larger screens; feature directory is the mobile navigator. */}
          <div className="hidden md:flex w-auto items-center space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
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
          <span className="hidden xl:inline text-[11px] text-slate-400 max-w-44 leading-tight" title={activeLens.purpose}>{activeLens.shortLabel}</span>
          <button type="button" onClick={auth.authenticated ? signOut : startLogin} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-700 px-2.5 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 sm:px-3" title={auth.authenticated ? 'Sign out' : auth.configured ? 'Sign in' : 'Sign in is unavailable'}>
            {auth.authenticated ? <LogOut className="h-4 w-4" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
            <span className="hidden lg:inline">{auth.authenticated ? 'Sign out' : auth.configured ? 'Sign in' : 'Sign in unavailable'}</span>
          </button>
        </div>
      </div>

      {/* Horizontal scroll is intentional: no destination is squeezed, truncated, or inaccessible. */}
      <div className="hidden border-t border-slate-800/80 bg-slate-900/55 md:block">
        <nav ref={primaryNavRef} aria-label="Primary research navigation" className="hidden w-full gap-1 overflow-x-auto scroll-smooth px-3 py-1.5 md:flex sm:px-4 [scrollbar-width:thin]">
          {primaryFeatures.map((feature) => {
            const Icon = feature.icon;
            const isActive = pathname === feature.href;
            return (
              <Link
                key={feature.id}
                to={feature.href as '/'}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex shrink-0 items-center space-x-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all ${
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
      {authMessage ? <p role="alert" className="border-t border-slate-800 bg-rose-950/30 px-4 py-2 text-center text-xs text-rose-300">{authMessage}</p> : null}
      <FeatureNavigator exportEvidence={onOpenExportModal} openCitations={onOpenCitationModal} />
    </header>
  );
};
