import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { MedicalCondition, TreatmentEvidence } from "@evidence-platform/domain";

const seedConditions: MedicalCondition[] = [
  {
    conditionId: "cond-type2-diabetes",
    icd11Code: "5A11",
    standardName: "Type 2 Diabetes Mellitus",
    ayurvedicEquivalent: "Prameha / Madhumeha",
    siddhaEquivalent: "Madhumegam",
    pathophysiologySummary: "Insulin resistance and beta-cell dysfunction.",
  },
  {
    conditionId: "cond-hypertension",
    icd11Code: "BA00",
    standardName: "Hypertension",
    ayurvedicEquivalent: "Raktagata Vata",
    siddhaEquivalent: "Ratha Kothippu Noi",
    pathophysiologySummary: "Persistently elevated blood pressure with vascular and renal risk.",
  },
  {
    conditionId: "cond-joint-inflammation",
    icd11Code: "FA20",
    standardName: "Joint Inflammation",
    ayurvedicEquivalent: "Amavata",
    siddhaEquivalent: "Azhal Keelvayu",
    pathophysiologySummary: "Inflammatory joint disease with pain, stiffness, and mobility reduction.",
  },
  {
    conditionId: "cond-stress-disorder",
    icd11Code: "MB23",
    standardName: "Stress Disorder",
    ayurvedicEquivalent: "Chittodvega",
    siddhaEquivalent: "Mana Azhutham",
    pathophysiologySummary: "Stress-spectrum dysregulation with sleep, cortisol, and autonomic symptoms.",
  },
];

const seedEvidence: TreatmentEvidence[] = [
  {
    evidenceId: "ev-metformin-1",
    conditionId: "cond-type2-diabetes",
    medicalSystem: "Allopathy",
    interventionName: "Metformin",
    isPharmacological: true,
    evidenceGrade: "A",
    studyMethodology: "Randomized controlled trial",
    sampleSize: 451,
    registryIdentifier: "PMID-9742977",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/9742977/",
    clinicalOutcomeSummary: "Improved glycemic control and reduced progression risk compared with placebo.",
    contraindications: ["Severe renal impairment"],
    interactionWarnings: ["Alcohol may increase lactic acidosis risk"],
    publicationStatus: "published",
    lastVerifiedDate: "2026-07-01",
  },
  {
    evidenceId: "ev-dash-1",
    conditionId: "cond-hypertension",
    medicalSystem: "Allopathy",
    interventionName: "DASH Diet",
    isPharmacological: false,
    evidenceGrade: "A",
    studyMethodology: "Randomized controlled dietary intervention",
    sampleSize: 459,
    registryIdentifier: "PMID-7564658",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/7564658/",
    clinicalOutcomeSummary: "Significant blood pressure reduction over control diet conditions.",
    contraindications: [],
    interactionWarnings: [],
    publicationStatus: "published",
    lastVerifiedDate: "2026-07-01",
  },
  {
    evidenceId: "ev-potassium-1",
    conditionId: "cond-hypertension",
    medicalSystem: "Allopathy",
    interventionName: "Potassium Supplementation",
    isPharmacological: false,
    evidenceGrade: "A",
    studyMethodology: "Meta-analysis of randomized controlled trials",
    sampleSize: 1606,
    registryIdentifier: "PMID-11136953",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/11136953/",
    clinicalOutcomeSummary: "Potassium supplementation associated with clinically meaningful systolic blood pressure reduction.",
    contraindications: ["Advanced kidney disease requires supervision"],
    interactionWarnings: ["Monitor with potassium-sparing medications"],
    publicationStatus: "published",
    lastVerifiedDate: "2026-07-01",
  },
  {
    evidenceId: "ev-curcumin-1",
    conditionId: "cond-joint-inflammation",
    medicalSystem: "Ayurveda",
    interventionName: "Curcumin (standardized extract)",
    isPharmacological: true,
    evidenceGrade: "B",
    studyMethodology: "Controlled clinical trial",
    sampleSize: 120,
    registryIdentifier: "PMID-17569207",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/17569207/",
    clinicalOutcomeSummary: "Moderate improvements in pain and inflammatory markers in joint disorders.",
    contraindications: ["Gallbladder obstruction"],
    interactionWarnings: ["May potentiate antiplatelet drugs"],
    publicationStatus: "published",
    lastVerifiedDate: "2026-07-01",
  },
  {
    evidenceId: "ev-ashwagandha-1",
    conditionId: "cond-stress-disorder",
    medicalSystem: "Ayurveda",
    interventionName: "Ashwagandha",
    isPharmacological: true,
    evidenceGrade: "B",
    studyMethodology: "Double blind randomized trial",
    sampleSize: 64,
    registryIdentifier: "PMID-23439798",
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/23439798/",
    clinicalOutcomeSummary: "Reduced stress scores and improved resilience indicators versus placebo.",
    contraindications: ["Hyperthyroidism requires monitoring"],
    interactionWarnings: ["Sedative medication additive effects possible"],
    publicationStatus: "published",
    lastVerifiedDate: "2026-07-01",
  },
  {
    evidenceId: "ev-sarpagandha-1",
    conditionId: "cond-hypertension",
    medicalSystem: "Ayurveda",
    interventionName: "Sarpagandha (Rauwolfia serpentina)",
    isPharmacological: true,
    evidenceGrade: "B",
    studyMethodology: "Clinical observational protocol",
    sampleSize: 87,
    registryIdentifier: "AYUSH-PH-2019-031",
    sourceUrl: "https://ayush.gov.in/",
    clinicalOutcomeSummary: "Observed blood pressure lowering signal in monitored clinical use.",
    contraindications: ["History of depression"],
    interactionWarnings: ["Potentiates antihypertensives"],
    publicationStatus: "published",
    lastVerifiedDate: "2026-07-01",
  },
];

const inMemoryConditions: MedicalCondition[] = [...seedConditions];
const inMemoryEvidence: TreatmentEvidence[] = [...seedEvidence];

type EvidenceStatus = "draft" | "published" | "rejected";

type AuditRecord = {
  auditId: string;
  action: string;
  actorEmail: string;
  targetEvidenceId: string;
  timestamp: string;
  ipAddress?: string;
  ttl?: number;
};

function useDynamo() {
  return Boolean(process.env.DYNAMODB_TABLE);
}

function createDocClient() {
  const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
  return DynamoDBDocumentClient.from(client);
}

export async function listConditions() {
  if (!useDynamo()) {
    return inMemoryConditions;
  }

  const tableName = process.env.CONDITIONS_TABLE;
  if (!tableName) {
    return inMemoryConditions;
  }

  const doc = createDocClient();
  const result = await doc.send(new ScanCommand({ TableName: tableName }));
  return (result.Items as MedicalCondition[]) ?? [];
}

export async function saveCondition(condition: MedicalCondition) {
  if (!useDynamo()) {
    const existing = inMemoryConditions.findIndex((item) => item.conditionId === condition.conditionId);
    if (existing >= 0) {
      inMemoryConditions[existing] = condition;
    } else {
      inMemoryConditions.push(condition);
    }
    return condition;
  }

  const tableName = process.env.CONDITIONS_TABLE;
  if (!tableName) {
    return condition;
  }

  const doc = createDocClient();
  await doc.send(new PutCommand({ TableName: tableName, Item: condition }));
  return condition;
}

export async function getCondition(conditionId: string) {
  if (!useDynamo()) {
    return inMemoryConditions.find((condition) => condition.conditionId === conditionId) ?? null;
  }

  const tableName = process.env.CONDITIONS_TABLE;
  if (!tableName) return null;
  const result = await createDocClient().send(new GetCommand({ TableName: tableName, Key: { conditionId } }));
  return (result.Item as MedicalCondition | undefined) ?? null;
}

export async function ensureSeedData() {
  if (!useDynamo()) {
    for (const condition of seedConditions) {
      const exists = inMemoryConditions.some((item) => item.conditionId === condition.conditionId);
      if (!exists) {
        inMemoryConditions.push(condition);
      }
    }

    for (const evidence of seedEvidence) {
      const exists = inMemoryEvidence.some((item) => item.evidenceId === evidence.evidenceId);
      if (!exists) {
        inMemoryEvidence.push(evidence);
      }
    }

    return {
      conditionsSeeded: seedConditions.length,
      evidenceSeeded: seedEvidence.length,
      mode: "memory" as const,
    };
  }

  const conditionsTable = process.env.CONDITIONS_TABLE;
  const evidenceTable = process.env.DYNAMODB_TABLE;

  if (!conditionsTable || !evidenceTable) {
    return {
      conditionsSeeded: 0,
      evidenceSeeded: 0,
      mode: "skipped" as const,
    };
  }

  const doc = createDocClient();

  let conditionsSeeded = 0;
  for (const condition of seedConditions) {
    const existing = await doc.send(
      new GetCommand({
        TableName: conditionsTable,
        Key: { conditionId: condition.conditionId },
      }),
    );

    if (!existing.Item) {
      await doc.send(new PutCommand({ TableName: conditionsTable, Item: condition }));
      conditionsSeeded += 1;
    }
  }

  let evidenceSeeded = 0;
  for (const evidence of seedEvidence) {
    const existing = await doc.send(
      new GetCommand({
        TableName: evidenceTable,
        Key: { evidenceId: evidence.evidenceId },
      }),
    );

    if (!existing.Item) {
      await doc.send(new PutCommand({ TableName: evidenceTable, Item: evidence }));
      evidenceSeeded += 1;
    }
  }

  return {
    conditionsSeeded,
    evidenceSeeded,
    mode: "dynamodb" as const,
  };
}

export async function listEvidenceByCondition(conditionId?: string, includeDrafts = false) {
  const statusFilter = (row: TreatmentEvidence) => includeDrafts || (row.publicationStatus ?? "published") === "published";

  if (!useDynamo()) {
    const rows = conditionId ? inMemoryEvidence.filter((e) => e.conditionId === conditionId) : inMemoryEvidence;
    return rows.filter(statusFilter);
  }

  const tableName = process.env.DYNAMODB_TABLE as string;
  const doc = createDocClient();

  if (conditionId) {
    const result = await doc.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: "byCondition",
        KeyConditionExpression: "conditionId = :conditionId",
        ExpressionAttributeValues: { ":conditionId": conditionId },
      }),
    );
    const rows = (result.Items as TreatmentEvidence[]) ?? [];
    return rows.filter(statusFilter);
  }

  const result = await doc.send(new ScanCommand({ TableName: tableName }));
  const rows = (result.Items as TreatmentEvidence[]) ?? [];
  return rows.filter(statusFilter);
}

export async function saveEvidence(record: TreatmentEvidence) {
  const normalized: TreatmentEvidence = {
    ...record,
    publicationStatus: record.publicationStatus ?? "draft",
  };

  if (!useDynamo()) {
    const idx = inMemoryEvidence.findIndex((item) => item.evidenceId === normalized.evidenceId);
    if (idx >= 0) {
      inMemoryEvidence[idx] = normalized;
    } else {
      inMemoryEvidence.unshift(normalized);
    }
    return normalized;
  }

  const tableName = process.env.DYNAMODB_TABLE as string;
  const doc = createDocClient();

  const existing = await doc.send(new GetCommand({ TableName: tableName, Key: { evidenceId: normalized.evidenceId } }));
  const existingItem = existing.Item as TreatmentEvidence | undefined;

  if (existingItem && existingItem.lastVerifiedDate && normalized.lastVerifiedDate) {
    if (existingItem.lastVerifiedDate >= normalized.lastVerifiedDate) {
      return existingItem;
    }
  }

  await doc.send(
    new PutCommand({
      TableName: tableName,
      Item: normalized,
    }),
  );

  return normalized;
}

/** Creates a submission exactly once; updates must go through an explicit editorial workflow. */
export async function createEvidence(record: TreatmentEvidence) {
  if (!useDynamo()) {
    if (inMemoryEvidence.some((item) => item.evidenceId === record.evidenceId)) return null;
    inMemoryEvidence.unshift(record);
    return record;
  }

  const tableName = process.env.DYNAMODB_TABLE;
  if (!tableName) return null;
  try {
    await createDocClient().send(
      new PutCommand({
        TableName: tableName,
        Item: record,
        ConditionExpression: "attribute_not_exists(evidenceId)",
      }),
    );
    return record;
  } catch (error) {
    if (error instanceof Error && error.name === "ConditionalCheckFailedException") return null;
    throw error;
  }
}

export async function updateEvidencePublicationStatus(evidenceId: string, publicationStatus: EvidenceStatus) {
  if (!useDynamo()) {
    const idx = inMemoryEvidence.findIndex((item) => item.evidenceId === evidenceId);
    if (idx < 0) {
      return null;
    }
    inMemoryEvidence[idx] = { ...inMemoryEvidence[idx], publicationStatus };
    return inMemoryEvidence[idx];
  }

  const tableName = process.env.DYNAMODB_TABLE as string;
  const doc = createDocClient();

  let result;
  try {
    result = await doc.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { evidenceId },
        UpdateExpression: "SET publicationStatus = :publicationStatus",
        ConditionExpression: "attribute_exists(evidenceId)",
        ExpressionAttributeValues: {
          ":publicationStatus": publicationStatus,
        },
        ReturnValues: "ALL_NEW",
      }),
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ConditionalCheckFailedException") return null;
    throw error;
  }

  return (result.Attributes as TreatmentEvidence | undefined) ?? null;
}

export async function saveAuditLog(input: Omit<AuditRecord, "auditId" | "timestamp" | "ttl">) {
  const now = new Date();
  const ttl = Math.floor(now.getTime() / 1000) + 90 * 24 * 60 * 60;
  const record: AuditRecord = {
    auditId: `audit-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: now.toISOString(),
    ttl,
    ...input,
  };

  if (!useDynamo()) {
    return record;
  }

  const tableName = process.env.AUDIT_TABLE;
  if (!tableName) {
    return record;
  }

  const doc = createDocClient();
  await doc.send(new PutCommand({ TableName: tableName, Item: record }));
  return record;
}
