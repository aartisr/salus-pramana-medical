import { describe, expect, it } from "vitest";
import type { AuditRecord, MedicalCondition, TreatmentEvidence } from "../../src/domain/contracts";
import type { ClinicalRepository } from "../../src/persistence/contracts";
import { DynamoClinicalRepository } from "../../src/persistence/dynamodb";
import { MemoryClinicalRepository } from "../../src/persistence/memory";
import { FakeDynamoExecutor } from "./fake-dynamo";

const condition: MedicalCondition = { conditionId: "cond-1", icd11Code: "5A11", standardName: "Diabetes", futureConditionField: "keep" };
const evidence = (id: string, status?: TreatmentEvidence["publicationStatus"]): TreatmentEvidence => ({ evidenceId: id, conditionId: "cond-1", medicalSystem: "Allopathy", interventionName: `Intervention ${id}`, isPharmacological: true, evidenceGrade: "A", studyMethodology: "Randomized controlled trial", sampleSize: 100, registryIdentifier: `PMID-${id}`, sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/1/", clinicalOutcomeSummary: "A sufficiently detailed outcome summary.", contraindications: [], interactionWarnings: [], publicationStatus: status, lastVerifiedDate: id === "ev-2" ? "2026-02-01" : "2026-01-01", futureEvidenceField: { keep: true } });
const audit = (id: string, action: string): AuditRecord => ({ auditId: id, action, actorEmail: "editor@example.test", targetEvidenceId: "ev-1", timestamp: "2026-01-01T00:00:00.000Z", ttl: 1_775_491_200 });

const factories: Array<[string, () => ClinicalRepository]> = [
  ["memory", () => new MemoryClinicalRepository()],
  ["dynamodb-compatible", () => new DynamoClinicalRepository(new FakeDynamoExecutor(), { conditions: "conditions", evidence: "evidence", audit: "audit", monitoring: "monitoring" })],
];

for (const [name, create] of factories) describe(`${name} repository contract`, () => {
  it("creates conditions and evidence with audit atomically", async () => {
    const repository = create();
    await repository.createConditionWithAudit(condition, audit("audit-condition", "condition.create"));
    const created = await repository.createEvidenceDraftWithAudit(evidence("ev-1", "published"), audit("audit-evidence", "evidence.create"));
    expect(created.publicationStatus).toBe("draft");
    expect((await repository.listAuditRecords()).map((item) => item.action)).toEqual(["condition.create", "evidence.create"]);
  });

  it("applies visibility, search, stable sorting, and offset pagination", async () => {
    const repository = create();
    await repository.createConditionWithAudit(condition, audit("a1", "condition.create"));
    await repository.createEvidenceDraftWithAudit(evidence("ev-1"), audit("a2", "evidence.create"));
    await repository.transitionPublicationWithAudit("ev-1", "published", audit("a3", "evidence.publish"));
    await repository.createEvidenceDraftWithAudit(evidence("ev-2"), audit("a4", "evidence.create"));
    expect((await repository.listEvidence()).items.map((item) => item.evidenceId)).toEqual(["ev-1"]);
    const page = await repository.listEvidence({ includeDrafts: true, q: "intervention", limit: 1, cursor: "0" });
    expect(page.items.map((item) => item.evidenceId)).toEqual(["ev-2"]);
    expect(page.nextCursor).toBe("1");
  });

  it("conditionally creates imported drafts and preserves the first bytes", async () => {
    const repository = create();
    const first = await repository.createImportedDraft(evidence("ev-import", "published"));
    const duplicate = await repository.createImportedDraft({ ...evidence("ev-import"), clinicalOutcomeSummary: "A different and long enough outcome." });
    expect(first.outcome).toBe("created");
    expect(duplicate.outcome).toBe("duplicate");
    expect(duplicate.record.clinicalOutcomeSummary).toBe(first.record.clinicalOutcomeSummary);
    expect(first.record.publicationStatus).toBe("draft");
  });

  it("preserves additive fields through publication transitions", async () => {
    const repository = create();
    await repository.createConditionWithAudit(condition, audit("a1", "condition.create"));
    await repository.createEvidenceDraftWithAudit(evidence("ev-1"), audit("a2", "evidence.create"));
    const updated = await repository.transitionPublicationWithAudit("ev-1", "rejected", audit("a3", "evidence.reject"));
    expect(updated.futureEvidenceField).toEqual({ keep: true });
  });

  it("returns typed not-found outcomes for missing mutation targets", async () => {
    const repository = create();
    await expect(repository.createEvidenceDraftWithAudit(evidence("ev-1"), audit("a1", "evidence.create"))).rejects.toMatchObject({ code: "not-found" });
    await expect(repository.transitionPublicationWithAudit("missing", "published", audit("a2", "evidence.published"))).rejects.toMatchObject({ code: "not-found" });
  });
});