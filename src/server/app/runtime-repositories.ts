import { randomUUID } from 'node:crypto';
import type { AuditRecord } from '../../domain';
import { AwsDynamoExecutor, DynamoClinicalRepository, RepositoryError } from '../../persistence';
import type { ServerConfig } from '../config/runtime';
import type { AuditInput, ServerRepositories } from './create-app';
import { createDefaultRepositories } from './default-dependencies';

function auditRecord(input: AuditInput, now: () => Date): AuditRecord {
  const timestamp = now();
  return { auditId: randomUUID(), ...input, timestamp: timestamp.toISOString(), ttl: Math.floor(timestamp.getTime() / 1000) + 90 * 24 * 60 * 60 };
}

export async function createRuntimeRepositories(config: ServerConfig, now: () => Date): Promise<ServerRepositories> {
  if (config.persistenceAdapter === 'memory') return createDefaultRepositories(now);
  if (!config.conditionsTable || !config.evidenceTable || !config.auditTable) throw new Error('DynamoDB persistence requires CONDITIONS_TABLE, EVIDENCE_TABLE, and AUDIT_TABLE');

  const repository = new DynamoClinicalRepository(new AwsDynamoExecutor(), {
    conditions: config.conditionsTable,
    evidence: config.evidenceTable,
    audit: config.auditTable,
    monitoring: config.monitoringTable,
  });
  await repository.validate();
  return {
    async listConditions() { return repository.listConditions(); },
    async getCondition(conditionId) { return (await repository.getCondition(conditionId)) ?? undefined; },
    async getEvidence(evidenceId, includeDrafts) { return (await repository.getEvidence(evidenceId, includeDrafts)) ?? undefined; },
    async createCondition(condition, audit) { return repository.createConditionWithAudit(condition as never, auditRecord(audit, now)); },
    async listEvidence(conditionId, includeDrafts) { return (await repository.listEvidence({ conditionId, includeDrafts, limit: 100 })).items; },
    async createEvidence(evidence, audit) {
      try { return await repository.createEvidenceDraftWithAudit(evidence as never, auditRecord(audit, now)); }
      catch (error) { if (error instanceof RepositoryError && error.code === 'conflict') return undefined; throw error; }
    },
    async updateEvidencePublicationStatus(evidenceId, status, audit) {
      try { return await repository.transitionPublicationWithAudit(evidenceId, status, auditRecord(audit, now)); }
      catch (error) { if (error instanceof RepositoryError && error.code === 'not-found') return undefined; throw error; }
    },
  };
}
