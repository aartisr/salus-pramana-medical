import { describe, expect, it, vi } from 'vitest';
import { exchangeCallback, getAccessToken, sanitizeReturnPath, type AuthConfig } from '../../src/client/services/auth/session';

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

const config: AuthConfig = {
  domain: 'https://auth.example.test',
  clientId: 'client',
  redirectUri: 'https://app.example.test/auth/callback',
  scopes: 'openid email',
};

describe('PKCE session contract', () => {
  it('allows only the three approved return paths', () => {
    expect(sanitizeReturnPath('/')).toBe('/');
    expect(sanitizeReturnPath('/editor')).toBe('/editor');
    expect(sanitizeReturnPath('https://attacker.test')).toBe('/new');
  });

  it('rejects mismatched state, clears transients, and stores no session', async () => {
    const storage = memoryStorage({
      'salus.auth.pkceState': 'expected',
      'salus.auth.pkceVerifier': 'verifier',
      'salus.auth.pkceReturnTo': '/editor',
    });
    const request = vi.fn<typeof fetch>();

    await expect(exchangeCallback(config, 'https://app.example.test/auth/callback?code=abc&state=wrong', storage, request))
      .rejects.toThrow('Invalid authentication callback state');
    expect(request).not.toHaveBeenCalled();
    expect(storage.getItem('salus.auth.pkceState')).toBeNull();
    expect(storage.getItem('salus.auth.accessToken')).toBeNull();
  });

  it('exchanges a valid callback, stores expiry, and returns a scrubbed URL', async () => {
    const storage = memoryStorage({
      'salus.auth.pkceState': 'expected',
      'salus.auth.pkceVerifier': 'verifier',
      'salus.auth.pkceReturnTo': '/editor',
    });
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(
      JSON.stringify({ access_token: 'token', expires_in: 60 }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ));

    const result = await exchangeCallback(
      config,
      'https://app.example.test/auth/callback?code=abc&state=expected#done',
      storage,
      request,
      1_000,
    );

    expect(result).toEqual({ returnTo: '/editor', scrubbedPath: '/auth/callback#done' });
    expect(getAccessToken(storage, 60_999)).toBe('token');
    expect(getAccessToken(storage, 61_000)).toBeNull();
  });
});