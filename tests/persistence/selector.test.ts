import { describe, expect, it, vi } from "vitest";
import { MemoryClinicalRepository } from "../../src/persistence/memory";
import { selectPersistence } from "../../src/persistence/select-adapter";

const memory = vi.fn(() => new MemoryClinicalRepository());
const dynamodb = vi.fn(async () => new MemoryClinicalRepository());

describe("persistence selector", () => {
  it("rejects missing, unknown, production memory, and incomplete DynamoDB configuration", async () => {
    await expect(selectPersistence({ environment: "test" }, { memory, dynamodb })).rejects.toThrow("required");
    await expect(selectPersistence({ adapter: "other", environment: "test" }, { memory, dynamodb })).rejects.toThrow("Unknown");
    await expect(selectPersistence({ adapter: "memory", environment: "production" }, { memory, dynamodb })).rejects.toThrow("forbidden");
    await expect(selectPersistence({ adapter: "dynamodb", environment: "production", evidenceTable: "e" }, { memory, dynamodb })).rejects.toThrow("requires");
  });

  it("constructs exactly one adapter and never supplies a fallback", async () => {
    memory.mockClear();
    dynamodb.mockClear();
    await selectPersistence({ adapter: "dynamodb", environment: "production", conditionsTable: "c", evidenceTable: "e", auditTable: "a" }, { memory, dynamodb });
    expect(dynamodb).toHaveBeenCalledOnce();
    expect(memory).not.toHaveBeenCalled();
  });
});