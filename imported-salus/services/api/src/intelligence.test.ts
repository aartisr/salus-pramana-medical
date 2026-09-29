import { describe, expect, it } from "vitest";
import type { TreatmentEvidence } from "@evidence-platform/domain";
import { computeConditionIntelligence, computeEvidenceIntelligence } from "./intelligence";

const rows: TreatmentEvidence[] = [
  {
    evidenceId: "ev-a",
    conditionId: "cond-test",
    medicalSystem: "Allopathy",
    interventionName: "Intervention A",
    isPharmacological: true,
    evidenceGrade: "A",
    studyMethodology: "Meta-analysis of randomized controlled trials",
    sampleSize: 1200,
    registryIdentifier: "PMID-100001",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/100001/",
    clinicalOutcomeSummary: "Large pooled effect with robust endpoint consistency.",
    contraindications: [],
    interactionWarnings: [],
    publicationStatus: "published",
    lastVerifiedDate: "2026-01-01",
  },
  {
    evidenceId: "ev-b",
    conditionId: "cond-test",
    medicalSystem: "Ayurveda",
    interventionName: "Intervention B",
    isPharmacological: true,
    evidenceGrade: "B",
    studyMethodology: "Controlled clinical trial",
    sampleSize: 140,
    registryIdentifier: "PMID-100002",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/100002/",
    clinicalOutcomeSummary: "Moderate directional signal with acceptable safety profile.",
    contraindications: ["Gallbladder disease"],
    interactionWarnings: ["Potential antiplatelet interaction"],
    publicationStatus: "published",
    lastVerifiedDate: "2023-06-12",
  },
];

describe("intelligence engine", () => {
  it("computes deterministic condition intelligence", () => {
    const asOf = new Date("2026-07-04T00:00:00.000Z");
    const first = computeConditionIntelligence("cond-test", rows, "public", asOf);
    const second = computeConditionIntelligence("cond-test", rows, "public", asOf);

    expect(first).toEqual(second);
    expect(first.evidenceCount).toBe(2);
    expect(first.contributions[0].pramanaScore).toBeGreaterThanOrEqual(first.contributions[1].pramanaScore);
    expect(first.confidenceInterval95.lower).toBeLessThanOrEqual(first.confidenceInterval95.upper);
  });

  it("returns insufficient evidence when no rows are available", () => {
    const result = computeConditionIntelligence("cond-empty", [], "public", new Date("2026-07-04T00:00:00.000Z"));

    expect(result.evidenceCount).toBe(0);
    expect(result.decision).toBe("INSUFFICIENT_EVIDENCE");
    expect(result.contributions).toEqual([]);
  });

  it("computes evidence detail from condition context", () => {
    const result = computeEvidenceIntelligence("ev-b", rows, "clinician", new Date("2026-07-04T00:00:00.000Z"));
    expect(result).not.toBeNull();
    expect(result?.evidence?.evidenceId).toBe("ev-b");
    expect(result?.mode).toBe("clinician");
  });

  it("does not force neutral score for single strong evidence row", () => {
    const singleRow: TreatmentEvidence[] = [
      {
        evidenceId: "ev-single",
        conditionId: "cond-single",
        medicalSystem: "Allopathy",
        interventionName: "Single Strong Study",
        isPharmacological: true,
        evidenceGrade: "A",
        studyMethodology: "Randomized controlled trial",
        sampleSize: 450,
        registryIdentifier: "PMID-200001",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/200001/",
        clinicalOutcomeSummary: "Robust primary endpoint improvement with acceptable safety profile.",
        contraindications: [],
        interactionWarnings: [],
        publicationStatus: "published",
        lastVerifiedDate: "2026-06-15",
      },
    ];

    const result = computeConditionIntelligence("cond-single", singleRow, "public", new Date("2026-07-04T00:00:00.000Z"));

    expect(result.evidenceCount).toBe(1);
    expect(result.conditionPramanaScore).toBeGreaterThan(50);
    expect(result.decision).not.toBe("INSUFFICIENT_EVIDENCE");
  });
});
