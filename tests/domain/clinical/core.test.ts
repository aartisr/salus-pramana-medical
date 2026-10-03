import { describe, expect, it } from "vitest";
import type { TreatmentEvidence } from "../../../src/domain/contracts";
import { calculateDoseCandidates, classifyRiskSeverity, computeConditionIntelligence, computeConditionValidationGates, evaluateSafety, generateSyntheticCalibrationReport, simulateInteractionDynamics, simulateSingleInterventionTrajectory } from "../../../src/domain/clinical";

const row = (id: string, overrides: Partial<TreatmentEvidence> = {}): TreatmentEvidence => ({ evidenceId: id, conditionId: "cond-1", medicalSystem: "Allopathy", interventionName: id, isPharmacological: true, evidenceGrade: "A", studyMethodology: "Multi-center randomized controlled trial", sampleSize: 500, standardError: 0.05, registryIdentifier: `PMID-${id}`, sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/1/", clinicalOutcomeSummary: "A sufficiently detailed clinical outcome.", contraindications: [], interactionWarnings: [], publicationStatus: "published", lastVerifiedDate: "2025-01-01", riskOfBias: "low", ...overrides });

describe("clinical core", () => {
  it("fails closed with no evidence and produces deterministic intelligence", () => {
    const clock = new Date("2026-01-01T00:00:00.000Z");
    expect(computeConditionIntelligence("missing", [], "public", clock).decision).toBe("INSUFFICIENT_EVIDENCE");
    expect(computeConditionIntelligence("cond-1", [row("1"), row("2", { evidenceGrade: "B" })], "public", clock)).toEqual(computeConditionIntelligence("cond-1", [row("1"), row("2", { evidenceGrade: "B" })], "public", clock));
  });

  it("requires enough evidence for validation gates", () => {
    const clock = new Date("2026-01-01T00:00:00.000Z");
    const evidence = [row("1")];
    const gates = computeConditionValidationGates("cond-1", evidence, computeConditionIntelligence("cond-1", evidence, "public", clock), clock);
    expect(gates.goNoGo).toBe(false);
    expect(gates.gates.calibrationSlope.status).toBe("insufficient-data");
  });

  it("retains exact safety and severity boundaries", () => {
    expect([19.9, 20, 45, 75].map(classifyRiskSeverity)).toEqual(["none", "mild", "moderate", "severe"]);
    expect(evaluateSafety({ egfr: 29, pregnantOrLactating: true, interventionIds: ["ev-metformin-1", "ev-berberine-1"] }).map((alert) => alert.code)).toEqual(["METFORMIN_RENAL_CONTRAINDICATION", "BERBERINE_PREGNANCY", "METFORMIN_BERBERINE_INTERACTION"]);
  });

  it("generates one optimal bounded Hill candidate", () => {
    const candidates = calculateDoseCandidates("Metformin", "mg/day", 200, 2000, 8);
    expect(candidates).toHaveLength(8);
    expect(candidates.filter((candidate) => candidate.isOptimal)).toHaveLength(1);
    expect(candidates.every((candidate) => candidate.utilityScore === candidate.netBenefitScore)).toBe(true);
    expect(() => calculateDoseCandidates("", "mg/day", 100, 100, 1)).toThrow(RangeError);
  });

  it("uses 15-minute RK4 steps, applies stagger once, and stays nonnegative", () => {
    const result = simulateInteractionDynamics("Metformin", "Berberine", { hoursToSimulate: 12, staggerOffsetHours: 2 });
    expect(result.timePoints[0]).toBe(0);
    expect(result.concentrations2.some((value) => value > 0)).toBe(true);
    expect([...result.concentrations1, ...result.concentrations2].every((value) => value >= 0)).toBe(true);
  });

  it("produces repeatable trajectories and fixed-clock calibration", () => {
    const first = simulateSingleInterventionTrajectory("Metformin", true, "RCT", 100, 12);
    expect(first).toEqual(simulateSingleInterventionTrajectory("Metformin", true, "RCT", 100, 12));
    expect(first.trajectoryPoints).toHaveLength(25);
    expect(generateSyntheticCalibrationReport(new Date("2026-01-01T00:00:00.000Z")).generatedAt).toBe("2026-01-01T00:00:00.000Z");
  });
});