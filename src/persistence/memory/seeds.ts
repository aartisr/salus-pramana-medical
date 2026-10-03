import type { SeedSet } from "../contracts";

export const deterministicSeed: SeedSet = {
  conditions: [
    { conditionId: "cond-type2-diabetes", icd11Code: "5A11", standardName: "Type 2 Diabetes Mellitus", ayurvedicEquivalent: "Prameha / Madhumeha", siddhaEquivalent: "Madhumegam", pathophysiologySummary: "Insulin resistance and beta-cell dysfunction." },
    { conditionId: "cond-hypertension", icd11Code: "BA00", standardName: "Hypertension", ayurvedicEquivalent: "Raktagata Vata", siddhaEquivalent: "Ratha Kothippu Noi", pathophysiologySummary: "Persistently elevated blood pressure with vascular and renal risk." },
  ],
  evidence: [
    { evidenceId: "ev-metformin-1", conditionId: "cond-type2-diabetes", medicalSystem: "Allopathy", interventionName: "Metformin", isPharmacological: true, evidenceGrade: "A", studyMethodology: "Randomized controlled trial", sampleSize: 451, registryIdentifier: "PMID-9742977", sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/9742977/", clinicalOutcomeSummary: "Improved glycemic control and reduced progression risk compared with placebo.", contraindications: ["Severe renal impairment"], interactionWarnings: ["Alcohol may increase lactic acidosis risk"], publicationStatus: "published", lastVerifiedDate: "2026-07-01" },
  ],
};