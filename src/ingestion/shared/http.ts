export type HttpFailureKind =
  | 'timeout'
  | 'http_error'
  | 'network_error'
  | 'invalid_json'
  | 'rate_limited'
  | 'response_too_large';

export type HttpFailure = {
  ok: false;
  errorKind: HttpFailureKind;
  message: string;
  retryable: boolean;
  attempts: number;
  status?: number;
};

export type FetchJsonResult<T> =
  | { ok: true; data: T; status: number; attempts: number; responseBytes: number }
  | HttpFailure;

export type HttpFetch = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export interface HttpClock {
  now(): number;
  sleep(milliseconds: number): Promise<void>;
  setTimeout(callback: () => void, milliseconds: number): unknown;
  clearTimeout(handle: unknown): void;
}

export type HttpPolicy = {
  timeoutMs: number;
  maxRetries: number;
  baseDelayMs: number;
  retryOnStatuses: readonly number[];
  minIntervalMs: number;
  maxRequestsPerRun: number;
  maxResponseBytes: number;
  headers?: HeadersInit;
};

export type HttpPolicyOptions = Partial<HttpPolicy>;

export type HttpRequestOptions = {
  headers?: HeadersInit;
  signal?: AbortSignal;
};

export interface BoundedHttpClient {
  getJson<T>(url: string, options?: HttpRequestOptions): Promise<FetchJsonResult<T>>;
}

const defaultClock: HttpClock = {
  now: () => Date.now(),
  sleep: (milliseconds) => new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds)),
  setTimeout: (callback, milliseconds) => globalThis.setTimeout(callback, milliseconds),
  clearTimeout: (handle) => globalThis.clearTimeout(handle as ReturnType<typeof globalThis.setTimeout>),
};

const defaultPolicy: HttpPolicy = {
  timeoutMs: 5_000,
  maxRetries: 2,
  baseDelayMs: 250,
  retryOnStatuses: [429, 500, 502, 503, 504],
  minIntervalMs: 0,
  maxRequestsPerRun: Number.POSITIVE_INFINITY,
  maxResponseBytes: 1_000_000,
};

function validatePolicy(policy: HttpPolicy) {
  if (!Number.isFinite(policy.timeoutMs) || policy.timeoutMs <= 0) throw new RangeError('timeoutMs must be positive');
  if (!Number.isInteger(policy.maxRetries) || policy.maxRetries < 0) throw new RangeError('maxRetries must be a non-negative integer');
  if (!Number.isFinite(policy.baseDelayMs) || policy.baseDelayMs < 0) throw new RangeError('baseDelayMs must be non-negative');
  if (!Number.isFinite(policy.minIntervalMs) || policy.minIntervalMs < 0) throw new RangeError('minIntervalMs must be non-negative');
  if (!(policy.maxRequestsPerRun === Number.POSITIVE_INFINITY || (Number.isInteger(policy.maxRequestsPerRun) && policy.maxRequestsPerRun > 0))) {
    throw new RangeError('maxRequestsPerRun must be a positive integer');
  }
  if (!Number.isInteger(policy.maxResponseBytes) || policy.maxResponseBytes <= 0) throw new RangeError('maxResponseBytes must be a positive integer');
}

function byteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

async function readBoundedBody(response: Response, maxResponseBytes: number) {
  if (!response.body) {
    const body = await response.text();
    const responseBytes = byteLength(body);
    return responseBytes > maxResponseBytes ? null : { body, responseBytes };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let body = '';
  let responseBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    responseBytes += value.byteLength;
    if (responseBytes > maxResponseBytes) {
      await reader.cancel();
      return null;
    }
    body += decoder.decode(value, { stream: true });
  }
  body += decoder.decode();
  return { body, responseBytes };
}

function failure(
  errorKind: HttpFailureKind,
  message: string,
  retryable: boolean,
  attempts: number,
  status?: number,
): HttpFailure {
  return { ok: false, errorKind, message, retryable, attempts, ...(status === undefined ? {} : { status }) };
}

export function createBoundedHttpClient(
  options: HttpPolicyOptions = {},
  dependencies: { fetch?: HttpFetch; clock?: HttpClock } = {},
): BoundedHttpClient {
  const policy: HttpPolicy = { ...defaultPolicy, ...options };
  validatePolicy(policy);

  const fetch = dependencies.fetch ?? globalThis.fetch.bind(globalThis);
  const clock = dependencies.clock ?? defaultClock;
  let requestCount = 0;
  let lastRequestAt: number | null = null;

  async function waitForInterval() {
    if (lastRequestAt === null || policy.minIntervalMs === 0) return;
    const remaining = policy.minIntervalMs - (clock.now() - lastRequestAt);
    if (remaining > 0) await clock.sleep(remaining);
  }

  return {
    async getJson<T>(url: string, requestOptions: HttpRequestOptions = {}): Promise<FetchJsonResult<T>> {
      let attempts = 0;

      for (let attempt = 1; attempt <= policy.maxRetries + 1; attempt += 1) {
        await waitForInterval();
        if (requestCount >= policy.maxRequestsPerRun) {
          return failure('rate_limited', 'Request cap reached for this connector run', false, attempts);
        }

        requestCount += 1;
        attempts += 1;
        lastRequestAt = clock.now();

        const controller = new AbortController();
        let timedOut = false;
        const onExternalAbort = () => controller.abort(requestOptions.signal?.reason);
        requestOptions.signal?.addEventListener('abort', onExternalAbort, { once: true });
        if (requestOptions.signal?.aborted) onExternalAbort();
        let rejectTimeout: (reason: DOMException) => void = () => undefined;
        const timeoutFailure = new Promise<never>((_resolve, reject) => {
          rejectTimeout = reject;
        });
        const timeout = clock.setTimeout(() => {
          timedOut = true;
          controller.abort();
          rejectTimeout(new DOMException('Request timed out', 'AbortError'));
        }, policy.timeoutMs);

        try {
          const response = await Promise.race([
            fetch(url, {
              headers: requestOptions.headers ?? policy.headers,
              signal: controller.signal,
            }),
            timeoutFailure,
          ]);

          if (!response.ok) {
            const retryable = policy.retryOnStatuses.includes(response.status);
            const errorKind = response.status === 429 ? 'rate_limited' : 'http_error';
            if (retryable && attempt <= policy.maxRetries) {
              await clock.sleep(policy.baseDelayMs * 2 ** (attempt - 1));
              continue;
            }
            return failure(errorKind, `HTTP ${response.status}`, retryable, attempts, response.status);
          }

          const declaredLength = Number(response.headers.get('content-length'));
          if (Number.isFinite(declaredLength) && declaredLength > policy.maxResponseBytes) {
            return failure('response_too_large', `Response exceeded ${policy.maxResponseBytes} bytes`, false, attempts, response.status);
          }

          const boundedBody = await readBoundedBody(response, policy.maxResponseBytes);
          if (!boundedBody) {
            return failure('response_too_large', `Response exceeded ${policy.maxResponseBytes} bytes`, false, attempts, response.status);
          }

          try {
            return {
              ok: true,
              data: JSON.parse(boundedBody.body) as T,
              status: response.status,
              attempts,
              responseBytes: boundedBody.responseBytes,
            };
          } catch {
            return failure('invalid_json', 'Invalid JSON response', false, attempts, response.status);
          }
        } catch (error) {
          const errorKind: HttpFailureKind = timedOut ? 'timeout' : 'network_error';
          const retryable = true;
          if (attempt <= policy.maxRetries) {
            await clock.sleep(policy.baseDelayMs * 2 ** (attempt - 1));
            continue;
          }
          return failure(
            errorKind,
            error instanceof Error ? error.message : 'Network request failed',
            retryable,
            attempts,
          );
        } finally {
          clock.clearTimeout(timeout);
          requestOptions.signal?.removeEventListener('abort', onExternalAbort);
        }
      }

      return failure('network_error', 'Request failed after retries', true, attempts);
    },
  };
}