import { describe, expect, it } from "vitest";
import { app } from "./app";

describe("api", () => {
  it("health endpoint works", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
  });

  it("returns conditions", async () => {
    const res = await app.request("/conditions");
    expect(res.status).toBe(200);
    const rows = await res.json();
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
  });

  it("creates evidence with valid payload", async () => {
    const payload = {
      evidenceId: "ev-test-api-1",
      conditionId: "cond-type2-diabetes",
      medicalSystem: "Allopathy",
      interventionName: "Test Intervention",
      isPharmacological: true,
      evidenceGrade: "A",
      studyMethodology: "Randomized controlled trial",
      registryIdentifier: "PMID-123456",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/123456/",
      clinicalOutcomeSummary: "Observed measurable improvement in glycemic control in trial participants.",
      contraindications: ["Severe renal disease"],
      interactionWarnings: ["Monitor with insulin"],
    };

    const res = await app.request("/evidence", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "content-type": "application/json" },
    });

    expect(res.status).toBe(201);
  });

  it("rejects evidence with missing registry identifier", async () => {
    const payload = {
      evidenceId: "ev-test-api-2",
      conditionId: "cond-type2-diabetes",
      medicalSystem: "Allopathy",
      interventionName: "Test Intervention",
      isPharmacological: true,
      evidenceGrade: "A",
      studyMethodology: "Randomized controlled trial",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/123456/",
      clinicalOutcomeSummary: "Observed measurable improvement in glycemic control in trial participants.",
      contraindications: ["Severe renal disease"],
      interactionWarnings: ["Monitor with insulin"],
    };

    const res = await app.request("/evidence", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "content-type": "application/json" },
    });

    expect(res.status).toBe(400);
  });

  it("rejects source URL outside allowlist", async () => {
    const payload = {
      evidenceId: "ev-test-api-3",
      conditionId: "cond-type2-diabetes",
      medicalSystem: "Allopathy",
      interventionName: "Test Intervention",
      isPharmacological: true,
      evidenceGrade: "A",
      studyMethodology: "Randomized controlled trial",
      registryIdentifier: "PMID-123456",
      sourceUrl: "https://example.com/not-allowed",
      clinicalOutcomeSummary: "Observed measurable improvement in glycemic control in trial participants.",
      contraindications: ["Severe renal disease"],
      interactionWarnings: ["Monitor with insulin"],
    };

    const res = await app.request("/evidence", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "content-type": "application/json" },
    });

    expect(res.status).toBe(400);
  });

  it("filters evidence by condition", async () => {
    const res = await app.request("/evidence?conditionId=cond-type2-diabetes");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.rows)).toBe(true);
    expect(body.rows.every((item: { conditionId: string }) => item.conditionId === "cond-type2-diabetes")).toBe(true);
  });

  it("supports cursor pagination for evidence", async () => {
    const firstPage = await app.request("/evidence?limit=1");
    expect(firstPage.status).toBe(200);
    const firstBody = await firstPage.json();

    expect(Array.isArray(firstBody.rows)).toBe(true);
    expect(firstBody.rows.length).toBe(1);
    expect(firstBody.metadata.pagination.limit).toBe(1);
    expect(typeof firstBody.metadata.pagination.totalCount).toBe("number");

    if (firstBody.metadata.pagination.nextCursor) {
      const secondPage = await app.request(`/evidence?limit=1&cursor=${firstBody.metadata.pagination.nextCursor}`);
      expect(secondPage.status).toBe(200);
      const secondBody = await secondPage.json();
      expect(Array.isArray(secondBody.rows)).toBe(true);
    }
  });

  it("supports full-text search for evidence", async () => {
    const res = await app.request("/evidence?q=metformin");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body.rows)).toBe(true);
    expect(body.rows.length).toBeGreaterThan(0);
    expect(
      body.rows.every((item: { interventionName: string }) => item.interventionName.toLowerCase().includes("metformin")),
    ).toBe(true);
  });

  it("exports filtered evidence as csv", async () => {
    const res = await app.request("/evidence/export.csv?conditionId=cond-type2-diabetes");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");

    const csv = await res.text();
    expect(csv).toContain("evidenceId,conditionId,medicalSystem");
    expect(csv).toContain("cond-type2-diabetes");
  });

  it("returns condition intelligence for a valid condition", async () => {
    const res = await app.request("/intelligence/condition/cond-hypertension");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.conditionId).toBe("cond-hypertension");
    expect(body.modelVersion).toBe("pramana-v1.0.0");
    expect(typeof body.conditionPramanaScore).toBe("number");
    expect(Array.isArray(body.contributions)).toBe(true);
    expect(body.contributions.length).toBeGreaterThan(0);
    expect(["RECOMMEND", "CONDITIONAL", "INSUFFICIENT_EVIDENCE"]).toContain(body.decision);
  });

  it("returns evidence intelligence details", async () => {
    const res = await app.request("/intelligence/evidence/ev-metformin-1?mode=clinician");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.evidence).not.toBeNull();
    expect(body.evidence.evidenceId).toBe("ev-metformin-1");
    expect(body.mode).toBe("clinician");
    expect(body.modelVersion).toBe("pramana-v1.0.0");
  });

  it("returns validation gates for a condition", async () => {
    const res = await app.request("/intelligence/gates/cond-type2-diabetes");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.conditionId).toBe("cond-type2-diabetes");
    expect(typeof body.goNoGo).toBe("boolean");
    expect(body.gates).toBeTruthy();
    expect(body.gates.calibrationSlope).toBeTruthy();
    expect(body.gates.citationCoverage).toBeTruthy();
  });

  it("enforces strict governance block when recommendation lacks gate support", async () => {
    const conditionRes = await app.request("/conditions", {
      method: "POST",
      body: JSON.stringify({
        conditionId: "cond-strict-governance",
        icd11Code: "5A11",
        standardName: "Strict Governance Test Condition",
      }),
      headers: { "content-type": "application/json" },
    });
    expect(conditionRes.status).toBe(201);

    const payload = {
      evidenceId: "ev-strict-governance-1",
      conditionId: "cond-strict-governance",
      medicalSystem: "Allopathy",
      interventionName: "High Signal Intervention",
      isPharmacological: true,
      evidenceGrade: "A",
      studyMethodology: "Systematic review/meta-analysis of RCTs",
      sampleSize: 1000000,
      registryIdentifier: "PMID-300001",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/300001/",
      clinicalOutcomeSummary: "Very strong and consistent effect estimate with large sample size.",
      contraindications: [],
      interactionWarnings: [],
    };

    const saveRes = await app.request("/evidence", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "content-type": "application/json" },
    });
    expect(saveRes.status).toBe(201);

    const baselineRes = await app.request("/intelligence/condition/cond-strict-governance?mode=clinician&includeDrafts=true");
    expect(baselineRes.status).toBe(200);
    const baseline = await baselineRes.json();
    expect(baseline.decision).toBe("RECOMMEND");

    const strictRes = await app.request("/intelligence/condition/cond-strict-governance?mode=clinician&strictGates=true&includeDrafts=true");
    expect(strictRes.status).toBe(200);
    const strict = await strictRes.json();
    expect(strict.decision).toBe("INSUFFICIENT_EVIDENCE");
    expect(strict.governance.strictModeApplied).toBe(true);
  });

  it("returns 404 for unknown evidence intelligence request", async () => {
    const res = await app.request("/intelligence/evidence/ev-does-not-exist");
    expect(res.status).toBe(404);
  });

  it("prevents duplicate evidence IDs and returns baseline security headers", async () => {
    const payload = {
      evidenceId: "ev-duplicate-guard",
      conditionId: "cond-type2-diabetes",
      medicalSystem: "Allopathy",
      interventionName: "Duplicate Guard Intervention",
      isPharmacological: true,
      evidenceGrade: "B",
      studyMethodology: "Controlled clinical trial",
      registryIdentifier: "PMID-123457",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/123457/",
      clinicalOutcomeSummary: "A valid test record used to verify immutable submission identifiers.",
      contraindications: [],
      interactionWarnings: [],
    };
    const first = await app.request("/evidence", { method: "POST", body: JSON.stringify(payload), headers: { "content-type": "application/json" } });
    const second = await app.request("/evidence", { method: "POST", body: JSON.stringify(payload), headers: { "content-type": "application/json" } });

    expect(first.status).toBe(201);
    expect(second.status).toBe(409);
    expect(first.headers.get("x-content-type-options")).toBe("nosniff");
    expect(first.headers.get("x-frame-options")).toBe("DENY");
  });

  it("computes interaction timeline for two interventions", async () => {
    const res = await app.request(
      "/intelligence/interaction/cond-hypertension?interventionA=Potassium%20Supplementation&interventionB=DASH%20Diet&hours=48",
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.conditionId).toBe("cond-hypertension");
    expect(body.timeline.peakRiskScore).toBeGreaterThanOrEqual(0);
    expect(body.timeline.timePoints.length).toBeGreaterThan(0);
    expect(["none", "mild", "moderate", "severe"]).toContain(body.timeline.severityClass);
  });

  it("computes single-intervention trajectory for evidence", async () => {
    const res = await app.request("/intelligence/trajectory/ev-metformin-1?hours=72");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.trajectory.peakConcentration).toBeGreaterThan(0);
    expect(body.trajectory.halfLife).toBeGreaterThan(0);
    expect(body.trajectory.trajectoryPoints.length).toBeGreaterThan(0);
    expect(body.trajectory.timeAboveThreshold).toBeGreaterThanOrEqual(0);
  });

  it("returns 404 for unknown trajectory evidence", async () => {
    const res = await app.request("/intelligence/trajectory/ev-unknown");
    expect(res.status).toBe(404);
  });

  it("suggests dose-response optimizations for evidence", async () => {
    const res = await app.request("/intelligence/dose-optimizer/ev-metformin-1");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.recommendations.length).toBeGreaterThan(0);
    expect(body.optimizedDoseIndex).toBeGreaterThanOrEqual(0);
    expect(body.optimizedDoseIndex).toBeLessThan(body.recommendations.length);

    const rec = body.recommendations[body.optimizedDoseIndex];
    expect(rec.estimatedEfficacy).toBeGreaterThan(0);
    expect(rec.estimatedAdverseEventRisk).toBeGreaterThanOrEqual(0);
    expect(["wide", "moderate", "narrow", "critical"]).toContain(rec.safetyMargin);
  });
});
