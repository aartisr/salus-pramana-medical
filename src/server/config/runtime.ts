export type PersistenceAdapter = 'memory' | 'dynamodb';

export interface ServerConfig {
  nodeEnv: string;
  port: number;
  corsAllowedOrigins: string[];
  persistenceAdapter: PersistenceAdapter;
  conditionsTable?: string;
  evidenceTable?: string;
  auditTable?: string;
  monitoringTable?: string;
  staticAssetDirectory?: string;
  cognitoIssuer?: string;
  cognitoAudience?: string;
  strictGovernance?: boolean;
}

const localCorsOrigins = ['http://localhost:5173', 'http://localhost:5174'];

function parsePort(value: string | undefined) {
  if (!value) return 8787;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new Error('PORT must be an integer between 0 and 65535');
  }
  return port;
}

function parseOrigins(value: string | undefined, nodeEnv: string) {
  if (!value) return nodeEnv === 'production' ? [] : localCorsOrigins;
  return value.split(',').map((origin) => origin.trim()).filter(Boolean);
}

function parsePersistenceAdapter(value: string | undefined, nodeEnv: string): PersistenceAdapter {
  const adapter = value ?? (nodeEnv === 'production' ? undefined : 'memory');
  if (adapter !== 'memory' && adapter !== 'dynamodb') {
    throw new Error('PERSISTENCE_ADAPTER must be memory or dynamodb');
  }
  if (adapter === 'memory' && nodeEnv === 'production') {
    throw new Error('PERSISTENCE_ADAPTER=memory is not allowed in production');
  }
  return adapter;
}

export function loadServerConfig(environment: NodeJS.ProcessEnv = process.env): ServerConfig {
  const nodeEnv = environment.NODE_ENV ?? 'development';
  return {
    nodeEnv,
    port: parsePort(environment.PORT),
    corsAllowedOrigins: parseOrigins(environment.CORS_ALLOWED_ORIGINS, nodeEnv),
    persistenceAdapter: parsePersistenceAdapter(environment.PERSISTENCE_ADAPTER, nodeEnv),
    conditionsTable: environment.CONDITIONS_TABLE,
    evidenceTable: environment.EVIDENCE_TABLE,
    auditTable: environment.AUDIT_TABLE,
    monitoringTable: environment.MONITORING_TABLE,
    staticAssetDirectory: environment.STATIC_ASSET_DIRECTORY,
    cognitoIssuer: environment.COGNITO_ISSUER,
    cognitoAudience: environment.COGNITO_AUDIENCE,
    strictGovernance: environment.STRICT_GOVERNANCE === 'true',
  };
}
