import { buildConnectorOutput } from '../shared/connector-output';
import type { BoundedHttpClient } from '../shared/http';
import { createImportedDrafts } from '../shared/import-drafts';
import { normalizeImportedEvidence } from '../shared/normalize';
import type { ImportedDraftRepository, ImportedEvidenceDraft } from '../shared/repository';
import { extractAyushRefs, extractSourceTimestamp } from '../shared/source-parsers';

const fallbackReferences = ['AYUSH-PH-2019-031', 'DHARA-2024-0112'];

export type AyushOptions = {
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
  const isDhara = registryIdentifier.toUpperCase().startsWith('DHARA');
  return normalizeImportedEvidence({
    evidenceId: registryIdentifier,
    conditionId: 'cond-type2-diabetes',
    medicalSystem: 'Ayurveda',
    interventionName: fallback ? 'AYUSH/DHARA Deterministic Fallback Study' : 'AYUSH/DHARA Imported Study',
    isPharmacological: false,
    evidenceGrade: 'C',
    studyMethodology: fallback ? 'Deterministic compatibility fallback: review pending' : 'Automated registry import: review pending',
    registryIdentifier,
    sourceUrl: isDhara ? 'https://ayush.gov.in/dhara/' : 'https://ayush.gov.in/research/',
    clinicalOutcomeSummary: 'Imported from an AYUSH/DHARA source. Requires editorial review before publication.',
  }, now);
}

export async function ingestAyush(options: AyushOptions) {
  const now = options.now ?? Date.now;
  const limit = Math.max(1, Math.floor(options.limit ?? 5));
  const response = options.url
    ? await options.http.getJson<unknown>(options.url, { signal: options.signal })
    : null;
  const liveReferences = response?.ok ? extractAyushRefs(response.data).slice(0, limit) : [];
  const fallbackUsed = liveReferences.length === 0;
  const sampledIds = fallbackUsed ? fallbackReferences.slice(0, limit) : liveReferences;
  const ingestion = await createImportedDrafts(
    'ayush',
    sampledIds.map((reference) => draftFromReference(reference, fallbackUsed, now)),
    options.repository,
  );

  return buildConnectorOutput(ingestion, {
    connectorId: 'ayush',
    registryPrefix: 'AYUSH|DHARA',
    sampledIds,
    fallbackUsed,
    fallbackReason: fallbackUsed ? (!options.url ? 'source_url_missing' : response?.ok ? 'empty_source' : 'http_failure') : undefined,
    retrievalFailure: response && !response.ok ? response : undefined,
    sourceTimestamp: response?.ok ? extractSourceTimestamp(response.data) : null,
    now,
  });
}