import { ErrorComponentProps, Link } from '@tanstack/react-router';
import { AlertTriangle, LoaderCircle } from 'lucide-react';

export function RoutePending() {
  return (
    <section className="min-h-80 flex items-center justify-center" aria-live="polite">
      <div className="flex items-center gap-3 text-slate-400">
        <LoaderCircle className="h-5 w-5 animate-spin text-indigo-400" />
        <span className="font-mono text-sm">Loading research workspace...</span>
      </div>
    </section>
  );
}

export function RouteError({ error, reset }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : 'An unexpected error interrupted this research view.';

  return (
    <section className="rounded-2xl border border-rose-500/40 bg-slate-900 p-8 text-center">
      <AlertTriangle className="mx-auto h-8 w-8 text-rose-400" />
      <h2 className="mt-3 font-cinzel text-2xl text-white">Research view unavailable</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">{message}</p>
      <div className="mt-5 flex justify-center gap-4">
        <button type="button" onClick={reset} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white">Try again</button>
        <Link to="/" className="px-4 py-2 text-sm font-bold text-amber-300 underline">Research home</Link>
      </div>
    </section>
  );
}