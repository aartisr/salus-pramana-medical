import { z } from "zod";

export const evidenceGradeSchema = z.enum(["A", "B", "C"]);

export const methodologySchema = z.string().min(3).max(200);

export const registryIdentifierSchema = z
  .string()
  .min(3)
  .max(100)
  .refine((value) => /^(PMID|DOI|CTRI|ICTRP|AYUSH|DHARA|NCT)-?/i.test(value), {
    message: "registryIdentifier must start with PMID/DOI/CTRI/ICTRP/AYUSH/DHARA/NCT",
  });

export const medicalSystemSchema = z.enum(["Allopathy", "Ayurveda", "Siddha", "Naturopathy"]);

export const medicalConditionSchema = z.object({
  conditionId: z.string().min(1),
  icd11Code: z.string().min(2).max(15),
  standardName: z.string().min(2).max(120),
  ayurvedicEquivalent: z.string().max(255).optional(),
  siddhaEquivalent: z.string().max(255).optional(),
  pathophysiologySummary: z.string().max(5000).optional(),
});

const allowedSourceDomains = [
  "pubmed.ncbi.nlm.nih.gov",
  "doi.org",
  "clinicaltrials.gov",
  "ctri.nic.in",
  "trialsearch.who.int",
  "ayush.gov.in",
  "cochranelibrary.com",
  "bmj.com",
  "thelancet.com",
  "nejm.org",
  "jamanetwork.com",
  "nature.com",
  "sciencedirect.com",
];

function isAllowedSourceUrl(urlValue: string): boolean {
  try {
    const url = new URL(urlValue);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return allowedSourceDomains.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

export const treatmentEvidenceSchema = z.object({
  evidenceId: z.string().min(1),
  conditionId: z.string().min(1),
  medicalSystem: medicalSystemSchema,
  interventionName: z.string().min(2).max(255),
  isPharmacological: z.boolean().default(true),
  evidenceGrade: evidenceGradeSchema,
  studyMethodology: methodologySchema,
  sampleSize: z.number().int().nonnegative().optional(),
  registryIdentifier: registryIdentifierSchema,
  sourceUrl: z.string().url().refine((value) => isAllowedSourceUrl(value), {
    message: "sourceUrl must be from an allowlisted evidence domain",
  }),
  clinicalOutcomeSummary: z.string().min(10).max(5000),
  publicationStatus: z.enum(["draft", "published", "rejected"]).optional(),
  contraindications: z.array(z.string().min(2)).default([]),
  interactionWarnings: z.array(z.string().min(2)).default([]),
  lastVerifiedDate: z.string().optional(),
});

export type MedicalCondition = z.infer<typeof medicalConditionSchema>;
export type TreatmentEvidence = z.infer<typeof treatmentEvidenceSchema>;

export function evidenceGradeDescription(grade: "A" | "B" | "C") {
  if (grade === "A") return "High confidence: multi-center RCT/meta-analysis";
  if (grade === "B") return "Moderate confidence: rigorous clinical but limited scale";
  return "Traditional/mechanistic confidence: pre-clinical or textual consensus";
}
