import {
  DescribeTableCommand,
  DynamoDBClient,
  TransactWriteItemsCommand,
  type AttributeValue,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import type { DynamoExecutor, DynamoOperation, DynamoResult, DynamoTransactionItem } from './index';

type Item = Record<string, unknown>;

function key(item: Record<string, string>): Item {
  return item;
}

function conditionExpression(condition?: 'not-exists') {
  return condition === 'not-exists' ? 'attribute_not_exists(#pk)' : undefined;
}

function primaryKeyFor(item: Item): string {
  if ('evidenceId' in item) return 'evidenceId';
  if ('auditId' in item) return 'auditId';
  if ('snapshotId' in item) return 'snapshotId';
  if ('conditionId' in item) return 'conditionId';
  throw new Error('DynamoDB item has no supported primary key');
}

/** Keeps the condition index chronological without exposing a second client-managed field. */
function withIndexKeys(item: Item): Item {
  if (typeof item.evidenceId !== 'string' || typeof item.conditionId !== 'string') return item;
  const verified = typeof item.lastVerifiedDate === 'string' ? item.lastVerifiedDate : '0000-00-00';
  return { ...item, conditionEvidenceKey: `${verified}#${item.evidenceId}` };
}

function transactionItem(item: DynamoTransactionItem) {
  if (item.type === 'condition-check') {
    return {
      ConditionCheck: {
        TableName: item.tableName,
        Key: key(item.key) as Record<string, AttributeValue>,
        ConditionExpression: item.exists ? 'attribute_exists(#pk)' : 'attribute_not_exists(#pk)',
        ExpressionAttributeNames: { '#pk': Object.keys(item.key)[0] },
      },
    };
  }
  if (item.type === 'put') {
    const indexed = withIndexKeys(item.item);
    const primaryKey = primaryKeyFor(indexed);
    return {
      Put: {
        TableName: item.tableName,
        Item: indexed as Record<string, AttributeValue>,
        ConditionExpression: item.condition ? 'attribute_not_exists(#pk)' : undefined,
        ExpressionAttributeNames: item.condition ? { '#pk': primaryKey } : undefined,
      },
    };
  }
  const fields = Object.keys(item.changes);
  return {
    Update: {
      TableName: item.tableName,
      Key: key(item.key) as Record<string, AttributeValue>,
      UpdateExpression: `SET ${fields.map((field, index) => `#f${index} = :v${index}`).join(', ')}`,
      ConditionExpression: 'attribute_exists(#pk)',
      ExpressionAttributeNames: {
        '#pk': Object.keys(item.key)[0],
        ...Object.fromEntries(fields.map((field, index) => [`#f${index}`, field])),
      },
      ExpressionAttributeValues: Object.fromEntries(fields.map((field, index) => [`:v${index}`, item.changes[field]])) as Record<string, AttributeValue>,
    },
  };
}

/** AWS SDK v3 adapter. It deliberately contains no credentials: Lambda uses its execution role. */
export class AwsDynamoExecutor implements DynamoExecutor {
  private readonly client: DynamoDBClient;
  private readonly document: DynamoDBDocumentClient;

  constructor(region = process.env.AWS_REGION) {
    this.client = new DynamoDBClient(region ? { region } : {});
    this.document = DynamoDBDocumentClient.from(this.client, { marshallOptions: { removeUndefinedValues: true } });
  }

  async execute(operation: DynamoOperation): Promise<DynamoResult> {
    switch (operation.kind) {
      case 'scan': {
        const response = await this.document.send(new ScanCommand({ TableName: operation.tableName, ExclusiveStartKey: operation.exclusiveStartKey }));
        return { items: response.Items as Item[] | undefined, lastEvaluatedKey: response.LastEvaluatedKey as Item | undefined };
      }
      case 'query': {
        const response = await this.document.send(new QueryCommand({
          TableName: operation.tableName,
          IndexName: operation.indexName,
          KeyConditionExpression: '#conditionId = :conditionId',
          ExpressionAttributeNames: { '#conditionId': 'conditionId' },
          ExpressionAttributeValues: { ':conditionId': operation.conditionId },
          ExclusiveStartKey: operation.exclusiveStartKey,
          ScanIndexForward: false,
        }));
        return { items: response.Items as Item[] | undefined, lastEvaluatedKey: response.LastEvaluatedKey as Item | undefined };
      }
      case 'get': {
        const response = await this.document.send(new GetCommand({ TableName: operation.tableName, Key: key(operation.key) }));
        return { item: response.Item as Item | undefined };
      }
      case 'put': {
        const indexed = withIndexKeys(operation.item);
        const primaryKey = primaryKeyFor(indexed);
        await this.document.send(new PutCommand({
          TableName: operation.tableName,
          Item: indexed,
          ConditionExpression: conditionExpression(operation.condition),
          ExpressionAttributeNames: operation.condition ? { '#pk': primaryKey } : undefined,
        }));
        return {};
      }
      case 'update': {
        const fields = Object.keys(operation.changes);
        const response = await this.document.send(new UpdateCommand({
          TableName: operation.tableName,
          Key: key(operation.key),
          UpdateExpression: `SET ${fields.map((field, index) => `#f${index} = :v${index}`).join(', ')}`,
          ConditionExpression: operation.condition === 'exists' ? 'attribute_exists(#pk)' : undefined,
          ExpressionAttributeNames: { '#pk': Object.keys(operation.key)[0], ...Object.fromEntries(fields.map((field, index) => [`#f${index}`, field])) },
          ExpressionAttributeValues: Object.fromEntries(fields.map((field, index) => [`:v${index}`, operation.changes[field]])),
          ReturnValues: 'ALL_NEW',
        }));
        return { attributes: response.Attributes as Item | undefined };
      }
      case 'transact-write':
        await this.client.send(new TransactWriteItemsCommand({ TransactItems: operation.items.map(transactionItem) }));
        return {};
      case 'validate':
        await Promise.all([operation.tables.conditions, operation.tables.evidence, operation.tables.audit].map((TableName) => this.client.send(new DescribeTableCommand({ TableName }))));
        return {};
    }
  }
}
