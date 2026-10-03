import type { ImportedEvidenceDraft } from './repository';

export type ImportedEvidenceInput = Omit<
  ImportedEvidenceDraft,
  'publicationStatus' | 'contraindications' | 'interactionWarnings' | 'lastVerifiedDate'
> & Partial<Pick<
  ImportedEvidenceDraft,
  'contraindications' | 'interactionWarnings' | 'lastVerifiedDate'
>>;

export function normalizeImportedEvidence(
  input: ImportedEvidenceInput,
  now: () => number = Date.now,
): ImportedEvidenceDraft {
  return {
    ...input,
    publicationStatus: 'draft',
    contraindications: input.contraindications ?? [],
    interactionWarnings: input.interactionWarnings ?? [],
    lastVerifiedDate: input.lastVerifiedDate ?? new Date(now()).toISOString().slice(0, 10),
  };
}