export const AUTH_CHANGED_EVENT = 'salus-auth-changed';

const KEYS = {
  accessToken: 'salus.auth.accessToken',
  accessTokenExpiry: 'salus.auth.accessTokenExpiry',
  verifier: 'salus.auth.pkceVerifier',
  state: 'salus.auth.pkceState',
  returnTo: 'salus.auth.pkceReturnTo',
} as const;

export type AuthReturnPath = '/' | '/new' | '/editor';

export interface AuthConfig {
  domain: string;
  clientId: string;
  redirectUri: string;
  scopes: string;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function getAuthConfig(): AuthConfig | null {
  const domain = import.meta.env.VITE_COGNITO_DOMAIN;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  if (!domain || !clientId) return null;
  return {
    domain,
    clientId,
    redirectUri: import.meta.env.VITE_COGNITO_REDIRECT_URI || `${window.location.origin}/auth/callback`,
    scopes: import.meta.env.VITE_COGNITO_SCOPES || 'openid email profile',
  };
}

export function sanitizeReturnPath(path: string | null): AuthReturnPath {
  return path === '/' || path === '/editor' || path === '/new' ? path : '/new';
}

export function getAccessToken(
  storage: StorageLike | null = typeof window === 'undefined' ? null : window.sessionStorage,
  now = Date.now(),
) {
  if (!storage) return null;
  const token = storage.getItem(KEYS.accessToken);
  const expiry = Number(storage.getItem(KEYS.accessTokenExpiry) || 0);
  if (!token) return null;
  if (expiry && now >= expiry) {
    storage.removeItem(KEYS.accessToken);
    storage.removeItem(KEYS.accessTokenExpiry);
    return null;
  }
  return token;
}

export function clearSession(storage: StorageLike = window.sessionStorage) {
  storage.removeItem(KEYS.accessToken);
  storage.removeItem(KEYS.accessTokenExpiry);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

function base64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function randomString(length: number) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

export async function createLoginUrl(
  config: AuthConfig,
  returnTo: AuthReturnPath,
  storage: StorageLike,
) {
  const verifier = randomString(64);
  const state = randomString(32);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const challenge = base64Url(new Uint8Array(digest));
  storage.setItem(KEYS.verifier, verifier);
  storage.setItem(KEYS.state, state);
  storage.setItem(KEYS.returnTo, returnTo);

  const url = new URL(`${config.domain.replace(/\/$/, '')}/oauth2/authorize`);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('scope', config.scopes);
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('code_challenge', challenge);
  return url.toString();
}

export async function exchangeCallback(
  config: AuthConfig,
  callbackUrl: string,
  storage: StorageLike,
  request: typeof fetch = fetch,
  now = Date.now(),
) {
  const url = new URL(callbackUrl);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const callbackError = url.searchParams.get('error');
  const storedState = storage.getItem(KEYS.state);
  const verifier = storage.getItem(KEYS.verifier);
  const returnTo = sanitizeReturnPath(storage.getItem(KEYS.returnTo));

  storage.removeItem(KEYS.state);
  storage.removeItem(KEYS.verifier);
  storage.removeItem(KEYS.returnTo);

  if (callbackError) throw new Error(url.searchParams.get('error_description') || callbackError);
  if (!code || !state || !storedState || state !== storedState || !verifier) {
    throw new Error('Invalid authentication callback state. Sign in again.');
  }

  const response = await request(`${config.domain.replace(/\/$/, '')}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      code,
      redirect_uri: config.redirectUri,
      code_verifier: verifier,
    }),
  });
  if (!response.ok) throw new Error(`Authentication code exchange failed (${response.status}).`);
  const payload = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!payload.access_token) throw new Error('Authentication response did not include an access token.');

  storage.setItem(KEYS.accessToken, payload.access_token);
  storage.setItem(KEYS.accessTokenExpiry, String(now + (payload.expires_in ?? 3600) * 1000));
  url.searchParams.delete('code');
  url.searchParams.delete('state');
  url.searchParams.delete('error');
  url.searchParams.delete('error_description');
  return { returnTo, scrubbedPath: `${url.pathname}${url.search}${url.hash}` };
}

export async function beginLogin(returnTo: AuthReturnPath) {
  const config = getAuthConfig();
  if (!config) throw new Error('Authentication is not configured for this environment.');
  window.location.assign(await createLoginUrl(config, returnTo, window.sessionStorage));
}

export function signOut() {
  const config = getAuthConfig();
  clearSession();
  if (!config) return;
  const url = new URL(`${config.domain.replace(/\/$/, '')}/logout`);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('logout_uri', window.location.origin);
  window.location.assign(url.toString());
}

export function authSnapshot() {
  return { configured: Boolean(getAuthConfig()), authenticated: Boolean(getAccessToken()) };
}