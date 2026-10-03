import { Link } from '@tanstack/react-router';
import { LayoutGrid, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { featureActionRegistry, featureCategories, featureRegistry, type FeatureActionId, type FeatureUiActions } from '../app/feature-registry';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

interface FeatureNavigatorProps extends FeatureUiActions {}

/** Searchable, data-driven entry point for every user-facing SALUS capability. */
export function FeatureNavigator({ exportEvidence, openCitations }: FeatureNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const features = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return featureRegistry;
    return featureRegistry.filter((feature) => `${feature.title} ${feature.description} ${feature.category}`.toLowerCase().includes(normalized));
  }, [query]);

  const close = () => {
    setIsOpen(false);
    setQuery('');
  };
  const runAction = (id: Exclude<FeatureActionId, 'open'>) => {
    close();
    if (id === 'export_evidence') exportEvidence();
    if (id === 'open_citations') openCitations();
  };

  return (
    <section className="border-t border-slate-800/80 bg-slate-950/35">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2">
        <p className="hidden text-xs text-slate-400 sm:block">Every workstation, evidence operation, and governance view in one place.</p>
        <button type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-controls="feature-navigator" className="ml-auto inline-flex min-h-9 items-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20">
          {isOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <LayoutGrid className="h-4 w-4" aria-hidden="true" />}
          {isOpen ? 'Close feature directory' : 'All features'}
        </button>
      </div>

      {isOpen && <div id="feature-navigator" className="border-t border-slate-800 bg-slate-950/60"><div className="mx-auto max-w-7xl px-4 py-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><h2 className="font-cinzel text-lg font-bold text-white">SALUS feature directory</h2><p className="mt-1 text-xs text-slate-400">A reusable capability catalogue for discovery and future expansion.</p></div>
          <label className="relative block sm:w-72"><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" /><span className="sr-only">Search features</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search capabilities" className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500" /></label>
        </div>

        <div className="mt-4 space-y-5">{featureCategories.map((category) => {
          const categoryFeatures = features.filter((feature) => feature.category === category);
          if (!categoryFeatures.length) return null;
          return <section key={category} aria-labelledby={`category-${category}`}><h3 id={`category-${category}`} className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{category}</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{categoryFeatures.map((feature) => {
            const Icon = feature.icon;
            return <Link key={feature.id} to={feature.href as '/'} onClick={close} className="group"><Card className="h-full p-4 hover:-translate-y-0.5" glow="indigo"><div className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300"><Icon className="h-4 w-4" aria-hidden="true" /></span><span><span className="flex flex-wrap items-center gap-2 font-semibold text-slate-100 group-hover:text-indigo-300">{feature.title}{feature.badge && <Badge variant="indigo" size="xs">{feature.badge}</Badge>}</span><span className="mt-1 block text-xs leading-relaxed text-slate-400">{feature.description}</span></span></div></Card></Link>;
          })}</div></section>;
        })}</div>
        {!features.length && <p className="py-8 text-center text-sm text-slate-400">No capability matches “{query}”.</p>}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-800 pt-4">{featureActionRegistry.map((action) => {
          const Icon = action.icon;
          return <button key={action.id} type="button" title={action.description} onClick={() => runAction(action.id)} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"><Icon className="h-4 w-4 text-indigo-300" aria-hidden="true" /> {action.title}</button>;
        })}</div>
      </div></div>}
    </section>
  );
}
