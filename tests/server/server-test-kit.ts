import type { AddressInfo } from 'node:net';
import type { Express } from 'express';
import type { JwtVerifier } from '../../src/server/auth/jwt-verifier';
import type { MedicalCondition, ServerRepositories, TreatmentEvidence } from '../../src/server/app/create-app';

export function verifier(groups: string[] = ['evidence-editors']): JwtVerifier {
  return { async verify(token) { if (token === 'invalid') throw new Error('invalid'); return { email: 'actor@salus.local', 'cognito:groups': groups }; } };
}

export function repositoryFixture() {
  const conditions = new Map<string, MedicalCondition>([['cond-1', { conditionId: 'cond-1', icd11Code: '5A11', standardName: 'Diabetes' }]]);
  const evidence = new Map<string, TreatmentEvidence>([
    ['ev-1', { evidenceId: 'ev-1', conditionId: 'cond-1', medicalSystem: 'Allopathy', interventionName: 'Metformin', isPharmacological: true, evidenceGrade: 'A', studyMethodology: 'Randomized trial', sampleSize: 500, registryIdentifier: 'PMID-100001', sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/100001/', clinicalOutcomeSummary: 'Improved control', contraindications: ['Renal disease'], interactionWarnings: ['Monitor insulin'], publicationStatus: 'published', lastVerifiedDate: '2026-09-01' }],
    ['ev-draft', { evidenceId: 'ev-draft', conditionId: 'cond-1', medicalSystem: 'Ayurveda', interventionName: 'Curcumin', isPharmacological: false, evidenceGrade: 'B', studyMethodology: 'Controlled trial', registryIdentifier: 'AYUSH-100002', sourceUrl: 'https://ayush.gov.in/study/100002', clinicalOutcomeSummary: 'Inflammatory marker reduction', contraindications: [], interactionWarnings: [], publicationStatus: 'draft', lastVerifiedDate: '2026-08-01' }],
  ]);
  const audits: unknown[] = [];
  const repositories: ServerRepositories = {
    async listConditions() { return [...conditions.values()]; },
    async getCondition(id) { return conditions.get(id); },
    async getEvidence(id, includeDrafts = false) {
      const row = evidence.get(id);
      return row && (includeDrafts || row.publicationStatus === 'published' || row.publicationStatus === undefined) ? row : undefined;
    },
    async createCondition(row, audit) { conditions.set(row.conditionId, row); audits.push(audit); return row; },
    async listEvidence(conditionId, includeDrafts = false) { return [...evidence.values()].filter((row) => (!conditionId || row.conditionId === conditionId) && (includeDrafts || row.publicationStatus === 'published' || row.publicationStatus === undefined)); },
    async createEvidence(row, audit) { if (evidence.has(row.evidenceId)) return undefined; evidence.set(row.evidenceId, row); audits.push(audit); return row; },
    async updateEvidencePublicationStatus(id, status, audit) { const row = evidence.get(id); if (!row) return undefined; const updated = { ...row, publicationStatus: status }; evidence.set(id, updated); audits.push(audit); return updated; },
  };
  return { repositories, audits };
}

export async function request(app: Express, path: string, init?: RequestInit) {
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const port = (server.address() as AddressInfo).port;
  try { return await fetch(`http://127.0.0.1:${port}${path}`, init); }
  finally { await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); }
}

export const testConfig = { nodeEnv: 'test', port: 0, corsAllowedOrigins: ['http://localhost:5173'], persistenceAdapter: 'memory' as const };
