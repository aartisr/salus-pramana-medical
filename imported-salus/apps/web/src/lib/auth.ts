const ACCESS_TOKEN_KEY = "salus.auth.accessToken";
const ACCESS_TOKEN_EXPIRY_KEY = "salus.auth.accessTokenExpiry";
const PKCE_VERIFIER_KEY = "salus.auth.pkceVerifier";
const PKCE_STATE_KEY = "salus.auth.pkceState";
const PKCE_RETURN_TO_KEY = "salus.auth.pkceReturnTo";

export type AppRoute = "/" | "/new" | "/editor";

type AuthConfig = {
  domain: string;
  clientId: string;
  redirectUri: string;
  scopes: string;
};

function hasWindow() {
  return typeof window !== "undefined";
}

function getAuthConfig(): AuthConfig | null {
  const domain = import.meta.env.VITE_COGNITO_DOMAIN;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;

  if (!domain || !clientId) {
    return null;
  }

  const scopes = import.meta.env.VITE_COGNITO_SCOPES || "openid email profile";
  const fallbackRedirect = hasWindow() ? `${window.location.origin}/auth/callback` : "";

  return {
    domain,
    clientId,
    redirectUri: redirectUri || fallbackRedirect,
    scopes,
  };
}

function base64Url(bytes: Uint8Array) {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomString(length = 32) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

async function sha256(input: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(digest);
}

async function createCodeChallenge(verifier: string) {
  const digest = await sha256(verifier);
  return base64Url(digest);
}

function notifyAuthChanged() {
  if (!hasWindow()) {
    return;
  }
  window.dispatchEvent(new Event("salus-auth-changed"));
}

export function isAuthConfigured() {
  return Boolean(getAuthConfig());
}

export function getAccessToken() {
  if (!hasWindow()) {
    return null;
  }

  const token = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  const expiryRaw = window.sessionStorage.getItem(ACCESS_TOKEN_EXPIRY_KEY);
  const expiry = expiryRaw ? Number.parseInt(expiryRaw, 10) : 0;

  if (!token) {
    return null;
  }

  if (expiry && Date.now() >= expiry) {
    clearSession();
    return null;
  }

  return token;
}

export function clearSession() {
  if (!hasWindow()) {
    return;
  }

  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(ACCESS_TOKEN_EXPIRY_KEY);
  notifyAuthChanged();
}

export function signOut() {
  const config = getAuthConfig();
  clearSession();

  if (!hasWindow() || !config) {
    return;
  }

  const logoutUrl = new URL(`${config.domain.replace(/\/$/, "")}/logout`);
  logoutUrl.searchParams.set("client_id", config.clientId);
  logoutUrl.searchParams.set("logout_uri", window.location.origin);
  window.location.assign(logoutUrl.toString());
}

export async function beginLogin(returnTo: AppRoute = "/new") {
  const config = getAuthConfig();

  if (!hasWindow() || !config) {
    throw new Error("Auth is not configured. Set VITE_COGNITO_DOMAIN and VITE_COGNITO_CLIENT_ID.");
  }

  const verifier = randomString(64);
  const state = randomString(32);
  const challenge = await createCodeChallenge(verifier);

  window.sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
  window.sessionStorage.setItem(PKCE_STATE_KEY, state);
  window.sessionStorage.setItem(PKCE_RETURN_TO_KEY, returnTo);

  const authorizeUrl = new URL(`${config.domain.replace(/\/$/, "")}/oauth2/authorize`);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", config.clientId);
  authorizeUrl.searchParams.set("redirect_uri", config.redirectUri);
  authorizeUrl.searchParams.set("scope", config.scopes);
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");
  authorizeUrl.searchParams.set("code_challenge", challenge);

  window.location.assign(authorizeUrl.toString());
}

export async function handleAuthCallback(): Promise<AppRoute> {
  const config = getAuthConfig();

  if (!hasWindow() || !config) {
    throw new Error("Auth is not configured.");
  }

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");
  const error = params.get("error");

  if (error) {
    throw new Error(params.get("error_description") || error);
  }

  const storedState = window.sessionStorage.getItem(PKCE_STATE_KEY);
  const verifier = window.sessionStorage.getItem(PKCE_VERIFIER_KEY);
  const returnTo = (window.sessionStorage.getItem(PKCE_RETURN_TO_KEY) as AppRoute | null) || "/new";

  window.sessionStorage.removeItem(PKCE_STATE_KEY);
  window.sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  window.sessionStorage.removeItem(PKCE_RETURN_TO_KEY);

  if (!code || !state || !storedState || state !== storedState || !verifier) {
    throw new Error("Invalid auth callback state.");
  }

  const tokenUrl = `${config.domain.replace(/\/$/, "")}/oauth2/token`;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    code,
    redirect_uri: config.redirectUri,
    code_verifier: verifier,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to exchange auth code: ${text}`);
  }

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!payload.access_token) {
    throw new Error("Token response did not include an access token.");
  }

  const expiryMs = payload.expires_in ? Date.now() + payload.expires_in * 1000 : Date.now() + 60 * 60 * 1000;

  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, payload.access_token);
  window.sessionStorage.setItem(ACCESS_TOKEN_EXPIRY_KEY, String(expiryMs));

  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.delete("code");
  currentUrl.searchParams.delete("state");
  currentUrl.searchParams.delete("error");
  currentUrl.searchParams.delete("error_description");
  window.history.replaceState({}, document.title, `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);

  notifyAuthChanged();
  if (returnTo === "/" || returnTo === "/new" || returnTo === "/editor") {
    return returnTo;
  }
  return "/new";
}

export function getAuthStatus() {
  const token = getAccessToken();
  return {
    configured: isAuthConfigured(),
    authenticated: Boolean(token),
  };
}
