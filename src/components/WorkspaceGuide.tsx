import { ChevronRight, CircleHelp } from 'lucide-react';

interface WorkspaceGuideProps {
  title?: string;
  steps: string[];
  boundary?: string;
}

/**
 * Keeps advanced workspace instructions discoverable without competing with
 * the task controls on first visit. Use the same interaction pattern across
 * research, safety, governance, and technical screens.
 */
export function WorkspaceGuide({
  title = 'How to use this workspace',
  steps,
  boundary,
}: WorkspaceGuideProps) {
  return (
    <details className="group rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
        <span className="inline-flex items-center gap-2"><CircleHelp className="h-4 w-4 text-amber-300" />{title}</span>
        <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-90" aria-hidden="true" />
      </summary>
      <div className="mt-3 border-t border-slate-800 pt-3">
        <ol className="grid gap-2 text-sm text-white sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-2 leading-relaxed"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-300 text-[11px] font-mono font-bold text-slate-950">{index + 1}</span><span>{step}</span></li>
          ))}
        </ol>
        {boundary ? <p className="mt-3 border-t border-slate-800 pt-3 text-xs leading-relaxed text-white">{boundary}</p> : null}
      </div>
    </details>
  );
}
