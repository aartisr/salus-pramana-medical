export type ImportedEvidenceDraft = {
  evidenceId: string;
  conditionId: string;
  medicalSystem: 'Allopathy' | 'Ayurveda' | 'Siddha' | 'Naturopathy';
  interventionName: string;
  isPharmacological: boolean;
  evidenceGrade: 'A' | 'B' | 'C';
  studyMethodology: string;
  registryIdentifier: string;
  sourceUrl: string;
  clinicalOutcomeSummary: string;
  publicationStatus: 'draft';
  contraindications: string[];
  interactionWarnings: string[];
  lastVerifiedDate: string;
};

export type ConditionalCreateResult =
  | { created: true }
  | { created: false; reason: 'duplicate' };

export interface ImportedDraftRepository {
  createImportedDraft(draft: ImportedEvidenceDraft): Promise<ConditionalCreateResult>;
}