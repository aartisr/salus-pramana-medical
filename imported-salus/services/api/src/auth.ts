import type { Context, Next } from "hono";
import { createRemoteJWKSet, jwtVerify } from "jose";

type AuthClaims = {
  email?: string;
  "cognito:groups"?: string[];
  [key: string]: unknown;
};

const localDevBypass = process.env.ALLOW_UNAUTH_MUTATIONS === "true" || process.env.NODE_ENV === "test";
const cognitoIssuer = process.env.COGNITO_ISSUER;
const cognitoAudience = process.env.COGNITO_AUDIENCE;

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!cognitoIssuer) {
    return null;
  }
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${cognitoIssuer}/.well-known/jwks.json`));
  }
  return jwks;
}

async function verifyBearerToken(token: string): Promise<AuthClaims | null> {
  const keyset = getJwks();
  if (!keyset || !cognitoIssuer || !cognitoAudience) {
    return null;
  }

  const verified = await jwtVerify(token, keyset, {
    issuer: cognitoIssuer,
    audience: cognitoAudience,
  });

  return verified.payload as AuthClaims;
}

function extractBearerToken(c: Context): string | null {
  const header = c.req.header("authorization") || c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length).trim();
}

export async function requireAuthenticatedMutation(c: Context, next: Next) {
  const failure = await authenticateRequest(c);
  if (failure) return failure;
  await next();
}

export async function authenticateRequest(c: Context): Promise<Response | undefined> {
  if (localDevBypass) {
    c.set("authClaims", { email: "local-dev@salus.local", "cognito:groups": ["evidence-editors"] });
    return;
  }

  try {
    const token = extractBearerToken(c);
    if (!token) {
      return c.json({ error: "Missing bearer token" }, 401);
    }

    const claims = await verifyBearerToken(token);
    if (!claims) {
      return c.json({ error: "Auth config missing. Set COGNITO_ISSUER and COGNITO_AUDIENCE." }, 503);
    }

    c.set("authClaims", claims);
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
}

export async function requireEditorRole(c: Context, next: Next) {
  if (!hasEditorRole(c)) {
    return c.json({ error: "Editor role required" }, 403);
  }

  await next();
}

/** Use for routes that are public by default but may expose editorial-only drafts. */
export async function requireEditorAccess(c: Context): Promise<Response | undefined> {
  const authFailure = await authenticateRequest(c);
  if (authFailure) return authFailure;
  if (!hasEditorRole(c)) {
    return c.json({ error: "Editor role required" }, 403);
  }
}

export function getAuthClaims(c: Context): AuthClaims | undefined {
  return c.get("authClaims") as AuthClaims | undefined;
}

export function getAuthGroups(c: Context): string[] {
  const claims = getAuthClaims(c);
  const groups = claims?.["cognito:groups"];
  return Array.isArray(groups) ? groups : [];
}

export function hasEditorRole(c: Context): boolean {
  return getAuthGroups(c).includes("evidence-editors");
}

export function getActorEmail(c: Context): string {
  const claims = getAuthClaims(c);
  return claims?.email || "unknown";
}
