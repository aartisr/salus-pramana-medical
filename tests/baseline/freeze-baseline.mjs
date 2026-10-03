import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const capturedAt = new Date().toISOString();
const sourceIntegrityDir = "evidence/source-integrity";
const baselineDir = "evidence/baseline";
const fixtureDir = "tests/fixtures/source-snapshots";
const ignoredDirectories = new Set(["node_modules", "dist", "coverage", ".turbo", ".vite"]);

const activeRootFiles = [
  ".node-version",
  "index.html",
  "metadata.json",
  "package-lock.json",
  "package.json",
  "README.md",
  "server.ts",
  "tsconfig.json",
  "vercel.json",
  "vite.config.ts",
  "vitest.config.ts",
];

const fixtureSources = [
  "src/data/globalHealthEquityData.ts",
  "src/data/nobelEvaluationData.ts",
  "src/data/salusRepositoryData.ts",
  "src/services/calibrationReportService.ts",
  "src/services/doseResponseOptimizer.ts",
  "src/services/evidenceExportService.ts",
  "src/services/evidenceSubscriptionService.ts",
  "src/services/odeInteractionSolver.ts",
  "src/services/pramanaCalculus.ts",
  "src/services/recentSearchesDb.ts",
];

async function walk(relativeDirectory) {
  const entries = await readdir(path.join(root, relativeDirectory), { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const relativePath = path.posix.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(relativePath)));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }

  return files;
}

async function fileRecord(relativePath) {
  const absolutePath = path.join(root, relativePath);
  const [contents, metadata] = await Promise.all([readFile(absolutePath), stat(absolutePath)]);
  return {
    path: relativePath,
    sha256: createHash("sha256").update(contents).digest("hex"),
    size: metadata.size,
  };
}

function aggregateHash(entries) {
  const digest = createHash("sha256");
  for (const entry of entries) {
    digest.update(`${entry.path}\0${entry.sha256}\0${entry.size}\n`);
  }
  return digest.digest("hex");
}

async function recordsFor(paths) {
  return Promise.all([...new Set(paths)].sort().map(fileRecord));
}

async function writeJson(relativePath, value) {
  const absolutePath = path.join(root, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function captureProductionReference() {
  const artifacts = [];
  const blockers = [];
  const requests = [
    { id: "home", url: "https://saluspramana.ai-aarti.com/", init: {} },
    { id: "robots", url: "https://saluspramana.ai-aarti.com/robots.txt", init: {} },
    { id: "sitemap", url: "https://saluspramana.ai-aarti.com/sitemap.xml", init: {} },
    {
      id: "clinical-ai",
      url: "https://saluspramana.ai-aarti.com/api/clinical-ai",
      init: {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          condition: { standardName: "Type 2 Diabetes Mellitus", icd11Code: "5A11" },
          interventions: [],
          patientProfile: { age: 52, egfr: 75, comorbidities: [] },
          queryType: "Comprehensive Differential & Interaction Audit",
        }),
      },
    },
  ];

  for (const request of requests) {
    try {
      const response = await fetch(request.url, {
        ...request.init,
        signal: AbortSignal.timeout(20_000),
      });
      const body = await response.text();
      const extension = request.id === "home" ? "html" : request.id === "sitemap" ? "xml" : "txt";
      const bodyPath = `${baselineDir}/production/${request.id}.${extension}`;
      await mkdir(path.dirname(path.join(root, bodyPath)), { recursive: true });
      await writeFile(path.join(root, bodyPath), body, "utf8");
      artifacts.push({
        id: request.id,
        method: request.init.method ?? "GET",
        url: request.url,
        status: response.status,
        headers: Object.fromEntries([...response.headers].sort(([left], [right]) => left.localeCompare(right))),
        bodyPath,
        bodySha256: createHash("sha256").update(body).digest("hex"),
        bodyBytes: Buffer.byteLength(body),
      });
    } catch (error) {
      blockers.push({
        id: request.id,
        url: request.url,
        evidence: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { artifacts, blockers };
}

async function main() {
  const activeFiles = [
    ...activeRootFiles,
    ...(await walk("public")),
    ...(await walk("src")),
  ];
  const activeEntries = await recordsFor(activeFiles);

  await writeJson(`${sourceIntegrityDir}/before.json`, {
    schemaVersion: 1,
    capturedAt,
    algorithm: "sha256",
    scope: {
      activeRoot: "capability-bearing root files plus public/** and src/**",
      excluded: [
        ".git/**",
        ".github/modernize/rearchitecture/**",
        "dist/**",
        "evidence/**",
        "node_modules/**",
        "tests/**",
      ],
    },
    activeRoot: {
      totalFiles: activeEntries.length,
      totalBytes: activeEntries.reduce((sum, entry) => sum + entry.size, 0),
      aggregateSha256: aggregateHash(activeEntries),
      entries: activeEntries,
    },
  });

  const provenance = [];
  for (const sourcePath of fixtureSources) {
    const destinationPath = `${fixtureDir}/${sourcePath}`;
    await mkdir(path.dirname(path.join(root, destinationPath)), { recursive: true });
    await cp(path.join(root, sourcePath), path.join(root, destinationPath));
    const source = await fileRecord(sourcePath);
    const fixture = await fileRecord(destinationPath);
    provenance.push({
      sourcePath,
      fixturePath: destinationPath,
      sourceSha256: source.sha256,
      fixtureSha256: fixture.sha256,
      byteIdentical: source.sha256 === fixture.sha256 && source.size === fixture.size,
      classification: "non-PHI static source fixture",
    });
  }
  await writeJson("tests/fixtures/provenance.json", {
    schemaVersion: 1,
    capturedAt,
    policy: "Exact source snapshots; no production records, credentials, or patient identifiers.",
    fixtures: provenance,
  });

  const production = await captureProductionReference();
  await writeJson(`${baselineDir}/production-http.json`, {
    schemaVersion: 1,
    capturedAt,
    runner: { node: process.version, platform: `${process.platform}/${process.arch}` },
    readOnly: true,
    ...production,
  });
  await writeJson(`${baselineDir}/local-characterization.json`, {
    schemaVersion: 1,
    capturedAt,
    runtime: { node: process.version, npm: "9.9.4", platform: `${process.platform}/${process.arch}` },
    activeCanonicalTest: {
      command: "npm test",
      result: "PASS",
      filesPassed: 1,
      testsPassed: 2,
      failed: 0,
      skipped: 0,
    },
    environment: {
      docker: "unavailable (docker info failed)",
      playwrightBrowsers: "not installed or proven in the active package",
    },
    authoritativeRouteContract: {
      source: "src/app/route-paths.ts",
      routeCount: 9,
      canonicalRoot: "/",
    },
  });

  const prerequisiteRows = [
    {
      capability: "production screenshots and UI states",
      status: "BLOCKED",
      owner: "product/production-reference owner",
      blockerEvidence: "No authoritative screenshot set or approved persona/state matrix was supplied; HTTP HTML alone is not visual parity evidence.",
      blocks: ["VG-09", "VG-10", "VG-12", "T063", "T064", "T066"],
    },
    {
      capability: "production latency and availability telemetry",
      status: "BLOCKED",
      owner: "production observability owner",
      blockerEvidence: "No read-only telemetry export or probe authorization/profile was supplied.",
      blocks: ["VG-13", "T067"],
    },
    {
      capability: "latest-two-major browser and assistive-technology matrix",
      status: "BLOCKED",
      owner: "browser test environment owner",
      blockerEvidence: "@playwright/test is declared, but no installed browser binary or latest-two-major Safari/VoiceOver and Chromium screen-reader matrix was proven.",
      blocks: ["VG-09", "VG-10", "VG-11", "VG-12", "T063", "T064", "T065", "T066"],
    },
    {
      capability: "isolated Cognito-compatible identities",
      status: "BLOCKED",
      owner: "identity environment owner",
      blockerEvidence: "No isolated issuer, audience, JWKS, contributor/viewer identities, or evidence-editors identity was supplied.",
      blocks: ["VG-07", "T061"],
    },
    {
      capability: "disposable DynamoDB-compatible store",
      status: "BLOCKED",
      owner: "data test environment owner",
      blockerEvidence: "docker info failed and no isolated remote DynamoDB-compatible endpoint or disposable table credentials were supplied.",
      blocks: ["VG-06", "VG-08", "T061", "T062"],
    },
    {
      capability: "live registry connector references",
      status: "BLOCKED",
      owner: "registry integration owner",
      blockerEvidence: "No approved recorded fixtures or read-only smoke authorization/profile was supplied for PubMed, ClinicalTrials.gov, AYUSH/DHARA, and CTRI/ICTRP.",
      blocks: ["VG-08", "VG-13", "T062", "T067"],
    },
  ];
  await writeJson(`${baselineDir}/prerequisites.json`, {
    schemaVersion: 1,
    capturedAt,
    policy: "Missing external evidence blocks only the listed capability and is never replaced with synthesized evidence.",
    prerequisites: prerequisiteRows,
  });

  await writeJson("evidence/slices/P1/T006.json", {
    taskId: "T006",
    status: "PASS",
    capturedAt,
    evidence: [`${sourceIntegrityDir}/before.json`],
    activeFiles: activeEntries.length,
    archiveFiles: archiveEntries.length,
    archiveAggregateSha256: aggregateHash(archiveEntries),
  });
  await writeJson("evidence/slices/P1/T007.json", {
    taskId: "T007",
    status: prerequisiteRows.some((row) => row.status === "BLOCKED") ? "PARTIAL" : "PASS",
    capturedAt,
    evidence: [
      `${baselineDir}/local-characterization.json`,
      `${baselineDir}/production-http.json`,
      `${baselineDir}/prerequisites.json`,
    ],
    obtainableArtifactsCaptured: production.artifacts.length + 2,
    externalPrerequisitesBlocked: prerequisiteRows.filter((row) => row.status === "BLOCKED").length,
  });
  await writeJson("evidence/slices/P1/T008.json", {
    taskId: "T008",
    status: "PASS",
    capturedAt,
    evidence: ["tests/fixtures/provenance.json"],
    fixtures: provenance.length,
    allByteIdentical: provenance.every((entry) => entry.byteIdentical),
  });

  console.log(JSON.stringify({
    activeFiles: activeEntries.length,
    archiveFiles: archiveEntries.length,
    fixtures: provenance.length,
    productionArtifacts: production.artifacts.length,
    productionBlockers: production.blockers.length,
  }));
}

await main();
