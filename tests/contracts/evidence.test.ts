import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/server/app/create-app';
import { repositoryFixture, request, testConfig, verifier } from '../server/server-test-kit';

const payload = { evidenceId: 'ev-new', conditionId: 'cond-1', medicalSystem: 'Allopathy', interventionName: 'Intervention', isPharmacological: true, evidenceGrade: 'A', studyMethodology: 'Randomized trial', registryIdentifier: 'PMID-123456', sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/123456/', clinicalOutcomeSummary: 'Observed measurable improvement', contraindications: [], interactionWarnings: [] };

describe('evidence contracts', () => {
  it('searches, sorts, paginates, and exports the fixed CSV projection', async () => {
    const app = createApp({ config: testConfig, repositories: repositoryFixture().repositories });
    const list = await request(app, '/evidence?q=metformin&limit=1&cursor=0');
    const body = await list.json() as any;
    expect(body.rows).toHaveLength(1);
    expect(body.metadata.pagination).toMatchObject({ limit: 1, cursor: 0, returnedCount: 1 });
    const exportResponse = await request(app, '/evidence/export.csv?conditionId=cond-1');
    expect(exportResponse.headers.get('content-disposition')).toContain('salus-evidence-export.csv');
    expect((await exportResponse.text()).split('\n')[0].split(',')).toHaveLength(15);
  });

  it('requires editor access for drafts and forces authenticated submissions to draft', async () => {
    const fixture = repositoryFixture();
    const app = createApp({ config: testConfig, repositories: fixture.repositories, jwtVerifier: verifier() });
    expect((await request(app, '/evidence?includeDrafts=true')).status).toBe(401);
    const drafts = await request(app, '/evidence?includeDrafts=true', { headers: { authorization: 'Bearer valid' } });
    expect((await drafts.json() as any).rows).toHaveLength(2);
    const created = await request(app, '/evidence', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer valid' }, body: JSON.stringify({ ...payload, publicationStatus: 'published' }) });
    expect(created.status).toBe(201);
    expect((await created.json() as any).publicationStatus).toBe('draft');
    expect(fixture.audits).toContainEqual(expect.objectContaining({ action: 'evidence.create' }));
    expect((await request(app, '/evidence', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer valid' }, body: JSON.stringify(payload) })).status).toBe(409);
  });

  it('publishes only allowed statuses and records the exact audit action', async () => {
    const fixture = repositoryFixture();
    const app = createApp({ config: testConfig, repositories: fixture.repositories, jwtVerifier: verifier() });
    expect((await request(app, '/evidence/ev-1/publish', { method: 'PATCH', headers: { 'content-type': 'application/json', authorization: 'Bearer valid' }, body: JSON.stringify({ publicationStatus: 'under_review' }) })).status).toBe(400);
    const published = await request(app, '/evidence/ev-draft/publish', { method: 'PATCH', headers: { 'content-type': 'application/json', authorization: 'Bearer valid' }, body: JSON.stringify({ publicationStatus: 'published' }) });
    expect(published.status).toBe(200);
    expect(fixture.audits).toContainEqual(expect.objectContaining({ action: 'evidence.published', targetEvidenceId: 'ev-draft' }));
  });
});