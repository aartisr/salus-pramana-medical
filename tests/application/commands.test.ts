import { describe, expect, it, vi } from "vitest";
import { ClinicalCommands } from "../../src/application";
import { MemoryClinicalRepository } from "../../src/persistence/memory";

const editor = { authenticated: true, isEditor: true, actorEmail: "editor@example.test", ipAddress: "127.0.0.1" };
const contributor = { ...editor, isEditor: false };
const auditDependencies = { now: () => new Date("2026-01-01T00:00:00.000Z"), createId: vi.fn().mockReturnValueOnce("audit-1").mockReturnValueOnce("audit-2").mockReturnValueOnce("audit-3") };
const condition = { conditionId: "cond-1", icd11Code: "5A11", standardName: "Diabetes" };
const evidence = { evidenceId: "ev-1", conditionId: "cond-1", medicalSystem: "Allopathy", interventionName: "Metformin", isPharmacological: true, evidenceGrade: "A", studyMethodology: "Randomized controlled trial", registryIdentifier: "PMID-1", sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/1/", clinicalOutcomeSummary: "A sufficiently detailed clinical outcome." };

describe("clinical commands", () => {
  it("uses atomic repository operations and creates 90-day audits", async () => {
    const repository = new MemoryClinicalRepository();
    const commands = new ClinicalCommands(repository, auditDependencies);
    await commands.createCondition(condition, editor);
    await commands.submitEvidence({ ...evidence, publicationStatus: "draft" }, contributor);
    await commands.transitionPublication("ev-1", { publicationStatus: "published" }, editor);
    const audits = await repository.listAuditRecords();
    expect(audits.map((item) => item.action)).toEqual(["condition.create", "evidence.create", "evidence.published"]);
    expect(audits[0].ttl - Date.parse(audits[0].timestamp) / 1000).toBe(90 * 24 * 60 * 60);
  });

  it("rejects unauthorized writes and status upgrades outside the editor contract", async () => {
    const commands = new ClinicalCommands(new MemoryClinicalRepository(), { now: () => new Date(0), createId: () => "audit" });
    await expect(commands.createCondition(condition, contributor)).rejects.toMatchObject({ code: "forbidden" });
    await expect(commands.submitEvidence({ ...evidence, publicationStatus: "published" }, contributor)).rejects.toMatchObject({ code: "validation" });
    await expect(commands.transitionPublication("ev-1", { publicationStatus: "under_review" }, editor)).rejects.toMatchObject({ code: "validation" });
  });
});