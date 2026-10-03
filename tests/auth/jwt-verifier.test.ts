import { generateKeyPairSync, sign } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { createJwtVerifier } from '../../src/server/auth/jwt-verifier';

const issuer = 'https://issuer.example.test/pool';
const audience = 'salus-client';
const now = Date.parse('2026-09-30T07:00:00Z');
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'key-1', alg: 'RS256', use: 'sig' };

function token(overrides: Record<string, unknown> = {}) {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'key-1', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: issuer,
    aud: audience,
    exp: now / 1000 + 300,
    email: 'editor@salus.local',
    'cognito:groups': ['evidence-editors'],
    ...overrides,
  })).toString('base64url');
  const signature = sign('RSA-SHA256', Buffer.from(`${header}.${payload}`), privateKey).toString('base64url');
  return `${header}.${payload}.${signature}`;
}

describe('Cognito-compatible JWT verifier', () => {
  it('verifies signed claims and caches the remote JWKS', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ keys: [jwk] }), { status: 200 }));
    const verifier = createJwtVerifier({ issuer, audience, fetch: fetcher as typeof fetch, now: () => now })!;

    await expect(verifier.verify(token())).resolves.toMatchObject({ email: 'editor@salus.local' });
    await expect(verifier.verify(token())).resolves.toMatchObject({ 'cognito:groups': ['evidence-editors'] });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['issuer', { iss: 'https://wrong.example.test' }],
    ['audience', { aud: 'wrong-client' }],
    ['expiration', { exp: now / 1000 }],
    ['not-before', { nbf: now / 1000 + 60 }],
  ])('rejects invalid %s claims', async (_label, overrides) => {
    const verifier = createJwtVerifier({
      issuer,
      audience,
      fetch: async () => new Response(JSON.stringify({ keys: [jwk] }), { status: 200 }),
      now: () => now,
    })!;
    await expect(verifier.verify(token(overrides))).rejects.toThrow();
  });

  it('is unavailable until both issuer and audience are configured', () => {
    expect(createJwtVerifier({ issuer })).toBeUndefined();
    expect(createJwtVerifier({ audience })).toBeUndefined();
  });
});