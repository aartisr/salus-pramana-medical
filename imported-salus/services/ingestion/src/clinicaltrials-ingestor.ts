import { importPubmedPmids } from "./pubmed-ingestor";
import { buildConnectorOutput } from "./shared/connector-output";
import { fetchJsonWithRetry } from "./shared/http";
import { extractClinicalTrialsSourceTimestamp, extractNctIds } from "./shared/source-parsers";

const CLINICAL_TRIALS_API = "https://clinicaltrials.gov/api/v2/studies";

function intFromEnv(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function fetchClinicalTrialsData(limit = 5): Promise<{ nctIds: string[]; sourceTimestamp: string | null }> {
  const query = process.env.CLINICALTRIALS_QUERY || "hypertension OR diabetes";
  const params = new URLSearchParams({
    "query.term": query,
    pageSize: String(limit),
    format: "json",
  });

  const timeoutMs = intFromEnv(process.env.CLINICALTRIALS_HTTP_TIMEOUT_MS, 5000);
  const maxRetries = intFromEnv(process.env.CLINICALTRIALS_HTTP_MAX_RETRIES, 2);
  const minIntervalMs = intFromEnv(process.env.CLINICALTRIALS_MIN_INTERVAL_MS, 150);
  const maxRequestsPerRun = intFromEnv(process.env.CLINICALTRIALS_MAX_REQUESTS_PER_RUN, 3);

  const rateLimitedResult = await fetchJsonWithRetry<{ studies?: unknown[] }>(`${CLINICAL_TRIALS_API}?${params.toString()}`, {
    timeoutMs,
    maxRetries,
    minIntervalMs,
    maxRequestsPerRun,
    rateLimitKey: "clinicaltrials",
  });
  if (!rateLimitedResult.ok) {
    return { nctIds: [], sourceTimestamp: null };
  }

  return {
    nctIds: extractNctIds(rateLimitedResult.data),
    sourceTimestamp: extractClinicalTrialsSourceTimestamp(rateLimitedResult.data),
  };
}

export async function handler() {
  let nctIds: string[] = [];
  let sourceTimestamp: string | null = null;
  let fallbackUsed = false;

  try {
    const sourceData = await fetchClinicalTrialsData(6);
    nctIds = sourceData.nctIds;
    sourceTimestamp = sourceData.sourceTimestamp;
  } catch {
    nctIds = [];
    sourceTimestamp = null;
  }

  if (nctIds.length === 0) {
    nctIds = ["NCT00000620", "NCT00000378"];
    fallbackUsed = true;
  }

  const pmids = nctIds.map((id) => id.replace("NCT", "97"));
  const ingestion = await importPubmedPmids(pmids);
  return buildConnectorOutput(ingestion, {
    connectorId: "clinicaltrials",
    registryPrefix: "NCT",
    sampledIds: nctIds,
    fallbackUsed,
    sourceTimestamp: fallbackUsed ? undefined : sourceTimestamp ?? undefined,
  });
}
