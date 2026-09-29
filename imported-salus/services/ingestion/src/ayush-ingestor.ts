import { importPubmedPmids } from "./pubmed-ingestor";
import { buildConnectorOutput } from "./shared/connector-output";
import { fetchJsonWithRetry } from "./shared/http";
import { extractAyushRefs, extractSourceTimestamp } from "./shared/source-parsers";

function intFromEnv(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function fetchAyushReferences(limit = 5): Promise<{ refs: string[]; sourceTimestamp: string | null }> {
  const ayushDataUrl = process.env.AYUSH_DATA_URL || "";

  if (!ayushDataUrl) {
    return { refs: [], sourceTimestamp: null };
  }

  const timeoutMs = intFromEnv(process.env.AYUSH_HTTP_TIMEOUT_MS, 5000);
  const maxRetries = intFromEnv(process.env.AYUSH_HTTP_MAX_RETRIES, 2);
  const minIntervalMs = intFromEnv(process.env.AYUSH_MIN_INTERVAL_MS, 150);
  const maxRequestsPerRun = intFromEnv(process.env.AYUSH_MAX_REQUESTS_PER_RUN, 3);

  const result = await fetchJsonWithRetry<{ rows?: unknown[]; records?: unknown[] }>(ayushDataUrl, {
    timeoutMs,
    maxRetries,
    minIntervalMs,
    maxRequestsPerRun,
    rateLimitKey: "ayush",
  });
  if (!result.ok) {
    return { refs: [], sourceTimestamp: null };
  }

  return {
    refs: extractAyushRefs(result.data).slice(0, limit),
    sourceTimestamp: extractSourceTimestamp(result.data),
  };
}

export async function handler() {
  let ayushSampleRefs: string[] = [];
  let sourceTimestamp: string | null = null;
  let fallbackUsed = false;

  try {
    const sourceData = await fetchAyushReferences(6);
    ayushSampleRefs = sourceData.refs;
    sourceTimestamp = sourceData.sourceTimestamp;
  } catch {
    ayushSampleRefs = [];
    sourceTimestamp = null;
  }

  if (ayushSampleRefs.length === 0) {
    ayushSampleRefs = ["AYUSH-PH-2019-031", "DHARA-2024-0112"];
    fallbackUsed = true;
  }

  const pmids = ["17569207", "23439798"];
  const ingestion = await importPubmedPmids(pmids);
  return buildConnectorOutput(ingestion, {
    connectorId: "ayush",
    registryPrefix: "AYUSH|DHARA",
    sampledIds: ayushSampleRefs,
    fallbackUsed,
    sourceTimestamp: fallbackUsed ? undefined : sourceTimestamp ?? undefined,
  });
}
