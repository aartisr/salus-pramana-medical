export type HttpFailureKind = "timeout" | "http_error" | "network_error" | "invalid_json" | "rate_limited";

export type FetchJsonResult<T> =
  | { ok: true; data: T; status: number; attempts: number }
  | { ok: false; errorKind: HttpFailureKind; message: string; retryable: boolean; status?: number; attempts: number };

export type FetchJsonOptions = {
  timeoutMs?: number;
  maxRetries?: number;
  baseDelayMs?: number;
  retryOnStatuses?: number[];
  headers?: HeadersInit;
  rateLimitKey?: string;
  minIntervalMs?: number;
  maxRequestsPerRun?: number;
};

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_BASE_DELAY_MS = 250;
const DEFAULT_MIN_INTERVAL_MS = 0;
const DEFAULT_MAX_REQUESTS_PER_RUN = Number.POSITIVE_INFINITY;
const DEFAULT_RETRY_ON_STATUSES = [429, 500, 502, 503, 504];

type RequestTracker = {
  requestCount: number;
  lastRequestAt: number;
};

const requestTrackers = new Map<string, RequestTracker>();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function classifyFetchError(error: unknown): HttpFailureKind {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "timeout";
  }

  return "network_error";
}

function getRequestTracker(key: string): RequestTracker {
  const existing = requestTrackers.get(key);
  if (existing) {
    return existing;
  }

  const tracker: RequestTracker = { requestCount: 0, lastRequestAt: 0 };
  requestTrackers.set(key, tracker);
  return tracker;
}

async function enforceRateLimit(key: string, minIntervalMs: number) {
  if (minIntervalMs <= 0) {
    return;
  }

  const tracker = getRequestTracker(key);
  const now = Date.now();
  const elapsed = now - tracker.lastRequestAt;
  if (tracker.lastRequestAt > 0 && elapsed < minIntervalMs) {
    await sleep(minIntervalMs - elapsed);
  }
}

function consumeRequestSlot(key: string, maxRequestsPerRun: number): boolean {
  const tracker = getRequestTracker(key);
  if (tracker.requestCount >= maxRequestsPerRun) {
    return false;
  }

  tracker.requestCount += 1;
  tracker.lastRequestAt = Date.now();
  return true;
}

export function resetHttpRateLimitsForTests() {
  requestTrackers.clear();
}

export async function fetchJsonWithRetry<T>(url: string, options: FetchJsonOptions = {}): Promise<FetchJsonResult<T>> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  const minIntervalMs = options.minIntervalMs ?? DEFAULT_MIN_INTERVAL_MS;
  const maxRequestsPerRun = options.maxRequestsPerRun ?? DEFAULT_MAX_REQUESTS_PER_RUN;
  const rateLimitKey = options.rateLimitKey ?? "default";
  const retryOnStatuses = options.retryOnStatuses ?? DEFAULT_RETRY_ON_STATUSES;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt += 1) {
    await enforceRateLimit(rateLimitKey, minIntervalMs);
    if (!consumeRequestSlot(rateLimitKey, maxRequestsPerRun)) {
      return {
        ok: false,
        errorKind: "rate_limited",
        message: "Request cap reached for this connector run",
        retryable: false,
        attempts: attempt,
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: options.headers,
      });

      if (!response.ok) {
        const retryable = retryOnStatuses.includes(response.status);
        if (retryable && attempt <= maxRetries) {
          await sleep(baseDelayMs * 2 ** (attempt - 1));
          continue;
        }

        return {
          ok: false,
          errorKind: "http_error",
          message: `HTTP ${response.status}`,
          retryable,
          status: response.status,
          attempts: attempt,
        };
      }

      try {
        const data = (await response.json()) as T;
        return { ok: true, data, status: response.status, attempts: attempt };
      } catch {
        return {
          ok: false,
          errorKind: "invalid_json",
          message: "Invalid JSON response",
          retryable: false,
          status: response.status,
          attempts: attempt,
        };
      }
    } catch (error) {
      const errorKind = classifyFetchError(error);
      const retryable = errorKind === "timeout" || errorKind === "network_error";
      if (retryable && attempt <= maxRetries) {
        await sleep(baseDelayMs * 2 ** (attempt - 1));
        continue;
      }

      return {
        ok: false,
        errorKind,
        message: error instanceof Error ? error.message : "Network request failed",
        retryable,
        attempts: attempt,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    ok: false,
    errorKind: "network_error",
    message: "Request failed after retries",
    retryable: true,
    attempts: maxRetries + 1,
  };
}