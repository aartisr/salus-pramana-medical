import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/server/app/create-app';
import { request, testConfig, verifier } from '../server/server-test-kit';

describe('editor status contract', () => {
  it('distinguishes missing, unconfigured, invalid, viewer, and editor identities', async () => {
    expect((await request(createApp({ config: testConfig }), '/auth/editor-status')).status).toBe(401);
    expect((await request(createApp({ config: testConfig }), '/auth/editor-status', { headers: { authorization: 'Bearer token' } })).status).toBe(503);
    expect((await request(createApp({ config: testConfig, jwtVerifier: verifier() }), '/auth/editor-status', { headers: { authorization: 'Bearer invalid' } })).status).toBe(401);
    const viewer = await request(createApp({ config: testConfig, jwtVerifier: verifier(['viewers']) }), '/auth/editor-status', { headers: { authorization: 'Bearer valid' } });
    await expect(viewer.json()).resolves.toEqual({ authenticated: true, actorEmail: 'actor@salus.local', groups: ['viewers'], isEditor: false });
    const editor = await request(createApp({ config: testConfig, jwtVerifier: verifier() }), '/auth/editor-status', { headers: { authorization: 'Bearer valid' } });
    await expect(editor.json()).resolves.toMatchObject({ authenticated: true, isEditor: true });
  });
});