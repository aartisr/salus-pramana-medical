import { afterEach, describe, expect, it, vi } from "vitest";
import { evidenceGradeDescription } from "@evidence-platform/domain";
import { createEvidence, listConditions } from "./lib/api";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("web smoke", () => {
  it("listConditions handles a successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ conditionId: "cond-1", icd11Code: "5A11", standardName: "Type 2 Diabetes" }],
      }),
    );

    const rows = await listConditions();
    expect(rows).toHaveLength(1);
  });

  it("createEvidence surfaces 400 errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        text: async () => "Bad Request",
      }),
    );

    await expect(
      createEvidence({
        evidenceId: "ev-1",
        conditionId: "cond-1",
        medicalSystem: "Allopathy",
        interventionName: "Metformin",
        isPharmacological: true,
        evidenceGrade: "A",
        studyMethodology: "Randomized controlled trial",
        registryIdentifier: "PMID-1234",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/1234/",
        clinicalOutcomeSummary: "Strong evidence for improved glycemic outcomes.",
        contraindications: [],
        interactionWarnings: [],
      }),
    ).rejects.toThrow(/Failed to create evidence/);
  });

  it("evidenceGradeDescription returns all grade messages", () => {
    expect(evidenceGradeDescription("A")).toMatch(/High confidence/);
    expect(evidenceGradeDescription("B")).toMatch(/Moderate confidence/);
    expect(evidenceGradeDescription("C")).toMatch(/Traditional/);
  });
});
