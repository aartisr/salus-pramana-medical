import { isPublicEvidence, medicalConditionSchema, treatmentEvidenceSchema, type AuditRecord, type MedicalCondition, type MonitoringSnapshot, type TreatmentEvidence } from "../../domain/contracts";
import type { ClinicalRepository, EvidencePage, EvidenceQuery, SeedResult, SeedSet } from "../contracts";
import { RepositoryError } from "../contracts";
import { applyEvidenceQuery } from "../contracts/query-policy";

export interface DynamoTables { conditions: string; evidence: string; audit: string; monitoring?: string }
export type DynamoTransactionItem =
  | { type: "condition-check"; tableName: string; key: Record<string, string>; exists: boolean }
  | { type: "put"; tableName: string; item: Record<string, unknown>; condition?: "not-exists" }
  | { type: "update"; tableName: string; key: Record<string, string>; changes: Record<string, unknown>; condition: "exists" };
export type DynamoOperation =
  | { kind: "scan"; tableName: string; exclusiveStartKey?: Record<string, unknown> }
  | { kind: "query"; tableName: string; indexName: "byCondition"; conditionId: string; exclusiveStartKey?: Record<string, unknown> }
  | { kind: "get"; tableName: string; key: Record<string, string> }
  | { kind: "put"; tableName: string; item: Record<string, unknown>; condition?: "not-exists" }
  | { kind: "update"; tableName: string; key: Record<string, string>; changes: Record<string, unknown>; condition: "exists" }
  | { kind: "transact-write"; items: DynamoTransactionItem[] }
  | { kind: "validate"; tables: DynamoTables };
export interface DynamoResult { items?: Record<string, unknown>[]; item?: Record<string, unknown>; attributes?: Record<string, unknown>; lastEvaluatedKey?: Record<string, unknown> }
export interface DynamoExecutor { execute(operation: DynamoOperation): Promise<DynamoResult> }
export { AwsDynamoExecutor } from './aws-executor';

function mapError(error: unknown, message: string): RepositoryError {
  if (error instanceof RepositoryError) return error;
  const name = error instanceof Error ? error.name : "";
  if (name === "ConditionalCheckFailedException" || name === "TransactionCanceledException") return new RepositoryError("conflict", message, error);
  return new RepositoryError("storage", message, error);
}

export class DynamoClinicalRepository implements ClinicalRepository {
  constructor(private readonly executor: DynamoExecutor, private readonly tables: DynamoTables) {}

  async validate(): Promise<void> { await this.executor.execute({ kind: "validate", tables: this.tables }); }
  async listConditions(): Promise<MedicalCondition[]> { return (await this.readAll({ kind: "scan", tableName: this.tables.conditions })).map((item) => medicalConditionSchema.parse(item)); }
  async getCondition(conditionId: string): Promise<MedicalCondition | null> { const result = await this.executor.execute({ kind: "get", tableName: this.tables.conditions, key: { conditionId } }); return result.item ? medicalConditionSchema.parse(result.item) : null; }
  async listEvidence(query: EvidenceQuery = {}): Promise<EvidencePage> {
    const operation = query.conditionId ? { kind: "query" as const, tableName: this.tables.evidence, indexName: "byCondition" as const, conditionId: query.conditionId } : { kind: "scan" as const, tableName: this.tables.evidence };
    return applyEvidenceQuery((await this.readAll(operation)).map((item) => treatmentEvidenceSchema.parse(item)), query);
  }
  async getEvidence(evidenceId: string, includeDrafts = false): Promise<TreatmentEvidence | null> {
    const result = await this.executor.execute({ kind: "get", tableName: this.tables.evidence, key: { evidenceId } });
    if (!result.item) return null;
    const record = treatmentEvidenceSchema.parse(result.item);
    return includeDrafts || isPublicEvidence(record) ? record : null;
  }
  async listAuditRecords(): Promise<AuditRecord[]> { return (await this.readAll({ kind: "scan", tableName: this.tables.audit })) as AuditRecord[]; }

  async createConditionWithAudit(condition: MedicalCondition, audit: AuditRecord): Promise<MedicalCondition> { await this.transaction([{ type: "put", tableName: this.tables.conditions, item: condition, condition: "not-exists" }, { type: "put", tableName: this.tables.audit, item: audit, condition: "not-exists" }], "Condition or audit already exists"); return structuredClone(condition); }
  async updateConditionWithAudit(conditionId: string, changes: Partial<MedicalCondition>, audit: AuditRecord): Promise<MedicalCondition> {
    await this.transaction([{ type: "update", tableName: this.tables.conditions, key: { conditionId }, changes, condition: "exists" }, { type: "put", tableName: this.tables.audit, item: audit, condition: "not-exists" }], "Condition was not found or audit already exists");
    const updated = await this.getCondition(conditionId);
    if (!updated) throw new RepositoryError("not-found", `Condition ${conditionId} was not found`);
    return updated;
  }
  async createEvidenceDraftWithAudit(record: TreatmentEvidence, audit: AuditRecord): Promise<TreatmentEvidence> {
    const draft = { ...structuredClone(record), publicationStatus: "draft" as const };
    if (!await this.getCondition(draft.conditionId)) throw new RepositoryError("not-found", `Condition ${draft.conditionId} was not found`);
    await this.transaction([{ type: "condition-check", tableName: this.tables.conditions, key: { conditionId: draft.conditionId }, exists: true }, { type: "put", tableName: this.tables.evidence, item: draft, condition: "not-exists" }, { type: "put", tableName: this.tables.audit, item: audit, condition: "not-exists" }], "Evidence, condition, or audit constraint failed");
    return draft;
  }
  async transitionPublicationWithAudit(evidenceId: string, publicationStatus: "draft" | "published" | "rejected", audit: AuditRecord): Promise<TreatmentEvidence> {
    if (!await this.getEvidence(evidenceId, true)) throw new RepositoryError("not-found", `Evidence ${evidenceId} was not found`);
    await this.transaction([{ type: "update", tableName: this.tables.evidence, key: { evidenceId }, changes: { publicationStatus }, condition: "exists" }, { type: "put", tableName: this.tables.audit, item: audit, condition: "not-exists" }], "Evidence was not found or audit already exists");
    const updated = await this.getEvidence(evidenceId, true);
    if (!updated) throw new RepositoryError("not-found", `Evidence ${evidenceId} was not found`);
    return updated;
  }
  async createImportedDraft(record: TreatmentEvidence): Promise<{ outcome: "created" | "duplicate"; record: TreatmentEvidence }> {
    const draft = { ...structuredClone(record), publicationStatus: "draft" as const };
    try { await this.executor.execute({ kind: "put", tableName: this.tables.evidence, item: draft, condition: "not-exists" }); return { outcome: "created", record: draft }; }
    catch (error) { const mapped = mapError(error, `Evidence ${record.evidenceId} already exists`); if (mapped.code === "conflict") { const existing = await this.getEvidence(record.evidenceId, true); if (existing) return { outcome: "duplicate", record: existing }; } throw mapped; }
  }
  async appendMonitoringSnapshot(record: MonitoringSnapshot): Promise<{ outcome: "created" | "duplicate" | "not-configured" }> {
    if (!this.tables.monitoring) return { outcome: "not-configured" };
    try { await this.executor.execute({ kind: "put", tableName: this.tables.monitoring, item: record, condition: "not-exists" }); return { outcome: "created" }; }
    catch (error) { const mapped = mapError(error, `Snapshot ${record.snapshotId} already exists`); if (mapped.code === "conflict") return { outcome: "duplicate" }; throw mapped; }
  }
  async seed(seedSet: SeedSet): Promise<SeedResult> {
    let conditionsSeeded = 0, evidenceSeeded = 0;
    for (const condition of seedSet.conditions) try { await this.executor.execute({ kind: "put", tableName: this.tables.conditions, item: condition, condition: "not-exists" }); conditionsSeeded += 1; } catch (error) { if (mapError(error, "Seed conflict").code !== "conflict") throw error; }
    for (const record of seedSet.evidence) try { await this.executor.execute({ kind: "put", tableName: this.tables.evidence, item: record, condition: "not-exists" }); evidenceSeeded += 1; } catch (error) { if (mapError(error, "Seed conflict").code !== "conflict") throw error; }
    return { conditionsSeeded, evidenceSeeded, mode: "dynamodb" };
  }

  private async readAll(initial: Extract<DynamoOperation, { kind: "scan" | "query" }>): Promise<Record<string, unknown>[]> {
    const items: Record<string, unknown>[] = [];
    let operation = initial;
    do { const result = await this.executor.execute(operation); items.push(...(result.items ?? [])); operation = { ...operation, exclusiveStartKey: result.lastEvaluatedKey } as typeof operation; if (!result.lastEvaluatedKey) break; } while (true);
    return items;
  }
  private async transaction(items: DynamoTransactionItem[], conflictMessage: string) { try { await this.executor.execute({ kind: "transact-write", items }); } catch (error) { throw mapError(error, conflictMessage); } }
}
