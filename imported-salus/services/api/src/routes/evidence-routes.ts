import type { Hono } from "hono";
import { medicalConditionSchema, treatmentEvidenceSchema } from "@evidence-platform/domain";
import { getActorEmail, getAuthGroups, hasEditorRole, requireAuthenticatedMutation, requireEditorAccess, requireEditorRole } from "../auth";
import {
  listConditions,
  listEvidenceByCondition,
  createEvidence,
  getCondition,
  saveAuditLog,
  saveCondition,
  updateEvidencePublicationStatus,
} from "../repository";

function normalizeLimit(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "25", 10);
  if (Number.isNaN(parsed)) {
    return 25;
  }
  return Math.max(1, Math.min(100, parsed));
}

function normalizeCursor(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "0", 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

function filterEvidenceSearch(rows: Awaited<ReturnType<typeof listEvidenceByCondition>>, query: string | undefined) {
  const term = query?.trim().toLowerCase();
  if (!term) {
    return rows;
  }

  return rows.filter((row) => {
    const corpus = [
      row.evidenceId,
      row.conditionId,
      row.medicalSystem,
      row.interventionName,
      row.evidenceGrade,
      row.studyMethodology,
      row.registryIdentifier,
      row.clinicalOutcomeSummary,
      ...row.contraindications,
      ...row.interactionWarnings,
    ]
      .join(" ")
      .toLowerCase();

    return corpus.includes(term);
  });
}

function sortEvidenceRows(rows: Awaited<ReturnType<typeof listEvidenceByCondition>>) {
  return [...rows].sort((a, b) => {
    const dateA = a.lastVerifiedDate ?? "0000-00-00";
    const dateB = b.lastVerifiedDate ?? "0000-00-00";
    if (dateA !== dateB) {
      return dateB.localeCompare(dateA);
    }
    return a.evidenceId.localeCompare(b.evidenceId);
  });
}

function toCsvCell(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }
  const text = String(value);
  if (!/[",\n]/.test(text)) {
    return text;
  }
  return `"${text.replaceAll('"', '""')}"`;
}

function buildEvidenceCsv(rows: Awaited<ReturnType<typeof listEvidenceByCondition>>) {
  const headers = [
    "evidenceId",
    "conditionId",
    "medicalSystem",
    "interventionName",
    "isPharmacological",
    "evidenceGrade",
    "studyMethodology",
    "sampleSize",
    "registryIdentifier",
    "sourceUrl",
    "clinicalOutcomeSummary",
    "contraindications",
    "interactionWarnings",
    "publicationStatus",
    "lastVerifiedDate",
  ];

  const lines = rows.map((row) =>
    [
      row.evidenceId,
      row.conditionId,
      row.medicalSystem,
      row.interventionName,
      row.isPharmacological,
      row.evidenceGrade,
      row.studyMethodology,
      row.sampleSize ?? "",
      row.registryIdentifier,
      row.sourceUrl,
      row.clinicalOutcomeSummary,
      row.contraindications.join(" | "),
      row.interactionWarnings.join(" | "),
      row.publicationStatus ?? "published",
      row.lastVerifiedDate ?? "",
    ]
      .map((value) => toCsvCell(value))
      .join(","),
  );

  return [headers.join(","), ...lines].join("\n");
}

export function registerEvidenceRoutes(app: Hono) {
  app.get("/auth/editor-status", requireAuthenticatedMutation, (c) => {
    return c.json({
      authenticated: true,
      actorEmail: getActorEmail(c),
      groups: getAuthGroups(c),
      isEditor: hasEditorRole(c),
    });
  });

  app.get("/conditions", async (c) => {
    const conditions = await listConditions();
    const valid = conditions.map((item) => medicalConditionSchema.parse(item));
    return c.json(valid);
  });

  app.post("/conditions", requireAuthenticatedMutation, requireEditorRole, async (c) => {
    const payload = await c.req.json();
    const parsed = medicalConditionSchema.safeParse(payload);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten() }, 400);
    }

    const saved = await saveCondition(parsed.data);
    await saveAuditLog({
      action: "condition.create",
      actorEmail: getActorEmail(c),
      targetEvidenceId: parsed.data.conditionId,
      ipAddress: c.req.header("x-forwarded-for"),
    });

    return c.json(saved, 201);
  });

  app.get("/evidence", async (c) => {
    const conditionId = c.req.query("conditionId");
    const draftsRequested = c.req.query("includeDrafts") === "true";
    if (draftsRequested) {
      const failure = await requireEditorAccess(c);
      if (failure) return failure;
    }
    const includeDrafts = draftsRequested;
    const query = c.req.query("q");
    const limit = normalizeLimit(c.req.query("limit"));
    const cursor = normalizeCursor(c.req.query("cursor"));

    const rows = await listEvidenceByCondition(conditionId, includeDrafts);
    const searched = filterEvidenceSearch(rows, query);
    const sorted = sortEvidenceRows(searched);
    const pageRows = sorted.slice(cursor, cursor + limit);
    const nextCursor = cursor + pageRows.length < sorted.length ? String(cursor + pageRows.length) : null;

    return c.json({
      metadata: {
        causalEquivalencyDisclaimer: true,
        message:
          "Evidence grades are not interchangeable across systems. Grade A and Grade B options for the same condition must not be treated as causally equivalent.",
        pagination: {
          limit,
          cursor,
          nextCursor,
          totalCount: sorted.length,
          returnedCount: pageRows.length,
        },
        query: {
          conditionId: conditionId ?? null,
          includeDrafts,
          q: query?.trim() || null,
        },
      },
      rows: pageRows,
    });
  });

  app.get("/evidence/export.csv", async (c) => {
    const conditionId = c.req.query("conditionId");
    const draftsRequested = c.req.query("includeDrafts") === "true";
    if (draftsRequested) {
      const failure = await requireEditorAccess(c);
      if (failure) return failure;
    }
    const includeDrafts = draftsRequested;
    const query = c.req.query("q");

    const rows = await listEvidenceByCondition(conditionId, includeDrafts);
    const searched = filterEvidenceSearch(rows, query);
    const sorted = sortEvidenceRows(searched);
    const csv = buildEvidenceCsv(sorted);

    c.header("content-type", "text/csv; charset=utf-8");
    c.header("content-disposition", "attachment; filename=salus-evidence-export.csv");
    return c.body(csv);
  });

  app.post("/evidence", requireAuthenticatedMutation, async (c) => {
    const payload = await c.req.json();
    const parsed = treatmentEvidenceSchema.safeParse(payload);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten() }, 400);
    }

    const condition = await getCondition(parsed.data.conditionId);
    if (!condition) {
      return c.json({ error: "conditionId must reference an existing condition" }, 400);
    }

    // Contributors may submit drafts only. Publication status is an editorial decision.
    const saved = await createEvidence({
      ...parsed.data,
      publicationStatus: "draft",
      lastVerifiedDate: parsed.data.lastVerifiedDate || new Date().toISOString().slice(0, 10),
    });
    if (!saved) {
      return c.json({ error: "An evidence record with this evidenceId already exists" }, 409);
    }

    await saveAuditLog({
      action: "evidence.create",
      actorEmail: getActorEmail(c),
      targetEvidenceId: saved.evidenceId,
      ipAddress: c.req.header("x-forwarded-for"),
    });

    return c.json(saved, 201);
  });

  app.patch("/evidence/:id/publish", requireAuthenticatedMutation, requireEditorRole, async (c) => {
    const evidenceId = c.req.param("id");
    if (!evidenceId) {
      return c.json({ error: "Evidence id is required" }, 400);
    }

    const payload = await c.req.json().catch(() => ({}));
    const publicationStatus = payload?.publicationStatus;

    if (!["draft", "published", "rejected"].includes(publicationStatus)) {
      return c.json({ error: "publicationStatus must be draft, published, or rejected" }, 400);
    }

    const updated = await updateEvidencePublicationStatus(evidenceId, publicationStatus);
    if (!updated) {
      return c.json({ error: "Evidence not found" }, 404);
    }

    await saveAuditLog({
      action: `evidence.${publicationStatus}`,
      actorEmail: getActorEmail(c),
      targetEvidenceId: evidenceId,
      ipAddress: c.req.header("x-forwarded-for"),
    });

    return c.json(updated);
  });
}
