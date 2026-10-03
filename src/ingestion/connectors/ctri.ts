import { buildConnectorOutput } from '../shared/connector-output';
import type { BoundedHttpClient } from '../shared/http';
import { createImportedDrafts } from '../shared/import-drafts';
import { normalizeImportedEvidence } from '../shared/normalize';
import type { ImportedDraftRepository, ImportedEvidenceDraft } from '../shared/repository';
import { extractCtriRefs, extractSourceTimestamp } from '../shared/source-parsers';

const fallbackReferences = ['CTRI/2023/10/058421', 'ICTRP-IND-2021-1033'];

export type CtriOptions = {
  http: BoundedHttpClient;
  repository?: ImportedDraftRepository;
  now?: () => number;
  limit?: number;
  url?: string;
  signal?: AbortSignal;
};

function normalizeReference(reference: string) {
  return reference.trim().replace(/\//g, '-');
}

function draftFromReference(reference: string, fallback: boolean, now: () => number): ImportedEvidenceDraft {
  const registryIdentifier = normalizeReference(reference);
  const isIctrp = registryIdentifier.toUpperCase().startsWith('ICTRP');
  return normalizeImportedEvidence({
    evidenceId: registryIdentifier,
    conditionId: 'cond-type2-diabetes',
    medicalSystem: 'Allopathy',
    interventionName: fallback ? 'CTRI/ICTRP Deterministic Fallback Study' : 'CTRI/ICTRP Imported Study',
    isPharmacological: true,
    evidenceGrade: 'B',
    studyMethodology: fallback ? 'Deterministic compatibility fallback: review pending' : 'Automated registry import: review pending',
    registryIdentifier,
    sourceUrl: isIctrp ? 'https://trialsearch.who.int/' : 'https://ctri.nic.in/',
    clinicalOutcomeSummary: 'Imported from a CTRI/ICTRP source. Requires editorial review before publication.',
  }, now);
}

export async function ingestCtri(options: CtriOptions) {
  const now = options.now ?? Date.now;
  const limit = Math.max(1, Math.floor(options.limit ?? 5));
  const response = options.url
    ? await options.http.getJson<unknown>(options.url, { signal: options.signal })
    : null;
  const liveReferences = response?.ok ? extractCtriRefs(response.data).slice(0, limit) : [];
  const fallbackUsed = liveReferences.length === 0;
  const sampledIds = fallbackUsed ? fallbackReferences.slice(0, limit) : liveReferences;
  const ingestion = await createImportedDrafts(
    'ctri',
    sampledIds.map((reference) => draftFromReference(reference, fallbackUsed, now)),
    options.repository,
  );

  return buildConnectorOutput(ingestion, {
    connectorId: 'ctri',
    registryPrefix: 'CTRI|ICTRP',
    sampledIds,
    fallbackUsed,
    fallbackReason: fallbackUsed ? (!options.url ? 'source_url_missing' : response?.ok ? 'empty_source' : 'http_failure') : undefined,
    retrievalFailure: response && !response.ok ? response : undefined,
    sourceTimestamp: response?.ok ? extractSourceTimestamp(response.data) : null,
    now,
  });
}