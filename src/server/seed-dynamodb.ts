import { medicalConditionSchema, treatmentEvidenceSchema } from '../domain/contracts';
import { medicalConditions, treatmentEvidenceList } from '../data/salusRepositoryData';
import { AwsDynamoExecutor, DynamoClinicalRepository } from '../persistence';
import { loadServerConfig } from './config/runtime';

/**
 * One-time, idempotent catalog seed for a newly provisioned SALUS DynamoDB stack.
 *
 * It is intentionally a deploy/admin command rather than Lambda startup behavior:
 * serving a request must never mutate the clinical catalog.
 */
async function main() {
  const config = loadServerConfig();
  if (config.persistenceAdapter !== 'dynamodb') {
    throw new Error('PERSISTENCE_ADAPTER=dynamodb is required to seed an AWS catalog');
  }
  if (!config.conditionsTable || !config.evidenceTable || !config.auditTable) {
    throw new Error('CONDITIONS_TABLE, EVIDENCE_TABLE, and AUDIT_TABLE are required to seed an AWS catalog');
  }

  const repository = new DynamoClinicalRepository(new AwsDynamoExecutor(), {
    conditions: config.conditionsTable,
    evidence: config.evidenceTable,
    audit: config.auditTable,
    monitoring: config.monitoringTable,
  });
  await repository.validate();

  const result = await repository.seed({
    conditions: medicalConditions.map((condition) => medicalConditionSchema.parse(condition)),
    evidence: treatmentEvidenceList.map((evidence) => treatmentEvidenceSchema.parse(evidence)),
  });
  console.log(`SALUS catalog seed complete: ${result.conditionsSeeded} conditions and ${result.evidenceSeeded} evidence records added.`);
}

main().catch((error: unknown) => {
  console.error('SALUS catalog seed failed:', error);
  process.exitCode = 1;
});
