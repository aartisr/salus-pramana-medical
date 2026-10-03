import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/server/app/create-app';
import { request, testConfig } from '../server/server-test-kit';

describe('global HTTP contract', () => {
  it('serves browser-prefixed and legacy health contracts', async () => {
    const app = createApp({ config: testConfig });
    const [browserResponse, legacyResponse] = await Promise.all([
      request(app, '/api/health'),
      request(app, '/health'),
    ]);
    expect(browserResponse.status).toBe(200);
    expect(await browserResponse.json()).toEqual(await legacyResponse.json());
  });
  it('sets correlation, CORS, and security headers and emits body-free structured logs', async () => {
    const log = vi.fn();
    const response = await request(createApp({ config: testConfig, logger: { log } }), '/health', { headers: { origin: 'http://localhost:5173', authorization: 'Bearer secret-token', 'x-request-id': 'req-7' } });
    expect(response.status).toBe(200);
    expect(response.headers.get('x-correlation-id')).toBe('req-7');
    expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('x-frame-options')).toBe('DENY');
    const serialized = JSON.stringify(log.mock.calls);
    expect(serialized).not.toContain('secret-token');
    expect(serialized).not.toContain('authorization');

    const preflight = await request(createApp({ config: testConfig }), '/evidence', { method: 'OPTIONS', headers: { origin: 'http://localhost:5173' } });
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('rejects oversized payloads before parsing and returns the frozen not-found envelope', async () => {
    const tooLarge = await request(createApp({ config: testConfig }), '/api/clinical-ai', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content: 'x'.repeat(1_000_001) }) });
    expect(tooLarge.status).toBe(413);
    await expect(tooLarge.json()).resolves.toEqual({ error: 'Request body exceeds the 1 MB limit' });
    const missing = await request(createApp({ config: testConfig }), '/does-not-exist');
    expect(missing.status).toBe(404);
    await expect(missing.json()).resolves.toEqual({ error: 'Not found' });
  });
});