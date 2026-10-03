import { describe, expect, it } from 'vitest';
import {
  createBoundedHttpClient,
  type HttpClock,
  type HttpFetch,
} from '../../src/ingestion/shared/http';
import {
  extractAyushRefs,
  extractClinicalTrialsSourceTimestamp,
  extractCtriRefs,
  extractNctIds,
  extractSourceTimestamp,
} from '../../src/ingestion/shared/source-parsers';
import { normalizeImportedEvidence } from '../../src/ingestion/shared/normalize';

class FixedClock implements HttpClock {
  private timestamp = Date.parse('2025-01-02T03:04:05.000Z');
  readonly sleeps: number[] = [];

  now() {
    return this.timestamp;
  }

  async sleep(milliseconds: number) {
    this.sleeps.push(milliseconds);
    this.timestamp += milliseconds;
  }

  setTimeout(callback: () => void) {
    return { callback };
  }

  clearTimeout() {}
}

class ImmediateTimeoutClock extends FixedClock {
  override setTimeout(callback: () => void) {
    queueMicrotask(callback);
    return { callback };
  }
}

function response(body: string, status = 200, headers?: HeadersInit) {
  return new Response(body, { status, headers });
}

describe('bounded HTTP policy', () => {
  it('returns parsed JSON and tracks attempts', async () => {
    const fetch: HttpFetch = async () => response('{"rows":[{"id":"ok"}]}');
    const client = createBoundedHttpClient({}, { fetch, clock: new FixedClock() });

    const result = await client.getJson<{ rows: Array<{ id: string }> }>('https://example.test/data');

    expect(result).toEqual({
      ok: true,
      data: { rows: [{ id: 'ok' }] },
      status: 200,
      attempts: 1,
      responseBytes: 22,
    });
  });

  it('retries configured statuses with deterministic backoff', async () => {
    const clock = new FixedClock();
    let calls = 0;
    const fetch: HttpFetch = async () => {
      calls += 1;
      return calls === 1 ? response('{}', 503) : response('{"ok":true}');
    };
    const client = createBoundedHttpClient(
      { maxRetries: 2, baseDelayMs: 25 },
      { fetch, clock },
    );

    const result = await client.getJson('https://example.test/retry');

    expect(result.ok).toBe(true);
    expect(calls).toBe(2);
    expect(clock.sleeps).toEqual([25]);
    expect(result.attempts).toBe(2);
  });

  it('returns a structured timeout after aborting the request', async () => {
    const fetch: HttpFetch = async (_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('timed out', 'AbortError')));
    });
    const client = createBoundedHttpClient(
      { maxRetries: 0, timeoutMs: 10 },
      { fetch, clock: new ImmediateTimeoutClock() },
    );

    const result = await client.getJson('https://example.test/timeout');

    expect(result).toMatchObject({
      ok: false,
      errorKind: 'timeout',
      retryable: true,
      attempts: 1,
    });
  });

  it('distinguishes invalid JSON and network failures', async () => {
    const invalidClient = createBoundedHttpClient({}, {
      fetch: async () => response('{broken'),
      clock: new FixedClock(),
    });
    const networkClient = createBoundedHttpClient({ maxRetries: 0 }, {
      fetch: async () => { throw new TypeError('connection reset'); },
      clock: new FixedClock(),
    });

    await expect(invalidClient.getJson('https://example.test/json')).resolves.toMatchObject({
      ok: false,
      errorKind: 'invalid_json',
      retryable: false,
      status: 200,
    });
    await expect(networkClient.getJson('https://example.test/network')).resolves.toMatchObject({
      ok: false,
      errorKind: 'network_error',
      retryable: true,
      attempts: 1,
    });
  });

  it('enforces response-size and per-run request caps', async () => {
    const fetch: HttpFetch = async () => response('{"payload":"too large"}');
    const sizeClient = createBoundedHttpClient({ maxResponseBytes: 8 }, { fetch, clock: new FixedClock() });
    const capClient = createBoundedHttpClient({ maxRequestsPerRun: 1 }, { fetch, clock: new FixedClock() });

    await expect(sizeClient.getJson('https://example.test/large')).resolves.toMatchObject({
      ok: false,
      errorKind: 'response_too_large',
      retryable: false,
      attempts: 1,
    });
    expect((await capClient.getJson('https://example.test/first')).ok).toBe(true);
    await expect(capClient.getJson('https://example.test/second')).resolves.toMatchObject({
      ok: false,
      errorKind: 'rate_limited',
      retryable: false,
      attempts: 0,
    });
  });
});

describe('source parsing and normalization', () => {
  it('parses registry variants and latest source timestamps', () => {
    const clinical = {
      studies: [
        {
          protocolSection: {
            identificationModule: { nctId: 'NCT00000001' },
            statusModule: { lastUpdatePostDateStruct: { date: '2024-05-11' } },
          },
        },
      ],
    };

    expect(extractNctIds(clinical)).toEqual(['NCT00000001']);
    expect(extractClinicalTrialsSourceTimestamp(clinical)).toBe('2024-05-11T00:00:00.000Z');
    expect(extractAyushRefs({ records: [{ id: 'DHARA-2' }] })).toEqual(['DHARA-2']);
    expect(extractCtriRefs({ trials: [{ reference: 'CTRI/2024/01/001' }] })).toEqual(['CTRI/2024/01/001']);
    expect(extractSourceTimestamp({
      metadata: { lastUpdated: '2024-06-02T10:15:00Z' },
      records: [{ updatedAt: '2024-06-01T03:10:00Z' }],
    })).toBe('2024-06-02T10:15:00.000Z');
  });

  it('normalizes imported drafts with a fixed clock', () => {
    const draft = normalizeImportedEvidence({
      evidenceId: 'PMID-1',
      conditionId: 'cond-type2-diabetes',
      medicalSystem: 'Allopathy',
      interventionName: 'Imported study',
      isPharmacological: true,
      evidenceGrade: 'B',
      studyMethodology: 'Automated import: review pending',
      registryIdentifier: 'PMID-1',
      sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/1/',
      clinicalOutcomeSummary: 'Imported evidence awaiting editorial review.',
    }, () => Date.parse('2025-01-02T03:04:05.000Z'));

    expect(draft).toMatchObject({
      publicationStatus: 'draft',
      contraindications: [],
      interactionWarnings: [],
      lastVerifiedDate: '2025-01-02',
    });
  });
});