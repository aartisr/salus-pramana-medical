import { importPubmedPmids } from "./pubmed-ingestor";
import { buildConnectorOutput } from "./shared/connector-output";
import { fetchJsonWithRetry } from "./shared/http";
import { extractCtriRefs, extractSourceTimestamp } from "./shared/source-parsers";

function intFromEnv(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function fetchCtriReferences(limit = 5): Promise<{ refs: string[]; sourceTimestamp: string | null }> {
  const ctriDataUrl = process.env.CTRI_DATA_URL || "";

  if (!ctriDataUrl) {
    return { refs: [], sourceTimestamp: null };
  }

  const timeoutMs = intFromEnv(process.env.CTRI_HTTP_TIMEOUT_MS, 5000);
  const maxRetries = intFromEnv(process.env.CTRI_HTTP_MAX_RETRIES, 2);
  const minIntervalMs = intFromEnv(process.env.CTRI_MIN_INTERVAL_MS, 150);
  const maxRequestsPerRun = intFromEnv(process.env.CTRI_MAX_REQUESTS_PER_RUN, 3);

  const result = await fetchJsonWithRetry<{ trials?: unknown[]; records?: unknown[] }>(ctriDataUrl, {
    timeoutMs,
    maxRetries,
    minIntervalMs,
    maxRequestsPerRun,
    rateLimitKey: "ctri",
  });
  if (!result.ok) {
    return { refs: [], sourceTimestamp: null };
  }

  return {
    refs: extractCtriRefs(result.data).slice(0, limit),
    sourceTimestamp: extractSourceTimestamp(result.data),
  };
}

export async function handler() {
  let ctriSampleRefs: string[] = [];
  let sourceTimestamp: string | null = null;
  let fallbackUsed = false;

  try {
    const sourceData = await fetchCtriReferences(6);
    ctriSampleRefs = sourceData.refs;
    sourceTimestamp = sourceData.sourceTimestamp;
  } catch {
    ctriSampleRefs = [];
    sourceTimestamp = null;
  }

  if (ctriSampleRefs.length === 0) {
    ctriSampleRefs = ["CTRI/2023/10/058421", "ICTRP-IND-2021-1033"];
    fallbackUsed = true;
  }

  const pmids = ["7564658", "9742977"];
  const ingestion = await importPubmedPmids(pmids);
  return buildConnectorOutput(ingestion, {
    connectorId: "ctri",
    registryPrefix: "CTRI|ICTRP",
    sampledIds: ctriSampleRefs,
    fallbackUsed,
    sourceTimestamp: fallbackUsed ? undefined : sourceTimestamp ?? undefined,
  });
}
