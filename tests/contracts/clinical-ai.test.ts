import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/server/app/create-app';
import { request, testConfig } from '../server/server-test-kit';

describe('clinical AI contract', () => {
  it('uses deterministic fallback without a provider', async () => {
    const response = await request(createApp({ config: testConfig }), '/api/clinical-ai', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ condition: { standardName: 'Diabetes' } }) });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: 'fallback', source: 'SALUS Pramana Deterministic Reasoning Engine v1.0.0' });
  });

  it('returns injected provider output and sanitizes provider failures', async () => {
    const success = await request(createApp({ config: testConfig, clinicalAiProvider: { async generate() { return 'grounded result'; } } }), '/api/clinical-ai', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    await expect(success.json()).resolves.toMatchObject({ status: 'success', content: 'grounded result' });
    const failed = await request(createApp({ config: testConfig, clinicalAiProvider: { async generate() { throw new Error('secret-key-value'); } } }), '/api/clinical-ai', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    const body = await failed.text();
    expect(body).toContain('AI provider error');
    expect(body).not.toContain('secret-key-value');
  });
});