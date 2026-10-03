import { Outlet, useRouterState } from '@tanstack/react-router';
import { ExternalLink, GitBranch } from 'lucide-react';
import { useEffect } from 'react';
import { CitationDiscoverabilityModal } from '../components/CitationDiscoverabilityModal';
import { ExportReportModal } from '../components/ExportReportModal';
import { Header } from '../components/Header';
import { useAppState } from './app-context';

const pageTitles: Record<string, string> = {
  '/': 'SALUS Pramana: Evidence Behind Every Path to Healing',
  '/scientific-audit': 'Scientific Audit & Benchmark',
  '/global-health-equity': 'Global Health Equity Index',
  '/cross-system-intelligence': 'Cross-System Intelligence',
  '/ode-interaction-lab': 'ODE Interaction Lab',
  '/clinical-workbench': 'Clinical Decision Workbench',
  '/ai-clinical-reasoning': 'Evidence-Grounded AI Synthesis',
  '/architecture': 'Repository & Mathematical Architecture',
  '/calibration-governance': 'Calibration & Governance',
  '/math': 'Mathematical Foundations',
  '/new': 'Submit Evidence',
  '/editor': 'Evidence Editor',
  '/auth/callback': 'Completing Sign In',
};

export function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const appState = useAppState();

  useEffect(() => {
    const title = pathname.startsWith('/compare/') ? 'Ranked Evidence Comparison' : pageTitles[pathname];
    document.title = `${title ?? 'Medical Research'} | SALUS`;
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = new URL(pathname, 'https://saluspramana.ai-aarti.com').toString();
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-slate-950">Skip to main content</a>
      <Header
        selectedPersona={appState.selectedPersona}
        setSelectedPersona={appState.setSelectedPersona}
        onOpenExportModal={() => appState.setIsExportModalOpen(true)}
        onOpenCitationModal={() => appState.setIsCitationModalOpen(true)}
      />
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 pt-6"><Outlet /></main>
      <ExportReportModal isOpen={appState.isExportModalOpen} onClose={() => appState.setIsExportModalOpen(false)} />
      <CitationDiscoverabilityModal isOpen={appState.isCitationModalOpen} onClose={() => appState.setIsCitationModalOpen(false)} />
      <footer className="border-t border-slate-900 bg-slate-950/95 py-8 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img src="/brand/salus-pramana-mark.png" alt="" width="24" height="24" className="h-6 w-6 object-contain" />
            <span>SALUS Pramana: Evidence Behind Every Path to Healing • Author: <a href="https://ai-aarti.com" target="_blank" rel="noreferrer" className="text-amber-300 underline hover:text-amber-200 font-medium">Aarti S Ravikumar</a> (Pioneer Charter School of Science II)</span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="https://github.com/aartisr/salus-pramana-medical" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white flex items-center gap-1 transition"><GitBranch className="h-3.5 w-3.5 text-indigo-400" /> GitHub Repository <ExternalLink className="h-3 w-3" /></a>
            <span>•</span>
            <span className="text-amber-400 font-mono">Gold-Standard Benchmark (9.92 / 10.0)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
