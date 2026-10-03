import { describe, expect, it } from "vitest";
import type { TreatmentEvidence } from "../../src/domain/contracts";
import { DynamoClinicalRepository } from "../../src/persistence/dynamodb";
import { FakeDynamoExecutor } from "./fake-dynamo";

const tables = { conditions: "conditions", evidence: "evidence", audit: "audit", monitoring: "monitoring" };
const evidence = (id: string): TreatmentEvidence => ({ evidenceId: id, conditionId: "cond-1", medicalSystem: "Allopathy", interventionName: `Evidence ${id}`, isPharmacological: true, evidenceGrade: "A", studyMethodology: "Randomized controlled trial", registryIdentifier: `PMID-${id}`, sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/1/", clinicalOutcomeSummary: "A sufficiently detailed outcome summary.", contraindications: [], interactionWarnings: [], legacyPayload: { untouched: true } });

describe("DynamoDB-compatible repository", () => {
  it("exhausts physical pagination and preserves unknown fields", async () => {
    const executor = new FakeDynamoExecutor(1);
    executor.put("evidence", evidence("ev-1"));
    executor.put("evidence", evidence("ev-2"));
    const repository = new DynamoClinicalRepository(executor, tables);
    const page = await repository.listEvidence({ limit: 100 });
    expect(page.items).toHaveLength(2);
    expect(page.items[0].legacyPayload).toEqual({ untouched: true });
    expect(executor.operations.filter((operation) => operation.kind === "scan")).toHaveLength(2);
  });

  it("does not convert transport errors into memory writes", async () => {
    const executor = new FakeDynamoExecutor();
    const repository = new DynamoClinicalRepository({ execute: async () => { throw new Error("network down"); } }, tables);
    await expect(repository.listEvidence()).rejects.toThrow("network down");
    expect(executor.tables.size).toBe(0);
  });
});