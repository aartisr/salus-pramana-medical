import { effectivePublicationStatus, type AuditRecord, type MedicalCondition, type MonitoringSnapshot, type TreatmentEvidence } from "../../domain/contracts";
import type { ClinicalRepository, EvidencePage, EvidenceQuery, SeedResult, SeedSet } from "../contracts";
import { RepositoryError } from "../contracts";
import { applyEvidenceQuery } from "../contracts/query-policy";
import { deterministicSeed } from "./seeds";

const copy = <T>(value: T): T => structuredClone(value);

export class MemoryClinicalRepository implements ClinicalRepository {
  private readonly conditions = new Map<string, MedicalCondition>();
  private readonly evidence = new Map<string, TreatmentEvidence>();
  private readonly audits = new Map<string, AuditRecord>();
  private readonly monitoring = new Map<string, MonitoringSnapshot>();

  constructor(seedSet?: SeedSet) {
    if (seedSet) this.seedSync(seedSet);
  }

  static seeded(): MemoryClinicalRepository {
    return new MemoryClinicalRepository(deterministicSeed);
  }

  async listConditions(): Promise<MedicalCondition[]> { return [...this.conditions.values()].map(copy).sort((left, right) => left.conditionId.localeCompare(right.conditionId)); }
  async getCondition(conditionId: string): Promise<MedicalCondition | null> { return copy(this.conditions.get(conditionId) ?? null); }
  async listEvidence(query: EvidenceQuery = {}): Promise<EvidencePage> { return applyEvidenceQuery([...this.evidence.values()], query); }
  async getEvidence(evidenceId: string, includeDrafts = false): Promise<TreatmentEvidence | null> {
    const record = this.evidence.get(evidenceId);
    if (!record || (!includeDrafts && effectivePublicationStatus(record) !== "published")) return null;
    return copy(record);
  }
  async listAuditRecords(): Promise<AuditRecord[]> { return [...this.audits.values()].map(copy); }

  async createConditionWithAudit(condition: MedicalCondition, audit: AuditRecord): Promise<MedicalCondition> {
    if (this.conditions.has(condition.conditionId)) throw new RepositoryError("conflict", `Condition ${condition.conditionId} already exists`);
    this.assertAuditAbsent(audit);
    this.conditions.set(condition.conditionId, copy(condition));
    this.audits.set(audit.auditId, copy(audit));
    return copy(condition);
  }

  async updateConditionWithAudit(conditionId: string, changes: Partial<MedicalCondition>, audit: AuditRecord): Promise<MedicalCondition> {
    const existing = this.conditions.get(conditionId);
    if (!existing) throw new RepositoryError("not-found", `Condition ${conditionId} was not found`);
    this.assertAuditAbsent(audit);
    const updated = { ...existing, ...copy(changes), conditionId };
    this.conditions.set(conditionId, updated);
    this.audits.set(audit.auditId, copy(audit));
    return copy(updated);
  }

  async createEvidenceDraftWithAudit(record: TreatmentEvidence, audit: AuditRecord): Promise<TreatmentEvidence> {
    if (this.evidence.has(record.evidenceId)) throw new RepositoryError("conflict", `Evidence ${record.evidenceId} already exists`);
    if (!this.conditions.has(record.conditionId)) throw new RepositoryError("not-found", `Condition ${record.conditionId} was not found`);
    this.assertAuditAbsent(audit);
    const draft = { ...copy(record), publicationStatus: "draft" as const };
    this.evidence.set(draft.evidenceId, draft);
    this.audits.set(audit.auditId, copy(audit));
    return copy(draft);
  }

  async transitionPublicationWithAudit(evidenceId: string, publicationStatus: "draft" | "published" | "rejected", audit: AuditRecord): Promise<TreatmentEvidence> {
    const existing = this.evidence.get(evidenceId);
    if (!existing) throw new RepositoryError("not-found", `Evidence ${evidenceId} was not found`);
    this.assertAuditAbsent(audit);
    const updated = { ...existing, publicationStatus };
    this.evidence.set(evidenceId, updated);
    this.audits.set(audit.auditId, copy(audit));
    return copy(updated);
  }

  async createImportedDraft(record: TreatmentEvidence): Promise<{ outcome: "created" | "duplicate"; record: TreatmentEvidence }> {
    const existing = this.evidence.get(record.evidenceId);
    if (existing) return { outcome: "duplicate", record: copy(existing) };
    const draft = { ...copy(record), publicationStatus: "draft" as const };
    this.evidence.set(draft.evidenceId, draft);
    return { outcome: "created", record: copy(draft) };
  }

  async appendMonitoringSnapshot(record: MonitoringSnapshot): Promise<{ outcome: "created" | "duplicate" }> {
    if (this.monitoring.has(record.snapshotId)) return { outcome: "duplicate" };
    this.monitoring.set(record.snapshotId, copy(record));
    return { outcome: "created" };
  }

  async seed(seedSet: SeedSet): Promise<SeedResult> {
    const counts = this.seedSync(seedSet);
    return { ...counts, mode: "memory" };
  }

  private seedSync(seedSet: SeedSet) {
    let conditionsSeeded = 0, evidenceSeeded = 0;
    for (const condition of seedSet.conditions) if (!this.conditions.has(condition.conditionId)) { this.conditions.set(condition.conditionId, copy(condition)); conditionsSeeded += 1; }
    for (const record of seedSet.evidence) if (!this.evidence.has(record.evidenceId)) { this.evidence.set(record.evidenceId, copy(record)); evidenceSeeded += 1; }
    return { conditionsSeeded, evidenceSeeded };
  }

  private assertAuditAbsent(audit: AuditRecord) {
    if (this.audits.has(audit.auditId)) throw new RepositoryError("conflict", `Audit ${audit.auditId} already exists`);
  }
}

export { deterministicSeed } from "./seeds";