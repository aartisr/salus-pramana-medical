import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { AuthClaims, JwtVerifier } from './jwt-verifier';

type AuthState = { claims?: AuthClaims; error?: 'invalid' | 'unconfigured'; tokenPresent: boolean };
const states = new WeakMap<Request, AuthState>();

export function authContextMiddleware(verifier: JwtVerifier | undefined): RequestHandler {
  return async (request, _response, next) => {
    const header = request.header('authorization');
    const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : undefined;
    if (!token) { states.set(request, { tokenPresent: false }); return next(); }
    if (!verifier) { states.set(request, { tokenPresent: true, error: 'unconfigured' }); return next(); }
    try { states.set(request, { tokenPresent: true, claims: await verifier.verify(token) }); }
    catch { states.set(request, { tokenPresent: true, error: 'invalid' }); }
    next();
  };
}
export function requireAuthenticated(request: Request, response: Response, next: NextFunction) {
  const state = states.get(request) ?? { tokenPresent: false };
  if (!state.tokenPresent) return response.status(401).json({ error: 'Missing bearer token' });
  if (state.error === 'unconfigured') return response.status(503).json({ error: 'Auth config missing. Set COGNITO_ISSUER and COGNITO_AUDIENCE.' });
  if (!state.claims || state.error) return response.status(401).json({ error: 'Invalid or expired token' });
  next();
}
export function requireEditor(request: Request, response: Response, next: NextFunction) {
  if (!getGroups(request).includes('evidence-editors')) return response.status(403).json({ error: 'Editor role required' });
  next();
}
export function getClaims(request: Request) { return states.get(request)?.claims; }
export function getGroups(request: Request) {
  const groups = getClaims(request)?.['cognito:groups'];
  return Array.isArray(groups) ? groups.filter((group): group is string => typeof group === 'string') : [];
}
export function getActorEmail(request: Request) { const email = getClaims(request)?.email; return typeof email === 'string' ? email : 'unknown'; }
export function hasEditorRole(request: Request) { return getGroups(request).includes('evidence-editors'); }
export function requireDraftAccess(request: Request, response: Response): boolean {
  if (request.query.includeDrafts !== 'true') return true;
  let allowed = false;
  requireAuthenticated(request, response, () => requireEditor(request, response, () => { allowed = true; }));
  return allowed;
}