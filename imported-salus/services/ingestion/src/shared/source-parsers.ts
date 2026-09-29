export function extractNctIds(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const studies = (payload as { studies?: unknown[] }).studies;
  if (!Array.isArray(studies)) {
    return [];
  }

  return studies
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const nctId = (item as { protocolSection?: { identificationModule?: { nctId?: unknown } } }).protocolSection?.identificationModule?.nctId;
      return typeof nctId === "string" ? nctId : null;
    })
    .filter((item): item is string => Boolean(item));
}

function toIsoTimestamp(value: unknown): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function pickLatestTimestamp(candidates: Array<string | null>): string | null {
  const valid = candidates.filter((value): value is string => Boolean(value));
  if (valid.length === 0) {
    return null;
  }

  return valid.reduce((latest, current) => (new Date(current).getTime() > new Date(latest).getTime() ? current : latest));
}

export function extractClinicalTrialsSourceTimestamp(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const studies = (payload as { studies?: unknown[] }).studies;
  if (!Array.isArray(studies)) {
    return null;
  }

  const candidates = studies.map((item) => {
    if (!item || typeof item !== "object") {
      return null;
    }

    const study = item as {
      protocolSection?: {
        statusModule?: {
          lastUpdatePostDateStruct?: { date?: unknown };
          lastUpdateSubmitDateStruct?: { date?: unknown };
          statusVerifiedDate?: unknown;
        };
      };
    };

    return (
      toIsoTimestamp(study.protocolSection?.statusModule?.lastUpdatePostDateStruct?.date)
      ?? toIsoTimestamp(study.protocolSection?.statusModule?.lastUpdateSubmitDateStruct?.date)
      ?? toIsoTimestamp(study.protocolSection?.statusModule?.statusVerifiedDate)
    );
  });

  return pickLatestTimestamp(candidates);
}

function extractRefsFromArray(payload: unknown): string[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const candidate = (item as { registryIdentifier?: unknown; id?: unknown; reference?: unknown }).registryIdentifier
        ?? (item as { id?: unknown }).id
        ?? (item as { reference?: unknown }).reference;

      return typeof candidate === "string" ? candidate : null;
    })
    .filter((item): item is string => Boolean(item));
}

function extractTimestampsFromArray(payload: unknown): string[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  const timestamps = payload
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const typed = item as {
        updatedAt?: unknown;
        updatedOn?: unknown;
        lastUpdated?: unknown;
        lastModified?: unknown;
        modifiedAt?: unknown;
        timestamp?: unknown;
        date?: unknown;
      };

      return (
        toIsoTimestamp(typed.updatedAt)
        ?? toIsoTimestamp(typed.updatedOn)
        ?? toIsoTimestamp(typed.lastUpdated)
        ?? toIsoTimestamp(typed.lastModified)
        ?? toIsoTimestamp(typed.modifiedAt)
        ?? toIsoTimestamp(typed.timestamp)
        ?? toIsoTimestamp(typed.date)
      );
    })
    .filter((value): value is string => Boolean(value));

  return timestamps;
}

export function extractSourceTimestamp(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const root = payload as {
    updatedAt?: unknown;
    updatedOn?: unknown;
    lastUpdated?: unknown;
    lastModified?: unknown;
    timestamp?: unknown;
    fetchedAt?: unknown;
    metadata?: { lastUpdated?: unknown; updatedAt?: unknown; generatedAt?: unknown };
    meta?: { lastUpdated?: unknown; updatedAt?: unknown; generatedAt?: unknown };
    rows?: unknown[];
    records?: unknown[];
    trials?: unknown[];
    studies?: unknown[];
  };

  const rootCandidates = [
    toIsoTimestamp(root.updatedAt),
    toIsoTimestamp(root.updatedOn),
    toIsoTimestamp(root.lastUpdated),
    toIsoTimestamp(root.lastModified),
    toIsoTimestamp(root.timestamp),
    toIsoTimestamp(root.fetchedAt),
    toIsoTimestamp(root.metadata?.lastUpdated),
    toIsoTimestamp(root.metadata?.updatedAt),
    toIsoTimestamp(root.metadata?.generatedAt),
    toIsoTimestamp(root.meta?.lastUpdated),
    toIsoTimestamp(root.meta?.updatedAt),
    toIsoTimestamp(root.meta?.generatedAt),
  ];

  const listCandidates = [
    ...extractTimestampsFromArray(root.rows),
    ...extractTimestampsFromArray(root.records),
    ...extractTimestampsFromArray(root.trials),
    ...extractTimestampsFromArray(root.studies),
  ];

  return pickLatestTimestamp([...rootCandidates, ...listCandidates]);
}

export function extractAyushRefs(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const fromRows = extractRefsFromArray((payload as { rows?: unknown[] }).rows);
  if (fromRows.length > 0) {
    return fromRows;
  }

  return extractRefsFromArray((payload as { records?: unknown[] }).records);
}

export function extractCtriRefs(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const fromTrials = extractRefsFromArray((payload as { trials?: unknown[] }).trials);
  if (fromTrials.length > 0) {
    return fromTrials;
  }

  return extractRefsFromArray((payload as { records?: unknown[] }).records);
}
