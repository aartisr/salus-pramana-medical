import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" }));

export async function evidenceExists(tableName: string, evidenceId: string): Promise<boolean> {
  const result = await client.send(
    new GetCommand({
      TableName: tableName,
      Key: { evidenceId },
    }),
  );

  return Boolean(result.Item);
}
