import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { computeConditionIntelligence } from "./intelligence";
import { computeConditionValidationGates } from "./validation-gates";
import { listConditions, listEvidenceByCondition } from "./repository";

type ConditionCalibrationSummary = {
  conditionId: string;
  conditionName: string;
  evidenceCount: number;
  decision: string;
  pramanaScore: number;
  confidenceScore: number;
  bayesianProbability: number;
  goNoGo: boolean;
  gateStatuses: Record<string, string>;
};

type CalibrationReport = {
  reportVersion: string;
  generatedAt: string;
  mode: "public" | "clinician";
  totals: {
    conditions: number;
    withEvidence: number;
    goCount: number;
    noGoCount: number;
  };
  summaries: ConditionCalibrationSummary[];
  notes: string[];
};

function toRootPath(...parts: string[]) {
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, "..", "..", "..", ...parts);
}

function markdownForReport(report: CalibrationReport) {
  const lines: string[] = [];
  lines.push("# SALUS Synthetic Calibration Report");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Mode: ${report.mode}`);
  lines.push("");
  lines.push("## Totals");
  lines.push("");
  lines.push(`- Conditions: ${report.totals.conditions}`);
  lines.push(`- Conditions with evidence: ${report.totals.withEvidence}`);
  lines.push(`- GO: ${report.totals.goCount}`);
  lines.push(`- NO-GO: ${report.totals.noGoCount}`);
  lines.push("");
  lines.push("## Condition Summaries");
  lines.push("");
  lines.push("| Condition | Evidence | Decision | Score | Probability | GO/NO-GO |");
  lines.push("|---|---:|---|---:|---:|---|");

  for (const row of report.summaries) {
    lines.push(
      `| ${row.conditionName} (${row.conditionId}) | ${row.evidenceCount} | ${row.decision} | ${row.pramanaScore} | ${Math.round(
        row.bayesianProbability * 100,
      )}% | ${row.goNoGo ? "GO" : "NO-GO"} |`,
    );
  }

  lines.push("");
  lines.push("## Notes");
  lines.push("");
  for (const note of report.notes) {
    lines.push(`- ${note}`);
  }

  lines.push("");
  return `${lines.join("\n")}\n`;
}

export async function generateSyntheticCalibrationReport(mode: "public" | "clinician" = "public") {
  const conditions = await listConditions();
  const summaries: ConditionCalibrationSummary[] = [];

  for (const condition of conditions) {
    const rows = await listEvidenceByCondition(condition.conditionId, false);
    const intelligence = computeConditionIntelligence(condition.conditionId, rows, mode);
    const gates = computeConditionValidationGates(condition.conditionId, rows, intelligence);

    summaries.push({
      conditionId: condition.conditionId,
      conditionName: condition.standardName,
      evidenceCount: intelligence.evidenceCount,
      decision: intelligence.decision,
      pramanaScore: intelligence.conditionPramanaScore,
      confidenceScore: intelligence.confidenceScore,
      bayesianProbability: intelligence.bayesianProbabilityAboveThreshold,
      goNoGo: gates.goNoGo,
      gateStatuses: {
        calibrationSlope: gates.gates.calibrationSlope.status,
        calibrationIntercept: gates.gates.calibrationIntercept.status,
        intervalReliability95: gates.gates.intervalReliability95.status,
        citationCoverage: gates.gates.citationCoverage.status,
        recencyCoverage: gates.gates.recencyCoverage.status,
      },
    });
  }

  const withEvidence = summaries.filter((row) => row.evidenceCount > 0).length;
  const goCount = summaries.filter((row) => row.goNoGo).length;

  const report: CalibrationReport = {
    reportVersion: "synthetic-calibration-v1",
    generatedAt: new Date().toISOString(),
    mode,
    totals: {
      conditions: summaries.length,
      withEvidence,
      goCount,
      noGoCount: summaries.length - goCount,
    },
    summaries,
    notes: [
      "This is a synthetic/offline harness for calibration governance in environments without labeled longitudinal outcomes.",
      "Production efficacy claims still require real outcome labels and full Section 8 validation metrics (AUROC, Brier, DCA).",
    ],
  };

  const outDir = toRootPath("docs", "reports");
  await mkdir(outDir, { recursive: true });

  const jsonPath = resolve(outDir, "synthetic-calibration-report.json");
  const mdPath = resolve(outDir, "synthetic-calibration-report.md");

  await writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf-8");
  await writeFile(mdPath, markdownForReport(report), "utf-8");

  return { report, jsonPath, mdPath };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv.includes("--clinician") ? "clinician" : "public";
  generateSyntheticCalibrationReport(mode)
    .then(({ jsonPath, mdPath, report }) => {
      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify(
          {
            message: "Synthetic calibration report generated",
            mode,
            conditions: report.totals.conditions,
            withEvidence: report.totals.withEvidence,
            jsonPath,
            mdPath,
          },
          null,
          2,
        ),
      );
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Failed to generate synthetic calibration report", error);
      process.exitCode = 1;
    });
}
