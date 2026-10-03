import { createImportedDrafts, type ImportResult } from './shared/import-drafts';
import { normalizeImportedEvidence } from './shared/normalize';
import type { ImportedDraftRepository } from './shared/repository';

export type PubmedImportOptions = {
  repository?: ImportedDraftRepository;
  now?: () => number;
};

function normalizePmid(value: string) {
  const pmid = value.trim();
  return /^\d+$/.test(pmid) ? pmid : null;
}

export function pubmedDraft(pmid: string, now: () => number = Date.now) {
  return normalizeImportedEvidence({
    evidenceId: `PMID-${pmid}`,
    conditionId: 'cond-type2-diabetes',
    medicalSystem: 'Allopathy',
    interventionName: 'PubMed Imported Study',
    isPharmacological: true,
    evidenceGrade: 'B',
    studyMethodology: 'Automated import: review pending',
    registryIdentifier: `PMID-${pmid}`,
    sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    clinicalOutcomeSummary: 'Imported from PubMed pipeline. Requires editorial review before publication.',
  }, now);
}

export async function importPubmedPmids(
  pmids: string[],
  options: PubmedImportOptions = {},
): Promise<ImportResult> {
  const validPmids = pmids.map(normalizePmid).filter((pmid): pmid is string => pmid !== null);
  const result = await createImportedDrafts(
    'pubmed',
    validPmids.map((pmid) => pubmedDraft(pmid, options.now)),
    options.repository,
  );
  result.skipped += pmids.length - validPmids.length;
  return result;
}