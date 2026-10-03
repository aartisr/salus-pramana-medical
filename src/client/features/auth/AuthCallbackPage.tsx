import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { AUTH_CHANGED_EVENT, beginLogin, exchangeCallback, getAuthConfig } from '../../services/auth/session';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const config = getAuthConfig();
    if (!config) { setError('Authentication is not configured for this environment.'); return; }
    let active = true;
    exchangeCallback(config, window.location.href, window.sessionStorage).then(({ returnTo, scrubbedPath }) => {
      if (!active) return;
      window.history.replaceState({}, document.title, scrubbedPath);
      window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
      return navigate({ to: returnTo, replace: true });
    }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Authentication failed.'); });
    return () => { active = false; };
  }, [navigate]);

  return <section className="theme-compat-light rounded-lg border border-slate-200 bg-white p-6 text-slate-900" aria-labelledby="callback-heading"><h1 id="callback-heading" className="text-3xl font-bold">Completing sign in</h1>{error ? <div role="alert" className="mt-4 rounded border border-red-300 bg-red-50 p-4"><p>{error}</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => void beginLogin('/new').catch((reason: Error) => setError(reason.message))} className="rounded bg-teal-700 px-4 py-2 font-semibold text-white">Retry sign in</button><Link to="/" className="rounded border border-slate-400 px-4 py-2 font-semibold">Return to dashboard</Link></div></div> : <p role="status" className="mt-4">Validating the secure callback and restoring your session...</p>}</section>;
}
