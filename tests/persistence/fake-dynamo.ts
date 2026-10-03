import type { DynamoExecutor, DynamoOperation, DynamoResult, DynamoTransactionItem } from "../../src/persistence/dynamodb";

const copy = <T>(value: T): T => structuredClone(value);

export class FakeDynamoExecutor implements DynamoExecutor {
  readonly tables = new Map<string, Map<string, Record<string, unknown>>>();
  readonly operations: DynamoOperation[] = [];
  failValidation = false;

  constructor(private readonly pageSize = 2) {}

  async execute(operation: DynamoOperation): Promise<DynamoResult> {
    this.operations.push(copy(operation));
    if (operation.kind === "validate") {
      if (this.failValidation) throw new Error("incompatible table");
      return {};
    }
    if (operation.kind === "get") return { item: copy(this.table(operation.tableName).get(this.keyValue(operation.key))) };
    if (operation.kind === "scan" || operation.kind === "query") {
      const rows = [...this.table(operation.tableName).values()].filter((item) => operation.kind === "scan" || item.conditionId === operation.conditionId);
      const offset = Number(operation.exclusiveStartKey?.offset ?? 0);
      return { items: copy(rows.slice(offset, offset + this.pageSize)), lastEvaluatedKey: offset + this.pageSize < rows.length ? { offset: offset + this.pageSize } : undefined };
    }
    if (operation.kind === "put") { this.applyPut(operation.tableName, operation.item, operation.condition); return {}; }
    if (operation.kind === "update") return { attributes: this.applyUpdate(operation.tableName, operation.key, operation.changes, operation.condition) };
    if (operation.kind === "transact-write") {
      const snapshot = copy([...this.tables.entries()].map(([name, table]) => [name, [...table.entries()]] as const));
      try { for (const item of operation.items) this.applyTransactionItem(item); }
      catch (error) { this.tables.clear(); for (const [name, entries] of snapshot) this.tables.set(name, new Map(entries)); throw error; }
      return {};
    }
    return {};
  }

  put(tableName: string, item: Record<string, unknown>) { this.table(tableName).set(this.itemKey(item), copy(item)); }
  read(tableName: string, key: string) { return copy(this.table(tableName).get(key)); }

  private applyTransactionItem(item: DynamoTransactionItem) {
    if (item.type === "condition-check") {
      const exists = this.table(item.tableName).has(this.keyValue(item.key));
      if (exists !== item.exists) throw Object.assign(new Error("condition failed"), { name: "TransactionCanceledException" });
    } else if (item.type === "put") this.applyPut(item.tableName, item.item, item.condition);
    else this.applyUpdate(item.tableName, item.key, item.changes, item.condition);
  }

  private applyPut(tableName: string, item: Record<string, unknown>, condition?: "not-exists") {
    const table = this.table(tableName);
    const key = this.itemKey(item);
    if (condition === "not-exists" && table.has(key)) throw Object.assign(new Error("duplicate"), { name: "ConditionalCheckFailedException" });
    table.set(key, copy(item));
  }

  private applyUpdate(tableName: string, key: Record<string, string>, changes: Record<string, unknown>, condition: "exists") {
    const table = this.table(tableName);
    const id = this.keyValue(key);
    const existing = table.get(id);
    if (condition === "exists" && !existing) throw Object.assign(new Error("missing"), { name: "TransactionCanceledException" });
    const updated = { ...existing, ...copy(changes) };
    table.set(id, updated);
    return copy(updated);
  }

  private table(name: string) { let table = this.tables.get(name); if (!table) { table = new Map(); this.tables.set(name, table); } return table; }
  private keyValue(key: Record<string, string>) { return Object.values(key)[0]; }
  private itemKey(item: Record<string, unknown>) {
    const value = item.evidenceId ?? item.auditId ?? item.snapshotId ?? item.conditionId;
    if (typeof value !== "string") throw new Error("Missing key");
    return value;
  }
}