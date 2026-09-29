import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { ScheduledHandler } from "aws-lambda";
import { computeConditionIntelligence } from "./intelligence";
import { computeConditionValidationGates } from "./validation-gates";
import { listConditions, listEvidenceByCondition } from "./repository";

type DriftSnapshot = {
  snapshotId: string;
  conditionId: string;
  capturedAt: string;
  mode: "public" | "clinician";
  modelVersion: string;
  conditionPramanaScore: number;
  confidenceScore: number;
  decision: string;
  bayesianProbability: number;
  goNoGo: boolean;
  gateStatuses: Record<string, string>;
};

function getDocClient() {
  const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
  return DynamoDBDocumentClient.from(client);
}

async function persistSnapshot(snapshot: DriftSnapshot) {
  const tableName = process.env.MONITORING_TABLE;
  if (!tableName) {
    return;
  }

  const doc = getDocClient();
  await doc.send(
    new PutCommand({
      TableName: tableName,
      Item: snapshot,
    }),
  );
}

export async function runDriftSnapshot(mode: "public" | "clinician" = "public") {
  const conditions = await listConditions();
  const capturedAt = new Date().toISOString();
  const snapshots: DriftSnapshot[] = [];

  for (const condition of conditions) {
    const rows = await listEvidenceByCondition(condition.conditionId, false);
    const intelligence = computeConditionIntelligence(condition.conditionId, rows, mode);
    const gates = computeConditionValidationGates(condition.conditionId, rows, intelligence);

    const snapshot: DriftSnapshot = {
      snapshotId: `${condition.conditionId}#${capturedAt}`,
      conditionId: condition.conditionId,
      capturedAt,
      mode,
      modelVersion: intelligence.modelVersion,
      conditionPramanaScore: intelligence.conditionPramanaScore,
      confidenceScore: intelligence.confidenceScore,
      decision: intelligence.decision,
      bayesianProbability: intelligence.bayesianProbabilityAboveThreshold,
      goNoGo: gates.goNoGo,
      gateStatuses: {
        calibrationSlope: gates.gates.calibrationSlope.status,
        calibrationIntercept: gates.gates.calibrationIntercept.status,
        intervalReliability95: gates.gates.intervalReliability95.status,
        citationCoverage: gates.gates.citationCoverage.status,
        recencyCoverage: gates.gates.recencyCoverage.status,
      },
    };

    snapshots.push(snapshot);
    await persistSnapshot(snapshot);
  }

  return {
    capturedAt,
    mode,
    count: snapshots.length,
    storedInDynamo: Boolean(process.env.MONITORING_TABLE),
    snapshots,
  };
}

export const handler: ScheduledHandler = async () => {
  const result = await runDriftSnapshot("public");
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        message: "Drift snapshot completed",
        capturedAt: result.capturedAt,
        count: result.count,
        storedInDynamo: result.storedInDynamo,
      },
      null,
      2,
    ),
  );
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv.includes("--clinician") ? "clinician" : "public";
  runDriftSnapshot(mode)
    .then((result) => {
      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify(
          {
            message: "Drift snapshot generated",
            capturedAt: result.capturedAt,
            count: result.count,
            storedInDynamo: result.storedInDynamo,
          },
          null,
          2,
        ),
      );
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Failed to generate drift snapshot", error);
      process.exitCode = 1;
    });
}
