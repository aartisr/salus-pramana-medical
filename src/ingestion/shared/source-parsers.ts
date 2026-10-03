function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' ? value as Record<string, unknown> : null;
}

function toIsoTimestamp(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? null : timestamp.toISOString();
}

function latestTimestamp(values: Array<string | null>) {
  const timestamps = values.filter((value): value is string => value !== null);
  return timestamps.length === 0
    ? null
    : timestamps.reduce((latest, current) => current > latest ? current : latest);
}

function arrayAt(payload: unknown, key: string): unknown[] {
  const value = asRecord(payload)?.[key];
  return Array.isArray(value) ? value : [];
}

function referencesFrom(items: unknown[]) {
  return items.flatMap((item) => {
    const record = asRecord(item);
    const value = record?.registryIdentifier ?? record?.id ?? record?.reference;
    return typeof value === 'string' && value.trim() !== '' ? [value.trim()] : [];
  });
}

function timestampsFrom(items: unknown[]) {
  return items.map((item) => {
    const record = asRecord(item);
    return toIsoTimestamp(
      record?.updatedAt
      ?? record?.updatedOn
      ?? record?.lastUpdated
      ?? record?.lastModified
      ?? record?.modifiedAt
      ?? record?.timestamp
      ?? record?.date,
    );
  });
}

export function extractNctIds(payload: unknown): string[] {
  return arrayAt(payload, 'studies').flatMap((item) => {
    const protocolSection = asRecord(asRecord(item)?.protocolSection);
    const identification = asRecord(protocolSection?.identificationModule);
    const value = identification?.nctId;
    return typeof value === 'string' && /^NCT\d+$/i.test(value.trim()) ? [value.trim().toUpperCase()] : [];
  });
}

export function extractClinicalTrialsSourceTimestamp(payload: unknown): string | null {
  return latestTimestamp(arrayAt(payload, 'studies').map((item) => {
    const protocolSection = asRecord(asRecord(item)?.protocolSection);
    const status = asRecord(protocolSection?.statusModule);
    return toIsoTimestamp(asRecord(status?.lastUpdatePostDateStruct)?.date)
      ?? toIsoTimestamp(asRecord(status?.lastUpdateSubmitDateStruct)?.date)
      ?? toIsoTimestamp(status?.statusVerifiedDate);
  }));
}

export function extractAyushRefs(payload: unknown): string[] {
  const rows = referencesFrom(arrayAt(payload, 'rows'));
  return rows.length > 0 ? rows : referencesFrom(arrayAt(payload, 'records'));
}

export function extractCtriRefs(payload: unknown): string[] {
  const trials = referencesFrom(arrayAt(payload, 'trials'));
  return trials.length > 0 ? trials : referencesFrom(arrayAt(payload, 'records'));
}

export function extractSourceTimestamp(payload: unknown): string | null {
  const root = asRecord(payload);
  if (!root) return null;
  const metadata = asRecord(root.metadata);
  const meta = asRecord(root.meta);
  return latestTimestamp([
    toIsoTimestamp(root.updatedAt),
    toIsoTimestamp(root.updatedOn),
    toIsoTimestamp(root.lastUpdated),
    toIsoTimestamp(root.lastModified),
    toIsoTimestamp(root.timestamp),
    toIsoTimestamp(root.fetchedAt),
    toIsoTimestamp(metadata?.lastUpdated),
    toIsoTimestamp(metadata?.updatedAt),
    toIsoTimestamp(metadata?.generatedAt),
    toIsoTimestamp(meta?.lastUpdated),
    toIsoTimestamp(meta?.updatedAt),
    toIsoTimestamp(meta?.generatedAt),
    ...timestampsFrom(arrayAt(payload, 'rows')),
    ...timestampsFrom(arrayAt(payload, 'records')),
    ...timestampsFrom(arrayAt(payload, 'trials')),
    ...timestampsFrom(arrayAt(payload, 'studies')),
  ]);
}