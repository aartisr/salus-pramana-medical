import type { AuditRecord, EditorPublicationStatus, MedicalCondition, MonitoringSnapshot, TreatmentEvidence } from "../../domain/contracts";

export type RepositoryErrorCode = "conflict" | "not-found" | "configuration" | "storage";

export class RepositoryError extends Error {
  constructor(readonly code: RepositoryErrorCode, message: string, readonly cause?: unknown) {
    super(message);
    this.name = "RepositoryError";
  }
}

export interface EvidenceQuery {
  conditionId?: string;
  includeDrafts?: boolean;
  q?: string;
  limit?: number;
  cursor?: string;
}

export interface EvidencePage {
  items: TreatmentEvidence[];
  total: number;
  cursor: number;
  nextCursor: string | null;
  query: EvidenceQuery;
}

export interface SeedSet {
  conditions: MedicalCondition[];
  evidence: TreatmentEvidence[];
}

export interface SeedResult {
  conditionsSeeded: number;
  evidenceSeeded: number;
  mode: "memory" | "dynamodb" | "skipped";
}

export interface ConditionRepository {
  listConditions(): Promise<MedicalCondition[]>;
  getCondition(conditionId: string): Promise<MedicalCondition | null>;
}

export interface EvidenceRepository {
  listEvidence(query?: EvidenceQuery): Promise<EvidencePage>;
  getEvidence(evidenceId: string, includeDrafts?: boolean): Promise<TreatmentEvidence | null>;
  createImportedDraft(record: TreatmentEvidence): Promise<{ outcome: "created" | "duplicate"; record: TreatmentEvidence }>;
}

export interface AuditRepository {
  listAuditRecords(): Promise<AuditRecord[]>;
}

export interface MonitoringRepository {
  appendMonitoringSnapshot(record: MonitoringSnapshot): Promise<{ outcome: "created" | "duplicate" | "not-configured" }>;
}

export interface AtomicMutationRepository {
  createConditionWithAudit(condition: MedicalCondition, audit: AuditRecord): Promise<MedicalCondition>;
  updateConditionWithAudit(conditionId: string, changes: Partial<MedicalCondition>, audit: AuditRecord): Promise<MedicalCondition>;
  createEvidenceDraftWithAudit(record: TreatmentEvidence, audit: AuditRecord): Promise<TreatmentEvidence>;
  transitionPublicationWithAudit(evidenceId: string, status: EditorPublicationStatus, audit: AuditRecord): Promise<TreatmentEvidence>;
}

export interface SeedService {
  seed(seedSet: SeedSet): Promise<SeedResult>;
}

export type ClinicalRepository = ConditionRepository & EvidenceRepository & AuditRepository & MonitoringRepository & AtomicMutationRepository & SeedService;