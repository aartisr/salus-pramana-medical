import { describe, expect, it } from "vitest";
import { handler } from "./pubmed-ingestor";

describe("pubmed ingestor", () => {
  it("short-circuits when DYNAMODB_TABLE is missing", async () => {
    const result = await handler();
    expect(result).toEqual({
      source: "pubmed",
      ingested: 0,
      skipped: 2,
      reason: "DYNAMODB_TABLE missing",
    });
  });
});
