import type { TreatmentEvidence } from "@evidence-platform/domain";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { evidenceExists } from "./shared/dedup";
import { normalizeEvidence } from "./shared/normalize";

const tableName = process.env.DYNAMODB_TABLE || "";
const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" }));

function normalizePubmedRecord(pmid: string): TreatmentEvidence {
  return normalizeEvidence({
    evidenceId: `PMID-${pmid}`,
    conditionId: "cond-type2-diabetes",
    medicalSystem: "Allopathy",
    interventionName: "PubMed Imported Study",
    isPharmacological: true,
    evidenceGrade: "B",
    studyMethodology: "Automated import: review pending",
    registryIdentifier: `PMID-${pmid}`,
    sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
    clinicalOutcomeSummary: "Imported from PubMed pipeline. Requires editorial review before publication.",
  });
}

export async function importPubmedPmids(pmids: string[]) {
  if (!tableName) {
    return { source: "pubmed", ingested: 0, skipped: pmids.length, reason: "DYNAMODB_TABLE missing" };
  }

  let ingested = 0;
  let skipped = 0;

  for (const pmid of pmids) {
    const evidence = normalizePubmedRecord(pmid);
    if (await evidenceExists(tableName, evidence.evidenceId)) {
      skipped += 1;
      continue;
    }

    await client.send(new PutCommand({ TableName: tableName, Item: evidence }));
    ingested += 1;
  }

  return { source: "pubmed", ingested, skipped };
}

export async function handler() {
  const samplePmids = ["9742977", "17569207"];
  return importPubmedPmids(samplePmids);
}
