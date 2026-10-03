import { createPublicKey, verify as verifySignature, type JsonWebKey } from 'node:crypto';

export interface AuthClaims {
  email?: string;
  'cognito:groups'?: string[];
  [key: string]: unknown;
}

export interface JwtVerifier {
  verify(token: string): Promise<AuthClaims>;
}

export interface JwtVerifierConfig {
  issuer?: string;
  audience?: string;
  fetch?: typeof globalThis.fetch;
  now?: () => number;
  cacheTtlMs?: number;
}

type Jwk = JsonWebKey & { kid?: string; alg?: string; use?: string };

function decodeJsonPart(part: string): Record<string, unknown> {
  try {
    return JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as Record<string, unknown>;
  } catch {
    throw new Error('Invalid token encoding');
  }
}

function hasAudience(value: unknown, expected: string): boolean {
  return value === expected || (Array.isArray(value) && value.includes(expected));
}

export function createJwtVerifier(config: JwtVerifierConfig): JwtVerifier | undefined {
  if (!config.issuer || !config.audience) return undefined;

  const issuer = config.issuer.replace(/\/$/, '');
  const fetcher = config.fetch ?? globalThis.fetch;
  const now = config.now ?? Date.now;
  const cacheTtlMs = config.cacheTtlMs ?? 5 * 60_000;
  let cached: { expiresAt: number; keys: Jwk[] } | undefined;

  async function getKeys() {
    if (cached && cached.expiresAt > now()) return cached.keys;
    const response = await fetcher(`${issuer}/.well-known/jwks.json`);
    if (!response.ok) throw new Error('Unable to load signing keys');
    const body = await response.json() as { keys?: Jwk[] };
    if (!Array.isArray(body.keys)) throw new Error('Invalid signing key response');
    cached = { expiresAt: now() + cacheTtlMs, keys: body.keys };
    return body.keys;
  }

  return {
    async verify(token) {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token');
      const [encodedHeader, encodedPayload, encodedSignature] = parts;
      const header = decodeJsonPart(encodedHeader);
      const claims = decodeJsonPart(encodedPayload) as AuthClaims;
      if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw new Error('Unsupported token');

      const keys = await getKeys();
      const jwk = keys.find((candidate) => candidate.kid === header.kid && (!candidate.alg || candidate.alg === 'RS256'));
      if (!jwk) throw new Error('Unknown signing key');
      const validSignature = verifySignature(
        'RSA-SHA256',
        Buffer.from(`${encodedHeader}.${encodedPayload}`),
        createPublicKey({ key: jwk, format: 'jwk' }),
        Buffer.from(encodedSignature, 'base64url'),
      );
      if (!validSignature) throw new Error('Invalid token signature');

      const nowSeconds = Math.floor(now() / 1000);
      if (claims.iss !== issuer) throw new Error('Invalid token issuer');
      if (!hasAudience(claims.aud, config.audience!)) throw new Error('Invalid token audience');
      if (typeof claims.exp !== 'number' || claims.exp <= nowSeconds) throw new Error('Token expired');
      if (typeof claims.nbf === 'number' && claims.nbf > nowSeconds) throw new Error('Token not active');
      return claims;
    },
  };
}