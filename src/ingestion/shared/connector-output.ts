import type { HttpFailure } from './http';
import type { ImportResult } from './import-drafts';

export type ConnectorId = 'clinicaltrials' | 'ayush' | 'ctri';

export type ConnectorOutput = {
  connector: {
    id: ConnectorId;
    registryPrefix: string;
    sampledIds: string[];
    fallbackUsed: boolean;
    fallbackLabel?: 'deterministic-compatibility-fallback';
    fallbackReason?: 'source_url_missing' | 'empty_source' | 'http_failure';
    retrievalFailure?: HttpFailure;
    freshness: {
      fetchedAt: string;
      sourceTimestamp: string | null;
    };
  };
  ingestion: ImportResult;
};

export function buildConnectorOutput(
  ingestion: ImportResult,
  metadata: {
    connectorId: ConnectorId;
    registryPrefix: string;
    sampledIds: string[];
    fallbackUsed: boolean;
    fallbackReason?: ConnectorOutput['connector']['fallbackReason'];
    retrievalFailure?: HttpFailure;
    sourceTimestamp?: string | null;
    now?: () => number;
  },
): ConnectorOutput {
  return {
    connector: {
      id: metadata.connectorId,
      registryPrefix: metadata.registryPrefix,
      sampledIds: metadata.sampledIds,
      fallbackUsed: metadata.fallbackUsed,
      ...(metadata.fallbackUsed ? { fallbackLabel: 'deterministic-compatibility-fallback' as const } : {}),
      ...(metadata.fallbackReason ? { fallbackReason: metadata.fallbackReason } : {}),
      ...(metadata.retrievalFailure ? { retrievalFailure: metadata.retrievalFailure } : {}),
      freshness: {
        fetchedAt: new Date((metadata.now ?? Date.now)()).toISOString(),
        sourceTimestamp: metadata.fallbackUsed ? null : metadata.sourceTimestamp ?? null,
      },
    },
    ingestion,
  };
}