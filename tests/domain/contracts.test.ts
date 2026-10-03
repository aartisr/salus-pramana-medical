import { describe, expect, it } from "vitest";
import {
  evidenceSubmissionSchema,
  isAllowedEvidenceSourceUrl,
  isPublicEvidence,
  medicalConditionSchema,
  publicationTransitionSchema,
  treatmentEvidenceSchema,
} from "../../src/domain/contracts";

const evidence = {
  evidenceId: "ev-1",
  conditionId: "cond-1",
  medicalSystem: "Allopathy",
  interventionName: "Metformin",
  isPharmacological: true,
  evidenceGrade: "A",
  studyMethodology: "Randomized controlled trial",
  registryIdentifier: "PMID-123",
  sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/123/",
  clinicalOutcomeSummary: "Improved the measured clinical endpoint.",
};

describe("domain contracts", () => {
  it("preserves unknown additive fields and old records without publication status", () => {
    const parsed = treatmentEvidenceSchema.parse({ ...evidence, futureField: { retained: true } });
    expect(parsed.futureField).toEqual({ retained: true });
    expect(parsed.publicationStatus).toBeUndefined();
    expect(isPublicEvidence(parsed)).toBe(true);
    expect(parsed.contraindications).toEqual([]);
  });

  it("accepts the complete persisted status union but restricts editor transitions", () => {
    expect(treatmentEvidenceSchema.parse({ ...evidence, publicationStatus: "under_review" }).publicationStatus).toBe("under_review");
    expect(publicationTransitionSchema.safeParse({ publicationStatus: "under_review" }).success).toBe(false);
    expect(publicationTransitionSchema.parse({ publicationStatus: "rejected" })).toBe("rejected");
  });

  it("forces submissions to immutable drafts", () => {
    expect(evidenceSubmissionSchema.parse(evidence).publicationStatus).toBe("draft");
    expect(evidenceSubmissionSchema.safeParse({ ...evidence, publicationStatus: "published" }).success).toBe(false);
  });

  it("requires an allowed registry prefix and exact HTTPS allowlist boundary", () => {
    expect(treatmentEvidenceSchema.safeParse({ ...evidence, registryIdentifier: "OTHER-123" }).success).toBe(false);
    expect(isAllowedEvidenceSourceUrl("https://subdomain.nature.com/article")).toBe(true);
    expect(isAllowedEvidenceSourceUrl("http://nature.com/article")).toBe(false);
    expect(isAllowedEvidenceSourceUrl("https://nature.com.attacker.example/article")).toBe(false);
  });

  it("keeps additive condition fields without requiring root-only extensions", () => {
    const parsed = medicalConditionSchema.parse({
      conditionId: "cond-1",
      icd11Code: "5A11",
      standardName: "Type 2 Diabetes",
      futureClassification: "retained",
    });
    expect(parsed.futureClassification).toBe("retained");
    expect(parsed.category).toBeUndefined();
  });
});