import { Link } from '@tanstack/react-router';
import { Activity, ArrowRight, BookOpenCheck, ShieldCheck, SlidersHorizontal } from 'lucide-react';

const steps = [
  { label: 'Explore evidence', description: 'Start with a condition or intervention.', to: '/' as const, icon: BookOpenCheck },
  { label: 'Compare options', description: 'See systems side by side without false equivalence.', to: '/compare/$conditionId' as const, icon: SlidersHorizontal },
  { label: 'Assess confidence', description: 'Inspect the Pramana score, uncertainty, and gates.', to: '/cross-system-intelligence' as const, icon: Activity },
  { label: 'Check safety', description: 'Review contraindications, interaction dynamics, and dose bounds.', to: '/clinical-workbench' as const, icon: ShieldCheck },
] as const;

/** A progressive-disclosure map for the primary evidence-to-safety workflow. */
export function WorkflowGuide() {
  return (
    <details className="group border-t border-slate-800/80 bg-slate-900/60">
      <summary className="mx-auto flex max-w-7xl cursor-pointer list-none items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 marker:content-none hover:text-slate-100">
        <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 font-mono text-[10px] text-indigo-300">Guided workflow</span>
        <span>Explore evidence → compare → assess confidence → check safety</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" aria-hidden="true" />
      </summary>
      <div className="border-t border-slate-800 bg-slate-950/40">
        <div className="mx-auto grid max-w-7xl gap-2 px-4 py-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const content = <><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300"><Icon className="h-4 w-4" aria-hidden="true" /></span><span><span className="block font-semibold">{index + 1}. {step.label}</span><span className="mt-0.5 block text-[11px] font-normal text-slate-400">{step.description}</span></span></>;
            return step.to === '/compare/$conditionId'
              ? <Link key={step.to} to="/compare/$conditionId" params={{ conditionId: 'cond-type2-diabetes' }} className="flex min-h-16 gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3 transition hover:border-indigo-500/50 hover:bg-slate-800">{content}</Link>
              : <Link key={step.to} to={step.to} className="flex min-h-16 gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3 transition hover:border-indigo-500/50 hover:bg-slate-800">{content}</Link>;
          })}
        </div>
      </div>
    </details>
  );
}
