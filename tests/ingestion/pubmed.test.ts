import { describe, expect, it } from 'vitest';
import { importPubmedPmids } from '../../src/ingestion/pubmed';
import type {
  ImportedDraftRepository,
  ImportedEvidenceDraft,
} from '../../src/ingestion/shared/repository';

class ConditionalMemoryRepository implements ImportedDraftRepository {
  readonly records = new Map<string, ImportedEvidenceDraft>();
  writes = 0;

  async createImportedDraft(draft: ImportedEvidenceDraft) {
    await Promise.resolve();
    if (this.records.has(draft.evidenceId)) {
      return { created: false as const, reason: 'duplicate' as const };
    }

    this.records.set(draft.evidenceId, structuredClone(draft));
    this.writes += 1;
    return { created: true as const };
  }
}

const fixedNow = () => Date.parse('2025-01-02T03:04:05.000Z');

describe('PubMed importer', () => {
  it('returns structured missing-store behavior', async () => {
    await expect(importPubmedPmids(['9742977', '17569207'], { now: fixedNow })).resolves.toEqual({
      source: 'pubmed',
      ingested: 0,
      skipped: 2,
      reason: 'DYNAMODB_TABLE missing',
      failure: {
        kind: 'missing_store',
        message: 'No imported-draft repository was configured',
      },
    });
  });

  it('normalizes PMIDs and deduplicates repeated inputs', async () => {
    const repository = new ConditionalMemoryRepository();

    const result = await importPubmedPmids(['9742977', '9742977', ' 17569207 '], {
      repository,
      now: fixedNow,
    });

    expect(result).toEqual({ source: 'pubmed', ingested: 2, skipped: 1 });
    expect(repository.records.get('PMID-9742977')).toMatchObject({
      registryIdentifier: 'PMID-9742977',
      publicationStatus: 'draft',
      lastVerifiedDate: '2025-01-02',
    });
  });

  it('preserves the first record byte-for-byte across a duplicate race', async () => {
    const repository = new ConditionalMemoryRepository();
    const first = importPubmedPmids(['9742977'], { repository, now: fixedNow });
    const second = importPubmedPmids(['9742977'], {
      repository,
      now: () => Date.parse('2026-02-03T00:00:00.000Z'),
    });

    const [firstResult, secondResult] = await Promise.all([first, second]);
    const storedBeforeRepeat = JSON.stringify(repository.records.get('PMID-9742977'));
    const repeatedResult = await importPubmedPmids(['9742977'], {
      repository,
      now: () => Date.parse('2027-03-04T00:00:00.000Z'),
    });
    const storedAfterRepeat = JSON.stringify(repository.records.get('PMID-9742977'));

    expect(firstResult.ingested + secondResult.ingested).toBe(1);
    expect(firstResult.skipped + secondResult.skipped).toBe(1);
    expect(repeatedResult).toEqual({ source: 'pubmed', ingested: 0, skipped: 1 });
    expect(repository.writes).toBe(1);
    expect(storedAfterRepeat).toBe(storedBeforeRepeat);
    expect(repository.records.get('PMID-9742977')?.lastVerifiedDate).toBe('2025-01-02');
  });
});