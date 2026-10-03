export const EVIDENCE_GRADES = ["A", "B", "C"] as const;
export const MEDICAL_SYSTEMS = ["Allopathy", "Ayurveda", "Siddha", "Naturopathy"] as const;
export const PUBLICATION_STATUSES = ["draft", "published", "rejected", "under_review"] as const;
export const EDITOR_PUBLICATION_STATUSES = ["draft", "published", "rejected"] as const;
export const REGISTRY_PREFIXES = ["PMID", "DOI", "CTRI", "ICTRP", "AYUSH", "DHARA", "NCT"] as const;

export const EVIDENCE_SOURCE_DOMAINS = [
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
] as const;

export type EvidenceGrade = (typeof EVIDENCE_GRADES)[number];
export type MedicalSystem = (typeof MEDICAL_SYSTEMS)[number];
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];
export type EditorPublicationStatus = (typeof EDITOR_PUBLICATION_STATUSES)[number];

export interface MedicalCondition extends Record<string, unknown> {
  conditionId: string;
  icd11Code: string;
  standardName: string;
  ayurvedicEquivalent?: string;
  siddhaEquivalent?: string;
  naturopathicContext?: string;
  category?: string;
  pathophysiologySummary?: string;
  globalPrevalence?: string;
  annualBurdenDALYs?: string;
  primaryRiskFactors?: string[];
}

export interface TreatmentEvidence extends Record<string, unknown> {
  evidenceId: string;
  conditionId: string;
  medicalSystem: MedicalSystem;
  interventionName: string;
  isPharmacological: boolean;
  evidenceGrade: EvidenceGrade;
  studyMethodology: string;
  sampleSize?: number;
  registryIdentifier: string;
  sourceUrl: string;
  clinicalOutcomeSummary: string;
  contraindications: string[];
  interactionWarnings: string[];
  publicationStatus?: PublicationStatus;
  lastVerifiedDate?: string;
  activeIngredients?: string[];
  designCategory?: string;
  standardError?: number;
  effectSizeCohenD?: number;
  publishedYear?: number;
  riskOfBias?: "low" | "some_concerns" | "high" | "critical";
  pValueOfOutcome?: number;
  confidenceInterval95?: [number, number];
  primaryBiomarkerEndpoint?: string;
  therapeuticWindowHours?: number;
  bioavailabilityPercentage?: number;
  halfLifeHours?: number;
}

export interface AuditRecord extends Record<string, unknown> {
  auditId: string;
  action: string;
  actorEmail: string;
  targetEvidenceId: string;
  timestamp: string;
  ipAddress?: string;
  ttl: number;
}

export interface MonitoringSnapshot extends Record<string, unknown> {
  snapshotId: string;
  conditionId: string;
}

export type EvidenceSubmission = Omit<TreatmentEvidence, "publicationStatus" | "lastVerifiedDate"> & {
  publicationStatus?: "draft";
  lastVerifiedDate?: string;
};

export interface ValidationIssue {
  path: string;
  message: string;
}

export class ContractValidationError extends Error {
  constructor(readonly issues: ValidationIssue[]) {
    super(issues.map((issue) => `${issue.path}: ${issue.message}`).join("; "));
    this.name = "ContractValidationError";
  }
}

export interface Schema<T> {
  parse(input: unknown): T;
  safeParse(input: unknown): { success: true; data: T } | { success: false; error: ContractValidationError };
}

function schema<T>(parse: (input: unknown) => T): Schema<T> {
  return {
    parse,
    safeParse(input) {
      try {
        return { success: true, data: parse(input) };
      } catch (error) {
        return {
          success: false,
          error: error instanceof ContractValidationError
            ? error
            : new ContractValidationError([{ path: "$", message: "Invalid value" }]),
        };
      }
    },
  };
}

function object(input: unknown): Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new ContractValidationError([{ path: "$", message: "Expected an object" }]);
  }
  return input as Record<string, unknown>;
}

function requiredString(value: unknown, path: string, min = 1, max = Number.POSITIVE_INFINITY): string {
  if (typeof value !== "string" || value.trim().length < min || value.length > max) {
    throw new ContractValidationError([{ path, message: `Expected a string between ${min} and ${max} characters` }]);
  }
  return value;
}

function optionalString(value: unknown, path: string, max: number): string | undefined {
  return value === undefined ? undefined : requiredString(value, path, 1, max);
}

function stringArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim().length < 2)) {
    throw new ContractValidationError([{ path, message: "Expected an array of non-empty strings" }]);
  }
  return [...value];
}

function enumValue<T extends readonly string[]>(value: unknown, values: T, path: string): T[number] {
  if (typeof value !== "string" || !values.includes(value)) {
    throw new ContractValidationError([{ path, message: `Expected one of ${values.join(", ")}` }]);
  }
  return value as T[number];
}

export function isAllowedEvidenceSourceUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return url.protocol === "https:"
      && EVIDENCE_SOURCE_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

export function hasAllowedRegistryPrefix(value: string): boolean {
  return REGISTRY_PREFIXES.some((prefix) => new RegExp(`^${prefix}-?`, "i").test(value));
}

export const medicalConditionSchema = schema<MedicalCondition>((input) => {
  const value = object(input);
  return {
    ...value,
    conditionId: requiredString(value.conditionId, "conditionId"),
    icd11Code: requiredString(value.icd11Code, "icd11Code", 2, 15),
    standardName: requiredString(value.standardName, "standardName", 2, 120),
    ayurvedicEquivalent: optionalString(value.ayurvedicEquivalent, "ayurvedicEquivalent", 255),
    siddhaEquivalent: optionalString(value.siddhaEquivalent, "siddhaEquivalent", 255),
    naturopathicContext: optionalString(value.naturopathicContext, "naturopathicContext", 5000),
    category: optionalString(value.category, "category", 120),
    pathophysiologySummary: optionalString(value.pathophysiologySummary, "pathophysiologySummary", 5000),
    globalPrevalence: optionalString(value.globalPrevalence, "globalPrevalence", 500),
    annualBurdenDALYs: optionalString(value.annualBurdenDALYs, "annualBurdenDALYs", 500),
    primaryRiskFactors: value.primaryRiskFactors === undefined ? undefined : stringArray(value.primaryRiskFactors, "primaryRiskFactors"),
  };
});

export const treatmentEvidenceSchema = schema<TreatmentEvidence>((input) => {
  const value = object(input);
  const registryIdentifier = requiredString(value.registryIdentifier, "registryIdentifier", 3, 100);
  const sourceUrl = requiredString(value.sourceUrl, "sourceUrl", 1, 2048);
  if (!hasAllowedRegistryPrefix(registryIdentifier)) {
    throw new ContractValidationError([{ path: "registryIdentifier", message: "Registry prefix is not allowed" }]);
  }
  if (!isAllowedEvidenceSourceUrl(sourceUrl)) {
    throw new ContractValidationError([{ path: "sourceUrl", message: "Expected an allowlisted HTTPS evidence URL" }]);
  }
  if (typeof value.isPharmacological !== "boolean") {
    throw new ContractValidationError([{ path: "isPharmacological", message: "Expected a boolean" }]);
  }
  if (value.sampleSize !== undefined && (!Number.isInteger(value.sampleSize) || (value.sampleSize as number) < 0)) {
    throw new ContractValidationError([{ path: "sampleSize", message: "Expected a nonnegative integer" }]);
  }
  return {
    ...value,
    evidenceId: requiredString(value.evidenceId, "evidenceId"),
    conditionId: requiredString(value.conditionId, "conditionId"),
    medicalSystem: enumValue(value.medicalSystem, MEDICAL_SYSTEMS, "medicalSystem"),
    interventionName: requiredString(value.interventionName, "interventionName", 2, 255),
    isPharmacological: value.isPharmacological,
    evidenceGrade: enumValue(value.evidenceGrade, EVIDENCE_GRADES, "evidenceGrade"),
    studyMethodology: requiredString(value.studyMethodology, "studyMethodology", 3, 200),
    sampleSize: value.sampleSize as number | undefined,
    registryIdentifier,
    sourceUrl,
    clinicalOutcomeSummary: requiredString(value.clinicalOutcomeSummary, "clinicalOutcomeSummary", 10, 5000),
    contraindications: value.contraindications === undefined ? [] : stringArray(value.contraindications, "contraindications"),
    interactionWarnings: value.interactionWarnings === undefined ? [] : stringArray(value.interactionWarnings, "interactionWarnings"),
    publicationStatus: value.publicationStatus === undefined
      ? undefined
      : enumValue(value.publicationStatus, PUBLICATION_STATUSES, "publicationStatus"),
    lastVerifiedDate: optionalString(value.lastVerifiedDate, "lastVerifiedDate", 50),
  };
});

export const evidenceSubmissionSchema = schema<EvidenceSubmission>((input) => {
  const value = treatmentEvidenceSchema.parse(input);
  if (value.publicationStatus !== undefined && value.publicationStatus !== "draft") {
    throw new ContractValidationError([{ path: "publicationStatus", message: "Evidence submissions must be drafts" }]);
  }
  return { ...value, publicationStatus: "draft" } as EvidenceSubmission;
});

export const publicationTransitionSchema = schema<EditorPublicationStatus>((input) => {
  const value = typeof input === "object" && input !== null ? (input as Record<string, unknown>).publicationStatus : input;
  return enumValue(value, EDITOR_PUBLICATION_STATUSES, "publicationStatus");
});

export function effectivePublicationStatus(record: Pick<TreatmentEvidence, "publicationStatus">): PublicationStatus {
  return record.publicationStatus ?? "published";
}

export function isPublicEvidence(record: Pick<TreatmentEvidence, "publicationStatus">): boolean {
  return effectivePublicationStatus(record) === "published";
}