import { describe, expect, it } from "vitest";
import { treatmentEvidenceSchema } from "./index";

describe("domain evidence schema", () => {
  it("accepts valid registry identifier", () => {
    const parsed = treatmentEvidenceSchema.safeParse({
      evidenceId: "ev-1",
      conditionId: "cond-1",
      medicalSystem: "Allopathy",
      interventionName: "Metformin",
      isPharmacological: true,
      evidenceGrade: "A",
      studyMethodology: "Double-blind RCT",
      registryIdentifier: "PMID-12345",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/12345/",
      clinicalOutcomeSummary: "Significant reduction in HbA1c compared with placebo.",
      contraindications: [],
      interactionWarnings: [],
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid registry identifier prefix", () => {
    const parsed = treatmentEvidenceSchema.safeParse({
      evidenceId: "ev-2",
      conditionId: "cond-1",
      medicalSystem: "Allopathy",
      interventionName: "Metformin",
      isPharmacological: true,
      evidenceGrade: "A",
      studyMethodology: "Double-blind RCT",
      registryIdentifier: "BLOG-123",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/12345/",
      clinicalOutcomeSummary: "Significant reduction in HbA1c compared with placebo.",
      contraindications: [],
      interactionWarnings: [],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects source URL outside allowlist", () => {
    const parsed = treatmentEvidenceSchema.safeParse({
      evidenceId: "ev-3",
      conditionId: "cond-1",
      medicalSystem: "Allopathy",
      interventionName: "Metformin",
      isPharmacological: true,
      evidenceGrade: "A",
      studyMethodology: "Double-blind RCT",
      registryIdentifier: "PMID-12345",
      sourceUrl: "https://example.com/fake-evidence",
      clinicalOutcomeSummary: "Significant reduction in HbA1c compared with placebo.",
      contraindications: [],
      interactionWarnings: [],
    });
    expect(parsed.success).toBe(false);
  });

  it("requires HTTPS even for an allowlisted source", () => {
    const parsed = treatmentEvidenceSchema.safeParse({
      evidenceId: "ev-http-source",
      conditionId: "cond-1",
      medicalSystem: "Allopathy",
      interventionName: "Metformin",
      isPharmacological: true,
      evidenceGrade: "A",
      studyMethodology: "Double-blind RCT",
      registryIdentifier: "PMID-12345",
      sourceUrl: "http://pubmed.ncbi.nlm.nih.gov/12345/",
      clinicalOutcomeSummary: "Significant reduction in HbA1c compared with placebo.",
      contraindications: [],
      interactionWarnings: [],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects empty clinical outcome summary", () => {
    const parsed = treatmentEvidenceSchema.safeParse({
      evidenceId: "ev-4",
      conditionId: "cond-1",
      medicalSystem: "Allopathy",
      interventionName: "Metformin",
      isPharmacological: true,
      evidenceGrade: "A",
      studyMethodology: "Double-blind RCT",
      registryIdentifier: "PMID-12345",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/12345/",
      clinicalOutcomeSummary: "",
      contraindications: [],
      interactionWarnings: [],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects short contraindication values", () => {
    const parsed = treatmentEvidenceSchema.safeParse({
      evidenceId: "ev-5",
      conditionId: "cond-1",
      medicalSystem: "Allopathy",
      interventionName: "Metformin",
      isPharmacological: true,
      evidenceGrade: "A",
      studyMethodology: "Double-blind RCT",
      registryIdentifier: "PMID-12345",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/12345/",
      clinicalOutcomeSummary: "Significant reduction in HbA1c compared with placebo.",
      contraindications: ["x"],
      interactionWarnings: [],
    });
    expect(parsed.success).toBe(false);
  });
});
