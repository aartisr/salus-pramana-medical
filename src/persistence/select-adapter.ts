import type { ClinicalRepository } from "./contracts";
import { RepositoryError } from "./contracts";

export interface PersistenceConfiguration {
  adapter?: string;
  environment: string;
  conditionsTable?: string;
  evidenceTable?: string;
  auditTable?: string;
  monitoringTable?: string;
}

export interface PersistenceFactories {
  memory(): ClinicalRepository;
  dynamodb(tables: { conditions: string; evidence: string; audit: string; monitoring?: string }): Promise<ClinicalRepository>;
}

export async function selectPersistence(configuration: PersistenceConfiguration, factories: PersistenceFactories): Promise<ClinicalRepository> {
  if (configuration.adapter === "memory") {
    if (configuration.environment === "production") throw new RepositoryError("configuration", "Memory persistence is forbidden in production");
    return factories.memory();
  }
  if (configuration.adapter === "dynamodb") {
    if (!configuration.conditionsTable || !configuration.evidenceTable || !configuration.auditTable) throw new RepositoryError("configuration", "DynamoDB persistence requires conditions, evidence, and audit tables");
    return factories.dynamodb({ conditions: configuration.conditionsTable, evidence: configuration.evidenceTable, audit: configuration.auditTable, monitoring: configuration.monitoringTable });
  }
  throw new RepositoryError("configuration", configuration.adapter ? `Unknown persistence adapter: ${configuration.adapter}` : "PERSISTENCE_ADAPTER is required");
}