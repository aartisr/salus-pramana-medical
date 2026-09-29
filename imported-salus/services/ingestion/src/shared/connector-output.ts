export type ImportResult = {
  source: string;
  ingested: number;
  skipped: number;
  reason?: string;
};

export type ConnectorMetadata = {
  connectorId: "clinicaltrials" | "ayush" | "ctri";
  registryPrefix: string;
  sampledIds: string[];
  fallbackUsed: boolean;
  sourceTimestamp?: string;
};

export type IngestionConnectorOutput = {
  connector: {
    id: ConnectorMetadata["connectorId"];
    registryPrefix: string;
    sampledIds: string[];
    fallbackUsed: boolean;
    freshness: {
      fetchedAt: string;
      sourceTimestamp: string | null;
    };
  };
  ingestion: ImportResult;
};

export function buildConnectorOutput(importResult: ImportResult, metadata: ConnectorMetadata): IngestionConnectorOutput {
  return {
    connector: {
      id: metadata.connectorId,
      registryPrefix: metadata.registryPrefix,
      sampledIds: metadata.sampledIds,
      fallbackUsed: metadata.fallbackUsed,
      freshness: {
        fetchedAt: new Date().toISOString(),
        sourceTimestamp: metadata.sourceTimestamp ?? null,
      },
    },
    ingestion: importResult,
  };
}
