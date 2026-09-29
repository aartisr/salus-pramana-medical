import { afterEach, describe, expect, it, vi } from "vitest";
import { handler as clinicalTrialsHandler } from "./clinicaltrials-ingestor";
import { handler as ayushHandler } from "./ayush-ingestor";
import { handler as ctriHandler } from "./ctri-ingestor";
import { resetHttpRateLimitsForTests } from "./shared/http";

describe("source ingestor scaffolds", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    resetHttpRateLimitsForTests();
  });

  it("clinicaltrials handler returns source metadata when table is missing", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("upstream unavailable"));

    const result = await clinicalTrialsHandler();
    expect(result.connector.id).toBe("clinicaltrials");
    expect(result.connector.registryPrefix).toBe("NCT");
    expect(result.connector.sampledIds).toEqual(["NCT00000620", "NCT00000378"]);
    expect(result.connector.fallbackUsed).toBe(true);
    expect(result.connector.freshness.fetchedAt).toEqual(expect.any(String));
    expect(result.connector.freshness.sourceTimestamp).toBeNull();
    expect(result.ingestion.reason).toBe("DYNAMODB_TABLE missing");
  });

  it("ayush handler returns source metadata when table is missing", async () => {
    vi.stubEnv("AYUSH_DATA_URL", "https://example.com/ayush.json");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("upstream unavailable"));

    const result = await ayushHandler();
    expect(result.connector.id).toBe("ayush");
    expect(result.connector.registryPrefix).toBe("AYUSH|DHARA");
    expect(result.connector.sampledIds).toEqual(["AYUSH-PH-2019-031", "DHARA-2024-0112"]);
    expect(result.connector.fallbackUsed).toBe(true);
    expect(result.connector.freshness.fetchedAt).toEqual(expect.any(String));
    expect(result.connector.freshness.sourceTimestamp).toBeNull();
    expect(result.ingestion.reason).toBe("DYNAMODB_TABLE missing");
  });

  it("ctri handler returns source metadata when table is missing", async () => {
    vi.stubEnv("CTRI_DATA_URL", "https://example.com/ctri.json");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("upstream unavailable"));

    const result = await ctriHandler();
    expect(result.connector.id).toBe("ctri");
    expect(result.connector.registryPrefix).toBe("CTRI|ICTRP");
    expect(result.connector.sampledIds).toEqual(["CTRI/2023/10/058421", "ICTRP-IND-2021-1033"]);
    expect(result.connector.fallbackUsed).toBe(true);
    expect(result.connector.freshness.fetchedAt).toEqual(expect.any(String));
    expect(result.connector.freshness.sourceTimestamp).toBeNull();
    expect(result.ingestion.reason).toBe("DYNAMODB_TABLE missing");
  });

  it("ayush handler propagates source freshness timestamp when live payload is available", async () => {
    vi.stubEnv("AYUSH_DATA_URL", "https://example.com/ayush.json");
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        metadata: { lastUpdated: "2024-06-04T11:20:00Z" },
        rows: [{ registryIdentifier: "AYUSH-LIVE-1" }],
      }),
    } as unknown as Response);

    const result = await ayushHandler();
    expect(result.connector.id).toBe("ayush");
    expect(result.connector.fallbackUsed).toBe(false);
    expect(result.connector.sampledIds).toEqual(["AYUSH-LIVE-1"]);
    expect(result.connector.freshness.sourceTimestamp).toBe("2024-06-04T11:20:00.000Z");
  });
});
