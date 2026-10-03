import type { EvidenceRecord } from '../../services/contracts';

export type SubmissionErrors = Partial<Record<keyof EvidenceRecord, string>>;

const registryPattern = /^(PMID|DOI|CTRI|ICTRP|AYUSH|DHARA|NCT)-?/i;
const allowedDomains = [
  'pubmed.ncbi.nlm.nih.gov', 'doi.org', 'clinicaltrials.gov', 'ctri.nic.in', 'trialsearch.who.int',
  'ayush.gov.in', 'cochranelibrary.com', 'bmj.com', 'thelancet.com', 'nejm.org', 'jamanetwork.com',
  'nature.com', 'sciencedirect.com',
];

export function emptyEvidenceDraft(today = new Date().toISOString().slice(0, 10)): EvidenceRecord {
  return {
    evidenceId: '',
    conditionId: '',
    medicalSystem: 'Allopathy',
    interventionName: '',
    isPharmacological: true,
    evidenceGrade: 'A',
    studyMethodology: '',
    sampleSize: 0,
    registryIdentifier: '',
    sourceUrl: '',
    clinicalOutcomeSummary: '',
    contraindications: [],
    interactionWarnings: [],
    publicationStatus: 'draft',
    lastVerifiedDate: today,
  };
}

export function validateEvidenceDraft(draft: EvidenceRecord): SubmissionErrors {
  const errors: SubmissionErrors = {};
  if (!draft.conditionId.trim()) errors.conditionId = 'Choose a condition.';
  if (draft.interventionName.trim().length < 2) errors.interventionName = 'Enter an intervention name.';
  if (draft.studyMethodology.trim().length < 3) errors.studyMethodology = 'Describe the study methodology.';
  if (!registryPattern.test(draft.registryIdentifier.trim())) {
    errors.registryIdentifier = 'Use a PMID, DOI, CTRI, ICTRP, AYUSH, DHARA, or NCT identifier.';
  }
  try {
    const url = new URL(draft.sourceUrl);
    const allowed = url.protocol === 'https:' && allowedDomains.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
    if (!allowed) errors.sourceUrl = 'Use HTTPS and an approved evidence source domain.';
  } catch {
    errors.sourceUrl = 'Enter a valid HTTPS source URL.';
  }
  if (draft.clinicalOutcomeSummary.trim().length < 10) errors.clinicalOutcomeSummary = 'Provide an outcome summary of at least 10 characters.';
  return errors;
}

export function prepareEvidenceDraft(draft: EvidenceRecord, id = `ev-${Date.now()}`): EvidenceRecord {
  return { ...draft, evidenceId: draft.evidenceId || id, publicationStatus: 'draft' };
}