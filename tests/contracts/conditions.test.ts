import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/server/app/create-app';
import { repositoryFixture, request, testConfig, verifier } from '../server/server-test-kit';

describe('condition contracts', () => {
  it('lists conditions and restricts audited creation to editors', async () => {
    const fixture = repositoryFixture();
    const app = createApp({ config: testConfig, repositories: fixture.repositories, jwtVerifier: verifier() });
    const list = await request(app, '/conditions');
    expect(list.status).toBe(200);
    expect((await list.json()) as unknown[]).toHaveLength(1);
    const created = await request(app, '/conditions', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer valid' }, body: JSON.stringify({ conditionId: 'cond-2', icd11Code: 'BA00', standardName: 'Hypertension' }) });
    expect(created.status).toBe(201);
    expect(fixture.audits).toContainEqual(expect.objectContaining({ action: 'condition.create', targetEvidenceId: 'cond-2' }));
  });

  it('returns 403 to authenticated non-editors and 400 for invalid payloads', async () => {
    const fixture = repositoryFixture();
    const viewer = createApp({ config: testConfig, repositories: fixture.repositories, jwtVerifier: verifier(['viewers']) });
    expect((await request(viewer, '/conditions', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer valid' }, body: '{}' })).status).toBe(403);
    const editor = createApp({ config: testConfig, repositories: fixture.repositories, jwtVerifier: verifier() });
    expect((await request(editor, '/conditions', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer valid' }, body: '{}' })).status).toBe(400);
  });
});