import { describe, expect, it } from 'vitest';
import { ingestAyush } from '../../src/ingestion/connectors/ayush';
import { ingestClinicalTrials } from '../../src/ingestion/connectors/clinical-trials';
import { ingestCtri } from '../../src/ingestion/connectors/ctri';
import { createBoundedHttpClient, type HttpClock } from '../../src/ingestion/shared/http';
import type { ImportedDraftRepository, ImportedEvidenceDraft } from '../../src/ingestion/shared/repository';

class FixedClock implements HttpClock {
  now() { return Date.parse('2025-01-02T03:04:05.000Z'); }
  async sleep() {}
  setTimeout(callback: () => void) { return { callback }; }
  clearTimeout() {}
}

class CollectingRepository implements ImportedDraftRepository {
  readonly records: ImportedEvidenceDraft[] = [];

  async createImportedDraft(draft: ImportedEvidenceDraft) {
    if (this.records.some((record) => record.evidenceId === draft.evidenceId)) {
      return { created: false as const, reason: 'duplicate' as const };
    }
    this.records.push(structuredClone(draft));
    return { created: true as const };
  }
}

const now = () => Date.parse('2025-01-02T03:04:05.000Z');

function jsonClient(payload: unknown) {
  return createBoundedHttpClient({}, {
    fetch: async () => new Response(JSON.stringify(payload), { status: 200 }),
    clock: new FixedClock(),
  });
}

describe('registry connectors', () => {
  it('imports bounded ClinicalTrials.gov records with source metadata', async () => {
    const repository = new CollectingRepository();
    const output = await ingestClinicalTrials({
      http: jsonClient({
        studies: [
          {
            protocolSection: {
              identificationModule: { nctId: 'NCT00000001' },
              statusModule: { lastUpdatePostDateStruct: { date: '2024-05-11' } },
            },
          },
          { protocolSection: { identificationModule: { nctId: 'NCT00000002' } } },
        ],
      }),
      repository,
      now,
      limit: 1,
      query: 'diabetes',
    });

    expect(output.connector).toMatchObject({
      id: 'clinicaltrials',
      registryPrefix: 'NCT',
      sampledIds: ['NCT00000001'],
      fallbackUsed: false,
      freshness: {
        fetchedAt: '2025-01-02T03:04:05.000Z',
        sourceTimestamp: '2024-05-11T00:00:00.000Z',
      },
    });
    expect(output.ingestion).toEqual({ source: 'clinicaltrials', ingested: 1, skipped: 0 });
    expect(repository.records[0]).toMatchObject({
      evidenceId: 'NCT-00000001',
      registryIdentifier: 'NCT-00000001',
      sourceUrl: 'https://clinicaltrials.gov/study/NCT00000001',
    });
  });

  it('parses AYUSH/DHARA and CTRI/ICTRP payload variants', async () => {
    const ayushRepository = new CollectingRepository();
    const ctriRepository = new CollectingRepository();
    const ayush = await ingestAyush({
      http: jsonClient({
        metadata: { lastUpdated: '2024-06-04T11:20:00Z' },
        records: [{ id: 'DHARA-2024-0112' }],
      }),
      repository: ayushRepository,
      now,
      url: 'https://ayush.gov.in/data.json',
    });
    const ctri = await ingestCtri({
      http: jsonClient({ trials: [{ reference: 'CTRI/2023/10/058421' }] }),
      repository: ctriRepository,
      now,
      url: 'https://ctri.nic.in/data.json',
    });

    expect(ayush.connector.sampledIds).toEqual(['DHARA-2024-0112']);
    expect(ayush.connector.freshness.sourceTimestamp).toBe('2024-06-04T11:20:00.000Z');
    expect(ayushRepository.records[0].registryIdentifier).toBe('DHARA-2024-0112');
    expect(ctri.connector.sampledIds).toEqual(['CTRI/2023/10/058421']);
    expect(ctriRepository.records[0].registryIdentifier).toBe('CTRI-2023-10-058421');
  });

  it('returns labeled deterministic fallbacks for invalid JSON and network failures', async () => {
    const invalidJson = createBoundedHttpClient({ maxRetries: 0 }, {
      fetch: async () => new Response('{broken', { status: 200 }),
      clock: new FixedClock(),
    });
    const networkFailure = createBoundedHttpClient({ maxRetries: 0 }, {
      fetch: async () => { throw new TypeError('offline'); },
      clock: new FixedClock(),
    });

    const ayush = await ingestAyush({
      http: invalidJson,
      repository: new CollectingRepository(),
      now,
      url: 'https://ayush.gov.in/data.json',
    });
    const ctri = await ingestCtri({
      http: networkFailure,
      repository: new CollectingRepository(),
      now,
      url: 'https://ctri.nic.in/data.json',
    });

    expect(ayush.connector).toMatchObject({
      sampledIds: ['AYUSH-PH-2019-031', 'DHARA-2024-0112'],
      fallbackUsed: true,
      fallbackLabel: 'deterministic-compatibility-fallback',
      retrievalFailure: { errorKind: 'invalid_json' },
    });
    expect(ctri.connector).toMatchObject({
      sampledIds: ['CTRI/2023/10/058421', 'ICTRP-IND-2021-1033'],
      fallbackUsed: true,
      fallbackLabel: 'deterministic-compatibility-fallback',
      retrievalFailure: { errorKind: 'network_error' },
    });
  });
});