import { buildConnectorOutput } from '../shared/connector-output';
import type { BoundedHttpClient } from '../shared/http';
import { createImportedDrafts } from '../shared/import-drafts';
import { normalizeImportedEvidence } from '../shared/normalize';
import type { ImportedDraftRepository } from '../shared/repository';
import { extractClinicalTrialsSourceTimestamp, extractNctIds } from '../shared/source-parsers';

const apiUrl = 'https://clinicaltrials.gov/api/v2/studies';
const fallbackReferences = ['NCT00000620', 'NCT00000378'];

export type ClinicalTrialsOptions = {
  http: BoundedHttpClient;
  repository?: ImportedDraftRepository;
  now?: () => number;
  limit?: number;
  query?: string;
  signal?: AbortSignal;
};

function draftFromNct(nctId: string, fallback: boolean, now: () => number) {
  const suffix = nctId.replace(/^NCT/i, '');
  return normalizeImportedEvidence({
    evidenceId: `NCT-${suffix}`,
    conditionId: 'cond-type2-diabetes',
    medicalSystem: 'Allopathy',
    interventionName: fallback ? 'ClinicalTrials.gov Deterministic Fallback Study' : 'ClinicalTrials.gov Imported Study',
    isPharmacological: true,
    evidenceGrade: 'B',
    studyMethodology: fallback ? 'Deterministic compatibility fallback: review pending' : 'Automated registry import: review pending',
    registryIdentifier: `NCT-${suffix}`,
    sourceUrl: `https://clinicaltrials.gov/study/${nctId}`,
    clinicalOutcomeSummary: 'Imported from ClinicalTrials.gov. Requires editorial review before publication.',
  }, now);
}

export async function ingestClinicalTrials(options: ClinicalTrialsOptions) {
  const now = options.now ?? Date.now;
  const limit = Math.max(1, Math.floor(options.limit ?? 5));
  const params = new URLSearchParams({
    'query.term': options.query ?? 'hypertension OR diabetes',
    pageSize: String(limit),
    format: 'json',
  });
  const response = await options.http.getJson<unknown>(`${apiUrl}?${params}`, { signal: options.signal });
  const liveReferences = response.ok ? extractNctIds(response.data).slice(0, limit) : [];
  const fallbackUsed = liveReferences.length === 0;
  const sampledIds = fallbackUsed ? fallbackReferences.slice(0, limit) : liveReferences;
  const ingestion = await createImportedDrafts(
    'clinicaltrials',
    sampledIds.map((reference) => draftFromNct(reference, fallbackUsed, now)),
    options.repository,
  );

  return buildConnectorOutput(ingestion, {
    connectorId: 'clinicaltrials',
    registryPrefix: 'NCT',
    sampledIds,
    fallbackUsed,
    fallbackReason: fallbackUsed ? (response.ok ? 'empty_source' : 'http_failure') : undefined,
    retrievalFailure: response.ok ? undefined : response,
    sourceTimestamp: response.ok ? extractClinicalTrialsSourceTimestamp(response.data) : null,
    now,
  });
}