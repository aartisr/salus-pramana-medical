import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchJsonWithRetry, resetHttpRateLimitsForTests } from "./http";

describe("fetchJsonWithRetry", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetHttpRateLimitsForTests();
  });

  it("returns parsed json on successful response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ rows: [{ id: "ok" }] }),
    } as unknown as Response);

    const result = await fetchJsonWithRetry<{ rows: Array<{ id: string }> }>("https://example.com");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.rows[0].id).toBe("ok");
      expect(result.attempts).toBe(1);
    }
  });

  it("retries transient http failures then succeeds", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({}),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ records: [{ id: "retry-ok" }] }),
      } as unknown as Response);

    const result = await fetchJsonWithRetry<{ records: Array<{ id: string }> }>("https://example.com", {
      maxRetries: 2,
      baseDelayMs: 1,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.records[0].id).toBe("retry-ok");
      expect(result.attempts).toBe(2);
    }
  });

  it("returns structured timeout/network failure after retries", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("connection reset"));

    const result = await fetchJsonWithRetry("https://example.com", {
      maxRetries: 1,
      baseDelayMs: 1,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorKind).toBe("network_error");
      expect(result.attempts).toBe(2);
      expect(result.retryable).toBe(true);
    }
  });

  it("returns rate_limited when request cap is exceeded", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ value: "ok" }),
    } as unknown as Response);

    const first = await fetchJsonWithRetry<{ value: string }>("https://example.com", {
      rateLimitKey: "cap-test",
      maxRequestsPerRun: 1,
      maxRetries: 0,
    });
    const second = await fetchJsonWithRetry<{ value: string }>("https://example.com", {
      rateLimitKey: "cap-test",
      maxRequestsPerRun: 1,
      maxRetries: 0,
    });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    if (!second.ok) {
      expect(second.errorKind).toBe("rate_limited");
      expect(second.retryable).toBe(false);
    }
  });
});
