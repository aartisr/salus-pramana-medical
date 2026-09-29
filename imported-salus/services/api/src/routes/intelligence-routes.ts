import type { Context, Hono } from "hono";
import { computeConditionIntelligence, computeEvidenceIntelligence } from "../intelligence";
import { simulateInteractionTimeline } from "../ode-solver";
import { simulateSingleInterventionTrajectory } from "../trajectory-simulator";
import { computeDoseResponseOptimizerSuggestions } from "../dose-optimizer";
import { computeConditionValidationGates } from "../validation-gates";
import { listEvidenceByCondition } from "../repository";
import { isStrictGovernanceEnabled } from "../config";
import { requireEditorAccess } from "../auth";

function hasBlockingGovernanceGate(report: ReturnType<typeof computeConditionValidationGates>) {
  return Object.values(report.gates).some((gate) => gate.status === "fail" || gate.status === "insufficient-data");
}

async function authorizeDraftAccess(c: Context) {
  if (c.req.query("includeDrafts") !== "true") {
    return { includeDrafts: false } as const;
  }

  const failure = await requireEditorAccess(c);
  if (failure) return { failure } as const;
  return { includeDrafts: true } as const;
}

export function registerIntelligenceRoutes(app: Hono) {
  app.get("/intelligence/condition/:conditionId", async (c) => {
    try {
      const conditionId = c.req.param("conditionId");
      if (!conditionId) {
        console.warn("[Intelligence] Missing conditionId parameter");
        return c.json({ error: "conditionId is required" }, 400);
      }

      const modeQuery = c.req.query("mode");
      const mode = modeQuery === "clinician" ? "clinician" : "public";
      const strictGates = isStrictGovernanceEnabled(c.req.query("strictGates"));
      const draftAccess = await authorizeDraftAccess(c);
      if ("failure" in draftAccess) return draftAccess.failure;
      const { includeDrafts } = draftAccess;

      console.log(`[Intelligence] Computing for condition: ${conditionId}, mode: ${mode}, includeDrafts: ${includeDrafts}`);

      const rows = await listEvidenceByCondition(conditionId, includeDrafts);
      console.log(`[Intelligence] Found ${rows.length} evidence records for ${conditionId}`);

      const normalizedRows = rows.map((row) => ({
        ...row,
        sampleSize: row.sampleSize ?? 100,
      }));
      const result = computeConditionIntelligence(conditionId, normalizedRows, mode);
      const gates = computeConditionValidationGates(conditionId, normalizedRows, result);

      if (strictGates && hasBlockingGovernanceGate(gates) && result.decision === "RECOMMEND") {
        return c.json({
          ...result,
          decision: "INSUFFICIENT_EVIDENCE",
          uncertainty: {
            ...result.uncertainty,
            explanation: `${result.uncertainty.explanation} Governance strict-mode applied: recommendation downgraded due to failed/insufficient gates.`,
          },
          governance: {
            strictModeApplied: true,
            goNoGo: gates.goNoGo,
            gates: gates.gates,
          },
        });
      }

      return c.json({
        ...result,
        governance: {
          strictModeApplied: strictGates,
          goNoGo: gates.goNoGo,
        },
      });
    } catch (error) {
      console.error("[Intelligence] Error computing condition intelligence:", error instanceof Error ? error.message : String(error));
      console.error("[Intelligence] Full error:", error);
      return c.json({
        modelVersion: "pramana-v1.0.0",
        generatedAt: new Date().toISOString(),
        conditionId: c.req.param("conditionId") || "unknown",
        mode: "public",
        evidenceCount: 0,
        conditionPramanaScore: 0,
        confidenceScore: 0,
        confidenceInterval95: { lower: 0, upper: 18 },
        bayesianProbabilityAboveThreshold: 0,
        decision: "INSUFFICIENT_EVIDENCE",
        uncertainty: {
          coefficientOfVariation: 1,
          dataCoverage: "low",
          explanation: "Unable to compute intelligence due to processing error. Please try again.",
        },
        contributions: [],
      });
    }
  });

  app.get("/intelligence/evidence/:evidenceId", async (c) => {
    const evidenceId = c.req.param("evidenceId");
    if (!evidenceId) {
      return c.json({ error: "evidenceId is required" }, 400);
    }

    const modeQuery = c.req.query("mode");
    const mode = modeQuery === "clinician" ? "clinician" : "public";
    const strictGates = isStrictGovernanceEnabled(c.req.query("strictGates"));
    const draftAccess = await authorizeDraftAccess(c);
    if ("failure" in draftAccess) return draftAccess.failure;
    const { includeDrafts } = draftAccess;
    const rows = await listEvidenceByCondition(undefined, includeDrafts);
    const detail = computeEvidenceIntelligence(evidenceId, rows, mode);

    if (!detail) {
      return c.json({ error: "Evidence not found" }, 404);
    }

    if (strictGates) {
      const conditionRows = rows.filter((row) => row.conditionId === detail.conditionId);
      const conditionIntelligence = computeConditionIntelligence(detail.conditionId, conditionRows, mode);
      const gates = computeConditionValidationGates(detail.conditionId, conditionRows, conditionIntelligence);
      if (hasBlockingGovernanceGate(gates) && detail.conditionDecision === "RECOMMEND") {
        return c.json({
          ...detail,
          conditionDecision: "INSUFFICIENT_EVIDENCE",
          governance: {
            strictModeApplied: true,
            goNoGo: gates.goNoGo,
          },
        });
      }
    }

    return c.json(detail);
  });

  app.get("/intelligence/gates/:conditionId", async (c) => {
    const conditionId = c.req.param("conditionId");
    if (!conditionId) {
      return c.json({ error: "conditionId is required" }, 400);
    }

    const modeQuery = c.req.query("mode");
    const mode = modeQuery === "clinician" ? "clinician" : "public";
    const draftAccess = await authorizeDraftAccess(c);
    if ("failure" in draftAccess) return draftAccess.failure;
    const { includeDrafts } = draftAccess;

    const rows = await listEvidenceByCondition(conditionId, includeDrafts);
    const intelligence = computeConditionIntelligence(conditionId, rows, mode);
    const report = computeConditionValidationGates(conditionId, rows, intelligence);

    return c.json(report);
  });

  app.get("/intelligence/interaction/:conditionId", async (c) => {
    const conditionId = c.req.param("conditionId");
    if (!conditionId) {
      return c.json({ error: "conditionId is required" }, 400);
    }

    const interventionA = c.req.query("interventionA");
    const interventionB = c.req.query("interventionB");
    const hoursQuery = c.req.query("hours");

    if (!interventionA || !interventionB) {
      return c.json({ error: "interventionA and interventionB are required" }, 400);
    }

    const draftAccess = await authorizeDraftAccess(c);
    if ("failure" in draftAccess) return draftAccess.failure;
    const { includeDrafts } = draftAccess;
    const rows = await listEvidenceByCondition(conditionId, includeDrafts);

    const rowA = rows.find((row) => row.interventionName === interventionA);
    const rowB = rows.find((row) => row.interventionName === interventionB);

    const hasInteractionWarning = rowA?.interactionWarnings?.length! > 0 || rowB?.interactionWarnings?.length! > 0;
    const sampleSizeA = rowA?.sampleSize ?? 100;
    const sampleSizeB = rowB?.sampleSize ?? 100;
    const hours = hoursQuery ? Math.max(6, Math.min(168, Number.parseInt(hoursQuery, 10))) : 48;

    const timeline = simulateInteractionTimeline(
      interventionA,
      interventionB,
      hasInteractionWarning,
      sampleSizeA,
      sampleSizeB,
      hours,
      0.35,
    );

    return c.json({
      conditionId,
      interventionA,
      interventionB,
      timeline,
      generatedAt: new Date().toISOString(),
    });
  });

  app.get("/intelligence/trajectory/:evidenceId", async (c) => {
    try {
      const evidenceId = c.req.param("evidenceId");
      if (!evidenceId) {
        return c.json({ error: "evidenceId is required" }, 400);
      }

      const hoursQuery = c.req.query("hours");
      const hours = hoursQuery ? Math.max(6, Math.min(168, Number.parseInt(hoursQuery, 10))) : 72;

      const draftAccess = await authorizeDraftAccess(c);
      if ("failure" in draftAccess) return draftAccess.failure;
      const { includeDrafts } = draftAccess;
      const rows = await listEvidenceByCondition(undefined, includeDrafts);
      const evidence = rows.find((row) => row.evidenceId === evidenceId);

      if (!evidence) {
        return c.json({ error: "Evidence not found" }, 404);
      }

      const trajectory = simulateSingleInterventionTrajectory(
        evidence.interventionName,
        evidence.isPharmacological,
        evidence.studyMethodology,
        evidence.sampleSize ?? 100,
        hours,
      );

      return c.json({
        evidenceId,
        trajectory,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error computing trajectory:", error);
      return c.json({ error: "Failed to compute trajectory" }, 500);
    }
  });

  app.get("/intelligence/dose-optimizer/:evidenceId", async (c) => {
    try {
      const evidenceId = c.req.param("evidenceId");
      if (!evidenceId) {
        return c.json({ error: "evidenceId is required" }, 400);
      }

      const draftAccess = await authorizeDraftAccess(c);
      if ("failure" in draftAccess) return draftAccess.failure;
      const { includeDrafts } = draftAccess;
      const rows = await listEvidenceByCondition(undefined, includeDrafts);
      const evidence = rows.find((row) => row.evidenceId === evidenceId);

      if (!evidence) {
        return c.json({ error: "Evidence not found" }, 404);
      }

      const doseOptimization = computeDoseResponseOptimizerSuggestions(
        evidence.conditionId,
        evidence.interventionName,
        evidence.isPharmacological,
        evidence.sampleSize ?? 100,
        70,
      );

      return c.json(doseOptimization);
    } catch (error) {
      console.error("Error computing dose optimization:", error);
      return c.json({ error: "Failed to compute dose optimization" }, 500);
    }
  });
}
