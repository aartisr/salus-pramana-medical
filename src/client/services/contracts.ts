export type EvidenceGrade = 'A' | 'B' | 'C';
export type MedicalSystem = 'Allopathy' | 'Ayurveda' | 'Siddha' | 'Naturopathy';
export type PublicationStatus = 'draft' | 'published' | 'rejected' | 'under_review';

export interface MedicalConditionRecord {
  conditionId: string;
  icd11Code: string;
  standardName: string;
  ayurvedicEquivalent?: string;
  siddhaEquivalent?: string;
  pathophysiologySummary?: string;
}

export interface EvidenceRecord {
  evidenceId: string;
  conditionId: string;
  medicalSystem: MedicalSystem;
  interventionName: string;
  isPharmacological: boolean;
  evidenceGrade: EvidenceGrade;
  studyMethodology: string;
  sampleSize?: number;
  registryIdentifier: string;
  sourceUrl: string;
  clinicalOutcomeSummary: string;
  contraindications: string[];
  interactionWarnings: string[];
  publicationStatus?: PublicationStatus;
  lastVerifiedDate?: string;
}

export interface EvidenceListOptions {
  conditionId?: string;
  includeDrafts?: boolean;
  q?: string;
  limit?: number;
  cursor?: string;
}

export interface EvidenceListResponse {
  metadata: {
    causalEquivalencyDisclaimer: boolean;
    message: string;
    pagination?: {
      limit: number;
      cursor: number;
      nextCursor: string | null;
      totalCount: number;
      returnedCount: number;
    };
    query?: {
      conditionId: string | null;
      includeDrafts: boolean;
      q: string | null;
    };
  };
  rows: EvidenceRecord[];
}

export interface EditorAuthStatus {
  authenticated: boolean;
  actorEmail: string;
  groups: string[];
  isEditor: boolean;
}