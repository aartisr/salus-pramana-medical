import { describe, expect, it, vi } from "vitest";
import { attachAiExplanation, ClinicalQueries } from "../../src/application";
import type { EvidenceRepository } from "../../src/persistence/contracts";
import { MemoryClinicalRepository } from "../../src/persistence/memory";

describe("clinical queries", () => {
  it("reads one authorized snapshot for intelligence and governance", async () => {
    const repository = MemoryClinicalRepository.seeded();
    const listEvidence = vi.spyOn(repository, "listEvidence");
    const result = await new ClinicalQueries(repository).conditionIntelligence({ conditionId: "cond-type2-diabetes", strictGates: true, asOf: new Date("2026-01-01T00:00:00.000Z") }, { isEditor: false });
    expect(listEvidence).toHaveBeenCalledOnce();
    expect(result.intelligence.decision).toBe("INSUFFICIENT_EVIDENCE");
    expect(result.governance.goNoGo).toBe(false);
  });

  it("rejects unauthorized draft snapshots", async () => {
    await expect(new ClinicalQueries(MemoryClinicalRepository.seeded()).conditionIntelligence({ conditionId: "cond-type2-diabetes", includeDrafts: true }, { isEditor: false })).rejects.toMatchObject({ code: "forbidden" });
  });

  it("never allows AI fields to replace deterministic decisions", async () => {
    const deterministic = await new ClinicalQueries(MemoryClinicalRepository.seeded()).conditionIntelligence({ conditionId: "cond-type2-diabetes", asOf: new Date("2026-01-01T00:00:00.000Z") }, { isEditor: false });
    const explained = attachAiExplanation(deterministic, { content: "RECOMMEND", source: "provider", decision: "RECOMMEND" } as never);
    expect(explained.intelligence.decision).toBe("INSUFFICIENT_EVIDENCE");
    expect(explained.ai).toEqual({ content: "RECOMMEND", source: "provider" });
  });

  it("surfaces repository failures instead of synthesizing evidence or failing over", async () => {
    const repository = { listEvidence: vi.fn(async () => { throw new Error("persistent store unavailable"); }) } as unknown as EvidenceRepository;
    await expect(new ClinicalQueries(repository).conditionIntelligence({ conditionId: "cond-1" }, { isEditor: false })).rejects.toThrow("persistent store unavailable");
  });
});