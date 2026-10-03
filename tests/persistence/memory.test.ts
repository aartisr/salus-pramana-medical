import { describe, expect, it } from "vitest";
import { deterministicSeed, MemoryClinicalRepository } from "../../src/persistence/memory";

describe("memory repository", () => {
  it("seeds deterministically and non-destructively with actual counts", async () => {
    const repository = new MemoryClinicalRepository();
    expect(await repository.seed(deterministicSeed)).toEqual({ conditionsSeeded: 2, evidenceSeeded: 1, mode: "memory" });
    expect(await repository.seed(deterministicSeed)).toEqual({ conditionsSeeded: 0, evidenceSeeded: 0, mode: "memory" });
  });

  it("returns defensive snapshots", async () => {
    const repository = MemoryClinicalRepository.seeded();
    const first = await repository.listConditions();
    first[0].standardName = "mutated";
    expect((await repository.listConditions())[0].standardName).not.toBe("mutated");
  });
});